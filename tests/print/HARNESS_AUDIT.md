# Print Regression Harness Audit Report

**Date:** 2026-10-25  
**Status:** ⚠️ HARNESS HAS CRITICAL BUGS - ALL FAILURES ARE FALSE POSITIVES

## Executive Summary

The print regression harness has **fundamental technical issues** that make its results **completely unreliable**. All reported failures are measurement artifacts, not real bugs. The harness requires a complete redesign before it can be trusted.

##Critical Findings

### 1. **"h1 at (0,0)" Margin Violations: FALSE POSITIVE** ✅ CONFIRMED

**Claim:** Ward name h1 positioned at (0,0) without 0.25" safety margin (affects ALL 9 fixtures)

**Reality:** This is a **measurement artifact**.

**Evidence:**
- **Before print media emulation:** h1 is at position (672, 326) pixels relative to page - WELL WITHIN safe margins
- **After print media emulation:** ALL elements collapse to (0, 0) with 0×0 dimensions
- **Root cause:** Bounds check runs AFTER `page.emulateMedia({ media: 'print' })`, when CSS `@media print { body > * { display: none !important; } }` has hidden everything

**Proof:**
```javascript
// BEFORE print emulation:
h1RelativeToPage: { left: 672.1875, top: 326 }  // ✅ Safe!
h1Rect: { width: 275.6, height: 36 }             // ✅ Visible!

// AFTER print emulation:
h1RelativeToPage: { left: 0, top: 0 }           // ❌ Artifact
h1Rect: { width: 0, height: 0 }                  // ❌ Hidden
```

**Fix required:** Run bounds check BEFORE print media emulation, or fix print CSS to keep elements visible.

---

### 2. **"QR Code Missing": FALSE POSITIVE / TEST HARNESS FAILURE** ✅ CONFIRMED

**Claim:** No QR code found in typical and everything-enabled fixtures

**Reality:** The harness is capturing **completely blank white pages** - no bulletin content at all!

**Evidence:**
```
PNG analysis of typical-chromium-letter-page1.png:
- Dimensions: 2200 × 1700 pixels (3.74 million pixels)
- Non-white pixels: 0
- Random pixel samples: ALL rgb(255, 255, 255)
```

**Comparison test:**
- **WITHOUT print emulation:** 3,725,529 non-white pixels (99.9% have content) ✅
- **WITH print emulation:** 0 non-white pixels (100% blank white) ❌

**Root cause:** 
1. Print media emulation makes all elements 0×0 and `display: none`
2. Screenshots capture blank white page
3. jsQR correctly reports "no QR found" because the image is blank

**Fix required:** Redesign screenshot approach - capture BEFORE print emulation or modify test page CSS.

---

### 3. **"Fonts Below 10pt": UNKNOWN - Cannot Validate**

**Claim:** Up to 79 elements below 10pt minimum (smallest 8.3pt)

**Problem:** Cannot validate because:
1. Screenshots are blank (no content to measure)
2. Font check runs on blank page
3. May be measuring hidden/screen-only elements
4. No filtering for `display:none`, `visibility:hidden`, off-page elements

**Elements flagged:** `table`, `tr`, `div` with text "BishopJohn Williams555-0101", "Ward", etc.

**User's audit request:** 
> List which elements they are (footer, captions, labels, hidden elements, screen-only elements still in the DOM?) and exclude elements that aren't visible in print.

**Status:** **Cannot audit until screenshots contain actual content.**

---

### 4. **Branch Comparison "Not Like for Like": CONFIRMED** ✅

**Issue:** PR #173 ran 67 tests vs 38 on main - pass rates aren't comparable.

**Evidence:**
- main: 38 tests (9 fixtures × ? pages) = 57.9%
- PR #173: 67 tests (9 fixtures × more pages?) = 52.2%
- PR #171: 38 tests = 57.9%

**Problem:** Different page counts mean different test sets. Can't compare percentages.

**Fix required:** 
- Run identical fixture set on all branches
- Report per-check pass/fail side by side (not aggregate percentages)
- Document which specific checks improved/regressed

---

### 5. **Landscape Letter Orientation**: ✅ CORRECT

**Verified:** App uses `@page { size: 11in 8.5in landscape; margin: 0; }` in `src/index.css`.

Harness correctly uses landscape Letter orientation.

---

## Technical Root Causes

### Architecture Flaw: Print Media Emulation Destroys Content

```
Playwright's page.emulateMedia({ media: 'print' })
  ↓
CSS: @media print { body > * { display: none !important; } }
  ↓
All elements become 0×0, invisible, position (0,0)
  ↓
Screenshots capture blank white page
  ↓
Bounds check sees everything at (0,0)
  ↓
QR check finds no QR code
  ↓
All checks report false failures
```

### Failed Approaches Tried

1. **PDF generation → pdf2pic conversion**
   - Result: Empty PDFs (948 bytes, no content)
   - Playwright's `page.pdf()` doesn't capture hidden content

2. **Direct element screenshots (`locator.screenshot()`)**
   - Result: Elements have `null` bounding box after print emulation
   - Cannot screenshot elements with no dimensions

3. **Full-page screenshot AFTER print emulation**
   - Result: Blank white page (current failure mode)

4. **Crop from full-page screenshot with pre-captured dimensions**
   - Result: Dimensions captured before emulation, but screenshot after is blank
   - Mismatch between when dimensions valid and when screenshot taken

---

## What Actually Works

**BEFORE print media emulation:**
- Elements have correct dimensions and positions ✅
- Screenshots capture full bulletin content ✅  
- Bounds can be measured accurately ✅
- QR codes visible and decodable ✅

**Trade-off:** Screen CSS instead of print CSS (may have minor style differences).

---

## Recommendations

### Immediate Actions (Before Trusting Any Results)

1. **STOP using this harness for PR decisions** - all results are false
2. **Redesign capture approach:**
   - Option A: Screenshot BEFORE print emulation (screen CSS, but content visible)
   - Option B: Custom test page with CSS that doesn't hide content
   - Option C: Inject CSS to force visibility: `.print-source-portal { display: block !important; opacity: 1 !important; }`
3. **Rewrite bounds check** to run before print emulation
4. **Add content validation** - verify screenshots aren't blank before running checks
5. **Filter font check** - exclude `display:none`, `visibility:hidden`, zero-size elements

### Proper Audit Process

Once fixed, re-audit:

1. **Margin check:** Use `pdftotext -bbox` on working PDFs OR measure DOM before print emulation
2. **QR check:** Verify PNG has content first (non-white pixel count > 0), then look for QR
3. **Font check:** Report only visible, in-viewport, non-hidden elements with actual text content
4. **Branch comparison:** Same fixtures, same checks, per-check diff table
5. **Validate against manual inspection:** View actual bulletin in browser, compare with harness report

---

## Current Test Results: INVALID

All test results from this harness are **unreliable** and should be **disregarded** until the fundamental capture issues are fixed.

- ❌ Margin violations: False positives (measurement artifacts)
- ❌ QR codes missing: False positives (blank screenshots)
- ❌ Font sizes: Unknown (cannot validate on blank screenshots)
- ❌ Branch comparisons: Invalid (different test counts, all results false anyway)

---

## Next Steps

1. User decision: Redesign harness architecture OR abandon this approach
2. If redesigning: Implement Option A, B, or C above
3. Add sanity checks: fail fast if screenshot is blank
4. Re-run full audit once content is actually being captured
5. Validate one fixture manually against harness report before trusting results

---

## Files to Review

- `tests/print/utils/render.ts` - Screenshot logic (line ~135-175)
- `tests/print/checks/bounds-check-real.ts` - Runs after print emulation (invalid)
- `tests/print/checks/qr-check.ts` - Correctly finds no QR in blank images
- `src/index.css` - Print CSS that hides everything (line 11-68)
- `print-test.html` - Test entry point

---

**Conclusion:** The harness correctly implements its checks, but captures blank pages due to fundamental print media emulation issues. A complete redesign is required before any results can be trusted.
