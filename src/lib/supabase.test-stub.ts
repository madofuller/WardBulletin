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
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
};

// Mock services
export const userService = {
  updateProfileSlug: () => Promise.resolve({}),
  getUserProfile: () => Promise.resolve([]),
  updateActiveBulletinId: () => Promise.resolve({}),
};

export const bulletinService = {
  saveBulletin: () => Promise.resolve({}),
  getBulletinsByProfileSlug: () => Promise.resolve([]),
};

export const robustService = {
  saveBulletin: () => Promise.resolve({}),
};

export const retryOperation = (fn: Function) => fn();

// Re-export everything the real module exports
export default supabase;
