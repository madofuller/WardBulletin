/**
 * Lightweight Supabase REST client for public bulletin pages.
 * Uses plain fetch so @supabase/supabase-js stays off the /:slug graph.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface FetchOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export class PublicFetchError extends Error {
  status?: number;
  code?: string;
  details?: unknown;

  constructor(message: string, extras: { status?: number; code?: string; details?: unknown } = {}) {
    super(message);
    this.name = 'PublicFetchError';
    this.status = extras.status;
    this.code = extras.code;
    this.details = extras.details;
  }
}

let fallbackLogged = false;
function logFallbackOnce(reason: string, extra?: unknown) {
  if (fallbackLogged) return;
  fallbackLogged = true;
  console.warn('[RPC fallback] falling back to legacy 3-query path:', reason, extra ?? '');
}

async function supabaseFetch(endpoint: string, options: FetchOptions = {}) {
  const headers: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
    ...options.headers,
  };

  let response: Response;
  try {
    response = await fetch(`${SUPABASE_URL}${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch (err) {
    const error = new PublicFetchError('Network error calling Supabase', { code: 'NETWORK' });
    (error as PublicFetchError & { cause?: unknown }).cause = err;
    throw error;
  }

  if (!response.ok) {
    let details: { code?: string; message?: string } = {};
    try {
      details = await response.json();
    } catch {
      // ignore empty/non-json error bodies
    }
    throw new PublicFetchError(details.message || `Supabase fetch failed: ${response.statusText}`, {
      status: response.status,
      code: details.code || (response.status === 404 ? 'PGRST202' : `HTTP_${response.status}`),
      details,
    });
  }

  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new PublicFetchError('Malformed JSON from Supabase', { code: 'MALFORMED' });
  }
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
  announcements: unknown[];
  meetings: unknown[];
  special_events: unknown[];
  agenda: unknown[];
  prayers: Record<string, unknown>;
  music_program: Record<string, unknown>;
  leadership: Record<string, unknown>;
  wardLeadership: unknown[];
  missionaries: unknown[];
  wardMissionaries: unknown[];
  serviceMissionaries: unknown[];
  created_at: string;
  updated_at: string;
}

function parseJsonValue<T>(value: unknown, fallback: T): T {
  if (value == null || value === '') return fallback;
  if (typeof value !== 'string') return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return value as unknown as T;
  }
}

function customImageUrl(userId: string, image: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/bulletin-images/${userId}/${image}.jpg`;
}

function resolveImageUrl(userId: string | null | undefined, tokens: Record<string, unknown>): string | null {
  const stored = parseJsonValue<string | null>(tokens.imageUrl, null);
  if (stored) return stored;
  const image = parseJsonValue<string | null>(tokens.image, null);
  if (image && image.startsWith('custom-') && userId) {
    return customImageUrl(userId, image);
  }
  return null;
}

function mapTokensToBulletin(
  data: Record<string, any>,
  tokens: Record<string, unknown>,
  unitType: string,
  language: string,
): PublicBulletinData {
  const image = parseJsonValue<string | null>(tokens.image, null);
  return {
    id: data.id,
    user_id: data.created_by,
    profile_slug: data.profile_slug,
    profile_unit_type: unitType || 'ward',
    profile_language: language || 'en',
    ward_name: parseJsonValue<string>(tokens.ward_name, '') || '',
    date: data.meeting_date,
    meeting_type: data.meeting_type,
    theme: parseJsonValue<string>(tokens.theme, '') || '',
    userTheme: parseJsonValue<string>(tokens.userTheme, '') || '',
    imageId: image || 'none',
    imageUrl: resolveImageUrl(data.created_by, tokens),
    imagePosition: parseJsonValue(tokens.imagePosition, { x: 50, y: 50 }),
    imageOpacity: parseJsonValue<number>(tokens.imageOpacity, 40),
    bishopric_message: parseJsonValue<string>(tokens.bishopric, '') || '',
    announcements: parseJsonValue(tokens.announcements, []),
    meetings: parseJsonValue(tokens.meetings, []),
    special_events: parseJsonValue(tokens.events, []),
    agenda: parseJsonValue(tokens.agenda, []),
    prayers: parseJsonValue(tokens.prayers, {}),
    music_program: parseJsonValue(tokens.music, {}),
    leadership: parseJsonValue(tokens.leadership, {}),
    wardLeadership: parseJsonValue(tokens.wardLeadership, []),
    missionaries: parseJsonValue(tokens.missionaries, []),
    wardMissionaries: parseJsonValue(tokens.wardMissionaries, []),
    serviceMissionaries: parseJsonValue(tokens.serviceMissionaries, []),
    created_at: data.created_at,
    updated_at: data.created_at,
  };
}

function isTrueNotFound(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') return false;
  const error = (payload as { error?: string }).error;
  return error === 'Bulletin not found' || error === 'No bulletin published';
}

function looksLikeBulletin(payload: unknown): payload is Record<string, any> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const data = payload as Record<string, any>;
  return typeof data.id === 'string' && !data.error;
}

/**
 * Fetch public bulletin by profile slug via RPC, falling back to the legacy
 * 3-query path on any RPC failure. Only a true slug-not-found skips fallback.
 */
export async function getPublicBulletinBySlug(profileSlug: string): Promise<PublicBulletinData | null> {
  try {
    const data = await supabaseFetch('/rest/v1/rpc/get_public_bulletin_by_slug', {
      method: 'POST',
      body: { profile_slug_param: profileSlug },
    });

    if (isTrueNotFound(data)) {
      return null;
    }

    if (!looksLikeBulletin(data)) {
      logFallbackOnce('malformed RPC payload');
      return getPublicBulletinBySlugLegacy(profileSlug);
    }

    return mapTokensToBulletin(
      data,
      (data.tokens && typeof data.tokens === 'object') ? data.tokens : {},
      data.profile_unit_type || 'ward',
      data.profile_language || 'en',
    );
  } catch (err) {
    logFallbackOnce('RPC request failed', err);
    return getPublicBulletinBySlugLegacy(profileSlug);
  }
}

async function getPublicBulletinBySlugLegacy(profileSlug: string): Promise<PublicBulletinData | null> {
  try {
    const users = await supabaseFetch(
      `/rest/v1/users?select=id,active_bulletin_id,unit_type,language&profile_slug=eq.${encodeURIComponent(profileSlug)}`,
    );

    if (!Array.isArray(users) || !users[0]) {
      return null;
    }

    const userData = users[0];
    let bulletinId = userData.active_bulletin_id;

    if (!bulletinId) {
      const latestBulletins = await supabaseFetch(
        `/rest/v1/bulletins?select=id&or=(created_by.eq.${userData.id},profile_slug.eq.${encodeURIComponent(profileSlug)})&order=created_at.desc&limit=1`,
      );
      if (!Array.isArray(latestBulletins) || !latestBulletins[0]) {
        return null;
      }
      bulletinId = latestBulletins[0].id;
    }

    const bulletinResponse = await supabaseFetch(
      `/rest/v1/bulletins?select=*&id=eq.${encodeURIComponent(bulletinId)}`,
    );

    const data = Array.isArray(bulletinResponse) ? bulletinResponse[0] : bulletinResponse;
    if (!data?.id) {
      return null;
    }

    const tokenKeys = [
      'ward_name', 'theme', 'userTheme', 'announcements', 'meetings', 'events',
      'agenda', 'prayers', 'music', 'leadership', 'wardLeadership', 'missionaries',
      'wardMissionaries', 'serviceMissionaries', 'bishopric', 'image', 'imageUrl',
      'imagePosition', 'imageOpacity',
    ].map((k) => `bulletin-${data.slug}-${k}`);

    const inList = tokenKeys.map((k) => encodeURIComponent(k)).join(',');
    const tokens = await supabaseFetch(
      `/rest/v1/tokens?select=key,value,created_by&key=in.(${inList})`,
    );

    const tokenMap: Record<string, unknown> = {};
    (Array.isArray(tokens) ? tokens : []).forEach((token: { key?: string; value?: unknown }) => {
      if (!token.key) return;
      tokenMap[token.key.replace(`bulletin-${data.slug}-`, '')] = token.value;
    });

    return mapTokensToBulletin(
      data,
      tokenMap,
      userData.unit_type || 'ward',
      userData.language || 'en',
    );
  } catch (err) {
    console.error('[Legacy fallback] Failed:', err);
    return null;
  }
}
