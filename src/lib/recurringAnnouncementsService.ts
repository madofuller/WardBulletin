import { supabase } from './supabase';

export interface RecurringAnnouncement {
  id: string;
  profile_slug: string;
  title: string;
  content: string;
  audience: 'ward' | 'relief_society' | 'elders_quorum' | 'youth' | 'primary' | 'stake' | 'other' | string;
  custom_audience_label?: string; // Free-text label for standalone announcements
  is_active: boolean;
  sort_order?: number | null; // Position in the bulletin; null on rows created before the column existed
  created_at: string;
  updated_at: string;
  // Image support
  images?: Array<{ imageId: string; hideImageOnPrint?: boolean }>; // Multiple images support
}

export const recurringAnnouncementsService = {
  // Get all active recurring announcements for a profile
  async getRecurringAnnouncements(profileSlug: string): Promise<RecurringAnnouncement[]> {
    // Validate profileSlug - RLS policies will enforce security at database level
    if (!profileSlug || profileSlug.trim() === '') {
      console.error('Invalid profileSlug provided to getRecurringAnnouncements:', profileSlug);
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('recurring_announcements')
        .select('*')
        .eq('profile_slug', profileSlug)
        .eq('is_active', true)
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });

      if (error) {
        // Databases without the sort_order column yet: fall back to creation
        // order (oldest first, so new announcements land at the bottom).
        const { data: fallback, error: fallbackError } = await supabase
          .from('recurring_announcements')
          .select('*')
          .eq('profile_slug', profileSlug)
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (fallbackError) throw fallbackError;
        return fallback || [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching recurring announcements:', error);
      return [];
    }
  },

  // Create a new recurring announcement
  async createRecurringAnnouncement(announcement: Omit<RecurringAnnouncement, 'id' | 'created_at' | 'updated_at'>): Promise<RecurringAnnouncement | null> {
    try {
      console.log('Service: Creating recurring announcement:', announcement);

      // New announcements go to the END of the list (max sort_order + 1),
      // not the top. Skipped silently if the sort_order column doesn't exist.
      let nextSortOrder: number | undefined;
      const { data: maxRows, error: maxError } = await supabase
        .from('recurring_announcements')
        .select('sort_order')
        .eq('profile_slug', announcement.profile_slug)
        .order('sort_order', { ascending: false, nullsFirst: false })
        .limit(1);
      if (!maxError) {
        const max = maxRows?.[0]?.sort_order;
        nextSortOrder = typeof max === 'number' ? max + 1 : 0;
      }

      // Create a safe version with image and custom label support
      const safeAnnouncement = {
        profile_slug: announcement.profile_slug,
        title: announcement.title,
        content: announcement.content,
        audience: announcement.audience,
        is_active: announcement.is_active,
        ...(nextSortOrder !== undefined && { sort_order: nextSortOrder }),
        // Include custom audience label for standalone announcements
        ...(announcement.custom_audience_label && { custom_audience_label: announcement.custom_audience_label }),
        // Include image fields
        ...(announcement.images && { images: announcement.images })
      };
      
      const { data, error } = await supabase
        .from('recurring_announcements')
        .insert(safeAnnouncement)
        .select()
        .single();

      if (error) {
        console.error('Service: Supabase error:', error);
        
        // If it's a column not found error (images / sort_order not migrated
        // yet), retry with only the guaranteed base columns
        if (error.code === 'PGRST204') {
          console.log('Service: Retrying with base fields only...');
          const basicAnnouncement = {
            profile_slug: announcement.profile_slug,
            title: announcement.title,
            content: announcement.content,
            audience: announcement.audience,
            is_active: announcement.is_active,
            ...(announcement.custom_audience_label && { custom_audience_label: announcement.custom_audience_label })
          };
          
          const { data: retryData, error: retryError } = await supabase
            .from('recurring_announcements')
            .insert(basicAnnouncement)
            .select()
            .single();
            
          if (retryError) {
            console.error('Service: Retry also failed:', retryError);
            throw retryError;
          }
          
          console.log('Service: Created successfully (without images):', retryData);
          return retryData;
        }
        
        throw error;
      }
      
      console.log('Service: Created successfully:', data);
      return data;
    } catch (error) {
      console.error('Service: Error creating recurring announcement:', error);
      return null;
    }
  },

  // Update an existing recurring announcement
  async updateRecurringAnnouncement(id: string, updates: Partial<RecurringAnnouncement>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('recurring_announcements')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating recurring announcement:', error);
      return false;
    }
  },

  // Persist a full ordering: each announcement's position in orderedIds
  // becomes its sort_order. Returns false if the sort_order column is missing
  // (migration not applied) or any update fails.
  async updateSortOrder(profileSlug: string, orderedIds: string[]): Promise<boolean> {
    try {
      const results = await Promise.all(
        orderedIds.map((id, index) =>
          supabase
            .from('recurring_announcements')
            .update({ sort_order: index })
            .eq('id', id)
            .eq('profile_slug', profileSlug)
        )
      );

      const failed = results.find(r => r.error);
      if (failed?.error) throw failed.error;
      return true;
    } catch (error) {
      console.error('Error updating recurring announcement order:', error);
      return false;
    }
  },

  // Delete a recurring announcement (soft delete by setting is_active to false)
  async deleteRecurringAnnouncement(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('recurring_announcements')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting recurring announcement:', error);
      return false;
    }
  },

  // Convert a regular announcement to a recurring one
  async convertToRecurring(announcement: any, profileSlug: string): Promise<RecurringAnnouncement | null> {
    try {
      console.log('Converting announcement to recurring - input:', announcement);
      
      // Convert legacy imageId to images array format. Merge rather than
      // overwrite: an announcement can carry both the legacy single imageId
      // and the newer images array, and replacing the array dropped images.
      const images = [...(announcement.images || [])];
      if (
        announcement.imageId &&
        announcement.imageId !== 'none' &&
        !images.some((img: any) => img.imageId === announcement.imageId)
      ) {
        images.push({
          imageId: announcement.imageId,
          hideImageOnPrint: announcement.hideImageOnPrint || false
        });
      }

      console.log('Processed images for recurring announcement:', images);

      // Check if this is a standalone announcement
      const isStandalone = announcement.audience?.startsWith('standalone_');

      const recurringAnnouncement = {
        profile_slug: profileSlug,
        title: announcement.title,
        content: announcement.content,
        // For standalone, keep the standalone audience; otherwise use the audience or default to 'ward'
        audience: isStandalone ? 'standalone' : (announcement.audience || 'ward'),
        // Preserve custom label for standalone announcements
        custom_audience_label: isStandalone ? (announcement.customAudienceLabel || '') : undefined,
        is_active: true,
        // Convert to images array format
        images: images.length > 0 ? images : undefined
      };

      console.log('Creating recurring announcement with data:', recurringAnnouncement);

      return await this.createRecurringAnnouncement(recurringAnnouncement);
    } catch (error) {
      console.error('Error converting announcement to recurring:', error);
      return null;
    }
  },

  // Get recurring announcements that should be added to a new bulletin
  async getAnnouncementsForNewBulletin(profileSlug: string): Promise<Omit<RecurringAnnouncement, 'id' | 'profile_slug' | 'created_at' | 'updated_at'>[]> {
    try {
      const announcements = await this.getRecurringAnnouncements(profileSlug);
      console.log('Retrieved recurring announcements for new bulletin:', announcements);
      
      // Filter and transform for new bulletin, preserving images
      const result = announcements.map(announcement => ({
        title: announcement.title,
        content: announcement.content,
        audience: announcement.audience,
        // Standalone announcements need their section label to survive into
        // the bulletin, otherwise they print a raw "Standalone" header
        custom_audience_label: announcement.custom_audience_label,
        is_active: announcement.is_active,
        // Preserve image data in images array format
        images: announcement.images
      }));
      
      console.log('Transformed recurring announcements for new bulletin:', result);
      return result;
    } catch (error) {
      console.error('Error getting announcements for new bulletin:', error);
      return [];
    }
  }
}; 