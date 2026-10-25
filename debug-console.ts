import { chromium } from '@playwright/test';

async function main() {
  console.log('Starting debug with console logging...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  
  // Capture all console messages
  page.on('console', msg => {
    console.log(`[CONSOLE ${msg.type()}]`, msg.text());
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    console.log('[PAGE ERROR]', error.message);
  });
  
  //Capture network failures
  page.on('requestfailed', request => {
    console.log('[REQUEST FAILED]', request.url(), request.failure()?.errorText);
  });
  
  console.log('Navigating...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 30000 });
  
  console.log('Waiting 5 seconds...');
  await page.waitForTimeout(5000);
  
  console.log('Checking DOM...');
  const html = await page.content();
  console.log('Has root div:', html.includes('id="root"'));
  console.log('Has script tags:', (html.match(/<script/g) || []).length);
  
  // Check if root has content
  const rootContent = await page.locator('#root').innerHTML().catch(() => 'NOT FOUND');
  console.log('Root innerHTML length:', rootContent.length);
  console.log('Root innerHTML preview:', rootContent.substring(0, 200));
  
  await browser.close();
}

main().catch(console.error);
