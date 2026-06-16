import { test, expect } from '@playwright/test';
import { watchErrors, gotoEditor } from './helpers';

test.describe('bulletin editor', () => {
  test('typing a ward name updates the live preview', async ({ page }) => {
    const errors = watchErrors(page);
    await gotoEditor(page);

    await page.locator('#form-ward-name').fill('Maple Grove Ward');
    await expect(page.locator('#tab-panel-program')).toContainText('Maple Grove Ward');
    errors.assertClean();
  });

  test('picking a date updates the live preview', async ({ page }) => {
    const errors = watchErrors(page);
    await gotoEditor(page);

    await page.locator('#form-date').fill('2026-06-14');
    await expect(page.locator('#form-date')).toHaveValue('2026-06-14');
    await expect(page.locator('#tab-panel-program')).toContainText('June 14, 2026');
    errors.assertClean();
  });

  test('form tabs switch by click', async ({ page }) => {
    const errors = watchErrors(page);
    await gotoEditor(page);

    await expect(page.locator('#form-tab-panel-program')).toBeVisible();

    await page.locator('#form-tab-announcements').click();
    await expect(page.locator('#form-tab-announcements')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#form-tab-panel-announcements')).toBeVisible();
    await expect(page.locator('#form-tab-panel-program')).toHaveCount(0);

    await page.locator('#form-tab-unitinfo').click();
    await expect(page.locator('#form-tab-unitinfo')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#form-tab-panel-unitinfo')).toBeVisible();

    await page.locator('#form-tab-program').click();
    await expect(page.locator('#form-tab-panel-program')).toBeVisible();
    errors.assertClean();
  });

  test('form tabs support arrow-key navigation with roving tabindex', async ({ page }) => {
    const errors = watchErrors(page);
    await gotoEditor(page);

    const program = page.locator('#form-tab-program');
    const announcements = page.locator('#form-tab-announcements');
    const unitinfo = page.locator('#form-tab-unitinfo');

    await program.click();
    await expect(program).toBeFocused();
    await expect(program).toHaveAttribute('tabindex', '0');
    await expect(announcements).toHaveAttribute('tabindex', '-1');
    await expect(unitinfo).toHaveAttribute('tabindex', '-1');

    // ArrowRight moves selection + focus to the next tab.
    await program.press('ArrowRight');
    await expect(announcements).toBeFocused();
    await expect(announcements).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#form-tab-panel-announcements')).toBeVisible();
    await expect(announcements).toHaveAttribute('tabindex', '0');
    await expect(program).toHaveAttribute('tabindex', '-1');

    // ArrowLeft moves back.
    await announcements.press('ArrowLeft');
    await expect(program).toBeFocused();
    await expect(program).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#form-tab-panel-program')).toBeVisible();

    // ArrowLeft from the first tab wraps around to the last.
    await program.press('ArrowLeft');
    await expect(unitinfo).toBeFocused();
    await expect(unitinfo).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#form-tab-panel-unitinfo')).toBeVisible();
    errors.assertClean();
  });

  test('draft persists to localStorage and survives a reload', async ({ page }) => {
    const errors = watchErrors(page);
    await gotoEditor(page);

    await page.locator('#form-ward-name').fill('Persistence Test Ward');

    // Draft save is debounced (400ms) — poll the storage key instead of sleeping.
    await expect
      .poll(
        async () =>
          page.evaluate(() => localStorage.getItem('draft_bulletin') ?? ''),
        { timeout: 5_000 }
      )
      .toContain('Persistence Test Ward');

    await page.reload();
    await expect(page.locator('#form-ward-name')).toHaveValue('Persistence Test Ward', {
      timeout: 15_000,
    });
    await expect(page.locator('#tab-panel-program')).toContainText('Persistence Test Ward');
    errors.assertClean();
  });
});
