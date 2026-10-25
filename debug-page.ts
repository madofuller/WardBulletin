import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  
  // Seed draft
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'draft_bulletin',
      JSON.stringify({ 
        data: {
          wardName: 'SunRiver 2nd Ward',
          date: '2026-10-25',
          showQRCodeOnPrint: true
        }, 
        savedAt: Date.now(), 
        bulletinId: null 
      })
    );
  });
  
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  
  console.log('Page title:', await page.title());
  console.log('URL:', page.url());
  
  // Wait a bit
  await page.waitForTimeout(3000);
  
  // Check for print portal
  const printPortal = await page.locator('.print-source-portal').count();
  console.log('Print portal count:', printPortal);
  
  // Check for other elements
  const body = await page.locator('body').innerHTML();
  console.log('Body contains "Ward":', body.includes('Ward'));
  console.log('Body length:', body.length);
  
  // Take screenshot
  await page.screenshot({ path: '/opt/cursor/artifacts/debug-screenshot.png', fullPage: true });
  console.log('Screenshot saved');
  
  await page.waitForTimeout(10000);
  await browser.close();
}

main().catch(console.error);
