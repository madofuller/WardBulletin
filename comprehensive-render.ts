/**
 * Comprehensive before/after rendering with measurements
 * Tests main branch vs feature branch for all fixtures and font modes
 */
import { chromium, type Browser, type Page } from '@playwright/test';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const ARTIFACTS_DIR = '/opt/cursor/artifacts/print-verification';
const BASE_URL = 'http://localhost:4173';

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
    description: 'Normal bulletin',
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
        { id: 'a2', title: 'Tithing Settlement', content: 'Sign-up sheet is in the foyer.', audience: 'ward', category: 'general' },
        { id: 'a3', title: 'Temple Trip', content: 'Next Saturday. Bus leaves at 6am.', audience: 'ward', category: 'general' }
      ],
      wardLeadership: [
        { title: 'Bishop', name: 'Mark Perkins', phone: '555-0101' },
        { title: 'First Counselor', name: 'John Davis', phone: '555-0102' }
      ],
      showQRCodeOnPrint: true
    }
  },
  {
    name: 'musical',
    description: 'Special Musical Number + long ward name',
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
    name: 'heavy-announcements',
    description: '12 long announcements',
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
        closingHymnNumber: '152'
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
        { id: 'a12', title: 'Book Club Meeting', content: 'The ward book club will meet this Thursday evening at 7pm at Sister Johnson\'s home. We will be discussing "The Work and the Glory" by Gerald Lund. Light refreshments will be served.', audience: 'ward', category: 'general' }
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
  { scale: 1.25, name: 'extralarge', displayName: 'Extra Large (125%)' }
];

interface Measurements {
  qrCode: { left: number; right: number; top: number; bottom: number; } | null;
  wardName: { left: number; right: number; top: number; bottom: number; clipped: boolean } | null;
  minAnnouncementFontSize: number;
  pageWidth: number;
  pageHeight: number;
}

async function measurePage(page: Page): Promise<Measurements> {
  return await page.evaluate(() => {
    const measurements: Measurements = {
      qrCode: null,
      wardName: null,
      minAnnouncementFontSize: 999,
      pageWidth: 0,
      pageHeight: 0
    };
    
    const printPages = document.querySelectorAll('.print-source-portal .print-page');
    if (printPages.length === 0) return measurements;
    
    const firstPage = printPages[0];
    const pageRect = firstPage.getBoundingClientRect();
    measurements.pageWidth = pageRect.width / 72; // Convert to inches
    measurements.pageHeight = pageRect.height / 72;
    
    // Measure QR code
    const qrCanvas = document.querySelector('.print-source-portal canvas');
    if (qrCanvas) {
      const rect = qrCanvas.getBoundingClientRect();
      measurements.qrCode = {
        left: (rect.left - pageRect.left) / 72,
        right: (pageRect.right - rect.right) / 72,
        top: (rect.top - pageRect.top) / 72,
        bottom: (pageRect.bottom - rect.bottom) / 72
      };
    }
    
    // Measure ward name (look for h1 or h2 elements)
    const wardNameEl = document.querySelector('.print-source-portal .print-page h1, .print-source-portal .print-page h2');
    if (wardNameEl) {
      const rect = wardNameEl.getBoundingClientRect();
      const parentPage = wardNameEl.closest('.print-page');
      if (parentPage) {
        const parentRect = parentPage.getBoundingClientRect();
        measurements.wardName = {
          left: (rect.left - parentRect.left) / 72,
          right: (parentRect.right - rect.right) / 72,
          top: (rect.top - parentRect.top) / 72,
          bottom: (parentRect.bottom - rect.bottom) / 72,
          clipped: rect.right > parentRect.right || rect.left < parentRect.left
        };
      }
    }
    
    // Measure announcement font sizes
    const announcementEls = document.querySelectorAll('.print-source-portal .announcement-content, .print-source-portal [style*="column-count"] *');
    announcementEls.forEach(el => {
      const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
      if (fontSize > 0 && fontSize < measurements.minAnnouncementFontSize) {
        measurements.minAnnouncementFontSize = fontSize;
      }
    });
    
    return measurements;
  });
}

async function renderFixture(
  page: Page,
  fixture: TestFixture,
  fontMode: typeof FONT_MODES[0],
  branch: string
): Promise<Measurements> {
  const testData = { ...fixture.data, printFontScale: fontMode.scale };
  
  // Inject draft
  await page.evaluate((data) => {
    window.localStorage.setItem(
      'draft_bulletin',
      JSON.stringify({ data, savedAt: Date.now(), bulletinId: null })
    );
  }, testData);
  
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('#form-ward-name', { timeout: 15000 });
  await page.waitForTimeout(3000); // Let auto-fit stabilize
  
  // Screenshot pages
  const printPages = await page.locator('.print-source-portal .print-page').all();
  for (let i = 0; i < printPages.length; i++) {
    const path = join(ARTIFACTS_DIR, `${branch}_${fixture.name}_${fontMode.name}_page${i + 1}.png`);
    await printPages[i].screenshot({ path, type: 'png' });
  }
  
  // Generate PDF
  const pdfPath = join(ARTIFACTS_DIR, `${branch}_${fixture.name}_${fontMode.name}.pdf`);
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    landscape: true,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  
  // Measure
  const measurements = await measurePage(page);
  
  console.log(`    Min announcement font: ${measurements.minAnnouncementFontSize.toFixed(1)}px`);
  if (measurements.qrCode) {
    const minMargin = Math.min(
      measurements.qrCode.left,
      measurements.qrCode.right,
      measurements.qrCode.top,
      measurements.qrCode.bottom
    );
    console.log(`    QR code min margin: ${minMargin.toFixed(3)}in`);
  }
  if (measurements.wardName && measurements.wardName.clipped) {
    console.log(`    ⚠ Ward name CLIPPED!`);
  }
  
  return measurements;
}

async function main() {
  console.log('='.repeat(80));
  console.log('COMPREHENSIVE BEFORE/AFTER RENDERING');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  
  const results: Record<string, any> = {};
  
  try {
    // Navigate once to let app load
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('#form-ward-name', { timeout: 15000 });
    
    console.log('\n' + '='.repeat(80));
    console.log('BEFORE (main branch)');
    console.log('='.repeat(80));
    
    for (const fixture of FIXTURES) {
      console.log(`\n${fixture.name}: ${fixture.description}`);
      results[fixture.name] = { before: {}, after: {} };
      
      for (const fontMode of FONT_MODES) {
        console.log(`  ${fontMode.displayName}...`);
        const measurements = await renderFixture(page, fixture, fontMode, 'before');
        results[fixture.name].before[fontMode.name] = measurements;
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('Switching to feature branch...');
    console.log('='.repeat(80));
    
    execSync('cd /workspace && git checkout cursor/print-layout-fixes-f7ea', { stdio: 'inherit' });
    execSync('cd /workspace && npm run build', { stdio: 'inherit' });
    
    // Kill and restart preview server
    execSync('pkill -f "vite preview" || true', { stdio: 'pipe' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const serverProcess = execSync('cd /workspace && npm run preview -- --port 4173 --strictPort > /dev/null 2>&1 &', { stdio: 'pipe' });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Reload page with new build
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('#form-ward-name', { timeout: 15000 });
    
    console.log('\n' + '='.repeat(80));
    console.log('AFTER (feature branch)');
    console.log('='.repeat(80));
    
    for (const fixture of FIXTURES) {
      console.log(`\n${fixture.name}: ${fixture.description}`);
      
      for (const fontMode of FONT_MODES) {
        console.log(`  ${fontMode.displayName}...`);
        const measurements = await renderFixture(page, fixture, fontMode, 'after');
        results[fixture.name].after[fontMode.name] = measurements;
      }
    }
    
    // Save results
    const resultsPath = join(ARTIFACTS_DIR, 'comparison-results.json');
    writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n✓ Results saved: ${resultsPath}`);
    
  } finally {
    await browser.close();
  }
  
  console.log('\n✓ All renders complete!');
  console.log(`Artifacts: ${ARTIFACTS_DIR}`);
}

main().catch(console.error);
