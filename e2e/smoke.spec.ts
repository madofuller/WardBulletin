import { test, expect } from '@playwright/test';
import { watchErrors } from './helpers';

/**
 * Smoke coverage: every public route renders a known landmark and produces
 * no unexpected JS exceptions or console errors (dummy-Supabase noise is
 * allowlisted in helpers.ts).
 */

const staticRoutes: Array<{ path: string; heading: string | RegExp }> = [
  { path: '/about', heading: 'About WardBulletin' },
  { path: '/how-to-use', heading: 'How to Use WardBulletin' },
  { path: '/contact', heading: 'Contact' },
  { path: '/guide/create-ward-bulletin', heading: 'How to Create a Great Ward Bulletin' },
  { path: '/guide/bulletin-templates', heading: 'Ward Bulletin Templates & Ideas' },
  { path: '/guide/sacrament-meeting-program', heading: 'Sacrament Meeting Program Guide' },
];

test.describe('smoke', () => {
  test('editor (/) loads with form and live preview', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'WardBulletin', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Create your own bulletin' })).toBeVisible();
    // Form and preview hydrate
    await expect(page.locator('#form-ward-name')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('#tab-panel-program')).toBeVisible();
    errors.assertClean();
  });

  for (const { path, heading } of staticRoutes) {
    test(`static page ${path} loads`, async ({ page }) => {
      const errors = watchErrors(page);
      await page.goto(path);
      await expect(
        page.getByRole('heading', { name: heading, exact: true, level: 1 })
      ).toBeVisible({ timeout: 15_000 });
      errors.assertClean();
    });
  }

  test('baptism editor (/baptism) loads', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/baptism');
    await expect(page.getByRole('heading', { name: 'Program Details' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('The Baptism of').first()).toBeVisible();
    errors.assertClean();
  });

  test('public bulletin viewer (/:slug) degrades gracefully with no backend', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/e2e-nonexistent-ward-slug');
    // With dummy Supabase the query fails (after react-query retries) — the app
    // must show its friendly error/empty state, not a white screen.
    await expect(
      page.getByRole('heading', { name: /Bulletin Not Available|No Bulletin Published/ })
    ).toBeVisible({ timeout: 25_000 });
    // Escape hatch back to the editor is offered.
    await expect(page.getByText(/create your own bulletin/i).first()).toBeVisible();
    errors.assertClean();
  });
});
