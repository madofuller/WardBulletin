import React, { useEffect } from 'react';
import { isIOSDevice } from '../lib/deviceDetection';

interface DynamicManifestProps {
  /** The ward's profile slug (from the public bulletin URL). */
  slug: string | null;
  /** The ward name, used for a friendlier installed-app label when available. */
  wardName?: string | null;
}

// The default site-wide manifest attached for non-ward URLs by the inline
// script in index.html.
const DEFAULT_MANIFEST_HREF = '/site.webmanifest';

/**
 * Runtime companion to the inline manifest script in index.html.
 *
 * The load-bearing decision — which manifest (if any) the page carries — is
 * made synchronously in index.html while the document is still parsing,
 * because iOS Safari resolves the manifest at document load and "Add to Home
 * Screen" ignores later changes to <link rel="manifest">. By the time React
 * runs it is already too late to change what iOS will save. See index.html
 * for the full rationale.
 *
 * What this component still does once a ward page is mounted:
 *
 * iOS/iPadOS: offer the ward name as the suggested home-screen label via the
 * apple-mobile-web-app-title meta tag, and (best effort) detach any manifest
 * link left over from client-side navigation off a non-ward page.
 *
 * Chromium (Android/desktop): re-point the manifest link at /api/manifest with
 * the ward name layered in once the bulletin data loads (Chromium re-reads the
 * manifest on demand, so runtime swaps work there). This also covers
 * client-side navigation, where the link still holds the default manifest.
 */
const DynamicManifest: React.FC<DynamicManifestProps> = ({ slug, wardName }) => {
  useEffect(() => {
    if (!slug) return;

    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');

    if (isIOSDevice()) {
      // Direct loads of a ward URL have no manifest link at all (the inline
      // script skipped it), which is what makes Safari bookmark the ward URL.
      // After client-side navigation from a non-ward page a link may still be
      // present; detach it too, though iOS may have already cached it.
      const parent = link?.parentNode ?? null;
      const nextSibling = link?.nextSibling ?? null;
      if (link && parent) parent.removeChild(link);

      // Offer the ward name as the suggested home-screen label when we have it.
      const titleMeta = document.querySelector<HTMLMetaElement>(
        'meta[name="apple-mobile-web-app-title"]'
      );
      const previousTitle = titleMeta?.getAttribute('content') ?? null;
      if (titleMeta && wardName && wardName.trim()) {
        titleMeta.setAttribute('content', wardName.trim());
      }

      return () => {
        // Re-attach the manifest and restore the title when leaving the page.
        if (link && parent) parent.insertBefore(link, nextSibling);
        if (titleMeta && previousTitle !== null) {
          titleMeta.setAttribute('content', previousTitle);
        }
      };
    }

    if (!link) return;

    const params = new URLSearchParams({ slug });
    if (wardName && wardName.trim()) {
      params.set('name', wardName.trim());
    }
    link.setAttribute('href', `/api/manifest?${params.toString()}`);

    return () => {
      // Restore the default manifest when leaving the ward page. (The href at
      // mount time may already be the per-ward manifest from the inline
      // script, so restore the site default rather than the previous value.)
      link.setAttribute('href', DEFAULT_MANIFEST_HREF);
    };
  }, [slug, wardName]);

  return null;
};

export default DynamicManifest;
