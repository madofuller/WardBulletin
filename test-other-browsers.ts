/**
 * Test print rendering in Firefox and WebKit
 */
import { firefox, webkit } from '@playwright/test';
import { execSync } from 'child_process';
import { join } from 'path';

const BASE_URL = 'http://localhost:4173';
const ARTIFACTS_DIR = '/opt/cursor/artifacts/print-pdfs-proper';

const TEST_DATA = {
  wardName: 'SunRiver 2nd Ward',
  date: '2026-10-25',
  printFontScale: 1.25, // Extra Large
  leadership: { presiding: 'Bishop Perkins', conducting: 'Bishop Perkins', chorister: 'Sister Johnson', organist: 'Brother Smith' },
  musicProgram: { openingHymnNumber: '2', sacramentHymnNumber: '169', closingHymnNumber: '152' },
  prayers: { opening: 'Brother Anderson', closing: 'Sister Martinez' },
  agenda: [{ type: 'sacrament', id: 's1' }, { type: 'speaker', id: 'sp1', name: 'Sister Roberts' }],
  announcements: Array.from({ length: 8 }, (_, i) => ({
    id: `a${i + 1}`,
    title: `Announcement ${i + 1}`,
    content: 'Test announcement content. '.repeat(15),
    audience: 'ward'
  })),
  wardLeadership: [{ title: 'Bishop', name: 'Mark Perkins', phone: '555-0101' }],
  showQRCodeOnPrint: true
};

async function testBrowser(browserName: string, browserType: any) {
  console.log(`\\nTesting ${browserName}...`);
  
  const browser = await browserType.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Set draft data
    await page.evaluate((data: any) => {
      window.localStorage.setItem('draft_bulletin', JSON.stringify({ data, savedAt: Date.now(), bulletinId: null }));
    }, TEST_DATA);

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('#form-ward-name', { timeout: 15000 });
    await page.waitForTimeout(3000);

    // Emulate print media
    await page.emulateMedia({ media: 'print' });

    // Generate PDF
    const pdfPath = join(ARTIFACTS_DIR, `test_${browserName.toLowerCase()}_extralarge.pdf`);
    await page.pdf({
      path: pdfPath,
      format: 'Letter',
      landscape: true,
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    console.log(`  ✓ PDF: ${pdfPath}`);

    // Convert to PNG
    try {
      const pngPath = join(ARTIFACTS_DIR, `test_${browserName.toLowerCase()}_extralarge`);
      execSync(`pdftoppm -png -r 150 "${pdfPath}" "${pngPath}"`, { stdio: 'pipe' });
      console.log(`  ✓ PNG: ${pngPath}-*.png`);
    } catch (error) {
      console.log(`  ⚠ PNG conversion failed`);
    }

  } catch (error: any) {
    console.error(`  ❌ Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('================================================================================');
  console.log('CROSS-BROWSER PRINT RENDERING TEST');
  console.log('================================================================================');

  await testBrowser('Firefox', firefox);
  await testBrowser('WebKit', webkit);

  console.log('\\n✓ Cross-browser test complete!');
  console.log(`\\nArtifacts: ${ARTIFACTS_DIR}`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
