const RESERVED = new Set([
  'about',
  'how-to-use',
  'contact',
  'baptism',
  'reset-password',
  'profile',
  'guide',
  'invite',
  'submit',
]);

/** Single-segment /:slug routes used for published ward bulletins. */
export function isPublicBulletinPath(pathname: string): boolean {
  const match = /^\/([A-Za-z0-9-]{1,50})\/?$/.exec(pathname);
  if (!match) return false;
  return !RESERVED.has(match[1].toLowerCase());
}
