import type { SupabaseClient } from '@supabase/supabase-js';

export interface ProfileShare {
  id: string;
  profile_slug: string;
  owner_id: string;
  shared_with_id: string;
  role: 'owner' | 'editor' | 'viewer';
  created_at: string;
  updated_at: string;
  shared_user?: {
    id: string;
    email: string;
  };
}

export interface ProfileInvitation {
  id: string;
  profile_slug: string;
  owner_id: string;
  invited_email: string;
  role: 'editor' | 'viewer';
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export const createProfileSharingService = (supabase: SupabaseClient) => ({
  // Get all shares for a profile
  async getProfileShares(profileSlug: string): Promise<ProfileShare[]> {
    const { data, error } = await supabase
      .from('profile_shares')
      .select(`
        *,
        shared_user:shared_with_id (
          id,
          email
        )
      `)
      .eq('profile_slug', profileSlug);

    if (error) {
      console.error('Error fetching profile shares:', error);
      throw new Error('Failed to load shared users. Please try again.');
    }
    return data || [];
  },

  // Get all invitations for a profile
  async getProfileInvitations(profileSlug: string): Promise<ProfileInvitation[]> {
    const { data, error } = await supabase
      .from('profile_invitations')
      .select('*')
      .eq('profile_slug', profileSlug)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Error fetching invitations:', error);
      throw new Error('Failed to load pending invitations. Please try again.');
    }
    return data || [];
  },

  // Get shares and invitations in a single optimized call
  async getProfileSharesAndInvitations(profileSlug: string): Promise<{
    shares: ProfileShare[];
    invitations: ProfileInvitation[];
  }> {
    const [shares, invitations] = await Promise.all([
      this.getProfileShares(profileSlug),
      this.getProfileInvitations(profileSlug)
    ]);
    return { shares, invitations };
  },

  // Check if user has access to a profile
  async hasProfileAccess(profileSlug: string, userId: string): Promise<boolean> {
    // Check if user owns the profile
    const { data: ownerCheck } = await supabase
      .from('users')
      .select('id')
      .eq('profile_slug', profileSlug)
      .eq('id', userId)
      .maybeSingle();

    if (ownerCheck) return true;

    // Check if user is shared with
    const { data: shareCheck } = await supabase
      .from('profile_shares')
      .select('id')
      .eq('profile_slug', profileSlug)
      .eq('shared_with_id', userId)
      .maybeSingle();

    return !!shareCheck;
  },

  // Get user's role for a profile
  async getUserProfileRole(profileSlug: string, userId: string): Promise<'owner' | 'editor' | 'viewer' | null> {
    // Check if user owns the profile
    const { data: ownerCheck } = await supabase
      .from('users')
      .select('id')
      .eq('profile_slug', profileSlug)
      .eq('id', userId)
      .maybeSingle();

    if (ownerCheck) return 'owner';

    // Check if user is shared with
    const { data: shareCheck } = await supabase
      .from('profile_shares')
      .select('role')
      .eq('profile_slug', profileSlug)
      .eq('shared_with_id', userId)
      .maybeSingle();

    return (shareCheck?.role as 'owner' | 'editor' | 'viewer') || null;
  },

  // Share profile with another user
  async shareProfile(profileSlug: string, ownerId: string, sharedWithId: string, role: 'editor' | 'viewer'): Promise<void> {
    const { error } = await supabase
      .from('profile_shares')
      .insert({
        profile_slug: profileSlug,
        owner_id: ownerId,
        shared_with_id: sharedWithId,
        role
      });

    if (error) {
      console.error('Error sharing profile:', error);
      if (error.code === '23505') {
        throw new Error('This user already has access to this profile.');
      }
      throw new Error('Failed to share profile. Please try again.');
    }
  },

  // Update share role
  async updateShareRole(shareId: string, newRole: 'editor' | 'viewer'): Promise<void> {
    const { error } = await supabase
      .from('profile_shares')
      .update({ role: newRole })
      .eq('id', shareId);

    if (error) {
      console.error('Error updating role:', error);
      throw new Error('Failed to update user role. Please try again.');
    }
  },

  // Remove share
  async removeShare(shareId: string): Promise<void> {
    const { error } = await supabase
      .from('profile_shares')
      .delete()
      .eq('id', shareId);

    if (error) {
      console.error('Error removing share:', error);
      throw new Error('Failed to remove user access. Please try again.');
    }
  },

  // Invite user by email
  async inviteUser(profileSlug: string, ownerId: string, email: string, role: 'editor' | 'viewer'): Promise<string> {
    // First check if there's already an invitation for this email
    const { data: existingInvitation, error: checkError } = await supabase
      .from('profile_invitations')
      .select('id, token, expires_at, accepted_at')
      .eq('profile_slug', profileSlug)
      .eq('invited_email', email)
      .maybeSingle();

    // If invitation exists and is still valid, return the existing token
    if (existingInvitation && !existingInvitation.accepted_at) {
      const expiresAt = new Date(existingInvitation.expires_at);
      if (expiresAt > new Date()) {
        return existingInvitation.token;
      } else {
        // Expired invitation - delete it and create a new one
        await supabase
          .from('profile_invitations')
          .delete()
          .eq('id', existingInvitation.id);
      }
    }

    // Create new invitation
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const { error } = await supabase
      .from('profile_invitations')
      .insert({
        profile_slug: profileSlug,
        owner_id: ownerId,
        invited_email: email,
        role,
        token,
        expires_at: expiresAt.toISOString()
      });

    if (error) {
      // If it's a duplicate key error, try to get the existing invitation
      if (error.code === '23505') { // Unique constraint violation
        const { data: existingToken } = await supabase
          .from('profile_invitations')
          .select('token')
          .eq('profile_slug', profileSlug)
          .eq('invited_email', email)
          .maybeSingle();
        
        if (existingToken) {
          return existingToken.token;
        }
      }
      throw error;
    }

    // Send invitation email
    try {
      await this.sendInvitationEmail({
        invitedEmail: email,
        profileSlug,
        invitationLink: `${window.location.origin}/invite/${token}`,
        role,
        inviterName: await this.getInviterName(ownerId)
      });
    } catch (emailError) {
      console.warn('Failed to send invitation email:', emailError);
      // Don't throw error - invitation was created successfully
    }
    
    return token;
  },

  // Send invitation email via Supabase Edge Function
  async sendInvitationEmail(data: {
    invitedEmail: string;
    profileSlug: string;
    invitationLink: string;
    role: string;
    inviterName?: string;
  }): Promise<void> {
    const { data: response, error } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'invitation',
        data
      }
    });

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }

    if (!response?.success) {
      throw new Error('Email service returned error');
    }
  },

  // Get inviter name for email personalization
  async getInviterName(userId: string): Promise<string | undefined> {
    try {
      const { data } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
      
      return data?.email?.split('@')[0] || undefined;
    } catch {
      return undefined;
    }
  },

  // Get invitation by token (public method for invitation page)
  async getInvitationByToken(token: string): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase
      .from('profile_invitations')
      .select(`
        profile_slug,
        invited_email,
        role,
        expires_at,
        accepted_at,
        created_at
      `)
      .eq('token', token)
      .is('accepted_at', null) // Only pending invitations
      .single();

    if (error || !data) {
      return { data: null, error: new Error('Invitation not found or already accepted') };
    }

    // Check if invitation has expired
    if (new Date(data.expires_at) < new Date()) {
      return { data: null, error: new Error('Invitation has expired') };
    }

    return { data, error: null };
  },

  // Accept invitation
  async acceptInvitation(token: string, userId: string): Promise<{role: string, profile_slug: string}> {
    // Get invitation details
    const { data: invitation, error: fetchError } = await supabase
      .from('profile_invitations')
      .select('*')
      .eq('token', token)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (fetchError || !invitation) {
      throw new Error('Invalid or expired invitation');
    }

    // Verify the accepting user's email matches the invited email
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (!userData || userData.email !== invitation.invited_email) {
      throw new Error('This invitation was sent to a different email address. Please sign in with the correct account.');
    }

    // Create share
    const { error: shareError } = await supabase
      .from('profile_shares')
      .insert({
        profile_slug: invitation.profile_slug,
        owner_id: invitation.owner_id,
        shared_with_id: userId,
        role: invitation.role
      });

    if (shareError) throw shareError;

    // Mark invitation as accepted
    const { error: acceptError } = await supabase
      .from('profile_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    if (acceptError) throw acceptError;

    return {
      role: invitation.role,
      profile_slug: invitation.profile_slug
    };
  },

  // Cancel invitation
  async cancelInvitation(invitationId: string): Promise<void> {
    const { error } = await supabase
      .from('profile_invitations')
      .delete()
      .eq('id', invitationId);

    if (error) {
      console.error('Error canceling invitation:', error);
      throw new Error('Failed to cancel invitation. Please try again.');
    }
  },

  // Get user's accessible profiles
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

    const owned = (ownedProfiles || []).map(p => ({ profile_slug: p.profile_slug, role: 'admin' }));
    const shared = (sharedProfiles || []).map(p => ({ profile_slug: p.profile_slug, role: p.role }));

    return [...owned, ...shared];
  },

  // Get shared profiles for a user (used by useProfileAccess hook)
  async getSharedProfiles(userId: string): Promise<Array<{profile_slug: string; role: string}>> {
    const { data: sharedProfiles, error } = await supabase
      .from('profile_shares')
      .select('profile_slug, role')
      .eq('shared_with_id', userId);

    return (sharedProfiles || []).map(p => ({ profile_slug: p.profile_slug, role: p.role }));
  },

  // Get user permissions for a specific profile slug
  async getUserPermissions(profileSlug: string, userId: string): Promise<{
    canEdit: boolean;
    canView: boolean;
    canManageShares: boolean;
    canManageInvitations: boolean;
    canSchedule: boolean;
    role: 'owner' | 'editor' | 'viewer';
  }> {
    try {
      // Check if user owns the profile
      const { data: ownerCheck } = await supabase
        .from('users')
        .select('id')
        .eq('profile_slug', profileSlug)
        .eq('id', userId)
        .maybeSingle();

      if (ownerCheck) {
        return {
          canEdit: true,
          canView: true,
          canManageShares: true,
          canManageInvitations: true,
          canSchedule: true,
          role: 'owner'
        };
      }

      // Check if user has shared access
      const { data: shareCheck } = await supabase
        .from('profile_shares')
        .select('role')
        .eq('profile_slug', profileSlug)
        .eq('shared_with_id', userId)
        .maybeSingle();

      if (shareCheck) {
        const isEditor = shareCheck.role === 'editor';
        return {
          canEdit: isEditor,
          canView: true,
          canManageShares: false, // Only owners can manage shares
          canManageInvitations: false, // Only owners can manage invitations
          canSchedule: isEditor,
          role: shareCheck.role as 'editor'
        };
      }

      // No access
      return {
        canEdit: false,
        canView: false,
        canManageShares: false,
        canManageInvitations: false,
        canSchedule: false,
        role: 'viewer'
      };
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return {
        canEdit: false,
        canView: false,
        canManageShares: false,
        canManageInvitations: false,
        canSchedule: false,
        role: 'viewer'
      };
    }
  }
});