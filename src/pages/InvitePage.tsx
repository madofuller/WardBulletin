import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, CheckCircle, AlertCircle, Crown, Edit, Eye, LogIn, User } from 'lucide-react';
import { useSession } from '../lib/SessionContext';
import { supabase, profileSharingService } from '../lib/supabase';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import Logo from '../components/Logo';

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailMismatch, setEmailMismatch] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (token) {
      loadInvitation();
    }
  }, [token]);

  // Check if signed-in user's email matches invitation email
  useEffect(() => {
    if (user && invitation) {
      const userEmail = user.email?.toLowerCase().trim();
      const invitedEmail = invitation.invited_email?.toLowerCase().trim();
      
      if (userEmail !== invitedEmail) {
        // Email mismatch - user is signed in with wrong account
        setEmailMismatch(true);
      } else {
        // Emails match - clear mismatch state
        setEmailMismatch(false);
      }
    }
  }, [user, invitation]);

  // Handle return from authentication - only auto-accept if emails match
  useEffect(() => {
    if (user && invitation && !accepting && token && !emailMismatch) {
      // Verify email matches before auto-accepting
      const userEmail = user.email?.toLowerCase().trim();
      const invitedEmail = invitation.invited_email?.toLowerCase().trim();
      
      if (userEmail === invitedEmail) {
        // User just signed in with correct email, automatically accept the invitation
        console.log('Auto-accepting invitation for user:', user.email);
        handleAcceptInvitation();
      }
    }
  }, [user, invitation, accepting, token, emailMismatch]);

  const loadInvitation = async () => {
    if (!token) return;

    try {
      // Fetch invitation details directly from Supabase
      const { data: invitation, error } = await profileSharingService.getInvitationByToken(token);

      if (error || !invitation) {
        // Check if it's an expiration error specifically
        if (error?.message?.includes('expired')) {
          throw new Error('This invitation has expired. Please contact the profile owner to request a new invitation.');
        }
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

    // Double-check email match before accepting
    const userEmail = user.email?.toLowerCase().trim();
    const invitedEmail = invitation?.invited_email?.toLowerCase().trim();
    
    if (userEmail !== invitedEmail) {
      setEmailMismatch(true);
      toast.error('This invitation was sent to a different email address. Please sign in with the correct account.');
      return;
    }

    setAccepting(true);
    setError('');
    try {
      console.log('Accepting invitation:', { token, userId: user.id, email: user.email });
      const result = await profileSharingService.acceptInvitation(token, user.id);
      console.log('Invitation accepted successfully:', result);
      
      toast.success(`You now have ${result.role} access to ${result.profile_slug}`);

      // Invalidate all queries related to profiles and bulletins to force refresh
      queryClient.invalidateQueries({ queryKey: ['shared-profile-bulletins'] });
      queryClient.invalidateQueries({ queryKey: ['user-bulletins'] });
      queryClient.invalidateQueries({ queryKey: ['profile-shares'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      
      // Dispatch a custom event to trigger profile refresh in other components
      window.dispatchEvent(new CustomEvent('profile-share-updated', { 
        detail: { profile_slug: result.profile_slug, userId: user.id } 
      }));
      
      // Wait a moment for queries to invalidate, then navigate
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 500);
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      // If error is about email mismatch, handle it specially
      if (error.message?.includes('different email address')) {
        setEmailMismatch(true);
        toast.error('This invitation was sent to a different email address. Please sign in with the correct account.');
      } else {
        const errorMessage = error.message || 'Failed to accept invitation. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setAccepting(false);
    }
  };

  const handleSignOutAndContinue = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      setEmailMismatch(false);
      toast.info('Please sign in with the email address the invitation was sent to.');
    } catch (error: any) {
      toast.error('Failed to sign out: ' + error.message);
    } finally {
      setSigningOut(false);
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
            <div className="mb-4">
              <Logo size={48} />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">You're Invited!</h1>
          </div>

          {/* Invitation Details */}
          <div className="text-center mb-6">
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
              emailMismatch ? (
                <>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-800 mb-1">
                          Wrong Account Signed In
                        </p>
                        <p className="text-xs text-yellow-700 mb-3">
                          This invitation was sent to <strong>{invitation?.invited_email}</strong>, but you're signed in as <strong>{user.email}</strong>.
                        </p>
                        <p className="text-xs text-yellow-700">
                          Please sign out and sign in with the email address the invitation was sent to.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOutAndContinue}
                    disabled={signingOut}
                    className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-full hover:bg-yellow-700 transition-colors disabled:opacity-50"
                  >
                    {signingOut ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing out...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign Out & Use Correct Email
                      </>
                    )}
                  </button>
                  <div className="text-center text-xs text-gray-500">
                    Currently signed in as {user.email}
                  </div>
                </>
              ) : (
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
              )
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