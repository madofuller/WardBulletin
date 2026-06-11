// Compares flattened key sets of every locale against en.json.
// Exits non-zero if any locale is missing keys (or has extras), so it can
// run in CI as a guard against future drift.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'i18n', 'locales');

const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? flatten(v, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  );

const en = new Set(flatten(JSON.parse(readFileSync(join(dir, 'en.json'), 'utf8'))));
let failed = false;

for (const file of readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'en.json')) {
  const keys = new Set(flatten(JSON.parse(readFileSync(join(dir, file), 'utf8'))));
  const missing = [...en].filter(k => !keys.has(k));
  const extra = [...keys].filter(k => !en.has(k));
  if (missing.length || extra.length) {
    failed = true;
    console.log(`${file}: ${missing.length} missing, ${extra.length} extra`);
    missing.slice(0, 25).forEach(k => console.log(`  - missing: ${k}`));
    extra.slice(0, 25).forEach(k => console.log(`  - extra:   ${k}`));
  } else {
    console.log(`${file}: OK (${keys.size} keys)`);
  }
}

process.exit(failed ? 1 : 0);
