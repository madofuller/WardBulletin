import type { SupabaseClient } from '@supabase/supabase-js';
import { FULL_DOMAIN } from './config';

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
    // Check if user owns the profile directly
    const { data: ownerCheck } = await supabase
      .from('users')
      .select('id')
      .eq('profile_slug', profileSlug)
      .eq('id', userId)
      .maybeSingle();

    if (ownerCheck) return true;

    // Check if user is shared with via profile_shares
    const { data: shareCheck } = await supabase
      .from('profile_shares')
      .select('id')
      .eq('profile_slug', profileSlug)
      .eq('shared_with_id', userId)
      .maybeSingle();

    if (shareCheck) return true;

    // Check if user has access via organization membership
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('profile_slug', profileSlug)
      .maybeSingle();

    if (org) {
      const { data: orgMemberCheck } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', org.id)
        .eq('user_id', userId)
        .maybeSingle();

      if (orgMemberCheck) return true;
    }

    return false;
  },

  // Get user's role for a profile
  async getUserProfileRole(profileSlug: string, userId: string): Promise<'owner' | 'editor' | 'viewer' | null> {
    // Check if user owns the profile directly
    const { data: ownerCheck } = await supabase
      .from('users')
      .select('id')
      .eq('profile_slug', profileSlug)
      .eq('id', userId)
      .maybeSingle();

    if (ownerCheck) return 'owner';

    // Check if user is shared with via profile_shares
    const { data: shareCheck } = await supabase
      .from('profile_shares')
      .select('role')
      .eq('profile_slug', profileSlug)
      .eq('shared_with_id', userId)
      .maybeSingle();

    if (shareCheck) return shareCheck.role as 'owner' | 'editor' | 'viewer';

    // Check if user has access via organization membership
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('profile_slug', profileSlug)
      .maybeSingle();

    if (org) {
      const { data: orgMemberCheck } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', org.id)
        .eq('user_id', userId)
        .maybeSingle();

      if (orgMemberCheck) return orgMemberCheck.role as 'owner' | 'editor' | 'viewer';
    }

    return null;
  },

  // Share profile with another user
  async shareProfile(profileSlug: string, ownerId: string, sharedWithId: string, role: 'editor' | 'viewer'): Promise<void> {
    // SECURITY: Validate that ownerId actually owns this profile_slug
    const { data: ownerCheck } = await supabase
      .from('users')
      .select('id')
      .eq('profile_slug', profileSlug)
      .eq('id', ownerId)
      .maybeSingle();

    if (!ownerCheck) {
      // Also check if they're an organization owner
      const { data: orgCheck } = await supabase
        .from('organizations')
        .select('id')
        .eq('profile_slug', profileSlug)
        .single();

      if (orgCheck) {
        const { data: orgMemberCheck } = await supabase
          .from('organization_members')
          .select('role')
          .eq('organization_id', orgCheck.id)
          .eq('user_id', ownerId)
          .eq('role', 'owner')
          .maybeSingle();

        if (!orgMemberCheck) {
          throw new Error('You do not have permission to share this profile.');
        }
      } else {
        throw new Error('You do not have permission to share this profile.');
      }
    }

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
    // First get the share details so we can clean up invitations
    const { data: share, error: fetchError } = await supabase
      .from('profile_shares')
      .select('shared_with_id, profile_slug')
      .eq('id', shareId)
      .single();

    if (fetchError) {
      console.error('Error fetching share:', fetchError);
      throw new Error('Failed to find user access. Please try again.');
    }

    // Delete the share
    const { error } = await supabase
      .from('profile_shares')
      .delete()
      .eq('id', shareId);

    if (error) {
      console.error('Error removing share:', error);
      throw new Error('Failed to remove user access. Please try again.');
    }

    // Also delete ALL invitations (both pending and accepted) for this user/profile combination
    // This allows them to be re-invited if needed
    if (share) {
      const { data: user } = await supabase
        .from('users')
        .select('email')
        .eq('id', share.shared_with_id)
        .single();

      if (user?.email) {
        // Delete all invitations (pending and accepted) to allow re-inviting
        await supabase
          .from('profile_invitations')
          .delete()
          .eq('profile_slug', share.profile_slug)
          .eq('invited_email', user.email);
      }
    }
  },

  // Invite user by email
  async inviteUser(profileSlug: string, ownerId: string, email: string, role: 'editor' | 'viewer'): Promise<string> {
    // First, delete ANY existing invitations for this email/profile to allow re-inviting
    // This handles cases where user was removed and being re-invited
    await supabase
      .from('profile_invitations')
      .delete()
      .eq('profile_slug', profileSlug)
      .eq('invited_email', email);

    // Now create a fresh invitation
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
      console.error('Error creating invitation:', error);
      throw new Error('Failed to create invitation. Please try again.');
    }

    // Always send invitation email
    try {
      await this.sendInvitationEmail({
        invitedEmail: email,
        profileSlug,
        invitationLink: `https://${FULL_DOMAIN}/invite/${token}`,
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
      console.error('Error fetching invitation:', fetchError);
      throw new Error('Invalid or expired invitation');
    }

    // Verify the accepting user's email matches the invited email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      throw new Error('Failed to verify user account');
    }

    // Compare emails case-insensitively (matching UI behavior)
    const userEmail = userData.email?.toLowerCase().trim();
    const invitedEmail = invitation.invited_email?.toLowerCase().trim();
    
    if (userEmail !== invitedEmail) {
      throw new Error('This invitation was sent to a different email address. Please sign in with the correct account.');
    }

    // Use upsert to handle race conditions - this atomically creates or updates
    const { data: newShare, error: shareError } = await supabase
      .from('profile_shares')
      .upsert({
        profile_slug: invitation.profile_slug,
        owner_id: invitation.owner_id,
        shared_with_id: userId,
        role: invitation.role
      }, {
        onConflict: 'profile_slug,shared_with_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (shareError) {
      console.error('Error upserting share:', shareError);
      // If it's still a duplicate key error after upsert, share already exists
      if (shareError.code === '23505') {
        console.log('Share already exists, marking invitation as accepted');
      } else {
        throw new Error(`Failed to create profile access: ${shareError.message}`);
      }
    } else {
      console.log('Successfully created/updated share:', newShare);
    }

    // Mark invitation as accepted
    const { error: acceptError } = await supabase
      .from('profile_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    if (acceptError) {
      console.error('Error marking invitation as accepted:', acceptError);
      throw new Error('Failed to mark invitation as accepted');
    }

    console.log('Successfully accepted invitation:', {
      profile_slug: invitation.profile_slug,
      role: invitation.role,
      userId
    });

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
    // Get owned profiles (direct ownership)
    const { data: ownedProfiles } = await supabase
      .from('users')
      .select('profile_slug')
      .eq('id', userId)
      .not('profile_slug', 'is', null);

    // Get shared profiles via profile_shares
    const { data: sharedProfiles } = await supabase
      .from('profile_shares')
      .select('profile_slug, role')
      .eq('shared_with_id', userId);

    // Get profiles via organization membership
    const { data: orgProfiles = [] } = await supabase
      .from('organization_members')
      .select(`
        role,
        organization:organization_id (
          profile_slug
        )
      `)
      .eq('user_id', userId);

    const owned = (ownedProfiles || []).map(p => ({ profile_slug: p.profile_slug, role: 'owner' }));
    const shared = (sharedProfiles || []).map(p => ({ profile_slug: p.profile_slug, role: p.role }));
    const orgAccess = (orgProfiles || [])
      .filter(p => p.organization?.profile_slug)
      .map(p => ({ profile_slug: p.organization.profile_slug, role: p.role }));

    // Combine and deduplicate (prefer higher role if duplicate)
    const profileMap = new Map<string, string>();
    
    [...owned, ...shared, ...orgAccess].forEach(p => {
      const existing = profileMap.get(p.profile_slug);
      if (!existing || (p.role === 'owner' && existing !== 'owner')) {
        profileMap.set(p.profile_slug, p.role);
      }
    });

    return Array.from(profileMap.entries()).map(([profile_slug, role]) => ({ profile_slug, role }));
  },

  // Get shared profiles for a user (used by useProfileAccess hook)
  async getSharedProfiles(userId: string): Promise<Array<{profile_slug: string; role: string}>> {
    // Get shared profiles via profile_shares
    const { data: sharedProfiles } = await supabase
      .from('profile_shares')
      .select('profile_slug, role')
      .eq('shared_with_id', userId);

    // Get profiles via organization membership
    const { data: orgProfiles = [] } = await supabase
      .from('organization_members')
      .select(`
        role,
        organization:organization_id (
          profile_slug
        )
      `)
      .eq('user_id', userId);

    const shared = (sharedProfiles || []).map(p => ({ profile_slug: p.profile_slug, role: p.role }));
    const orgAccess = (orgProfiles || [])
      .filter(p => p.organization?.profile_slug)
      .map(p => ({ profile_slug: p.organization.profile_slug, role: p.role }));

    // Combine and deduplicate
    const profileMap = new Map<string, string>();
    
    [...shared, ...orgAccess].forEach(p => {
      const existing = profileMap.get(p.profile_slug);
      if (!existing || (p.role === 'owner' && existing !== 'owner')) {
        profileMap.set(p.profile_slug, p.role);
      }
    });

    return Array.from(profileMap.entries()).map(([profile_slug, role]) => ({ profile_slug, role }));
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
      // Check if user owns the profile directly
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

      // Check if user has shared access via profile_shares
      const { data: shareCheck } = await supabase
        .from('profile_shares')
        .select('role')
        .eq('profile_slug', profileSlug)
        .eq('shared_with_id', userId)
        .maybeSingle();

      if (shareCheck) {
        const isEditor = shareCheck.role === 'editor' || shareCheck.role === 'owner';
        return {
          canEdit: isEditor,
          canView: true,
          canManageShares: shareCheck.role === 'owner', // Owners can manage shares
          canManageInvitations: shareCheck.role === 'owner', // Owners can manage invitations
          canSchedule: isEditor,
          role: shareCheck.role as 'owner' | 'editor' | 'viewer'
        };
      }

      // Check if user has access via organization membership
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('profile_slug', profileSlug)
        .maybeSingle();

      if (org) {
        const { data: orgMemberCheck } = await supabase
          .from('organization_members')
          .select('role')
          .eq('organization_id', org.id)
          .eq('user_id', userId)
          .maybeSingle();

        if (orgMemberCheck) {
          const isEditor = orgMemberCheck.role === 'editor' || orgMemberCheck.role === 'owner';
          return {
            canEdit: isEditor,
            canView: true,
            canManageShares: orgMemberCheck.role === 'owner', // Only org owners can manage shares
            canManageInvitations: orgMemberCheck.role === 'owner', // Only org owners can manage invitations
            canSchedule: isEditor,
            role: orgMemberCheck.role as 'owner' | 'editor' | 'viewer'
          };
        }
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