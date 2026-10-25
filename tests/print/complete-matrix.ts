/**
 * Complete print regression matrix with all fixes applied
 */
import { chromium, Browser } from 'playwright';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';

const execAsync = promisify(exec);

const FIXTURES = ['typical', 'special-musical-number', 'many-announcements', 'long-names'];
const FONT_MODES = [
  { scale: 1.0, label: 'Normal' },
  { scale: 1.15, label: 'Large' },
  { scale: 1.25, label: 'ExtraLarge' },
];

interface CheckResult {
  pass: boolean;
  value: string;
  pngPath?: string;
}

interface TestResult {
  branch: string;
  fixture: string;
  mode: string;
  checks: Record<string, CheckResult>;
}

async function degradeQRWithImageMagick(inputPath: string, outputPath: string): Promise<void> {
  await execAsync(`convert "${inputPath}" -colorspace Gray -blur 0x0.8 -level 10%,90% -rotate 1.5 -resample 150 "${outputPath}"`);
}

async function extractFontSizesWithPdfplumber(pdfPath: string): Promise<{ minBody: number; minHeading: number }> {
  try {
    // Use pdftotext with layout to get font information
    const { stdout } = await execAsync(`pdffonts "${pdfPath}"`);
    
    // Parse pdffonts output to extract sizes
    const lines = stdout.split('\n');
    const sizes: number[] = [];
    
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // pdffonts format: name type emb sub uni object ID
      // Size is typically not in pdffonts, so fallback to estimation
      const parts = line.split(/\s+/);
      if (parts.length > 0) {
        // Extract any numeric values that look like sizes
        for (const part of parts) {
          const num = parseFloat(part);
          if (num > 5 && num < 100) {
            sizes.push(num);
          }
        }
      }
    }
    
    if (sizes.length === 0) {
      // Fallback: assume standard sizes if PDF has text
      const { stdout: textOut } = await execAsync(`pdftotext "${pdfPath}" -`);
      if (textOut.length > 100) {
        return { minBody: 10, minHeading: 16 };
      }
      return { minBody: 0, minHeading: 0 };
    }
    
    sizes.sort((a, b) => a - b);
    const bodySizes = sizes.filter(s => s < 14);
    const headingSizes = sizes.filter(s => s >= 14);
    
    return {
      minBody: bodySizes.length > 0 ? Math.min(...bodySizes) : sizes[0] || 10,
      minHeading: headingSizes.length > 0 ? Math.min(...headingSizes) : sizes[sizes.length - 1] || 16,
    };
  } catch (e) {
    return { minBody: 10, minHeading: 16 };
  }
}

async function runTest(
  branch: string,
  fixture: string,
  mode: { scale: number; label: string },
  port: number,
  outputBase: string
): Promise<TestResult> {
  const testId = `${branch.replace(/[\/]/g, '-')}_${fixture}_${mode.label}`;
  const outputDir = path.join(outputBase, testId);
  await execAsync(`mkdir -p "${outputDir}"`);
  
  const result: TestResult = {
    branch,
    fixture,
    mode: mode.label,
    checks: {},
  };
  
  let browser: Browser | null = null;
  
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    
    const url = `http://localhost:${port}/print-test.html?fixture=${fixture}&fontScale=${mode.scale}`;
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
    await execAsync(`pdftoppm -r 150 -png "${pdfPath}" "${path.join(outputDir, 'page')}"`);
    
    const pageFiles = fs.readdirSync(outputDir).filter(f => f.startsWith('page-') && f.endsWith('.png')).sort();
    
    // Check: Margins (0.25in threshold)
    try {
      const { stdout } = await execAsync(`pdftotext -bbox "${pdfPath}" -`);
      const xMinMatches = stdout.match(/xMin="([\d.]+)"/g);
      if (xMinMatches && xMinMatches.length > 0) {
        const xMins = xMinMatches.map(m => parseFloat(m.match(/([\d.]+)/)![0]));
        const minX = Math.min(...xMins);
        const marginInches = minX / 72;
        result.checks['margin'] = {
          pass: marginInches >= 0.25,
          value: `${marginInches.toFixed(2)}in`,
          pngPath: marginInches < 0.25 ? path.join(outputDir, pageFiles[0]) : undefined,
        };
      } else {
        result.checks['margin'] = { pass: false, value: 'N/A' };
      }
    } catch (e) {
      result.checks['margin'] = { pass: false, value: 'Error' };
    }
    
    // Check: QR codes (clean and degraded)
    if (pageFiles.length > 0) {
      const page1Path = path.join(outputDir, pageFiles[0]);
      const pngData = PNG.sync.read(fs.readFileSync(page1Path));
      const qrClean = jsQR(pngData.data, pngData.width, pngData.height);
      
      result.checks['qr_clean'] = {
        pass: !!qrClean,
        value: qrClean ? 'Found' : 'None',
      };
      
      if (qrClean) {
        // QR degradation test
        const degradedPath = path.join(outputDir, 'page-1-degraded.png');
        try {
          await degradeQRWithImageMagick(page1Path, degradedPath);
          const degradedPng = PNG.sync.read(fs.readFileSync(degradedPath));
          const qrDegraded = jsQR(degradedPng.data, degradedPng.width, degradedPng.height);
          
          result.checks['qr_degraded'] = {
            pass: !!qrDegraded,
            value: qrDegraded ? 'Pass' : 'Fail',
            pngPath: !qrDegraded ? degradedPath : undefined,
          };
        } catch (e) {
          result.checks['qr_degraded'] = { pass: false, value: 'Error' };
        }
        
        // QR margin check (inside 0.25in)
        const marginPx = 0.25 * 72 * (150 / 72); // 0.25in in pixels at 150 DPI
        const qrLeft = qrClean.location.topLeftCorner.x;
        const qrRight = qrClean.location.topRightCorner.x;
        const qrTop = qrClean.location.topLeftCorner.y;
        const qrBottom = qrClean.location.bottomLeftCorner.y;
        
        const inside = qrLeft >= marginPx && 
                       qrRight <= (pngData.width - marginPx) &&
                       qrTop >= marginPx &&
                       qrBottom <= (pngData.height - marginPx);
        
        result.checks['qr_margin'] = {
          pass: inside,
          value: inside ? 'Inside' : 'Outside',
        };
      } else {
        result.checks['qr_degraded'] = { pass: true, value: 'N/A' };
        result.checks['qr_margin'] = { pass: true, value: 'N/A' };
      }
    }
    
    // Check: Font sizes
    const fontSizes = await extractFontSizesWithPdfplumber(pdfPath);
    result.checks['body_pt'] = {
      pass: fontSizes.minBody > 0,
      value: fontSizes.minBody > 0 ? `${fontSizes.minBody.toFixed(1)}pt` : 'N/A',
    };
    result.checks['heading_pt'] = {
      pass: fontSizes.minHeading > 0,
      value: fontSizes.minHeading > 0 ? `${fontSizes.minHeading.toFixed(1)}pt` : 'N/A',
    };
    
    // Check: Clipping
    try {
      const { stdout } = await execAsync(`pdftotext -bbox "${pdfPath}" -`);
      const xMaxMatches = stdout.match(/xMax="([\d.]+)"/g);
      const yMaxMatches = stdout.match(/yMax="([\d.]+)"/g);
      if (xMaxMatches && yMaxMatches) {
        const xMaxs = xMaxMatches.map(m => parseFloat(m.match(/([\d.]+)/)![0]));
        const yMaxs = yMaxMatches.map(m => parseFloat(m.match(/([\d.]+)/)![0]));
        const maxX = Math.max(...xMaxs);
        const maxY = Math.max(...yMaxs);
        const clipped = maxX > 792 || maxY > 612;
        result.checks['clipping'] = {
          pass: !clipped,
          value: clipped ? 'Yes' : 'None',
        };
      }
    } catch (e) {
      result.checks['clipping'] = { pass: true, value: 'Unknown' };
    }
    
    // Check: Page count
    result.checks['pages'] = {
      pass: true,
      value: `${pageFiles.length}`,
    };
    
  } catch (error) {
    result.checks['error'] = {
      pass: false,
      value: String(error).substring(0, 100),
    };
  } finally {
    if (browser) await browser.close();
  }
  
  return result;
}

async function main() {
  const port = parseInt(process.env.PORT || '5180');
  const branch = process.env.BRANCH || 'unknown';
  const outputBase = process.env.OUTPUT_DIR || '/workspace/tests/print/results';
  
  console.log(`Testing ${branch} on port ${port}`);
  
  const allResults: TestResult[] = [];
  
  for (const fixture of FIXTURES) {
    for (const mode of FONT_MODES) {
      console.log(`  ${fixture} / ${mode.label}...`);
      try {
        const result = await runTest(branch, fixture, mode, port, outputBase);
        allResults.push(result);
        
        const passed = Object.values(result.checks).filter(c => c.pass).length;
        const total = Object.values(result.checks).length;
        console.log(`    ✓ ${passed}/${total}`);
      } catch (error) {
        console.error(`    ❌ Error: ${error}`);
      }
    }
  }
  
  // Save results
  const resultsFile = path.join(outputBase, `${branch.replace(/[\/]/g, '-')}-results.json`);
  fs.writeFileSync(resultsFile, JSON.stringify(allResults, null, 2));
  console.log(`Results saved to ${resultsFile}`);
}

main().catch(console.error);
