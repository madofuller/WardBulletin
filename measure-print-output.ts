/**
 * Measurement script for print PDF verification
 * - Asserts all elements are >= 0.25in from Letter page edges
 * - Records minimum font sizes in points
 */
import { chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';
const DPI = 96; // Browser DPI
const INCHES_TO_PX = DPI;

// Letter size landscape: 11in x 8.5in
const PAGE_WIDTH_IN = 11;
const PAGE_HEIGHT_IN = 8.5;
const SAFETY_MARGIN_IN = 0.25;

const SAFETY_LEFT_PX = SAFETY_MARGIN_IN * INCHES_TO_PX;
const SAFETY_RIGHT_PX = (PAGE_WIDTH_IN - SAFETY_MARGIN_IN) * INCHES_TO_PX;
const SAFETY_TOP_PX = SAFETY_MARGIN_IN * INCHES_TO_PX;
const SAFETY_BOTTOM_PX = (PAGE_HEIGHT_IN - SAFETY_MARGIN_IN) * INCHES_TO_PX;

const FIXTURES = [
  {
    name: 'heavy-announcements',
    description: '15 long announcements',
    data: {
      wardName: 'SunRiver 2nd Ward',
      date: '2026-10-25',
      leadership: { presiding: 'Bishop Perkins', conducting: 'Bishop Perkins', chorister: 'Sister Johnson', organist: 'Brother Smith' },
      musicProgram: { openingHymnNumber: '2', sacramentHymnNumber: '169', closingHymnNumber: '152' },
      prayers: { opening: 'Brother Anderson', closing: 'Sister Martinez' },
      agenda: [{ type: 'sacrament', id: 's1' }, { type: 'speaker', id: 'sp1', name: 'Sister Roberts' }],
      announcements: Array.from({ length: 15 }, (_, i) => ({
        id: `a${i + 1}`,
        title: `Announcement ${i + 1}`,
        content: 'This is a long announcement with substantial content that tests the layout at various font scales. '.repeat(10),
        audience: 'ward'
      })),
      wardLeadership: [{ title: 'Bishop', name: 'Mark Perkins', phone: '555-0101' }],
      showQRCodeOnPrint: true
    }
  }
];

const FONT_MODES = [
  { scale: 1, name: 'normal', displayName: 'Normal (100%)' },
  { scale: 1.15, name: 'large', displayName: 'Large (115%)' },
  { scale: 1.25, name: 'extralarge', displayName: 'Extra Large (125%)' }
];

interface MeasurementResult {
  fixture: string;
  mode: string;
  violations: string[];
  minFontSizePt: number;
  sampleFontSizes: { selector: string; sizePt: number }[];
}

async function measurePrintLayout(page: any, fixture: any, fontMode: any): Promise<MeasurementResult> {
  const testData = { ...fixture.data, printFontScale: fontMode.scale };

  // Set draft data
  await page.evaluate((data: any) => {
    window.localStorage.setItem('draft_bulletin', JSON.stringify({ data, savedAt: Date.now(), bulletinId: null }));
  }, testData);

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('#form-ward-name', { timeout: 15000 });
  await page.waitForTimeout(2000);

  // Emulate print media
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(1000);

  // Measure all elements
  const measurements = await page.evaluate(
    ({ safetyLeft, safetyRight, safetyTop, safetyBottom }: any) => {
      const violations: string[] = [];
      const fontSizes: { selector: string; sizePt: number }[] = [];

      // Get all print pages
      const printPages = document.querySelectorAll('.print-page');

      printPages.forEach((printPage, pageIndex) => {
        // Get all visible elements with content
        const elements = printPage.querySelectorAll('*');

        elements.forEach((el) => {
          const element = el as HTMLElement;
          const rect = element.getBoundingClientRect();

          // Skip empty or hidden elements
          if (rect.width === 0 || rect.height === 0) return;
          if (window.getComputedStyle(element).display === 'none') return;
          if (window.getComputedStyle(element).visibility === 'hidden') return;

          // Check if element has text content
          const hasText = element.textContent && element.textContent.trim().length > 0;

          if (hasText) {
            // Check margins
            if (rect.left < safetyLeft) {
              violations.push(
                `Page ${pageIndex + 1}: Element "${element.tagName}.${element.className}" left edge ${rect.left.toFixed(1)}px < ${safetyLeft}px safety margin`
              );
            }
            if (rect.right > safetyRight) {
              violations.push(
                `Page ${pageIndex + 1}: Element "${element.tagName}.${element.className}" right edge ${rect.right.toFixed(1)}px > ${safetyRight}px safety margin`
              );
            }
            if (rect.top < safetyTop) {
              violations.push(
                `Page ${pageIndex + 1}: Element "${element.tagName}.${element.className}" top edge ${rect.top.toFixed(1)}px < ${safetyTop}px safety margin`
              );
            }
            if (rect.bottom > safetyBottom) {
              violations.push(
                `Page ${pageIndex + 1}: Element "${element.tagName}.${element.className}" bottom edge ${rect.bottom.toFixed(1)}px > ${safetyBottom}px safety margin`
              );
            }

            // Measure font size
            const style = window.getComputedStyle(element);
            const fontSizePx = parseFloat(style.fontSize);
            const fontSizePt = fontSizePx * 0.75; // Convert px to pt (96dpi: 1pt = 1.333px)

            // Sample representative elements
            if (
              element.tagName === 'P' ||
              element.tagName === 'SPAN' ||
              element.tagName === 'DIV' ||
              element.tagName === 'TD' ||
              element.tagName === 'LI'
            ) {
              const selector = `${element.tagName}.${element.className.split(' ')[0] || 'no-class'}`;
              fontSizes.push({ selector, sizePt: fontSizePt });
            }
          }
        });
      });

      return { violations, fontSizes };
    },
    {
      safetyLeft: SAFETY_LEFT_PX,
      safetyRight: SAFETY_RIGHT_PX,
      safetyTop: SAFETY_TOP_PX,
      safetyBottom: SAFETY_BOTTOM_PX
    }
  );

  // Reset media
  await page.emulateMedia({ media: null });

  // Calculate min font size
  const minFontSizePt = measurements.fontSizes.length > 0 
    ? Math.min(...measurements.fontSizes.map(f => f.sizePt))
    : 0;

  // Sample 10 representative font sizes
  const sampleFontSizes = measurements.fontSizes
    .filter((f, i, arr) => arr.findIndex(x => x.selector === f.selector) === i) // Unique selectors
    .slice(0, 10);

  return {
    fixture: fixture.name,
    mode: fontMode.displayName,
    violations: measurements.violations,
    minFontSizePt,
    sampleFontSizes
  };
}

async function main() {
  console.log('================================================================================');
  console.log('PRINT LAYOUT MEASUREMENTS');
  console.log('================================================================================');
  console.log(`Letter size landscape: ${PAGE_WIDTH_IN}in × ${PAGE_HEIGHT_IN}in`);
  console.log(`Safety margin: ${SAFETY_MARGIN_IN}in from edges`);
  console.log(`Safe area: ${SAFETY_LEFT_PX}px to ${SAFETY_RIGHT_PX}px × ${SAFETY_TOP_PX}px to ${SAFETY_BOTTOM_PX}px`);
  console.log();

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

  const results: MeasurementResult[] = [];

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('#form-ward-name', { timeout: 15000 });

    for (const fixture of FIXTURES) {
      console.log(`\\n${fixture.name}: ${fixture.description}`);

      for (const fontMode of FONT_MODES) {
        console.log(`  ${fontMode.displayName}...`);
        const result = await measurePrintLayout(page, fixture, fontMode);
        results.push(result);

        if (result.violations.length > 0) {
          console.log(`    ❌ ${result.violations.length} margin violations`);
          result.violations.slice(0, 3).forEach(v => console.log(`       ${v}`));
          if (result.violations.length > 3) {
            console.log(`       ... and ${result.violations.length - 3} more`);
          }
        } else {
          console.log(`    ✓ All elements within safety margins`);
        }

        console.log(`    Min font size: ${result.minFontSizePt.toFixed(1)}pt`);
      }
    }

    console.log('\\n================================================================================');
    console.log('SUMMARY');
    console.log('================================================================================');

    // Print table
    console.log('\\nMode             | Min Font (pt) | Margin Violations');
    console.log('-----------------+---------------+------------------');
    results.forEach(r => {
      const modeLabel = r.mode.padEnd(16);
      const minFont = r.minFontSizePt.toFixed(1).padStart(13);
      const violations = r.violations.length === 0 ? '✓ PASS' : `❌ ${r.violations.length} violations`;
      console.log(`${modeLabel}| ${minFont} | ${violations}`);
    });

    console.log('\\n✓ Measurements complete!');
  } finally {
    await browser.close();
  }

  // Exit with error if violations found
  const totalViolations = results.reduce((sum, r) => sum + r.violations.length, 0);
  if (totalViolations > 0) {
    console.error(`\\n❌ Found ${totalViolations} total margin violations`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
