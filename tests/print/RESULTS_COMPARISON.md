# Print Regression Test Results - Branch Comparison

**Test Date:** 2026-10-25  
**Harness:** Real app print path with Chromium/Letter/9 fixtures  
**Test Command:** `cd tests/print && npm test`

## Summary Table

| Branch | PR | Commit | Total Tests | Passed | Failed | Success Rate |
|--------|------|--------|-------------|--------|--------|--------------|
| **main** | - | 73091ff | 38 | 22 | 16 | **57.9%** |
| **cursor/print-layout-fixes-f7ea** | [#173](https://github.com/madofuller/WardBulletin/pull/173) | 8430d8d | 67 | 35 | 32 | **52.2%** |
| **cursor/pdf-qr-fixes-aaec** | [#171](https://github.com/madofuller/WardBulletin/pull/171) | c90e094 | 38 | 22 | 16 | **57.9%** |

## Key Findings

### Main Branch (Baseline)
- **Margin violations:** ALL 9 fixtures have elements at (0,0) without 0.25" safety margin
- **QR codes missing:** `typical`, `everything-enabled`
- **Font sizes too small:** Up to 79 elements below 10pt in `everything-enabled`
- **Pages rendered:** 1 page per fixture (PDF generation issue)

### PR #173: print-layout-fixes
- **MORE tests run:** 67 total (vs 38 on main) - possibly rendering 2 pages now
- **Success rate LOWER:** 52.2% (vs 57.9%)
- **Margin violations:** STILL PRESENT - all fixtures still have h1 at (0,0)
- **QR codes:** Still missing in `typical` and `everything-enabled`
- **Font sizes:** Still below threshold
- **Assessment:** Layout fixes may have introduced MORE pages (continuation pages?) but did NOT fix the core margin/QR/font issues

### PR #171: pdf-qr-fixes  
- **Same test count as main:** 38 tests
- **Same success rate:** 57.9%
- **Margin violations:** STILL PRESENT
- **QR codes:** STILL MISSING in `typical` and `everything-enabled`
- **Font sizes:** Still below threshold
- **Assessment:** PDF/QR fixes did NOT resolve the missing QR codes visible in test PNGs

## Detailed Comparison by Issue

### 1. Margin Violations (0.25" safety)
| Branch | Status | Notes |
|--------|--------|-------|
| main | ❌ FAIL | All 9 fixtures, h1 at (0,0) |
| print-layout-fixes | ❌ FAIL | All fixtures, same h1 at (0,0) issue |
| pdf-qr-fixes | ❌ FAIL | All fixtures, same h1 at (0,0) issue |

**Recommendation:** Add `margin: 0.25in;` or `padding: 0.25in;` to `.print-page` in print CSS.

### 2. QR Code Scannable
| Branch | Fixture | Status | Notes |
|--------|---------|--------|-------|
| main | typical | ❌ NOT FOUND | No QR in PNG |
| main | everything-enabled | ❌ NOT FOUND | No QR in PNG |
| print-layout-fixes | typical | ❌ NOT FOUND | Still missing |
| print-layout-fixes | everything-enabled | ❌ NOT FOUND | Still missing |
| pdf-qr-fixes | typical | ❌ NOT FOUND | **Still missing despite "QR fix" PR** |
| pdf-qr-fixes | everything-enabled | ❌ NOT FOUND | **Still missing despite "QR fix" PR** |

**Recommendation:** Investigate `PrintQRCode` component - may not be rendering at all, or profile slug is incorrect in test context.

### 3. Font Sizes (≥10pt minimum, ≥12pt for 55+ in Extra Large)
| Branch | Worst Fixture | Elements Below 10pt | Smallest Font |
|--------|---------------|---------------------|---------------|
| main | everything-enabled | 79 | 8.3pt |
| print-layout-fixes | everything-enabled | 79 | 8.3pt |
| pdf-qr-fixes | everything-enabled | 79 | 8.3pt |

**All branches identical.** None of the PRs address font sizing.

**Recommendation:** Increase base font sizes in print CSS, especially for Extra Large mode.

## Test Artifacts

### Main Branch
- Report: `output/reports/index.html`
- PNGs: `output/screenshots/*-page1.png` (18 files)
- Log: `tests/print/main-baseline-test.log`

### Print Layout Fixes (PR #173)
- Log: `tests/print/print-layout-fixes-test.log`
- More pages rendered (67 tests vs 38)

### PDF/QR Fixes (PR #171)
- Log: `tests/print/pdf-qr-fixes-test.log`
- Same page count as main (38 tests)

## Recommendations

1. **None of the current PRs fix the baseline failures.** All three branches have:
   - Margin violations (h1 at 0,0)
   - Missing QR codes in typical/everything-enabled
   - Font sizes below thresholds

2. **PR #173 (print-layout-fixes) may have regressed:**
   - Success rate dropped from 57.9% to 52.2%
   - More tests failing despite more pages being rendered

3. **PR #171 (pdf-qr-fixes) did not fix QR codes** as measured by this harness.

4. **Next steps:**
   - Fix margins: Add safety padding to `.print-page`
   - Fix QR codes: Debug `PrintQRCode` component in test context
   - Fix fonts: Increase base sizes, especially in Extra Large mode
   - Re-run this harness on fixed branches to validate improvements

## How to Reproduce

```bash
# On any branch with the harness
cd tests/print
npm install
npm test
open output/reports/index.html
```

## Notes

- The harness tests the REAL app through the REAL print path (real CSS, real QR component, real layout)
- PNGs are extracted from Playwright-generated PDFs via pdf2pic + GraphicsMagick
- All measurements (margins in inches, fonts in points, QR decoding with jsQR) use production-grade tools
- PDF generation has issues (only 1 page, 948 bytes) but PNG extraction still works for visual inspection
