import { chromium } from 'playwright';

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

const mockData = {
  rpc: {
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
  },
  user: { id: 'user-123', active_bulletin_id: 'bulletin-456', unit_type: 'ward', language: 'en' },
  bulletin: { id: 'bulletin-456', slug: 'test-ward', created_by: 'user-123', created_at: '2024-01-01T00:00:00Z', meeting_date: '2024-01-07', meeting_type: 'Sacrament Meeting', status: 'active', profile_slug: 'test-ward' },
  tokens: [
    { key: 'bulletin-test-ward-ward_name', value: '"First Ward"', created_by: 'user-123' },
    { key: 'bulletin-test-ward-theme', value: '"Faith"', created_by: 'user-123' },
  ],
};

async function measure(browser, url, throttle, warm = false) {
  const context = warm ? await browser.newContext() : await browser.newContext();
  const page = await context.newPage();
  const client = await context.newCDPSession(page);

  await page.route('**/rest/v1/rpc/get_public_bulletin_by_slug*', async (r) => {
    await new Promise((res) => setTimeout(res, throttle.latency));
    await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockData.rpc) });
  });
  await page.route('**/rest/v1/users?*', async (r) => {
    await new Promise((res) => setTimeout(res, throttle.latency));
    await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockData.user]) });
  });
  await page.route('**/rest/v1/bulletins?*', async (r) => {
    await new Promise((res) => setTimeout(res, throttle.latency));
    await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockData.bulletin]) });
  });
  await page.route('**/rest/v1/tokens?*', async (r) => {
    await new Promise((res) => setTimeout(res, throttle.latency));
    await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockData.tokens) });
  });

  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: throttle.downloadThroughput,
    uploadThroughput: throttle.uploadThroughput,
    latency: throttle.latency,
  });

  if (!warm) {
    await client.send('Network.clearBrowserCache');
    await client.send('Network.setCacheDisabled', { cacheDisabled: true });
  }

  const start = Date.now();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('h1:has-text("First Ward")', { timeout: 60000 });
  const end = Date.now();
  await context.close();
  return end - start;
}

const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
};

const url = process.argv[2] || 'http://localhost:5173/test-ward';
const browser = await chromium.launch();

console.log('\n🔍 Main Branch - Slow 3G Cold...');
const slow3gCold = [];
for (let i = 0; i < 5; i++) {
  const t = await measure(browser, url, SLOW_3G, false);
  slow3gCold.push(t);
  console.log(`  ${i + 1}: ${t}ms`);
}

console.log('\n🔍 Main Branch - Congested WiFi Cold...');
const congestedCold = [];
for (let i = 0; i < 5; i++) {
  const t = await measure(browser, url, CONGESTED_WIFI, false);
  congestedCold.push(t);
  console.log(`  ${i + 1}: ${t}ms`);
}

await browser.close();

console.log('\n✅ Main Branch Results:');
console.log(`Slow 3G Cold: ${median(slow3gCold)}ms`);
console.log(`Congested WiFi Cold: ${median(congestedCold)}ms`);
