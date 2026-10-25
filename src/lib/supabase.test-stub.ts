/**
 * Test stub for Supabase client - used only in print regression tests.
 * Provides minimal API surface needed for BulletinPrintLayout to render.
 */

// Mock Supabase client that does nothing but satisfies type requirements
export const supabase = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
  }),
  auth: {
    getSession: () => Promise.resolve({ 
      data: { 
        session: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
        } 
      }, 
      error: null 
    }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
};

// Mock services - provide mock profile for QR code generation
export const userService = {
  updateProfileSlug: () => Promise.resolve({}),
  getUserProfile: () => {
    console.log('[Stub] getUserProfile called');
    return Promise.resolve([{
      email: 'test@example.com',
      profile_slug: 'test-ward',
      role: 'user',
      active_bulletin_id: null,
      unit_type: 'ward',
      language: 'en',
    }]);
  },
  updateActiveBulletinId: () => Promise.resolve({}),
};

export const bulletinService = {
  saveBulletin: () => Promise.resolve({}),
  getBulletinsByProfileSlug: () => Promise.resolve([]),
};

export const robustService = {
  saveBulletin: () => Promise.resolve({}),
};

export const profileSharingService = {
  getProfilePermissions: () => Promise.resolve([]),
  getInvitations: () => Promise.resolve([]),
  createInvitation: () => Promise.resolve({}),
  acceptInvitation: () => Promise.resolve({}),
  deletePermission: () => Promise.resolve({}),
};

export const retryOperation = (fn: Function) => fn();

// Re-export everything the real module exports
export default supabase;
