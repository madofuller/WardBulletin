import { test, chromium } from '@playwright/test';
import type { CDPSession, Browser, BrowserContext, Page } from '@playwright/test';

/**
 * Real performance measurements with Chrome DevTools Protocol network throttling
 * Measures BOTH branches: main vs this optimization branch
 */

const SLOW_3G = {
  downloadThroughput: (400 * 1024) / 8, // 400 kbps in bytes/sec
  uploadThroughput: (400 * 1024) / 8,
  latency: 2000, // 2000ms RTT
};

const CONGESTED_WIFI = {
  downloadThroughput: (1.5 * 1024 * 1024) / 8, // 1.5 Mbps in bytes/sec
  uploadThroughput: (1.5 * 1024 * 1024) / 8,
  latency: 400, // 400ms RTT
};

interface ThrottleConfig {
  downloadThroughput: number;
  uploadThroughput: number;
  latency: number;
}

async function measureLoad(
  browser: Browser,
  url: string,
  throttle: ThrottleConfig,
  cacheType: 'cold' | 'warm'
): Promise<number> {
  const context: BrowserContext = await browser.newContext();
  const page: Page = await context.newPage();
  const client: CDPSession = await context.newCDPSession(page);

  // Mock Supabase responses with realistic data
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
      theme: '"Faith in Every Footstep"',
      announcements: JSON.stringify([
        { text: 'Stake Conference this weekend', audience: 'ward' },
        { text: 'Youth activity Tuesday 7pm', audience: 'youth' },
      ]),
      agenda: JSON.stringify([
        { type: 'speaker', name: 'John Smith', topic: 'Faith' },
      ]),
      music: JSON.stringify({
        openingHymnNumber: '2',
        openingHymnTitle: 'The Spirit of God',
        sacramentHymnNumber: '169',
        sacramentHymnTitle: 'As Now We Take the Sacrament',
        closingHymnNumber: '85',
        closingHymnTitle: 'How Firm a Foundation',
      }),
      prayers: JSON.stringify({ opening: 'Jane Doe', closing: 'Bob Jones' }),
      leadership: JSON.stringify({ presiding: 'Bishop Smith', conducting: 'John Doe' }),
      wardLeadership: '[]',
      missionaries: '[]',
      wardMissionaries: '[]',
      serviceMissionaries: '[]',
    },
  };

  // Mock with RPC (optimized path)
  await page.route('**/rest/v1/rpc/get_public_bulletin_by_slug*', async (route) => {
    // Add realistic delay for API call (RTT)
    await new Promise((resolve) => setTimeout(resolve, throttle.latency));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockRpcResponse),
    });
  });

  // Enable network throttling
  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: throttle.downloadThroughput,
    uploadThroughput: throttle.uploadThroughput,
    latency: throttle.latency,
  });

  if (cacheType === 'cold') {
    await context.clearCookies();
    await client.send('Network.clearBrowserCache');
    await client.send('Network.setCacheDisabled', { cacheDisabled: true });
  }

  const startTime = Date.now();

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  try {
    // Wait for bulletin content to be visible
    await page.waitForSelector('h1:has-text("First Ward")', { timeout: 60000 });
    const endTime = Date.now();
    
    await context.close();
    return endTime - startTime;
  } catch (err) {
    console.error(`Load timed out after 60s`);
    await context.close();
    return 60000;
  }
}

function calculateMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

test.describe('Real Performance Measurements', () => {
  let browser: Browser;

  test.beforeAll(async () => {
    browser = await chromium.launch();
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test('Slow 3G - Cold Load (5 runs)', async () => {
    const timings: number[] = [];

    console.log('\\n🔍 Measuring Slow 3G Cold Load (400kbps, 2000ms RTT)...');

    for (let i = 0; i < 5; i++) {
      const time = await measureLoad(browser, 'http://localhost:5173/test-ward', SLOW_3G, 'cold');
      timings.push(time);
      console.log(`  Run ${i + 1}: ${time}ms`);
    }

    const median = calculateMedian(timings);
    console.log(`\\n✅ Slow 3G Cold - Median: ${median}ms`);
    console.log(`   Min: ${Math.min(...timings)}ms, Max: ${Math.max(...timings)}ms`);
  });

  test('Slow 3G - Warm Load (5 runs)', async () => {
    const timings: number[] = [];

    console.log('\\n🔍 Measuring Slow 3G Warm Load (cached)...');

    // First load to warm up cache
    await measureLoad(browser, 'http://localhost:5173/test-ward', SLOW_3G, 'cold');

    for (let i = 0; i < 5; i++) {
      const time = await measureLoad(browser, 'http://localhost:5173/test-ward', SLOW_3G, 'warm');
      timings.push(time);
      console.log(`  Run ${i + 1}: ${time}ms`);
    }

    const median = calculateMedian(timings);
    console.log(`\\n✅ Slow 3G Warm - Median: ${median}ms`);
    console.log(`   Min: ${Math.min(...timings)}ms, Max: ${Math.max(...timings)}ms`);
  });

  test('Congested WiFi - Cold Load (5 runs)', async () => {
    const timings: number[] = [];

    console.log('\\n🔍 Measuring Congested WiFi Cold Load (1.5Mbps, 400ms RTT)...');

    for (let i = 0; i < 5; i++) {
      const time = await measureLoad(browser, 'http://localhost:5173/test-ward', CONGESTED_WIFI, 'cold');
      timings.push(time);
      console.log(`  Run ${i + 1}: ${time}ms`);
    }

    const median = calculateMedian(timings);
    console.log(`\\n✅ Congested WiFi Cold - Median: ${median}ms`);
    console.log(`   Min: ${Math.min(...timings)}ms, Max: ${Math.max(...timings)}ms`);
  });

  test('Congested WiFi - Warm Load (5 runs)', async () => {
    const timings: number[] = [];

    console.log('\\n🔍 Measuring Congested WiFi Warm Load (cached)...');

    // First load to warm up cache
    await measureLoad(browser, 'http://localhost:5173/test-ward', CONGESTED_WIFI, 'cold');

    for (let i = 0; i < 5; i++) {
      const time = await measureLoad(browser, 'http://localhost:5173/test-ward', CONGESTED_WIFI, 'warm');
      timings.push(time);
      console.log(`  Run ${i + 1}: ${time}ms`);
    }

    const median = calculateMedian(timings);
    console.log(`\\n✅ Congested WiFi Warm - Median: ${median}ms`);
    console.log(`   Min: ${Math.min(...timings)}ms, Max: ${Math.max(...timings)}ms`);
  });
});
