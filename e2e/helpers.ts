import { expect, type Page, type TestInfo } from '@playwright/test';

/**
 * The E2E build uses dummy Supabase credentials (dummy-e2e-project.supabase.co),
 * so every Supabase network call fails by design. Console/page errors caused by
 * those failed requests are expected and allowlisted; anything else fails the test.
 */
const SUPABASE_DUMMY_HOST = /dummy-e2e-project\.supabase\.co/i;

// @vercel/analytics requests /_vercel/insights/script.js, which 404s on a
// local `vite preview` server. Expected outside Vercel; not an app bug.
const VERCEL_INSIGHTS = /\/_vercel\//i;

// Console errors that are an expected consequence of the dummy Supabase env.
const ALLOWED_CONSOLE = new RegExp(
  [
    'dummy-e2e-project\\.supabase\\.co',
    'supabase',
    'Failed to fetch',
    'NetworkError',
    'fetch failed',
    'AuthRetryableFetchError',
    'ERR_NAME_NOT_RESOLVED',
    'ERR_INTERNET_DISCONNECTED',
    'ERR_CONNECTION',
  ].join('|'),
  'i'
);

// Uncaught exceptions / unhandled rejections that stem from the failing fetches.
const ALLOWED_PAGEERROR = /Failed to fetch|NetworkError|Load failed|fetch failed|AuthRetryableFetchError|supabase/i;

export interface ErrorWatcher {
  /** Assert that no unexpected console errors or page errors occurred. */
  assertClean(): void;
}

export function watchErrors(page: Page): ErrorWatcher {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];

  page.on('pageerror', (err) => {
    const text = String(err?.message ?? err);
    if (ALLOWED_PAGEERROR.test(text)) return;
    pageErrors.push(text);
  });

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    const url = msg.location()?.url ?? '';
    // Resource-load failures report the failing URL in location().
    if (SUPABASE_DUMMY_HOST.test(url) || VERCEL_INSIGHTS.test(url)) return;
    if (ALLOWED_CONSOLE.test(text)) return;
    consoleErrors.push(text);
  });

  return {
    assertClean() {
      expect(pageErrors, 'uncaught page errors').toEqual([]);
      expect(consoleErrors, 'unexpected console errors').toEqual([]);
    },
  };
}

export function isMobile(testInfo: TestInfo): boolean {
  return testInfo.project.name.includes('mobile');
}

/** Navigate to the bulletin editor and wait until the form has hydrated. */
export async function gotoEditor(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('#form-ward-name')).toBeVisible({ timeout: 15_000 });
}

/** Open the AuthModal from the editor header while signed out. */
export async function openAuthModal(page: Page, testInfo: TestInfo): Promise<void> {
  if (isMobile(testInfo)) {
    // On mobile the Sign In button lives inside the hamburger menu.
    await page.locator('header div.lg\\:hidden > button').click();
    await page.getByRole('button', { name: 'Sign In' }).click();
  } else {
    await page.getByRole('button', { name: 'Sign In' }).click();
  }
}
