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
    
    // Load fixture data from the test-fixtures directory in the app
    const fixtureUrl = `${appUrl}/print-test?fixture=${fixture}`;
    
    // Navigate to the test route
    await page.goto(fixtureUrl, { waitUntil: 'networkidle' });
    
    // Wait for bulletin data to load and render
    await page.waitForSelector('.print-source-portal', { timeout: 10000 });
    await page.waitForTimeout(1000); // Extra time for QR codes to generate
    
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
