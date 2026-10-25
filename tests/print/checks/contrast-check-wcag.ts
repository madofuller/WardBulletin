import { Page } from '@playwright/test';

export interface ContrastCheckResult {
  passed: boolean;
  message: string;
  details?: {
    lowestContrast: number;
    lowContrastElements: Array<{
      selector: string;
      text: string;
      ratio: number;
      foreground: string;
      background: string;
    }>;
    wcagAA: boolean;
    wcagAAA: boolean;
  };
}

/**
 * Calculate relative luminance from RGB
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate WCAG contrast ratio
 */
function getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const lum1 = getLuminance(...rgb1);
  const lum2 = getLuminance(...rgb2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse RGB color string to array
 */
function parseColor(color: string): [number, number, number] | null {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
}

/**
 * Check WCAG contrast ratios for text elements
 */
export async function checkContrastWCAG(page: Page): Promise<ContrastCheckResult> {
  try {
    const contrastData = await page.evaluate(() => {
      const results: Array<{
        selector: string;
        text: string;
        ratio: number;
        foreground: string;
        background: string;
        fontSize: number;
        fontWeight: string;
      }> = [];
      
      // Find all text elements in print pages
      const printPages = document.querySelectorAll('.print-page');
      
      printPages.forEach(printPage => {
        // Check various text elements
        const textSelectors = [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'span', 'td', 'th', 'li',
          '.announcement-title', '.announcement-content',
        ];
        
        textSelectors.forEach(selector => {
          const elements = printPage.querySelectorAll(selector);
          elements.forEach(el => {
            const text = (el.textContent || '').trim();
            if (text.length === 0) return;
            
            const computed = window.getComputedStyle(el);
            const foreground = computed.color;
            const background = computed.backgroundColor;
            
            // If background is transparent, walk up to find actual background
            let bgColor = background;
            if (background === 'rgba(0, 0, 0, 0)' || background === 'transparent') {
              let parent = el.parentElement;
              while (parent) {
                const parentBg = window.getComputedStyle(parent).backgroundColor;
                if (parentBg !== 'rgba(0, 0, 0, 0)' && parentBg !== 'transparent') {
                  bgColor = parentBg;
                  break;
                }
                parent = parent.parentElement;
              }
              // Default to white if no background found
              if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
                bgColor = 'rgb(255, 255, 255)';
              }
            }
            
            const fontSize = parseFloat(computed.fontSize);
            const fontWeight = computed.fontWeight;
            
            results.push({
              selector,
              text: text.substring(0, 50),
              ratio: 0, // Will calculate in Node
              foreground,
              background: bgColor,
              fontSize,
              fontWeight,
            });
          });
        });
      });
      
      return results;
    });
    
    // Calculate contrast ratios in Node
    const analyzed = contrastData.map(item => {
      const fg = parseColor(item.foreground);
      const bg = parseColor(item.background);
      
      if (!fg || !bg) {
        return { ...item, ratio: 0 };
      }
      
      const ratio = getContrastRatio(fg, bg);
      return { ...item, ratio };
    }).filter(item => item.ratio > 0);
    
    if (analyzed.length === 0) {
      return {
        passed: false,
        message: 'No text elements found to check contrast',
      };
    }
    
    // WCAG AA requires 4.5:1 for normal text, 3:1 for large text (18pt+)
    // WCAG AAA requires 7:1 for normal text, 4.5:1 for large text
    const lowContrast = analyzed.filter(item => {
      const isLargeText = item.fontSize >= 18 || (item.fontSize >= 14 && parseInt(item.fontWeight) >= 700);
      const minRatio = isLargeText ? 3.0 : 4.5;
      return item.ratio < minRatio;
    });
    
    const lowestContrast = Math.min(...analyzed.map(i => i.ratio));
    const allPassAA = lowContrast.length === 0;
    const allPassAAA = analyzed.every(item => {
      const isLargeText = item.fontSize >= 18 || (item.fontSize >= 14 && parseInt(item.fontWeight) >= 700);
      const minRatio = isLargeText ? 4.5 : 7.0;
      return item.ratio >= minRatio;
    });
    
    if (!allPassAA) {
      return {
        passed: false,
        message: `${lowContrast.length} element(s) fail WCAG AA (lowest: ${lowestContrast.toFixed(2)}:1)`,
        details: {
          lowestContrast,
          lowContrastElements: lowContrast.slice(0, 10), // First 10
          wcagAA: false,
          wcagAAA: allPassAAA,
        },
      };
    }
    
    return {
      passed: true,
      message: `All text passes WCAG AA (lowest: ${lowestContrast.toFixed(2)}:1${allPassAAA ? ', passes AAA' : ''})`,
      details: {
        lowestContrast,
        lowContrastElements: [],
        wcagAA: true,
        wcagAAA: allPassAAA,
      },
    };
  } catch (error) {
    return {
      passed: false,
      message: `Error checking contrast: ${error}`,
    };
  }
}
