import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const ARTIFACTS_DIR = '/opt/cursor/artifacts/print-verification';
const BASE_URL = 'http://localhost:4173';

if (!existsSync(ARTIFACTS_DIR)) {
  mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

async function main() {
  console.log('Starting render test (load then seed approach)...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  
  console.log('Navigating to', BASE_URL);
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  
  console.log('Waiting for app to load...');
  try {
    await page.waitForSelector('#form-ward-name, input[name="wardName"]', { timeout: 15000 });
    console.log('✓ App loaded');
  } catch (e) {
    console.log('⚠ App did not load form, trying to seed anyway');
  }
  
  // Now inject the draft
  console.log('Seeding draft data...');
  await page.evaluate(() => {
    window.localStorage.setItem(
      'draft_bulletin',
      JSON.stringify({ 
        data: {
          wardName: 'SunRiver 2nd Ward',
          date: '2026-10-25',
          printFontScale: 1.25,
          showQRCodeOnPrint: true,
          leadership: { presiding: 'Bishop Perkins', conducting: 'Bishop Perkins', chorister: 'Sister Johnson', organist: 'Brother Smith' },
          musicProgram: { 
            openingHymnNumber: '2',
            openingHymnTitle: 'The Spirit of God',
            sacramentHymnNumber: '169',
            closingHymnNumber: '152'
          },
          prayers: { opening: 'Brother Anderson', closing: 'Sister Martinez' },
          agenda: [
            { type: 'sacrament', id: 's1' },
            { type: 'speaker', id: 'sp1', name: 'Sister Roberts' }
          ],
          announcements: [
            { id: 'a1', title: 'Ward Picnic', content: 'Saturday at the park pavilion, 10am. Bring a side dish to share with everyone.', audience: 'ward', category: 'general' },
            { id: 'a2', title: 'Temple Trip', content: 'Next Saturday morning. Bus leaves at 6am from the chapel parking lot.', audience: 'ward', category: 'general' }
          ],
          wardLeadership: [
            { title: 'Bishop', name: 'Mark Perkins', phone: '555-0101' },
            { title: 'First Counselor', name: 'John Davis', phone: '555-0102' }
          ]
        }, 
        savedAt: Date.now(), 
        bulletinId: null 
      })
    );
  });
  
  // Reload to pick up the draft
  console.log('Reloading page...');
  await page.reload({ waitUntil: 'networkidle' });
  
  await page.waitForTimeout(3000);
  
  console.log('Checking for elements...');
  
  // Check for form
  const formVisible = await page.locator('#form-ward-name, input[name="wardName"]').isVisible().catch(() => false);
  console.log('Form visible:', formVisible);
  
  if (formVisible) {
    const wardName = await page.locator('#form-ward-name, input[name="wardName"]').inputValue().catch(() => '');
    console.log('Ward name in form:', wardName);
  }
  
  // Check for print portal
  const portalCount = await page.locator('.print-source-portal').count();
  console.log('Print portal count:', portalCount);
  
  if (portalCount > 0) {
    const printPages = await page.locator('.print-source-portal .print-page').all();
    console.log('Print pages found:', printPages.length);
    
    await page.waitForTimeout(2000);
    
    for (let i = 0; i < printPages.length; i++) {
      await printPages[i].screenshot({ 
        path: join(ARTIFACTS_DIR, `main-extralarge-page${i + 1}.png`),
        type: 'png'
      });
      console.log(`✓ Screenshot page ${i + 1}`);
    }
    
    // Generate PDF
    await page.pdf({
      path: join(ARTIFACTS_DIR, 'main-extralarge.pdf'),
      format: 'Letter',
      landscape: true,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    console.log('✓ PDF generated');
  } else {
    // Take a screenshot of what's actually there
    await page.screenshot({ path: join(ARTIFACTS_DIR, 'no-portal-fullpage.png'), fullPage: true });
    console.log('Full page screenshot saved (no portal found)');
  }
  
  await browser.close();
  console.log('Done!');
}

main().catch(console.error);
