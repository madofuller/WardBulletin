/**
 * Cross-browser rendering test for Firefox and WebKit
 * Tests print media emulation and PDF generation across browsers
 */
import { firefox, webkit, chromium, Browser } from '@playwright/test';
import { execSync } from 'child_process';
import { join } from 'path';

const ARTIFACTS_DIR = '/opt/cursor/artifacts/browser-comparison';
const PORT = 4173;

// Ensure artifacts directory exists
execSync(`mkdir -p ${ARTIFACTS_DIR}`, { stdio: 'inherit' });

interface TestConfig {
  wardName: string;
  printFontScale: number;
  modeName: string;
}

const testConfigs: TestConfig[] = [
  { wardName: 'Test Ward', printFontScale: 1.0, modeName: 'normal' },
  { wardName: 'Test Ward', printFontScale: 1.25, modeName: 'extralarge' },
];

async function testBrowser(browserType: string, browserInstance: typeof chromium) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing ${browserType.toUpperCase()}`);
  console.log('='.repeat(80));

  const browser = await browserInstance.launch({ headless: true });
  
  for (const config of testConfigs) {
    try {
      console.log(`\n  ${config.modeName} (${config.printFontScale * 100}%)...`);
      
      const page = await browser.newPage({ 
        viewport: browserType === 'webkit' ? { width: 1650, height: 1275 } : { width: 1400, height: 1000 }
      });
      
      // Inject test session AND set language before page loads (Firefox needs this)
      await page.addInitScript((cfg) => {
        // Set language first to avoid "invalid language tag: undefined"
        window.localStorage.setItem('selectedLanguage', 'en');
        window.localStorage.setItem('selectedUnitType', 'ward');
        
        // Inject test session
        (window as any).__TEST_SESSION__ = {
          user: { id: 'test-user-id', email: 'test@example.com' },
          profile: {
            profile_slug: 'test-ward',
            email: 'test@example.com',
            role: 'user',
            active_bulletin_id: null,
            unit_type: 'ward',
            language: 'en'
          }
        };
        
        // Set test data
        window.localStorage.setItem('draft_bulletin', JSON.stringify({
          data: {
            wardName: cfg.wardName,
            date: '2026-10-25',
            printFontScale: cfg.printFontScale,
            showQRCodeOnPrint: true
          },
          savedAt: Date.now(),
          bulletinId: null
        }));
      }, config);
      
      // Navigate with appropriate timeout and waits
      await page.goto(`http://localhost:${PORT}`, { 
        waitUntil: browserType === 'firefox' ? 'load' : 'networkidle',
        timeout: 20000 
      });
      
      // Wait for form to render (data already set via addInitScript)
      await page.waitForSelector('#form-ward-name', { timeout: 20000 });
      
      // Wait for fonts to load (Firefox specific)
      if (browserType === 'firefox') {
        await page.evaluate(() => document.fonts.ready);
      }
      
      // Additional stabilization wait
      await page.waitForTimeout(2000);
      
      // Emulate print media
      await page.emulateMedia({ media: 'print' });
      await page.waitForTimeout(500);
      
      if (browserType === 'webkit') {
        // WebKit doesn't support PDF generation, use screenshot as proxy
        const screenshotPath = join(ARTIFACTS_DIR, `${browserType}_${config.modeName}.png`);
        await page.screenshot({
          path: screenshotPath,
          fullPage: false
        });
        console.log(`    ✓ Screenshot: ${screenshotPath}`);
      } else {
        // Firefox and Chromium support PDF
        const pdfPath = join(ARTIFACTS_DIR, `${browserType}_${config.modeName}.pdf`);
        
        if (browserType === 'firefox') {
          // Firefox PDF generation
          try {
            await page.pdf({
              path: pdfPath,
              format: 'Letter',
              landscape: true,
              printBackground: true,
              preferCSSPageSize: true,
              margin: { top: 0, right: 0, bottom: 0, left: 0 }
            });
            console.log(`    ✓ PDF: ${pdfPath}`);
            
            // Convert to PNG for comparison
            const pngPath = join(ARTIFACTS_DIR, `${browserType}_${config.modeName}`);
            execSync(`pdftoppm -png -r 150 "${pdfPath}" "${pngPath}"`, { stdio: 'pipe' });
            console.log(`    ✓ PNG: ${pngPath}-*.png`);
          } catch (error: any) {
            console.log(`    ⚠️  PDF generation failed: ${error.message}`);
            // Fallback to screenshot
            const screenshotPath = join(ARTIFACTS_DIR, `${browserType}_${config.modeName}_fallback.png`);
            await page.screenshot({ path: screenshotPath, fullPage: false });
            console.log(`    ✓ Screenshot fallback: ${screenshotPath}`);
          }
        } else {
          // Chromium (baseline)
          await page.pdf({
            path: pdfPath,
            format: 'Letter',
            landscape: true,
            printBackground: true,
            preferCSSPageSize: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
          });
          console.log(`    ✓ PDF: ${pdfPath}`);
          
          const pngPath = join(ARTIFACTS_DIR, `${browserType}_${config.modeName}`);
          execSync(`pdftoppm -png -r 150 "${pdfPath}" "${pngPath}"`, { stdio: 'pipe' });
          console.log(`    ✓ PNG: ${pngPath}-*.png`);
        }
      }
      
      await page.close();
    } catch (error: any) {
      console.log(`    ❌ Failed: ${error.message}`);
    }
  }
  
  await browser.close();
}

async function main() {
  console.log('================================================================================');
  console.log('CROSS-BROWSER PRINT RENDERING TEST');
  console.log('================================================================================');
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Artifacts: ${ARTIFACTS_DIR}\n`);

  // Test Chromium (baseline)
  await testBrowser('chromium', chromium);
  
  // Test Firefox
  await testBrowser('firefox', firefox);
  
  // Test WebKit (Safari engine)
  await testBrowser('webkit', webkit);
  
  console.log('\n✓ Cross-browser testing complete!\n');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
