import { chromium } from '@playwright/test';
import { readFileSync } from 'fs';

export interface FontSizeCheckResult {
  passed: boolean;
  message: string;
  details?: {
    minFontSize: number;
    maxFontSize: number;
    belowThreshold: number;
    threshold: number;
  };
}

/**
 * Check minimum font sizes in Extra Large mode for senior readability
 * For 55+ audience, minimum readable size is typically 12pt (16px at 96 DPI)
 * In Extra Large mode (125% scale), base font should be at least 14-15px
 */
export async function checkFontSizes(
  htmlPath: string,
  fontScale: number
): Promise<FontSizeCheckResult> {
  // For Extra Large mode (1.25), minimum should be 14px
  // For Large mode (1.15), minimum should be 12px
  // For Normal (1.0), minimum should be 11px
  const MIN_FONT_SIZE_PX = fontScale >= 1.25 ? 14 : fontScale >= 1.15 ? 12 : 11;
  
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    
    // Load the rendered HTML
    const html = readFileSync(htmlPath, 'utf-8');
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'print' });
    
    // Get all text elements and their computed font sizes
    const fontSizes = await page.evaluate(() => {
      const elements = document.querySelectorAll('body *');
      const sizes: number[] = [];
      
      elements.forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.length > 0) {
          const computedStyle = window.getComputedStyle(el);
          const fontSize = parseFloat(computedStyle.fontSize);
          if (!isNaN(fontSize) && fontSize > 0) {
            sizes.push(fontSize);
          }
        }
      });
      
      return sizes;
    });
    
    if (fontSizes.length === 0) {
      return {
        passed: false,
        message: 'No text elements found to check',
      };
    }
    
    const minSize = Math.min(...fontSizes);
    const maxSize = Math.max(...fontSizes);
    const belowThreshold = fontSizes.filter(s => s < MIN_FONT_SIZE_PX).length;
    
    if (minSize < MIN_FONT_SIZE_PX) {
      return {
        passed: false,
        message: `Font size ${minSize.toFixed(1)}px is below ${MIN_FONT_SIZE_PX}px threshold for ${fontScale === 1.25 ? 'Extra Large' : fontScale === 1.15 ? 'Large' : 'Normal'} mode (${belowThreshold} elements)`,
        details: {
          minFontSize: minSize,
          maxFontSize: maxSize,
          belowThreshold,
          threshold: MIN_FONT_SIZE_PX,
        },
      };
    }
    
    return {
      passed: true,
      message: `All text meets ${MIN_FONT_SIZE_PX}px minimum for ${fontScale === 1.25 ? 'Extra Large' : fontScale === 1.15 ? 'Large' : 'Normal'} mode`,
      details: {
        minFontSize: minSize,
        maxFontSize: maxSize,
        belowThreshold: 0,
        threshold: MIN_FONT_SIZE_PX,
      },
    };
  } catch (error) {
    return {
      passed: false,
      message: `Error checking font sizes: ${error}`,
    };
  } finally {
    await browser.close();
  }
}
