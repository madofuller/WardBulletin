import { test, expect, type Page, type CDPSession } from '@playwright/test';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load fixtures
const bulletinFixture = JSON.parse(readFileSync(join(__dirname, 'fixtures/public-bulletin.json'), 'utf-8'));
const userProfileFixture = JSON.parse(readFileSync(join(__dirname, 'fixtures/user-profile.json'), 'utf-8'));
const tokensFixture = JSON.parse(readFileSync(join(__dirname, 'fixtures/bulletin-tokens.json'), 'utf-8'));

interface PerformanceMetrics {
  totalTransferredBytes: number;
  jsBytes: number;
  cssBytes: number;
  requestCount: number;
  fcpTime: number;
  wardNameVisibleTime: number;
  programTextVisibleTime: number;
  totalLoadTime: number;
}

// Network throttling presets
const SLOW_3G_THROTTLING = {
  downloadThroughput: (400 * 1024) / 8, // 400 Kbps in bytes/s
  uploadThroughput: (400 * 1024) / 8,
  latency: 2000, // 2000ms RTT
};

const CONGESTED_WIFI_THROTTLING = {
  downloadThroughput: (1500 * 1024) / 8, // 1.5 Mbps in bytes/s
  uploadThroughput: (750 * 1024) / 8, // 750 Kbps up
  latency: 300, // 300ms RTT
};

async function setupNetworkThrottling(page: Page, profile: typeof SLOW_3G_THROTTLING) {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: profile.downloadThroughput,
    uploadThroughput: profile.uploadThroughput,
    latency: profile.latency,
  });
  return client;
}

async function setupSupabaseInterception(page: Page, profileSlug: string) {
  // Intercept Supabase REST API calls
  await page.route('**/rest/v1/users*', async (route) => {
    const url = new URL(route.request().url());
    
    // Handle profile lookup by slug
    if (url.searchParams.get('profile_slug')?.includes(profileSlug)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'content-range': '0-0/1',
        },
        body: JSON.stringify([userProfileFixture]),
      });
      return;
    }
    
    await route.fulfill({ status: 200, body: JSON.stringify([]) });
  });

  await page.route('**/rest/v1/bulletins*', async (route) => {
    const url = new URL(route.request().url());
    const select = url.searchParams.get('select');
    
    // Return the bulletin fixture
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(bulletinFixture),
    });
  });

  await page.route('**/rest/v1/tokens*', async (route) => {
    const url = new URL(route.request().url());
    const keys = url.searchParams.get('key');
    
    // Filter tokens based on the requested keys
    let filteredTokens = tokensFixture;
    if (keys) {
      const keyList = keys.split(',').map(k => k.trim().replace(/^in\.|^\(|\)$/g, ''));
      filteredTokens = tokensFixture.filter((token: any) => 
        keyList.some(k => token.key.includes(k.replace(/"/g, '')))
      );
    }
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'content-range': `0-${filteredTokens.length - 1}/${filteredTokens.length}`,
      },
      body: JSON.stringify(filteredTokens),
    });
  });

  // Block auth calls
  await page.route('**/auth/v1/**', async (route) => {
    await route.fulfill({ status: 200, body: JSON.stringify({}) });
  });
}

async function measurePerformance(page: Page, client: CDPSession): Promise<PerformanceMetrics> {
  const requests: { url: string; size: number; resourceType: string }[] = [];
  
  // Track network requests
  client.on('Network.responseReceived', async (params) => {
    const response = params.response;
    requests.push({
      url: response.url,
      size: response.encodedDataLength || 0,
      resourceType: params.type,
    });
  });

  const navigationStartTime = Date.now();
  
  // Start navigation and wait for the page to be in a reasonable state
  await page.goto('/test-ward', { waitUntil: 'domcontentloaded' });
  
  // Wait for First Contentful Paint
  const fcpTime = await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.name === 'first-contentful-paint') {
            observer.disconnect();
            resolve(entry.startTime);
          }
        }
      });
      observer.observe({ entryTypes: ['paint'] });
      
      // Fallback timeout
      setTimeout(() => {
        observer.disconnect();
        resolve(performance.now());
      }, 30000);
    });
  });

  // Wait for bulletin content to be visible (ward name is a good indicator)
  const wardNameSelector = 'text=Test Ward';
  await page.waitForSelector(wardNameSelector, { timeout: 120000 });
  const wardNameVisibleTime = Date.now() - navigationStartTime;
  
  // Wait for program text to be visible
  await page.waitForSelector('text=Faith in Jesus Christ', { timeout: 10000 }).catch(() => {});
  const programTextVisibleTime = Date.now() - navigationStartTime;

  // Wait a bit more for all resources to finish
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  const totalLoadTime = Date.now() - navigationStartTime;

  // Calculate metrics
  const totalTransferredBytes = requests.reduce((sum, req) => sum + req.size, 0);
  const jsBytes = requests
    .filter(req => req.resourceType === 'Script' || req.url.endsWith('.js'))
    .reduce((sum, req) => sum + req.size, 0);
  const cssBytes = requests
    .filter(req => req.resourceType === 'Stylesheet' || req.url.endsWith('.css'))
    .reduce((sum, req) => sum + req.size, 0);
  const requestCount = requests.length;

  return {
    totalTransferredBytes,
    jsBytes,
    cssBytes,
    requestCount,
    fcpTime,
    wardNameVisibleTime,
    programTextVisibleTime,
    totalLoadTime,
  };
}

function formatBytes(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatTime(ms: number): string {
  return `${(ms / 1000).toFixed(2)}s`;
}

test.describe('Public Bulletin Page Performance', () => {
  test('Branch - Cold cache on Slow 3G', async ({ page, browser }) => {
    test.setTimeout(180000); // 3 minutes
    const client = await setupNetworkThrottling(page, SLOW_3G_THROTTLING);
    await setupSupabaseInterception(page, 'test-ward');
    const metrics = await measurePerformance(page, client);
    
    console.log('\n=== BRANCH: Cold Cache, Slow 3G (400kbps/2000ms) ===');
    console.log(`Total Transferred: ${formatBytes(metrics.totalTransferredBytes)}`);
    console.log(`JavaScript: ${formatBytes(metrics.jsBytes)}`);
    console.log(`CSS: ${formatBytes(metrics.cssBytes)}`);
    console.log(`Requests: ${metrics.requestCount}`);
    console.log(`First Contentful Paint: ${formatTime(metrics.fcpTime)}`);
    console.log(`Ward Name Visible: ${formatTime(metrics.wardNameVisibleTime)}`);
    console.log(`Program Text Visible: ${formatTime(metrics.programTextVisibleTime)}`);
    console.log(`Total Load: ${formatTime(metrics.totalLoadTime)}`);
    console.log('========================================================\n');
    
    await page.screenshot({ path: 'e2e/screenshots/branch-slow3g-cold.png', fullPage: true });
    await expect(page.locator('text=Test Ward')).toBeVisible();
    await expect(page.locator('text=Faith in Jesus Christ')).toBeVisible();
    expect(metrics.wardNameVisibleTime).toBeLessThan(120000);
  });

  test('Branch - Repeat visit on Slow 3G', async ({ page, browser }) => {
    test.setTimeout(180000);
    const client = await setupNetworkThrottling(page, SLOW_3G_THROTTLING);
    await setupSupabaseInterception(page, 'test-ward');
    
    // First visit to populate cache
    await page.goto('/test-ward', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Test Ward', { timeout: 120000 });
    client.removeAllListeners();
    
    // Measure repeat visit
    const metrics = await measurePerformance(page, client);
    
    console.log('\n=== BRANCH: Repeat Visit, Slow 3G (400kbps/2000ms) ===');
    console.log(`Total Transferred: ${formatBytes(metrics.totalTransferredBytes)}`);
    console.log(`JavaScript: ${formatBytes(metrics.jsBytes)}`);
    console.log(`CSS: ${formatBytes(metrics.cssBytes)}`);
    console.log(`Requests: ${metrics.requestCount}`);
    console.log(`Ward Name Visible: ${formatTime(metrics.wardNameVisibleTime)}`);
    console.log(`Program Text Visible: ${formatTime(metrics.programTextVisibleTime)}`);
    console.log('=======================================================\n');
    
    await expect(page.locator('text=Test Ward')).toBeVisible();
  });

  test('Branch - Cold cache on Congested WiFi', async ({ page, browser }) => {
    test.setTimeout(120000);
    const client = await setupNetworkThrottling(page, CONGESTED_WIFI_THROTTLING);
    await setupSupabaseInterception(page, 'test-ward');
    const metrics = await measurePerformance(page, client);
    
    console.log('\n=== BRANCH: Cold Cache, Congested WiFi (1.5Mbps/300ms) ===');
    console.log(`Total Transferred: ${formatBytes(metrics.totalTransferredBytes)}`);
    console.log(`JavaScript: ${formatBytes(metrics.jsBytes)}`);
    console.log(`Requests: ${metrics.requestCount}`);
    console.log(`Ward Name Visible: ${formatTime(metrics.wardNameVisibleTime)}`);
    console.log(`Program Text Visible: ${formatTime(metrics.programTextVisibleTime)}`);
    console.log('============================================================\n');
    
    await page.screenshot({ path: 'e2e/screenshots/branch-wifi-cold.png', fullPage: true });
    await expect(page.locator('text=Test Ward')).toBeVisible();
  });

  test('Branch - Repeat visit on Congested WiFi', async ({ page, browser }) => {
    test.setTimeout(120000);
    const client = await setupNetworkThrottling(page, CONGESTED_WIFI_THROTTLING);
    await setupSupabaseInterception(page, 'test-ward');
    
    // First visit
    await page.goto('/test-ward', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Test Ward', { timeout: 60000 });
    client.removeAllListeners();
    
    // Measure repeat visit
    const metrics = await measurePerformance(page, client);
    
    console.log('\n=== BRANCH: Repeat Visit, Congested WiFi (1.5Mbps/300ms) ===');
    console.log(`Total Transferred: ${formatBytes(metrics.totalTransferredBytes)}`);
    console.log(`Requests: ${metrics.requestCount}`);
    console.log(`Ward Name Visible: ${formatTime(metrics.wardNameVisibleTime)}`);
    console.log(`Program Text Visible: ${formatTime(metrics.programTextVisibleTime)}`);
    console.log('=============================================================\n');
    
    await expect(page.locator('text=Test Ward')).toBeVisible();
  });
});
