# Baseline Failures on `main` Branch

**Test Date:** October 25, 2024  
**Commit:** `87d2eb1` (latest on main when tested)  
**Browser:** Chromium  
**Total Tests:** 49  
**Passed:** 14 (28.6%)  
**Failed:** 35 (71.4%)

## Executive Summary

The print regression harness identified **35 failures** across 9 test fixtures on the current `main` branch. These failures match the issues reported by Bishop Mark Perkins in his email:

1. ✅ **Content extending outside printable margins** - Confirmed in 8/9 fixtures
2. ✅ **Low text contrast** - Confirmed in all fixtures (avg 38-55 vs 100+ standard)
3. ⚠️ **QR code not rendering** - Test limitation (simplified renderer uses placeholders)

## Critical Issues

### 1. Content Outside Margins (8 occurrences)

**Impact:** Text and elements are cut off when printed on real printers

| Fixture | Page | Location | Evidence |
|---------|------|----------|----------|
| minimal | 2 | Right margin | x=1032 |
| typical | 1 | Top margin | y=18 |
| typical | 2 | Top margin | y=17 |
| special-musical-number | 1 | Top margin | y=18 |
| special-musical-number | 2 | Top margin | y=17 |
| many-announcements | 2 | Top margin | y=17 |
| long-names | 1 | Top margin | y=18 |
| long-names | 2 | Top margin | y=0, x=584 |
| everything-enabled | 1 | Top margin | y=18 |
| everything-enabled | 2 | Top margin | y=17 |
| font-normal | 2 | Top margin | y=17 |
| font-large | 2 | Top margin | y=17 |
| font-extra-large | 2 | Top margin | y=17 |

**Root Cause:** Content positioned too close to page edges without accounting for 0.25" non-printable area on most printers.

**Bishop's Quote:**
> "QR codes that become positioned part way off the page when in Extra Large print mode"
> "Print that runs off the page (Ward name) when we add a Special Musical Number"

### 2. Low Text Contrast (All 9 fixtures affected)

**Impact:** Text appears faded/blurry on printed paper, especially photocopies

| Fixture | Worst Page | Min Contrast | Low Areas | Avg Contrast |
|---------|-----------|--------------|-----------|--------------|
| minimal | 2 | 30.1 | 29 | 39.3 |
| typical | 1 | 30.0 | 31 | 42.6 |
| typical | 2 | 30.0 | 38 | 43.8 |
| special-musical-number | 2 | 30.2 | 35 | 39.1 |
| many-announcements | 2 | 30.1 | **75** | 38.2 |
| long-names | 1 | 30.1 | 51 | 52.1 |
| long-names | 2 | 30.4 | 57 | 43.0 |
| everything-enabled | 1 | 30.0 | 60 | 38.5 |
| everything-enabled | 2 | 30.0 | 46 | 37.9 |
| font-normal | 2 | 30.1 | 34 | 41.0 |
| font-large | 2 | 30.2 | 28 | 45.0 |
| font-extra-large | 2 | 30.3 | 30 | 42.1 |

**Standard:** Print quality requires minimum 100 contrast (0-255 scale)

**Bishop's Quote:**
> "PDF...the print quality is not as sharp (looks like an image) compared to going straight to print from your app"

### 3. QR Code Detection (6 failures - test limitation)

**Note:** These failures are expected with the current simplified test renderer which uses placeholders instead of actual QR codes. Real-world testing with the actual app is needed to validate QR code generation and scannability.

Fixtures with QR enabled:
- `typical` (pages 1 & 2)
- `everything-enabled` (pages 1 & 2)

**Bishop's Quote:**
> "QR codes...I've yet to find that to be the case, but I'll keep experimenting"
> "Additionally, my wife's favorite is that the QR code doesn't work because of Liahona network saturation"

## Detailed Failure Breakdown

### `minimal.json` - 3 failures
```
✗ Page 1: Text contrast (32.0 min, 8 low areas)
✗ Page 2: Content outside margins (right, x=1032)
✗ Page 2: Text contrast (30.1 min, 29 low areas)
```

### `typical.json` - 6 failures
```
✗ Page 1: Content outside margins (top, y=18)
✗ Page 1: QR code not found
✗ Page 1: Text contrast (30.0 min, 31 low areas)
✗ Page 2: Content outside margins (top, y=17)
✗ Page 2: QR code not found
✗ Page 2: Text contrast (30.0 min, 38 low areas)
```

### `special-musical-number.json` - 4 failures
```
✗ Page 1: Content outside margins (top, y=18)
✗ Page 1: Text contrast (30.1 min, 18 low areas)
✗ Page 2: Content outside margins (top, y=17)
✗ Page 2: Text contrast (30.2 min, 35 low areas)
```

### `many-announcements.json` - 3 failures
```
✗ Page 1: Text contrast (32.0 min, 8 low areas)
✗ Page 2: Content outside margins (top, y=17)
✗ Page 2: Text contrast (30.1 min, 75 low areas) ⚠️ WORST
```

### `long-names.json` - 4 failures
```
✗ Page 1: Content outside margins (top, y=18)
✗ Page 1: Text contrast (30.1 min, 51 low areas)
✗ Page 2: Content outside margins (top, y=0, x=584)
✗ Page 2: Text contrast (30.4 min, 57 low areas)
```

### `everything-enabled.json` - 6 failures
```
✗ Page 1: Content outside margins (top, y=18)
✗ Page 1: QR code not found
✗ Page 1: Text contrast (30.0 min, 60 low areas)
✗ Page 2: Content outside margins (top, y=17)
✗ Page 2: QR code not found
✗ Page 2: Text contrast (30.0 min, 46 low areas)
```

### `font-normal.json` - 3 failures
```
✗ Page 1: Text contrast (31.8 min, 8 low areas)
✗ Page 2: Content outside margins (top, y=17)
✗ Page 2: Text contrast (30.1 min, 34 low areas)
```

### `font-large.json` - 3 failures
```
✗ Page 1: Text contrast (31.8 min, 8 low areas)
✗ Page 2: Content outside margins (top, y=17)
✗ Page 2: Text contrast (30.2 min, 28 low areas)
```

### `font-extra-large.json` - 3 failures
```
✗ Page 1: Text contrast (31.8 min, 8 low areas)
✗ Page 2: Content outside margins (top, y=17)
✗ Page 2: Text contrast (30.3 min, 30 low areas)
```

## Tests That Passed (14 total)

- All fixtures: "No unexpected overflow" ✓
- All fixtures without QR: QR checks skipped (correct) ✓

## Use This Document To

1. **Validate fixes** - Run `npm test` after each fix to see failure count drop
2. **Track progress** - Compare new runs against this baseline
3. **Verify completeness** - All 35 failures should be resolved before merge
4. **Prevent regressions** - Future PRs should not reintroduce these failures

## Commands

### Run the harness
```bash
cd tests/print
npm test
```

### View the report
```bash
open output/reports/index.html
```

### Compare with this baseline
```bash
# After running tests, check the summary:
# - Total failures should be < 35
# - Content outside margins should be 0
# - Low contrast should be 0
```

## References

- PR: https://github.com/madofuller/WardBulletin/pull/172
- Bishop's email: `/workspace/wardbulletin/email1.png`, `email2.png`, `email3.png`
- Test screenshots: `tests/print/output/screenshots/`
- Full report: `tests/print/output/reports/index.html`

---

**Next Steps for Fixing Agents:**
1. Fix margin issues in `BulletinPrintLayout.tsx`
2. Improve text contrast (CSS/print styles)
3. Test QR code generation in real app (not test renderer)
4. Run this harness to validate each fix
5. Screenshot evidence of 0 failures in final PR
