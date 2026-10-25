import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const RESULTS = path.join(here, 'results');

const BRANCHES = [
  { key: 'main', label: 'main', file: 'main-results.json' },
  { key: '173', label: '#173', file: 'cursor-print-layout-fixes-f7ea-results.json' },
  { key: '171', label: '#171', file: 'cursor-pdf-qr-fixes-aaec-results.json' },
  { key: '174', label: '#174', file: 'cursor-public-page-performance-e836-results.json' },
];

const CHECKS: Array<{ id: string; label: string }> = [
  { id: 'margin', label: 'margin in' },
  { id: 'qr_clean', label: 'QR clean' },
  { id: 'qr_degraded', label: 'QR degraded' },
  { id: 'qr_margin', label: 'QR inside 0.25in' },
  { id: 'body_pt', label: 'body pt' },
  { id: 'heading_pt', label: 'heading pt' },
  { id: 'clipping', label: 'clipping' },
  { id: 'pages', label: 'pages' },
  { id: 'overlap', label: 'overlapping text' },
  { id: 'fold', label: 'fold crossing' },
  { id: 'mode_scale', label: 'XL vs Normal body' },
];

const FIXTURES = ['typical', 'special-musical-number', 'many-announcements', 'long-names'];
const MODES = ['Normal', 'Large', 'Extra Large'];

type Check = { pass: boolean; value: string };
type Row = { fixture: string; mode: string; checks: Record<string, Check> };

function load(file: string): Row[] {
  const full = path.join(RESULTS, file);
  if (!fs.existsSync(full)) return [];
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function cell(row: Row | undefined, checkId: string): string {
  if (!row) return '—';
  const check = row.checks[checkId];
  if (!check) return checkId === 'mode_scale' ? '—' : '—';
  return `${check.value} ${check.pass ? '✅' : '❌'}`;
}

function findRow(rows: Row[], fixture: string, mode: string): Row | undefined {
  return rows.find((r) => r.fixture === fixture && r.mode === mode);
}

function failCount(rows: Row[]): number {
  let n = 0;
  for (const row of rows) {
    for (const [id, check] of Object.entries(row.checks)) {
      if (id === 'error' || !check.pass) n += 1;
    }
  }
  return n;
}

function main() {
  const data = Object.fromEntries(BRANCHES.map((b) => [b.key, load(b.file)]));

  const lines: string[] = [];
  lines.push('# Print regression comparison');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('Columns are `main | #173 (print-layout-fixes) | #171 (pdf-qr-fixes) | #174 (public-page-performance)`.');
  lines.push('');
  lines.push('Checks use Chromium `page.pdf()` plus pdfplumber word/char boxes. QR photocopy uses ImageMagick `convert … -colorspace Gray -blur 0x0.8 -level 10%,90% -rotate 1.5 -resample 150`, then jsQR/zbarimg.');
  lines.push('');
  lines.push('- **margin in**: smallest edge from any word bbox to the page edge; fail if `< 0.25in`.');
  lines.push('- **overlapping text**: fail if any two pdfplumber word bboxes intersect (inset 0.75pt so adjacent words do not count).');
  lines.push('- **fold crossing**: fail if any word straddles the 5.5in landscape-Letter fold.');
  lines.push('- **XL vs Normal body**: Extra Large min frequent body size (`<14pt`) must be `≥ 1.15×` Normal on the same fixture.');
  lines.push('');
  lines.push('## Fail counts');
  lines.push('');
  lines.push('| Branch | Cases | Failing checks |');
  lines.push('|---|---:|---:|');
  for (const b of BRANCHES) {
    const rows = data[b.key] as Row[];
    lines.push(`| ${b.label} | ${rows.length} | ${failCount(rows)} |`);
  }
  lines.push('');
  lines.push('## Full matrix');
  lines.push('');
  lines.push('| Fixture | Mode | Check | main | #173 | #171 | #174 |');
  lines.push('|---|---|---|---|---|---|---|');

  for (const fixture of FIXTURES) {
    for (const mode of MODES) {
      for (const check of CHECKS) {
        if (check.id === 'mode_scale' && mode !== 'Extra Large') continue;
        const cells = BRANCHES.map((b) => cell(findRow(data[b.key] as Row[], fixture, mode), check.id));
        lines.push(`| ${fixture} | ${mode} | ${check.label} | ${cells.join(' | ')} |`);
      }
    }
  }

  const out = path.join(RESULTS, 'COMPARISON.md');
  fs.writeFileSync(out, lines.join('\n') + '\n');
  console.log(`Wrote ${out}`);
}

main();
