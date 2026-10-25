import { chromium, firefox, webkit, Browser, Page } from '@playwright/test';
import { writeFileSync } from 'fs';
import { join } from 'path';
import type { BulletinData } from '../../../src/types/bulletin';

export type BrowserType = 'chromium' | 'firefox' | 'webkit';
export type PageSize = 'letter' | 'a4';

export interface RenderOptions {
  browser: BrowserType;
  pageSize: PageSize;
  fixture: string;
  outputDir: string;
  appUrl?: string; // URL of the running app
}

export interface PageDimensions {
  width: number;
  height: number;
}

const PAGE_SIZES: Record<PageSize, PageDimensions> = {
  letter: { width: 11, height: 8.5 }, // inches, landscape
  a4: { width: 11.7, height: 8.3 }, // inches, landscape (A4 is 297mm x 210mm)
};

export interface RenderResult {
  pngPath: string;
  pdfPath?: string;
  bulletinData: BulletinData;
  dimensions: PageDimensions;
  page: Page; // Keep page open for element inspection
}

/**
 * Render a fixture through the real app's print path
 */
export async function renderFixture(options: RenderOptions): Promise<RenderResult[]> {
  const { browser: browserType, pageSize, fixture, outputDir, appUrl = 'http://localhost:5173' } = options;
  
  let browser: Browser;
  switch (browserType) {
    case 'chromium':
      browser = await chromium.launch({ headless: true });
      break;
    case 'firefox':
      browser = await firefox.launch({ headless: true });
      break;
    case 'webkit':
      browser = await webkit.launch({ headless: true });
      break;
  }

  try {
    const page = await browser.newPage();
    
    // Capture console messages, errors, and failed requests
    const logs: string[] = [];
    const errors: string[] = [];
    
    page.on('console', msg => {
      const text = `[${msg.type()}] ${msg.text()}`;
      logs.push(text);
      if (msg.type() === 'error') {
        console.log(`      Browser console error: ${text}`);
        errors.push(text);
      }
    });
    
    page.on('pageerror', err => {
      const text = `Page error: ${err.message}`;
      console.log(`      ${text}`);
      errors.push(text);
    });
    
    page.on('requestfailed', request => {
      const text = `Failed request: ${request.url()} - ${request.failure()?.errorText}`;
      console.log(`      ${text}`);
      errors.push(text);
    });
    
    // Use standalone print test page (no Supabase/auth required)
    const fixtureUrl = `${appUrl}/print-test.html?fixture=${fixture}`;
    
    // Navigate to the test route
    console.log(`    Navigating to ${fixtureUrl}...`);
    const response = await page.goto(fixtureUrl, { waitUntil: 'networkidle', timeout: 30000 });
    console.log(`    Response status: ${response?.status()}`);
    
    if (response && response.status() >= 400) {
      throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
    }
    
    // Take a debug screenshot to see what's actually rendered
    const debugPath = join(outputDir, `debug-${fixture}-${browserType}.png`);
    await page.screenshot({ path: debugPath, fullPage: true });
    console.log(`    Debug screenshot: ${debugPath}`);
    
    // Check if there's an error on the page
    const errorText = await page.evaluate(() => {
      const error = document.querySelector('[role="alert"], .error, .text-red-600');
      return error ? error.textContent : null;
    });
    if (errorText) {
      console.log(`    Page error: ${errorText}`);
    }
    
    // Wait for bulletin data to load and render
    try {
      await page.waitForSelector('.print-source-portal', { timeout: 10000, state: 'attached' });
      console.log(`    ✓ Portal found`);
      
      // Wait for explicit readiness signal (fonts + QR codes loaded)
      await page.waitForFunction(() => (window as any).__PRINT_READY__ === true, { timeout: 5000 });
      console.log(`    ✓ Print ready`);
    } catch (e) {
      // Check what's on the page
      const bodyHTML = await page.evaluate(() => document.body.innerHTML);
      console.log(`    Portal not found or not ready. Body content length: ${bodyHTML.length}`);
      if (errors.length > 0) {
        console.log(`    Errors: ${errors.join(', ')}`);
      }
      throw new Error(`Print portal not found or not ready. Check ${debugPath}. Errors: ${errors.join('; ')}`);
    }
    
    // Get the bulletin data from the page
    const bulletinData = await page.evaluate(() => {
      // The PrintTest component has access to bulletinData
      // We can extract it from the page for validation
      return (window as any).__BULLETIN_DATA__ || {};
    });
    
    const dims = PAGE_SIZES[pageSize];
    
    // Set viewport for print
    await page.setViewportSize({
      width: Math.round(dims.width * 96),
      height: Math.round(dims.height * 96),
    });
    
    // Emulate print media
    await page.emulateMedia({ media: 'print' });
    
    const results: RenderResult[] = [];
    
    // Find all print pages
    const printPages = await page.locator('.print-page').all();
    
    for (let i = 0; i < printPages.length; i++) {
      const pageElement = printPages[i];
      const pngPath = join(outputDir, `${fixture}-${browserType}-${pageSize}-page${i + 1}.png`);
      
      // Screenshot the page
      await pageElement.screenshot({ 
        path: pngPath,
        type: 'png',
      });
      
      results.push({
        pngPath,
        bulletinData,
        dimensions: dims,
        page, // Keep page open for inspection
      });
    }
    
    // Generate PDF for Chromium
    if (browserType === 'chromium') {
      const pdfPath = join(outputDir, `${fixture}-${browserType}-${pageSize}.pdf`);
      await page.pdf({
        path: pdfPath,
        width: `${dims.width}in`,
        height: `${dims.height}in`,
        printBackground: true,
        preferCSSPageSize: false,
        pageRanges: '1-2', // Only first 2 pages
      });
      
      // Add PDF path to first result
      if (results.length > 0) {
        results[0].pdfPath = pdfPath;
      }
    }
    
    return results;
  } catch (error) {
    await browser.close();
    throw error;
  }
  // Note: We DON'T close the browser here - caller must close it after inspection
}

/**
 * Close the browser for render results
 */
export async function closeRenderResults(results: RenderResult[]): Promise<void> {
  if (results.length > 0 && results[0].page) {
    const browser = results[0].page.context().browser();
    if (browser) {
      await browser.close();
    }
  }
}
