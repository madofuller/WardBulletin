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
  { id: 'region_body', label: 'region body' },
  { id: 'completeness', label: 'completeness' },
  { id: 'clipping', label: 'clipping' },
  { id: 'pages', label: 'pages' },
  { id: 'fold_sim', label: 'fold sim' },
  { id: 'overlap', label: 'overlapping text' },
  { id: 'fold', label: 'fold crossing' },
  { id: 'mode_scale', label: 'XL vs Normal body' },
  { id: 'region_scale', label: 'region scale' },
];

const FIXTURES = ['typical', 'special-musical-number', 'many-announcements', 'long-names', 'bishops-exact-case'];
const MODES = ['Normal', 'Large', 'Extra Large', 'Extra Large booklet'];

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
  if (!check) return '—';
  return `${check.value} ${check.pass ? '✅' : '❌'}`;
}

function findRow(rows: Row[], fixture: string, mode: string): Row | undefined {
  return rows.find((r) => r.fixture === fixture && r.mode === mode);
}

function failCount(rows: Row[]): number {
  let n = 0;
  for (const row of rows) {
    for (const check of Object.values(row.checks)) {
      if (!check.pass) n += 1;
    }
  }
  return n;
}

function main() {
  const extra = process.argv[2];
  const branches = extra
    ? [...BRANCHES, { key: extra, label: extra, file: `${extra}-results.json` }]
    : BRANCHES;
  const data = Object.fromEntries(branches.map((b) => [b.key, load(b.file)]));

  const lines: string[] = [];
  lines.push('# Print regression comparison');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push(`Columns: ${branches.map((b) => b.label).join(' | ')}`);
  lines.push('');
  lines.push('## Fail counts');
  lines.push('');
  lines.push('| Branch | Cases | Failing checks |');
  lines.push('|---|---:|---:|');
  for (const b of branches) {
    const rows = data[b.key] as Row[];
    lines.push(`| ${b.label} | ${rows.length} | ${failCount(rows)} |`);
  }
  lines.push('');
  lines.push('## Full matrix');
  lines.push('');
  lines.push(`| Fixture | Mode | Check | ${branches.map((b) => b.label).join(' | ')} |`);
  lines.push(`|---|---|---|${branches.map(() => '---').join('|')}|`);

  for (const fixture of FIXTURES) {
    for (const mode of MODES) {
      const anyRow = branches.some((b) => findRow(data[b.key] as Row[], fixture, mode));
      if (!anyRow) continue;
      for (const check of CHECKS) {
        if ((check.id === 'mode_scale' || check.id === 'region_scale') && mode !== 'Extra Large') continue;
        const cells = branches.map((b) => cell(findRow(data[b.key] as Row[], fixture, mode), check.id));
        lines.push(`| ${fixture} | ${mode} | ${check.label} | ${cells.join(' | ')} |`);
      }
    }
  }

  const out = path.join(RESULTS, extra ? `COMPARISON-${extra}.md` : 'COMPARISON.md');
  fs.writeFileSync(out, lines.join('\n') + '\n');
  console.log(`Wrote ${out}`);
}

main();
