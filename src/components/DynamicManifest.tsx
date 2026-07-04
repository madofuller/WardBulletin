import React, { useEffect } from 'react';
import { isIOSDevice } from '../lib/deviceDetection';

interface DynamicManifestProps {
  /** The ward's profile slug (from the public bulletin URL). */
  slug: string | null;
  /** The ward name, used for a friendlier installed-app label when available. */
  wardName?: string | null;
}

// The default site-wide manifest referenced from index.html.
const DEFAULT_MANIFEST_HREF = '/site.webmanifest';

/**
 * Points the document's <link rel="manifest"> at a per-ward manifest while a
 * public ward page is displayed, so that installing the page / adding it to the
 * home screen launches the specific ward (e.g. /auburnhills) instead of the
 * generic site root.
 *
 * The per-ward manifest is served by the same-origin /api/manifest function
 * (a blob: manifest would be blocked by the site's `default-src 'self'` CSP).
 * The slug is available immediately from the URL, so start_url is correct from
 * first render; the ward name is layered in once the bulletin data loads.
 *
 * This is skipped on iOS/iPadOS, because Safari does not honor a manifest whose
 * href is swapped in via JavaScript after load — it only reads the manifest
 * declared in the initial HTML (/site.webmanifest). So on iOS this swap has no
 * effect and we avoid the wasted work. iOS instead gets the correct ward by way
 * of the static manifest omitting `start_url`, which makes every browser fall
 * back to the current document URL (see public/site.webmanifest). Chromium
 * browsers (Android/desktop) do honor the swap, so they additionally get an
 * explicit per-ward start_url, id and name from /api/manifest here.
 */
const DynamicManifest: React.FC<DynamicManifestProps> = ({ slug, wardName }) => {
  useEffect(() => {
    if (isIOSDevice()) return;

    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link || !slug) return;

    const previousHref = link.getAttribute('href') || DEFAULT_MANIFEST_HREF;

    const params = new URLSearchParams({ slug });
    if (wardName && wardName.trim()) {
      params.set('name', wardName.trim());
    }
    link.setAttribute('href', `/api/manifest?${params.toString()}`);

    return () => {
      // Restore the default manifest when leaving the ward page.
      link.setAttribute('href', previousHref);
    };
  }, [slug, wardName]);

  return null;
};

export default DynamicManifest;
