import { useState, useEffect } from 'react';
import { ProfilePermissions } from '../types/profile';
import { profileSharingService } from '../lib/supabase';
import { useSession } from '../lib/SessionContext';

export function useProfilePermissions(profileSlug: string | null) {
  const { user, profile } = useSession();
  const [permissions, setPermissions] = useState<ProfilePermissions>({
    canEdit: false,
    canView: false,
    canManageShares: false,
    canManageInvitations: false,
    canSchedule: false,
    role: 'viewer'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPermissions() {
      if (!user || !profileSlug) {
        setPermissions({
          canEdit: false,
          canView: false,
          canManageShares: false,
          canManageInvitations: false,
          canSchedule: false,
          role: 'viewer'
        });
        setLoading(false);
        return;
      }

      // If this is the user's own profile, they have full permissions
      if (profile?.profile_slug === profileSlug) {
        setPermissions({
          canEdit: true,
          canView: true,
          canManageShares: true,
          canManageInvitations: true,
          canSchedule: true,
          role: 'owner'
        });
        setLoading(false);
        return;
      }

      try {
        const userPermissions = await profileSharingService.getUserPermissions(profileSlug, user.id);
        setPermissions(userPermissions);
      } catch (error) {
        setPermissions({
          canEdit: false,
          canView: false,
          canManageShares: false,
          canManageInvitations: false,
          canSchedule: false,
          role: 'viewer'
        });
      } finally {
        setLoading(false);
      }
    }

    loadPermissions();
  }, [user, profileSlug, profile?.profile_slug]);

  return { permissions, loading };
}

export function useProfileAccess() {
  const { user } = useSession();
  const [sharedProfiles, setSharedProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSharedProfiles = async () => {
    if (!user) {
      setSharedProfiles([]);
      setLoading(false);
      return;
    }

    try {
      const profiles = await profileSharingService.getSharedProfiles(user.id);
      setSharedProfiles(profiles);
    } catch (error) {
      console.error('Error loading shared profiles:', error);
      setSharedProfiles([]);
      // Don't retry on error to prevent infinite loops
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSharedProfiles();
    
    // Listen for profile share updates
    const handleProfileShareUpdate = () => {
      loadSharedProfiles();
    };
    
    window.addEventListener('profile-share-updated', handleProfileShareUpdate);
    
    return () => {
      window.removeEventListener('profile-share-updated', handleProfileShareUpdate);
    };
  }, [user]);

  return { sharedProfiles, loading, refetch: loadSharedProfiles };
}