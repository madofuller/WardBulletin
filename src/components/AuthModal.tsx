import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
  mode?: 'signin' | 'signup';
  prefillEmail?: string;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess, mode, prefillEmail }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [email, setEmail] = useState(prefillEmail || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        onAuthSuccess();
        onClose();
      }
    });
    return () => subscription.unsubscribe();
  }, [isOpen]);

  // Update email when prefillEmail changes
  useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [prefillEmail]);

  // Update signup mode when mode prop changes
  useEffect(() => {
    if (mode) {
      setIsSignUp(mode === 'signup');
    }
  }, [mode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Supabase is always configured with hardcoded values
    
    console.log('Starting authentication process...', { isSignUp, email });

    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        console.log('Attempting sign up...');
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) {
          console.error('Sign up error:', error);
          throw error;
        }
        console.log('Sign up successful, attempting sign in...');
        
        // For sign up, automatically sign them in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          console.error('Auto sign in error:', signInError);
          throw signInError;
        }
        console.log('Auto sign in successful');
      } else {
        console.log('Attempting sign in...');
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          console.error('Sign in error:', error);
          throw error;
        }
        console.log('Sign in successful');
      }
      
      onAuthSuccess();
      onClose();
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setError('');
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
      style={{ display: isOpen ? 'flex' : 'none' }}
    >
      <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-8 max-w-md w-full mx-2 sm:mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 text-sm">
            {isSignUp 
              ? 'Create a free account to save and manage your bulletins with your own permanent QR code.'
              : 'Sign in to access your saved bulletins and manage your QR codes.'
            }
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
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
              />
            </div>
            {isSignUp && (
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center">
          {!mode && (
            <button
              onClick={handleToggleSignUp}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Create one"
              }
            </button>
          )}
          {mode === 'signup' && (
            <p className="text-sm text-gray-500">
              You must create an account with the invited email to accept this invitation.
            </p>
          )}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <User className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-medium">Why create an account?</p>
              <ul className="mt-1 space-y-1">
                <li>• Save bulletins with persistent QR codes</li>
                <li>• Get your own permanent QR code link</li>
                <li>• Access your bulletins from any device</li>
                <li>• Share bulletins with your ward members</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}