import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface InvitationEmailData {
  invitedEmail: string;
  profileSlug: string;
  inviterName?: string;
  invitationLink: string;
  role: string;
}

// Canonical site origin. Override with the ALLOWED_ORIGIN secret if needed.
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://wardbulletin.com';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
  'Vary': 'Origin',
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Strip angle brackets (and stray HTML) so user-controlled strings can't
// inject markup into the email body.
function sanitizeText(value: string): string {
  return value.replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    // --- Authentication: require a valid Supabase user JWT ---
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) {
      return jsonResponse({ error: 'Missing authorization token' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
      return jsonResponse({ error: 'Internal server error' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData?.user) {
      return jsonResponse({ error: 'Invalid or expired authorization token' }, 401);
    }

    const { type, data } = await req.json();

    if (type === 'invitation') {
      const validationError = validateInvitationData(data);
      if (validationError) {
        return jsonResponse({ error: validationError }, 400);
      }
      return await sendInvitationEmail(data as InvitationEmailData);
    }

    return jsonResponse({ error: 'Invalid email type' }, 400);

  } catch (error) {
    console.error('Email function error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});

// Returns an error message string, or null if the payload is valid.
function validateInvitationData(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return 'Invalid request data';
  }

  const { invitedEmail, profileSlug, inviterName, invitationLink, role } =
    data as Record<string, unknown>;

  // Recipient must be a plausible, reasonably-sized email address
  if (
    typeof invitedEmail !== 'string' ||
    invitedEmail.length >= 255 ||
    !EMAIL_REGEX.test(invitedEmail)
  ) {
    return 'Invalid invited email address';
  }

  // Invitation link must point at the canonical invite path on our origin
  const invitePrefix = `${ALLOWED_ORIGIN}/invite/`;
  if (typeof invitationLink !== 'string' || !invitationLink.startsWith(invitePrefix)) {
    return 'Invalid invitation link';
  }

  if (typeof profileSlug !== 'string' || profileSlug.length === 0 || profileSlug.length >= 100) {
    return 'Invalid profile slug';
  }

  if (inviterName !== undefined && inviterName !== null) {
    if (typeof inviterName !== 'string' || inviterName.length >= 100) {
      return 'Invalid inviter name';
    }
  }

  if (typeof role !== 'string' || role.length >= 100) {
    return 'Invalid role';
  }

  return null;
}

async function sendInvitationEmail(data: InvitationEmailData) {
  const { invitedEmail, invitationLink } = data;

  // Sanitize user-controlled strings before interpolating into the email HTML
  const profileSlug = sanitizeText(data.profileSlug);
  const inviterName = data.inviterName ? sanitizeText(data.inviterName) : undefined;
  const role = sanitizeText(data.role);

  // Get Resend API key from environment
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY environment variable is required');
  }

  const emailSubject = `You're invited to collaborate on ${profileSlug}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invitation to Collaborate</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">You're Invited!</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Join the ${profileSlug} bulletin team</p>
      </div>

      <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="color: #2c3e50; margin-top: 0;">Welcome to the team!</h2>
        <p>${inviterName ? `${inviterName} has` : 'You have been'} invited you to collaborate on the <strong>${profileSlug}</strong> bulletin as a <strong>${role}</strong>.</p>

        <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #667eea; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c3e50;">What you can do:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Create and edit bulletins</li>
            <li>Schedule future bulletins</li>
            <li>Manage announcements and events</li>
            <li>Collaborate with the team</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${invitationLink}"
             style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
            Accept Invitation
          </a>
        </div>

        <p style="font-size: 14px; color: #666; margin-top: 25px;">
          This invitation will expire in 7 days. If you don't have an account yet, you'll be able to create one when you accept the invitation.
        </p>
      </div>

      <div style="text-align: center; padding: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px; margin: 0;">
          Powered by <strong>WardBulletin</strong> - Making ward bulletins beautiful and easy to create.
        </p>
      </div>

    </body>
    </html>
  `;

  const emailData: EmailRequest = {
    to: invitedEmail,
    subject: emailSubject,
    html: emailHtml,
    from: 'WardBulletin <noreply@wardbulletin.com>',
  };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Resend API error:', errorData);
    throw new Error(`Failed to send email: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  console.log('Email sent successfully:', result);

  return jsonResponse({
    success: true,
    messageId: result.id,
    message: 'Invitation email sent successfully',
  }, 200);
}
