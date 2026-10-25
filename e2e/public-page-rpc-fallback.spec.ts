import { test, expect } from '@playwright/test';

/**
 * CRITICAL: Proves deployment is safe before migration
 * Tests RPC fallback to legacy 3-query path on any failure
 */

const mockRpcData = {
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
    theme: '"Faith and Prayer"',
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
};

const mockLegacyUser = {
  id: 'user-123',
  active_bulletin_id: 'bulletin-456',
  unit_type: 'ward',
  language: 'en',
};

const mockLegacyBulletin = {
  id: 'bulletin-456',
  slug: 'test-ward',
  created_by: 'user-123',
  created_at: '2024-01-01T00:00:00Z',
  meeting_date: '2024-01-07',
  meeting_type: 'Sacrament Meeting',
  status: 'active',
  profile_slug: 'test-ward',
};

const mockLegacyTokens = [
  { key: 'bulletin-test-ward-ward_name', value: '"First Ward Fallback"', created_by: 'user-123' },
  { key: 'bulletin-test-ward-theme', value: '"Faith"', created_by: 'user-123' },
  { key: 'bulletin-test-ward-announcements', value: '[]', created_by: 'user-123' },
  { key: 'bulletin-test-ward-agenda', value: '[]', created_by: 'user-123' },
  { key: 'bulletin-test-ward-music', value: '{}', created_by: 'user-123' },
  { key: 'bulletin-test-ward-prayers', value: '{}', created_by: 'user-123' },
  { key: 'bulletin-test-ward-leadership', value: '{}', created_by: 'user-123' },
  { key: 'bulletin-test-ward-wardLeadership', value: '[]', created_by: 'user-123' },
  { key: 'bulletin-test-ward-missionaries', value: '[]', created_by: 'user-123' },
  { key: 'bulletin-test-ward-wardMissionaries', value: '[]', created_by: 'user-123' },
  { key: 'bulletin-test-ward-serviceMissionaries', value: '[]', created_by: 'user-123' },
];

test('RPC success case: single query path', async ({ browser }) => {
  const context = await browser.newContext();
  let rpcCalled = false;
  let usersQueryCalled = false;

  // Set up routes at context level BEFORE creating page
  await context.route('**/rest/v1/rpc/get_public_bulletin_by_slug*', async (route) => {
    rpcCalled = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockRpcData),
    });
  });

  await context.route('**/rest/v1/users*', async (route) => {
    usersQueryCalled = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([mockLegacyUser]),
    });
  });

  const page = await context.newPage();
  await page.goto('/test-ward');

  // Wait for bulletin to render
  await page.waitForSelector('h1:has-text("First Ward")', { timeout: 15000 });

  // Verify RPC was used (not legacy)
  expect(rpcCalled).toBe(true);
  expect(usersQueryCalled).toBe(false);

  await expect(page.locator('h1:has-text("First Ward")')).toBeVisible();
  await context.close();
});

test('RPC fallback: 404 triggers legacy 3-query path', async ({ browser }) => {
  const context = await browser.newContext();
  let rpcCalled = false;
  let usersQueryCalled = false;
  let bulletinsQueryCalled = false;
  let tokensQueryCalled = false;

  // RPC returns 404 (function not found)
  await context.route('**/rest/v1/rpc/get_public_bulletin_by_slug*', async (route) => {
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
  await context.route('**/rest/v1/users*', async (route) => {
    usersQueryCalled = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([mockLegacyUser]),
    });
  });

  await context.route('**/rest/v1/bulletins*', async (route) => {
    bulletinsQueryCalled = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockLegacyBulletin),
    });
  });

  await context.route('**/rest/v1/tokens*', async (route) => {
    tokensQueryCalled = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockLegacyTokens),
    });
  });

  const page = await context.newPage();
  await page.goto('/test-ward');

  // Wait for bulletin to render with fallback data
  await page.waitForSelector('h1:has-text("First Ward Fallback")', { timeout: 15000 });

  // Verify RPC was attempted, then fell back to legacy
  expect(rpcCalled).toBe(true);
  expect(usersQueryCalled).toBe(true);
  expect(bulletinsQueryCalled).toBe(true);
  expect(tokensQueryCalled).toBe(true);

  await expect(page.locator('h1:has-text("First Ward Fallback")')).toBeVisible();
  await context.close();
});

test('RPC fallback: network error triggers legacy path', async ({ browser }) => {
  const context = await browser.newContext();
  let rpcCalled = false;
  let usersQueryCalled = false;

  // RPC network failure
  await context.route('**/rest/v1/rpc/get_public_bulletin_by_slug*', async (route) => {
    rpcCalled = true;
    await route.abort('failed');
  });

  // Mock legacy path
  await context.route('**/rest/v1/users*', async (route) => {
    usersQueryCalled = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([mockLegacyUser]),
    });
  });

  await context.route('**/rest/v1/bulletins*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockLegacyBulletin),
    });
  });

  await context.route('**/rest/v1/tokens*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockLegacyTokens),
    });
  });

  const page = await context.newPage();
  await page.goto('/test-ward');

  await page.waitForSelector('h1:has-text("First Ward Fallback")', { timeout: 15000 });

  expect(rpcCalled).toBe(true);
  expect(usersQueryCalled).toBe(true);

  await context.close();
});
