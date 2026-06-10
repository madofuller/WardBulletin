import { test, expect, type Page } from '@playwright/test';
import { watchErrors, gotoEditor } from './helpers';

/** Add the first announcement in the (empty) ward group and return its Quill editor. */
async function addFirstAnnouncement(page: Page) {
  await page.locator('#form-tab-announcements').click();
  await expect(page.locator('#form-tab-panel-announcements')).toBeVisible();
  await page.getByRole('button', { name: 'Add your first announcement' }).click();
  const editor = page.locator('#form-tab-panel-announcements .ql-editor').first();
  await expect(editor).toBeVisible();
  return editor;
}

test.describe('new features', () => {
  test('Zoom meeting link shows a Join anchor in the preview and disappears when cleared', async ({ page }) => {
    const errors = watchErrors(page);
    await gotoEditor(page);

    const input = page.locator('#meeting-link-input');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('type', 'url');

    await input.fill('https://zoom.us/j/123456789');

    const joinLink = page.locator('#tab-panel-program').getByRole('link', { name: 'Join via Zoom' });
    await expect(joinLink).toBeVisible();
    await expect(joinLink).toHaveAttribute('href', 'https://zoom.us/j/123456789');
    await expect(joinLink).toHaveAttribute('target', '_blank');
    await expect(joinLink).toHaveAttribute('rel', 'noopener noreferrer');

    // Clearing the field removes the anchor.
    await input.fill('');
    await expect(joinLink).toHaveCount(0);
    errors.assertClean();
  });

  test('Zoom link without protocol is normalized to https', async ({ page }) => {
    const errors = watchErrors(page);
    await gotoEditor(page);

    const input = page.locator('#meeting-link-input');
    // type=url field still accepts protocol-less text via state; set it directly through fill
    await input.fill('zoom.us/j/987654');
    const joinLink = page.locator('#tab-panel-program').getByRole('link', { name: 'Join via Zoom' });
    await expect(joinLink).toBeVisible();
    await expect(joinLink).toHaveAttribute('href', 'https://zoom.us/j/987654');
    errors.assertClean();
  });

  test('bare URL in an announcement is linkified in the preview', async ({ page }) => {
    const errors = watchErrors(page);
    await gotoEditor(page);

    const editor = await addFirstAnnouncement(page);
    await editor.click();
    await editor.pressSequentially('Sign up at https://forms.gle/test123 today');

    // Switch the preview to the announcements tab.
    await page.locator('#tab-announcements').click();
    const panel = page.locator('#tab-panel-announcements');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('Sign up at');

    const anchor = panel.locator('a[href="https://forms.gle/test123"]');
    await expect(anchor).toBeVisible();
    await expect(anchor).toHaveText('https://forms.gle/test123');
    await expect(anchor).toHaveAttribute('target', '_blank');
    await expect(anchor).toHaveAttribute('rel', /noopener/);
    // Styled as a link: blue + underlined (from the preview's [&_a] utilities).
    await expect(anchor).toHaveCSS('color', 'rgb(37, 99, 235)');
    await expect(anchor).toHaveCSS('text-decoration-line', 'underline');
    errors.assertClean();
  });

  test('www-style URL is linkified with https:// prepended', async ({ page }) => {
    const errors = watchErrors(page);
    await gotoEditor(page);

    const editor = await addFirstAnnouncement(page);
    await editor.click();
    await editor.pressSequentially('Visit www.example.com for details');

    await page.locator('#tab-announcements').click();
    const anchor = page
      .locator('#tab-panel-announcements')
      .locator('a[href="https://www.example.com"]');
    await expect(anchor).toBeVisible();
    await expect(anchor).toHaveText('www.example.com');
    await expect(anchor).toHaveAttribute('target', '_blank');
    await expect(anchor).toHaveAttribute('rel', /noopener/);
    errors.assertClean();
  });

  test('authored anchor (via Quill link tool) is preserved and opens safely', async ({ page }) => {
    const errors = watchErrors(page);
    await gotoEditor(page);

    const editor = await addFirstAnnouncement(page);
    await editor.click();
    await editor.pressSequentially('Sign up here');
    // Select the text and apply a link through the Quill toolbar.
    await editor.press('ControlOrMeta+a');
    await page.locator('#form-tab-panel-announcements .ql-toolbar .ql-link').first().click();
    const tooltipInput = page.locator('#form-tab-panel-announcements .ql-tooltip input');
    await expect(tooltipInput).toBeVisible();
    await tooltipInput.fill('https://example.org/info');
    await tooltipInput.press('Enter');

    await page.locator('#tab-announcements').click();
    const anchor = page
      .locator('#tab-panel-announcements')
      .locator('a[href="https://example.org/info"]');
    await expect(anchor).toBeVisible();
    await expect(anchor).toHaveText('Sign up here');
    // linkifyHtml normalizes every anchor to open in a new tab without opener leakage.
    await expect(anchor).toHaveAttribute('target', '_blank');
    await expect(anchor).toHaveAttribute('rel', /noopener/);
    errors.assertClean();
  });
});
