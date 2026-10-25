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

const FIXTURES = ['typical', 'special-musical-number', 'many-announcements', 'long-names', 'bishops-exact-case'];

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
  output: 'single' | 'booklet';
  checks: Record<string, CheckResult>;
  regionFonts?: Record<string, number>;
  panelMap?: string;
}

interface PdfAnalysis {
  pages: number;
  word_count: number;
  margin_in: number | null;
  margin_pass: boolean;
  body_pt: number;
  heading_pt: number;
  heading_gt_body?: boolean;
  body_median_pt: number;
  heading_median_pt: number;
  max_pt: number;
  clipping: boolean;
  overlap_count: number;
  overlap_samples: Array<{ a: string; b: string; page: number }>;
  fold_cross_count: number;
  fold_samples: Array<{ text: string; page: number }>;
  full_text?: string;
  region_fonts?: Record<string, number>;
  panels?: Array<{ page: number; side: string; role: string; text: string }>;
}

function tokens(value: string): string[] {
  return String(value || '')
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 || /^\d+$/.test(w));
}

function isSubsequence(needles: string[], haystack: string[]): boolean {
  let i = 0;
  for (const word of haystack) {
    if (i < needles.length && word === needles[i]) i += 1;
  }
  return i === needles.length;
}

function imposeFor(output: 'single' | 'booklet'): Array<[number, number]> {
  if (output === 'booklet') {
    return [[8, 1], [2, 7], [6, 3], [4, 5]];
  }
  return [[4, 1], [2, 3]];
}

function facingPairs(output: 'single' | 'booklet'): Array<[number, number]> {
  return output === 'booklet' ? [[2, 3], [4, 5], [6, 7]] : [[2, 3]];
}

function checkCompleteness(pdfText: string, fixture: any, omittedTitles: string[] = []): CheckResult {
  const haystack = tokens(pdfText);
  const missing: string[] = [];
  const phrases: string[] = [];

  if (fixture.wardName) phrases.push(fixture.wardName);
  for (const leader of fixture.wardLeadership || []) {
    if (leader.name) phrases.push(leader.name);
    if (leader.title) phrases.push(leader.title);
  }
  const lead = fixture.leadership || {};
  for (const key of ['presiding', 'conducting', 'chorister', 'organist']) {
    if (lead[key]) phrases.push(lead[key]);
  }
  const music = fixture.musicProgram || {};
  for (const key of ['openingHymnTitle', 'sacramentHymnTitle', 'closingHymnTitle', 'openingHymnNumber', 'sacramentHymnNumber', 'closingHymnNumber']) {
    if (music[key]) phrases.push(String(music[key]));
  }
  const prayers = fixture.prayers || {};
  if (prayers.opening) phrases.push(prayers.opening);
  if (prayers.closing) phrases.push(prayers.closing);
  for (const item of fixture.agenda || []) {
    if (item.name) phrases.push(item.name);
    if (item.songName) phrases.push(item.songName);
    if (item.performers) phrases.push(item.performers);
    if (item.hymnTitle) phrases.push(item.hymnTitle);
    if (item.title) phrases.push(item.title);
  }
  const omitted = new Set(omittedTitles.map((t) => t.toLowerCase()));
  for (const ann of (fixture.announcements || []).filter((a: any) => !a.hideOnPrint)) {
    if (omitted.has(String(ann.title || '').toLowerCase())) continue;
    if (ann.title) phrases.push(ann.title);
    if (ann.content) phrases.push(ann.content);
  }

  for (const phrase of phrases) {
    const need = tokens(phrase);
    if (need.length === 0) continue;
    if (!isSubsequence(need, haystack)) missing.push(phrase.slice(0, 48));
  }

  const titles = (fixture.announcements || [])
    .filter((a: any) => !a.hideOnPrint)
    .map((a: any) => a.title)
    .filter(Boolean);
  const titleTokens = titles.flatMap((title: string) => tokens(title));
  const orderOk = titleTokens.length === 0 || isSubsequence(titleTokens, haystack);

  if (missing.length === 0 && orderOk) {
    return { pass: true, value: `${phrases.length} fields` };
  }
  const bits = [
    missing.length ? `missing ${missing.slice(0, 3).join(' | ')}` : '',
    orderOk ? '' : 'order',
  ].filter(Boolean);
  return { pass: false, value: bits.join('; ').slice(0, 80) };
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

function checkFoldSimulation(
  analysis: PdfAnalysis,
  output: 'single' | 'booklet'
): { fold: CheckResult; continued: CheckResult; pages: CheckResult; map: string } {
  const pages = analysis.pages || 0;
  const pageOk = output === 'booklet' ? pages >= 4 && pages % 4 === 0 : pages === 2;
  const impose = imposeFor(output);
  const byPage = new Map<string, { role: string; text: string }>();
  for (const panel of analysis.panels || []) {
    byPage.set(`${panel.page}:${panel.side}`, { role: panel.role, text: panel.text || '' });
  }
  const reading: Record<number, { role: string; text: string; pdf: string }> = {};
  impose.forEach(([left, right], index) => {
    const page = index + 1;
    const L = byPage.get(`${page}:left`) || { role: 'empty', text: '' };
    const R = byPage.get(`${page}:right`) || { role: 'empty', text: '' };
    reading[left] = { ...L, pdf: `p${page}L` };
    reading[right] = { ...R, pdf: `p${page}R` };
  });

  const cover = reading[1];
  const coverOk = !!cover && /sacrament meeting|latter-day|latter day/i.test(cover.text) && !/presiding/i.test(cover.text);

  const programPanels = Object.entries(reading)
    .filter(([, panel]) => /presiding/i.test(panel.text) && /benediction/i.test(panel.text))
    .map(([n]) => Number(n));
  const programBits = Object.entries(reading)
    .filter(([, panel]) => /presiding|benediction|opening hymn/i.test(panel.text))
    .map(([n]) => Number(n));
  let programOk = programPanels.length === 1;
  if (!programOk && programBits.length === 2) {
    const [a, b] = programBits.slice().sort((x, y) => x - y);
    programOk = facingPairs(output).some(([l, r]) => l === a && r === b);
  }

  const full = analysis.full_text || '';
  const continuedOk = !/\(continued\)|\bcontinued\)/i.test(full);

  const bits: string[] = [];
  if (!coverOk) bits.push('cover≠p1');
  if (!programOk) bits.push(`program@${programBits.join(',') || 'none'}`);
  const map = Object.keys(reading)
    .map(Number)
    .sort((a, b) => a - b)
    .map((n) => `${n}:${reading[n].role}/${reading[n].pdf}`)
    .join(' ');

  return {
    fold: {
      pass: coverOk && programOk,
      value: bits.length ? bits.join('; ') : map,
    },
    continued: {
      pass: continuedOk,
      value: continuedOk ? 'None' : 'Continued',
    },
    pages: {
      pass: pageOk,
      value: String(pages),
    },
    map,
  };
}

async function buildFoldStrip(
  outputDir: string,
  pageFiles: string[],
  output: 'single' | 'booklet',
  destName: string
): Promise<string | undefined> {
  const impose = imposeFor(output);
  const crops: string[] = [];
  try {
    for (let i = 0; i < impose.length; i++) {
      const file = pageFiles[i];
      if (!file) continue;
      const full = path.join(outputDir, file);
      const leftOut = path.join(outputDir, `fold-p${i + 1}-L.png`);
      const rightOut = path.join(outputDir, `fold-p${i + 1}-R.png`);
      await execFileAsync('convert', [full, '-crop', '825x1275+0+0', '+repage', leftOut]);
      await execFileAsync('convert', [full, '-crop', '825x1275+825+0', '+repage', rightOut]);
      const [leftId, rightId] = impose[i];
      crops[leftId - 1] = leftOut;
      crops[rightId - 1] = rightOut;
    }
    const ordered = crops.filter(Boolean);
    if (ordered.length === 0) return undefined;
    const dest = path.join(outputDir, destName);
    await execFileAsync('convert', [...ordered, '+append', dest]);
    return dest;
  } catch {
    return undefined;
  }
}

async function runCase(
  browser: Browser,
  branch: string,
  fixture: string,
  mode: { scale: number; label: string; output?: 'single' | 'booklet' },
  port: number,
  outputBase: string
): Promise<TestResult> {
  const output = mode.output === 'booklet' ? 'booklet' : 'single';
  const testId = `${slug(branch)}_${fixture}_${slug(mode.label)}${output === 'booklet' ? '_booklet' : ''}`;
  const outputDir = path.join(outputBase, testId);
  fs.mkdirSync(outputDir, { recursive: true });

  const result: TestResult = {
    branch,
    fixture,
    mode: output === 'booklet' ? `${mode.label} booklet` : mode.label,
    scale: mode.scale,
    output,
    checks: {},
  };

  const page = await browser.newPage();
  const logs: string[] = [];
  page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`));

  try {
    const url = `http://127.0.0.1:${port}/print-test.html?fixture=${fixture}&fontScale=${mode.scale}&output=${output}`;
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

    const minBody = mode.label === 'Extra Large' ? 14 : mode.label === 'Large' ? 10 : 6.5;
    result.checks.body_pt = {
      pass: analysis.body_pt >= minBody,
      value: analysis.body_pt > 0 ? `${analysis.body_pt.toFixed(1)}pt` : 'N/A',
    };
    result.checks.heading_pt = {
      pass: analysis.heading_pt > analysis.body_pt + 0.4,
      value: analysis.heading_pt > 0 ? `${analysis.heading_pt.toFixed(1)}pt` : 'N/A',
    };
    result.checks.heading_gt_body = {
      pass: analysis.heading_gt_body === true,
      value: analysis.heading_gt_body ? `${analysis.heading_pt.toFixed(1)}>${analysis.body_pt.toFixed(1)}` : `${analysis.heading_pt.toFixed(1)}<=${analysis.body_pt.toFixed(1)}`,
    };

    const regions = analysis.region_fonts || {};
    const regionNames = ['program', 'announcements', 'leadership', 'cover'] as const;

    const fixturePath = path.join(here, 'fixtures', `${fixture}.json`);
    let fixtureData: any = {};
    try {
      fixtureData = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    } catch {
      fixtureData = {};
    }

    const expectedRegion: Record<(typeof regionNames)[number], boolean> = {
      leadership: (fixtureData.wardLeadership || []).some((e: any) => e?.name || e?.phone),
      cover: !!(fixtureData.wardName || fixtureData.date),
      announcements: (fixtureData.announcements || []).some((a: any) => !a.hideOnPrint),
      program: true,
    };
    const missingRegions: string[] = [];
    const smallRegions: string[] = [];
    for (const name of regionNames) {
      if (!expectedRegion[name]) continue;
      const pt = Number(regions[name] || 0);
      if (pt <= 0) {
        missingRegions.push(name);
        continue;
      }
      if (pt + 0.05 < minBody) smallRegions.push(`${name} ${pt.toFixed(1)}pt`);
    }
    result.checks.region_body = {
      pass: missingRegions.length === 0 && smallRegions.length === 0,
      value: smallRegions.length
        ? smallRegions.join(', ')
        : missingRegions.length
          ? `missing ${missingRegions.join(',')}`
          : Object.entries(regions)
              .filter(([name]) => expectedRegion[name as keyof typeof expectedRegion] !== false)
              .map(([k, v]) => `${k[0]}${Number(v).toFixed(0)}`)
              .join(' '),
    };
    const printPlan = await page.evaluate(() => (window as any).__PRINT_PLAN__ || null);
    const omittedTitles: string[] = printPlan?.omittedTitles || [];
    result.checks.completeness = checkCompleteness(analysis.full_text || '', fixtureData, omittedTitles);
    if (omittedTitles.length) {
      const moreLine = /more announcements:\s*scan the qr code/i.test(analysis.full_text || '');
      if (!moreLine) {
        result.checks.completeness = { pass: false, value: 'missing omit QR line' };
      }
    }
    result.checks.clipping = {
      pass: !analysis.clipping,
      value: analysis.clipping ? 'Yes' : 'None',
    };
    const foldSim = checkFoldSimulation(analysis, output);
    result.checks.pages = foldSim.pages;
    result.checks.fold_sim = foldSim.fold;
    result.checks.no_continued = foldSim.continued;
    result.panelMap = foldSim.map;
    result.regionFonts = analysis.region_fonts || {};
    const stripFixtures = new Set(['bishops-exact-case', 'many-announcements']);
    const stripModes = new Set(['Normal', 'Extra Large']);
    if (stripFixtures.has(fixture) && stripModes.has(mode.label)) {
      await buildFoldStrip(outputDir, pageFiles, output, 'folded-order.png');
    }
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
    if (result.output === 'booklet') continue;
    const key = `${result.branch}::${result.fixture}`;
    const list = groups.get(key) || [];
    list.push(result);
    groups.set(key, list);
  }
  const regions = ['program', 'announcements', 'leadership', 'cover'] as const;
  for (const group of groups.values()) {
    const normal = group.find((r) => r.mode === 'Normal');
    const large = group.find((r) => r.mode === 'Large');
    const extra = group.find((r) => r.mode === 'Extra Large');
    if (!normal || !extra) continue;
    const normalBody = parseFloat(normal.checks.body_pt?.value || '0');
    const extraBody = parseFloat(extra.checks.body_pt?.value || '0');
    const ratio = extraBody / Math.max(normalBody, 0.1);
    extra.checks.mode_scale = {
      pass: extraBody >= 14 && normalBody > 0 && ratio + 0.001 >= 1.15,
      value: normalBody > 0 ? `${ratio.toFixed(2)}×` : 'N/A',
    };

    const fails: string[] = [];
    for (const region of regions) {
      const n = Number(normal.regionFonts?.[region] || 0);
      const l = Number(large?.regionFonts?.[region] || 0);
      const x = Number(extra.regionFonts?.[region] || 0);
      const present = [n, l, x].filter((v) => v > 0);
      if (present.length < 2) continue;
      if (n > 0 && l > 0 && !(n < l)) fails.push(`${region} N≥L`);
      if (l > 0 && x > 0 && !(l < x)) fails.push(`${region} L≥XL`);
      if (n > 0 && x > 0 && !(n < x)) fails.push(`${region} N≥XL`);
    }
    extra.checks.region_scale = {
      pass: fails.length === 0,
      value: fails.length ? fails.join(', ') : 'N<L<XL',
    };
  }
}

function printTable(results: TestResult[]) {
  const keys = [
    'margin', 'qr_clean', 'body_pt', 'heading_pt', 'region_body', 'completeness',
    'pages', 'fold_sim', 'no_continued', 'mode_scale', 'region_scale',
  ];
  console.log('\n| fixture | mode | pages | body | regions | fold | scale | result |');
  console.log('|---------|------|-------|------|---------|------|-------|--------|');
  for (const result of results) {
    const failed = Object.entries(result.checks).filter(([, c]) => !c.pass).map(([k]) => k);
    const pages = result.checks.pages?.value || '?';
    const body = result.checks.body_pt?.value || '?';
    const regions = result.checks.region_body?.value || '?';
    const fold = result.checks.fold_sim?.value || '?';
    const scale = result.checks.mode_scale?.value || result.checks.region_scale?.value || '';
    const mark = failed.length ? `FAIL ${failed.join(',')}` : 'PASS';
    console.log(`| ${result.fixture} | ${result.mode} | ${pages} | ${body} | ${regions} | ${fold} | ${scale} | ${mark} |`);
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

    const bookletCases: Array<{ fixture: string; scale: number; label: string }> = [
      { fixture: 'many-announcements', scale: 1.25, label: 'Extra Large' },
      { fixture: 'bishops-exact-case', scale: 1.25, label: 'Extra Large' },
    ];
    for (const extra of bookletCases) {
      if (only && !only.includes(extra.fixture)) continue;
      process.stdout.write(`  ${extra.fixture} / ${extra.label} booklet... `);
      const result = await runCase(
        browser,
        branch,
        extra.fixture,
        { scale: extra.scale, label: extra.label, output: 'booklet' },
        port,
        outputBase
      );
      allResults.push(result);
      const passed = Object.values(result.checks).filter((c) => c.pass).length;
      const total = Object.values(result.checks).length;
      const err = result.checks.error?.value;
      console.log(`${passed}/${total}${err ? ` (${err})` : ''}`);
    }
  } finally {
    await browser.close();
  }

  addModeScaleChecks(allResults);
  printTable(allResults);
  const resultsFile = path.join(outputBase, `${slug(branch)}-results.json`);
  fs.writeFileSync(resultsFile, JSON.stringify(allResults, null, 2));
  console.log(`Results saved to ${resultsFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
