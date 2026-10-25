import { Page } from '@playwright/test';

export interface FontSizeCheckResult {
  passed: boolean;
  message: string;
  details?: {
    minFontSizePt: number;
    minFontSizePx: number;
    belowThresholdCount: number;
    belowThresholdElements: Array<{
      selector: string;
      text: string;
      fontSizePt: number;
      fontSizePx: number;
    }>;
    autoShrinkDetected: boolean;
    fontScale: number;
  };
}

/**
 * Check font sizes in points for readability
 * For Extra Large mode (125%), minimum should be 12pt for seniors
 * For Large mode (115%), minimum should be 11pt
 * For Normal (100%), minimum should be 10pt
 */
export async function checkFontSizesReal(
  page: Page,
  fontScale: number
): Promise<FontSizeCheckResult> {
  // Minimum font size in points based on scale
  const MIN_FONT_SIZE_PT = fontScale >= 1.25 ? 12 : fontScale >= 1.15 ? 11 : 10;
  
  try {
    const fontData = await page.evaluate(() => {
      const results: Array<{
        selector: string;
        text: string;
        fontSizePt: number;
        fontSizePx: number;
        parentClass: string;
      }> = [];
      
      const printPages = document.querySelectorAll('.print-page');
      
      printPages.forEach(printPage => {
        // Check all text elements
        const textElements = printPage.querySelectorAll('*');
        textElements.forEach(el => {
          const text = (el.textContent || '').trim();
          if (text.length === 0 || text.length > 100) return; // Skip empty or very long (likely containers)
          
          const computed = window.getComputedStyle(el);
          const fontSizePx = parseFloat(computed.fontSize);
          
          // Convert px to pt (1pt = 1.333px at 96 DPI)
          const fontSizePt = fontSizePx * 0.75;
          
          // Get parent class to detect auto-shrinking
          const parentClasses = (el.parentElement?.className || '').toString();
          
          results.push({
            selector: el.tagName.toLowerCase(),
            text: text.substring(0, 50),
            fontSizePt,
            fontSizePx,
            parentClass: parentClasses,
          });
        });
      });
      
      return results;
    });
    
    // Filter out very small elements (likely decorative)
    const textElements = fontData.filter(item => item.text.length >= 2);
    
    if (textElements.length === 0) {
      return {
        passed: false,
        message: 'No text elements found to check font sizes',
      };
    }
    
    // Check for elements below threshold
    const belowThreshold = textElements.filter(item => item.fontSizePt < MIN_FONT_SIZE_PT);
    
    // Detect auto-shrinking (announcements with many items)
    // Look for scaled-down fonts in announcement containers
    const autoShrinkDetected = textElements.some(item => 
      item.parentClass.includes('announcement') && item.fontSizePx < 12
    );
    
    const minFontSizePx = Math.min(...textElements.map(i => i.fontSizePx));
    const minFontSizePt = minFontSizePx * 0.75;
    
    if (belowThreshold.length > 0) {
      return {
        passed: false,
        message: `${belowThreshold.length} text element(s) below ${MIN_FONT_SIZE_PT}pt minimum (smallest: ${minFontSizePt.toFixed(1)}pt)`,
        details: {
          minFontSizePt,
          minFontSizePx,
          belowThresholdCount: belowThreshold.length,
          belowThresholdElements: belowThreshold.slice(0, 10),
          autoShrinkDetected,
          fontScale,
        },
      };
    }
    
    return {
      passed: true,
      message: `All text meets ${MIN_FONT_SIZE_PT}pt minimum (smallest: ${minFontSizePt.toFixed(1)}pt${autoShrinkDetected ? ', auto-shrink active' : ''})`,
      details: {
        minFontSizePt,
        minFontSizePx,
        belowThresholdCount: 0,
        belowThresholdElements: [],
        autoShrinkDetected,
        fontScale,
      },
    };
  } catch (error) {
    return {
      passed: false,
      message: `Error checking font sizes: ${error}`,
    };
  }
}
