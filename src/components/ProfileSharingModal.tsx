import React, { useState, useEffect } from 'react';
import { Users, Mail, Plus, Trash2, Edit, Eye, Crown, X, Copy, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { profileSharingService } from '../lib/supabase';
import { ProfileShare, ProfileInvitation } from '../lib/profileSharingService';
import { useSession } from '../lib/SessionContext';

interface ProfileSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileSlug: string;
}

export default function ProfileSharingModal({
  isOpen,
  onClose,
  profileSlug
}: ProfileSharingModalProps) {
  const { user } = useSession();
  const [shares, setShares] = useState<ProfileShare[]>([]);
  const [invitations, setInvitations] = useState<ProfileInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && profileSlug) {
      loadSharesAndInvitations();
    }
  }, [isOpen, profileSlug]);

  const loadSharesAndInvitations = async () => {
    setLoading(true);
    try {
      const { shares: sharesData, invitations: invitationsData } =
        await profileSharingService.getProfileSharesAndInvitations(profileSlug);
      setShares(sharesData);
      setInvitations(invitationsData);
    } catch (error: any) {
      toast.error('Failed to load sharing data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail || !user) return;

    try {
      const token = await profileSharingService.inviteUser(profileSlug, user.id, inviteEmail, inviteRole);
      
      // Create invitation link
      const invitationLink = `${window.location.origin}/invite/${token}`;
      
      toast.success(`Invitation sent to ${inviteEmail}! They should receive an email shortly.`);
      setInviteEmail('');
      setShowInviteForm(false);
      loadSharesAndInvitations();
    } catch (error: any) {
      toast.error('Failed to send invitation: ' + error.message);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      await profileSharingService.removeShare(shareId);
      toast.success('User removed from profile');
      loadSharesAndInvitations();
    } catch (error: any) {
      toast.error('Failed to remove user: ' + error.message);
    }
  };

  const handleUpdateRole = async (shareId: string, newRole: 'editor' | 'viewer') => {
    try {
      await profileSharingService.updateShareRole(shareId, newRole);
      toast.success('Role updated');
      loadSharesAndInvitations();
    } catch (error: any) {
      toast.error('Failed to update role: ' + error.message);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await profileSharingService.cancelInvitation(invitationId);
      toast.success('Invitation cancelled');
      loadSharesAndInvitations();
    } catch (error: any) {
      toast.error('Failed to cancel invitation: ' + error.message);
    }
  };

  const copyInvitationLink = async (token: string) => {
    const link = `${window.location.origin}/invite/${token}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
      toast.success('Invitation link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'editor': return <Edit className="w-4 h-4 text-blue-500" />;
      case 'viewer': return <Eye className="w-4 h-4 text-gray-500" />;
      default: return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Share Profile: {profileSlug}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Shares */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Current Access ({shares.length})
                </h3>
                <div className="space-y-2">
                  {shares.map((share) => (
                    <div key={share.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getRoleIcon(share.role)}
                        <div>
                          <div className="font-medium text-sm">
                            {share.shared_user?.email || 'Unknown User'}
                          </div>
                          <span className={`px-2 py-1 text-xs rounded ${getRoleColor(share.role)}`}>
                            {share.role}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {share.role !== 'owner' && (
                          <>
                            <button
                              onClick={() => handleRemoveShare(share.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Invitations */}
              {invitations.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Pending Invitations ({invitations.length})
                  </h3>
                  <div className="space-y-2">
                    {invitations.map((invitation) => (
                      <div key={invitation.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-4 h-4 text-blue-500" />
                          <div>
                            <div className="font-medium text-sm">{invitation.invited_email}</div>
                            <span className={`px-2 py-1 text-xs rounded ${getRoleColor(invitation.role)}`}>
                              {invitation.role}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => copyInvitationLink(invitation.token)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            {copiedToken === invitation.token ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCancelInvitation(invitation.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invite New User */}
              {!showInviteForm ? (
                <button
                  onClick={() => setShowInviteForm(true)}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-500 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Invite New User
                </button>
              ) : (
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-3">Invite New User</h4>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="editor">Editor - Can create and edit bulletins</option>
                      <option value="viewer">Viewer - Can only view bulletins</option>
                    </select>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleInviteUser}
                        disabled={!inviteEmail}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Send Invitation
                      </button>
                      <button
                        onClick={() => setShowInviteForm(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}