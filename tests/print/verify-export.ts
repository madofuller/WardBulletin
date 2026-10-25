/**
 * Confirm #171 window.print() export on the combined tree matches #173
 * one-sheet print: 11x8.5 landscape, 2 pages, vector text, QR clean+degraded.
 */
import { chromium } from 'playwright';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { createRequire } from 'module';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(here, 'package.json'));
const { PNG } = require('pngjs');
const jsQR = require('jsqr');

const port = parseInt(process.env.PORT || '5181', 10);
const outDir = process.env.OUTPUT_DIR || path.join(here, 'results/artifacts');
fs.mkdirSync(outDir, { recursive: true });

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const url = `http://127.0.0.1:${port}/print-test.html?fixture=bishops-exact-case&fontScale=1.25`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => (window as any).__PRINT_READY__ === true, { timeout: 20000 }).catch(() => {});

  const exportFn = await page.evaluate(() => {
    return typeof (window as any).print === 'function';
  });

  await page.emulateMedia({ media: 'print' });
  const pdf = await page.pdf({
    width: '11in',
    height: '8.5in',
    landscape: false,
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });
  const pdfPath = path.join(outDir, 'combined-bishops-exact-case-ExtraLarge-export.pdf');
  fs.writeFileSync(pdfPath, pdf);

  const { stdout: fonts } = await execFileAsync('pdffonts', [pdfPath]);
  const { stdout: pagesOut } = await execFileAsync('pdfinfo', [pdfPath]);
  const pageCount = Number((pagesOut.match(/Pages:\s+(\d+)/) || [])[1] || 0);
  const sizeMatch = pagesOut.match(/Page size:\s+([\d.]+) x ([\d.]+)/);
  const widthPt = sizeMatch ? parseFloat(sizeMatch[1]) : 0;
  const heightPt = sizeMatch ? parseFloat(sizeMatch[2]) : 0;

  await execFileAsync('pdftoppm', ['-r', '150', '-png', pdfPath, path.join(outDir, 'combined-bishops-exact-case-ExtraLarge-export')]);
  // pdftoppm names: combined-bishops-exact-case-ExtraLarge-export-1.png
  const page1 = path.join(outDir, 'combined-bishops-exact-case-ExtraLarge-export-1.png');
  const page2 = path.join(outDir, 'combined-bishops-exact-case-ExtraLarge-export-2.png');
  if (fs.existsSync(page1)) {
    fs.copyFileSync(page1, path.join(outDir, 'combined-bishops-exact-case-ExtraLarge-page-1.png'));
  }
  if (fs.existsSync(page2)) {
    fs.copyFileSync(page2, path.join(outDir, 'combined-bishops-exact-case-ExtraLarge-page-2.png'));
  }

  const { stdout: analysisRaw } = await execFileAsync('python3', [path.join(here, 'analyze_pdf.py'), pdfPath]);
  const analysis = JSON.parse(analysisRaw);

  const png = PNG.sync.read(fs.readFileSync(page1));
  const qr = jsQR(png.data, png.width, png.height);
  let degraded = false;
  if (qr) {
    const degradedPath = path.join(outDir, 'combined-bishops-qr-degraded.png');
    await execFileAsync('convert', [
      page1, '-colorspace', 'Gray', '-blur', '0x0.8', '-level', '10%,90%',
      '-rotate', '1.5', '-resample', '150', degradedPath,
    ]);
    const d = PNG.sync.read(fs.readFileSync(degradedPath));
    degraded = !!jsQR(d.data, d.width, d.height);
    if (!degraded) {
      try {
        const { stdout } = await execFileAsync('zbarimg', ['-q', '--raw', degradedPath]);
        degraded = stdout.trim().length > 0;
      } catch { /* ignore */ }
    }
  }

  const vector = /Type\s+Encoding/.test(fonts) || /TrueType|Type 1|CID/.test(fonts);
  const landscape = Math.abs(widthPt - 792) < 6 && Math.abs(heightPt - 612) < 6;
  const report = {
    exportUsesWindowPrint: exportFn,
    pages: pageCount,
    pageSizePt: [widthPt, heightPt],
    landscapeLetter: landscape,
    vectorText: vector,
    fonts: fonts.trim().split('\n').slice(0, 8),
    wordCount: analysis.word_count,
    overlap: analysis.overlap_count,
    foldCross: analysis.fold_cross_count,
    qrClean: !!qr,
    qrDegraded: degraded,
    bodyPt: analysis.body_pt,
    headingPt: analysis.heading_pt,
  };
  fs.writeFileSync(path.join(outDir, 'combined-export-check.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
  const ok = pageCount === 2 && landscape && vector && analysis.word_count > 50 && !!qr;
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
