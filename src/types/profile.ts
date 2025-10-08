export type ProfileRole = 'owner' | 'editor' | 'viewer';

export interface ProfileShare {
  id: string;
  profile_slug: string;
  owner_id: string;
  shared_with_id: string;
  role: ProfileRole;
  created_at: string;
  updated_at: string;
  // Joined user data
  shared_with_email?: string;
  shared_with_user?: {
    id: string;
    email: string;
  };
}

export interface ProfileInvitation {
  id: string;
  profile_slug: string;
  owner_id: string;
  invited_email: string;
  role: ProfileRole;
  token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

export interface ProfilePermissions {
  canEdit: boolean;
  canView: boolean;
  canManageShares: boolean;
  canManageInvitations: boolean;
  canSchedule: boolean;
  role: ProfileRole;
}

export interface SharedProfile {
  profile_slug: string;
  role: ProfileRole;
  owner_email: string;
  shared_count: number;
}