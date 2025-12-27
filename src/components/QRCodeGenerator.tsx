import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { userService, bulletinService } from '../lib/supabase';
import BulletinSelector from './BulletinSelector';
import { toast } from 'react-toastify';
import { FULL_DOMAIN, SHORT_DOMAIN } from '../lib/config';
import { useSession } from '../lib/SessionContext';
import ShareButton from './ShareButton';
import { useQuery } from '@tanstack/react-query';
import { useProfileAccess, useProfilePermissions } from '../hooks/useProfilePermissions';
import ProfileSharingModal from './ProfileSharingModal';

const LAST_USER_ID = 'last_user_id';

function formatProfileSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface QRCodeGeneratorProps {
  currentActiveBulletinId?: string | null;
  onActiveBulletinSelect?: (bulletinId: string | null) => void;
  onProfileSlugUpdate?: (slug: string) => void;
  onProfileUpdate?: () => void;
  onProfileChange?: (profileSlug: string) => void;
  onCreateProfileSlug?: () => void;
  onLoadBulletin?: (bulletin: any) => void;
  onDeleteBulletin?: (bulletinId: string) => void;
  isOpen?: boolean;
  currentProfileSlug?: string | null;
  bulletinData?: {
    wardName: string;
    date: string;
    meetingType: string;
    theme?: string;
    bishopricMessage?: string;
    announcements?: string[];
    specialEvents?: string[];
  } | null;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  currentActiveBulletinId,
  onActiveBulletinSelect,
  onProfileSlugUpdate,
  onProfileUpdate,
  onProfileChange,
  onCreateProfileSlug,
  onLoadBulletin,
  onDeleteBulletin,
  isOpen,
  currentProfileSlug,
  bulletinData
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [profileSlug, setProfileSlug] = React.useState('');
  const [inputValue, setInputValue] = React.useState(''); // For typing without immediate formatting
  const [isEditing, setIsEditing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [useShortDomain, setUseShortDomain] = React.useState(true);
  const [showSharingModal, setShowSharingModal] = React.useState(false);
  const [selectedProfileSlug, setSelectedProfileSlug] = React.useState<string | null>(null);
  const { user, profile } = useSession();
  const { sharedProfiles, loading: sharedProfilesLoading } = useProfileAccess();
  const { permissions } = useProfilePermissions(currentProfileSlug || profile?.profile_slug || null);

  // Fetch bulletins for the current profile slug (for shared profiles)
  const { data: sharedProfileBulletins = [] } = useQuery({
    queryKey: ['shared-profile-bulletins', currentProfileSlug],
    queryFn: async () => {
      if (!currentProfileSlug || currentProfileSlug === profile?.profile_slug) {
        return [];
      }
      return bulletinService.getBulletinsByProfileSlug(currentProfileSlug);
    },
    enabled: !!currentProfileSlug && currentProfileSlug !== profile?.profile_slug,
    // Keep data in cache during refetches
    gcTime: 5 * 60 * 1000, // 5 minutes
    staleTime: 0
  });

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(LAST_USER_ID, user.id);
    }

    // Always sync to the actual profile slug from backend, not cached local state
    // This ensures we show what's actually in the database
    if (currentProfileSlug) {
      // For shared profiles, always use the current profile slug (this is the owner's slug)
      setSelectedProfileSlug(currentProfileSlug);
      setProfileSlug(currentProfileSlug);
      setInputValue(currentProfileSlug);
    } else if (profile?.profile_slug) {
      // For owner's own profile, use their profile slug from session
      setSelectedProfileSlug(profile.profile_slug);
      setProfileSlug(profile.profile_slug);
      setInputValue(profile.profile_slug);
      localStorage.setItem(`profile_slug_${user?.id || ''}`, profile.profile_slug);
    } else if (sharedProfiles && sharedProfiles.length > 0) {
      // If user has shared profiles but no own profile, use first shared profile
      const firstSharedProfile = sharedProfiles[0];
      setSelectedProfileSlug(firstSharedProfile.profile_slug);
      setProfileSlug(firstSharedProfile.profile_slug);
      setInputValue(firstSharedProfile.profile_slug);
    } else if (!profile) {
      const cached = localStorage.getItem(`profile_slug_${user?.id || localStorage.getItem(LAST_USER_ID) || ''}`);
      if (cached) {
        setSelectedProfileSlug(cached);
        setProfileSlug(cached);
        setInputValue(cached);
      }
    }
  }, [user, profile, currentProfileSlug, sharedProfiles]);

  useEffect(() => {
    generateQRCode();
  }, [profileSlug, useShortDomain, selectedProfileSlug, sharedProfiles]);

  useEffect(() => {
    const id = user?.id || localStorage.getItem(LAST_USER_ID);
    if (id) {
      localStorage.setItem(`profile_slug_${id}`, profileSlug);
    }
  }, [profileSlug, user]);

  const generateQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const domain = useShortDomain ? SHORT_DOMAIN : FULL_DOMAIN;
    const baseUrl = `https://${domain}`;

    // Use selected profile slug (prioritize selectedProfileSlug over local state)
    // For shared users without own profile, fall back to first shared profile
    const activeProfileSlug = selectedProfileSlug || profileSlug || (sharedProfiles.length > 0 ? sharedProfiles[0].profile_slug : null);
    // Add cache-busting parameter to prevent mobile browser caching
    const timestamp = Date.now();
    const qrData = activeProfileSlug
      ? `${baseUrl}/${activeProfileSlug}?t=${timestamp}`
      : `${baseUrl}/your-profile-slug?t=${timestamp}`;
    
    QRCode.toCanvas(canvas, qrData, {
      width: 300, // Increased size for better mobile scanning
      margin: 4, // Increased margin for better contrast
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H' // Highest error correction for better mobile scanning
    }, (error) => {
      if (error) {
        // Fallback to simple text display
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 200, 200);
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, 200, 200);
          ctx.fillStyle = 'black';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('QR Code Error', 100, 100);
        }
      }
    });
  };

  const handleSaveProfileSlug = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    // Check if user has permission to edit (must be owner, not viewer/editor of shared profile)
    if (!permissions.canEdit || (currentProfileSlug && currentProfileSlug !== profile?.profile_slug)) {
      setError('Only the profile owner can change the profile slug');
      toast.error('Only the profile owner can change the profile slug');
      setIsEditing(false);
      // Revert to actual profile slug
      const actualSlug = profile?.profile_slug || currentProfileSlug || profileSlug;
      setInputValue(actualSlug);
      setProfileSlug(actualSlug);
      return;
    }

    const sanitized = formatProfileSlug(inputValue);
    if (!sanitized) {
      setError('Profile slug cannot be empty');
      return;
    }
    setProfileSlug(sanitized);
    setInputValue(sanitized);

    setLoading(true);
    setError('');

    try {
      await userService.updateProfileSlug(user.id, sanitized);

      // Refresh profile slug from backend to ensure we show what's actually saved
      const refreshed = await userService.getUserProfile(user.id);
      if (refreshed && refreshed.length > 0) {
        const actualSlug = refreshed[0].profile_slug || '';
        setProfileSlug(actualSlug);
        setInputValue(actualSlug);
        setSelectedProfileSlug(actualSlug);
        if (onProfileSlugUpdate) {
          onProfileSlugUpdate(actualSlug);
        }
      }

      setIsEditing(false);
      toast.success('Profile slug updated successfully!');

      // Notify parent component that profile was updated
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update profile slug');
      // Revert input to current profile slug
      const currentSlug = profile?.profile_slug || profileSlug;
      setInputValue(currentSlug);
      setProfileSlug(currentSlug);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (profile?.profile_slug) {
      setProfileSlug(profile.profile_slug);
    }
  };

  const downloadQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const activeProfileSlug = selectedProfileSlug || profileSlug;
    const link = document.createElement('a');
    link.download = `${activeProfileSlug || 'mywardbulletin'}-qr.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const getPermanentUrl = (short = false) => {
    const domain = short ? SHORT_DOMAIN : FULL_DOMAIN;
    const baseUrl = `https://${domain}`;
    return profileSlug ? `${baseUrl}/${profileSlug}` : '';
  };

  const handleCopyUrl = async (short = false) => {
    const url = getPermanentUrl(short);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy URL to clipboard');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
          {/* Profile & QR Code Section */}
          {(profile?.profile_slug || sharedProfiles.length > 0) && user && (
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile & QR Code</h3>

          {/* Profile Selector */}
          {(profile?.profile_slug || sharedProfiles.length > 0) && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Active Profile</label>
              {sharedProfilesLoading ? (
                <div className="px-3 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg">Loading profiles...</div>
              ) : (
                <>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                    value={selectedProfileSlug || ''}
                    onChange={(e) => {
                      if (e.target.value === 'create-profile-slug') {
                        if (onCreateProfileSlug) {
                          onCreateProfileSlug();
                        }
                      } else if (e.target.value && onProfileChange) {
                        setSelectedProfileSlug(e.target.value);
                        onProfileChange(e.target.value);
                      }
                    }}
                  >
                    {profile?.profile_slug && (
                      <option value={profile.profile_slug}>
                        {profile.profile_slug} (My Profile - Owner)
                      </option>
                    )}
                    {sharedProfiles.map((sharedProfile) => (
                      <option key={sharedProfile.profile_slug} value={sharedProfile.profile_slug}>
                        {sharedProfile.profile_slug} (Shared - {sharedProfile.role})
                      </option>
                    ))}
                    {!profile?.profile_slug && sharedProfiles.length === 0 && (
                      <option value="" disabled>
                        No profiles available
                      </option>
                    )}
                    {!profile?.profile_slug && (
                      <option value="create-profile-slug">
                        + Create My Profile
                      </option>
                    )}
                  </select>

                  <p className="text-xs text-gray-500 mt-2">
                    Switch between your profile and shared profiles you have access to
                  </p>
                </>
              )}
            </div>
          )}

          {/* QR Code Display */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">QR Code</label>
            <div className="text-center">
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="border-2 border-gray-200 rounded-xl mx-auto shadow-sm max-w-full h-auto"
              />
              {/* Display profile information below QR code */}
              <div className="mt-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  Profile: {selectedProfileSlug || profileSlug || (sharedProfiles.length > 0 ? sharedProfiles[0].profile_slug : 'Not set')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  URL: https://{useShortDomain ? SHORT_DOMAIN : FULL_DOMAIN}/{selectedProfileSlug || profileSlug || (sharedProfiles.length > 0 ? sharedProfiles[0].profile_slug : 'your-profile-slug')}
                </p>
              </div>
            </div>
          </div>

          {/* Custom Link Management */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Link</label>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  const value = e.target.value;
                  // Convert spaces to hyphens in real-time
                  const withHyphens = value.replace(/\s+/g, '-');
                  setInputValue(withHyphens);
                }}
                onBlur={(e) => {
                  const formatted = formatProfileSlug(e.target.value);
                  setInputValue(formatted);
                  setProfileSlug(formatted);
                }}
                placeholder="e.g., sunset-hills-ward"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
              />
              <p className="text-xs text-gray-500 mt-2">
                Allowed: letters, numbers, hyphens and underscores. Spaces will be replaced with hyphens.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveProfileSlug}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-sm font-medium text-gray-900">
                  {selectedProfileSlug || profileSlug || (sharedProfiles.length > 0 ? sharedProfiles[0].profile_slug : 'Not set')}
                </span>
              </div>
              {permissions.canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-3 bg-gray-600 text-white rounded-full text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Domain:</label>
              <select
                value={useShortDomain ? 'short' : 'full'}
                onChange={(e) => setUseShortDomain(e.target.value === 'short')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-full sm:w-auto"
              >
                <option value="full">{FULL_DOMAIN}</option>
                <option value="short">{SHORT_DOMAIN}</option>
              </select>
            </div>

            {/* URL Actions */}
            {(selectedProfileSlug || profileSlug) && (
              <div className="space-y-3 pt-4 border-t border-gray-200">
                {/* Share Profile Access - Only for owners */}
                {/* WIP - commented out
                {permissions.canManageShares && (
                  <button
                    onClick={() => setShowSharingModal(true)}
                    className="w-full px-4 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors"
                  >
                    👥 Share Profile Access
                  </button>
                )}
                */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={downloadQRCode}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
                  >
                    Download QR Code
                  </button>

                  <button
                    onClick={() => {
                      const activeProfileSlug = selectedProfileSlug || profileSlug;
                      const shareUrl = `https://${useShortDomain ? SHORT_DOMAIN : FULL_DOMAIN}/${activeProfileSlug}`;
                      if (navigator.share) {
                        navigator.share({
                          title: 'Ward Bulletin',
                          text: 'Check out our ward bulletin!',
                          url: shareUrl
                        });
                      } else {
                        navigator.clipboard.writeText(shareUrl);
                        toast.success('Share link copied to clipboard!');
                      }
                    }}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors"
                  >
                    Share
                  </button>

                  <button
                    onClick={() => {
                      const activeProfileSlug = selectedProfileSlug || profileSlug;
                      const shareUrl = `https://${useShortDomain ? SHORT_DOMAIN : FULL_DOMAIN}/${activeProfileSlug}`;
                      navigator.clipboard.writeText(shareUrl);
                      toast.success('Share link copied to clipboard!');
                    }}
                    className="w-full px-4 py-3 bg-orange-600 text-white rounded-full font-medium hover:bg-orange-700 transition-colors"
                  >
                    Copy Link
                  </button>

                  <button
                    onClick={() => {
                      const activeProfileSlug = selectedProfileSlug || profileSlug;
                      const submissionsUrl = `https://${useShortDomain ? SHORT_DOMAIN : FULL_DOMAIN}/submit/${activeProfileSlug}`;
                      navigator.clipboard.writeText(submissionsUrl);
                      toast.success('Submissions link copied to clipboard!');
                    }}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors"
                  >
                    Copy Submissions Link
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-100 mb-4 sm:mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• Print this QR code and place it on physical bulletins</p>
          <p>• Members can scan to access your latest digital bulletin</p>
          <p>• QR code stays the same - just update your bulletins</p>
          <p className="flex items-center gap-2 mt-3 pt-3 border-t border-blue-200">
            <span className="text-yellow-600">💡</span>
            <span><strong>Mobile tip:</strong> Ensure good lighting and hold phone steady when scanning</span>
          </p>
        </div>
      </div>
      
      {/* Bulletin Selector */}
          {onActiveBulletinSelect && user && (
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <BulletinSelector
            user={user}
            currentActiveBulletinId={currentActiveBulletinId || undefined}
            onBulletinSelect={onActiveBulletinSelect}
            showScheduling={true}
            bulletins={sharedProfileBulletins.length > 0 ? sharedProfileBulletins : undefined}
            onLoadBulletin={onLoadBulletin}
            onDeleteBulletin={onDeleteBulletin}
            profileSlug={currentProfileSlug || undefined}
            permissions={permissions}
            onClose={() => {
              // Close the QR modal when Monthly Schedule is clicked
              if (typeof onActiveBulletinSelect === 'function') {
                onActiveBulletinSelect(null);
              }
            }}
            onFixInconsistency={async () => {
              if (!user) return;
              try {
                // Clear the active bulletin ID to force a fresh selection
                await userService.updateActiveBulletinId(user.id, null);
                onActiveBulletinSelect(null);
                toast.success('Data inconsistency fixed. Please select a bulletin.');
              } catch (error) {
                toast.error('Failed to fix inconsistency: ' + (error as Error).message);
              }
            }}
          />
        </div>
      )}

      {/* Profile Sharing Modal */}
      {showSharingModal && (selectedProfileSlug || profileSlug) && (
        <ProfileSharingModal
          isOpen={showSharingModal}
          onClose={() => setShowSharingModal(false)}
          profileSlug={selectedProfileSlug || profileSlug}
        />
      )}
    </div>
  );
}

export default QRCodeGenerator;
