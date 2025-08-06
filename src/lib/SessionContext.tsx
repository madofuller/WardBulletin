import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, userService } from './supabase';

interface UserProfile {
  email: string;
  profile_slug: string | null;
  role: string;
  active_bulletin_id: string | null;
}

interface SessionContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
}

const SessionContext = createContext<SessionContextValue>({
  session: null,
  user: null,
  profile: null,
});

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Restore session on mount
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile whenever we have a valid session
  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user || !supabase) {
        setProfile(null);
        return;
      }
      try {
        const data = await userService.getUserProfile(session.user.id);
        if (data && data.length > 0) {
          setProfile(data[0] as UserProfile);
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      }
    };

    loadProfile();
  }, [session]);

  return (
    <SessionContext.Provider value={{ session, user: session?.user ?? null, profile }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);

