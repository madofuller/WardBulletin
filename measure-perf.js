// Standalone performance measurement script
import { chromium } from '@playwright/test';

const SLOW_3G = {
  downloadThroughput: (400 * 1024) / 8,
  uploadThroughput: (400 * 1024) / 8,
  latency: 2000,
};

const CONGESTED_WIFI = {
  downloadThroughput: (1.5 * 1024 * 1024) / 8,
  uploadThroughput: (1.5 * 1024 * 1024) / 8,
  latency: 400,
};

const mockRpcResponse = {
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
  { key: 'bulletin-test-ward-ward_name', value: '"First Ward"', created_by: 'user-123' },
  { key: 'bulletin-test-ward-theme', value: '"Faith"', created_by: 'user-123' },
];

async function measureCold(browser, url, throttle) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const client = await context.newCDPSession(page);

  // Mock APIs
  await page.route('**/rest/v1/rpc/get_public_bulletin_by_slug*', async (route) => {
    await new Promise((r) => setTimeout(r, throttle.latency));
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRpcResponse) });
  });
  await page.route('**/rest/v1/users?*', async (route) => {
    await new Promise((r) => setTimeout(r, throttle.latency));
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockLegacyUser]) });
  });
  await page.route('**/rest/v1/bulletins?*', async (route) => {
    await new Promise((r) => setTimeout(r, throttle.latency));
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockLegacyBulletin]) });
  });
  await page.route('**/rest/v1/tokens?*', async (route) => {
    await new Promise((r) => setTimeout(r, throttle.latency));
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockLegacyTokens) });
  });

  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: throttle.downloadThroughput,
    uploadThroughput: throttle.uploadThroughput,
    latency: throttle.latency,
  });
  await client.send('Network.clearBrowserCache');
  await client.send('Network.setCacheDisabled', { cacheDisabled: true });

  const start = Date.now();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  try {
    await page.waitForSelector('h1:has-text("First Ward")', { timeout: 60000 });
    const end = Date.now();
    await context.close();
    return end - start;
  } catch {
    await context.close();
    return 60000;
  }
}

async function measureWarm(browser, persistentContext, url, throttle) {
  const page = await persistentContext.newPage();
  const client = await persistentContext.newCDPSession(page);

  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: throttle.downloadThroughput,
    uploadThroughput: throttle.uploadThroughput,
    latency: throttle.latency,
  });

  const start = Date.now();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  try {
    await page.waitForSelector('h1:has-text("First Ward")', { timeout: 60000 });
    const end = Date.now();
    await page.close();
    return end - start;
  } catch {
    await page.close();
    return 60000;
  }
}

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

async function run() {
  const url = process.argv[2] || 'http://localhost:5173/test-ward';
  const browser = await chromium.launch();

  console.log('\\n📊 Measuring:', url);

  // Slow 3G Cold
  const slow3gCold = [];
  for (let i = 0; i < 5; i++) {
    const time = await measureCold(browser, url, SLOW_3G);
    slow3gCold.push(time);
    console.log(`Slow 3G Cold ${i + 1}: ${time}ms`);
  }

  // Slow 3G Warm (persistent context)
  const persistentCtx = await browser.newContext();
  const setupPage = await persistentCtx.newPage();
  await setupPage.route('**/rest/v1/rpc/get_public_bulletin_by_slug*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRpcResponse) }));
  await setupPage.route('**/rest/v1/users?*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockLegacyUser]) }));
  await setupPage.route('**/rest/v1/bulletins?*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockLegacyBulletin]) }));
  await setupPage.route('**/rest/v1/tokens?*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockLegacyTokens) }));
  await setupPage.goto(url);
  await setupPage.waitForSelector('h1:has-text("First Ward")', { timeout: 60000 });
  await setupPage.close();
  await new Promise((r) => setTimeout(r, 2000)); // Let SW activate

  const slow3gWarm = [];
  for (let i = 0; i < 5; i++) {
    const time = await measureWarm(browser, persistentCtx, url, SLOW_3G);
    slow3gWarm.push(time);
    console.log(`Slow 3G Warm ${i + 1}: ${time}ms`);
  }
  await persistentCtx.close();

  // Congested WiFi Cold
  const congestedCold = [];
  for (let i = 0; i < 5; i++) {
    const time = await measureCold(browser, url, CONGESTED_WIFI);
    congestedCold.push(time);
    console.log(`Congested WiFi Cold ${i + 1}: ${time}ms`);
  }

  // Congested WiFi Warm
  const persistentCtx2 = await browser.newContext();
  const setupPage2 = await persistentCtx2.newPage();
  await setupPage2.route('**/rest/v1/rpc/get_public_bulletin_by_slug*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRpcResponse) }));
  await setupPage2.route('**/rest/v1/users?*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockLegacyUser]) }));
  await setupPage2.route('**/rest/v1/bulletins?*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockLegacyBulletin]) }));
  await setupPage2.route('**/rest/v1/tokens?*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockLegacyTokens) }));
  await setupPage2.goto(url);
  await setupPage2.waitForSelector('h1:has-text("First Ward")', { timeout: 60000 });
  await setupPage2.close();
  await new Promise((r) => setTimeout(r, 2000));

  const congestedWarm = [];
  for (let i = 0; i < 5; i++) {
    const time = await measureWarm(browser, persistentCtx2, url, CONGESTED_WIFI);
    congestedWarm.push(time);
    console.log(`Congested WiFi Warm ${i + 1}: ${time}ms`);
  }
  await persistentCtx2.close();

  await browser.close();

  console.log('\\n✅ Results:');
  console.log(`Slow 3G Cold: ${median(slow3gCold)}ms (${Math.min(...slow3gCold)}-${Math.max(...slow3gCold)})`);
  console.log(`Slow 3G Warm: ${median(slow3gWarm)}ms (${Math.min(...slow3gWarm)}-${Math.max(...slow3gWarm)})`);
  console.log(`Congested WiFi Cold: ${median(congestedCold)}ms (${Math.min(...congestedCold)}-${Math.max(...congestedCold)})`);
  console.log(`Congested WiFi Warm: ${median(congestedWarm)}ms (${Math.min(...congestedWarm)}-${Math.max(...congestedWarm)})`);
}

run();
