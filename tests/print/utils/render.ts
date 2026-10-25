import { chromium, firefox, webkit, Browser, Page } from '@playwright/test';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { BulletinData } from '../../../src/types/bulletin';

export type BrowserType = 'chromium' | 'firefox' | 'webkit';
export type PageSize = 'letter' | 'a4';

export interface RenderOptions {
  browser: BrowserType;
  pageSize: PageSize;
  fixture: string;
  outputDir: string;
}

export interface PageDimensions {
  width: number;
  height: number;
}

const PAGE_SIZES: Record<PageSize, PageDimensions> = {
  letter: { width: 11, height: 8.5 }, // inches, landscape
  a4: { width: 11.7, height: 8.3 }, // inches, landscape (A4 is 297mm x 210mm)
};

export interface RenderResult {
  pngPath: string;
  pdfPath?: string;
  bulletinData: BulletinData;
  dimensions: PageDimensions;
}

export async function renderFixture(options: RenderOptions): Promise<RenderResult[]> {
  const { browser: browserType, pageSize, fixture, outputDir } = options;
  
  let browser: Browser;
  switch (browserType) {
    case 'chromium':
      browser = await chromium.launch({ headless: true });
      break;
    case 'firefox':
      browser = await firefox.launch({ headless: true });
      break;
    case 'webkit':
      browser = await webkit.launch({ headless: true });
      break;
  }

  try {
    const page = await browser.newPage();
    
    // Load fixture data
    const fixtureData: BulletinData = JSON.parse(
      readFileSync(join(process.cwd(), 'fixtures', `${fixture}.json`), 'utf-8')
    );

    // Create HTML with the bulletin component
    const html = generateBulletinHTML(fixtureData);
    
    // Set viewport to landscape page size
    const dims = PAGE_SIZES[pageSize];
    await page.setViewportSize({
      width: Math.round(dims.width * 96), // Convert inches to pixels at 96 DPI
      height: Math.round(dims.height * 96),
    });

    // Load the HTML
    await page.setContent(html, { waitUntil: 'networkidle' });
    
    // Emulate print media
    await page.emulateMedia({ media: 'print' });
    
    // Wait for any dynamic content to render
    await page.waitForTimeout(1000);

    const results: RenderResult[] = [];
    
    // Screenshot each page
    const pages = await page.locator('.print-page').all();
    for (let i = 0; i < pages.length; i++) {
      const pageElement = pages[i];
      const pngPath = join(outputDir, `${fixture}-${browserType}-${pageSize}-page${i + 1}.png`);
      
      await pageElement.screenshot({ path: pngPath });
      
      results.push({
        pngPath,
        bulletinData: fixtureData,
        dimensions: dims,
      });
    }

    // Generate PDF for Chromium
    if (browserType === 'chromium') {
      const pdfPath = join(outputDir, `${fixture}-${browserType}-${pageSize}.pdf`);
      await page.pdf({
        path: pdfPath,
        width: `${dims.width}in`,
        height: `${dims.height}in`,
        printBackground: true,
        preferCSSPageSize: false,
      });
      
      // Add PDF path to first result
      if (results.length > 0) {
        results[0].pdfPath = pdfPath;
      }
    }

    return results;
  } finally {
    await browser.close();
  }
}

function generateBulletinHTML(data: BulletinData): string {
  // Serialize the data as JSON to pass to the component
  const dataJson = JSON.stringify(data).replace(/</g, '\\u003c');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bulletin Print Test</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    }
    
    .print-page {
      width: 11in;
      height: 8.5in;
      page-break-after: always;
      background: white;
      position: relative;
      overflow: hidden;
    }
    
    .print-page.landscape {
      display: flex;
    }
    
    /* Basic styling to simulate the app's print layout */
    .print-page .w-1\\/2 { width: 50%; }
    .print-page .flex { display: flex; }
    .print-page .flex-col { flex-direction: column; }
    .print-page .justify-center { justify-content: center; }
    .print-page .justify-between { justify-content: space-between; }
    .print-page .items-center { align-items: center; }
    .print-page .text-center { text-align: center; }
    .print-page .text-left { text-align: left; }
    .print-page .text-right { text-align: right; }
    .print-page .font-bold { font-weight: 700; }
    .print-page .font-semibold { font-weight: 600; }
    .print-page .italic { font-style: italic; }
    .print-page .uppercase { text-transform: uppercase; }
    
    /* Font sizes scaled by printFontScale */
    .print-page { font-size: ${(data.printFontScale || 1) * 100}%; }
    .print-page .text-3xl { font-size: 1.875rem; }
    .print-page .text-2xl { font-size: 1.5rem; }
    .print-page .text-xl { font-size: 1.25rem; }
    .print-page .text-lg { font-size: 1.125rem; }
    .print-page .text-base { font-size: 1rem; }
    .print-page .text-sm { font-size: 0.875rem; }
    .print-page .text-xs { font-size: 0.75rem; }
    
    /* Spacing */
    .print-page .p-2 { padding: 0.5rem; }
    .print-page .p-3 { padding: 0.75rem; }
    .print-page .p-4 { padding: 1rem; }
    .print-page .p-6 { padding: 1.5rem; }
    .print-page .pl-2 { padding-left: 0.5rem; }
    .print-page .pl-3 { padding-left: 0.75rem; }
    .print-page .pl-4 { padding-left: 1rem; }
    .print-page .pr-2 { padding-right: 0.5rem; }
    .print-page .pr-3 { padding-right: 0.75rem; }
    .print-page .pr-6 { padding-right: 1.5rem; }
    .print-page .pr-8 { padding-right: 2rem; }
    .print-page .pr-12 { padding-right: 3rem; }
    .print-page .pt-2 { padding-top: 0.5rem; }
    .print-page .pt-3 { padding-top: 0.75rem; }
    .print-page .pb-0 { padding-bottom: 0; }
    .print-page .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .print-page .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
    .print-page .mb-1 { margin-bottom: 0.25rem; }
    .print-page .mb-2 { margin-bottom: 0.5rem; }
    .print-page .mb-4 { margin-bottom: 1rem; }
    .print-page .mb-6 { margin-bottom: 1.5rem; }
    .print-page .mt-4 { margin-top: 1rem; }
    
    /* QR Code placeholder */
    .qr-code-placeholder {
      width: 128px;
      height: 128px;
      background: #e5e7eb;
      border: 2px solid #9ca3af;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #6b7280;
      margin: 0 auto;
    }
    
    /* Announcements columns */
    .announcements-columns {
      column-count: ${data.announcements && data.announcements.length > 6 ? 2 : 1};
      column-gap: 1rem;
    }
    
    .announcement {
      break-inside: avoid;
      margin-bottom: 0.5rem;
    }
    
    .announcement-title {
      font-weight: 600;
      font-size: 0.9375rem;
      margin-bottom: 0.125rem;
    }
    
    .announcement-content {
      font-size: 0.875rem;
      line-height: 1.4;
    }
    
    /* Program table */
    .program-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 0.4em;
    }
    
    .program-table td {
      padding: 2px 0;
      font-size: 1rem;
    }
    
    @media print {
      .print-page {
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    const data = ${dataJson};
    
    // Simple rendering logic
    const root = document.getElementById('root');
    
    // Page 1: Front cover and back cover
    const page1 = document.createElement('div');
    page1.className = 'print-page landscape';
    
    // Back cover (left)
    const backCover = document.createElement('div');
    backCover.className = 'w-1/2 flex flex-col justify-between text-left p-3';
    
    if (data.wardLeadership && data.wardLeadership.length > 0) {
      const leadershipSection = document.createElement('div');
      leadershipSection.innerHTML = '<h2 class="text-lg font-bold uppercase text-center mb-2">Ward Leadership</h2>';
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.fontSize = '0.75rem';
      data.wardLeadership.forEach(leader => {
        const row = table.insertRow();
        row.innerHTML = \`
          <td class="font-bold" style="width: 45%">\${leader.title}</td>
          <td style="width: 30%">\${leader.name}</td>
          <td class="text-right" style="width: 25%">\${leader.phone || ''}</td>
        \`;
      });
      leadershipSection.appendChild(table);
      backCover.appendChild(leadershipSection);
    }
    
    if (data.showQRCodeOnPrint) {
      const qrSection = document.createElement('div');
      qrSection.className = 'flex flex-col items-center mt-4';
      qrSection.innerHTML = '<div class="qr-code-placeholder">QR Code</div><p class="text-sm mt-2">Scan to view online</p>';
      backCover.appendChild(qrSection);
    }
    
    page1.appendChild(backCover);
    
    // Front cover (right)
    const frontCover = document.createElement('div');
    frontCover.className = 'w-1/2 flex flex-col justify-center items-center text-center p-6';
    frontCover.innerHTML = \`
      <h1 class="text-3xl font-bold mb-2">\${data.wardName}</h1>
      <p class="text-lg mb-1">\${new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p class="text-base mb-1">The Church of Jesus Christ of Latter-day Saints</p>
      <p class="text-base mb-4">Sacrament Meeting</p>
      \${data.theme ? \`<p class="font-semibold italic text-sm">"\${data.theme}"</p>\` : ''}
    \`;
    
    page1.appendChild(frontCover);
    root.appendChild(page1);
    
    // Page 2: Announcements and program
    const page2 = document.createElement('div');
    page2.className = 'print-page landscape';
    
    // Announcements (left)
    const announcementsPanel = document.createElement('div');
    announcementsPanel.className = 'w-1/2 text-left p-3';
    
    if (data.announcements && data.announcements.length > 0) {
      announcementsPanel.innerHTML = '<h2 class="text-sm font-bold text-center mb-2">Announcements & Events</h2>';
      const announcementsContainer = document.createElement('div');
      announcementsContainer.className = 'announcements-columns';
      
      data.announcements.forEach(announcement => {
        const announcementDiv = document.createElement('div');
        announcementDiv.className = 'announcement';
        announcementDiv.innerHTML = \`
          <div class="announcement-title">\${announcement.title}</div>
          <div class="announcement-content">\${announcement.content}</div>
        \`;
        announcementsContainer.appendChild(announcementDiv);
      });
      
      announcementsPanel.appendChild(announcementsContainer);
    }
    
    if (data.showQRCodeOnPrint) {
      const qrSection = document.createElement('div');
      qrSection.className = 'flex items-center justify-center mt-2';
      qrSection.innerHTML = '<div class="qr-code-placeholder" style="width:56px;height:56px;font-size:8px;">QR</div><span class="text-xs ml-2 italic">Scan for full announcements</span>';
      announcementsPanel.appendChild(qrSection);
    }
    
    page2.appendChild(announcementsPanel);
    
    // Program (right)
    const programPanel = document.createElement('div');
    programPanel.className = 'w-1/2 flex flex-col justify-center items-center text-center p-6';
    
    let programHTML = \`
      <h2 class="text-3xl font-bold mb-2">\${data.wardName}</h2>
      <h3 class="text-2xl font-bold mb-1">Sacrament Meeting</h3>
      <p class="italic text-lg mb-6">\${new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <table class="program-table">
        <tbody>
          <tr><td>Presiding</td><td class="text-right">\${data.leadership.presiding}</td></tr>
          <tr><td>Conducting</td><td class="text-right">\${data.leadership.conducting || ''}</td></tr>
          <tr><td>Chorister</td><td class="text-right">\${data.leadership.chorister}</td></tr>
          <tr><td>Organist</td><td class="text-right">\${data.leadership.organist}</td></tr>
          <tr><td>Opening Hymn</td><td class="text-right">\${data.musicProgram.openingHymnNumber}</td></tr>
          <tr><td colspan="2" class="text-center italic text-sm">\${data.musicProgram.openingHymnTitle}</td></tr>
          <tr><td>Invocation</td><td class="text-right">\${data.prayers.opening}</td></tr>
    \`;
    
    if (data.agenda) {
      data.agenda.forEach(item => {
        if (item.type === 'speaker') {
          programHTML += \`<tr><td>Speaker</td><td class="text-right">\${item.name}</td></tr>\`;
        } else if (item.type === 'musical') {
          programHTML += \`<tr><td>Special Musical Number</td><td class="text-right">\${item.songName || ''}</td></tr>\`;
          if (item.performers) {
            programHTML += \`<tr><td colspan="2" class="text-center italic text-sm">\${item.performers}</td></tr>\`;
          }
        } else if (item.type === 'sacrament') {
          programHTML += \`
            <tr><td>Sacrament Hymn</td><td class="text-right">\${data.musicProgram.sacramentHymnNumber}</td></tr>
            <tr><td colspan="2" class="text-center italic text-sm">\${data.musicProgram.sacramentHymnTitle}</td></tr>
            <tr><td colspan="2" class="text-center font-bold">Administration of the Sacrament</td></tr>
          \`;
        } else if (item.type === 'baby_blessing') {
          programHTML += \`<tr><td colspan="2" class="text-center font-bold">Baby Blessing: \${item.childName || ''}</td></tr>\`;
        }
      });
    }
    
    programHTML += \`
          <tr><td>Closing Hymn</td><td class="text-right">\${data.musicProgram.closingHymnNumber}</td></tr>
          <tr><td colspan="2" class="text-center italic text-sm">\${data.musicProgram.closingHymnTitle}</td></tr>
          <tr><td>Benediction</td><td class="text-right">\${data.prayers.closing}</td></tr>
        </tbody>
      </table>
    \`;
    
    programPanel.innerHTML = programHTML;
    page2.appendChild(programPanel);
    root.appendChild(page2);
  </script>
</body>
</html>
  `.trim();
}
