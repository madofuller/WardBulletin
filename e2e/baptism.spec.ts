import { test, expect } from '@playwright/test';
import { watchErrors } from './helpers';

test.describe('baptism program editor (/baptism)', () => {
  test('loads with form and preview', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/baptism');
    await expect(page.getByRole('heading', { name: 'Program Details' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('/ Baptism Program')).toBeVisible();
    await expect(page.getByText('The Baptism of').first()).toBeVisible();
    errors.assertClean();
  });

  test('entering a candidate name renders it in the preview', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/baptism');
    await expect(page.getByRole('heading', { name: 'Program Details' })).toBeVisible({ timeout: 15_000 });

    const candidateInput = page.getByPlaceholder('Candidate name').first();
    await candidateInput.fill('Emma Johnson');

    // The name appears in the on-screen preview (h3) and again in the hidden
    // print layout (h1/h2), so target the preview heading specifically.
    await expect(page.getByRole('heading', { name: 'Emma Johnson', level: 3 })).toBeVisible();
    errors.assertClean();
  });

  test('program is persisted to localStorage and survives a reload', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/baptism');
    await expect(page.getByRole('heading', { name: 'Program Details' })).toBeVisible({ timeout: 15_000 });

    await page.getByPlaceholder('Candidate name').first().fill('Liam Anderson');

    await expect
      .poll(
        async () =>
          page.evaluate(() => localStorage.getItem('baptism-program:default') ?? ''),
        { timeout: 5_000 }
      )
      .toContain('Liam Anderson');

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Program Details' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByPlaceholder('Candidate name').first()).toHaveValue('Liam Anderson');
    await expect(page.getByRole('heading', { name: 'Liam Anderson', level: 3 })).toBeVisible();
    errors.assertClean();
  });
});
