import { test, expect } from '@playwright/test';

/**
 * Test that public page works with both RPC and legacy 3-query paths
 * Ensures safe deployment before migration is applied
 */

const mockData = {
  user: {
    id: 'user-123',
    active_bulletin_id: 'bulletin-456',
    unit_type: 'ward',
    language: 'en',
  },
  bulletin: {
    id: 'bulletin-456',
    slug: 'test-ward',
    created_by: 'user-123',
    created_at: '2024-01-01T00:00:00Z',
    meeting_date: '2024-01-07',
    meeting_type: 'Sacrament Meeting',
    status: 'active',
    profile_slug: 'test-ward',
  },
  tokens: [
    {
      key: 'bulletin-test-ward-ward_name',
      value: '"First Ward Test"',
      created_by: 'user-123',
    },
    {
      key: 'bulletin-test-ward-theme',
      value: '"Faith in Testing"',
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
  ],
  rpc_response: {
    id: 'bulletin-456',
    slug: 'test-ward',
    created_by: 'user-123',
    created_at: '2024-01-01T00:00:00Z',
    meeting_date: '2024-01-07',
    meeting_type: 'Sacrament Meeting',
    profile_slug: 'test-ward',
    profile_unit_type: 'ward',
    profile_language: 'en',
    tokens: {
      ward_name: '"First Ward Test"',
      theme: '"Faith in Testing"',
      announcements: '[]',
      agenda: '[]',
      music: '{}',
      prayers: '{}',
      leadership: '{}',
      wardLeadership: '[]',
      missionaries: '[]',
      wardMissionaries: '[]',
      serviceMissionaries: '[]',
    },
  },
};

test.describe('Public Page RPC Fallback', () => {
  test('should fall back to legacy 3-query path when RPC returns 404', async ({ page }) => {
    let rpcCalled = false;
    let legacyUsersQueryCount = 0;
    let legacyBulletinsQueryCount = 0;
    let legacyTokensQueryCount = 0;

    // Setup routes BEFORE navigation
    await page.route('**/rest/v1/rpc/get_public_bulletin_by_slug*', async (route) => {
      rpcCalled = true;
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'PGRST202',
          message: 'function public.get_public_bulletin_by_slug does not exist',
        }),
      });
    });

    await page.route('**/rest/v1/users?*', async (route) => {
      legacyUsersQueryCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockData.user]),
      });
    });

    await page.route('**/rest/v1/bulletins?*', async (route) => {
      legacyBulletinsQueryCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockData.bulletin]),
      });
    });

    await page.route('**/rest/v1/tokens?*', async (route) => {
      legacyTokensQueryCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData.tokens),
      });
    });

    // Navigate to public page
    await page.goto('/test-ward');

    // Wait for bulletin content
    await page.waitForSelector('h1:has-text("First Ward Test")', { timeout: 15000 });

    // Verify RPC was attempted
    expect(rpcCalled).toBe(true);

    // Verify legacy 3-query path was used
    expect(legacyUsersQueryCount).toBe(1);
    expect(legacyBulletinsQueryCount).toBe(1);
    expect(legacyTokensQueryCount).toBe(1);

    // Verify content rendered
    await expect(page.locator('h1').filter({ hasText: 'First Ward Test' })).toBeVisible();
    await expect(page.locator('text=Sacrament Meeting')).toBeVisible();
  });

  test('should use RPC when it exists and returns success', async ({ page }) => {
    let rpcCalled = false;
    let legacyQueryCount = 0;

    // Setup routes BEFORE navigation
    await page.route('**/rest/v1/rpc/get_public_bulletin_by_slug*', async (route) => {
      rpcCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData.rpc_response),
      });
    });

    // Track if legacy queries are made (should NOT be called)
    await page.route('**/rest/v1/users?*', async (route) => {
      legacyQueryCount++;
      await route.continue();
    });
    await page.route('**/rest/v1/bulletins?*', async (route) => {
      legacyQueryCount++;
      await route.continue();
    });
    await page.route('**/rest/v1/tokens?*', async (route) => {
      legacyQueryCount++;
      await route.continue();
    });

    await page.goto('/test-ward');

    // Wait for content
    await page.waitForSelector('h1:has-text("First Ward Test")', { timeout: 15000 });

    // Verify RPC was used
    expect(rpcCalled).toBe(true);

    // Verify legacy queries were NOT made
    expect(legacyQueryCount).toBe(0);

    // Verify content rendered
    await expect(page.locator('h1').filter({ hasText: 'First Ward Test' })).toBeVisible();
    await expect(page.locator('text=Sacrament Meeting')).toBeVisible();
  });
});
