/**
 * Run print regression suite across multiple branches and generate comparison table.
 */
import { chromium } from 'playwright';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';

const execAsync = promisify(exec);

const BRANCHES = [
  { name: 'main', pr: null },
  { name: 'cursor/print-layout-fixes-f7ea', pr: 173 },
  { name: 'cursor/pdf-qr-fixes-aaec', pr: 171 },
  { name: 'cursor/public-page-performance-e836', pr: 174 },
];

const FIXTURES = ['minimal', 'typical', 'everything-enabled'];

interface CheckResult {
  pass: boolean;
  message: string;
  pngPath?: string;
}

interface BranchResults {
  branch: string;
  checks: Record<string, CheckResult>;
}

async function setupBranch(branch: string): Promise<void> {
  console.log(`\n=== Setting up ${branch} ===`);
  
  // Create worktree
  const worktreePath = `/tmp/print-test-${branch.replace(/\//g, '-')}`;
  try {
    await execAsync(`rm -rf ${worktreePath}`);
    await execAsync(`cd /workspace && git worktree prune`);
  } catch {}
  
  await execAsync(`cd /workspace && git worktree add ${worktreePath} ${branch}`);
  
  // Copy test harness files into worktree
  const testFiles = [
    { src: 'tests/print', dest: 'tests/print' },
    { src: 'print-test.html', dest: 'print-test.html' },
    { src: 'public/test-fixtures', dest: 'public/test-fixtures' },
    { src: 'src/lib/supabase.test-stub.ts', dest: 'src/lib/supabase.test-stub.ts' },
    { src: 'src/print-test-entry.tsx', dest: 'src/print-test-entry.tsx' },
    { src: 'vite.config.ts', dest: 'vite.config.ts' },
  ];
  
  for (const file of testFiles) {
    const src = path.join('/workspace', file);
    const dest = path.join(worktreePath, file);
    const destDir = path.dirname(dest);
    await execAsync(`mkdir -p ${destDir}`);
    await execAsync(`cp -r ${src} ${dest}`);
  }
  
  console.log(`  ✓ Worktree ready at ${worktreePath}`);
}

async function runChecks(branch: string, fixture: string): Promise<Record<string, CheckResult>> {
  const worktreePath = `/tmp/print-test-${branch.replace(/\//g, '-')}`;
  const outputDir = `/tmp/print-results/${branch.replace(/\//g, '-')}/${fixture}`;
  await execAsync(`mkdir -p ${outputDir}`);
  
  // Start dev server in worktree
  const serverProc = exec(`cd ${worktreePath} && VITE_PRINT_TEST=true npm run dev`);
  await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for server
  
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    await page.goto(`http://localhost:5173/print-test.html?fixture=${fixture}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => (window as any).__PRINT_READY__ === true, { timeout: 20000 });
    
    // Generate PDF
    await page.emulateMedia({ media: 'print' });
    const pdf = await page.pdf({ format: 'Letter', landscape: true, printBackground: true, preferCSSPageSize: true });
    const pdfPath = path.join(outputDir, 'output.pdf');
    fs.writeFileSync(pdfPath, pdf);
    
    await browser.close();
    
    // Convert PDF to PNGs
    await execAsync(`pdftoppm -r 150 -png ${pdfPath} ${path.join(outputDir, 'page')}`);
    
    // Run checks
    const checks: Record<string, CheckResult> = {};
    
    // Check 1: PDF size sanity
    checks['pdf_size'] = pdf.length > 10000 
      ? { pass: true, message: `${pdf.length} bytes` }
      : { pass: false, message: `${pdf.length} bytes (too small)`, pngPath: `${outputDir}/page-1.png` };
    
    // Check 2: Blank page detection
    const page1Path = `${outputDir}/page-1.png`;
    if (fs.existsSync(page1Path)) {
      const pngData = PNG.sync.read(fs.readFileSync(page1Path));
      let nonWhite = 0;
      for (let i = 0; i < pngData.data.length; i += 4) {
        if (pngData.data[i] < 250 || pngData.data[i+1] < 250 || pngData.data[i+2] < 250) {
          nonWhite++;
        }
      }
      const pct = (nonWhite * 100 / (pngData.width * pngData.height)).toFixed(1);
      checks['blank_page'] = parseFloat(pct) > 2
        ? { pass: true, message: `${pct}% non-white` }
        : { pass: false, message: `${pct}% non-white (mostly blank)`, pngPath: page1Path };
    }
    
    // Check 3: QR codes
    for (let pageNum = 1; pageNum <= 2; pageNum++) {
      const pagePath = `${outputDir}/page-${pageNum}.png`;
      if (!fs.existsSync(pagePath)) continue;
      
      const pngData = PNG.sync.read(fs.readFileSync(pagePath));
      const qr = jsQR(pngData.data, pngData.width, pngData.height);
      
      checks[`qr_page${pageNum}`] = qr
        ? { pass: true, message: qr.data.substring(0, 40) }
        : { pass: false, message: 'NOT FOUND', pngPath: pagePath };
    }
    
    // Check 4: Bounds (using pdftotext)
    const bboxOutput = await execAsync(`pdftotext -bbox ${pdfPath} -`);
    const hasContent = bboxOutput.stdout.includes('WARD') || bboxOutput.stdout.includes('SunRiver');
    checks['pdf_content'] = hasContent
      ? { pass: true, message: 'Text extracted' }
      : { pass: false, message: 'No text found', pngPath: page1Path };
    
    return checks;
    
  } finally {
    // Kill server
    serverProc.kill();
  }
}

async function main() {
  const allResults: BranchResults[] = [];
  
  for (const branch of BRANCHES) {
    await setupBranch(branch.name);
    
    const branchChecks: Record<string, CheckResult> = {};
    
    for (const fixture of FIXTURES) {
      console.log(`\n  Testing ${fixture}...`);
      const fixtureChecks = await runChecks(branch.name, fixture);
      
      // Merge fixture checks into branch checks
      for (const [key, value] of Object.entries(fixtureChecks)) {
        branchChecks[`${fixture}_${key}`] = value;
      }
    }
    
    allResults.push({ branch: branch.name, checks: branchChecks });
  }
  
  // Generate comparison table
  const allCheckNames = Array.from(new Set(allResults.flatMap(r => Object.keys(r.checks))));
  
  let table = '# Print Regression Test Results\n\n';
  table += '| Check | ' + BRANCHES.map(b => b.name.split('/').pop()).join(' | ') + ' |\n';
  table += '|-------|' + BRANCHES.map(() => '------').join('|') + '|\n';
  
  for (const checkName of allCheckNames.sort()) {
    table += `| ${checkName} | `;
    for (const result of allResults) {
      const check = result.checks[checkName];
      if (check) {
        const status = check.pass ? '✓' : '❌';
        const msg = check.message.length > 30 ? check.message.substring(0, 27) + '...' : check.message;
        table += `${status} ${msg}`;
        if (check.pngPath) {
          table += ` ([png](${check.pngPath}))`;
        }
      } else {
        table += 'N/A';
      }
      table += ' | ';
    }
    table += '\n';
  }
  
  fs.writeFileSync('/workspace/tests/print/RESULTS_COMPARISON.md', table);
  console.log('\n✅ Results written to RESULTS_COMPARISON.md');
}

main().catch(console.error);
