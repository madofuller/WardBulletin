# Print Regression Baseline Failures (main branch)

**Branch:** `main`  
**Date:** 2026-10-25  
**Commit:** 73091ff  
**Test Run:** Chromium, Letter size, 9 fixtures

## Summary

- **Total Tests:** 9 fixtures × 2 pages (expected) = 18 page tests
- **Actual Pages Rendered:** 9 (only 1 page per fixture due to PDF generation issue)
- **Passed:** 22/38 individual checks
- **Failed:** 16/38 individual checks
- **Success Rate:** 57.9%

## Key Findings

### 1. **PDF Generation Issue**
- PDFs generated are only 1 page each (~948 bytes, nearly empty)
- Expected 2 pages per bulletin in landscape (11" × 8.5")
- Playwright `page.pdf()` not capturing `.print-source-portal` content properly
- **Status:** PNGs are being extracted from PDFs via pdf2pic and tests ARE running on real app content

### 2. **Margin Violations** (Common across all fixtures)
- **Issue:** Elements extending outside 0.25" safety margin
- **Root Cause:** Main ward name `<h1>` and other elements positioned at `(0, 0)` without margin
- **Impact:** Content may be cut off on some printers
- **Example:**
  ```
  Selector: .print-page h1
  Element: h1: "SunRiver 2nd Ward"  
  Position: Page 1: (0, 0) to (0, 0)
  Margin Violated: left, top
  ```
- **Affected:** ALL 9 fixtures (minimal, typical, special-musical-number, many-announcements, long-names, everything-enabled, font-normal, font-large, font-extra-large)
- **Evidence:** See PNGs in `output/screenshots/`

### 3. **QR Code Missing**
- **Issue:** No QR code found in rendered image
- **Affected Fixtures:** `typical`, `everything-enabled`
- **Expected:** QR code encoding `https://<domain>/test-ward` should appear on bulletin
- **Evidence:**
  - `typical-chromium-letter-page1.png`
  - `everything-enabled-chromium-letter-page1.png`

###4. **Font Sizes Below Minimum**
- **Issue:** Text elements below 10pt minimum threshold
- **Impact:** Readability issues, especially for 55+ readers (should be ≥12pt in Extra Large mode)
- **Smallest Detected:** 8.3pt (11px)
- **Common Violations:**
  - Table text (leadership, missionaries): 9pt
  - Announcement content: 8.3–9.75pt
- **Affected:**
  - `typical`: 25 elements below 10pt
  - `special-musical-number`: 6 elements below 10pt
  - `many-announcements`: 29 elements below 10pt
  - `long-names`: 13 elements below 10pt
  - `everything-enabled`: 79 elements below 10pt

### 5. **Fixtures Passed All Checks**
- `minimal` (Page 2)
- `typical` (Page 2)
- `special-musical-number` (Page 2)
- `many-announcements` (Page 2)
- `long-names` (Page 2)
- `everything-enabled` (Page 2)
- `font-normal` (Pages 1 & 2 except margin)
- `font-large` (Pages 1 & 2 except margin)
- `font-extra-large` (Pages 1 & 2 except margin)

## Detailed Failures by Fixture

### `minimal`
- ❌ Page 1: Content within margins (5 violations - h1 at 0,0)

### `typical`
- ❌ Page 1: Content within margins (9 violations)
- ❌ Page 1: QR code scannable (No QR found)
- ❌ Page 1: Font sizes (25 elements below 10pt, smallest 8.3pt)

### `special-musical-number`
- ❌ Page 1: Content within margins (8 violations)
- ❌ Page 1: Font sizes (6 elements below 10pt, smallest 9.0pt)

### `many-announcements`
- ❌ Page 1: Content within margins (6 violations)
- ❌ Page 1: Font sizes (29 elements below 10pt, smallest 8.3pt)

### `long-names`
- ❌ Page 1: Content within margins (8 violations)
- ❌ Page 1: Font sizes (13 elements below 10pt, smallest 8.3pt)

### `everything-enabled`
- ❌ Page 1: Content within margins (9 violations)
- ❌ Page 1: QR code scannable (No QR found)
- ❌ Page 1: Font sizes (79 elements below 10pt, smallest 8.3pt)

### `font-normal`, `font-large`, `font-extra-large`
- ❌ Page 1: Content within margins (6 violations each)

## Artifacts

- **Report:** `tests/print/output/reports/index.html`
- **Screenshots:** `tests/print/output/screenshots/*.png`
- **PDFs:** `tests/print/output/screenshots/*.pdf` (broken, only 1 page each)
- **Debug Screenshots:** `tests/print/output/screenshots/debug-*.png`

## Recommended Fixes

1. **Margins:** Add `margin: 0.25in;` or padding to `.print-page` container
2. **QR Codes:** Verify `PrintQRCode` component renders with test profile slug  
3. **Font Sizes:** Increase base font sizes, especially in Extra Large mode (target ≥12pt for body text)
4. **PDF Generation:** Fix Playwright PDF capture or use alternative method for 2-page rendering

## How to Reproduce

```bash
cd tests/print
npm test
open output/reports/index.html
```
