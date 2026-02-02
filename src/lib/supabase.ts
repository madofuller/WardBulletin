import { createClient } from '@supabase/supabase-js'

// Environment variables are loaded securely

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate that required environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase configuration is required')
}

// Create Supabase client with better error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'zionboard-web'
    }
  }
})

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Test Supabase connection
export const testSupabaseConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // Try a simple health check query - just check if we can reach the API
    // Use a query that will work even with empty tables
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    // If we get an error, check if it's a network error or a permission error
    if (error) {
      // PGRST116 = no rows returned (fine for health check)
      // PGRST301 = permission denied (might be RLS, but API is reachable)
      // Other errors likely indicate connection issues
      if (error.code === 'PGRST116' || error.code === 'PGRST301') {
        // API is reachable, just no data or permission issue
        return { success: true };
      }
      
      // Check for network errors in the message
      const errorMessage = error.message || '';
      if (
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed') ||
        errorMessage.toLowerCase().includes('network') ||
        errorMessage.toLowerCase().includes('connection')
      ) {
        return { success: false, error: 'Unable to connect to the server. Please check your internet connection.' };
      }
      
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    const errorMessage = error.message || 'Connection test failed';
    
    // Check for network errors
    if (
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('NetworkError') ||
      errorMessage.includes('Network request failed') ||
      errorMessage.toLowerCase().includes('network') ||
      errorMessage.toLowerCase().includes('connection')
    ) {
      return { success: false, error: 'Unable to connect to the server. Please check your internet connection.' };
    }
    
    return { success: false, error: errorMessage };
  }
}

// Create profile sharing service instance
import { createProfileSharingService } from './profileSharingService'
export const profileSharingService = createProfileSharingService(supabase)
// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: string
          profile_slug: string | null
          active_bulletin_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: string
          profile_slug?: string | null
          active_bulletin_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          profile_slug?: string | null
          active_bulletin_id?: string | null
          created_at?: string
        }
      }
      bulletins: {
        Row: {
          id: string
          slug: string
          meeting_date: string
          meeting_type: string
          view_permission: string
          created_by: string | null
          expires_at: string | null
          status: 'draft' | 'scheduled' | 'active' | 'archived'
          scheduled_date: string | null
          auto_activate: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          meeting_date: string
          meeting_type: string
          view_permission?: string
          created_by?: string | null
          expires_at?: string | null
          status?: 'draft' | 'scheduled' | 'active' | 'archived'
          scheduled_date?: string | null
          auto_activate?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          meeting_date?: string
          meeting_type?: string
          view_permission?: string
          created_by?: string | null
          expires_at?: string | null
          status?: 'draft' | 'scheduled' | 'active' | 'archived'
          scheduled_date?: string | null
          auto_activate?: boolean
          created_at?: string
        }
      }
      tokens: {
        Row: {
          id: string
          key: string
          value: string
          visibility: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          visibility?: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          visibility?: string
          created_by?: string | null
          created_at?: string
        }
      }
      profile_shares: {
        Row: {
          id: string
          profile_slug: string
          owner_id: string
          shared_with_id: string
          role: 'owner' | 'editor' | 'viewer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_slug: string
          owner_id: string
          shared_with_id: string
          role?: 'owner' | 'editor' | 'viewer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_slug?: string
          owner_id?: string
          shared_with_id?: string
          role?: 'owner' | 'editor' | 'viewer'
          created_at?: string
          updated_at?: string
        }
      }
      profile_invitations: {
        Row: {
          id: string
          profile_slug: string
          owner_id: string
          invited_email: string
          role: 'editor' | 'viewer'
          token: string
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_slug: string
          owner_id: string
          invited_email: string
          role?: 'editor' | 'viewer'
          token: string
          expires_at: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_slug?: string
          owner_id?: string
          invited_email?: string
          role?: 'editor' | 'viewer'
          token?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Helper function to generate slug from user and date
function generateUniqueBulletinSlug(userId: string, date: string): string {
  const userSlug = userId.substring(0, 8); // Use first 8 chars of user ID
  const dateSlug = date.replace(/\//g, '-');
  const timestamp = Date.now();
  return `${userSlug}-${dateSlug}-${timestamp}`;
}

// Helper function to get user's profile_slug
async function getUserProfileSlug(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('profile_slug')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile_slug:', error);
      return null;
    }
    return data?.profile_slug || null;
  } catch (error) {
    console.error('Error in getUserProfileSlug:', error);
    return null;
  }
}

// Helper function to get user's organization_id
// NOTE: Organization system not yet implemented - returning null for now
// This function exists for future migration but currently returns null
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getUserOrganizationId(_userId: string): Promise<string | null> {
  // Organization system not implemented yet - return null
  // When organizations are implemented, this will query users.organization_id
  return null;
}

// Helper function to get all organizations the user is a member of
// NOTE: Organization system not yet implemented - returning empty array for now
// This function exists for future migration but currently returns []
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getUserOrganizations(_userId: string): Promise<string[]> {
  // Organization system not implemented yet - return empty array
  // When organizations are implemented, this will query organization_members table
  return [];
}

// Token service functions
export const tokenService = {
  async saveToken(userId: string, key: string, value: string) {
    let data, error;
    try {
      const { data, error } = await supabase
        .from('tokens')
        .upsert({
          key,
          value,
          created_by: userId
        }, {
          onConflict: 'key,created_by'
        })
        .select()
        .single();
    } catch (error) {
      console.error('Token save error:', error);
      throw error;
    }
    
    if (error) {
      console.error('Token save error:', error);
      throw error;
    }
    return data;
  },

  async getToken(_userId: string, key: string): Promise<string | null> {
    try {
      // NOTE: We don't filter by created_by here - RLS policies handle access control
      // This allows shared users to see tokens for bulletins they have access to
      // _userId parameter kept for backward compatibility but not used for filtering
      const { data, error } = await supabase
        .from('tokens')
        .select('value')
        .eq('key', key)
        .single();

      if (error) {
        // Log specific error types for debugging
        if (error.code === 'PGRST116') {
          // No rows returned - this is expected for missing tokens
          return null;
        }
        console.warn(`Token fetch error for key "${key}":`, error);
        return null;
      }
      return data?.value || null;
    } catch (err: any) {
      // Check for specific HTTP error codes
      if (err.message?.includes('406') || err.status === 406) {
        console.warn(`HTTP 406 error fetching token "${key}" - likely rate limited or RLS issue`);
      } else if (err.message?.includes('429') || err.status === 429) {
        console.warn(`Rate limit exceeded fetching token "${key}"`);
      } else {
        console.error('Unexpected token fetch error:', err);
      }
      return null;
    }
  },

  async getTokensBatch(_userId: string, keys: string[]): Promise<Record<string, string>> {
    try {
      // NOTE: We don't filter by created_by here - RLS policies handle access control
      // This allows shared users to see tokens for bulletins they have access to
      // _userId parameter kept for backward compatibility but not used for filtering
      const { data, error } = await withTimeout(
        supabase
          .from('tokens')
          .select('key, value')
          .in('key', keys),
        15000
      );

      if (error) {
        console.warn('Batch token fetch error:', error);
        return {};
      }

      const tokenMap: Record<string, string> = {};
      (data || []).forEach(token => {
        tokenMap[token.key] = token.value;
      });

      return tokenMap;
    } catch (err: any) {
      if (err.message?.includes('406') || err.status === 406) {
        console.warn('HTTP 406 error in batch token fetch - likely rate limited or RLS issue');
      } else if (err.message?.includes('429') || err.status === 429) {
        console.warn('Rate limit exceeded in batch token fetch');
      } else {
        console.error('Unexpected batch token fetch error:', err);
      }
      return {};
    }
  }
};

// User service functions
export const userService = {
  async checkProfileSlugAvailability(profileSlug: string, currentUserId?: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('profile_slug', profileSlug)
      .maybeSingle();
    
    if (error) throw error;
    
    // If no user found with this slug, it's available
    if (!data) return true;
    
    // If a user is found but it's the current user, it's available for them
    if (currentUserId && data.id === currentUserId) return true;
    
    // Otherwise, it's taken by another user
    return false;
  },

  async updateProfileSlug(userId: string, profileSlug: string) {
    const sanitized = profileSlug
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9_-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Validate profile slug format (alphanumeric, hyphens, underscores only)
    if (!/^[a-z0-9_-]+$/.test(sanitized)) {
      throw new Error('Profile slug can only contain letters, numbers, hyphens, and underscores');
    }

    // Check if the profile slug is available
    const isAvailable = await this.checkProfileSlugAvailability(sanitized, userId);
    if (!isAvailable) {
      // Check if it's owned by this user (shouldn't happen, but just in case)
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('profile_slug', sanitized)
        .maybeSingle();

      if (existingUser && existingUser.id === userId) {
        throw new Error('This is already your profile slug. No changes needed.');
      }

      throw new Error('This profile slug is already taken by another user. Please choose another.');
    }

    const { error } = await supabase
      .from('users')
      .update({ profile_slug: sanitized })
      .eq('id', userId);

    if (error) throw error;
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('email, profile_slug, role, active_bulletin_id') // Only select existing columns
      .eq('id', userId);
    if (error) throw error;
    return data;
  },

  async updateUserDefault(userId: string, field: 'default_ward_name' | 'default_presiding' | 'default_music_director' | 'default_organist' | 'default_conducting' | 'default_chorister', value: string) {
    const { error } = await supabase
      .from('users')
      .update({ [field]: value })
      .eq('id', userId);
    if (error) throw error;
  },

  async updateActiveBulletinId(userId: string, bulletinId: string | null) {
    const { error } = await supabase
      .from('users')
      .update({ active_bulletin_id: bulletinId })
      .eq('id', userId);
    
    if (error) throw error;
  }
};

// Timeout wrapper function to prevent hanging operations
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]);
};

// Bulletin service functions
export const bulletinService = {
  async saveBulletin(bulletinData: any, userId: string, bulletinId?: string, profileSlug?: string) {
    try {
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        throw refreshError;
      }
    } catch (refreshErr) {
      throw refreshErr;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      throw new Error('No valid Supabase session. Please sign in again.');
    }

    // Validate required date field - database requires meeting_date NOT NULL
    if (!bulletinData.date) {
      throw new Error('Bulletin date is required. Please select a date before saving.');
    }

    // Get user's profile_slug for bulletin association
    let effectiveProfileSlug = profileSlug;
    if (!effectiveProfileSlug) {
      effectiveProfileSlug = await getUserProfileSlug(userId);
    }

    let slug: string;
    
    // Generate slug from bulletin ID and date
    // Note: slug column doesn't exist in database - it's used for tokenization only
    slug = generateUniqueBulletinSlug(userId, bulletinData.date, bulletinId);

    const bulletinRecord = {
      id: bulletinId || `bulletin-${Date.now()}`,
      slug,
      profile_slug: effectiveProfileSlug || null,
      meeting_date: bulletinData.date || null,
      meeting_type: bulletinData.meetingType,
      created_by: userId,
      created_at: new Date().toISOString(),
      ward_name: bulletinData.wardName,
      theme: bulletinData.theme || '',
      userTheme: bulletinData.userTheme || '',
      bishopric_message: bulletinData.bishopricMessage || '',
      announcements: bulletinData.announcements || [],
      meetings: bulletinData.meetings || [],
      special_events: bulletinData.specialEvents || [],
      agenda: bulletinData.agenda || [],
      prayers: bulletinData.prayers || {},
      music_program: bulletinData.musicProgram || {},
      leadership: bulletinData.leadership || {},
      wardLeadership: bulletinData.wardLeadership || [],
      missionaries: bulletinData.missionaries || [],
      wardMissionaries: bulletinData.wardMissionaries || [],
      serviceMissionaries: bulletinData.serviceMissionaries || [],
      imageId: bulletinData.imageId || 'none',
      imagePosition: bulletinData.imagePosition || { x: 50, y: 50 },
      imageOpacity: bulletinData.imageOpacity ?? 40,
    };

    // Save tokens (batch upsert)
    try {
      const tokens = [
        { key: `bulletin-${slug}-ward_name`, value: bulletinData.wardName || '', created_by: userId },
        { key: `bulletin-${slug}-theme`, value: bulletinData.theme || '', created_by: userId },
        { key: `bulletin-${slug}-userTheme`, value: bulletinData.userTheme || '', created_by: userId },
        { key: `bulletin-${slug}-bishopric`, value: bulletinData.bishopricMessage || '', created_by: userId },
        { key: `bulletin-${slug}-announcements`, value: JSON.stringify(bulletinData.announcements || []), created_by: userId },
        { key: `bulletin-${slug}-meetings`, value: JSON.stringify(bulletinData.meetings || []), created_by: userId },
        { key: `bulletin-${slug}-events`, value: JSON.stringify(bulletinData.specialEvents || []), created_by: userId },
        { key: `bulletin-${slug}-agenda`, value: JSON.stringify(bulletinData.agenda || []), created_by: userId },
        { key: `bulletin-${slug}-prayers`, value: JSON.stringify(bulletinData.prayers || {}), created_by: userId },
        { key: `bulletin-${slug}-music`, value: JSON.stringify(bulletinData.musicProgram || {}), created_by: userId },
        { key: `bulletin-${slug}-leadership`, value: JSON.stringify(bulletinData.leadership || {}), created_by: userId },
        { key: `bulletin-${slug}-wardLeadership`, value: JSON.stringify(bulletinData.wardLeadership || []), created_by: userId },
        { key: `bulletin-${slug}-missionaries`, value: JSON.stringify(bulletinData.missionaries || []), created_by: userId },
        { key: `bulletin-${slug}-wardMissionaries`, value: JSON.stringify(bulletinData.wardMissionaries || []), created_by: userId },
        { key: `bulletin-${slug}-serviceMissionaries`, value: JSON.stringify(bulletinData.serviceMissionaries || []), created_by: userId },
        { key: `bulletin-${slug}-image`, value: bulletinData.imageId || 'none', created_by: userId },
        { key: `bulletin-${slug}-imagePosition`, value: JSON.stringify(bulletinData.imagePosition || { x: 50, y: 50 }), created_by: userId },
        { key: `bulletin-${slug}-imageOpacity`, value: String(bulletinData.imageOpacity ?? 40), created_by: userId },
      ];
      let data, error;
      try {
        ({ data, error } = await withTimeout(
          supabase
            .from('tokens')
            .upsert(tokens, { onConflict: 'key,created_by' }),
          20000
        ));
      } catch (timeoutError) {
        throw timeoutError;
      }
      if (error) {
        throw error;
      }
    } catch (tokenError) {
    }

    // Don't update status to 'active' via saveBulletin - that should be done via updateBulletinStatus
    // Only allow saving draft, scheduled, or archived status
    const statusToSave = bulletinData.status === 'active' ? 'draft' : (bulletinData.status || 'draft');
    
    const dbBulletinRecord = {
      slug,
      meeting_date: bulletinData.date || null,
      meeting_type: bulletinData.meetingType,
      created_by: userId,
      status: statusToSave,
      scheduled_date: bulletinData.scheduledDate || null,
      auto_activate: bulletinData.autoActivate || false,
      profile_slug: effectiveProfileSlug || null
    };

    try {
      if (bulletinId) {
        // First, verify the bulletin exists to prevent accidental duplicates
        const { data: existingBulletin, error: checkError } = await supabase
          .from('bulletins')
          .select('id')
          .eq('id', bulletinId)
          .maybeSingle();

        if (checkError) {
          throw checkError;
        }

        if (!existingBulletin) {
          throw new Error('Bulletin not found. Cannot update non-existent bulletin.');
        }

        let data, error;
        try {
          // Don't filter by created_by - let RLS handle permissions
          // This allows shared profile editors to update bulletins they didn't create
          ({ data, error } = await withTimeout(
            supabase
              .from('bulletins')
              .update(dbBulletinRecord)
              .eq('id', bulletinId)
              .select('id, slug, meeting_date, meeting_type, created_by, profile_slug, created_at, status, scheduled_date, auto_activate')
              .single(),
            20000
          ));
        } catch (timeoutError) {
          throw timeoutError;
        }
        if (error) {
          // If update failed, check if it's a permission issue
          if (error.code === 'PGRST301' || error.message?.includes('permission') || error.message?.includes('row-level security')) {
            throw new Error('You do not have permission to edit this bulletin. Please check your profile access.');
          }
          // Handle 400 Bad Request errors
          if (error.code === 'PGRST116' || error.status === 400 || error.message?.includes('400')) {
            throw new Error(`Failed to save bulletin: ${error.message || 'Invalid request. Please check your data and try again.'}`);
          }
          throw error;
        }
        this.saveToLocalStorage({ ...bulletinRecord, id: data.id });
        return data;
      } else {
        let data, error;
        try {
          ({ data, error } = await withTimeout(
            supabase
              .from('bulletins')
              .insert(dbBulletinRecord)
              .select('id, slug, meeting_date, meeting_type, created_by, profile_slug, created_at, status, scheduled_date, auto_activate')
              .single(),
            20000
          ));
        } catch (timeoutError) {
          throw timeoutError;
        }
        if (error) {
          // Handle 400 Bad Request errors
          if (error.code === 'PGRST116' || error.status === 400 || error.message?.includes('400')) {
            throw new Error(`Failed to create bulletin: ${error.message || 'Invalid request. Please check your data and try again.'}`);
          }
          throw error;
        }
        this.saveToLocalStorage({ ...bulletinRecord, id: data.id });
        return data;
      }
    } catch (bulletinError) {
      throw bulletinError;
    }
  },

  saveToLocalStorage(bulletin: any) {
    try {
      const existingBulletins = this.getFromLocalStorage();
      const updatedBulletins = existingBulletins.filter(b => b.id !== bulletin.id);
      updatedBulletins.push(bulletin);
      localStorage.setItem('mywardbulletin_bulletins', JSON.stringify(updatedBulletins));
    } catch (error) {
      console.warn('Failed to save to local storage:', error);
    }
  },

  getFromLocalStorage(): any[] {
    try {
      const stored = localStorage.getItem('mywardbulletin_bulletins');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to read from local storage:', error);
      return [];
    }
  },
  async getBulletinsByProfileSlug(profileSlug: string) {
    try {
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        throw refreshError;
      }
    } catch (refreshErr) {
      throw refreshErr;
    }

    try {
      // Get current user to also include their bulletins without profile_slug
      const { data: sessionData } = await supabase.auth.getSession();
      let userId = sessionData?.session?.user?.id;

      let data, error;
      
      if (userId) {
        // Include bulletins with matching profile_slug OR created by user (to catch bulletins without profile_slug)
        // Use two separate queries and combine results to handle null profile_slug properly
        const [profileBulletins, userBulletins] = await Promise.all([
          // Get bulletins with matching profile_slug
          supabase
            .from('bulletins')
            .select('*')
            .eq('profile_slug', profileSlug)
            .order('created_at', { ascending: false }),
          // Get user's bulletins without profile_slug
          supabase
            .from('bulletins')
            .select('*')
            .eq('created_by', userId)
            .is('profile_slug', null)
            .order('created_at', { ascending: false })
        ]);
        
        // Combine results, removing duplicates
        const combinedData = [...(profileBulletins.data || [])];
        const profileIds = new Set(combinedData.map(b => b.id));
        (userBulletins.data || []).forEach(b => {
          if (!profileIds.has(b.id)) {
            combinedData.push(b);
          }
        });
        
        data = combinedData;
        error = profileBulletins.error || userBulletins.error;
      } else {
        // Fallback: just get bulletins with matching profile_slug
        ({ data, error } = await withTimeout(
          supabase
            .from('bulletins')
            .select('*')
            .eq('profile_slug', profileSlug)
            .order('created_at', { ascending: false }),
          10000
        ));
      }

      if (error) {
        console.error('Error fetching bulletins by profile slug:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Fetch tokens for all bulletins (same logic as getUserBulletins)
      const allTokenKeys: string[] = [];
      data.forEach(bulletin => {
        allTokenKeys.push(
          `bulletin-${bulletin.slug}-ward_name`,
          `bulletin-${bulletin.slug}-theme`,
          `bulletin-${bulletin.slug}-userTheme`,
          `bulletin-${bulletin.slug}-bishopric`,
          `bulletin-${bulletin.slug}-announcements`,
          `bulletin-${bulletin.slug}-meetings`,
          `bulletin-${bulletin.slug}-events`,
          `bulletin-${bulletin.slug}-agenda`,
          `bulletin-${bulletin.slug}-prayers`,
          `bulletin-${bulletin.slug}-music`,
          `bulletin-${bulletin.slug}-leadership`,
          `bulletin-${bulletin.slug}-wardLeadership`,
          `bulletin-${bulletin.slug}-missionaries`,
          `bulletin-${bulletin.slug}-wardMissionaries`,
          `bulletin-${bulletin.slug}-serviceMissionaries`,
          `bulletin-${bulletin.slug}-image`,
          `bulletin-${bulletin.slug}-imagePosition`,
          `bulletin-${bulletin.slug}-imageOpacity`
        );
      });

      // Get current user ID for token fetching (reuse userId from above if available)
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id || '';
      }

      // Fetch tokens in chunks (same logic as getUserBulletins)
      const CHUNK_SIZE = 50;
      const tokenChunks: string[][] = [];
      for (let i = 0; i < allTokenKeys.length; i += CHUNK_SIZE) {
        tokenChunks.push(allTokenKeys.slice(i, i + CHUNK_SIZE));
      }

      const tokenMap = new Map<string, string>();
      
      for (const chunk of tokenChunks) {
        try {
          // Query tokens - RLS will filter to show tokens user has access to
          const { data: chunkTokens, error: chunkError } = await withTimeout(
            supabase
              .from('tokens')
              .select('key, value')
              .in('key', chunk),
            10000
          );

          if (chunkError) {
            console.warn(`Error fetching tokens for chunk (${chunk.length} keys):`, chunkError);
            // Fallback: try with created_by filter
            const { data: fallbackTokens, error: fallbackError } = await withTimeout(
              supabase
                .from('tokens')
                .select('key, value')
                .eq('created_by', userId)
                .in('key', chunk),
              10000
            );
            if (!fallbackError && fallbackTokens) {
              fallbackTokens.forEach(token => {
                tokenMap.set(token.key, token.value);
              });
            }
            continue;
          }

          if (chunkTokens && chunkTokens.length > 0) {
            chunkTokens.forEach(token => {
              tokenMap.set(token.key, token.value);
            });
          }
        } catch (chunkErr) {
          console.warn('Error fetching token chunk:', chunkErr);
          continue;
        }
      }


      // Build bulletins with token data (same logic as getUserBulletins)
      const bulletinsWithData = data.map(bulletin => {
        const getToken = (suffix: string) => tokenMap.get(`bulletin-${bulletin.slug}-${suffix}`) || null;

        const safeJsonParse = (value: string | null, fallback: any) => {
          if (!value) return fallback;
          try {
            return JSON.parse(value);
          } catch {
            return fallback;
          }
        };

        return {
          id: bulletin.id,
          user_id: bulletin.created_by,
          ward_name: getToken('ward_name') || '',
          date: bulletin.meeting_date,
          meeting_type: bulletin.meeting_type,
          theme: getToken('theme') || '',
          userTheme: getToken('userTheme') || '',
          bishopric_message: getToken('bishopric') || '',
          announcements: safeJsonParse(getToken('announcements'), []),
          meetings: safeJsonParse(getToken('meetings'), []),
          special_events: safeJsonParse(getToken('events'), []),
          agenda: safeJsonParse(getToken('agenda'), []),
          prayers: safeJsonParse(getToken('prayers'), {}),
          music_program: safeJsonParse(getToken('music'), {}),
          leadership: safeJsonParse(getToken('leadership'), {}),
          wardLeadership: safeJsonParse(getToken('wardLeadership'), []),
          missionaries: safeJsonParse(getToken('missionaries'), []),
          wardMissionaries: safeJsonParse(getToken('wardMissionaries'), []),
          serviceMissionaries: safeJsonParse(getToken('serviceMissionaries'), []),
          imageId: getToken('image') || 'none',
          imagePosition: safeJsonParse(getToken('imagePosition'), { x: 50, y: 50 }),
          imageOpacity: parseInt(getToken('imageOpacity') || '40', 10),
          created_at: bulletin.created_at,
          updated_at: bulletin.created_at,
          status: bulletin.status || 'draft',
          scheduled_date: bulletin.scheduled_date,
          profile_slug: bulletin.profile_slug
        };
      });

      return bulletinsWithData;
    } catch (timeoutError) {
      console.warn('getBulletinsByProfileSlug timed out, returning empty array');
      return [];
    }
  },

  async getUserBulletins(userId: string) {
    // Always try to get bulletins from local storage first
    const localBulletins = this.getFromLocalStorage().filter(b => b.created_by === userId);

    try {
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        throw refreshError;
      }
    } catch (refreshErr) {
      throw refreshErr;
    }

    try {
      // Get user's profile_slug
      const userProfileSlug = await getUserProfileSlug(userId);
      
      // Get all profile_slugs the user has access to via profile_shares
      const { data: sharedProfiles } = await supabase
        .from('profile_shares')
        .select('profile_slug')
        .eq('shared_with_id', userId);
      
      // Build list of accessible profile slugs
      const accessibleProfileSlugs: string[] = [];
      if (userProfileSlug) {
        accessibleProfileSlugs.push(userProfileSlug);
      }
      if (sharedProfiles) {
        sharedProfiles.forEach(share => {
          if (share.profile_slug && !accessibleProfileSlugs.includes(share.profile_slug)) {
            accessibleProfileSlugs.push(share.profile_slug);
          }
        });
      }

      let data, error;

      if (accessibleProfileSlugs.length > 0) {
        // User has profile_slug or shared profiles - get bulletins for all accessible profiles
        // Query bulletins: either created by user OR with accessible profile_slug
        const profileSlugFilter = accessibleProfileSlugs.map(slug => `profile_slug.eq.${slug}`).join(',');
        ({ data, error } = await withTimeout(
          supabase
            .from('bulletins')
            .select('*')
            .or(`created_by.eq.${userId},${profileSlugFilter}`)
            .order('created_at', { ascending: false }),
          20000
        ));
      } else {
        // No profile_slug or shares - just get bulletins they created
        ({ data, error } = await withTimeout(
          supabase
            .from('bulletins')
            .select('*')
            .eq('created_by', userId)
            .order('created_at', { ascending: false }),
          20000
        ));
      }

      if (error) {
        if (error.message.includes('infinite recursion')) {
          // Return empty array if RLS recursion occurs
          console.warn('Skipping bulletin retrieval due to RLS recursion');
          return [];
        }
        throw error;
      }

      if (!data || data.length === 0) {
        // If no database bulletins, just return local bulletins
        return localBulletins;
      }

      // Batch fetch all tokens for all bulletins with chunking to avoid URL length limits
      try {
        const allTokenKeys: string[] = [];
        const bulletinSlugMap = new Map();

        // Build list of all token keys we need and map bulletins by slug
        data.forEach(bulletin => {
          bulletinSlugMap.set(bulletin.slug, bulletin);
          const tokenKeys = [
            `bulletin-${bulletin.slug}-ward_name`,
            `bulletin-${bulletin.slug}-theme`,
            `bulletin-${bulletin.slug}-userTheme`,
            `bulletin-${bulletin.slug}-bishopric`,
            `bulletin-${bulletin.slug}-announcements`,
            `bulletin-${bulletin.slug}-meetings`,
            `bulletin-${bulletin.slug}-events`,
            `bulletin-${bulletin.slug}-agenda`,
            `bulletin-${bulletin.slug}-prayers`,
            `bulletin-${bulletin.slug}-music`,
            `bulletin-${bulletin.slug}-leadership`,
            `bulletin-${bulletin.slug}-wardLeadership`,
            `bulletin-${bulletin.slug}-missionaries`,
            `bulletin-${bulletin.slug}-wardMissionaries`,
            `bulletin-${bulletin.slug}-serviceMissionaries`,
            `bulletin-${bulletin.slug}-image`,
            `bulletin-${bulletin.slug}-imagePosition`,
            `bulletin-${bulletin.slug}-imageOpacity`
          ];
          allTokenKeys.push(...tokenKeys);
        });

        // Chunk token keys to avoid URL length limits (max ~50 tokens per request)
        const CHUNK_SIZE = 50;
        const tokenChunks: string[][] = [];
        for (let i = 0; i < allTokenKeys.length; i += CHUNK_SIZE) {
          tokenChunks.push(allTokenKeys.slice(i, i + CHUNK_SIZE));
        }

        // Fetch tokens in chunks
        // RLS policy allows: auth.uid() = created_by OR tokens for shared profiles
        // We query without created_by filter and let RLS handle access control
        const allTokens: any[] = [];
        const tokenMap = new Map<string, string>();
        
        for (const chunk of tokenChunks) {
          try {
            // Query tokens - RLS will filter to show:
            // 1. Tokens created by the current user (auth.uid() = created_by)
            // 2. Tokens for bulletins from shared profiles
            const { data: chunkTokens, error: chunkError } = await withTimeout(
              supabase
                .from('tokens')
                .select('key, value')
                .in('key', chunk),
              10000
            );

            if (chunkError) {
              console.warn(`Error fetching tokens for chunk (${chunk.length} keys):`, chunkError);
              // If RLS query fails, try fallback with created_by filter for owners
              const { data: fallbackTokens, error: fallbackError } = await withTimeout(
                supabase
                  .from('tokens')
                  .select('key, value')
                  .eq('created_by', userId)
                  .in('key', chunk),
                10000
              );
              if (!fallbackError && fallbackTokens) {
                fallbackTokens.forEach(token => {
                  tokenMap.set(token.key, token.value);
                });
              }
              continue;
            }

            if (chunkTokens && chunkTokens.length > 0) {
              chunkTokens.forEach(token => {
                tokenMap.set(token.key, token.value);
              });
            }
          } catch (chunkErr) {
            continue; // Skip this chunk and try the next one
          }
        }
        
        // Convert map to array (for compatibility, though we use the map directly)
        allTokens.push(...Array.from(tokenMap.entries()).map(([key, value]) => ({ key, value })));

        // Build bulletins with token data
        const bulletinsWithData = data.map(bulletin => {
          const getToken = (suffix: string) => tokenMap.get(`bulletin-${bulletin.slug}-${suffix}`) || null;

          const safeJsonParse = (value: string | null, fallback: any) => {
            if (!value) return fallback;
            try {
              return JSON.parse(value);
            } catch {
              return fallback;
            }
          };

          return {
            id: bulletin.id,
            user_id: bulletin.created_by,
            ward_name: getToken('ward_name') || '',
            date: bulletin.meeting_date,
            meeting_type: bulletin.meeting_type,
            theme: getToken('theme') || '',
            userTheme: getToken('userTheme') || '',
            bishopric_message: getToken('bishopric') || '',
            announcements: safeJsonParse(getToken('announcements'), []),
            meetings: safeJsonParse(getToken('meetings'), []),
            special_events: safeJsonParse(getToken('events'), []),
            agenda: safeJsonParse(getToken('agenda'), []),
            prayers: safeJsonParse(getToken('prayers'), {}),
            music_program: safeJsonParse(getToken('music'), {}),
            leadership: safeJsonParse(getToken('leadership'), {}),
            wardLeadership: safeJsonParse(getToken('wardLeadership'), []),
            missionaries: safeJsonParse(getToken('missionaries'), []),
            wardMissionaries: safeJsonParse(getToken('wardMissionaries'), []),
            serviceMissionaries: safeJsonParse(getToken('serviceMissionaries'), []),
            imageId: getToken('image') || 'none',
            imagePosition: safeJsonParse(getToken('imagePosition'), { x: 50, y: 50 }),
            imageOpacity: parseInt(getToken('imageOpacity') || '40', 10),
            created_at: bulletin.created_at,
            updated_at: bulletin.created_at,
            status: bulletin.status || 'draft',
            scheduled_date: bulletin.scheduled_date,
            profile_slug: bulletin.profile_slug
          };
        });

        // Merge database bulletins with local storage bulletins (prefer database)
        const dbBulletinIds = new Set(bulletinsWithData.map(b => b.id));
        const uniqueLocalBulletins = localBulletins.filter(b => !dbBulletinIds.has(b.id));

        return [...bulletinsWithData, ...uniqueLocalBulletins];

      } catch (tokenError: any) {
        console.warn('Token processing failed, falling back to basic bulletin data:', tokenError);
        // Return bulletins with basic data only
        const basicBulletins = data.map(bulletin => ({
          id: bulletin.id,
          user_id: bulletin.created_by,
          ward_name: '',
          date: bulletin.meeting_date,
          meeting_type: bulletin.meeting_type,
          theme: '',
          userTheme: '',
          bishopric_message: '',
          announcements: [],
          meetings: [],
          special_events: [],
          agenda: [],
          prayers: {},
          music_program: {},
          leadership: {},
          wardLeadership: [],
          missionaries: [],
          wardMissionaries: [],
          serviceMissionaries: [],
          imageId: 'none',
          imagePosition: { x: 50, y: 50 },
          created_at: bulletin.created_at,
          updated_at: bulletin.created_at,
          status: bulletin.status || 'draft',
          scheduled_date: bulletin.scheduled_date,
          profile_slug: bulletin.profile_slug
        }));

        const dbBulletinIds = new Set(basicBulletins.map(b => b.id));
        const uniqueLocalBulletins = localBulletins.filter(b => !dbBulletinIds.has(b.id));

        return [...basicBulletins, ...uniqueLocalBulletins];
      }

    } catch (error: any) {
      if (error.message === 'Operation timed out') {
        console.warn('getUserBulletins timed out, returning local bulletins');
        return localBulletins;
      }
      return localBulletins;
    }
  },

  async getBulletinById(bulletinId: string) {
    // Try local storage first
    const localBulletins = this.getFromLocalStorage();
    const localBulletin = localBulletins.find(b => b.id === bulletinId);
    if (localBulletin) {
      return localBulletin;
    }
    
    // Select only columns that exist and are accessible via RLS
    // Avoid select=* which can cause 406 errors if RLS blocks certain columns
    const { data, error } = await supabase
      .from('bulletins')
      .select('id, slug, meeting_date, meeting_type, view_permission, created_by, profile_slug, expires_at, created_at, status, scheduled_date, auto_activate')
      .eq('id', bulletinId)
      .single();
    
    if (error) {
      // If 406 error, it's likely due to RLS blocking select=* or a column access issue
      // The error might also indicate the user doesn't have access to this bulletin
      if (error.code === '406' || error.status === 406) {
        // Try with minimal columns that should always be accessible
        const { data: minimalData, error: minimalError } = await supabase
          .from('bulletins')
          .select('id, slug, meeting_date, meeting_type, created_by, profile_slug, created_at, status')
          .eq('id', bulletinId)
          .single();
        
        if (minimalError) {
          // If still failing, user likely doesn't have access via RLS
          throw new Error(`Cannot access bulletin: ${minimalError.message || 'Access denied'}`);
        }
        
        // Use minimal data and continue with token fetching
        const userId = minimalData.created_by;
        
        // Fetch bulletin data from tokens
        const tokenPromises = [
          tokenService.getToken(userId, `bulletin-${minimalData.slug}-ward_name`),
          tokenService.getToken(userId, `bulletin-${minimalData.slug}-theme`),
          tokenService.getToken(userId, `bulletin-${minimalData.slug}-userTheme`),
          tokenService.getToken(userId, `bulletin-${minimalData.slug}-bishopric`),
          tokenService.getToken(userId, `bulletin-${minimalData.slug}-announcements`),
          tokenService.getToken(userId, `bulletin-${minimalData.slug}-meetings`),
          tokenService.getToken(userId, `bulletin-${minimalData.slug}-events`),
          tokenService.getToken(userId, `bulletin-${minimalData.slug}-agenda`),
          tokenService.getToken(userId, `bulletin-${minimalData.slug}-prayers`),
          tokenService.getToken(userId, `bulletin-${minimalData.slug}-music`),
          tokenService.getToken(userId, `bulletin-${minimalData.slug}-leadership`),
          tokenService.getToken(userId, `bulletin-${minimalData.slug}-wardLeadership`),
          tokenService.getToken(userId, `bulletin-${minimalData.slug}-missionaries`),
          tokenService.getToken(userId, `bulletin-${minimalData.slug}-wardMissionaries`),
          tokenService.getToken(userId, `bulletin-${minimalData.slug}-serviceMissionaries`),
        ];
        
        tokenPromises.push(tokenService.getToken(userId, `bulletin-${minimalData.slug}-image`));
        tokenPromises.push(tokenService.getToken(userId, `bulletin-${minimalData.slug}-imagePosition`));
        
        const tokenResults = await Promise.all(tokenPromises);
        const [wardName, theme, userTheme, bishopric, announcements, meetings, events, agenda, prayers, music, leadership, wardLeadership, missionaries, wardMissionaries, serviceMissionaries] = tokenResults.slice(0, 15);
        const image = tokenResults[15];
        const imagePosition = tokenResults[16];

        return {
          id: minimalData.id,
          user_id: minimalData.created_by,
          profile_slug: minimalData.profile_slug,
          ward_name: wardName || '',
          date: minimalData.meeting_date,
          meeting_type: minimalData.meeting_type,
          theme: theme || '',
          userTheme: userTheme || '',
          bishopric_message: bishopric || '',
          announcements: announcements ? JSON.parse(announcements) : [],
          meetings: meetings ? JSON.parse(meetings) : [],
          special_events: events ? JSON.parse(events) : [],
          agenda: agenda ? JSON.parse(agenda) : [],
          prayers: prayers ? JSON.parse(prayers) : {},
          music_program: music ? JSON.parse(music) : {},
          leadership: leadership ? JSON.parse(leadership) : {},
          wardLeadership: wardLeadership ? JSON.parse(wardLeadership) : [],
          missionaries: missionaries ? JSON.parse(missionaries) : [],
          wardMissionaries: wardMissionaries ? JSON.parse(wardMissionaries) : [],
          imageId: image || 'none',
          imagePosition: imagePosition ? JSON.parse(imagePosition) : { x: 50, y: 50 },
          created_at: minimalData.created_at,
          updated_at: minimalData.created_at
        };
      }
      throw error;
    }
    
    // Get user ID to fetch tokens
    const userId = data.created_by;
    
    // Fetch bulletin data from tokens
    const tokenPromises = [
      tokenService.getToken(userId, `bulletin-${data.slug}-ward_name`),
      tokenService.getToken(userId, `bulletin-${data.slug}-theme`),
      tokenService.getToken(userId, `bulletin-${data.slug}-userTheme`),
      tokenService.getToken(userId, `bulletin-${data.slug}-bishopric`),
      tokenService.getToken(userId, `bulletin-${data.slug}-announcements`),
      tokenService.getToken(userId, `bulletin-${data.slug}-meetings`),
      tokenService.getToken(userId, `bulletin-${data.slug}-events`),
      tokenService.getToken(userId, `bulletin-${data.slug}-agenda`),
      tokenService.getToken(userId, `bulletin-${data.slug}-prayers`),
      tokenService.getToken(userId, `bulletin-${data.slug}-music`),
      tokenService.getToken(userId, `bulletin-${data.slug}-leadership`),
      tokenService.getToken(userId, `bulletin-${data.slug}-wardLeadership`),
      tokenService.getToken(userId, `bulletin-${data.slug}-missionaries`),
      tokenService.getToken(userId, `bulletin-${data.slug}-wardMissionaries`),
      tokenService.getToken(userId, `bulletin-${data.slug}-serviceMissionaries`),
    ];
    
    // Always fetch image tokens since they're not in database record
    tokenPromises.push(tokenService.getToken(userId, `bulletin-${data.slug}-image`));
    tokenPromises.push(tokenService.getToken(userId, `bulletin-${data.slug}-imagePosition`));
    
    const tokenResults = await Promise.all(tokenPromises);
    const [wardName, theme, userTheme, bishopric, announcements, meetings, events, agenda, prayers, music, leadership, wardLeadership, missionaries, wardMissionaries, serviceMissionaries] = tokenResults.slice(0, 15);
    
    // Handle image tokens (always fetched)
    const image = tokenResults[15];
    const imagePosition = tokenResults[16];

    return {
      id: data.id,
      user_id: data.created_by,
      profile_slug: data.profile_slug,
      ward_name: wardName || '',
      date: data.meeting_date,
      meeting_type: data.meeting_type,
      theme: theme || '',
      userTheme: userTheme || '',
      bishopric_message: bishopric || '',
      announcements: announcements ? JSON.parse(announcements) : [],
      meetings: meetings ? JSON.parse(meetings) : [],
      special_events: events ? JSON.parse(events) : [],
      agenda: agenda ? JSON.parse(agenda) : [],
      prayers: prayers ? JSON.parse(prayers) : {},
      music_program: music ? JSON.parse(music) : {},
      leadership: leadership ? JSON.parse(leadership) : {},
      wardLeadership: wardLeadership ? JSON.parse(wardLeadership) : [],
      missionaries: missionaries ? JSON.parse(missionaries) : [],
      wardMissionaries: wardMissionaries ? JSON.parse(wardMissionaries) : [],
      serviceMissionaries: serviceMissionaries ? JSON.parse(serviceMissionaries) : [],
      imageId: image || 'none',
      imagePosition: imagePosition ? JSON.parse(imagePosition) : { x: 50, y: 50 },
      created_at: data.created_at,
      updated_at: data.created_at
    };
  },

  async getLatestBulletinByProfileSlug(profileSlug: string) {
    // CRITICAL: Safari caches Supabase requests aggressively even with cache-control headers
    // Solution: Add a cache-busting timestamp to make Safari think it's a new request
    // This is added as a comment filter that doesn't affect the query but changes the URL
    const cacheBuster = Date.now().toString();

    // First get the user by profile_slug and their active bulletin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, active_bulletin_id')
      .eq('profile_slug', profileSlug)
      .maybeSingle(); // Use maybeSingle to handle not found case properly

    if (userError || !userData) {
      throw new Error('Bulletin not found');
    }

    let bulletinId = userData.active_bulletin_id;

    // If no active bulletin is set, get their latest bulletin
    if (!bulletinId) {
      const { data: latestBulletin, error: latestError } = await supabase
        .from('bulletins')
        .select('id')
        .eq('created_by', userData.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestError) throw latestError;
      if (!latestBulletin) return null; // No bulletins found

      bulletinId = latestBulletin.id;
    }

    // Get the specific bulletin
    const { data, error } = await supabase
      .from('bulletins')
      .select('*')
      .eq('id', bulletinId)
      .single();

    if (error) {
      // If bulletin not found, return null instead of throwing
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    // Get user ID to fetch tokens
    const userId = userData.id;

    // Fetch bulletin data from tokens - Use batch fetch to avoid caching issues
    // Build the list of token keys we need
    const tokenKeys = [
      `bulletin-${data.slug}-ward_name`,
      `bulletin-${data.slug}-theme`,
      `bulletin-${data.slug}-userTheme`,
      `bulletin-${data.slug}-bishopric`,
      `bulletin-${data.slug}-announcements`,
      `bulletin-${data.slug}-meetings`,
      `bulletin-${data.slug}-events`,
      `bulletin-${data.slug}-agenda`,
      `bulletin-${data.slug}-prayers`,
      `bulletin-${data.slug}-music`,
      `bulletin-${data.slug}-leadership`,
      `bulletin-${data.slug}-wardLeadership`,
      `bulletin-${data.slug}-missionaries`,
      `bulletin-${data.slug}-wardMissionaries`,
      `bulletin-${data.slug}-serviceMissionaries`,
      `bulletin-${data.slug}-image`,
      `bulletin-${data.slug}-imagePosition`,
      `bulletin-${data.slug}-imageOpacity`
    ];

    // Fetch all tokens in a single query
    const { data: tokenData, error: tokenError } = await supabase
      .from('tokens')
      .select('key, value')
      .eq('created_by', userId)
      .in('key', tokenKeys);

    // Create a map for quick lookup
    const tokenMap = new Map();
    (tokenData || []).forEach((token: any) => {
      tokenMap.set(token.key, token.value);
    });

    // Extract values from the map
    const wardName = tokenMap.get(`bulletin-${data.slug}-ward_name`) || null;
    const theme = tokenMap.get(`bulletin-${data.slug}-theme`) || null;
    const userTheme = tokenMap.get(`bulletin-${data.slug}-userTheme`) || null;
    const bishopric = tokenMap.get(`bulletin-${data.slug}-bishopric`) || null;
    const announcements = tokenMap.get(`bulletin-${data.slug}-announcements`) || null;
    const meetings = tokenMap.get(`bulletin-${data.slug}-meetings`) || null;
    const events = tokenMap.get(`bulletin-${data.slug}-events`) || null;
    const agenda = tokenMap.get(`bulletin-${data.slug}-agenda`) || null;
    const prayers = tokenMap.get(`bulletin-${data.slug}-prayers`) || null;
    const music = tokenMap.get(`bulletin-${data.slug}-music`) || null;
    const leadership = tokenMap.get(`bulletin-${data.slug}-leadership`) || null;
    const wardLeadership = tokenMap.get(`bulletin-${data.slug}-wardLeadership`) || null;
    const missionaries = tokenMap.get(`bulletin-${data.slug}-missionaries`) || null;
    const wardMissionaries = tokenMap.get(`bulletin-${data.slug}-wardMissionaries`) || null;
    const serviceMissionaries = tokenMap.get(`bulletin-${data.slug}-serviceMissionaries`) || null;
    const image = tokenMap.get(`bulletin-${data.slug}-image`) || null;
    const imagePosition = tokenMap.get(`bulletin-${data.slug}-imagePosition`) || null;
    const imageOpacity = tokenMap.get(`bulletin-${data.slug}-imageOpacity`) || null;

    const parsedAnnouncements = announcements ? JSON.parse(announcements) : [];

    // If the imageId is a custom image, fetch its URL from storage
    let imageUrl = null;
    if (image && image.startsWith('custom-')) {
      try {
        const filePath = `${userId}/${image}.jpg`;
        const { data: urlData } = supabase.storage
          .from('bulletin-images')
          .getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      } catch {
        // Silently handle custom image fetch errors
      }
    }
    const result = {
      id: data.id,
      user_id: data.created_by,
      profile_slug: data.profile_slug,
      ward_name: wardName || '',
      date: data.meeting_date,
      meeting_type: data.meeting_type,
      theme: theme || '',
      userTheme: userTheme || '',
      imageId: image || 'none',
      imageUrl: imageUrl, // Include the actual URL for custom images
      imagePosition: imagePosition ? JSON.parse(imagePosition) : { x: 50, y: 50 },
      imageOpacity: imageOpacity ? parseInt(imageOpacity) : 40,
      bishopric_message: bishopric || '',
      announcements: parsedAnnouncements,
      meetings: meetings ? JSON.parse(meetings) : [],
      special_events: events ? JSON.parse(events) : [],
      agenda: agenda ? JSON.parse(agenda) : [],
      prayers: prayers ? JSON.parse(prayers) : {},
      music_program: music ? JSON.parse(music) : {},
      leadership: leadership ? JSON.parse(leadership) : {},
      wardLeadership: wardLeadership ? JSON.parse(wardLeadership) : [],
      missionaries: missionaries ? JSON.parse(missionaries) : [],
      wardMissionaries: wardMissionaries ? JSON.parse(wardMissionaries) : [],
      serviceMissionaries: serviceMissionaries ? JSON.parse(serviceMissionaries) : [],
      created_at: data.created_at,
      updated_at: data.created_at
    };

    return result;
  },

  async deleteBulletin(bulletinId: string, userId: string) {
    // Remove from local storage
    try {
      const existingBulletins = this.getFromLocalStorage();
      const updatedBulletins = existingBulletins.filter(b => b.id !== bulletinId);
      localStorage.setItem('mywardbulletin_bulletins', JSON.stringify(updatedBulletins));
    } catch (error) {
      console.warn('Failed to remove from local storage:', error);
    }

    // If bulletinId starts with "bulletin-", it's a local storage only bulletin
    if (bulletinId.startsWith('bulletin-')) {
      // Already removed from local storage above, nothing more to do
      return;
    }

    // For database bulletins, proceed with database deletion

    try {
      // Get bulletin info first to check permissions and clean up tokens
      const bulletin = await supabase
        .from('bulletins')
        .select('slug, created_by, profile_slug')
        .eq('id', bulletinId)
        .single();

      if (!bulletin.data) {
        throw new Error('Bulletin not found');
      }

      // Check permissions if bulletin belongs to a shared profile
      if (bulletin.data.profile_slug) {
        const permissions = await profileSharingService.getUserPermissions(bulletin.data.profile_slug, userId);
        if (!permissions.canEdit && bulletin.data.created_by !== userId) {
          throw new Error('You do not have permission to delete bulletins for this profile');
        }
      } else if (bulletin.data.created_by !== userId) {
        throw new Error('You do not have permission to delete this bulletin');
      }
      
      if (bulletin.data) {
        // Delete associated tokens
        await supabase
          .from('tokens')
          .delete()
          .eq('created_by', bulletin.data.created_by)
          .like('key', `bulletin-${bulletin.data.slug}-%`);
      }

      const { error } = await supabase
        .from('bulletins')
        .delete()
        .eq('id', bulletinId)
        .eq('created_by', userId);
      
      if (error) throw error;
    } catch (error: any) {
      // If it's a UUID error, the bulletin might only exist in local storage
      if (error.message && error.message.includes('invalid input syntax for type uuid')) {
        // Already removed from local storage, so this is fine
        return;
      }
      throw error;
    }
  },

  async updateBulletinSchedule(bulletinId: string, userId: string, scheduleData: {
    scheduledDate: string;
    status: 'scheduled' | 'draft';
    autoActivate?: boolean;
  }) {
    try {
      // Validate that the scheduled date is not in the past
      if (scheduleData.status === 'scheduled' && scheduleData.scheduledDate) {
        const scheduledDateTime = new Date(scheduleData.scheduledDate);
        const now = new Date();
        
        if (scheduledDateTime < now) {
          throw new Error('Cannot schedule a bulletin for a date/time in the past. Please select a future date and time.');
        }
      }

      // Refresh session to ensure we have valid auth
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        throw refreshError;
      }

      // Check if this bulletin exists and get its status
      // Don't filter by created_by - let RLS handle access control
      const { data: bulletin, error: fetchError } = await supabase
        .from('bulletins')
        .select('status, profile_slug')
        .eq('id', bulletinId)
        .single();

      if (fetchError) {
        console.error('Error fetching bulletin for scheduling:', fetchError);
        throw new Error(`Failed to find bulletin: ${fetchError.message}`);
      }

      if (!bulletin) {
        throw new Error('Bulletin not found or you do not have access to it');
      }

      const isCurrentlyActive = bulletin?.status === 'active';

      // Update the bulletin - RLS will ensure user has edit access
      const { data: updateData, error: updateError } = await withTimeout(
        supabase
          .from('bulletins')
          .update({
            // Only change status to 'scheduled' if it's NOT currently active
            status: isCurrentlyActive ? 'active' : scheduleData.status,
            scheduled_date: scheduleData.scheduledDate,
            auto_activate: scheduleData.autoActivate !== undefined ? scheduleData.autoActivate : true
          })
          .eq('id', bulletinId)
          .select('id, status, scheduled_date'),
        10000
      );

      if (updateError) {
        console.error('Error updating bulletin schedule:', updateError);
        throw new Error(`Failed to update schedule: ${updateError.message}`);
      }

      if (!updateData || updateData.length === 0) {
        // Check user's role for this profile to provide better error message
        let userRole = 'unknown';
        if (bulletin?.profile_slug) {
          try {
            const { data: shareCheck } = await supabase
              .from('profile_shares')
              .select('role')
              .eq('profile_slug', bulletin.profile_slug)
              .eq('shared_with_id', userId)
              .maybeSingle();
            
            if (shareCheck) {
              userRole = shareCheck.role;
            }
          } catch (e) {
            // Ignore error checking role
          }
        }

        if (userRole === 'viewer') {
          throw new Error('Viewers cannot schedule bulletins. Please ask the profile owner to change your role to Editor.');
        } else {
          throw new Error('You do not have permission to schedule this bulletin. Only editors and owners can schedule bulletins.');
        }
      }

    } catch (error) {
      throw error;
    }
  },

  async bulkScheduleBulletins(schedules: Array<{bulletinId: string; scheduledDate: string}>, userId: string) {
    const results = [];
    
    for (const schedule of schedules) {
      try {
        await this.updateBulletinSchedule(schedule.bulletinId, userId, {
          scheduledDate: schedule.scheduledDate,
          status: 'scheduled'
        });
        results.push({ bulletinId: schedule.bulletinId, success: true });
      } catch (error) {
        results.push({ 
          bulletinId: schedule.bulletinId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return results;
  },

  async updateBulletinStatus(bulletinId: string, userId: string, status: 'draft' | 'scheduled' | 'active' | 'archived') {
    // Validate that the bulletin ID is a proper UUID (not a local_ ID)
    if (bulletinId.startsWith('local_')) {
      throw new Error('Cannot update status of unsaved bulletin. Please save the bulletin first.');
    }

    // First, get the bulletin to find its profile_slug and owner
    const { data: bulletin, error: fetchError } = await withTimeout(
      supabase
        .from('bulletins')
        .select('profile_slug, created_by')
        .eq('id', bulletinId)
        .single(),
      10000
    );

    if (fetchError) throw fetchError;
    if (!bulletin) throw new Error('Bulletin not found');

    const profileSlug = bulletin.profile_slug;

    // Get the actual profile owner (not the bulletin creator)
    // This is critical for shared profiles - editors create bulletins but
    // active_bulletin_id must be set on the profile OWNER's user record
    let profileOwnerId = bulletin.created_by; // Default to creator for non-shared bulletins

    if (profileSlug) {
      // Look up the actual profile owner from the profile_slug
      const { data: profileOwner } = await supabase
        .from('users')
        .select('id')
        .eq('profile_slug', profileSlug)
        .single();

      if (profileOwner) {
        profileOwnerId = profileOwner.id;
      }
    }

    // Check permissions BEFORE attempting update (prevents unnecessary operations)
    if (profileSlug) {
      // Check user's role for this profile
      const { data: shareCheck } = await supabase
        .from('profile_shares')
        .select('role')
        .eq('profile_slug', profileSlug)
        .eq('shared_with_id', userId)
        .maybeSingle();
      
      if (shareCheck && shareCheck.role === 'viewer') {
        throw new Error('Viewers cannot change bulletin status. Please ask the profile owner to change your role to Editor.');
      }
      
      // If user doesn't own the profile and isn't shared, check if they created the bulletin
      if (profileOwnerId !== userId && !shareCheck) {
        // Check if user owns the profile
        const { data: ownerCheck } = await supabase
          .from('users')
          .select('id')
          .eq('profile_slug', profileSlug)
          .eq('id', userId)
          .maybeSingle();
        
        if (!ownerCheck && profileOwnerId !== userId) {
          throw new Error('You do not have permission to edit this bulletin.');
        }
      }
    } else {
      // No profile_slug - check if user created the bulletin
      if (profileOwnerId !== userId) {
        throw new Error('You can only update bulletins you created.');
      }
    }

    // If making a bulletin active, first archive ALL other active bulletins for this user
    // We do this BEFORE updating to avoid conflicts
    if (status === 'active') {
      // Archive ALL active bulletins for this user (regardless of profile_slug)
      // This ensures we don't have multiple active bulletins causing conflicts
      let archiveQuery = supabase
        .from('bulletins')
        .update({ status: 'archived' })
        .eq('status', 'active')
        .eq('created_by', profileOwnerId)
        .neq('id', bulletinId); // Don't archive the bulletin we're about to activate

      // If bulletin has a profile_slug, also try archiving by profile_slug for shared users
      // This helps with RLS policies that might restrict updates by created_by
      if (profileSlug) {
        const { error: profileArchiveError } = await withTimeout(
          supabase
            .from('bulletins')
            .update({ status: 'archived' })
            .eq('status', 'active')
            .eq('profile_slug', profileSlug)
            .neq('id', bulletinId),
          10000
        );
      }

      const { error: archiveError } = await withTimeout(
        archiveQuery,
        10000
      );

      if (archiveError) {
        // Don't throw - we'll try to continue and the update might still work
        // RLS might prevent archiving, but the update itself might succeed
      }
    }

    // Update the specific bulletin's status - RLS policies will handle access control
    // Retry logic for handling race conditions with scheduler/triggers
    let updateData;
    let error;
    let retries = 3;
    let lastError;
    
    while (retries > 0) {
      const result = await withTimeout(
        supabase
          .from('bulletins')
          .update({
            status,
            // Disable auto-activation when manually making bulletin active
            ...(status === 'active' ? { auto_activate: false } : {})
          })
          .eq('id', bulletinId)
          .select('id, status'),
        10000
      );
      
      error = result.error;
      updateData = result.data;
      lastError = error;
      
      // If no error, break
      if (!error) {
        break;
      }
      
      // Check for unique constraint violation (23505) - another bulletin is already active
      const isUniqueViolation = error.code === '23505' ||
                                error.message?.includes('unique_active_bulletin_per_user') ||
                                error.message?.includes('unique_active_bulletin_per_profile');

      if (isUniqueViolation && status === 'active') {
        // Archive the conflicting active bulletin
        if (profileSlug) {
          await withTimeout(
            supabase
              .from('bulletins')
              .update({ status: 'archived' })
              .eq('profile_slug', profileSlug)
              .eq('status', 'active')
              .neq('id', bulletinId),
            10000
          );
        } else {
          await withTimeout(
            supabase
              .from('bulletins')
              .update({ status: 'archived' })
              .eq('created_by', profileOwnerId)
              .eq('status', 'active')
              .eq('profile_slug', null)
              .neq('id', bulletinId),
            10000
          );
        }
        // Retry after archiving
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
          continue;
        }
      }

      // Check both error.code and error.status for 409 conflicts
      const isConflict = error.code === '409' ||
                        error.code === 'PGRST116' ||
                        (error as any).status === 409 ||
                        error.message?.includes('Conflict') ||
                        error.message?.includes('409');

      // If not a conflict or unique violation, break
      if (!isConflict && !isUniqueViolation) {
        break;
      }

      // If it's a 409 Conflict, wait a bit and retry (might be race condition with scheduler/trigger)
      if (isConflict) {
        retries--;
        if (retries > 0) {
          // Wait a random amount between 100-300ms to avoid thundering herd
          await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
          // Verify the bulletin status before retrying - it might have been updated by trigger/scheduler
          const { data: currentBulletin } = await supabase
            .from('bulletins')
            .select('id, status')
            .eq('id', bulletinId)
            .single();

          // If the status is already what we want, consider it successful
          if (currentBulletin && currentBulletin.status === status) {
            updateData = [currentBulletin];
            error = null;
            break;
          }
        }
      } else {
        break;
      }
    }

    if (error) {
      // Check for 409 conflicts FIRST (before unique constraint checks)
      // A 409 Conflict might be a race condition that can be resolved
      const isConflict = error.code === '409' || 
                        error.code === 'PGRST116' || 
                        (error as any).status === 409 ||
                        error.message?.includes('Conflict') ||
                        error.message?.includes('409');
      
      if (isConflict) {
        // Verify the bulletin status - the trigger might have already updated it
        const { data: currentBulletin } = await supabase
          .from('bulletins')
          .select('id, status')
          .eq('id', bulletinId)
          .single();
        
        if (currentBulletin && currentBulletin.status === status) {
          // The update actually succeeded despite the error - use the current data
          updateData = [currentBulletin];
          error = null;
        } else {
          // Check if there's actually another active bulletin causing a real constraint violation
          if (status === 'active') {
            // Get the profile owner to check their active bulletin
            const { data: profileOwner } = await supabase
              .from('bulletins')
              .select('created_by')
              .eq('id', bulletinId)
              .single();
            
            if (profileOwner) {
              const { data: ownerProfile } = await supabase
                .from('users')
                .select('active_bulletin_id')
                .eq('id', profileOwner.created_by)
                .single();
              
              if (ownerProfile && ownerProfile.active_bulletin_id && ownerProfile.active_bulletin_id !== bulletinId) {
                // There's actually another active bulletin - this is a real constraint violation
                throw new Error('Another bulletin is already active. Please archive it first or contact the profile owner.');
              }
            }
          }
          throw new Error('Failed to update bulletin status due to a conflict. Please try again.');
        }
      } else {
        // Check if it's a unique constraint violation (non-409 errors)
        if (error.message?.includes('unique_active_bulletin_per_user') ||
            error.message?.includes('unique_active_bulletin_per_profile') ||
            error.message?.includes('duplicate key') ||
            error.code === '23505') {
          throw new Error('Another bulletin is already active for this profile. Please archive it first.');
        }
        throw error;
      }
    }

    // Verify the update succeeded
    if (!updateData || updateData.length === 0) {
      // Permissions were already checked above, so this is likely an RLS policy issue
      throw new Error('Failed to update bulletin status. The update was blocked - you may not have permission to edit this bulletin.');
    }

    // If making a bulletin active, update the profile owner's active_bulletin_id
    // Use the set_active_bulletin RPC function which has SECURITY DEFINER to bypass RLS
    // This allows editors to set active_bulletin_id on the profile owner's record
    if (status === 'active' && profileSlug) {
      const { error: rpcError } = await withTimeout(
        supabase.rpc('set_active_bulletin', {
          p_profile_slug: profileSlug,
          p_bulletin_id: bulletinId
        }),
        10000
      );

      if (rpcError) {
        // Don't throw - the bulletin status was already updated, this is for the QR code display
        // The owner can still manually fix this if needed
      }
    } else if (status === 'active' && !profileSlug) {
      // For bulletins without a profile_slug (legacy/personal), use direct update
      await withTimeout(
        supabase
          .from('users')
          .update({ active_bulletin_id: bulletinId })
          .eq('id', profileOwnerId),
        10000
      );
    }
  },

  async getScheduledBulletins(userId?: string) {
    // Get current local time in ISO format (without timezone conversion)
    const now = new Date();
    const localTimeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    let query = supabase
      .from('bulletins')
      .select('id, created_by, profile_slug, scheduled_date, auto_activate')
      .eq('status', 'scheduled')
      .eq('auto_activate', true)
      .lte('scheduled_date', localTimeString);

    // If userId is provided, filter by accessible profiles (owned + shared)
    if (userId) {
      // Get all profile_slugs the user has access to
      const accessibleProfiles = await this.getUserAccessibleProfiles(userId);
      const accessibleSlugs = accessibleProfiles.map(p => p.profile_slug);

      if (accessibleSlugs.length > 0) {
        // Get bulletins that either:
        // 1. Were created by this user, OR
        // 2. Belong to a profile_slug the user has access to
        query = query.or(`created_by.eq.${userId},profile_slug.in.(${accessibleSlugs.join(',')})`);
      } else {
        // No accessible profiles, just get bulletins they created
        query = query.eq('created_by', userId);
      }
    }

    const { data, error } = await withTimeout(query, 10000);

    if (error) throw error;
    return data || [];
  },

  async activateScheduledBulletin(bulletinId: string, userId: string) {
    // First, get the bulletin to check its status and profile_slug
    const { data: currentBulletin } = await withTimeout(
      supabase
        .from('bulletins')
        .select('id, status, auto_activate, profile_slug, created_by')
        .eq('id', bulletinId)
        .single(),
      10000
    );

    if (!currentBulletin) {
      return;
    }

    if (currentBulletin.status === 'active') {
      // Bulletin is already active, just disable auto_activate to prevent re-activation attempts
      if (currentBulletin.auto_activate) {
        await supabase
          .from('bulletins')
          .update({ auto_activate: false })
          .eq('id', bulletinId);
      }
      return; // Already active, nothing to do
    }

    const profileSlug = currentBulletin.profile_slug;

    // Check if there's a manually activated bulletin (auto_activate = false) for this profile
    // If so, don't override it - scheduled activations should respect manual activations
    let activeBulletinsQuery = supabase
      .from('bulletins')
      .select('id, auto_activate, profile_slug')
      .eq('status', 'active');

    // Filter by profile_slug if the bulletin belongs to a profile
    if (profileSlug) {
      activeBulletinsQuery = activeBulletinsQuery.eq('profile_slug', profileSlug);
    } else {
      // No profile_slug, filter by the bulletin's creator
      activeBulletinsQuery = activeBulletinsQuery.eq('created_by', currentBulletin.created_by);
    }

    const { data: activeBulletins } = await withTimeout(activeBulletinsQuery, 10000);

    // If there's a manually activated bulletin (auto_activate = false), don't override it
    const manuallyActivated = activeBulletins?.find(b => b.auto_activate === false);
    if (manuallyActivated && manuallyActivated.id !== bulletinId) {
      // Disable auto_activate on the scheduled bulletin so it doesn't keep trying
      await supabase
        .from('bulletins')
        .update({ auto_activate: false })
        .eq('id', bulletinId);
      return; // Don't activate - respect the manual activation
    }

    // Archive other active bulletins for this profile (only auto-activated ones)
    if (profileSlug) {
      await withTimeout(
        supabase
          .from('bulletins')
          .update({ status: 'archived' })
          .eq('profile_slug', profileSlug)
          .eq('status', 'active')
          .eq('auto_activate', true)
          .neq('id', bulletinId),
        10000
      );
    } else {
      // No profile_slug, archive by the bulletin's creator
      await withTimeout(
        supabase
          .from('bulletins')
          .update({ status: 'archived' })
          .eq('created_by', currentBulletin.created_by)
          .eq('status', 'active')
          .eq('auto_activate', true)
          .neq('id', bulletinId),
        10000
      );
    }

    // Then activate the specific bulletin and disable auto_activate to prevent re-activation
    // Use retry logic to handle race conditions
    let error;
    let retries = 3;
    let updateData;

    while (retries > 0) {
      const result = await withTimeout(
        supabase
          .from('bulletins')
          .update({
            status: 'active',
            auto_activate: false  // Disable auto-activation to prevent re-activation
          })
          .eq('id', bulletinId)
          .select('id, status, auto_activate, profile_slug'),
        10000
      );

      error = result.error;
      updateData = result.data;

      // If no error, break
      if (!error) {
        break;
      }

      // Check for unique constraint violation (23505) from the database
      // This means another bulletin is already active for this user/profile
      const isUniqueViolation = error.code === '23505' ||
                                error.message?.includes('unique_active_bulletin_per_user') ||
                                error.message?.includes('unique_active_bulletin_per_profile');

      if (isUniqueViolation) {
        // Archive the conflicting active bulletin first
        if (profileSlug) {
          await withTimeout(
            supabase
              .from('bulletins')
              .update({ status: 'archived' })
              .eq('profile_slug', profileSlug)
              .eq('status', 'active')
              .neq('id', bulletinId),
            10000
          );
        } else {
          await withTimeout(
            supabase
              .from('bulletins')
              .update({ status: 'archived' })
              .eq('created_by', currentBulletin.created_by)
              .eq('status', 'active')
              .eq('profile_slug', null)
              .neq('id', bulletinId),
            10000
          );
        }
        // Retry the activation after archiving
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
          continue;
        }
      }

      // Check for 409 Conflict errors from Supabase
      const isConflict = error.code === '409' ||
                        error.code === 'PGRST116' ||
                        (error as any).status === 409 ||
                        error.message?.includes('Conflict') ||
                        error.message?.includes('409');

      // If not a conflict or unique violation, break
      if (!isConflict && !isUniqueViolation) {
        break;
      }

      // If it's a 409 Conflict, wait and retry
      if (isConflict) {
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
          // Verify the bulletin status - it might have been updated by another process
          const { data: currentBulletin } = await supabase
            .from('bulletins')
            .select('id, status, auto_activate')
            .eq('id', bulletinId)
            .single();

          // If the status is already active, consider it successful
          if (currentBulletin && currentBulletin.status === 'active') {
            // If auto_activate is still true, update it to false
            if (currentBulletin.auto_activate) {
              await supabase
                .from('bulletins')
                .update({ auto_activate: false })
                .eq('id', bulletinId);
            }
            updateData = [currentBulletin];
            error = null;
            break;
          }
        }
      }
    }

    // For 409 conflicts after retries, verify if the update actually succeeded
    const isConflictAfterRetries = error && (
      error.code === '409' || 
      error.code === 'PGRST116' || 
      (error as any).status === 409 ||
      error.message?.includes('Conflict') ||
      error.message?.includes('409')
    );
    
    if (isConflictAfterRetries) {
      const { data: currentBulletin } = await supabase
        .from('bulletins')
        .select('id, status, auto_activate')
        .eq('id', bulletinId)
        .single();
      
      if (currentBulletin && currentBulletin.status === 'active') {
        // The update actually succeeded - ensure auto_activate is false
        if (currentBulletin.auto_activate) {
          await supabase
            .from('bulletins')
            .update({ auto_activate: false })
            .eq('id', bulletinId);
        }
        updateData = [currentBulletin];
        error = null;
      } else {
        throw new Error(`Failed to activate scheduled bulletin due to conflict: ${error.message}`);
      }
    } else if (error) {
      // If activation failed, still try to disable auto_activate to prevent repeated attempts
      try {
        await supabase
          .from('bulletins')
          .update({ auto_activate: false })
          .eq('id', bulletinId);
      } catch {
        // Silently handle disable failure
      }
      throw error;
    }

    // Ensure auto_activate is disabled after successful activation
    if (updateData && updateData.length > 0 && updateData[0].auto_activate) {
      await supabase
        .from('bulletins')
        .update({ auto_activate: false })
        .eq('id', bulletinId);
    }

    // Also update the bulletin creator's active_bulletin_id (with retry logic)
    // For shared profiles, this updates the owner's active_bulletin_id so all shared users see it
    let userUpdateError;
    retries = 3;

    while (retries > 0) {
      const result = await withTimeout(
        supabase
          .from('users')
          .update({ active_bulletin_id: bulletinId })
          .eq('id', currentBulletin.created_by),
        10000
      );
      
      userUpdateError = result.error;
      
      // If no error, break
      if (!userUpdateError) {
        break;
      }
      
      // Check both error.code and error.status for 409 conflicts
      const isConflict = userUpdateError.code === '409' || 
                        userUpdateError.code === 'PGRST116' || 
                        (userUpdateError as any).status === 409 ||
                        userUpdateError.message?.includes('Conflict') ||
                        userUpdateError.message?.includes('409');
      
      // If not a conflict error, break
      if (!isConflict) {
        break;
      }
      
      // If it's a 409 Conflict, wait and retry
      if (isConflict) {
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
          // Verify the user's active_bulletin_id - the trigger might have already updated it
          const { data: currentUser } = await supabase
            .from('users')
            .select('active_bulletin_id')
            .eq('id', userId)
            .single();
          
          // If the active_bulletin_id is already set correctly, consider it successful
          if (currentUser && currentUser.active_bulletin_id === bulletinId) {
            userUpdateError = null;
            break;
          }
        }
      } else {
        break;
      }
    }
    
    // Only throw if it's not a conflict that was resolved by the trigger
    const isSchedulerUserConflict = userUpdateError && (
      userUpdateError.code === '409' || 
      userUpdateError.code === 'PGRST116' || 
      (userUpdateError as any).status === 409 ||
      userUpdateError.message?.includes('Conflict') ||
      userUpdateError.message?.includes('409')
    );
    
    if (userUpdateError && !isSchedulerUserConflict) {
      throw userUpdateError;
    }
    
  },

  async getUserAccessibleProfiles(userId: string): Promise<Array<{profile_slug: string; role: string}>> {
    // Get owned profiles
    const { data: ownedProfiles } = await supabase
      .from('users')
      .select('profile_slug')
      .eq('id', userId)
      .not('profile_slug', 'is', null);

    // Get shared profiles
    const { data: sharedProfiles } = await supabase
      .from('profile_shares')
      .select('profile_slug, role')
      .eq('shared_with_id', userId);

    const owned = (ownedProfiles || []).map(p => ({ profile_slug: p.profile_slug, role: 'owner' }));
    const shared = (sharedProfiles || []).map(p => ({ profile_slug: p.profile_slug, role: p.role }));

    return [...owned, ...shared];
  },

  // Client-side function to check and activate scheduled bulletins
  async checkAndActivateScheduledBulletins(userId: string) {
    try {
      // Get bulletins that should be activated (using local timezone), filtered by user
      const scheduledBulletins = await this.getScheduledBulletins(userId);

      for (const bulletin of scheduledBulletins) {
        try {
          await this.activateScheduledBulletin(bulletin.id, userId);
        } catch {
          // Silently handle activation failures
        }
      }

      return scheduledBulletins.length;
    } catch {
      return 0;
    }
  }
};

// Robust service for connection/session health and draft protection
export const robustService = {
  async testAndRecoverConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
        .single();
      if (error) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },
  async validateSession(): Promise<any> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        return null;
      }
      const { error: testError } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .limit(1)
        .single();
      if (testError) {
        await supabase.auth.signOut();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },
  async saveDraftBeforeAuth(bulletinData: any): Promise<boolean> {
    try {
      localStorage.setItem('pending_bulletin_draft', JSON.stringify({ data: bulletinData, timestamp: Date.now() }));
      return true;
    } catch {
      return false;
    }
  },
  async restoreDraftAfterAuth(): Promise<any> {
    try {
      const draft = localStorage.getItem('pending_bulletin_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        localStorage.removeItem('pending_bulletin_draft');
        return parsed.data;
      }
      return null;
    } catch {
      return null;
    }
  }
};

// Retry mechanism for failed operations
export const retryOperation = async <T>(operation: () => Promise<T>, maxRetries: number = 3, delay: number = 1000): Promise<T> => {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  throw lastError;
};

// Enhanced localStorage management
export const localStorageService = {
  saveToLocalStorage: (key: string, data: any): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  },
  getFromLocalStorage: (key: string): any => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  removeFromLocalStorage: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
  clearAllBulletinData: (): boolean => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('mywardbulletin_') || key.startsWith('draft_') || key.startsWith('bulletin_')) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch {
      return false;
    }
  }
};
