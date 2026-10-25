/**
 * Test script to render bulletins to PDF and PNG for visual inspection
 * Tests normal and Extra Large modes with various content scenarios
 */
import { chromium, type Browser, type Page } from '@playwright/test';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const ARTIFACTS_DIR = '/opt/cursor/artifacts/print-tests';
const TEST_PORT = 5173;
const BASE_URL = `http://localhost:${TEST_PORT}`;

// Ensure artifacts directory exists
if (!existsSync(ARTIFACTS_DIR)) {
  mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

interface TestBulletin {
  name: string;
  data: Record<string, any>;
  description: string;
}

const TEST_BULLETINS: TestBulletin[] = [
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
        { title: 'First Counselor', name: 'John Davis', phone: '555-0102' },
        { title: 'Second Counselor', name: 'Robert Wilson', phone: '555-0103' },
        { title: 'Ward Clerk', name: 'Michael Brown', phone: '555-0104' }
      ],
      showQRCodeOnPrint: true,
      printFontScale: 1,
      printTightMargins: false
    }
  },
  {
    name: 'special-musical',
    description: 'Bulletin with Special Musical Number (tests ward name overflow)',
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
          performers: 'The Johnson Family and Friends from the Stake Choir'
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
      showQRCodeOnPrint: true,
      printFontScale: 1,
      printTightMargins: false
    }
  },
  {
    name: 'many-announcements',
    description: 'Bulletin with 15 long announcements (tests text shrinking)',
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
      showQRCodeOnPrint: true,
      printFontScale: 1,
      printTightMargins: false
    }
  }
];

async function seedDraft(page: Page, data: Record<string, any>): Promise<void> {
  await page.addInitScript((draftData) => {
    window.localStorage.setItem(
      'draft_bulletin',
      JSON.stringify({ data: draftData, savedAt: Date.now(), bulletinId: null })
    );
    // Mock profile for QR code
    window.localStorage.setItem('sb-mock-profile', JSON.stringify({ profile_slug: 'sunriver2nd' }));
  }, data);
}

async function renderBulletin(
  page: Page,
  bulletin: TestBulletin,
  fontScale: number,
  outputPrefix: string
): Promise<void> {
  const scaleName = fontScale === 1 ? 'normal' : fontScale === 1.15 ? 'large' : 'extralarge';
  const testData = { ...bulletin.data, printFontScale: fontScale };
  
  await seedDraft(page, testData);
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  
  // Wait for print layout to render
  await page.waitForSelector('.print-source-portal', { timeout: 10000 });
  await page.waitForTimeout(2000); // Let auto-fit stabilize
  
  // Generate PDF
  const pdfPath = join(ARTIFACTS_DIR, `${outputPrefix}_${bulletin.name}_${scaleName}.pdf`);
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    landscape: true,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  
  console.log(`Generated PDF: ${pdfPath}`);
  
  // Screenshot each page
  const pages = await page.locator('.print-source-portal .print-page').all();
  for (let i = 0; i < pages.length; i++) {
    const screenshotPath = join(ARTIFACTS_DIR, `${outputPrefix}_${bulletin.name}_${scaleName}_page${i + 1}.png`);
    await pages[i].screenshot({ path: screenshotPath, fullPage: false });
    console.log(`Generated screenshot: ${screenshotPath}`);
  }
}

async function main() {
  console.log('Starting print rendering tests...');
  console.log(`Artifacts will be saved to: ${ARTIFACTS_DIR}`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  
  try {
    // Test BEFORE fixes
    console.log('\n=== BEFORE FIXES ===');
    for (const bulletin of TEST_BULLETINS) {
      console.log(`\nTesting ${bulletin.name}: ${bulletin.description}`);
      const page = await context.newPage();
      
      // Test normal and extra large modes
      await renderBulletin(page, bulletin, 1, 'before');
      await renderBulletin(page, bulletin, 1.25, 'before');
      
      await page.close();
    }
    
    console.log('\n=== All tests completed ===');
    console.log('Artifacts saved to:', ARTIFACTS_DIR);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
