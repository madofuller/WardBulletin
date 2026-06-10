import { sanitizeHtml } from './sanitizeHtml';
import { linkifyHtml } from './linkifyHtml';
import { decodeHtml } from './decodeHtml';

// decode -> sanitize -> linkify is pure on the content string, but it runs
// for EVERY announcement on every keystroke in both the live preview and the
// always-mounted print layout. Cache by content so only the announcement
// actually being edited pays the cost.
const cache = new Map<string, string>();
const MAX_ENTRIES = 300;

export function sanitizedAnnouncementHtml(content: string): string {
  const hit = cache.get(content);
  if (hit !== undefined) {
    // Re-insert to keep recently used entries alive (Map preserves insertion order).
    cache.delete(content);
    cache.set(content, hit);
    return hit;
  }
  const out = linkifyHtml(sanitizeHtml(decodeHtml(content)));
  cache.set(content, out);
  if (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  return out;
}
