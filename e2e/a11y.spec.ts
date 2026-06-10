import { test, expect } from '@playwright/test';
import { watchErrors, gotoEditor, openAuthModal, isMobile } from './helpers';

test.describe('accessibility', () => {
  test('document has a lang attribute', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', /^en/);
  });

  test('form tabs are wired with correct ARIA roles and resolvable aria-controls', async ({ page }) => {
    const errors = watchErrors(page);
    await gotoEditor(page);

    // The tab buttons live inside a tablist.
    const tablist = page.locator('ul[role="tablist"]', { has: page.locator('#form-tab-program') });
    await expect(tablist).toHaveCount(1);

    for (const tab of ['program', 'announcements', 'unitinfo'] as const) {
      const button = page.locator(`#form-tab-${tab}`);
      await expect(button).toHaveRole('tab');
      await button.click();
      await expect(button).toHaveAttribute('aria-selected', 'true');

      const controls = await button.getAttribute('aria-controls');
      expect(controls).toBe(`form-tab-panel-${tab}`);
      const panel = page.locator(`#${controls}`);
      await expect(panel).toBeVisible();
      await expect(panel).toHaveRole('tabpanel');
      await expect(panel).toHaveAttribute('aria-labelledby', `form-tab-${tab}`);
    }
    errors.assertClean();
  });

  test('preview tabs are wired with correct ARIA roles and resolvable aria-controls', async ({ page }, testInfo) => {
    const errors = watchErrors(page);
    await gotoEditor(page);

    // On mobile the unit-info preview tab is hidden until ward info exists.
    const tabs = isMobile(testInfo)
      ? (['program', 'announcements'] as const)
      : (['program', 'announcements', 'unitinfo'] as const);

    for (const tab of tabs) {
      const button = page.locator(`#tab-${tab}`);
      await expect(button).toHaveRole('tab');
      await button.click();
      await expect(button).toHaveAttribute('aria-selected', 'true');

      const controls = await button.getAttribute('aria-controls');
      expect(controls).toBe(`tab-panel-${tab}`);
      const panel = page.locator(`#${controls}`);
      await expect(panel).toBeVisible();
      await expect(panel).toHaveRole('tabpanel');
      await expect(panel).toHaveAttribute('aria-labelledby', `tab-${tab}`);
    }
    errors.assertClean();
  });

  test('tab buttons have a visible focus treatment', async ({ page }) => {
    await gotoEditor(page);
    // focus-visible ring utilities are present on every tab button.
    for (const id of ['#form-tab-program', '#form-tab-announcements', '#form-tab-unitinfo', '#tab-program']) {
      const className = (await page.locator(id).getAttribute('class')) ?? '';
      expect(className, `${id} should style :focus-visible`).toContain('focus-visible:');
    }
  });

  test('AuthModal is a dialog, labels its fields, and closes on Escape', async ({ page }, testInfo) => {
    const errors = watchErrors(page);
    await gotoEditor(page);

    await openAuthModal(page, testInfo);

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog.locator('#auth-email')).toBeVisible();
    await expect(dialog.locator('#auth-password')).toBeVisible();
    // Inputs are properly labelled.
    await expect(page.locator('label[for="auth-email"]')).toBeVisible();
    await expect(page.locator('label[for="auth-password"]')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    errors.assertClean();
  });
});
