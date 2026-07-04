// Utility to detect if the current device is mobile
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Check user agent for mobile devices
  const legacyOpera = (window as unknown as { opera?: string }).opera;
  const userAgent = navigator.userAgent || navigator.vendor || legacyOpera || '';
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

  // Also check screen width as a fallback
  const isSmallScreen = window.innerWidth < 768;

  return mobileRegex.test(userAgent) || isSmallScreen;
};

/**
 * Detect iOS/iPadOS (Safari and all in-app WebViews, which share WebKit).
 *
 * iOS Safari's Web App Manifest support is fragile: it does not honor a
 * `<link rel="manifest">` whose href is swapped by JavaScript after load, so the
 * per-ward /api/manifest swap in DynamicManifest is a no-op on iOS and is
 * skipped there. iOS still lands on the right ward because the static manifest
 * omits `start_url`, which makes Safari fall back to the current document URL.
 *
 * iPadOS 13+ reports a desktop ("MacIntel") user agent, so also treat a
 * touch-capable Mac as iOS.
 */
export const isIOSDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;

  const userAgent = navigator.userAgent || navigator.vendor || '';
  if (/iphone|ipad|ipod/i.test(userAgent)) return true;

  // iPadOS 13+ masquerades as macOS; distinguish it by touch support.
  const isTouchMac =
    /Macintosh/.test(userAgent) &&
    typeof navigator.maxTouchPoints === 'number' &&
    navigator.maxTouchPoints > 1;

  return isTouchMac;
};

