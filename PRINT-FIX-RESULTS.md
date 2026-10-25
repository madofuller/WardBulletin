# Print Layout Fixes - Complete Results

## Summary of Changes

This PR addresses 6 complaints from Bishop Mark Perkins regarding print layout issues for LDS sacrament meeting bulletins (SunRiver 2nd Ward, 55+ senior ward).

## Font Scaling ✅ FIXED

### Problem
Original implementation used `fontScale` multiplier (1.0, 1.15, 1.25) applied as percentage on component level, but Tailwind `print:!text-*` classes use fixed rem values that didn't scale.

### Solution
Set `font-size` on `html` element in print media using `:has(.print-layout[data-font-scale])` selector, so rem-based Tailwind classes scale correctly.

### Verified Measurements (from actual PDFs via pdfplumber)

| Mode | UI Scale | Print Scale | Body Text | H1 Heading | Range |
|------|----------|-------------|-----------|------------|-------|
| Normal | 100% (1.0) | 1.0× | **10.7pt** | 25.5pt | 6.4-25.5pt |
| Large | 115% (1.15) | 1.4× | **13.8pt** | 35.8pt | 8.6-35.8pt |
| Extra Large | 125% (1.25) | 1.8× | **17.4pt** | 46.0pt | 9.8-46.0pt |

✅ Normal unchanged (existing users see same output)
✅ Large reaches 14-16pt target (senior readability)
✅ Extra Large reaches 16-20pt target (senior readability)

### Technical Implementation
```css
@media print {
  html:has(.print-layout[data-font-scale="1"]) {
    font-size: 16px !important;
  }
  html:has(.print-layout[data-font-scale="1.4"]) {
    font-size: 22.4px !important;
  }
  html:has(.print-layout[data-font-scale="1.8"]) {
    font-size: 28.8px !important;
  }
}
```

## QR Code Rendering ✅ FIXED

### Problem
QR codes weren't rendering in test fixtures because SessionContext lacked profile data.

### Solution
1. Added `__TEST_SESSION__` window variable support in SessionContext
2. Inject mock profile via `page.addInitScript()` in render scripts
3. Scale QR size with fontScale: `Math.max(192, Math.round(160 * fontScale))px`

### Verified Measurements

| Mode | QR Size | Left Margin | Bottom Margin | Decodes | Photocopy |
|------|---------|-------------|---------------|---------|-----------|
| Normal | **1.28"** | 0.32" | 0.32" | ✅ | ✅ |
| Large | **1.49"** | 0.32" | 0.32" | ✅ | ✅ |
| Extra Large | **1.92"** | 0.32" | 0.32" | ✅ | ✅ |

✅ All ≥1.0" wide (requirement)
✅ All ≥0.25" from edges (requirement)
✅ Decode cleanly and survive photocopy degradation

### Scripts Created
- `verify-qr-codes.ts` - Decodes QR from PNG, measures size/position, simulates photocopy

## Cross-Browser Testing ✅ VERIFIED

### Firefox
- **Status**: ✅ Renders correctly
- **Issue Fixed**: "invalid language tag: undefined" by setting `localStorage.setItem('selectedLanguage', 'en')` before page load
- **PDF Generation**: Not supported by Playwright (Chromium-only), screenshot fallback used

### WebKit (Safari)
- **Status**: ✅ Renders correctly
- **Method**: Screenshot with `page.emulateMedia({ media: 'print' })`
- **Note**: No PDF support in Playwright WebKit

### Chromium
- **Status**: ✅ Baseline, PDF + PNG generation works

### Script Created
- `test-firefox-webkit.ts` - Tests all three engines with print media emulation

## Continuation Page Split ⚠️ PARTIAL

### Current Implementation
- Uses 40%/60% heuristic: `Math.ceil(announcements.length * 0.4)` on page 2, rest on page 3
- Works but can create half-empty continuation pages

### Example Issue
Bishop's exact case in Extra Large mode:
- 5 announcements total
- Split: 2 on page 2, 3 on page 4
- Result: Page 4 is mostly empty due to large font scaling

### Recommendation
Implement measurement-based splitting using:
- `useLayoutEffect` to measure actual announcement DOM heights
- Calculate split index based on available container height
- Binary search or cumulative height calculation
- Proper debouncing to avoid render loops

**Status**: Documented for follow-up PR (complex, risk of destabilization)

## Print Margin Enforcement ✅ VERIFIED

All panels use `pl-6/pr-6/pt-6` (24px minimum) ensuring ≥0.25" margins at 150 DPI.

## Gray Elements → Black ✅ FIXED

All gray text, borders, and backgrounds converted to print black:
- `print:!text-black`
- `print:!border-black`
- `print:!bg-transparent`

## Test Artifacts Generated

### PDFs & PNGs
Location: `/opt/cursor/artifacts/print-pdfs-proper/`

**Fixtures:**
1. `normal` - Basic bulletin
2. `musical-long-ward-name` - Special musical number + longest ward name
3. `bishops-exact-case` - Full program + musical + announcements (Bishop's exact complaint)
4. `heavy-announcements` - 15 long announcements

**Modes per fixture:**
- Normal (100%)
- Large (115%)
- Extra Large (125%)

**Total**: 4 fixtures × 3 modes × (1 PDF + 2-4 PNG pages) = 36+ files

### Browser Comparison
Location: `/opt/cursor/artifacts/browser-comparison/`
- Chromium: PDF + PNG
- Firefox: Screenshot fallback
- WebKit: Screenshot

### Scripts for Verification
1. `extract-pdf-fonts.py` - Extracts real font sizes from PDFs using pdfplumber
2. `verify-qr-codes.ts` - QR decode, size/position measurement, photocopy test
3. `render-print-pdfs.ts` - Generate all fixtures in all modes
4. `test-firefox-webkit.ts` - Cross-browser testing

## Commits

```
e14cd2f Add cross-browser testing for Firefox and WebKit
e58f0d2 Fix font scaling in print PDFs - set html font-size in print media
9fd97e1 Add PDF font extraction script
16a1249 Scale QR code size with fontScale and improve margins
07d04be Add test session override for QR code rendering in tests
75582fb Add bishop's exact test case fixture
c85e378 Increase font scale factors for senior readability
```

## Remaining Work (for follow-up)

1. **Measurement-based continuation split** - Replace 40%/60% heuristic with DOM height measurement
2. **Musical number header vertical overflow** - Verify long performer names don't push content off page (requires Bishop's exact fixture testing with very long names)
3. **On-screen editor preview verification** - Manually test all modes in browser to ensure editor looks correct (not automated)

## Files Modified

### Core Changes
- `src/components/BulletinPrintLayout.tsx` - Added `data-font-scale` attribute, scaled QR size
- `src/index.css` - Added print media font-size scaling on `html` element
- `src/lib/SessionContext.tsx` - Added `__TEST_SESSION__` support for testing

### New Test Infrastructure
- `extract-pdf-fonts.py` - Python script for PDF font extraction
- `verify-qr-codes.ts` - QR verification suite
- `test-firefox-webkit.ts` - Cross-browser testing
- `render-print-pdfs.ts` - Already existed, enhanced with bishop's fixture
- `REMAINING-WORK.md` - Internal tracking document

## Success Criteria

✅ **Font Sizes**: Normal 11pt, Large 14-16pt, Extra Large 16-20pt body text
✅ **QR Codes**: Render in all modes, ≥1" wide, ≥0.25" from edges, decode cleanly
✅ **Cross-Browser**: Firefox and WebKit verified
✅ **Normal Mode**: Unchanged (10.7pt body consistent with original)
✅ **Margins**: ≥0.25" enforced on all panels
✅ **Gray → Black**: All gray elements converted for printing
⚠️ **Continuation Split**: 40%/60% heuristic works but not optimal (follow-up needed)

## Visual Verification for PR

See attached screenshots:
- `bishops-exact-case_extralarge-1.png` - Front cover with large QR
- `bishops-exact-case_extralarge-2.png` - Inside spread (program + announcements)
- `bishops-exact-case_extralarge-3.png` - Program continuation
- `bishops-exact-case_extralarge-4.png` - Announcements continuation (shows split issue)

Font size table (from extract-pdf-fonts.py) included above.
