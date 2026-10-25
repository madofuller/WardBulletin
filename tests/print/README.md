# WardBulletin Print Regression Harness

Automated testing suite for print rendering quality, QR code scannability, and layout integrity across multiple browsers and page sizes.

## Overview

This harness validates that:
- ✅ All content fits within the printable area (0.25" safety margin)
- ✅ QR codes are fully visible, scannable, and survive photocopying
- ✅ Font sizes meet readability requirements for seniors (55+)
- ✅ No unexpected page overflow or blank pages
- ✅ Text contrast meets print quality standards
- ✅ Multi-browser consistency (Chromium, Firefox, WebKit)

## Quick Start

### Installation

```bash
cd tests/print
npm install
```

### Run Tests

```bash
npm test
```

This will:
1. Render all fixtures across Chromium, Firefox, and WebKit
2. Run automated checks on each render
3. Generate an HTML report with screenshots
4. Exit with code 1 if any tests fail

### View Results

Open `tests/print/output/reports/index.html` in your browser to see:
- Pass/fail summary statistics
- Detailed results per fixture/browser combination
- Side-by-side screenshot comparisons
- Failure details with evidence

## Fixtures

The test suite includes comprehensive fixtures covering edge cases:

| Fixture | Tests |
|---------|-------|
| `minimal` | Simplest valid bulletin with no announcements |
| `typical` | Standard Sunday bulletin with 4 announcements |
| `special-musical-number` | Tests overflow when musical numbers are added |
| `many-announcements` | 15 announcements to test text shrinking and columns |
| `long-names` | Very long ward names, speaker names, hymn titles |
| `everything-enabled` | All optional sections active simultaneously |
| `font-normal` | Normal font scale (100%) |
| `font-large` | Large font scale (115%) |
| `font-extra-large` | Extra Large font scale (125%) for seniors |

## Checks

### 1. Printable Bounds Check
Validates that no content extends outside the 0.25" safety margin from page edges. Real printers often cannot print to the absolute edge, so this simulates real-world constraints.

**Why 0.25"?** Most home and office printers have a non-printable margin of 0.15-0.25 inches. This ensures content is never cut off.

### 2. QR Code Check
- **Presence**: QR code exists when `showQRCodeOnPrint` is enabled
- **Position**: Code is fully on the page (not cut off)
- **Scannability**: Can be decoded to the correct URL
- **Photocopy Resilience**: Still scannable after simulating grayscale conversion, blur, threshold, and slight rotation

**Why photocopy?** Many wards print from PDF and make photocopies for distribution. The QR code must survive degradation.

### 3. Font Size Check
Ensures minimum font sizes for readability:
- **Normal (100%)**: 11px minimum
- **Large (115%)**: 12px minimum
- **Extra Large (125%)**: 14px minimum

**Why 14px for Extra Large?** Studies show 55+ adults need at least 12-14pt (16-19px) for comfortable reading. At 125% scale, 14px ensures legibility.

### 4. Overflow Check
Detects:
- Unexpected blank pages (e.g., 3rd page when only 2 expected)
- Content spilling onto extra pages

### 5. Contrast Check
Analyzes local contrast between text and background. Minimum 100 on 0-255 scale ensures legibility when printed on lower-quality paper.

## CI Integration

The harness runs on PRs via GitHub Actions (see `.github/workflows/print-regression.yml`). Chromium-only for speed. Full browser testing happens locally.

View CI artifacts:
1. Go to the PR's "Checks" tab
2. Click on "Print Regression Tests"
3. Download `print-regression-report` artifact
4. Open `index.html`

## Architecture

```
tests/print/
├── fixtures/           # Test data (JSON bulletin configs)
├── checks/             # Validation modules
│   ├── bounds-check.ts
│   ├── qr-check.ts
│   ├── font-size-check.ts
│   ├── overflow-check.ts
│   └── contrast-check.ts
├── utils/
│   └── render.ts       # Playwright rendering logic
├── harness.ts          # Main test runner
├── report-generator.ts # HTML report with screenshots
└── output/             # Generated artifacts (gitignored)
    ├── screenshots/
    └── reports/
```

## Adding New Checks

1. Create `checks/your-check.ts`
2. Export a function returning `{ passed: boolean, message: string, details?: any }`
3. Import and call in `harness.ts`
4. Run `npm test` to validate

Example:

```typescript
export async function checkYourThing(pngPath: string): Promise<CheckResult> {
  // Your logic here
  return {
    passed: true,
    message: 'All good!',
  };
}
```

## Known Issues Tested

Based on the bishop's report, this harness specifically validates:

1. **QR code pushed off page in Extra Large mode** → `font-extra-large.json` + bounds check
2. **Ward name runs off when Special Musical Number added** → `special-musical-number.json` + overflow
3. **Many announcements shrink text too much** → `many-announcements.json` + font size check
4. **Announcement columns misaligned** → Visual inspection in report screenshots
5. **PDF export shrunk and blurry** → Chromium PDF generation + contrast check
6. **QR code doesn't scan** → `qr-check.ts` with photocopy simulation

## Troubleshooting

### "No QR code found"
The simple HTML renderer in `render.ts` uses placeholders for QR codes. For full QR testing, point the harness at a running dev server.

### "Playwright not installed"
Run `npx playwright install` to download browser binaries.

### "Out of memory"
Rendering many combinations can be RAM-intensive. Run subsets:
```bash
# Edit harness.ts to test fewer browsers or fixtures
```

## Future Enhancements

- [ ] Test A4 paper size
- [ ] Batch PDF text extraction to verify vector text vs. rasterized
- [ ] Accessibility (ARIA, semantic HTML) checks
- [ ] Performance benchmarks (render time per fixture)
- [ ] Visual diff against baseline screenshots

## References

- [WCAG 2.1 Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Accessible Print Design](https://www.nngroup.com/articles/legibility-readability-comprehension/)
- [Printer Margins Standard](https://www.printivity.com/insights/bleed-margins-print-design/)
