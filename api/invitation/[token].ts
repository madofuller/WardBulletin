import { createClient } from '@supabase/supabase-js';
import { defaultRateLimiter } from '../rate-limit';
import { securityMonitor, validateInput } from '../../src/lib/security';

// Get Supabase configuration from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Validate that required environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing!');
  console.error('supabaseUrl:', supabaseUrl ? 'SET' : 'MISSING');
  console.error('supabaseAnonKey:', supabaseAnonKey ? 'SET' : 'MISSING');
  throw new Error('Supabase configuration is required');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const withTimeout = <T>(promise: Promise<T>, timeoutMs = 10000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]);
};

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Security: Rate limiting
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  if (!defaultRateLimiter(clientIP as string)) {
    securityMonitor.logRateLimitExceeded(clientIP as string);
    return res.status(429).json({ error: 'Too many requests' });
  }

  // Security: Add security headers
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    securityMonitor.logInputValidationFailure(token as string, { reason: 'missing_or_invalid_type' });
    return res.status(400).json({ error: 'Invalid token' });
  }

  // Security: Validate token format (base64url)
  if (!validateInput(token, /^[A-Za-z0-9_-]+$/, 100)) {
    securityMonitor.logInputValidationFailure(token, { reason: 'invalid_token_format' });
    return res.status(400).json({ error: 'Invalid token format' });
  }

  try {
    // Get invitation details
    const { data: invitation, error } = await withTimeout(
      supabase
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
        .single()
    );

    if (error || !invitation) {
      return res.status(404).json({ error: 'Invitation not found or already accepted' });
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Invitation has expired' });
    }

    // Return invitation details (without sensitive data)
    return res.status(200).json({
      profile_slug: invitation.profile_slug,
      invited_email: invitation.invited_email,
      role: invitation.role,
      expires_at: invitation.expires_at,
      created_at: invitation.created_at
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}