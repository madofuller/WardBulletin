import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, CheckCircle, AlertCircle, Crown, Edit, Eye, LogIn, User } from 'lucide-react';
import { useSession } from '../lib/SessionContext';
import { supabase, profileSharingService } from '../lib/supabase';
import { toast } from 'react-toastify';
import Logo from '../components/Logo';

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useSession();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  useEffect(() => {
    if (token) {
      loadInvitation();
    }
  }, [token]);

  // Handle return from authentication
  useEffect(() => {
    if (user && invitation && !accepting && token) {
      // User just signed in, automatically accept the invitation
      console.log('Auto-accepting invitation for user:', user.email);
      handleAcceptInvitation();
    }
  }, [user, invitation, accepting, token]);

  const loadInvitation = async () => {
    if (!token) return;

    try {
      // Fetch invitation details directly from Supabase
      const { data: invitation, error } = await profileSharingService.getInvitationByToken(token);

      if (error || !invitation) {
        throw new Error('Invalid invitation or invitation not found');
      }

      setInvitation(invitation);
      
      // Check if the invited email exists in the database
      await checkEmailExists(invitation.invited_email);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkEmailExists = async (email: string) => {
    setCheckingEmail(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.warn('Error checking email:', error);
        setEmailExists(false); // Default to false if error
      } else {
        setEmailExists(!!data);
      }
    } catch (error) {
      console.warn('Error checking email:', error);
      setEmailExists(false);
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!user || !token) {
      toast.error('Please sign in to accept the invitation');
      return;
    }

    setAccepting(true);
    try {
      const result = await profileSharingService.acceptInvitation(token, user.id);
      toast.success(`You now have ${result.role} access to ${result.profile_slug}`);

      navigate('/', { replace: true });
    } catch (error: any) {
      toast.error('Failed to accept invitation: ' + error.message);
    } finally {
      setAccepting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-6 h-6 text-yellow-600" />;
      case 'editor': return <Edit className="w-6 h-6 text-blue-600" />;
      case 'viewer': return <Eye className="w-6 h-6 text-gray-600" />;
      default: return <UserPlus className="w-6 h-6 text-gray-600" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'editor':
        return 'You can create, edit, and schedule bulletins for this profile.';
      case 'viewer':
        return 'You can view bulletins and public content for this profile.';
      default:
        return 'You will have access to this profile.';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-xl p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Invalid Invitation</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <Logo className="mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900">You're Invited!</h1>
          </div>

          {/* Invitation Details */}
          <div className="text-center mb-6">
            <div className="mb-4">
              {getRoleIcon(invitation?.role)}
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Profile: {invitation?.profile_slug}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              You've been invited as a <span className="font-medium">{invitation?.role}</span>
            </p>
            <p className="text-sm text-gray-500">
              {getRoleDescription(invitation?.role)}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {user ? (
              <>
                <button
                  onClick={handleAcceptInvitation}
                  disabled={accepting}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {accepting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  {accepting ? 'Accepting...' : 'Accept Invitation'}
                </button>
                <div className="text-center text-xs text-gray-500">
                  Signed in as {user.email}
                </div>
              </>
            ) : (
              <div className="text-center">
                {checkingEmail ? (
                  <div className="flex items-center justify-center mb-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <p className="text-sm text-gray-600">Checking account...</p>
                  </div>
                ) : emailExists ? (
                  <>
                    <p className="text-sm text-gray-600 mb-4">
                      You have an existing account. Please sign in to accept this invitation.
                    </p>
                    <button
                      onClick={() => navigate('/', { state: { showAuth: true, returnTo: `/invite/${token}` } })}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In to Accept
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-4">
                      Create an account with your invited email to accept this invitation.
                    </p>
                    <button
                      onClick={() => navigate('/', { 
                        state: { 
                          showAuth: true, 
                          mode: 'signup',
                          prefillEmail: invitation?.invited_email,
                          returnTo: `/invite/${token}` 
                        } 
                      })}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Create Account & Accept
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Expiration Info */}
          {invitation?.expires_at && (
            <div className="mt-4 text-center text-xs text-gray-500">
              Expires on {new Date(invitation.expires_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}