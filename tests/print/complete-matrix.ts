/**
 * Print regression matrix: Playwright PDF + pdfplumber + ImageMagick QR.
 */
import { chromium, type Browser } from 'playwright';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { createRequire } from 'module';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(here, 'package.json'));
const { PNG } = require('pngjs') as typeof import('pngjs');
const jsQR = require('jsqr') as typeof import('jsqr');

const FIXTURES = ['typical', 'special-musical-number', 'many-announcements', 'long-names'];

interface CheckResult {
  pass: boolean;
  value: string;
  pngPath?: string;
}

interface TestResult {
  branch: string;
  fixture: string;
  mode: string;
  scale: number;
  checks: Record<string, CheckResult>;
}

interface PdfAnalysis {
  pages: number;
  word_count: number;
  margin_in: number | null;
  margin_pass: boolean;
  body_pt: number;
  heading_pt: number;
  body_median_pt: number;
  heading_median_pt: number;
  max_pt: number;
  clipping: boolean;
  overlap_count: number;
  overlap_samples: Array<{ a: string; b: string; page: number }>;
  fold_cross_count: number;
  fold_samples: Array<{ text: string; page: number }>;
}

function parseScales(): { scale: number; label: string }[] {
  const raw = process.env.FONT_SCALES || '1,1.15,1.25';
  const nums = raw.split(',').map((s) => parseFloat(s.trim())).filter((n) => n > 0);
  const labels = ['Normal', 'Large', 'Extra Large'];
  return nums.slice(0, 3).map((scale, i) => ({ scale, label: labels[i] || `Scale${scale}` }));
}

function slug(value: string): string {
  return value.replace(/[\/\s]+/g, '-');
}

async function analyzePdf(pdfPath: string): Promise<PdfAnalysis> {
  const { stdout } = await execFileAsync('python3', [path.join(here, 'analyze_pdf.py'), pdfPath], {
    maxBuffer: 2 * 1024 * 1024,
  });
  return JSON.parse(stdout) as PdfAnalysis;
}

async function degradeWithImageMagick(inputPath: string, outputPath: string): Promise<void> {
  await execFileAsync('convert', [
    inputPath,
    '-colorspace', 'Gray',
    '-blur', '0x0.8',
    '-level', '10%,90%',
    '-rotate', '1.5',
    '-resample', '150',
    outputPath,
  ]);
}

function decodeQr(pngPath: string) {
  if (!fs.existsSync(pngPath)) return null;
  const png = PNG.sync.read(fs.readFileSync(pngPath));
  return jsQR(png.data, png.width, png.height);
}

function cropQr(pagePath: string, qr: NonNullable<ReturnType<typeof jsQR>>, destPath: string) {
  const png = PNG.sync.read(fs.readFileSync(pagePath));
  const xs = [
    qr.location.topLeftCorner.x,
    qr.location.topRightCorner.x,
    qr.location.bottomLeftCorner.x,
    qr.location.bottomRightCorner.x,
  ];
  const ys = [
    qr.location.topLeftCorner.y,
    qr.location.topRightCorner.y,
    qr.location.bottomLeftCorner.y,
    qr.location.bottomRightCorner.y,
  ];
  const pad = 16;
  const left = Math.max(0, Math.floor(Math.min(...xs) - pad));
  const top = Math.max(0, Math.floor(Math.min(...ys) - pad));
  const right = Math.min(png.width, Math.ceil(Math.max(...xs) + pad));
  const bottom = Math.min(png.height, Math.ceil(Math.max(...ys) + pad));
  const width = Math.max(1, right - left);
  const height = Math.max(1, bottom - top);
  const out = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const src = ((top + y) * png.width + (left + x)) * 4;
      const dst = (y * width + x) * 4;
      out.data[dst] = png.data[src];
      out.data[dst + 1] = png.data[src + 1];
      out.data[dst + 2] = png.data[src + 2];
      out.data[dst + 3] = png.data[src + 3];
    }
  }
  fs.writeFileSync(destPath, PNG.sync.write(out));
  return { left, top, right, bottom, pageWidth: png.width, pageHeight: png.height };
}

async function checkQrPages(outputDir: string, pageFiles: string[]): Promise<{
  clean: CheckResult;
  degraded: CheckResult;
  inside: CheckResult;
}> {
  let found: ReturnType<typeof decodeQr> = null;
  let foundPage = '';
  for (const file of pageFiles) {
    const full = path.join(outputDir, file);
    const qr = decodeQr(full);
    if (qr) {
      found = qr;
      foundPage = full;
      break;
    }
  }

  if (!found || !foundPage) {
    return {
      clean: { pass: false, value: 'None' },
      degraded: { pass: false, value: 'N/A' },
      inside: { pass: false, value: 'N/A' },
    };
  }

  const cropPath = path.join(outputDir, 'qr-crop.png');
  const box = cropQr(foundPage, found, cropPath);
  const marginPx = 0.25 * 150;
  const inside =
    box.left >= marginPx - 2 &&
    box.top >= marginPx - 2 &&
    box.right <= box.pageWidth - marginPx + 2 &&
    box.bottom <= box.pageHeight - marginPx + 2;

  const degradedPath = path.join(outputDir, 'qr-degraded.png');
  let degradedOk = false;
  try {
    await degradeWithImageMagick(cropPath, degradedPath);
    const fromJs = decodeQr(degradedPath);
    if (fromJs) {
      degradedOk = true;
    } else {
      try {
        const { stdout } = await execFileAsync('zbarimg', ['-q', '--raw', degradedPath]);
        degradedOk = stdout.trim().length > 0;
      } catch {
        degradedOk = false;
      }
    }
  } catch (err) {
    return {
      clean: { pass: true, value: 'Found' },
      degraded: { pass: false, value: `Error` },
      inside: { pass: inside, value: inside ? 'Inside' : 'Outside' },
    };
  }

  return {
    clean: { pass: true, value: 'Found' },
    degraded: { pass: degradedOk, value: degradedOk ? 'Pass' : 'Fail', pngPath: degradedOk ? undefined : degradedPath },
    inside: { pass: inside, value: inside ? 'Inside' : 'Outside' },
  };
}

async function runCase(
  browser: Browser,
  branch: string,
  fixture: string,
  mode: { scale: number; label: string },
  port: number,
  outputBase: string
): Promise<TestResult> {
  const testId = `${slug(branch)}_${fixture}_${slug(mode.label)}`;
  const outputDir = path.join(outputBase, testId);
  fs.mkdirSync(outputDir, { recursive: true });

  const result: TestResult = {
    branch,
    fixture,
    mode: mode.label,
    scale: mode.scale,
    checks: {},
  };

  const page = await browser.newPage();
  const logs: string[] = [];
  page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`));

  try {
    const url = `http://127.0.0.1:${port}/print-test.html?fixture=${fixture}&fontScale=${mode.scale}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    try {
      await page.waitForFunction(() => (window as any).__PRINT_READY__ === true, { timeout: 20000 });
    } catch {
      logs.push('__PRINT_READY__ timeout');
    }

    const appliedScale = await page.evaluate(() => {
      const data = (window as any).__BULLETIN_DATA__;
      return data?.printFontScale ?? null;
    });
    if (appliedScale !== mode.scale) {
      logs.push(`printFontScale mismatch: applied=${appliedScale} expected=${mode.scale}`);
    }

    await page.emulateMedia({ media: 'print' });
    const pdf = await page.pdf({
      width: '11in',
      height: '8.5in',
      landscape: false,
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    const pdfPath = path.join(outputDir, 'output.pdf');
    fs.writeFileSync(pdfPath, pdf);

    await execFileAsync('pdftoppm', ['-r', '150', '-png', pdfPath, path.join(outputDir, 'page')]);
    const pageFiles = fs.readdirSync(outputDir).filter((f) => /^page-\d+\.png$/.test(f)).sort();

    const analysis = await analyzePdf(pdfPath);
    fs.writeFileSync(path.join(outputDir, 'analysis.json'), JSON.stringify(analysis, null, 2));

    result.checks.margin = {
      pass: analysis.margin_pass,
      value: analysis.margin_in == null ? 'N/A' : `${analysis.margin_in.toFixed(2)}in`,
      pngPath: analysis.margin_pass ? undefined : path.join(outputDir, pageFiles[0] || ''),
    };

    const qr = await checkQrPages(outputDir, pageFiles);
    result.checks.qr_clean = qr.clean;
    result.checks.qr_degraded = qr.degraded;
    result.checks.qr_margin = qr.inside;

    result.checks.body_pt = {
      pass: analysis.body_median_pt > 0,
      value: analysis.body_median_pt > 0 ? `${analysis.body_median_pt.toFixed(1)}pt` : 'N/A',
    };
    result.checks.heading_pt = {
      pass: analysis.heading_pt > 0,
      value: analysis.heading_pt > 0 ? `${analysis.heading_pt.toFixed(1)}pt` : 'N/A',
    };
    result.checks.clipping = {
      pass: !analysis.clipping,
      value: analysis.clipping ? 'Yes' : 'None',
    };
    result.checks.pages = {
      pass: analysis.pages > 0,
      value: String(analysis.pages || pageFiles.length),
    };
    result.checks.overlap = {
      pass: analysis.overlap_count === 0,
      value: analysis.overlap_count === 0 ? 'None' : `${analysis.overlap_count} overlaps`,
    };
    result.checks.fold = {
      pass: analysis.fold_cross_count === 0,
      value: analysis.fold_cross_count === 0 ? 'None' : `${analysis.fold_cross_count} words`,
    };

    if (analysis.word_count < 10) {
      result.checks.error = { pass: false, value: `Sparse PDF (${analysis.word_count} words)` };
    }
  } catch (error) {
    result.checks.error = { pass: false, value: String(error).slice(0, 180) };
  } finally {
    if (logs.length) {
      fs.writeFileSync(path.join(outputDir, 'browser.log'), logs.join('\n'));
    }
    await page.close();
  }

  return result;
}

function addModeScaleChecks(results: TestResult[]) {
  const groups = new Map<string, TestResult[]>();
  for (const result of results) {
    const key = `${result.branch}::${result.fixture}`;
    const list = groups.get(key) || [];
    list.push(result);
    groups.set(key, list);
  }
  for (const group of groups.values()) {
    const normal = group.find((r) => r.mode === 'Normal');
    const extra = group.find((r) => r.mode === 'Extra Large');
    if (!normal || !extra) continue;
    const normalBody = parseFloat(normal.checks.body_pt?.value || '0');
    const extraBody = parseFloat(extra.checks.body_pt?.value || '0');
    const ratio = normalBody > 0 ? extraBody / normalBody : 0;
    extra.checks.mode_scale = {
      pass: extraBody > 0 && ratio >= 1.15,
      value: normalBody > 0 ? `${ratio.toFixed(2)}×` : 'N/A',
    };
  }
}

async function main() {
  const port = parseInt(process.env.PORT || '5180', 10);
  const branch = process.env.BRANCH || 'unknown';
  const outputBase = process.env.OUTPUT_DIR || path.join(here, 'results');
  const modes = parseScales();
  const only = process.env.ONLY_FIXTURES?.split(',').filter(Boolean);

  console.log(`Testing ${branch} on port ${port} scales=${modes.map((m) => m.scale).join(',')}`);
  const browser = await chromium.launch();
  const allResults: TestResult[] = [];

  try {
    for (const fixture of FIXTURES) {
      if (only && !only.includes(fixture)) continue;
      for (const mode of modes) {
        process.stdout.write(`  ${fixture} / ${mode.label}... `);
        const result = await runCase(browser, branch, fixture, mode, port, outputBase);
        allResults.push(result);
        const passed = Object.values(result.checks).filter((c) => c.pass).length;
        const total = Object.values(result.checks).length;
        const err = result.checks.error?.value;
        console.log(`${passed}/${total}${err ? ` (${err})` : ''}`);
      }
    }
  } finally {
    await browser.close();
  }

  addModeScaleChecks(allResults);
  const resultsFile = path.join(outputBase, `${slug(branch)}-results.json`);
  fs.writeFileSync(resultsFile, JSON.stringify(allResults, null, 2));
  console.log(`Results saved to ${resultsFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
