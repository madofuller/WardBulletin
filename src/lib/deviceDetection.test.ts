import { afterEach, describe, expect, it, vi } from 'vitest';
import { isIOSDevice } from './deviceDetection';

/**
 * Override navigator.userAgent / maxTouchPoints for a single assertion. jsdom's
 * navigator properties are configurable, so we can redefine them per case.
 */
function withNavigator(
  props: { userAgent?: string; maxTouchPoints?: number },
  run: () => void,
) {
  // navigator.userAgent / maxTouchPoints live on Navigator.prototype (or are
  // absent) in jsdom, so define own configurable properties that shadow them
  // for the duration of the callback, then remove them.
  const touched: string[] = [];
  const define = (key: string, value: unknown) => {
    touched.push(key);
    Object.defineProperty(navigator, key, { value, configurable: true });
  };

  if (props.userAgent !== undefined) define('userAgent', props.userAgent);
  if (props.maxTouchPoints !== undefined) define('maxTouchPoints', props.maxTouchPoints);

  try {
    run();
  } finally {
    for (const key of touched) {
      delete (navigator as Record<string, unknown>)[key];
    }
  }
}

const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const IPAD_UA =
  'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';
// iPadOS 13+ reports a desktop macOS UA and relies on touch points to be told apart.
const IPADOS_DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
const MAC_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const ANDROID_UA =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('isIOSDevice', () => {
  it('detects iPhone', () => {
    withNavigator({ userAgent: IPHONE_UA, maxTouchPoints: 5 }, () => {
      expect(isIOSDevice()).toBe(true);
    });
  });

  it('detects iPad (legacy UA)', () => {
    withNavigator({ userAgent: IPAD_UA, maxTouchPoints: 5 }, () => {
      expect(isIOSDevice()).toBe(true);
    });
  });

  it('detects iPadOS 13+ reporting a desktop user agent via touch points', () => {
    withNavigator({ userAgent: IPADOS_DESKTOP_UA, maxTouchPoints: 5 }, () => {
      expect(isIOSDevice()).toBe(true);
    });
  });

  it('does not flag a real (non-touch) Mac', () => {
    withNavigator({ userAgent: MAC_UA, maxTouchPoints: 0 }, () => {
      expect(isIOSDevice()).toBe(false);
    });
  });

  it('does not flag Android', () => {
    withNavigator({ userAgent: ANDROID_UA, maxTouchPoints: 5 }, () => {
      expect(isIOSDevice()).toBe(false);
    });
  });
});
