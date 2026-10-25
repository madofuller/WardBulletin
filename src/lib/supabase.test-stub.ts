/**
 * Test stub for Supabase — used only when VITE_PRINT_TEST=true.
 * Supplies a signed-in user + profile slug so print QR codes render.
 */

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
};

const mockSession = {
  user: mockUser,
  access_token: 'test-token',
  refresh_token: 'test-refresh',
};

const mockProfile = {
  email: 'test@example.com',
  profile_slug: 'test-ward',
  role: 'user',
  active_bulletin_id: null,
  unit_type: 'ward',
  language: 'en',
};

function resolved<T>(data: T) {
  return Promise.resolve({ data, error: null });
}

function thenable(data: unknown = []) {
  const row: any = {
    select: () => row,
    insert: () => row,
    update: () => row,
    delete: () => row,
    upsert: () => row,
    eq: () => row,
    in: () => row,
    is: () => row,
    order: () => row,
    limit: () => row,
    single: () => resolved(null),
    maybeSingle: () => resolved(null),
    then: (resolve: (v: unknown) => unknown) => resolve({ data, error: null }),
  };
  return row;
}

export const supabase = {
  from: () => thenable([]),
  auth: {
    getSession: () => resolved({ session: mockSession }),
    getUser: () => resolved({ user: mockUser }),
    onAuthStateChange: (cb?: (event: string, session: typeof mockSession) => void) => {
      if (typeof cb === 'function') {
        queueMicrotask(() => cb('SIGNED_IN', mockSession as any));
      }
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signOut: () => resolved({}),
  },
  storage: {
    from: () => ({
      upload: () => resolved(null),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
};

export const isSupabaseConfigured = () => true;
export const testSupabaseConnection = async () => ({ success: true });

export const userService = {
  updateProfileSlug: () => Promise.resolve({}),
  getUserProfile: () => Promise.resolve([mockProfile]),
  updateActiveBulletinId: () => Promise.resolve({}),
};

export const bulletinService = {
  saveBulletin: () => Promise.resolve({}),
  getBulletinsByProfileSlug: () => Promise.resolve([]),
  checkAndActivateScheduledBulletins: () => Promise.resolve([]),
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

export const tokenService = {
  validateToken: () => Promise.resolve(null),
};

export const localStorageService = {
  get: () => null,
  set: () => {},
  remove: () => {},
};

export const retryOperation = (fn: Function) => fn();

export default supabase;
