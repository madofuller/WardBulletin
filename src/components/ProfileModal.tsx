import { useState, useEffect } from 'react';
import { X, User, Save, Lock, Eye, EyeOff, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
// import ProfileSharingModal from './ProfileSharingModal'; // WIP - commented out
import { useSession } from '../lib/SessionContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onProfileUpdate: () => void;
}

export default function ProfileModal({ isOpen, onClose, user, onProfileUpdate }: ProfileModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [showEmailSection, setShowEmailSection] = useState(false);
  const [emailData, setEmailData] = useState({
    currentPassword: '',
    newEmail: ''
  });
  // const [showSharingModal, setShowSharingModal] = useState(false); // WIP - commented out
  const { profile } = useSession();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowPasswordSection(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowEmailSection(false);
      setEmailData({ currentPassword: '', newEmail: '' });
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.newEmail)) {
      setError(t('modals.pleaseEnterValidEmail'));
      setLoading(false);
      return;
    }

    if (emailData.newEmail.toLowerCase() === user.email.toLowerCase()) {
      setError(t('modals.newEmailMustBeDifferent'));
      setLoading(false);
      return;
    }

    try {
      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: emailData.currentPassword
      });

      if (signInError) {
        setError(t('modals.currentPasswordIncorrect'));
        setLoading(false);
        return;
      }

      // Request email change - Supabase sends confirmation to new email
      const { error: updateError } = await supabase.auth.updateUser({
        email: emailData.newEmail
      });

      if (updateError) throw updateError;

      setSuccess(t('modals.emailConfirmationSent'));
      setEmailData({ currentPassword: '', newEmail: '' });
      setShowEmailSection(false);

      // Call onProfileUpdate callback if provided
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (err: any) {
      setError(err.message || t('modals.failedToUpdateEmail'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (passwordData.newPassword.length < 6) {
      setError(t('validation.newPasswordMustBeAtLeast6Characters'));
      setLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError(t('validation.newPasswordsDoNotMatch'));
      setLoading(false);
      return;
    }

    try {
      // Verify current password by attempting to sign in
      // Note: Supabase doesn't require current password for updateUser,
      // but we verify it for security
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword
      });

      if (signInError) {
        setError(t('modals.currentPasswordIncorrect'));
        setLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(t('modals.passwordUpdatedSuccessfully'));
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordSection(false);

      // Call onProfileUpdate callback if provided
      if (onProfileUpdate) {
        onProfileUpdate();
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || t('modals.failedToUpdatePassword'));
    } finally {
      setLoading(false);
    }
  };

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
          <h3 className="text-2xl font-bold text-gray-900">{t('modals.profileSettings')}</h3>
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
              <p className="text-xs text-gray-500">{t('modals.accountEmail')}</p>
            </div>
          </div>
        </div>

        {/* Change Email Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-medium text-gray-900 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-gray-400" />
              {t('modals.email')}
            </h4>
            {!showEmailSection && (
              <button
                onClick={() => setShowEmailSection(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('modals.changeEmail')}
              </button>
            )}
          </div>

          {showEmailSection && (
            <form onSubmit={handleChangeEmail} className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label htmlFor="emailCurrentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('modals.currentPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    id="emailCurrentPassword"
                    name="currentPassword"
                    value={emailData.currentPassword}
                    onChange={handleEmailInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    placeholder={t('modals.enterCurrentPassword')}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('modals.newEmail')}
                </label>
                <input
                  type="email"
                  id="newEmail"
                  name="newEmail"
                  value={emailData.newEmail}
                  onChange={handleEmailInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('modals.enterNewEmailAddress')}
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('modals.sending')}
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      {t('modals.updateEmail')}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailSection(false);
                    setEmailData({ currentPassword: '', newEmail: '' });
                    setError('');
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Change Password Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-medium text-gray-900 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-gray-400" />
              {t('modals.password')}
            </h4>
            {!showPasswordSection && (
              <button
                onClick={() => setShowPasswordSection(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('modals.changePassword')}
              </button>
            )}
          </div>

          {showPasswordSection && (
            <form onSubmit={handleChangePassword} className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('modals.currentPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    placeholder={t('modals.enterCurrentPassword')}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('modals.newPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    placeholder={t('modals.enterNewPassword')}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('modals.confirmNewPasswordLabel')}
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    placeholder={t('modals.confirmNewPassword')}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('modals.updating')}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {t('modals.updatePassword')}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordSection(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setError('');
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          )}
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

        <div className="flex justify-center pt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            {t('common.close')}
          </button>
        </div>

        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <User className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-medium">{t('modals.aboutYourAccount')}</p>
              <ul className="mt-1 space-y-1">
                <li>• {t('modals.bulletinsAreSavedToYourAccount')}</li>
                <li>• {t('modals.createCustomLinkForQrCode')}</li>
                <li>• {t('modals.accessBulletinsFromAnyDevice')}</li>
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