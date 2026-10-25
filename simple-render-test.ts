import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const ARTIFACTS_DIR = '/opt/cursor/artifacts/print-verification';
const BASE_URL = 'http://localhost:4173';

if (!existsSync(ARTIFACTS_DIR)) {
  mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

async function main() {
  console.log('Starting simple render test...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  
  // Seed draft
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'draft_bulletin',
      JSON.stringify({ 
        data: {
          wardName: 'SunRiver 2nd Ward',
          date: '2026-10-25',
          printFontScale: 1.25,
          showQRCodeOnPrint: true,
          leadership: { presiding: 'Bishop Perkins', conducting: 'Bishop Perkins' },
          musicProgram: { openingHymnNumber: '2' },
          prayers: { opening: 'Brother Anderson' },
          agenda: [{ type: 'sacrament', id: 's1' }],
          announcements: [
            { id: 'a1', title: 'Ward Picnic', content: 'Saturday at 10am', audience: 'ward' }
          ]
        }, 
        savedAt: Date.now(), 
        bulletinId: null 
      })
    );
  });
  
  console.log('Navigating to', BASE_URL);
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  
  console.log('Page loaded, URL:', page.url());
  console.log('Title:', await page.title());
  
  // Take full page screenshot to see what's actually there
  await page.screenshot({ path: join(ARTIFACTS_DIR, 'full-page.png'), fullPage: true });
  console.log('Full page screenshot saved');
  
  // Check for form
  try {
    await page.waitForSelector('#form-ward-name', { timeout: 5000 });
    console.log('✓ Form loaded');
  } catch (e) {
    console.log('✗ Form not found');
  }
  
  // Check for print portal
  try {
    await page.waitForSelector('.print-source-portal', { timeout: 5000 });
    console.log('✓ Print portal found');
    
    await page.waitForTimeout(2000);
    
    // Screenshot print pages
    const printPages = await page.locator('.print-source-portal .print-page').all();
    console.log('Print pages found:', printPages.length);
    
    for (let i = 0; i < printPages.length; i++) {
      await printPages[i].screenshot({ 
        path: join(ARTIFACTS_DIR, `test-page${i + 1}.png`),
        type: 'png'
      });
      console.log(`✓ Screenshot page ${i + 1}`);
    }
    
    // Generate PDF
    await page.pdf({
      path: join(ARTIFACTS_DIR, 'test.pdf'),
      format: 'Letter',
      landscape: true,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    console.log('✓ PDF generated');
    
  } catch (e) {
    console.log('✗ Print portal not found:', e.message);
  }
  
  await browser.close();
  console.log('Done!');
}

main().catch(console.error);
