import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load fixtures
const bulletinFixture = JSON.parse(readFileSync(join(__dirname, 'fixtures/public-bulletin.json'), 'utf-8'));
const userProfileFixture = JSON.parse(readFileSync(join(__dirname, 'fixtures/user-profile.json'), 'utf-8'));
const tokensFixture = JSON.parse(readFileSync(join(__dirname, 'fixtures/bulletin-tokens.json'), 'utf-8'));

test.describe('Public Page Bundle Analysis', () => {
  test('should not load editor or PDF chunks on public page', async ({ page }) => {
    const loadedResources: string[] = [];
    
    // Track all JavaScript resources loaded
    page.on('response', (response) => {
      const url = response.url();
      if (url.endsWith('.js')) {
        loadedResources.push(url);
      }
    });
    
    // Setup Supabase interception
    await page.route('**/rest/v1/users*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'content-range': '0-0/1' },
        body: JSON.stringify([userProfileFixture]),
      });
    });

    await page.route('**/rest/v1/bulletins*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(bulletinFixture),
      });
    });

    await page.route('**/rest/v1/tokens*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'content-range': `0-${tokensFixture.length - 1}/${tokensFixture.length}` },
        body: JSON.stringify(tokensFixture),
      });
    });

    await page.route('**/auth/v1/**', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({}) });
    });
    
    // Navigate to public page
    await page.goto('/test-ward');
    
    // Wait for content to load
    await page.waitForSelector('text=Test Ward', { timeout: 10000 }).catch(() => {
      console.log('Content did not load, but continuing with bundle analysis');
    });
    
    // Wait a bit more for lazy chunks
    await page.waitForTimeout(2000);
    
    // Analyze loaded resources
    console.log('\n=== Loaded JavaScript Resources ===');
    loadedResources.forEach(url => {
      const filename = url.split('/').pop() || url;
      console.log(`  - ${filename}`);
    });
    console.log('===================================\n');
    
    // Check that editor chunk is NOT loaded
    const editorChunkLoaded = loadedResources.some(url => 
      url.includes('editor') && !url.includes('EditorApp')
    );
    
    // Check that PDF chunk is NOT loaded
    const pdfChunkLoaded = loadedResources.some(url => url.includes('pdf'));
    
    // Get total JS size
    const jsResources = loadedResources.filter(url => url.includes('/assets/'));
    console.log(`\nTotal JS chunks loaded: ${jsResources.length}`);
    console.log(`Editor chunk loaded: ${editorChunkLoaded ? 'YES ❌' : 'NO ✅'}`);
    console.log(`PDF chunk loaded: ${pdfChunkLoaded ? 'YES ❌' : 'NO ✅'}\n`);
    
    // These should NOT be loaded on the public page
    expect(editorChunkLoaded, 'Editor chunk should not load on public page').toBe(false);
    expect(pdfChunkLoaded, 'PDF chunk should not load on public page').toBe(false);
  });
  
  test('should load minimal chunks on public page', async ({ page }) => {
    const jsChunks: { name: string; size: number }[] = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      if (url.endsWith('.js') && url.includes('/assets/')) {
        const buffer = await response.body().catch(() => null);
        if (buffer) {
          jsChunks.push({
            name: url.split('/').pop() || '',
            size: buffer.length,
          });
        }
      }
    });
    
    // Setup Supabase interception
    await page.route('**/rest/v1/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'content-range': '0-0/1' },
        body: JSON.stringify(route.request().url().includes('users') ? [userProfileFixture] : bulletinFixture),
      });
    });
    
    await page.route('**/rest/v1/tokens*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'content-range': `0-${tokensFixture.length - 1}/${tokensFixture.length}` },
        body: JSON.stringify(tokensFixture),
      });
    });
    
    await page.route('**/auth/v1/**', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({}) });
    });
    
    await page.goto('/test-ward');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    
    const totalSize = jsChunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const totalSizeKB = (totalSize / 1024).toFixed(1);
    
    console.log('\n=== JavaScript Bundle Analysis ===');
    console.log(`Total chunks: ${jsChunks.length}`);
    console.log(`Total size: ${totalSizeKB} KB`);
    console.log('\nTop 10 largest chunks:');
    jsChunks
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .forEach(chunk => {
        console.log(`  ${(chunk.size / 1024).toFixed(1)} KB - ${chunk.name}`);
      });
    console.log('=================================\n');
  });
});
