import { Page } from '@playwright/test';
import { PageDimensions } from '../utils/render';

export interface BoundsCheckResult {
  passed: boolean;
  message: string;
  details?: {
    elementsOutside: number;
    violations: Array<{
      selector: string;
      element: string;
      position: string;
      marginViolated: string;
    }>;
  };
}

const SAFETY_MARGIN_INCHES = 0.25;
const DPI = 96;

/**
 * Check element bounding boxes against printable area using real DOM inspection
 */
export async function checkPrintableBoundsReal(
  page: Page,
  dimensions: PageDimensions
): Promise<BoundsCheckResult> {
  try {
    const marginPixels = SAFETY_MARGIN_INCHES * DPI;
    
    // Page dimensions in pixels
    const pageWidthPx = Math.round(dimensions.width * DPI);
    const pageHeightPx = Math.round(dimensions.height * DPI);
    
    // Safe zones
    const safeZone = {
      left: marginPixels,
      right: pageWidthPx - marginPixels,
      top: marginPixels,
      bottom: pageHeightPx - marginPixels,
    };
    
    // Inspect all elements in the print layout
    const violations = await page.evaluate(({ safeZone, pageWidthPx, pageHeightPx }) => {
      const results: Array<{
        selector: string;
        element: string;
        position: string;
        marginViolated: string;
      }> = [];
      
      // Get all visible elements in the print pages
      const printPages = document.querySelectorAll('.print-page');
      
      printPages.forEach((printPage, pageIndex) => {
        const pageRect = printPage.getBoundingClientRect();
        
        // Check key elements that commonly overflow
        const selectorsToCheck = [
          '.print-page h1', // Ward name
          '.print-page h2', // Headings
          '.print-page table', // Tables
          'canvas', // QR codes
          '.print-page .text-3xl', // Large text
          '.print-page .announcement-title', // Announcement titles
        ];
        
        selectorsToCheck.forEach(selector => {
          const elements = printPage.querySelectorAll(selector);
          elements.forEach((el, idx) => {
            const rect = el.getBoundingClientRect();
            
            // Calculate relative to page
            const relativeRect = {
              left: rect.left - pageRect.left,
              right: rect.right - pageRect.left,
              top: rect.top - pageRect.top,
              bottom: rect.bottom - pageRect.top,
            };
            
            const violations: string[] = [];
            if (relativeRect.left < safeZone.left) violations.push('left');
            if (relativeRect.right > safeZone.right) violations.push('right');
            if (relativeRect.top < safeZone.top) violations.push('top');
            if (relativeRect.bottom > safeZone.bottom) violations.push('bottom');
            
            if (violations.length > 0) {
              // Get element description
              let elementDesc = el.tagName.toLowerCase();
              if (el.textContent) {
                const text = el.textContent.trim().substring(0, 50);
                elementDesc += `: "${text}"`;
              }
              
              results.push({
                selector,
                element: elementDesc,
                position: `Page ${pageIndex + 1}: (${Math.round(relativeRect.left)}, ${Math.round(relativeRect.top)}) to (${Math.round(relativeRect.right)}, ${Math.round(relativeRect.bottom)})`,
                marginViolated: violations.join(', '),
              });
            }
          });
        });
      });
      
      return results;
    }, { safeZone, pageWidthPx, pageHeightPx });
    
    if (violations.length > 0) {
      return {
        passed: false,
        message: `${violations.length} element(s) extend outside ${SAFETY_MARGIN_INCHES}" safety margin`,
        details: {
          elementsOutside: violations.length,
          violations,
        },
      };
    }
    
    return {
      passed: true,
      message: `All content within ${SAFETY_MARGIN_INCHES}" safety margin`,
    };
  } catch (error) {
    return {
      passed: false,
      message: `Error checking bounds: ${error}`,
    };
  }
}
