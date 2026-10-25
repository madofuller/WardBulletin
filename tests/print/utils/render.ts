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
    
    // Set high-resolution viewport for print (2x for better quality)
    const scale = 2;
    await page.setViewportSize({
      width: Math.round(dims.width * 96 * scale),
      height: Math.round(dims.height * 96 * scale),
    });
    
    // Get page layout info from DOM BEFORE print emulation (dimensions become 0 after)
    const pageLayout = await page.evaluate(() => {
      const pages = Array.from(document.querySelectorAll('.print-page'));
      const portal = document.querySelector('.print-source-portal');
      
      if (!portal) return { pages: [], portalBox: null };
      
      const portalRect = portal.getBoundingClientRect();
      
      return {
        portalBox: {
          x: portalRect.x,
          y: portalRect.y,
          width: portalRect.width,
          height: portalRect.height,
        },
        pages: pages.map((el, idx) => {
          const rect = el.getBoundingClientRect();
          return {
            index: idx,
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          };
        }),
      };
    });
    
    console.log(`    Found ${pageLayout.pages.length} pages in DOM`);
    
    if (pageLayout.pages.length === 0) {
      throw new Error('No .print-page elements found in DOM');
    }
    
    // NOW emulate print media for proper styling
    await page.emulateMedia({ media: 'print' });
    
    // Take full-page screenshot with print media applied
    const fullPagePath = join(outputDir, `${fixture}-${browserType}-${pageSize}-fullpage.png`);
    await page.screenshot({
      path: fullPagePath,
      fullPage: true,
      type: 'png',
    });
    
    console.log(`    Full page screenshot saved: ${fullPagePath}`);
    
    // Generate PDF for reference (optional, may be empty)
    let pdfPath: string | undefined;
    if (browserType === 'chromium') {
      pdfPath = join(outputDir, `${fixture}-${browserType}-${pageSize}.pdf`);
      try {
        await page.pdf({
          path: pdfPath,
          width: `${dims.width}in`,
          height: `${dims.height}in`,
          printBackground: true,
          margin: { top: 0, right: 0, bottom: 0, left: 0 },
        });
      } catch (e) {
        console.log(`    PDF generation failed (expected): ${e.message}`);
        pdfPath = undefined;
      }
    }
    
    // Use sharp to crop individual pages from full screenshot
    const sharp = await import('sharp');
    const fs = await import('fs/promises');
    
    const results: RenderResult[] = [];
    
    // Get full page screenshot metadata
    const fullPageMeta = await sharp.default(fullPagePath).metadata();
    console.log(`    Full screenshot: ${fullPageMeta.width}x${fullPageMeta.height}`);
    
    for (const pageInfo of pageLayout.pages) {
      const pngPath = join(outputDir, `${fixture}-${browserType}-${pageSize}-page${pageInfo.index + 1}.png`);
      
      // Bounds at viewport resolution (need to scale by 2x if using 2x viewport)
      // The coordinates are in logical pixels, but viewport is at 2x
      // So multiply all coordinates by scale factor  
      const left = Math.max(0, Math.floor(pageInfo.x * scale));
      const top = Math.max(0, Math.floor(pageInfo.y * scale));
      const width = Math.floor(pageInfo.width * scale);
      const height = Math.floor(pageInfo.height * scale);
      
      // Ensure bounds are within screenshot
      const clampedWidth = Math.min(width, fullPageMeta.width - left);
      const clampedHeight = Math.min(height, fullPageMeta.height - top);
      
      if (clampedWidth <= 0 || clampedHeight <= 0) {
        console.log(`    ⚠ Page ${pageInfo.index + 1} out of bounds, skipping`);
        continue;
      }
      
      console.log(`    Extracting page ${pageInfo.index + 1}: ${left},${top} ${clampedWidth}x${clampedHeight}`);
      
      // Crop to page bounds
      await sharp.default(fullPagePath)
        .extract({
          left,
          top,
          width: clampedWidth,
          height: clampedHeight,
        })
        .resize(2200, 1700, { fit: 'fill' }) // Standard size for checks
        .toFile(pngPath);
      
      console.log(`    ✓ Page ${pageInfo.index + 1} extracted: ${pngPath}`);
      
      results.push({
        pngPath,
        bulletinData,
        dimensions: dims,
        page, // Keep page open for inspection
        pdfPath: pageInfo.index === 0 ? pdfPath : undefined,
      });
    }
    
    // Cleanup full page screenshot
    try {
      await fs.unlink(fullPagePath);
    } catch {}
    
    if (results.length === 0) {
      throw new Error('No pages extracted');
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
