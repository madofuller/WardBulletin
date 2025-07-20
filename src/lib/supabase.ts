import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a conditional Supabase client
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabase !== null
}
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
  if (!supabase) throw new Error('Supabase not configured');
  
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

// Token service functions
export const tokenService = {
  async saveToken(userId: string, key: string, value: string) {
    if (!supabase) throw new Error('Supabase not configured');

    console.log('Saving token:', { userId, key, valueLength: value.length });

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
    
    if (error) {
      console.error('Token save error:', error);
      throw error;
    }
    console.log('Successfully saved token:', key);
    return data;
  },

  async getToken(userId: string, key: string): Promise<string | null> {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('tokens')
      .select('value')
      .eq('key', key)
      .eq('created_by', userId)
      .single();
    
    if (error) return null;
    return data?.value || null;
  }
};

// User service functions
export const userService = {
  async checkProfileSlugAvailability(profileSlug: string, currentUserId?: string): Promise<boolean> {
    if (!supabase) throw new Error('Supabase not configured');

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
    if (!supabase) throw new Error('Supabase not configured');


    // Validate profile slug format (alphanumeric, hyphens, underscores only)
    if (!/^[a-zA-Z0-9_-]+$/.test(profileSlug)) {
      throw new Error('Profile slug can only contain letters, numbers, hyphens, and underscores');
    }

    // Check if the profile slug is available
    const isAvailable = await this.checkProfileSlugAvailability(profileSlug, userId);
    if (!isAvailable) {
      throw new Error('This profile slug is already taken. Please choose another.');
    }

    const { error } = await supabase
      .from('users')
      .update({ profile_slug: profileSlug })
      .eq('id', userId);
    
    if (error) throw error;
  },

  async getUserProfile(userId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('users')
      .select('email, profile_slug, role, active_bulletin_id') // Only select existing columns
      .eq('id', userId);
    if (error) throw error;
    return data;
  },

  async updateUserDefault(userId: string, field: 'default_ward_name' | 'default_presiding' | 'default_music_director' | 'default_organist' | 'default_conducting' | 'default_chorister', value: string) {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase
      .from('users')
      .update({ [field]: value })
      .eq('id', userId);
    if (error) throw error;
  },

  async updateActiveBulletinId(userId: string, bulletinId: string | null) {
    if (!supabase) throw new Error('Supabase not configured');

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
  async saveBulletin(bulletinData: any, userId: string, bulletinId?: string) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('[DEBUG] saveBulletin: session check', { session: sessionData?.session, error: sessionError });
    if (sessionError || !sessionData?.session) {
      console.error('[DEBUG] saveBulletin: No valid Supabase session, aborting save');
      throw new Error('No valid Supabase session. Please sign in again.');
    }

    let slug: string;
    
    if (bulletinId) {
      try {
        const { data: existingBulletin, error } = await supabase
          .from('bulletins')
          .select('slug')
          .eq('id', bulletinId)
          .eq('created_by', userId)
          .single();
        if (error) throw error;
        slug = existingBulletin.slug;
      } catch (error) {
        slug = generateUniqueBulletinSlug(userId, bulletinData.date);
      }
    } else {
      slug = generateUniqueBulletinSlug(userId, bulletinData.date);
    }

    const bulletinRecord = {
      id: bulletinId || `bulletin-${Date.now()}`,
      slug,
      meeting_date: bulletinData.date,
      meeting_type: bulletinData.meetingType,
      created_by: userId,
      created_at: new Date().toISOString(),
      ward_name: bulletinData.wardName,
      theme: bulletinData.theme || '',
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
    };
    console.log('[DEBUG] saveBulletin: prepared bulletin record', bulletinRecord);

    // Save tokens (batch upsert)
    try {
      console.log('[DEBUG] saveBulletin: saving tokens (batch upsert)');
      const tokens = [
        { key: `bulletin-${slug}-ward_name`, value: bulletinData.wardName || '', created_by: userId },
        { key: `bulletin-${slug}-theme`, value: bulletinData.theme || '', created_by: userId },
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
      ];
      console.log('[DEBUG] saveBulletin: tokens array', tokens);
      let data, error;
      try {
        const upsertPromise = supabase
          .from('tokens')
          .upsert(tokens, { onConflict: 'key,created_by' });
        const upsertResult = await upsertPromise;
        ({ data, error } = await withTimeout(Promise.resolve(upsertResult), 10000));
        console.log('[DEBUG] saveBulletin: tokens upsert result', { data, error });
      } catch (timeoutError) {
        console.error('[DEBUG] saveBulletin: token batch upsert timed out or failed', timeoutError);
        throw timeoutError;
      }
      if (error) {
        console.error('[DEBUG] saveBulletin: token upsert error', error);
        throw error;
      }
      console.log('[DEBUG] saveBulletin: successfully batch upserted all tokens', data);
    } catch (tokenError) {
      console.error('[DEBUG] saveBulletin: error saving tokens (batch upsert)', tokenError);
    }

    const dbBulletinRecord = {
      slug,
      meeting_date: bulletinData.date,
      meeting_type: bulletinData.meetingType,
      created_by: userId
    };
    console.log('[DEBUG] saveBulletin: saving bulletin to database', dbBulletinRecord);

    try {
      if (bulletinId) {
        let data, error;
        try {
          const updatePromise = supabase
            .from('bulletins')
            .update(dbBulletinRecord)
            .eq('id', bulletinId)
            .eq('created_by', userId)
            .select()
            .single();
          const updateResult = await updatePromise;
          ({ data, error } = await withTimeout(Promise.resolve(updateResult), 10000));
          console.log('[DEBUG] saveBulletin: bulletin update result', { data, error });
        } catch (timeoutError) {
          console.error('[DEBUG] saveBulletin: bulletin update timed out or failed', timeoutError);
          throw timeoutError;
        }
        if (error) throw error;
        this.saveToLocalStorage({ ...bulletinRecord, id: data.id });
        return data;
      } else {
        let data, error;
        try {
          const insertPromise = supabase
            .from('bulletins')
            .insert(dbBulletinRecord)
            .select()
            .single();
          const insertResult = await insertPromise;
          ({ data, error } = await withTimeout(Promise.resolve(insertResult), 10000));
          console.log('[DEBUG] saveBulletin: bulletin insert result', { data, error });
        } catch (timeoutError) {
          console.error('[DEBUG] saveBulletin: bulletin insert timed out or failed', timeoutError);
          throw timeoutError;
        }
        if (error) throw error;
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
      console.log('Saving bulletin to local storage:', bulletin);
      console.log('Existing bulletins:', existingBulletins);
      const updatedBulletins = existingBulletins.filter(b => b.id !== bulletin.id);
      updatedBulletins.push(bulletin);
      console.log('Updated bulletins array:', updatedBulletins);
      localStorage.setItem('zionboard_bulletins', JSON.stringify(updatedBulletins));
      console.log('Successfully saved to localStorage');
    } catch (error) {
      console.warn('Failed to save to local storage:', error);
    }
  },

  getFromLocalStorage(): any[] {
    try {
      const stored = localStorage.getItem('zionboard_bulletins');
      console.log('Raw local storage data:', stored);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to read from local storage:', error);
      return [];
    }
  },
  async getUserBulletins(userId: string) {
    if (!supabase) throw new Error('Supabase not configured');

    // Always try to get bulletins from local storage first
    const localBulletins = this.getFromLocalStorage().filter(b => b.created_by === userId);
    console.log('Local bulletins for user:', userId, localBulletins);
    try {
      const { data, error } = await supabase
        .from('bulletins')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        if (error.message.includes('infinite recursion')) {
          // Return empty array if RLS recursion occurs
          console.warn('Skipping bulletin retrieval due to RLS recursion');
          return [];
        }
        throw error;
      }
      
      // Fetch bulletin data from tokens for each bulletin
      const bulletinsWithData = await Promise.all(
        data.map(async (bulletin) => {
          try {
            const [wardName, theme, bishopric, announcements, meetings, events, agenda, prayers, music, leadership, wardLeadership, missionaries] = await Promise.all([
              tokenService.getToken(userId, `bulletin-${bulletin.slug}-ward_name`),
              tokenService.getToken(userId, `bulletin-${bulletin.slug}-theme`),
              tokenService.getToken(userId, `bulletin-${bulletin.slug}-bishopric`),
              tokenService.getToken(userId, `bulletin-${bulletin.slug}-announcements`),
              tokenService.getToken(userId, `bulletin-${bulletin.slug}-meetings`),
              tokenService.getToken(userId, `bulletin-${bulletin.slug}-events`),
              tokenService.getToken(userId, `bulletin-${bulletin.slug}-agenda`),
              tokenService.getToken(userId, `bulletin-${bulletin.slug}-prayers`),
              tokenService.getToken(userId, `bulletin-${bulletin.slug}-music`),
              tokenService.getToken(userId, `bulletin-${bulletin.slug}-leadership`),
              tokenService.getToken(userId, `bulletin-${bulletin.slug}-wardLeadership`),
              tokenService.getToken(userId, `bulletin-${bulletin.slug}-missionaries`),
            ]);

            return {
              id: bulletin.id,
              user_id: bulletin.created_by,
              ward_name: wardName || '',
              date: bulletin.meeting_date,
              meeting_type: bulletin.meeting_type,
              theme: theme || '',
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
              created_at: bulletin.created_at,
              updated_at: bulletin.created_at
            };
          } catch (tokenError: any) {
            // If token retrieval fails, return bulletin with minimal data
            return {
              id: bulletin.id,
              user_id: bulletin.created_by,
              ward_name: '',
              date: bulletin.meeting_date,
              meeting_type: bulletin.meeting_type,
              theme: '',
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
              created_at: bulletin.created_at,
              updated_at: bulletin.created_at
            };
          }
        })
      );
      
      // Merge database bulletins with local storage bulletins (prefer database)
      const dbBulletinIds = new Set(bulletinsWithData.map(b => b.id));
      const uniqueLocalBulletins = localBulletins.filter(b => !dbBulletinIds.has(b.id));
      
      return [...bulletinsWithData, ...uniqueLocalBulletins];
    } catch (error: any) {
      console.error('Error fetching bulletins from database:', error);
      console.log('Returning local bulletins only due to database error');
      return localBulletins;
    }
  },

  async getBulletinById(bulletinId: string) {
    if (!supabase) throw new Error('Supabase not configured');

    // Try local storage first
    const localBulletins = this.getFromLocalStorage();
    const localBulletin = localBulletins.find(b => b.id === bulletinId);
    if (localBulletin) {
      return localBulletin;
    }
    const { data, error } = await supabase
      .from('bulletins')
      .select('*')
      .eq('id', bulletinId)
      .single();
    
    if (error) throw error;
    
    // Get user ID to fetch tokens
    const userId = data.created_by;
    
    // Fetch bulletin data from tokens
    const [wardName, theme, image, bishopric, announcements, meetings, events, agenda, prayers, music, leadership, wardLeadership, missionaries] = await Promise.all([
      tokenService.getToken(userId, `bulletin-${data.slug}-ward_name`),
      tokenService.getToken(userId, `bulletin-${data.slug}-theme`),
      tokenService.getToken(userId, `bulletin-${data.slug}-image`),
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
    ]);

    return {
      id: data.id,
      user_id: data.created_by,
      profile_slug: data.profile_slug,
      ward_name: wardName || '',
      date: data.meeting_date,
      meeting_type: data.meeting_type,
      theme: theme || '',
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
      created_at: data.created_at,
      updated_at: data.created_at
    };
  },

  async getLatestBulletinByProfileSlug(profileSlug: string) {
    if (!supabase) throw new Error('Supabase not configured');

    // First get the user by profile_slug and their active bulletin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, active_bulletin_id')
      .eq('profile_slug', profileSlug)
      .single();
    
    if (userError) throw userError;
    
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
    
    // Fetch bulletin data from tokens
    const [wardName, theme, image, bishopric, announcements, meetings, events, agenda, prayers, music, leadership, wardLeadership, missionaries] = await Promise.all([
      tokenService.getToken(userId, `bulletin-${data.slug}-ward_name`),
      tokenService.getToken(userId, `bulletin-${data.slug}-theme`),
      tokenService.getToken(userId, `bulletin-${data.slug}-image`),
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
    ]);

    return {
      id: data.id,
      user_id: data.created_by,
      profile_slug: data.profile_slug,
      ward_name: wardName || '',
      date: data.meeting_date,
      meeting_type: data.meeting_type,
      theme: theme || '',
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
      created_at: data.created_at,
      updated_at: data.created_at
    };
  },

  async deleteBulletin(bulletinId: string, userId: string) {
    // Remove from local storage
    try {
      const existingBulletins = this.getFromLocalStorage();
      const updatedBulletins = existingBulletins.filter(b => b.id !== bulletinId);
      localStorage.setItem('zionboard_bulletins', JSON.stringify(updatedBulletins));
    } catch (error) {
      console.warn('Failed to remove from local storage:', error);
    }

    // If bulletinId starts with "bulletin-", it's a local storage only bulletin
    if (bulletinId.startsWith('bulletin-')) {
      // Already removed from local storage above, nothing more to do
      return;
    }

    // For database bulletins, proceed with database deletion
    if (!supabase) throw new Error('Supabase not configured');

    try {
      // Get bulletin info first to clean up tokens
      const bulletin = await supabase
        .from('bulletins')
        .select('slug, created_by')
        .eq('id', bulletinId)
        .eq('created_by', userId)
        .single();
      
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
  }
};

// Robust service for connection/session health and draft protection
export const robustService = {
  async testAndRecoverConnection(): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
        .single();
      if (error) {
        console.warn('Connection test failed:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Connection test error:', error);
      return false;
    }
  },
  async validateSession(): Promise<any> {
    if (!supabase) return null;
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        console.warn('No valid session found');
        return null;
      }
      const { error: testError } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .limit(1)
        .single();
      if (testError) {
        console.warn('Session validation failed, signing out');
        await supabase.auth.signOut();
        return null;
      }
      return session;
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  },
  async saveDraftBeforeAuth(bulletinData: any): Promise<boolean> {
    try {
      localStorage.setItem('pending_bulletin_draft', JSON.stringify({ data: bulletinData, timestamp: Date.now() }));
      return true;
    } catch (error) {
      console.error('Failed to save draft:', error);
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
    } catch (error) {
      console.error('Failed to restore draft:', error);
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
      console.warn(`Operation failed (attempt ${attempt}/${maxRetries}):`, error);
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
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  },
  getFromLocalStorage: (key: string): any => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return null;
    }
  },
  removeFromLocalStorage: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      return false;
    }
  },
  clearAllBulletinData: (): boolean => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('zionboard_') || key.startsWith('draft_') || key.startsWith('bulletin_')) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to clear bulletin data:', error);
      return false;
    }
  }
};