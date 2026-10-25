import { test, expect } from '@playwright/test';

/**
 * CRITICAL: Proves deployment is safe before migration
 */

test('RPC fallback to legacy 3-query path when RPC returns 404', async ({ page }) => {
  let rpcCalled = false;
  let usersQueryCalled = false;
  let bulletinsQueryCalled = false;
  let tokensQueryCalled = false;

  // Mock RPC returning 404 (function not found)
  await page.route('**/rest/v1/rpc/get_public_bulletin_by_slug**', async (route) => {
    rpcCalled = true;
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 'PGRST202',
        message: 'Could not find the function',
        details: null,
        hint: null,
      }),
    });
  });

  // Mock legacy 3-query path
  await page.route('**/rest/v1/users?*', async (route) => {
    usersQueryCalled = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'user-123',
          active_bulletin_id: 'bulletin-456',
          unit_type: 'ward',
          language: 'en',
        },
      ]),
    });
  });

  await page.route('**/rest/v1/bulletins?*', async (route) => {
    bulletinsQueryCalled = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'bulletin-456',
          slug: 'test-ward',
          created_by: 'user-123',
          created_at: '2024-01-01T00:00:00Z',
          meeting_date: '2024-01-07',
          meeting_type: 'Sacrament Meeting',
          status: 'active',
          profile_slug: 'test-ward',
        },
      ]),
    });
  });

  await page.route('**/rest/v1/tokens?*', async (route) => {
    tokensQueryCalled = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          key: 'bulletin-test-ward-ward_name',
          value: '"First Ward Fallback Test"',
          created_by: 'user-123',
        },
        {
          key: 'bulletin-test-ward-theme',
          value: '"Faith"',
          created_by: 'user-123',
        },
        {
          key: 'bulletin-test-ward-announcements',
          value: '[]',
          created_by: 'user-123',
        },
        {
          key: 'bulletin-test-ward-agenda',
          value: '[]',
          created_by: 'user-123',
        },
        {
          key: 'bulletin-test-ward-music',
          value: '{}',
          created_by: 'user-123',
        },
        {
          key: 'bulletin-test-ward-prayers',
          value: '{}',
          created_by: 'user-123',
        },
        {
          key: 'bulletin-test-ward-leadership',
          value: '{}',
          created_by: 'user-123',
        },
        {
          key: 'bulletin-test-ward-wardLeadership',
          value: '[]',
          created_by: 'user-123',
        },
        {
          key: 'bulletin-test-ward-missionaries',
          value: '[]',
          created_by: 'user-123',
        },
        {
          key: 'bulletin-test-ward-wardMissionaries',
          value: '[]',
          created_by: 'user-123',
        },
        {
          key: 'bulletin-test-ward-serviceMissionaries',
          value: '[]',
          created_by: 'user-123',
        },
      ]),
    });
  });

  await page.goto('/test-ward');

  // Wait for bulletin to render
  await page.waitForSelector('text=First Ward Fallback Test', { timeout: 15000 });

  // Verify RPC was attempted
  expect(rpcCalled).toBe(true);

  // Verify legacy 3-query path was used
  expect(usersQueryCalled).toBe(true);
  expect(bulletinsQueryCalled).toBe(true);
  expect(tokensQueryCalled).toBe(true);

  // Verify bulletin rendered correctly
  await expect(page.locator('text=First Ward Fallback Test')).toBeVisible();
  await expect(page.locator('text=Sacrament Meeting')).toBeVisible();
});
