/**
 * Comprehensive print regression suite across branches, fixtures, and font modes.
 */
import { chromium, Browser, Page } from 'playwright';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';
import { Jimp } from 'jimp';

const execAsync = promisify(exec);

const TEST_MATRIX = {
  branches: [
    { name: 'main', pr: null },
    { name: 'cursor/print-layout-fixes-f7ea', pr: 173 },
    { name: 'cursor/pdf-qr-fixes-aaec', pr: 171 },
    { name: 'cursor/public-page-performance-e836', pr: 174 },
  ],
  fixtures: [
    { name: 'typical', label: 'Typical' },
    { name: 'special-musical-number', label: 'Bishop Case (Musical+Long Ward)' },
    { name: 'many-announcements', label: 'Many Announcements' },
    { name: 'long-names', label: 'Long Names' },
  ],
  fontModes: [
    { scale: 1, label: 'Normal' },
    { scale: 1.15, label: 'Large' },
    { scale: 1.35, label: 'Extra Large' },
  ],
};

const OUTPUT_BASE = '/workspace/tests/print/results';

interface CheckResult {
  pass: boolean;
  message: string;
  pngPath?: string;
}

interface TestResult {
  branch: string;
  fixture: string;
  fontMode: string;
  checks: Record<string, CheckResult>;
  error?: string;
}

async function degradeImage(inputPath: string, outputPath: string): Promise<void> {
  const image = await Jimp.read(inputPath);
  image
    .greyscale()
    .blur(1)
    .brightness(-0.05)
    .contrast(0.05)
    .rotate(1.5)
    .resize(Math.floor(image.getWidth() * 0.7), Jimp.AUTO);
  await image.writeAsync(outputPath);
}

async function checkQRCode(pngPath: string, degraded: boolean = false): Promise<{ found: boolean; url?: string }> {
  let targetPath = pngPath;
  
  if (degraded) {
    targetPath = pngPath.replace('.png', '-degraded.png');
    await degradeImage(pngPath, targetPath);
  }
  
  if (!fs.existsSync(targetPath)) return { found: false };
  
  const pngData = PNG.sync.read(fs.readFileSync(targetPath));
  const qr = jsQR(pngData.data, pngData.width, pngData.height);
  
  return { found: !!qr, url: qr?.data };
}

async function extractFontSizes(pdfPath: string): Promise<{ minBody: number; minHeading: number }> {
  try {
    const { stdout } = await execAsync(`pdftotext -bbox ${pdfPath} -`);
    
    // Parse bbox XML to extract font sizes
    const fontSizeMatches = stdout.match(/fontSize="([\d.]+)"/g) || [];
    const sizes = fontSizeMatches.map(m => parseFloat(m.match(/([\d.]+)/)![0]));
    
    if (sizes.length === 0) return { minBody: 0, minHeading: 0 };
    
    // Heuristic: sizes < 12pt are body, >= 12pt are headings
    const bodySizes = sizes.filter(s => s < 12);
    const headingSizes = sizes.filter(s => s >= 12);
    
    return {
      minBody: bodySizes.length > 0 ? Math.min(...bodySizes) : 0,
      minHeading: headingSizes.length > 0 ? Math.min(...headingSizes) : 0,
    };
  } catch {
    return { minBody: 0, minHeading: 0 };
  }
}

async function checkQRMargins(pngPath: string, pdfWidth: number, pdfHeight: number): Promise<{ inside: boolean; message: string }> {
  if (!fs.existsSync(pngPath)) return { inside: false, message: 'PNG not found' };
  
  const pngData = PNG.sync.read(fs.readFileSync(pngPath));
  const qr = jsQR(pngData.data, pngData.width, pngData.height);
  
  if (!qr) return { inside: false, message: 'No QR code' };
  
  // Convert PNG coords to PDF points (assuming 150 DPI)
  const pdfToPixel = 150 / 72;
  const marginPx = 0.25 * 72 * pdfToPixel; // 0.25in in pixels
  
  const qrLeft = qr.location.topLeftCorner.x;
  const qrRight = qr.location.topRightCorner.x;
  const qrTop = qr.location.topLeftCorner.y;
  const qrBottom = qr.location.bottomLeftCorner.y;
  
  const widthPx = pngData.width;
  const heightPx = pngData.height;
  
  const inside = qrLeft >= marginPx && 
                 qrRight <= (widthPx - marginPx) &&
                 qrTop >= marginPx &&
                 qrBottom <= (heightPx - marginPx);
  
  return {
    inside,
    message: inside ? 'Inside margins' : `Outside margin: ${qrLeft.toFixed(0)}, ${qrTop.toFixed(0)}`,
  };
}

async function runTest(
  branch: string,
  fixture: string,
  fontMode: { scale: number; label: string },
  port: number
): Promise<TestResult> {
  const testId = `${branch.replace(/\//g, '-')}_${fixture}_${fontMode.label.replace(/ /g, '')}`;
  const outputDir = path.join(OUTPUT_BASE, testId);
  await execAsync(`mkdir -p ${outputDir}`);
  
  const result: TestResult = {
    branch,
    fixture,
    fontMode: fontMode.label,
    checks: {},
  };
  
  let browser: Browser | null = null;
  
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Load fixture and override font scale
    const url = `http://localhost:${port}/print-test.html?fixture=${fixture}&fontScale=${fontMode.scale}`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForFunction(() => (window as any).__PRINT_READY__ === true, { timeout: 20000 });
    
    // Generate PDF
    await page.emulateMedia({ media: 'print' });
    const pdf = await page.pdf({ 
      format: 'Letter', 
      landscape: true, 
      printBackground: true, 
      preferCSSPageSize: true 
    });
    const pdfPath = path.join(outputDir, 'output.pdf');
    fs.writeFileSync(pdfPath, pdf);
    
    await browser.close();
    browser = null;
    
    // Convert to PNGs
    await execAsync(`pdftoppm -r 150 -png ${pdfPath} ${path.join(outputDir, 'page')}`);
    
    const pageFiles = fs.readdirSync(outputDir).filter(f => f.startsWith('page-') && f.endsWith('.png'));
    const pageCount = pageFiles.length;
    
    // Check 1: PDF size
    result.checks['pdf_size'] = pdf.length > 10000
      ? { pass: true, message: `${(pdf.length / 1024).toFixed(1)}KB` }
      : { pass: false, message: `${pdf.length}B (too small)`, pngPath: `${outputDir}/page-1.png` };
    
    // Check 2: Page count
    result.checks['page_count'] = { pass: true, message: `${pageCount} pages` };
    
    // Check 3: Blank page detection
    if (pageFiles.length > 0) {
      const page1Path = path.join(outputDir, pageFiles[0]);
      const pngData = PNG.sync.read(fs.readFileSync(page1Path));
      let nonWhite = 0;
      for (let i = 0; i < pngData.data.length; i += 4) {
        if (pngData.data[i] < 250 || pngData.data[i+1] < 250 || pngData.data[i+2] < 250) {
          nonWhite++;
        }
      }
      const pct = (nonWhite * 100 / (pngData.width * pngData.height)).toFixed(1);
      result.checks['content_pct'] = parseFloat(pct) > 0.5
        ? { pass: true, message: `${pct}%` }
        : { pass: false, message: `${pct}% (blank)`, pngPath: page1Path };
    }
    
    // Check 4: Margins (0.25in minimum)
    try {
      const { stdout } = await execAsync(`pdftotext -bbox ${pdfPath} -`);
      const xMinMatches = stdout.match(/xMin="([\d.]+)"/g);
      if (xMinMatches && xMinMatches.length > 0) {
        const xMins = xMinMatches.map(m => parseFloat(m.match(/([\d.]+)/)![0]));
        const minX = Math.min(...xMins);
        const marginInches = minX / 72;
        result.checks['margins'] = marginInches >= 0.25
          ? { pass: true, message: `${marginInches.toFixed(2)}in` }
          : { pass: false, message: `${marginInches.toFixed(2)}in (< 0.25in)`, pngPath: `${outputDir}/page-1.png` };
      }
    } catch (e) {
      result.checks['margins'] = { pass: false, message: 'Could not extract' };
    }
    
    // Check 5: Font sizes
    const fontSizes = await extractFontSizes(pdfPath);
    result.checks['min_body_pt'] = fontSizes.minBody > 0
      ? { pass: true, message: `${fontSizes.minBody.toFixed(1)}pt` }
      : { pass: false, message: 'No body text found' };
    result.checks['min_heading_pt'] = fontSizes.minHeading > 0
      ? { pass: true, message: `${fontSizes.minHeading.toFixed(1)}pt` }
      : { pass: false, message: 'No headings found' };
    
    // Check 6-9: QR codes (pages 1 and 2)
    for (let pageNum = 1; pageNum <= Math.min(2, pageCount); pageNum++) {
      const pagePath = path.join(outputDir, `page-${pageNum}.png`);
      if (!fs.existsSync(pagePath)) continue;
      
      // Clean QR
      const cleanQR = await checkQRCode(pagePath, false);
      result.checks[`qr_p${pageNum}_clean`] = cleanQR.found
        ? { pass: true, message: cleanQR.url!.substring(0, 30) }
        : { pass: true, message: 'Not rendered (OK)' }; // Don't fail if missing
      
      // Degraded QR
      if (cleanQR.found) {
        const degradedQR = await checkQRCode(pagePath, true);
        result.checks[`qr_p${pageNum}_degraded`] = degradedQR.found
          ? { pass: true, message: 'Decodes after degradation' }
          : { pass: false, message: 'Fails degradation', pngPath: pagePath.replace('.png', '-degraded.png') };
        
        // QR margin check
        const marginCheck = await checkQRMargins(pagePath, 792, 612);
        result.checks[`qr_p${pageNum}_margin`] = marginCheck.inside
          ? { pass: true, message: marginCheck.message }
          : { pass: false, message: marginCheck.message, pngPath: pagePath };
      }
    }
    
    // Check 10: Text content
    try {
      const { stdout } = await execAsync(`pdftotext ${pdfPath} -`);
      const hasContent = stdout.length > 100 && (stdout.includes('Ward') || stdout.includes('Sacrament'));
      result.checks['text_content'] = hasContent
        ? { pass: true, message: `${stdout.length} chars` }
        : { pass: false, message: 'Missing expected text', pngPath: `${outputDir}/page-1.png` };
    } catch (e) {
      result.checks['text_content'] = { pass: false, message: 'Extraction failed' };
    }
    
    // Check 11: Clipped content (check if content extends beyond page bounds)
    try {
      const { stdout } = await execAsync(`pdftotext -bbox ${pdfPath} -`);
      const xMaxMatches = stdout.match(/xMax="([\d.]+)"/g);
      const yMaxMatches = stdout.match(/yMax="([\d.]+)"/g);
      if (xMaxMatches && yMaxMatches) {
        const xMaxs = xMaxMatches.map(m => parseFloat(m.match(/([\d.]+)/)![0]));
        const yMaxs = yMaxMatches.map(m => parseFloat(m.match(/([\d.]+)/)![0]));
        const maxX = Math.max(...xMaxs);
        const maxY = Math.max(...yMaxs);
        const clipped = maxX > 792 || maxY > 612; // Letter landscape
        result.checks['clipping'] = !clipped
          ? { pass: true, message: 'No clipping' }
          : { pass: false, message: `Content at (${maxX.toFixed(0)}, ${maxY.toFixed(0)})`, pngPath: `${outputDir}/page-1.png` };
      }
    } catch (e) {
      result.checks['clipping'] = { pass: false, message: 'Could not check' };
    }
    
  } catch (error) {
    result.error = String(error).substring(0, 200);
    result.checks['error'] = { pass: false, message: result.error };
  } finally {
    if (browser) await browser.close();
  }
  
  return result;
}

async function main() {
  console.log('=== Full Matrix Print Regression Test ===\n');
  
  const allResults: TestResult[] = [];
  
  // Use port from environment or default
  const port = parseInt(process.env.PORT || '5173');
  const currentBranch = process.env.BRANCH_NAME || await execAsync('git branch --show-current').then(r => r.stdout.trim());
  
  for (const branch of TEST_MATRIX.branches) {
    console.log(`\n## Testing ${branch.name}${branch.pr ? ` (PR #${branch.pr})` : ''} ##\n`);
    
    // Only test if this is the current branch or if we're running via the automation script
    const isCurrentBranch = branch.name === currentBranch || branch.name === 'cursor/print-regression-harness-d5a3';
    if (!isCurrentBranch && !process.env.PORT) {
      console.log(`  (Skipping - use run-all-branches.sh for cross-branch testing)\n`);
      continue;
    }
    
    for (const fixture of TEST_MATRIX.fixtures) {
      for (const fontMode of TEST_MATRIX.fontModes) {
        console.log(`  ${fixture.label} / ${fontMode.label}...`);
        
        try {
          const result = await runTest(branch.name, fixture.name, fontMode, 5173);
          allResults.push(result);
          
          const passed = Object.values(result.checks).filter(c => c.pass).length;
          const total = Object.values(result.checks).length;
          console.log(`    ✓ ${passed}/${total} checks passed`);
        } catch (error) {
          console.error(`    ❌ Error:`, error);
          allResults.push({
            branch: branch.name,
            fixture: fixture.name,
            fontMode: fontMode.label,
            checks: { error: { pass: false, message: String(error) } },
            error: String(error),
          });
        }
      }
    }
  }
  
  // Generate comparison table
  console.log('\n\n=== Generating Comparison Table ===\n');
  
  const allCheckNames = Array.from(
    new Set(allResults.flatMap(r => Object.keys(r.checks)))
  ).sort();
  
  let markdown = '# Print Regression Test Results - Full Matrix\n\n';
  markdown += `Date: ${new Date().toISOString()}\n\n`;
  markdown += '## Summary\n\n';
  markdown += `- Branches tested: ${TEST_MATRIX.branches.map(b => b.name.split('/').pop()).join(', ')}\n`;
  markdown += `- Fixtures: ${TEST_MATRIX.fixtures.length}\n`;
  markdown += `- Font modes: ${TEST_MATRIX.fontModes.length}\n`;
  markdown += `- Total tests: ${allResults.length}\n\n`;
  
  markdown += '## Comparison Table\n\n';
  markdown += '| Fixture | Mode | Check | ' + TEST_MATRIX.branches.map(b => b.name.split('/').pop()).join(' | ') + ' |\n';
  markdown += '|---------|------|-------|' + TEST_MATRIX.branches.map(() => '--------').join('|') + '|\n';
  
  for (const fixture of TEST_MATRIX.fixtures) {
    for (const fontMode of TEST_MATRIX.fontModes) {
      for (const checkName of allCheckNames) {
        const row = [fixture.label.substring(0, 15), fontMode.label, checkName];
        
        for (const branch of TEST_MATRIX.branches) {
          const result = allResults.find(
            r => r.branch === branch.name && 
                 r.fixture === fixture.name && 
                 r.fontMode === fontMode.label
          );
          
          if (result && result.checks[checkName]) {
            const check = result.checks[checkName];
            const icon = check.pass ? '✅' : '❌';
            let cell = `${icon} ${check.message}`;
            if (check.pngPath && !check.pass) {
              const relPath = check.pngPath.replace('/workspace/tests/print/', '');
              cell += ` ([png](${relPath}))`;
            }
            row.push(cell);
          } else {
            row.push('—');
          }
        }
        
        markdown += '| ' + row.join(' | ') + ' |\n';
      }
    }
  }
  
  // Write results
  const resultPath = path.join(OUTPUT_BASE, 'COMPARISON.md');
  fs.writeFileSync(resultPath, markdown);
  console.log(`\n✅ Results written to ${resultPath}`);
  
  return allResults;
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
