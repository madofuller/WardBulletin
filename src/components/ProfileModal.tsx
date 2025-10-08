import React, { useState, useEffect } from 'react';
import { X, User, Save, UserPlus } from 'lucide-react';
import { isSupabaseConfigured, supabase, userService } from '../lib/supabase';
// import ProfileSharingModal from './ProfileSharingModal'; // WIP - commented out
import { useSession } from '../lib/SessionContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onProfileUpdate: () => void;
}

export default function ProfileModal({ isOpen, onClose, user, onProfileUpdate }: ProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // const [showSharingModal, setShowSharingModal] = useState(false); // WIP - commented out
  const { profile } = useSession();
  // Remove: wardSettings state, useEffect fetching, handleChange, handleSave logic for wardSettings, and the form fields for ward settings.
  // Restore the modal to its previous state with only the account email and info text.

  // useEffect(() => {
  //   if (isOpen && isSupabaseConfigured() && user) {
  //     setLoading(true);
  //     userService.getWardSettings(user.id)
  //       .then((data) => {
  //         if (data) setWardSettings({
  //           ward_name: data.ward_name || '',
  //           default_presiding: data.default_presiding || '',
  //           default_conducting: data.default_conducting || '',
  //           default_chorister: data.default_chorister || '',
  //           default_organist: data.default_organist || ''
  //         });
  //       })
  //       .catch(() => {})
  //       .finally(() => setLoading(false));
  //   }
  // }, [isOpen, user]);

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setWardSettings({ ...wardSettings, [e.target.name]: e.target.value });
  // };

  // const handleSave = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError('');
  //   setSuccess('');
  //   try {
  //     await userService.updateWardSettings(user.id, wardSettings);
  //     setSuccess('Ward settings updated successfully!');
  //     onProfileUpdate();
  //     setTimeout(() => {
  //       onClose();
  //     }, 1500);
  //   } catch (error: any) {
  //     setError('Failed to update ward settings: ' + error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Profile Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.email}</p>
              <p className="text-xs text-gray-500">Account Email</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        {/* Remove: wardSettings state, useEffect fetching, handleChange, handleSave logic for wardSettings, and the form fields for ward settings. */}
        {/* Restore the modal to its previous state with only the account email and info text. */}

        {/* Profile Sharing Section */}
        {/* WIP - commented out
        {profile?.profile_slug && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Profile Sharing</h4>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-3">
                Share your profile "{profile.profile_slug}" with other users to collaborate on bulletins.
              </p>
              <button
                onClick={() => setShowSharingModal(true)}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Manage Profile Sharing
              </button>
            </div>
          </div>
        )}
        */}

        <div className="text-center py-4">
          <p className="text-gray-600 mb-2">Additional profile settings will be available here soon.</p>
          <p className="text-sm text-gray-500">For now, you can manage your custom link in the QR Code section.</p>
        </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            Close
          </button>
        </div>

        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <User className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-medium">About Your Account</p>
              <ul className="mt-1 space-y-1">
                <li>• Your bulletins are saved to your account</li>
                <li>• Create a custom link for your permanent QR code</li>
                <li>• Access your bulletins from any device</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Sharing Modal */}
      {/* WIP - commented out
      {profile?.profile_slug && (
        <ProfileSharingModal
          isOpen={showSharingModal}
          onClose={() => setShowSharingModal(false)}
          profileSlug={profile.profile_slug}
        />
      )}
      */}
    </div>
  );
}