import { defaultRateLimiter } from './rate-limit.js';
import { validateProfileSlug } from '../src/lib/security.js';

// Canonical origin used for absolute manifest member URLs (icons). The
// manifest is served from /api/manifest so that it is same-origin and
// therefore allowed by the site's `default-src 'self'` Content-Security-Policy
// (a blob: manifest would be blocked). start_url/scope/id are root-relative so
// they resolve against whatever origin actually serves the request.
const ICON_ORIGIN = 'https://wardbulletin.com';

// Sanitize a ward name provided as a query parameter before embedding it in the
// manifest. Drops ASCII control characters, collapses whitespace and caps the
// length; returns null when nothing usable remains.
function sanitizeName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  let stripped = '';
  for (const ch of raw) {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) continue;
    stripped += ch;
  }
  const cleaned = stripped.replace(/\s+/g, ' ').trim().slice(0, 60);
  return cleaned.length ? cleaned : null;
}

export default async function handler(req, res) {
  // Security: Rate limiting
  const clientIP = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
  if (!defaultRateLimiter(clientIP as string)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  const { slug, name } = req.query;

  // Security: Validate the slug format before reflecting it into the manifest.
  if (!slug || typeof slug !== 'string' || !validateProfileSlug(slug)) {
    return res.status(400).json({ error: 'Invalid profile slug' });
  }

  const wardName = sanitizeName(name);
  const appName = wardName ? `${wardName} Bulletin` : 'WardBulletin';
  // short_name is shown under the home-screen icon; keep it brief.
  const shortName = (wardName || 'Bulletin').slice(0, 12);

  const manifest = {
    name: appName,
    short_name: shortName,
    icons: [
      { src: `${ICON_ORIGIN}/android-chrome-192x192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${ICON_ORIGIN}/android-chrome-512x512.png`, sizes: '512x512', type: 'image/png' },
    ],
    theme_color: '#3b82f6',
    background_color: '#ffffff',
    display: 'standalone',
    // A distinct id per ward lets the browser treat each ward as its own
    // installable app instead of collapsing them into one.
    id: `/${slug}`,
    // The fix: launch the installed app at the specific ward page rather than
    // the generic site root.
    start_url: `/${slug}`,
    scope: '/',
    description: wardName
      ? `Digital bulletin for ${wardName}.`
      : 'Create, share, and print beautiful digital ward bulletins for your LDS ward.',
  };

  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(200).send(JSON.stringify(manifest));
}
