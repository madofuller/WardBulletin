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
 * Makes installing / adding a public ward page to the home screen launch the
 * specific ward (e.g. /auburnhills) instead of the generic site root. The SPA
 * serves the same index.html for every route, so the correct behavior has to be
 * applied at runtime once we know which ward is being viewed.
 *
 * Two very different browser behaviors are handled:
 *
 * Chromium (Android/desktop): point <link rel="manifest"> at a per-ward
 * manifest served by the same-origin /api/manifest function (a blob: manifest
 * would be blocked by the site's `default-src 'self'` CSP). The slug is
 * available immediately from the URL, so start_url is correct from first
 * render; the ward name is layered in once the bulletin data loads.
 *
 * iOS/iPadOS: Safari's "Add to Home Screen" *honors the manifest's start_url*,
 * so the static site manifest (start_url: "/") rewrites a ward page like
 * /wx-5th-ward down to the bare site root before the user can even save it.
 * Swapping the manifest href to /api/manifest does not fix this — it broke
 * saving entirely on iPhones (it only "worked" in airplane mode, when the
 * manifest fetch failed and Safari fell back to its default behavior). Instead
 * we detach the <link rel="manifest"> while a ward page is shown, which makes
 * Safari fall back to bookmarking the *current* URL (the ward page). Standalone
 * display is preserved by the apple-mobile-web-app-capable meta tags in
 * index.html, and the ward name is offered as the suggested icon label.
 */
const DynamicManifest: React.FC<DynamicManifestProps> = ({ slug, wardName }) => {
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link || !slug) return;

    if (isIOSDevice()) {
      // Detach the manifest so Safari's Add to Home Screen saves the current
      // ward URL instead of the manifest's start_url ("/").
      const parent = link.parentNode;
      const nextSibling = link.nextSibling;
      parent?.removeChild(link);

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
        if (parent) parent.insertBefore(link, nextSibling);
        if (titleMeta && previousTitle !== null) {
          titleMeta.setAttribute('content', previousTitle);
        }
      };
    }

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
