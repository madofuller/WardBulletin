import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const bulletinFixture = JSON.parse(readFileSync(join(__dirname, 'fixtures/public-bulletin.json'), 'utf-8'));
const userProfileFixture = JSON.parse(readFileSync(join(__dirname, 'fixtures/user-profile.json'), 'utf-8'));
const tokensFixture = JSON.parse(readFileSync(join(__dirname, 'fixtures/bulletin-tokens.json'), 'utf-8'));

async function setupSupabaseInterception(page: any, profileSlug: string) {
  await page.route('**/rest/v1/users*', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([userProfileFixture]),
    });
  });

  await page.route('**/rest/v1/bulletins*', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([bulletinFixture]),
    });
  });

  await page.route('**/rest/v1/tokens*', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(tokensFixture),
    });
  });
}

test.describe('Lightweight Public Page', () => {
  test('should load minimal JS bundle', async ({ page }) => {
    const jsResources: string[] = [];
    
    page.on('response', (response) => {
      const url = response.url();
      if (url.endsWith('.js') && url.includes('/assets/')) {
        jsResources.push(url.split('/').pop() || '');
      }
    });
    
    await setupSupabaseInterception(page, 'test-ward');
    await page.goto('/test-ward');
    
    // Wait for content
    await page.waitForSelector('text=Test Ward', { timeout: 10000 });
    
    console.log('\n=== Lightweight Public Page Bundle ===');
    console.log(`JS files loaded: ${jsResources.length}`);
    jsResources.forEach(file => console.log(`  - ${file}`));
    console.log('======================================\n');
    
    // Should only load the tiny public bundle
    expect(jsResources.length).toBeLessThanOrEqual(2); // public.js + maybe sw
    expect(jsResources.some(f => f.startsWith('public-'))).toBe(true);
    
    // Should NOT load React or heavy chunks
    expect(jsResources.some(f => f.includes('react'))).toBe(false);
    expect(jsResources.some(f => f.includes('supabase'))).toBe(false);
    expect(jsResources.some(f => f.includes('i18n'))).toBe(false);
  });
  
  test('should display bulletin content correctly', async ({ page }) => {
    await setupSupabaseInterception(page, 'test-ward');
    await page.goto('/test-ward');
    
    // Wait for and verify content
    await expect(page.locator('text=Test Ward')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Faith in Jesus Christ')).toBeVisible();
    await expect(page.locator('text=Welcome to our worship service')).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ 
      path: 'e2e/screenshots/lightweight-loaded.png',
      fullPage: true 
    });
  });
  
  test('should load fast on Slow 3G', async ({ page }) => {
    test.setTimeout(60000);
    
    // Setup Slow 3G throttling
    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: (400 * 1024) / 8,
      uploadThroughput: (400 * 1024) / 8,
      latency: 2000,
    });
    
    await setupSupabaseInterception(page, 'test-ward');
    
    const startTime = Date.now();
    await page.goto('/test-ward');
    
    // Wait for ward name to be visible
    await page.waitForSelector('text=Test Ward', { timeout: 30000 });
    const wardNameTime = Date.now() - startTime;
    
    // Wait for program text
    await page.waitForSelector('text=Faith in Jesus Christ', { timeout: 5000 });
    const programTextTime = Date.now() - startTime;
    
    console.log('\n=== Lightweight Performance on Slow 3G ===');
    console.log(`Ward Name Visible: ${(wardNameTime / 1000).toFixed(2)}s`);
    console.log(`Program Text Visible: ${(programTextTime / 1000).toFixed(2)}s`);
    console.log('==========================================\n');
    
    // Should be under 10s even on Slow 3G
    expect(wardNameTime).toBeLessThan(10000);
    expect(programTextTime).toBeLessThan(15000);
  });
});
