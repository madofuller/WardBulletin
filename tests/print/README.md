# Print regression harness

Acceptance test for the bifold bulletin. Renders each fixture through
`print-test.html`, writes a Chromium PDF, and measures it with `analyze_pdf.py`.

```bash
# from repo root, with the print-test Vite server running on 5180
VITE_PRINT_TEST=true npx vite --port 5180 --strictPort --host 127.0.0.1
PORT=5180 BRANCH=local OUTPUT_DIR=/tmp/print-matrix npx tsx tests/print/complete-matrix.ts
```

Default output is **one duplex sheet** (2 PDF pages, 4 panels). Booklet cases
use two nested sheets with saddle imposition (`p8|p1`, `p2|p7`, `p6|p3`, `p4|p5`).

Checks include margin, QR (clean + photocopy), per-region body pt, Normal < Large
< Extra Large, Extra Large ≥ 1.15× Normal, content completeness (omitted
announcements must show the QR line), no `(Continued)` headings, and a fold
simulation of reading order after folding.

Generated PDFs, PNGs, and result JSON stay in `results/` (gitignored).
