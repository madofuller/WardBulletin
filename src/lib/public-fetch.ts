/**
 * Lightweight Supabase REST API client for public bulletin pages
 * Replaces @supabase/supabase-js to eliminate ~32KB gzipped from public bundle
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface FetchOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

async function supabaseFetch(endpoint: string, options: FetchOptions = {}) {
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...options.headers,
  };

  const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const error: any = new Error(`Supabase fetch failed: ${response.statusText}`);
    error.status = response.status;
    error.code = response.status === 404 ? 'PGRST202' : `HTTP_${response.status}`;
    try {
      const errorData = await response.json();
      error.details = errorData;
      error.code = errorData.code || error.code;
      error.message = errorData.message || error.message;
    } catch {}
    throw error;
  }

  return response.json();
}

export interface PublicBulletinData {
  id: string;
  user_id: string;
  profile_slug: string;
  profile_unit_type: string;
  profile_language: string;
  ward_name: string;
  date: string;
  meeting_type: string;
  theme: string;
  userTheme: string;
  imageId: string;
  imageUrl: string | null;
  imagePosition: { x: number; y: number };
  imageOpacity: number;
  bishopric_message: string;
  announcements: any[];
  meetings: any[];
  special_events: any[];
  agenda: any[];
  prayers: any;
  music_program: any;
  leadership: any;
  wardLeadership: any[];
  missionaries: any[];
  wardMissionaries: any[];
  serviceMissionaries: any[];
  created_at: string;
  updated_at: string;
}

/**
 * Fetch public bulletin by profile slug using optimized RPC call
 * Falls back to legacy 3-query path on any failure
 */
export async function getPublicBulletinBySlug(profileSlug: string): Promise<PublicBulletinData | null> {
  try {
    // Try optimized single-query RPC
    const data = await supabaseFetch(
      `/rest/v1/rpc/get_public_bulletin_by_slug?profile_slug_param=${encodeURIComponent(profileSlug)}`
    );

    // If data is null/undefined/malformed, fall back
    if (!data || typeof data !== 'object') {
      console.warn('[RPC fallback] Malformed RPC response, using legacy path');
      return getPublicBulletinBySlugLegacy(profileSlug);
    }

    // Check for error response from RPC
    if (data.error) {
      // Only return null for true "not found" errors (skip fallback)
      if (data.error === 'Bulletin not found' || data.error === 'No bulletin published') {
        return null;
      }
      // Other errors: fall back
      console.warn('[RPC fallback] RPC returned error, using legacy path:', data.error);
      return getPublicBulletinBySlugLegacy(profileSlug);
    }

    // Extract tokens from the RPC result
    const tokens = data.tokens || {};
    const userId = data.created_by;

    // Handle custom image URL
    const storedImageUrl = tokens.imageUrl || null;
    let imageUrl: string | null = storedImageUrl || null;
    const image = tokens.image || null;
    
    if (!imageUrl && image && image.startsWith('custom-')) {
      // Build public URL for custom image (no supabase-js needed)
      const filePath = `${userId}/${image}.jpg`;
      imageUrl = `${SUPABASE_URL}/storage/v1/object/public/bulletin-images/${filePath}`;
    }

    // Build result matching existing structure
    const result: PublicBulletinData = {
      id: data.id,
      user_id: data.created_by,
      profile_slug: data.profile_slug,
      profile_unit_type: data.profile_unit_type || 'ward',
      profile_language: data.profile_language || 'en',
      ward_name: tokens.ward_name || '',
      date: data.meeting_date,
      meeting_type: data.meeting_type,
      theme: tokens.theme || '',
      userTheme: tokens.userTheme || '',
      imageId: image || 'none',
      imageUrl: imageUrl,
      imagePosition: tokens.imagePosition ? JSON.parse(tokens.imagePosition) : { x: 50, y: 50 },
      imageOpacity: tokens.imageOpacity ? parseInt(tokens.imageOpacity) : 40,
      bishopric_message: tokens.bishopric || '',
      announcements: tokens.announcements ? JSON.parse(tokens.announcements) : [],
      meetings: tokens.meetings ? JSON.parse(tokens.meetings) : [],
      special_events: tokens.events ? JSON.parse(tokens.events) : [],
      agenda: tokens.agenda ? JSON.parse(tokens.agenda) : [],
      prayers: tokens.prayers ? JSON.parse(tokens.prayers) : {},
      music_program: tokens.music ? JSON.parse(tokens.music) : {},
      leadership: tokens.leadership ? JSON.parse(tokens.leadership) : {},
      wardLeadership: tokens.wardLeadership ? JSON.parse(tokens.wardLeadership) : [],
      missionaries: tokens.missionaries ? JSON.parse(tokens.missionaries) : [],
      wardMissionaries: tokens.wardMissionaries ? JSON.parse(tokens.wardMissionaries) : [],
      serviceMissionaries: tokens.serviceMissionaries ? JSON.parse(tokens.serviceMissionaries) : [],
      created_at: data.created_at,
      updated_at: data.created_at,
    };

    return result;
  } catch (err: any) {
    // On ANY RPC failure (network, timeout, parse, etc), fall back to legacy
    console.warn('[RPC fallback] Exception during RPC, using legacy path:', err);
    return getPublicBulletinBySlugLegacy(profileSlug);
  }
}

/**
 * Legacy 3-query path (fallback for safe deployment)
 */
async function getPublicBulletinBySlugLegacy(profileSlug: string): Promise<PublicBulletinData | null> {
  try {
    // Query 1: Get user by profile_slug
    const users = await supabaseFetch(
      `/rest/v1/users?select=id,active_bulletin_id,unit_type,language&profile_slug=eq.${encodeURIComponent(profileSlug)}`
    );

    if (!users || !users[0]) {
      return null;
    }

    const userData = users[0];
    let bulletinId = userData.active_bulletin_id;

    // If no active bulletin, get latest
    if (!bulletinId) {
      const latestBulletins = await supabaseFetch(
        `/rest/v1/bulletins?select=id&or=(created_by.eq.${userData.id},profile_slug.eq."${profileSlug}")&order=created_at.desc&limit=1`
      );
      if (!latestBulletins || !latestBulletins[0]) {
        return null;
      }
      bulletinId = latestBulletins[0].id;
    }

    // Query 2: Get bulletin
    const bulletinResponse = await supabaseFetch(
      `/rest/v1/bulletins?select=*&id=eq.${bulletinId}`
    );

    if (!bulletinResponse || (Array.isArray(bulletinResponse) && !bulletinResponse[0])) {
      return null;
    }

    const data = Array.isArray(bulletinResponse) ? bulletinResponse[0] : bulletinResponse;
    const userId = data.created_by;

    // Query 3: Get tokens
    const tokenKeys = [
      'ward_name', 'theme', 'userTheme', 'announcements', 'meetings', 'events',
      'agenda', 'prayers', 'music', 'leadership', 'wardLeadership', 'missionaries',
      'wardMissionaries', 'serviceMissionaries', 'bishopric', 'image', 'imageUrl',
      'imagePosition', 'imageOpacity'
    ].map(k => `bulletin-${data.slug}-${k}`);

    const tokensQuery = tokenKeys.map(k => `key.eq.${k}`).join(',');
    const tokens = await supabaseFetch(
      `/rest/v1/tokens?select=key,value,created_by&or=(${tokensQuery})`
    );

    // Build token map
    const tokenMap = new Map<string, string>();
    (tokens || []).forEach((token: any) => {
      const shortKey = token.key.replace(`bulletin-${data.slug}-`, '');
      tokenMap.set(shortKey, token.value);
    });

    // Handle custom image
    const image = tokenMap.get('image') || null;
    const storedImageUrl = tokenMap.get('imageUrl') || null;
    let imageUrl: string | null = storedImageUrl || null;
    
    if (!imageUrl && image && image.startsWith('custom-')) {
      const filePath = `${userId}/${image}.jpg`;
      imageUrl = `${SUPABASE_URL}/storage/v1/object/public/bulletin-images/${filePath}`;
    }

    const result: PublicBulletinData = {
      id: data.id,
      user_id: data.created_by,
      profile_slug: data.profile_slug,
      profile_unit_type: userData.unit_type || 'ward',
      profile_language: userData.language || 'en',
      ward_name: tokenMap.get('ward_name') || '',
      date: data.meeting_date,
      meeting_type: data.meeting_type,
      theme: tokenMap.get('theme') || '',
      userTheme: tokenMap.get('userTheme') || '',
      imageId: image || 'none',
      imageUrl: imageUrl,
      imagePosition: tokenMap.get('imagePosition') ? JSON.parse(tokenMap.get('imagePosition')!) : { x: 50, y: 50 },
      imageOpacity: tokenMap.get('imageOpacity') ? parseInt(tokenMap.get('imageOpacity')!) : 40,
      bishopric_message: tokenMap.get('bishopric') || '',
      announcements: tokenMap.get('announcements') ? JSON.parse(tokenMap.get('announcements')!) : [],
      meetings: tokenMap.get('meetings') ? JSON.parse(tokenMap.get('meetings')!) : [],
      special_events: tokenMap.get('events') ? JSON.parse(tokenMap.get('events')!) : [],
      agenda: tokenMap.get('agenda') ? JSON.parse(tokenMap.get('agenda')!) : [],
      prayers: tokenMap.get('prayers') ? JSON.parse(tokenMap.get('prayers')!) : {},
      music_program: tokenMap.get('music') ? JSON.parse(tokenMap.get('music')!) : {},
      leadership: tokenMap.get('leadership') ? JSON.parse(tokenMap.get('leadership')!) : {},
      wardLeadership: tokenMap.get('wardLeadership') ? JSON.parse(tokenMap.get('wardLeadership')!) : [],
      missionaries: tokenMap.get('missionaries') ? JSON.parse(tokenMap.get('missionaries')!) : [],
      wardMissionaries: tokenMap.get('wardMissionaries') ? JSON.parse(tokenMap.get('wardMissionaries')!) : [],
      serviceMissionaries: tokenMap.get('serviceMissionaries') ? JSON.parse(tokenMap.get('serviceMissionaries')!) : [],
      created_at: data.created_at,
      updated_at: data.created_at,
    };

    return result;
  } catch (err: any) {
    console.error('[Legacy fallback] Failed:', err);
    return null;
  }
}
