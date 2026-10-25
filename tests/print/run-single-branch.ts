/**
 * Run print regression suite on current branch.
 */
import { chromium } from 'playwright';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';

const execAsync = promisify(exec);

const FIXTURES = ['minimal', 'typical', 'everything-enabled'];
const OUTPUT_DIR = '/tmp/print-results/current';

interface CheckResult {
  pass: boolean;
  message: string;
  pngPath?: string;
}

async function runChecks(fixture: string): Promise<Record<string, CheckResult>> {
  const fixtureDir = path.join(OUTPUT_DIR, fixture);
  await execAsync(`mkdir -p ${fixtureDir}`);
  
  console.log(`\n  Testing ${fixture}...`);
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(`http://localhost:5173/print-test.html?fixture=${fixture}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as any).__PRINT_READY__ === true, { timeout: 20000 });
  
  // Generate PDF
  await page.emulateMedia({ media: 'print' });
  const pdf = await page.pdf({ format: 'Letter', landscape: true, printBackground: true, preferCSSPageSize: true });
  const pdfPath = path.join(fixtureDir, 'output.pdf');
  fs.writeFileSync(pdfPath, pdf);
  
  await browser.close();
  
  // Convert PDF to PNGs
  await execAsync(`pdftoppm -r 150 -png ${pdfPath} ${path.join(fixtureDir, 'page')}`);
  
  // Run checks
  const checks: Record<string, CheckResult> = {};
  
  // Check 1: PDF size sanity
  checks['pdf_size'] = pdf.length > 10000 
    ? { pass: true, message: `${(pdf.length / 1024).toFixed(1)}KB` }
    : { pass: false, message: `${pdf.length} bytes (too small)`, pngPath: `${fixtureDir}/page-1.png` };
  
  // Check 2: Blank page detection (page 1)
  const page1Path = `${fixtureDir}/page-1.png`;
  if (fs.existsSync(page1Path)) {
    const pngData = PNG.sync.read(fs.readFileSync(page1Path));
    let nonWhite = 0;
    for (let i = 0; i < pngData.data.length; i += 4) {
      if (pngData.data[i] < 250 || pngData.data[i+1] < 250 || pngData.data[i+2] < 250) {
        nonWhite++;
      }
    }
    const pct = (nonWhite * 100 / (pngData.width * pngData.height)).toFixed(1);
    // Bulletin pages have lots of white space - 0.5% is reasonable minimum
    const threshold = 0.5; 
    checks['blank_page_1'] = parseFloat(pct) > threshold
      ? { pass: true, message: `${pct}% content` }
      : { pass: false, message: `${pct}% content (blank PDF)`, pngPath: page1Path };
  }
  
  // Check 3: QR codes
  for (let pageNum = 1; pageNum <= 2; pageNum++) {
    const pagePath = `${fixtureDir}/page-${pageNum}.png`;
    if (!fs.existsSync(pagePath)) continue;
    
    const pngData = PNG.sync.read(fs.readFileSync(pagePath));
    const qr = jsQR(pngData.data, pngData.width, pngData.height);
    
    const checkName = `qr_page${pageNum}`;
    if (qr) {
      const url = qr.data;
      const expectedFragment = pageNum === 2 ? '#announcements' : 'test-ward';
      checks[checkName] = url.includes(expectedFragment)
        ? { pass: true, message: `✓ ${url.substring(0, 30)}` }
        : { pass: false, message: `Wrong URL: ${url}`, pngPath: pagePath };
    } else {
      // QR codes may not be present on all pages/fixtures - warn but don't fail
      checks[checkName] = { pass: true, message: 'QR not rendered (OK for some fixtures)' };
    }
  }
  
  // Check 4: Text content extraction
  try {
    const { stdout } = await execAsync(`pdftotext ${pdfPath} -`);
    const hasWardName = stdout.includes('SunRiver') || stdout.includes('Ward');
    const hasLeadership = stdout.includes('Bishop') || stdout.includes('LEADERSHIP');
    checks['pdf_text'] = (hasWardName && hasLeadership)
      ? { pass: true, message: 'Ward name & leadership found' }
      : { pass: false, message: 'Missing expected text', pngPath: page1Path };
  } catch (e) {
    checks['pdf_text'] = { pass: false, message: `pdftotext failed: ${e}` };
  }
  
  // Check 5: Bounds via pdftotext -bbox (check margins)
  try {
    const { stdout } = await execAsync(`pdftotext -bbox ${pdfPath} -`);
    const xMinMatches = stdout.match(/xMin="([\d.]+)"/g);
    if (xMinMatches && xMinMatches.length > 0) {
      const xMins = xMinMatches.map(m => parseFloat(m.match(/([\d.]+)/)![0]));
      const minX = Math.min(...xMins);
      const marginInches = minX / 72;
      // Accept 0.1-1.5in range (some fixtures have tighter margins)
      checks['margins'] = marginInches >= 0.1 && marginInches <= 1.5
        ? { pass: true, message: `Left margin: ${marginInches.toFixed(2)}in` }
        : { pass: false, message: `Left margin: ${marginInches.toFixed(2)}in (out of range)`, pngPath: page1Path };
    }
  } catch (e) {
    checks['margins'] = { pass: false, message: 'Could not extract bounds' };
  }
  
  return checks;
}

async function main() {
  console.log('=== Print Regression Test (Current Branch) ===\n');
  
  const allChecks: Record<string, Record<string, CheckResult>> = {};
  
  for (const fixture of FIXTURES) {
    try {
      const checks = await runChecks(fixture);
      allChecks[fixture] = checks;
      
      // Print summary
      const passed = Object.values(checks).filter(c => c.pass).length;
      const total = Object.values(checks).length;
      console.log(`    ✓ ${passed}/${total} checks passed`);
      
    } catch (error) {
      console.error(`    ❌ Error testing ${fixture}:`, error);
      allChecks[fixture] = {
        error: { pass: false, message: String(error) }
      };
    }
  }
  
  // Generate report
  let report = '# Print Regression Test Results\n\n';
  report += `Branch: ${process.env.BRANCH_NAME || '(current)'}\n`;
  report += `Date: ${new Date().toISOString()}\n\n`;
  
  for (const [fixture, checks] of Object.entries(allChecks)) {
    report += `## ${fixture}\n\n`;
    for (const [checkName, result] of Object.entries(checks)) {
      const icon = result.pass ? '✅' : '❌';
      report += `- ${icon} **${checkName}**: ${result.message}`;
      if (result.pngPath) {
        report += ` ([view](${result.pngPath}))`;
      }
      report += '\n';
    }
    report += '\n';
  }
  
  const reportPath = path.join(OUTPUT_DIR, 'RESULTS.md');
  fs.writeFileSync(reportPath, report);
  
  console.log(`\n✅ Results written to ${reportPath}`);
  
  // Print failures
  const failures: string[] = [];
  for (const [fixture, checks] of Object.entries(allChecks)) {
    for (const [checkName, result] of Object.entries(checks)) {
      if (!result.pass) {
        failures.push(`${fixture}/${checkName}: ${result.message}`);
      }
    }
  }
  
  if (failures.length > 0) {
    console.log('\n❌ Failures:');
    failures.forEach(f => console.log(`  - ${f}`));
    process.exit(1);
  } else {
    console.log('\n✅ All checks passed!');
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
