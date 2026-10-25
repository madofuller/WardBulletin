// Simpler script to just render the "after" (feature branch already built and running)
import { chromium } from '@playwright/test';
import { join } from 'path';

const ARTIFACTS_DIR = '/opt/cursor/artifacts/print-verification';
const BASE_URL = 'http://localhost:4173';

const FIXTURES = [
  {
    name: 'normal',
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
    name: 'musical',
    data: {
      wardName: 'SunRiver 2nd Ward of The Church of Jesus Christ of Latter-day Saints',
      date: '2026-10-25',
      leadership: { presiding: 'Bishop Perkins', conducting: 'Bishop Perkins', chorister: 'Sister Johnson', organist: 'Brother Smith' },
      musicProgram: { openingHymnNumber: '136', sacramentHymnNumber: '169', closingHymnNumber: '152' },
      prayers: { opening: 'Brother Anderson', closing: 'Sister Martinez' },
      agenda: [
        { type: 'sacrament', id: 's1' },
        { type: 'musical', id: 'm1', label: 'Special Musical Number', songName: 'How Great Thou Art', performers: 'The Johnson Family with Friends from the Stake Choir' },
        { type: 'speaker', id: 'sp1', name: 'Sister Roberts' }
      ],
      announcements: [{ id: 'a1', title: 'Ward Picnic', content: 'Saturday at the park.', audience: 'ward' }],
      wardLeadership: [{ title: 'Bishop', name: 'Mark Perkins', phone: '555-0101' }],
      showQRCodeOnPrint: true
    }
  },
  {
    name: 'heavy-announcements',
    data: {
      wardName: 'SunRiver 2nd Ward',
      date: '2026-10-25',
      leadership: { presiding: 'Bishop Perkins', conducting: 'Bishop Perkins', chorister: 'Sister Johnson', organist: 'Brother Smith' },
      musicProgram: { openingHymnNumber: '2', sacramentHymnNumber: '169', closingHymnNumber: '152' },
      prayers: { opening: 'Brother Anderson', closing: 'Sister Martinez' },
      agenda: [{ type: 'sacrament', id: 's1' }, { type: 'speaker', id: 'sp1', name: 'Sister Roberts' }],
      announcements: [
        { id: 'a1', title: 'Stake Temple Trip', content: 'The stake is organizing a temple trip to the Boise Idaho Temple next Saturday, November 2nd. The bus will leave from the stake center at 5:30am and return by 8pm. Please sign up in the foyer if you would like to attend. Lunch will be provided.', audience: 'ward' },
        { id: 'a2', title: 'Ward Christmas Party Planning', content: 'We are looking for volunteers to help plan and organize our annual ward Christmas party scheduled for December 20th. Please contact Sister Anderson if you can help with decorations, food, or activities.', audience: 'ward' },
        { id: 'a3', title: 'Young Women Fundraiser', content: 'The Young Women will be selling homemade baked goods after church to raise funds for girls camp next summer. Please support them by purchasing cookies, brownies, and other delicious treats.', audience: 'ward' },
        { id: 'a4', title: 'Missionary Farewell', content: 'Elder Jackson will be speaking in sacrament meeting next Sunday before leaving for the Argentina Buenos Aires South Mission. A light lunch will be provided in the cultural hall following the meeting.', audience: 'ward' },
        { id: 'a5', title: 'Primary Program Practice', content: 'All primary children are asked to attend a special practice session this Saturday at 10am in the chapel. Parents are encouraged to help their children memorize their speaking parts.', audience: 'ward' },
        { id: 'a6', title: 'Ward Emergency Preparedness', content: 'Brother Wilson will be conducting a workshop on emergency preparedness this Thursday at 7pm in the Relief Society room. Topics will include food storage, 72-hour kits, and family emergency plans.', audience: 'ward' },
        { id: 'a7', title: 'Tithing Settlement Appointments', content: 'Tithing settlement will be held during the first two weeks of December. Please sign up for a convenient time on the sheet in the foyer. Bishop Perkins looks forward to meeting with each family.', audience: 'ward' },
        { id: 'a8', title: 'Family History Center Open House', content: 'The stake family history center will host an open house next Wednesday from 6-9pm. Consultants will be available to help you get started with your family history research or break through brick walls.', audience: 'ward' },
        { id: 'a9', title: 'Relief Society Service Project', content: 'The Relief Society is organizing a service project to make blankets for the local homeless shelter. We will meet this Tuesday at 6:30pm in the cultural hall. Please bring fleece fabric if you have any to donate.', audience: 'ward' },
        { id: 'a10', title: 'Youth Activity Next Week', content: 'All youth are invited to a special activity next Friday evening from 7-9pm. We will be having a game night with pizza and refreshments. Please RSVP to Brother Thompson by Wednesday.', audience: 'ward' },
        { id: 'a11', title: 'Ward Choir Performance', content: 'The ward choir will be performing a special musical number in sacrament meeting on the first Sunday of December. New members are welcome to join. Practices are held each Sunday at 9:00am in the choir room.', audience: 'ward' },
        { id: 'a12', title: 'Book Club Meeting', content: 'The ward book club will meet this Thursday evening at 7pm at Sister Johnson\'s home. We will be discussing "The Work and the Glory" by Gerald Lund. Light refreshments will be served.', audience: 'ward' }
      ],
      wardLeadership: [{ title: 'Bishop', name: 'Mark Perkins', phone: '555-0101' }],
      showQRCodeOnPrint: true
    }
  }
];

const FONT_MODES = [
  { scale: 1, name: 'normal' },
  { scale: 1.25, name: 'extralarge' }
];

async function main() {
  console.log('Rendering AFTER (feature branch)...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('#form-ward-name', { timeout: 15000 });
  
  for (const fixture of FIXTURES) {
    console.log(`\n${fixture.name}:`);
    
    for (const fontMode of FONT_MODES) {
      console.log(`  ${fontMode.name} (${fontMode.scale * 100}%)...`);
      
      const testData = { ...fixture.data, printFontScale: fontMode.scale };
      
      await page.evaluate((data) => {
        window.localStorage.setItem('draft_bulletin', JSON.stringify({ data, savedAt: Date.now(), bulletinId: null }));
      }, testData);
      
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForSelector('#form-ward-name', { timeout: 15000 });
      await page.waitForTimeout(3000);
      
      const printPages = await page.locator('.print-source-portal .print-page').all();
      for (let i = 0; i < printPages.length; i++) {
        const path = join(ARTIFACTS_DIR, `after_${fixture.name}_${fontMode.name}_page${i + 1}.png`);
        await printPages[i].screenshot({ path, type: 'png' });
      }
      
      const pdfPath = join(ARTIFACTS_DIR, `after_${fixture.name}_${fontMode.name}.pdf`);
      await page.pdf({
        path: pdfPath,
        format: 'Letter',
        landscape: true,
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
      });
      
      console.log(`    ✓ Screenshots and PDF saved`);
    }
  }
  
  await browser.close();
  console.log('\n✓ Done!');
}

main().catch(console.error);
