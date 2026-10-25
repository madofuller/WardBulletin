#!/usr/bin/env tsx

import { mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import { spawn, ChildProcess } from 'child_process';
import { renderFixture, closeRenderResults, BrowserType, PageSize } from './utils/render.js';
import { checkPrintableBoundsReal } from './checks/bounds-check-real.js';
import { checkQRCode } from './checks/qr-check.js';
import { checkOverflow } from './checks/overflow-check.js';
import { checkContrastWCAG } from './checks/contrast-check-wcag.js';
import { checkFontSizesReal } from './checks/font-size-check-real.js';
import { generateReport, type TestResult } from './report-generator.js';

const FIXTURES = [
  'minimal',
  'typical',
  'special-musical-number',
  'many-announcements',
  'long-names',
  'everything-enabled',
  'font-normal',
  'font-large',
  'font-extra-large',
];

// Default to Chromium only for speed
const BROWSERS: BrowserType[] = process.env.BROWSERS === 'all' 
  ? ['chromium', 'firefox', 'webkit']
  : (process.env.BROWSERS?.split(',') as BrowserType[] | undefined) || ['chromium'];
const PAGE_SIZES: PageSize[] = ['letter'];

interface TestSuite {
  fixture: string;
  browser: BrowserType;
  pageSize: PageSize;
  results: TestResult[];
}

/**
 * Start the dev server
 */
async function startDevServer(): Promise<{ server: ChildProcess; url: string }> {
  return new Promise((resolve, reject) => {
    console.log('Starting dev server...');
    
    const server = spawn('npm', ['run', 'dev'], {
      cwd: join(process.cwd(), '../..'),
      stdio: 'pipe',
      env: {
        ...process.env,
        // Mock Supabase for testing
        VITE_SUPABASE_URL: 'https://test.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'test_anon_key_for_print_regression_testing_only',
      },
    });
    
    let output = '';
    
    const checkReady = (data: Buffer) => {
      output += data.toString();
      // Vite prints "Local: http://localhost:5173/" when ready
      const match = output.match(/Local:\s+(http:\/\/localhost:\d+)/);
      if (match) {
        const url = match[1];
        console.log(`✓ Dev server ready at ${url}\n`);
        resolve({ server, url });
      }
    };
    
    server.stdout?.on('data', checkReady);
    server.stderr?.on('data', checkReady);
    
    server.on('error', reject);
    
    // Timeout after 30 seconds
    setTimeout(() => reject(new Error('Dev server failed to start')), 30000);
  });
}

async function main() {
  console.log('🚀 Starting WardBulletin Print Regression Harness (Real App)\n');
  
  const outputDir = join(process.cwd(), 'output');
  const reportDir = join(outputDir, 'reports');
  const screenshotsDir = join(outputDir, 'screenshots');
  
  await mkdir(outputDir, { recursive: true });
  await mkdir(reportDir, { recursive: true });
  await mkdir(screenshotsDir, { recursive: true });
  
  // Start dev server
  const { server, url } = await startDevServer();
  
  try {
    const allTests: TestSuite[] = [];
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    
    for (const fixture of FIXTURES) {
      console.log(`\n📄 Testing fixture: ${fixture}`);
      
      for (const browser of BROWSERS) {
        for (const pageSize of PAGE_SIZES) {
          console.log(`  🌐 ${browser} (${pageSize})`);
          
          const testSuite: TestSuite = {
            fixture,
            browser,
            pageSize,
            results: [],
          };
          
          try {
            const rendered = await renderFixture({
              browser,
              pageSize,
              fixture,
              outputDir: screenshotsDir,
              appUrl: url,
            });
            
            console.log(`    ✓ Rendered ${rendered.length} page(s)`);
            
            // Run checks on each page
            for (let i = 0; i < rendered.length; i++) {
              const pageResult = rendered[i];
              const pageNum = i + 1;
              
              // 1. Bounds check (real DOM inspection)
              console.log(`    Checking page ${pageNum} bounds...`);
              const boundsResult = await checkPrintableBoundsReal(
                pageResult.page,
                pageResult.dimensions
              );
              testSuite.results.push({
                name: `Page ${pageNum}: Content within margins`,
                passed: boundsResult.passed,
                message: boundsResult.message,
                details: boundsResult.details,
                pngPath: pageResult.pngPath,
              });
              totalTests++;
              if (boundsResult.passed) passedTests++;
              else failedTests++;
              
              // 2. QR code check (if applicable)
              if (pageResult.bulletinData.showQRCodeOnPrint) {
                console.log(`    Checking page ${pageNum} QR code...`);
                const qrResult = await checkQRCode(pageResult.pngPath);
                testSuite.results.push({
                  name: `Page ${pageNum}: QR code scannable`,
                  passed: qrResult.passed,
                  message: qrResult.message,
                  details: qrResult.details,
                  pngPath: pageResult.pngPath,
                });
                totalTests++;
                if (qrResult.passed) passedTests++;
                else failedTests++;
              }
              
              // 3. Contrast check (WCAG)
              console.log(`    Checking page ${pageNum} contrast...`);
              const contrastResult = await checkContrastWCAG(pageResult.page);
              testSuite.results.push({
                name: `Page ${pageNum}: Text contrast (WCAG)`,
                passed: contrastResult.passed,
                message: contrastResult.message,
                details: contrastResult.details,
                pngPath: pageResult.pngPath,
              });
              totalTests++;
              if (contrastResult.passed) passedTests++;
              else failedTests++;
              
              // 4. Font size check
              console.log(`    Checking page ${pageNum} font sizes...`);
              const fontScale = pageResult.bulletinData.printFontScale || 1;
              const fontResult = await checkFontSizesReal(pageResult.page, fontScale);
              testSuite.results.push({
                name: `Page ${pageNum}: Font sizes`,
                passed: fontResult.passed,
                message: fontResult.message,
                details: fontResult.details,
                pngPath: pageResult.pngPath,
              });
              totalTests++;
              if (fontResult.passed) passedTests++;
              else failedTests++;
            }
            
            // 5. Overflow check
            console.log(`    Checking for overflow...`);
            const overflowResult = await checkOverflow(
              rendered.map(r => r.pngPath),
              2
            );
            testSuite.results.push({
              name: 'No unexpected overflow',
              passed: overflowResult.passed,
              message: overflowResult.message,
              details: overflowResult.details,
              pngPath: rendered[0]?.pngPath,
            });
            totalTests++;
            if (overflowResult.passed) passedTests++;
            else failedTests++;
            
            // Close browser
            await closeRenderResults(rendered);
            
          } catch (error) {
            console.error(`    ❌ Error: ${error}`);
            testSuite.results.push({
              name: 'Test execution',
              passed: false,
              message: `Error: ${error}`,
              pngPath: undefined,
            });
            totalTests++;
            failedTests++;
          }
          
          allTests.push(testSuite);
        }
      }
    }
    
    // Generate report
    console.log('\n📊 Generating report...');
    const reportPath = join(reportDir, 'index.html');
    await generateReport(allTests, reportPath, screenshotsDir);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 Test Summary');
    console.log('='.repeat(60));
    console.log(`Total tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📊 Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));
    console.log(`\n📄 Report: ${reportPath}`);
    console.log(`📸 Screenshots: ${screenshotsDir}\n`);
    
    // List failures
    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:\n');
      for (const suite of allTests) {
        const failures = suite.results.filter(r => !r.passed);
        if (failures.length > 0) {
          console.log(`${suite.fixture} / ${suite.browser} / ${suite.pageSize}:`);
          for (const failure of failures) {
            console.log(`  • ${failure.name}: ${failure.message}`);
            if (failure.details) {
              const details = JSON.stringify(failure.details, null, 2)
                .split('\n')
                .slice(0, 10)
                .join('\n');
              console.log(`    ${details}`);
            }
          }
          console.log();
        }
      }
    }
    
    // Stop server
    server.kill();
    
    process.exit(failedTests > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('Fatal error:', error);
    server.kill();
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
