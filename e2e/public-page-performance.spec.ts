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
  contentVisibleTime: number;
  totalLoadTime: number;
}

// Slow 3G throttling preset
const SLOW_3G_THROTTLING = {
  downloadThroughput: (400 * 1024) / 8, // 400 Kbps in bytes/s
  uploadThroughput: (400 * 1024) / 8,
  latency: 2000, // 2000ms RTT
};

async function setupNetworkThrottling(page: Page) {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: SLOW_3G_THROTTLING.downloadThroughput,
    uploadThroughput: SLOW_3G_THROTTLING.uploadThroughput,
    latency: SLOW_3G_THROTTLING.latency,
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
  await page.waitForSelector(wardNameSelector, { timeout: 30000 });
  const contentVisibleTime = Date.now() - navigationStartTime;

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
    contentVisibleTime,
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
  test('Baseline - Cold cache on Slow 3G', async ({ page, browser }) => {
    // Setup network throttling
    const client = await setupNetworkThrottling(page);
    
    // Setup Supabase interception
    await setupSupabaseInterception(page, 'test-ward');
    
    // Measure performance
    const metrics = await measurePerformance(page, client);
    
    // Log results
    console.log('\n=== BASELINE METRICS (Cold Cache, Slow 3G) ===');
    console.log(`Total Transferred: ${formatBytes(metrics.totalTransferredBytes)}`);
    console.log(`JavaScript: ${formatBytes(metrics.jsBytes)}`);
    console.log(`CSS: ${formatBytes(metrics.cssBytes)}`);
    console.log(`Requests: ${metrics.requestCount}`);
    console.log(`First Contentful Paint: ${formatTime(metrics.fcpTime)}`);
    console.log(`Content Visible: ${formatTime(metrics.contentVisibleTime)}`);
    console.log(`Total Load: ${formatTime(metrics.totalLoadTime)}`);
    console.log('=============================================\n');
    
    // Take screenshot for reference
    await page.screenshot({ 
      path: 'e2e/screenshots/baseline-loaded.png',
      fullPage: true 
    });
    
    // Verify content is actually visible
    await expect(page.locator('text=Test Ward')).toBeVisible();
    await expect(page.locator('text=Faith in Jesus Christ')).toBeVisible();
    
    // Basic assertions - we expect slow times on Slow 3G
    expect(metrics.requestCount).toBeGreaterThan(0);
    expect(metrics.totalTransferredBytes).toBeGreaterThan(0);
  });

  test('Baseline - Repeat visit (warm cache)', async ({ page, browser }) => {
    // Setup network throttling
    const client = await setupNetworkThrottling(page);
    
    // Setup Supabase interception
    await setupSupabaseInterception(page, 'test-ward');
    
    // First visit to populate cache
    await page.goto('/test-ward', { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Test Ward');
    
    // Clear CDP listeners
    client.removeAllListeners();
    
    // Measure repeat visit
    const metrics = await measurePerformance(page, client);
    
    console.log('\n=== BASELINE METRICS (Warm Cache, Slow 3G) ===');
    console.log(`Total Transferred: ${formatBytes(metrics.totalTransferredBytes)}`);
    console.log(`JavaScript: ${formatBytes(metrics.jsBytes)}`);
    console.log(`CSS: ${formatBytes(metrics.cssBytes)}`);
    console.log(`Requests: ${metrics.requestCount}`);
    console.log(`First Contentful Paint: ${formatTime(metrics.fcpTime)}`);
    console.log(`Content Visible: ${formatTime(metrics.contentVisibleTime)}`);
    console.log(`Total Load: ${formatTime(metrics.totalLoadTime)}`);
    console.log('=============================================\n');
    
    // Verify content
    await expect(page.locator('text=Test Ward')).toBeVisible();
  });

  test('Content visibility under throttling', async ({ page }) => {
    const client = await setupNetworkThrottling(page);
    await setupSupabaseInterception(page, 'test-ward');
    
    const startTime = Date.now();
    await page.goto('/test-ward');
    
    // Check that skeleton/loading state appears quickly
    const hasLoadingState = await page.locator('.animate-spin, .skeleton, text=Loading').count();
    
    // Wait for actual content
    await page.waitForSelector('text=Test Ward', { timeout: 30000 });
    const wardNameVisibleTime = Date.now() - startTime;
    
    await page.waitForSelector('text=Faith in Jesus Christ', { timeout: 5000 });
    const themeVisibleTime = Date.now() - startTime;
    
    console.log('\n=== CONTENT VISIBILITY TIMELINE ===');
    console.log(`Ward Name Visible: ${formatTime(wardNameVisibleTime)}`);
    console.log(`Theme Visible: ${formatTime(themeVisibleTime)}`);
    console.log('===================================\n');
    
    // Take screenshot showing the loaded state
    await page.screenshot({ 
      path: 'e2e/screenshots/content-visible.png',
      fullPage: true 
    });
  });
});
