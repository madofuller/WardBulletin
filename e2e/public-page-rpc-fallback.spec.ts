import { test, expect } from '@playwright/test';

/**
 * Test that public page works with both RPC and legacy 3-query paths
 * Ensures safe deployment before migration is applied
 */

test.describe('Public Page RPC Fallback', () => {
  test('should handle RPC not found and fall back to legacy path', async ({ page }) => {
    // Mock Supabase responses to simulate RPC not existing
    await page.route('**/rest/v1/rpc/get_public_bulletin_by_slug*', async (route) => {
      // Simulate PGRST202 (function not found)
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'PGRST202',
          message: 'function public.get_public_bulletin_by_slug(profile_slug_param => text) does not exist',
        }),
      });
    });

    // Mock the legacy 3-query path responses
    let queryCount = 0;
    await page.route('**/rest/v1/users?*', async (route) => {
      queryCount++;
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
      queryCount++;
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
      queryCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            key: 'bulletin-test-ward-ward_name',
            value: '"First Ward"',
            created_by: 'user-123',
          },
          {
            key: 'bulletin-test-ward-theme',
            value: '"Faith"',
            created_by: 'user-123',
          },
        ]),
      });
    });

    // Navigate to public page
    await page.goto('/test-ward');

    // Wait for content to load
    await page.waitForSelector('text=First Ward', { timeout: 10000 });

    // Verify bulletin content rendered
    await expect(page.locator('text=First Ward')).toBeVisible();
    await expect(page.locator('text=Sacrament Meeting')).toBeVisible();

    // Verify 3 queries were made (legacy path)
    expect(queryCount).toBe(3);

    // Check console for fallback warning
    const consoleMessages = [];
    page.on('console', (msg) => consoleMessages.push(msg.text()));

    // Should see fallback warning in console
    await page.waitForTimeout(1000);
    const hasFallbackWarning = consoleMessages.some((msg) =>
      msg.includes('RPC not') || msg.includes('legacy') || msg.includes('3-query')
    );
    expect(hasFallbackWarning).toBe(true);
  });

  test('should use RPC when available', async ({ page }) => {
    let rpcCalled = false;
    let legacyQueriesCount = 0;

    // Mock successful RPC response
    await page.route('**/rest/v1/rpc/get_public_bulletin_by_slug*', async (route) => {
      rpcCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
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
            ward_name: '"First Ward"',
            theme: '"Faith"',
            announcements: '[]',
            agenda: '[]',
          },
        }),
      });
    });

    // Track if legacy queries are made (should NOT be called)
    await page.route('**/rest/v1/users?*', async (route) => {
      legacyQueriesCount++;
      await route.continue();
    });
    await page.route('**/rest/v1/bulletins?*', async (route) => {
      legacyQueriesCount++;
      await route.continue();
    });
    await page.route('**/rest/v1/tokens?*', async (route) => {
      legacyQueriesCount++;
      await route.continue();
    });

    await page.goto('/test-ward');

    // Wait for content
    await page.waitForSelector('text=First Ward', { timeout: 10000 });

    // Verify RPC was called
    expect(rpcCalled).toBe(true);

    // Verify legacy queries were NOT made
    expect(legacyQueriesCount).toBe(0);

    // Verify content rendered
    await expect(page.locator('text=First Ward')).toBeVisible();
    await expect(page.locator('text=Sacrament Meeting')).toBeVisible();
  });

  test('should handle RPC error and fall back gracefully', async ({ page }) => {
    let fallbackUsed = false;

    // Mock RPC returning an error (not 404)
    await page.route('**/rest/v1/rpc/get_public_bulletin_by_slug*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal server error' }),
      });
    });

    // Mock legacy path
    await page.route('**/rest/v1/users?*', async (route) => {
      fallbackUsed = true;
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
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            key: 'bulletin-test-ward-ward_name',
            value: '"First Ward"',
            created_by: 'user-123',
          },
        ]),
      });
    });

    await page.goto('/test-ward');

    await page.waitForSelector('text=First Ward', { timeout: 10000 });

    // Fallback should have been used
    expect(fallbackUsed).toBe(true);
  });
});
