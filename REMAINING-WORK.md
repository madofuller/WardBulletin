# Remaining Work - Do Not Report Until Complete

## Completed ✅

1. ✅ QR Code Rendering & Verification
   - Added test session support
   - QR codes render in all modes
   - Sizes: 1.28" (Normal), 1.49" (Large), 1.92" (Extra Large)
   - Margins: 0.32" from edges (≥0.25" ✓)
   - Decodes correctly, passes photocopy degradation tests
   - Commit: 16a1249

2. ✅ Font Scale Factors Increased
   - Changed from 1.0/1.15/1.25 to 1.0/1.4/1.8
   - Commit: c85e378

3. ✅ PDF Font Extraction Script
   - Created extract-pdf-fonts.py
   - Measures actual rendered sizes
   - Commit: 9fd97e1

## Critical Issue Found ❌

**Font sizes still too small in PDFs:**
- Extra Large measured: 12.3pt body (target was 16-18pt)
- Large measured: 11.1pt body (target was 14pt)  
- Normal measured: 10.7pt body (target was 11pt)

**Root cause:** fontScale applied as `fontSize: ${fontScale * 100}%` on root div, but Tailwind `print:!text-xl` classes use fixed rem values that don't scale. The print classes OVERRIDE the scaled values.

**Fix needed:** Remove fixed print text classes or multiply them by fontScale

## Must Complete Before Reporting

### 1. Fix Font Sizes in Print (CRITICAL)
- [ ] Replace `print:!text-xl` etc with dynamic scaled values
- [ ] OR multiply base rem sizes by fontScale in print CSS
- [ ] Target: Normal 11pt, Large 14-16pt, Extra Large 16-20pt body text
- [ ] Re-extract and verify with extract-pdf-fonts.py

### 2. Measurement-Based Continuation Split
- [ ] Replace 40%/60% heuristic with DOM height measurement
- [ ] useEffect to measure actual fitted announcements
- [ ] Binary search or cumulative height calculation
- [ ] Works in ALL modes (not just Large/XL)
- [ ] Test with varying announcement counts

### 3. Firefox & WebKit Testing
- [ ] Fix Firefox timeout: try `waitUntil: 'load'` + `document.fonts.ready`
- [ ] WebKit: Use `page.emulateMedia` + screenshot as proxy
- [ ] Generate comparison renders

### 4. Verify Normal Mode Unchanged
- [ ] Render main branch PDFs for comparison
- [ ] Confirm Normal (1.0×) matches existing output
- [ ] Check on-screen editor preview in all modes

### 5. Final PR Package
- [ ] Full Extra Large PNG set (all pages) for bishop's case
- [ ] Before/after comparison table
- [ ] Measured font sizes table (actual from PDF)
- [ ] Update PR #173 description

## Implementation Order

1. Fix font sizes (most critical)
2. Measurement-based continuation
3. Browser testing
4. Verify Normal unchanged
5. Generate PR assets

## Estimated Remaining

- Font fix: 1-2 hours (complex - need to understand Tailwind print system)
- Continuation: 1 hour
- Browser testing: 30 min
- Verification: 30 min  
- PR prep: 30 min

**Total: 3-4 hours to completion**

## Current Branch State

```
9fd97e1 Add PDF font extraction script
16a1249 Scale QR code size with fontScale and improve margins
07d04be Add test session override for QR code rendering in tests
75582fb Add bishop's exact test case fixture
c85e378 Increase font scale factors for senior readability
...
```

**Do not report status - continue working until all items complete**
