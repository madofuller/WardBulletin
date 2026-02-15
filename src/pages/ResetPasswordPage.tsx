import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Allow password reset if we have a recovery hash (URL or stored) or an existing session
    const checkSession = async () => {
      const hash = window.location.hash;
      const storedHash = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('password_recovery_hash') : null;
      const hasRecoveryHash = hash.includes('type=recovery') || hash.includes('access_token=') ||
        (storedHash && (storedHash.includes('type=recovery') || storedHash.includes('access_token=')));

      const { data: { session } } = await supabase.auth.getSession();

      if (hasRecoveryHash) {
        setIsRecoveryMode(true);
        try {
          sessionStorage.removeItem('password_recovery_hash');
        } catch (_) {}
      } else if (session) {
        // Logged in (e.g. recovery link already processed, or user opened this page while signed in)
        // Still show the form so they can set a new password
        setIsRecoveryMode(true);
      } else {
        setError(t('resetPassword.invalidResetLink'));
      }
    };
    checkSession();
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t('resetPassword.passwordsDoNotMatch'));
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError(t('resetPassword.passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      setSuccess(true);

      // Sign out so user must sign in with the new password (confirms the change worked)
      await supabase.auth.signOut();

      // Redirect to home so they can sign in with their new password
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2500);
    } catch (error: any) {
      setError(error.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t('resetPassword.backToHome')}
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('resetPassword.title')}</h1>
          <p className="text-gray-600">{t('resetPassword.enterNewPassword')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success ? (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-center font-medium">
              {t('resetPassword.passwordUpdatedRedirecting')}
            </p>
            <p className="text-green-600 text-center text-sm mt-2">
              {t('resetPassword.signInWithNewPassword')}
            </p>
          </div>
        ) : isRecoveryMode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('resetPassword.newPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  disabled={loading || !!error}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('resetPassword.passwordTooShort')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('resetPassword.confirmNewPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  disabled={loading || !!error}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !!error}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('resetPassword.updating') : t('resetPassword.updatePassword')}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
