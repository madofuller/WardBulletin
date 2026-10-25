/**
 * Render bulletins to PDF/PNG and measure elements for print verification
 * Tests both main and feature branch to create before/after comparisons
 */
import { chromium, type Browser, type Page } from '@playwright/test';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const ARTIFACTS_DIR = '/opt/cursor/artifacts/print-verification';
const BASE_URL = 'http://localhost:4173';

// Ensure artifacts directory exists
if (!existsSync(ARTIFACTS_DIR)) {
  mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

interface TestFixture {
  name: string;
  description: string;
  data: Record<string, any>;
}

const FIXTURES: TestFixture[] = [
  {
    name: 'normal',
    description: 'Normal bulletin with standard content',
    data: {
      wardName: 'SunRiver 2nd Ward',
      date: '2026-10-25',
      theme: 'Come Unto Christ',
      leadership: {
        presiding: 'Bishop Mark Perkins',
        conducting: 'Bishop Mark Perkins',
        chorister: 'Sister Johnson',
        organist: 'Brother Smith'
      },
      musicProgram: {
        openingHymnNumber: '2',
        openingHymnTitle: 'The Spirit of God',
        sacramentHymnNumber: '169',
        sacramentHymnTitle: 'As Now We Take the Sacrament',
        closingHymnNumber: '152',
        closingHymnTitle: 'God Be with You Till We Meet Again'
      },
      prayers: {
        opening: 'Brother Anderson',
        closing: 'Sister Martinez'
      },
      agenda: [
        { type: 'sacrament', id: 's1' },
        { type: 'speaker', id: 'sp1', name: 'Sister Roberts', speakerType: 'member' },
        { type: 'speaker', id: 'sp2', name: 'Elder Thompson', speakerType: 'highCouncil' }
      ],
      announcements: [
        { id: 'a1', title: 'Ward Picnic', content: 'Saturday at the park pavilion, 10am. Bring a side dish to share.', audience: 'ward', category: 'general' },
        { id: 'a2', title: 'Tithing Settlement', content: 'Sign-up sheet is in the foyer. Please schedule your appointment.', audience: 'ward', category: 'general' },
        { id: 'a3', title: 'Temple Trip', content: 'Next Saturday. Bus leaves at 6am from the chapel parking lot.', audience: 'ward', category: 'general' }
      ],
      wardLeadership: [
        { title: 'Bishop', name: 'Mark Perkins', phone: '555-0101' },
        { title: 'First Counselor', name: 'John Davis', phone: '555-0102' }
      ],
      showQRCodeOnPrint: true
    }
  },
  {
    name: 'special-musical',
    description: 'Special Musical Number with long ward name',
    data: {
      wardName: 'SunRiver 2nd Ward of The Church of Jesus Christ of Latter-day Saints',
      date: '2026-10-25',
      theme: 'I Know That My Redeemer Lives',
      leadership: {
        presiding: 'Bishop Mark Perkins',
        conducting: 'Bishop Mark Perkins',
        chorister: 'Sister Johnson',
        organist: 'Brother Smith'
      },
      musicProgram: {
        openingHymnNumber: '136',
        openingHymnTitle: 'I Know That My Redeemer Lives',
        sacramentHymnNumber: '169',
        sacramentHymnTitle: 'As Now We Take the Sacrament',
        closingHymnNumber: '152',
        closingHymnTitle: 'God Be with You Till We Meet Again'
      },
      prayers: {
        opening: 'Brother Anderson',
        closing: 'Sister Martinez'
      },
      agenda: [
        { type: 'sacrament', id: 's1' },
        { 
          type: 'musical', 
          id: 'm1', 
          label: 'Special Musical Number',
          songName: 'How Great Thou Art',
          performers: 'The Johnson Family with Friends from the Stake Choir'
        },
        { type: 'speaker', id: 'sp1', name: 'Sister Roberts', speakerType: 'member' },
        { type: 'speaker', id: 'sp2', name: 'Elder Thompson', speakerType: 'highCouncil' }
      ],
      announcements: [
        { id: 'a1', title: 'Ward Picnic', content: 'Saturday at the park.', audience: 'ward', category: 'general' }
      ],
      wardLeadership: [
        { title: 'Bishop', name: 'Mark Perkins', phone: '555-0101' }
      ],
      showQRCodeOnPrint: true
    }
  },
  {
    name: 'many-announcements',
    description: '15 long announcements',
    data: {
      wardName: 'SunRiver 2nd Ward',
      date: '2026-10-25',
      leadership: {
        presiding: 'Bishop Mark Perkins',
        conducting: 'Bishop Mark Perkins',
        chorister: 'Sister Johnson',
        organist: 'Brother Smith'
      },
      musicProgram: {
        openingHymnNumber: '2',
        openingHymnTitle: 'The Spirit of God',
        sacramentHymnNumber: '169',
        sacramentHymnTitle: 'As Now We Take the Sacrament',
        closingHymnNumber: '152',
        closingHymnTitle: 'God Be with You Till We Meet Again'
      },
      prayers: {
        opening: 'Brother Anderson',
        closing: 'Sister Martinez'
      },
      agenda: [
        { type: 'sacrament', id: 's1' },
        { type: 'speaker', id: 'sp1', name: 'Sister Roberts', speakerType: 'member' }
      ],
      announcements: [
        { id: 'a1', title: 'Stake Temple Trip', content: 'The stake is organizing a temple trip to the Boise Idaho Temple next Saturday, November 2nd. The bus will leave from the stake center at 5:30am and return by 8pm. Please sign up in the foyer if you would like to attend. Lunch will be provided.', audience: 'ward', category: 'general' },
        { id: 'a2', title: 'Ward Christmas Party Planning', content: 'We are looking for volunteers to help plan and organize our annual ward Christmas party scheduled for December 20th. Please contact Sister Anderson if you can help with decorations, food, or activities.', audience: 'ward', category: 'general' },
        { id: 'a3', title: 'Young Women Fundraiser', content: 'The Young Women will be selling homemade baked goods after church to raise funds for girls camp next summer. Please support them by purchasing cookies, brownies, and other delicious treats.', audience: 'ward', category: 'general' },
        { id: 'a4', title: 'Missionary Farewell', content: 'Elder Jackson will be speaking in sacrament meeting next Sunday before leaving for the Argentina Buenos Aires South Mission. A light lunch will be provided in the cultural hall following the meeting.', audience: 'ward', category: 'general' },
        { id: 'a5', title: 'Primary Program Practice', content: 'All primary children are asked to attend a special practice session this Saturday at 10am in the chapel. Parents are encouraged to help their children memorize their speaking parts.', audience: 'ward', category: 'general' },
        { id: 'a6', title: 'Ward Emergency Preparedness', content: 'Brother Wilson will be conducting a workshop on emergency preparedness this Thursday at 7pm in the Relief Society room. Topics will include food storage, 72-hour kits, and family emergency plans.', audience: 'ward', category: 'general' },
        { id: 'a7', title: 'Tithing Settlement Appointments', content: 'Tithing settlement will be held during the first two weeks of December. Please sign up for a convenient time on the sheet in the foyer. Bishop Perkins looks forward to meeting with each family.', audience: 'ward', category: 'general' },
        { id: 'a8', title: 'Family History Center Open House', content: 'The stake family history center will host an open house next Wednesday from 6-9pm. Consultants will be available to help you get started with your family history research or break through brick walls.', audience: 'ward', category: 'general' },
        { id: 'a9', title: 'Relief Society Service Project', content: 'The Relief Society is organizing a service project to make blankets for the local homeless shelter. We will meet this Tuesday at 6:30pm in the cultural hall. Please bring fleece fabric if you have any to donate.', audience: 'ward', category: 'general' },
        { id: 'a10', title: 'Youth Activity Next Week', content: 'All youth are invited to a special activity next Friday evening from 7-9pm. We will be having a game night with pizza and refreshments. Please RSVP to Brother Thompson by Wednesday.', audience: 'ward', category: 'general' },
        { id: 'a11', title: 'Ward Choir Performance', content: 'The ward choir will be performing a special musical number in sacrament meeting on the first Sunday of December. New members are welcome to join. Practices are held each Sunday at 9:00am in the choir room.', audience: 'ward', category: 'general' },
        { id: 'a12', title: 'Book Club Meeting', content: 'The ward book club will meet this Thursday evening at 7pm at Sister Johnson\'s home. We will be discussing "The Work and the Glory" by Gerald Lund. Light refreshments will be served.', audience: 'ward', category: 'general' },
        { id: 'a13', title: 'Elder\'s Quorum Service Opportunity', content: 'The Elder\'s Quorum will be helping Brother Martinez move to his new home this Saturday starting at 8am. We need volunteers with trucks. Please contact the Elder\'s Quorum President if you can help.', audience: 'ward', category: 'general' },
        { id: 'a14', title: 'Seminary Registration', content: 'Registration for next semester\'s seminary classes is now open. Parents of youth ages 14-18 should complete the registration form available in the foyer or online at the church website by November 15th.', audience: 'ward', category: 'general' },
        { id: 'a15', title: 'Ward Budget Meeting', content: 'A ward budget meeting will be held this Sunday immediately following sacrament meeting in the high council room. All organization presidents and budget representatives are asked to attend.', audience: 'ward', category: 'general' }
      ],
      wardLeadership: [
        { title: 'Bishop', name: 'Mark Perkins', phone: '555-0101' }
      ],
      showQRCodeOnPrint: true
    }
  }
];

const FONT_MODES = [
  { scale: 1, name: 'normal', displayName: 'Normal (100%)' },
  { scale: 1.15, name: 'large', displayName: 'Large (115%)' },
  { scale: 1.25, name: 'extralarge', displayName: 'Extra Large (125%)' }
];

interface Measurement {
  elementType: string;
  distanceFromLeft: number;
  distanceFromRight: number;
  distanceFromTop: number;
  distanceFromBottom: number;
  fontSize: number;
  width: number;
  height: number;
}

async function seedDraft(page: Page, data: Record<string, any>): Promise<void> {
  await page.addInitScript((draftData) => {
    window.localStorage.setItem(
      'draft_bulletin',
      JSON.stringify({ data: draftData, savedAt: Date.now(), bulletinId: null })
    );
    // Mock profile for QR code
    window.localStorage.setItem('sb-mock-auth', JSON.stringify({
      user: { id: 'test-user', email: 'test@example.com' },
      profile: { profile_slug: 'sunriver2nd', unit_type: 'ward' }
    }));
  }, data);
}

async function measureElements(page: Page): Promise<Measurement[]> {
  return await page.evaluate(() => {
    const measurements: Measurement[] = [];
    const printPortal = document.querySelector('.print-source-portal');
    if (!printPortal) return measurements;

    // Page dimensions at 72 DPI: 11in × 8.5in = 792px × 612px
    const pageWidth = 792;
    const pageHeight = 612;

    // Measure key elements
    const selectors = [
      { selector: '.print-page h1, .print-page h2', type: 'ward-name' },
      { selector: '.print-page canvas', type: 'qr-code' },
      { selector: '.print-page [style*="column-count"]', type: 'announcements-container' },
      { selector: '.print-page .announcement-title', type: 'announcement-title' },
      { selector: '.print-page .announcement-content', type: 'announcement-content' },
      { selector: '.print-page table td', type: 'program-text' }
    ];

    for (const { selector, type } of selectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);

        // Find the containing page
        const page = el.closest('.print-page');
        if (!page) return;
        const pageRect = page.getBoundingClientRect();

        // Calculate distances from page edges (not viewport edges)
        const leftDist = rect.left - pageRect.left;
        const rightDist = pageRect.right - rect.right;
        const topDist = rect.top - pageRect.top;
        const bottomDist = pageRect.bottom - rect.bottom;

        // Convert to inches (assuming 72 DPI for PDF)
        const toInches = (px: number) => px / 72;

        measurements.push({
          elementType: `${type}-${idx}`,
          distanceFromLeft: toInches(leftDist),
          distanceFromRight: toInches(rightDist),
          distanceFromTop: toInches(topDist),
          distanceFromBottom: toInches(bottomDist),
          fontSize: fontSize,
          width: toInches(rect.width),
          height: toInches(rect.height)
        });
      });
    }

    return measurements;
  });
}

async function renderAndMeasure(
  page: Page,
  fixture: TestFixture,
  fontMode: typeof FONT_MODES[0],
  branch: string,
  outputDir: string
): Promise<{ measurements: Measurement[], minFontSize: number, minMargin: number }> {
  const testData = { ...fixture.data, printFontScale: fontMode.scale };
  
  await seedDraft(page, testData);
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  
  // Wait for app to fully load
  await page.waitForSelector('input[id="form-ward-name"], #form-ward-name', { timeout: 15000 });
  await page.waitForTimeout(1000);
  
  // Wait for print layout portal to render
  await page.waitForSelector('.print-source-portal', { timeout: 15000 });
  await page.waitForTimeout(3000); // Let auto-fit stabilize
  
  // Generate PDF
  const pdfPath = join(outputDir, `${branch}_${fixture.name}_${fontMode.name}.pdf`);
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    landscape: true,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  
  console.log(`✓ Generated PDF: ${pdfPath}`);
  
  // Measure elements
  const measurements = await measureElements(page);
  
  // Find minimum font size and minimum margin
  const fontSizes = measurements.map(m => m.fontSize).filter(f => f > 0);
  const minFontSize = fontSizes.length > 0 ? Math.min(...fontSizes) : 0;
  
  const margins = measurements.flatMap(m => [
    m.distanceFromLeft,
    m.distanceFromRight,
    m.distanceFromTop,
    m.distanceFromBottom
  ]).filter(m => m >= 0);
  const minMargin = margins.length > 0 ? Math.min(...margins) : 0;
  
  // Save measurements
  const measurementsPath = join(outputDir, `${branch}_${fixture.name}_${fontMode.name}_measurements.json`);
  writeFileSync(measurementsPath, JSON.stringify({ measurements, minFontSize, minMargin }, null, 2));
  
  // Screenshot each print page
  const pages = await page.locator('.print-source-portal .print-page').all();
  for (let i = 0; i < pages.length; i++) {
    const screenshotPath = join(outputDir, `${branch}_${fixture.name}_${fontMode.name}_page${i + 1}.png`);
    await pages[i].screenshot({ 
      path: screenshotPath,
      type: 'png',
      scale: 'device'
    });
    console.log(`✓ Generated PNG: page ${i + 1}`);
  }
  
  return { measurements, minFontSize, minMargin };
}

async function main() {
  console.log('='.repeat(80));
  console.log('PRINT VERIFICATION - RENDERING AND MEASURING');
  console.log('='.repeat(80));
  console.log(`Output directory: ${ARTIFACTS_DIR}\n`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ 
    viewport: { width: 1400, height: 1000 },
    deviceScaleFactor: 1
  });
  
  const results: Record<string, any> = {};
  
  try {
    // Test BEFORE (main branch - already built)
    console.log('\n' + '='.repeat(80));
    console.log('BEFORE (main branch)');
    console.log('='.repeat(80));
    
    for (const fixture of FIXTURES) {
      console.log(`\n--- ${fixture.name}: ${fixture.description} ---`);
      results[fixture.name] = { before: {}, after: {} };
      
      for (const fontMode of FONT_MODES) {
        console.log(`  Testing ${fontMode.displayName}...`);
        const page = await context.newPage();
        
        const result = await renderAndMeasure(page, fixture, fontMode, 'before', ARTIFACTS_DIR);
        results[fixture.name].before[fontMode.name] = result;
        
        console.log(`    Min font size: ${result.minFontSize.toFixed(1)}px`);
        console.log(`    Min margin: ${result.minMargin.toFixed(3)}in`);
        
        await page.close();
      }
    }
    
    // Switch to feature branch and rebuild
    console.log('\n' + '='.repeat(80));
    console.log('Building feature branch...');
    console.log('='.repeat(80));
    
    execSync('cd /workspace && git checkout cursor/print-layout-fixes-f7ea && git stash pop || true', { stdio: 'inherit' });
    execSync('cd /workspace && npm run build', { stdio: 'inherit' });
    
    // Wait for preview server to reload
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test AFTER (feature branch)
    console.log('\n' + '='.repeat(80));
    console.log('AFTER (feature branch)');
    console.log('='.repeat(80));
    
    for (const fixture of FIXTURES) {
      console.log(`\n--- ${fixture.name}: ${fixture.description} ---`);
      
      for (const fontMode of FONT_MODES) {
        console.log(`  Testing ${fontMode.displayName}...`);
        const page = await context.newPage();
        
        const result = await renderAndMeasure(page, fixture, fontMode, 'after', ARTIFACTS_DIR);
        results[fixture.name].after[fontMode.name] = result;
        
        console.log(`    Min font size: ${result.minFontSize.toFixed(1)}px`);
        console.log(`    Min margin: ${result.minMargin.toFixed(3)}in`);
        
        await page.close();
      }
    }
    
    // Generate comparison report
    console.log('\n' + '='.repeat(80));
    console.log('COMPARISON REPORT');
    console.log('='.repeat(80));
    
    const reportPath = join(ARTIFACTS_DIR, 'comparison-report.json');
    writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n✓ Saved comparison report: ${reportPath}`);
    
    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    
    for (const fixture of FIXTURES) {
      console.log(`\n${fixture.name}:`);
      for (const fontMode of FONT_MODES) {
        const before = results[fixture.name].before[fontMode.name];
        const after = results[fixture.name].after[fontMode.name];
        
        console.log(`  ${fontMode.displayName}:`);
        console.log(`    Font size: ${before.minFontSize.toFixed(1)}px → ${after.minFontSize.toFixed(1)}px`);
        console.log(`    Min margin: ${before.minMargin.toFixed(3)}in → ${after.minMargin.toFixed(3)}in`);
        
        // Highlight issues
        if (after.minMargin < 0.25) {
          console.log(`    ⚠ WARNING: Margin too small (< 0.25in safety zone)`);
        }
        if (fontMode.name === 'extralarge' && after.minFontSize < 12) {
          console.log(`    ⚠ WARNING: Font too small for seniors in Extra Large mode`);
        }
      }
    }
    
  } finally {
    await browser.close();
  }
  
  console.log('\n✓ All renders complete!');
  console.log(`Output saved to: ${ARTIFACTS_DIR}`);
}

main().catch(console.error);
