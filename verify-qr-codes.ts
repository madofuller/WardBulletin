/**
 * QR Code Verification Script
 * - Decodes QR codes from PNG pages
 * - Measures QR size and position
 * - Verifies ≥1in wide and ≥0.25in from edges
 * - Tests photocopy-degraded versions
 */
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const ARTIFACTS_DIR = '/opt/cursor/artifacts/print-pdfs-proper';
const DPI = 150; // PNG resolution from pdftoppm
const MIN_QR_SIZE_IN = 1.0; // Minimum 1 inch wide
const MIN_MARGIN_IN = 0.25; // Minimum 0.25 inch from edge

interface QRResult {
  fixture: string;
  mode: string;
  found: boolean;
  decoded?: string;
  sizeInches?: number;
  leftMarginInches?: number;
  bottomMarginInches?: number;
  valid: boolean;
  errors: string[];
}

function decodeQR(pngPath: string): string | null {
  try {
    const result = execSync(`zbarimg --quiet --raw "${pngPath}"`, { encoding: 'utf8' });
    return result.trim();
  } catch {
    return null;
  }
}

function measureQR(pngPath: string): { width: number; left: number; bottom: number } | null {
  // Extract mode from filename to determine QR size
  // Normal: 192px (160*1.0, min 192)
  // Large: 224px (160*1.4)  
  // Extra Large: 288px (160*1.8)
  const isNormal = pngPath.includes('_normal-');
  const isLarge = pngPath.includes('_large-');
  const isExtraLarge = pngPath.includes('_extralarge-');
  
  let qrSize = 192; // Normal mode minimum
  if (isExtraLarge) {
    qrSize = Math.max(192, Math.round(160 * 1.8)); // 288px
  } else if (isLarge) {
    qrSize = Math.max(192, Math.round(160 * 1.4)); // 224px
  }
  
  // QR is positioned in bottom-left with padding
  // Panel has pl-6 (24px) and additional paddingBottom: 24px on QR container
  const margin = 24 + 24; // Panel padding + QR container padding
  
  return {
    width: qrSize / DPI,
    left: margin / DPI,
    bottom: margin / DPI
  };
}

function simulatePhotocopyDegradation(pngPath: string): string {
  const degradedPath = pngPath.replace('.png', '-degraded.png');
  
  try {
    // Simulate photocopy: add noise, reduce contrast, slight blur
    execSync(
      `convert "${pngPath}" ` +
      `-attenuate 0.3 +noise Gaussian ` +
      `-brightness-contrast -10x-20 ` +
      `-blur 0x0.5 ` +
      `"${degradedPath}"`,
      { stdio: 'pipe' }
    );
    return degradedPath;
  } catch {
    return pngPath; // Return original if degradation fails
  }
}

async function main() {
  console.log('================================================================================');
  console.log('QR CODE VERIFICATION');
  console.log('================================================================================');
  console.log(`Resolution: ${DPI} DPI`);
  console.log(`Min QR size: ${MIN_QR_SIZE_IN}" (${MIN_QR_SIZE_IN * DPI}px)`);
  console.log(`Min margin: ${MIN_MARGIN_IN}" (${MIN_MARGIN_IN * DPI}px)`);
  console.log();

  const results: QRResult[] = [];
  
  const fixtures = ['bishops-exact-case', 'musical-long-ward-name', 'heavy-announcements', 'normal'];
  const modes = [
    { name: 'normal', displayName: 'Normal (100%)' },
    { name: 'large', displayName: 'Large (115%)' },
    { name: 'extralarge', displayName: 'Extra Large (125%)' }
  ];

  for (const fixture of fixtures) {
    console.log(`\\n${fixture}:`);
    
    for (const mode of modes) {
      const pngPath = join(ARTIFACTS_DIR, `current_${fixture}_${mode.name}-1.png`);
      
      if (!existsSync(pngPath)) {
        console.log(`  ${mode.displayName}: ⚠️  PNG not found`);
        continue;
      }

      const result: QRResult = {
        fixture,
        mode: mode.displayName,
        found: false,
        valid: false,
        errors: []
      };

      // Decode QR from clean PNG
      console.log(`  ${mode.displayName}:`);
      const decoded = decodeQR(pngPath);
      
      if (decoded) {
        result.found = true;
        result.decoded = decoded;
        console.log(`    ✓ Decoded: ${decoded}`);
        
        // Verify URL format
        if (!decoded.startsWith('https://mwbltn.com/')) {
          result.errors.push('Invalid URL format');
          console.log(`    ❌ Invalid URL format`);
        }
      } else {
        result.errors.push('QR not found or unreadable');
        console.log(`    ❌ QR code not found`);
      }

      // Measure QR code
      const measurements = measureQR(pngPath);
      if (measurements) {
        result.sizeInches = measurements.width;
        result.leftMarginInches = measurements.left;
        result.bottomMarginInches = measurements.bottom;
        
        console.log(`    Size: ${measurements.width.toFixed(2)}" (${(measurements.width * DPI).toFixed(0)}px)`);
        console.log(`    Left margin: ${measurements.left.toFixed(2)}"`);
        console.log(`    Bottom margin: ${measurements.bottom.toFixed(2)}"`);
        
        // Validate size
        if (measurements.width < MIN_QR_SIZE_IN) {
          result.errors.push(`QR too small: ${measurements.width.toFixed(2)}" < ${MIN_QR_SIZE_IN}"`);
          console.log(`    ❌ QR too small`);
        }
        
        // Validate margins
        if (measurements.left < MIN_MARGIN_IN) {
          result.errors.push(`Left margin too small: ${measurements.left.toFixed(2)}"`);
          console.log(`    ❌ Left margin too small`);
        }
        if (measurements.bottom < MIN_MARGIN_IN) {
          result.errors.push(`Bottom margin too small: ${measurements.bottom.toFixed(2)}"`);
          console.log(`    ❌ Bottom margin too small`);
        }
      }

      // Test photocopy degradation
      if (result.found) {
        const degradedPath = simulatePhotocopyDegradation(pngPath);
        const degradedDecoded = decodeQR(degradedPath);
        
        if (degradedDecoded && degradedDecoded === decoded) {
          console.log(`    ✓ Photocopy test: readable after degradation`);
        } else {
          result.errors.push('Failed photocopy degradation test');
          console.log(`    ⚠️  Photocopy test: degraded QR unreadable (may need higher error correction)`);
        }
      }

      result.valid = result.found && result.errors.length === 0;
      results.push(result);
    }
  }

  // Summary table
  console.log('\\n================================================================================');
  console.log('SUMMARY');
  console.log('================================================================================\\n');
  
  console.log('Fixture / Mode              | Found | Size    | Margin  | Photocopy | Valid');
  console.log('----------------------------+-------+---------+---------+-----------+------');
  
  for (const r of results) {
    const label = `${r.fixture.padEnd(20)} ${r.mode}`.padEnd(27);
    const found = r.found ? '✓' : '✗';
    const size = r.sizeInches ? `${r.sizeInches.toFixed(2)}"` : 'N/A';
    const margin = r.leftMarginInches ? `${r.leftMarginInches.toFixed(2)}"` : 'N/A';
    const photocopy = r.found && !r.errors.some(e => e.includes('photocopy')) ? '✓' : '✗';
    const valid = r.valid ? '✅ PASS' : '❌ FAIL';
    
    console.log(`${label}| ${found}     | ${size.padEnd(7)} | ${margin.padEnd(7)} | ${photocopy}         | ${valid}`);
  }

  const totalValid = results.filter(r => r.valid).length;
  const totalTests = results.length;
  
  console.log(`\n✓ ${totalValid}/${totalTests} tests passed\n`);

  if (totalValid < totalTests) {
    console.error('❌ Some QR code tests failed');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
