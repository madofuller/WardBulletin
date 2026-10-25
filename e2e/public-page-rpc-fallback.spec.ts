import { test, expect } from '@playwright/test';

/**
 * CRITICAL: proves deploy is safe before the RPC migration is applied.
 * Routes must be registered on the context before goto. The Supabase URL in
 * the test build is https://<project>.supabase.co, so match /rest/v1/... only.
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

async function installPublicRoutes(
  context: import('@playwright/test').BrowserContext,
  handlers: {
    rpc: (route: import('@playwright/test').Route) => Promise<void> | void;
    users?: (route: import('@playwright/test').Route) => Promise<void> | void;
    bulletins?: (route: import('@playwright/test').Route) => Promise<void> | void;
    tokens?: (route: import('@playwright/test').Route) => Promise<void> | void;
  },
) {
  await context.route('**/rest/v1/rpc/**', handlers.rpc);
  await context.route('**/rest/v1/users**', handlers.users ?? (async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([mockLegacyUser]),
    });
  }));
  await context.route('**/rest/v1/bulletins**', handlers.bulletins ?? (async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([mockLegacyBulletin]),
    });
  }));
  await context.route('**/rest/v1/tokens**', handlers.tokens ?? (async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockLegacyTokens),
    });
  }));
}

test('RPC success case: single query path', async ({ browser }) => {
  const context = await browser.newContext();
  let rpcCalled = false;
  let usersQueryCalled = false;

  await installPublicRoutes(context, {
    rpc: async (route) => {
      rpcCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockRpcData),
      });
    },
    users: async (route) => {
      usersQueryCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockLegacyUser]),
      });
    },
  });

  const page = await context.newPage();
  const requested: string[] = [];
  page.on('request', (req) => {
    if (req.url().includes('/rest/v1/')) requested.push(req.url());
  });

  await page.goto('/test-ward');
  await page.waitForSelector('h1:has-text("First Ward")', { timeout: 15000 });

  expect(rpcCalled, `RPC not seen. rest requests: ${requested.join(', ')}`).toBe(true);
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

  await installPublicRoutes(context, {
    rpc: async (route) => {
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
    },
    users: async (route) => {
      usersQueryCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockLegacyUser]),
      });
    },
    bulletins: async (route) => {
      bulletinsQueryCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockLegacyBulletin]),
      });
    },
    tokens: async (route) => {
      tokensQueryCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockLegacyTokens),
      });
    },
  });

  const page = await context.newPage();
  const requested: string[] = [];
  page.on('request', (req) => {
    if (req.url().includes('/rest/v1/')) requested.push(`${req.method()} ${req.url()}`);
  });

  await page.goto('/test-ward');
  await page.waitForSelector('h1:has-text("First Ward Fallback")', { timeout: 15000 });

  expect(rpcCalled, `RPC not seen. rest requests: ${requested.join(', ')}`).toBe(true);
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

  await installPublicRoutes(context, {
    rpc: async (route) => {
      rpcCalled = true;
      await route.abort('failed');
    },
    users: async (route) => {
      usersQueryCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockLegacyUser]),
      });
    },
  });

  const page = await context.newPage();
  await page.goto('/test-ward');
  await page.waitForSelector('h1:has-text("First Ward Fallback")', { timeout: 15000 });

  expect(rpcCalled).toBe(true);
  expect(usersQueryCalled).toBe(true);
  await context.close();
});
