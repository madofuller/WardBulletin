#!/usr/bin/env tsx

import { mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import { renderFixture, BrowserType, PageSize } from './utils/render.js';
import { checkPrintableBounds } from './checks/bounds-check.js';
import { checkQRCode } from './checks/qr-check.js';
import { checkOverflow } from './checks/overflow-check.js';
import { checkContrast } from './checks/contrast-check.js';
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

const BROWSERS: BrowserType[] = ['chromium', 'firefox', 'webkit'];
const PAGE_SIZES: PageSize[] = ['letter']; // Add 'a4' if needed

interface TestSuite {
  fixture: string;
  browser: BrowserType;
  pageSize: PageSize;
  results: TestResult[];
}

async function main() {
  console.log('🚀 Starting WardBulletin Print Regression Harness\n');
  
  const outputDir = join(process.cwd(), 'output');
  const reportDir = join(outputDir, 'reports');
  const screenshotsDir = join(outputDir, 'screenshots');
  
  // Create output directories
  await mkdir(outputDir, { recursive: true });
  await mkdir(reportDir, { recursive: true });
  await mkdir(screenshotsDir, { recursive: true });
  
  const allTests: TestSuite[] = [];
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  // Run tests for each combination
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
          // Render the fixture
          const rendered = await renderFixture({
            browser,
            pageSize,
            fixture,
            outputDir: screenshotsDir,
          });
          
          console.log(`    ✓ Rendered ${rendered.length} page(s)`);
          
          // Run checks on each page
          for (let i = 0; i < rendered.length; i++) {
            const page = rendered[i];
            const pageNum = i + 1;
            
            // 1. Bounds check
            console.log(`    Checking page ${pageNum} bounds...`);
            const boundsResult = await checkPrintableBounds(
              page.pngPath,
              page.dimensions
            );
            testSuite.results.push({
              name: `Page ${pageNum}: Content within margins`,
              passed: boundsResult.passed,
              message: boundsResult.message,
              details: boundsResult.details,
              pngPath: page.pngPath,
            });
            totalTests++;
            if (boundsResult.passed) passedTests++;
            else failedTests++;
            
            // 2. QR code check (if applicable)
            if (page.bulletinData.showQRCodeOnPrint) {
              console.log(`    Checking page ${pageNum} QR code...`);
              const qrResult = await checkQRCode(page.pngPath);
              testSuite.results.push({
                name: `Page ${pageNum}: QR code scannable`,
                passed: qrResult.passed,
                message: qrResult.message,
                details: qrResult.details,
                pngPath: page.pngPath,
              });
              totalTests++;
              if (qrResult.passed) passedTests++;
              else failedTests++;
            }
            
            // 3. Contrast check
            console.log(`    Checking page ${pageNum} contrast...`);
            const contrastResult = await checkContrast(page.pngPath);
            testSuite.results.push({
              name: `Page ${pageNum}: Text contrast`,
              passed: contrastResult.passed,
              message: contrastResult.message,
              details: contrastResult.details,
              pngPath: page.pngPath,
            });
            totalTests++;
            if (contrastResult.passed) passedTests++;
            else failedTests++;
          }
          
          // 4. Overflow check (across all pages)
          console.log(`    Checking for overflow...`);
          const overflowResult = await checkOverflow(
            rendered.map(r => r.pngPath),
            2 // Expected 2 pages
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
  
  // Generate HTML report
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
  
  // List all failures
  if (failedTests > 0) {
    console.log('\n❌ Failed Tests:\n');
    for (const suite of allTests) {
      const failures = suite.results.filter(r => !r.passed);
      if (failures.length > 0) {
        console.log(`${suite.fixture} / ${suite.browser} / ${suite.pageSize}:`);
        for (const failure of failures) {
          console.log(`  • ${failure.name}: ${failure.message}`);
          if (failure.details) {
            console.log(`    ${JSON.stringify(failure.details, null, 2)}`);
          }
        }
        console.log();
      }
    }
  }
  
  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
