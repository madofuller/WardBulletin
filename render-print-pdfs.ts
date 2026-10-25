/**
 * Proper print PDF rendering using @media print emulation
 * Generates Letter-size PDFs and converts to PNG for visual inspection
 */
import { chromium } from '@playwright/test';
import { execSync } from 'child_process';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const ARTIFACTS_DIR = '/opt/cursor/artifacts/print-pdfs-proper';
const BASE_URL = 'http://localhost:4173';

if (!existsSync(ARTIFACTS_DIR)) {
  mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const FIXTURES = [
  {
    name: 'normal',
    description: 'Normal bulletin',
    data: {
      wardName: 'SunRiver 2nd Ward',
      date: '2026-10-25',
      theme: 'Come Unto Christ',
      leadership: { presiding: 'Bishop Mark Perkins', conducting: 'Bishop Mark Perkins', chorister: 'Sister Johnson', organist: 'Brother Smith' },
      musicProgram: { openingHymnNumber: '2', openingHymnTitle: 'The Spirit of God', sacramentHymnNumber: '169', closingHymnNumber: '152' },
      prayers: { opening: 'Brother Anderson', closing: 'Sister Martinez' },
      agenda: [
        { type: 'sacrament', id: 's1' },
        { type: 'speaker', id: 'sp1', name: 'Sister Roberts' },
        { type: 'speaker', id: 'sp2', name: 'Elder Thompson' }
      ],
      announcements: [
        { id: 'a1', title: 'Ward Picnic', content: 'Saturday at the park pavilion, 10am. Bring a side dish to share.', audience: 'ward' },
        { id: 'a2', title: 'Tithing Settlement', content: 'Sign-up sheet is in the foyer.', audience: 'ward' },
        { id: 'a3', title: 'Temple Trip', content: 'Next Saturday. Bus leaves at 6am.', audience: 'ward' }
      ],
      wardLeadership: [
        { title: 'Bishop', name: 'Mark Perkins', phone: '555-0101' },
        { title: 'First Counselor', name: 'John Davis', phone: '555-0102' }
      ],
      showQRCodeOnPrint: true
    }
  },
  {
    name: 'musical-long-ward-name',
    description: 'Special Musical Number + longest ward name',
    data: {
      wardName: 'SunRiver 2nd Ward of The Church of Jesus Christ of Latter-day Saints Portland Oregon Stake',
      date: '2026-10-25',
      leadership: { presiding: 'Bishop Perkins', conducting: 'Bishop Perkins', chorister: 'Sister Johnson', organist: 'Brother Smith' },
      musicProgram: { openingHymnNumber: '136', sacramentHymnNumber: '169', closingHymnNumber: '152' },
      prayers: { opening: 'Brother Anderson', closing: 'Sister Martinez' },
      agenda: [
        { type: 'sacrament', id: 's1' },
        { type: 'musical', id: 'm1', label: 'Special Musical Number', songName: 'How Great Thou Art', performers: 'The Johnson Family Choir with Friends from the Portland Oregon Stake Combined Choirs' },
        { type: 'speaker', id: 'sp1', name: 'Sister Roberts' },
        { type: 'speaker', id: 'sp2', name: 'Elder Thompson from the High Council' }
      ],
      announcements: [
        { id: 'a1', title: 'Ward Picnic', content: 'Saturday at the park.', audience: 'ward' }
      ],
      wardLeadership: [{ title: 'Bishop', name: 'Mark Perkins', phone: '555-0101' }],
      showQRCodeOnPrint: true
    }
  },
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
      announcements: [
        { id: 'a1', title: 'Stake Temple Trip', content: 'The stake is organizing a temple trip to the Boise Idaho Temple next Saturday, November 2nd. The bus will leave from the stake center at 5:30am and return by 8pm. Please sign up in the foyer if you would like to attend. Lunch will be provided. We will have a devotional before entering the temple.', audience: 'ward' },
        { id: 'a2', title: 'Ward Christmas Party Planning Committee', content: 'We are looking for volunteers to help plan and organize our annual ward Christmas party scheduled for December 20th. Please contact Sister Anderson if you can help with decorations, food, activities, or setup and cleanup.', audience: 'ward' },
        { id: 'a3', title: 'Young Women Fundraiser for Girls Camp', content: 'The Young Women will be selling homemade baked goods after church every Sunday this month to raise funds for girls camp next summer. Please support them by purchasing cookies, brownies, cupcakes and other delicious treats.', audience: 'ward' },
        { id: 'a4', title: 'Missionary Farewell Next Week', content: 'Elder Jackson will be speaking in sacrament meeting next Sunday before leaving for the Argentina Buenos Aires South Mission. A light lunch will be provided in the cultural hall following the meeting. All are welcome to attend and wish him well.', audience: 'ward' },
        { id: 'a5', title: 'Primary Program Practice This Saturday', content: 'All primary children are asked to attend a special practice session this Saturday at 10am in the chapel. Parents are encouraged to help their children memorize their speaking parts. Light refreshments will be provided.', audience: 'ward' },
        { id: 'a6', title: 'Ward Emergency Preparedness Workshop', content: 'Brother Wilson will be conducting a comprehensive workshop on emergency preparedness this Thursday at 7pm in the Relief Society room. Topics will include food storage, 72-hour kits, water storage, and family emergency plans.', audience: 'ward' },
        { id: 'a7', title: 'Tithing Settlement Appointments Available', content: 'Tithing settlement will be held during the first two weeks of December. Please sign up for a convenient time on the sheet posted in the foyer. Bishop Perkins looks forward to meeting with each family to review your donations for the year.', audience: 'ward' },
        { id: 'a8', title: 'Family History Center Open House Event', content: 'The stake family history center will host an open house next Wednesday evening from 6-9pm. Experienced consultants will be available to help you get started with your family history research or help you break through brick walls in your research.', audience: 'ward' },
        { id: 'a9', title: 'Relief Society Service Project for Homeless', content: 'The Relief Society is organizing a service project to make warm blankets for the local homeless shelter. We will meet this Tuesday evening at 6:30pm in the cultural hall. Please bring fleece fabric if you have any to donate to this wonderful cause.', audience: 'ward' },
        { id: 'a10', title: 'Youth Activity Next Friday Evening', content: 'All youth ages 12-18 are invited to a special activity next Friday evening from 7-9pm in the cultural hall. We will be having a game night with pizza and refreshments. Please RSVP to Brother Thompson by Wednesday so we can order enough food.', audience: 'ward' },
        { id: 'a11', title: 'Ward Choir Special Musical Number', content: 'The ward choir will be performing a beautiful special musical number in sacrament meeting on the first Sunday of December. New members are always welcome to join us. Choir practices are held each Sunday morning at 9:00am in the choir room.', audience: 'ward' },
        { id: 'a12', title: 'Ward Book Club Discussion Meeting', content: 'The ward book club will meet this Thursday evening at 7pm at Sister Johnson\'s home. We will be discussing "The Work and the Glory" by Gerald Lund. Light refreshments will be served. All ward members are welcome to attend and participate.', audience: 'ward' },
        { id: 'a13', title: 'Elder\'s Quorum Moving Service', content: 'The Elder\'s Quorum will be helping Brother Martinez move to his new home this Saturday morning starting at 8am. We need volunteers with trucks and strong backs. Please contact the Elder\'s Quorum President if you can help with this important service opportunity.', audience: 'ward' },
        { id: 'a14', title: 'Seminary Registration Now Open', content: 'Registration for next semester\'s early morning seminary classes is now open for all youth ages 14-18. Parents should complete the registration form available in the foyer or online at the church website by November 15th to ensure your youth has a spot.', audience: 'ward' },
        { id: 'a15', title: 'Ward Budget Council Meeting', content: 'A ward budget council meeting will be held this Sunday immediately following sacrament meeting in the high council room. All organization presidents, auxiliaries leaders, and budget representatives are asked to attend to plan for next year\'s ward activities and programs.', audience: 'ward' }
      ],
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

async function renderPrintPDF(
  page: any,
  fixture: any,
  fontMode: any,
  branch: string
): Promise<void> {
  const testData = { ...fixture.data, printFontScale: fontMode.scale };
  
  await page.evaluate((data: any) => {
    window.localStorage.setItem('draft_bulletin', JSON.stringify({ data, savedAt: Date.now(), bulletinId: null }));
  }, testData);
  
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('#form-ward-name', { timeout: 15000 });
  await page.waitForTimeout(3000); // Let auto-fit stabilize
  
  // Emulate print media
  await page.emulateMedia({ media: 'print' });
  
  // Generate PDF using print styles
  const pdfPath = join(ARTIFACTS_DIR, `${branch}_${fixture.name}_${fontMode.name}.pdf`);
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    landscape: true,
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  
  console.log(`    ✓ PDF: ${pdfPath}`);
  
  // Convert PDF to PNG using pdftoppm
  try {
    const pngPath = join(ARTIFACTS_DIR, `${branch}_${fixture.name}_${fontMode.name}`);
    execSync(`pdftoppm -png -r 150 "${pdfPath}" "${pngPath}"`, { stdio: 'pipe' });
    console.log(`    ✓ PNG: ${pngPath}-*.png`);
  } catch (error) {
    console.log(`    ⚠ PNG conversion failed: ${error}`);
  }
  
  // Reset media emulation
  await page.emulateMedia({ media: null });
}

async function main() {
  console.log('='.repeat(80));
  console.log('PROPER PRINT PDF RENDERING');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('#form-ward-name', { timeout: 15000 });
    
    console.log('\n--- Rendering on current branch ---\n');
    
    for (const fixture of FIXTURES) {
      console.log(`\n${fixture.name}: ${fixture.description}`);
      
      for (const fontMode of FONT_MODES) {
        console.log(`  ${fontMode.displayName}...`);
        await renderPrintPDF(page, fixture, fontMode, 'current');
      }
    }
    
    console.log('\n✓ All renders complete!');
    console.log(`Artifacts: ${ARTIFACTS_DIR}`);
    
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
