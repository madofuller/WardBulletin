import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, userService, bulletinService } from './supabase';
import i18n from '../i18n';

interface UserProfile {
  email: string;
  profile_slug: string | null;
  role: string;
  active_bulletin_id: string | null;
  unit_type: 'ward' | 'branch';
  language: string;
}

interface SessionContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  refreshProfile?: () => void;
}

const SessionContext = createContext<SessionContextValue>({
  session: null,
  user: null,
  profile: null,
});

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileRefreshTrigger, setProfileRefreshTrigger] = useState(0);

  // Preserve recovery hash as early as possible (Supabase may strip it when processing the token)
  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (hash && (hash.includes('type=recovery') || hash.includes('access_token='))) {
      try {
        sessionStorage.setItem('password_recovery_hash', hash);
      } catch (_) {}
    }
  }, []);

  // Restore session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      // If this is a password recovery event, redirect to reset password page with hash preserved
      if (event === 'PASSWORD_RECOVERY') {
        const hash = window.location.hash || sessionStorage.getItem('password_recovery_hash') || '';
        try {
          sessionStorage.removeItem('password_recovery_hash');
        } catch (_) {}
        window.location.href = '/reset-password' + hash;
        return;
      }
      // If user updated their email, refresh profile to get new email
      if (event === 'USER_UPDATED' && newSession?.user) {
        setProfileRefreshTrigger(prev => prev + 1);
      }
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile whenever we have a valid session or when refresh is triggered
  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user || !supabase) {
        setProfile(null);
        return;
      }
      try {
        const data = await userService.getUserProfile(session.user.id);
        if (data && data.length > 0) {
          const userProfile = data[0] as UserProfile;
          setProfile(userProfile);

          // Sync localStorage with database value for unit_type
          if (userProfile.unit_type && typeof window !== 'undefined') {
            const currentLocalStorage = localStorage.getItem('selectedUnitType');
            if (currentLocalStorage !== userProfile.unit_type) {
              localStorage.setItem('selectedUnitType', userProfile.unit_type);
            }
          }

          // Sync localStorage and i18n with database value for language
          if (userProfile.language && typeof window !== 'undefined') {
            const currentLanguage = localStorage.getItem('selectedLanguage');
            if (currentLanguage !== userProfile.language) {
              localStorage.setItem('selectedLanguage', userProfile.language);
              i18n.changeLanguage(userProfile.language);
            }
          }
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      }
    };

    loadProfile();
  }, [session, profileRefreshTrigger]);

  // Function to trigger profile refresh
  const refreshProfile = () => {
    setProfileRefreshTrigger(prev => prev + 1);
  };

  // Check for scheduled bulletins that need activation when user logs in
  useEffect(() => {
    if (session?.user?.id) {
      const checkScheduledBulletins = async () => {
        try {
          await bulletinService.checkAndActivateScheduledBulletins(session.user.id);
        } catch (error) {
          // Error checking scheduled bulletins
        }
      };

      // Check immediately on login
      checkScheduledBulletins();

      // Check periodically (every 5 minutes) while user is active
      const interval = setInterval(checkScheduledBulletins, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [session?.user?.id]);

  return (
    <SessionContext.Provider value={{ session, user: session?.user ?? null, profile, refreshProfile }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);

