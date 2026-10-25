# Print layout notes (PR #173)

Acceptance is the Chromium `page.pdf()` matrix in `tests/print/complete-matrix.ts`
(from PR #172). Measurements come only from `tests/print/analyze_pdf.py`
(pdfplumber word/char boxes).

Firefox and WebKit Playwright runs in earlier notes were **print-emulated
screenshots, not real print output**. They are not used as pass/fail here.

## What was wrong

Scaling `html { font-size }` for Extra Large multiplied every Tailwind rem
(padding, `print:!text-4xl`, page-wide `print:!text-xl`). Pages overflowed,
stacked, and crossed the 5.5in fold. Long ward names and performer/speaker
names used `whitespace-nowrap` and ran off the page (already −0.23in on main
for `special-musical-number`).

## What we changed

- Keep `html` at 16px. Scale Large/XL with **pt on glyphs only** (10.5pt / 14pt).
- Each bifold panel is a fixed **5.5in × 8.5in** box, `overflow: hidden`, **0.3in** padding.
- Cover renders once on page 1 right.
- Program and leadership cells wrap (`overflow-wrap: anywhere`).
- Compact the inside-page header so long names stay ≥0.25in from the edge.
- Announcement overflow in Large/XL goes to continuation pages (character budget, no render loop).
- QR sized 1.0–1.5in; profile stub from PR #172 so it actually prints.

## Harness matrix (this branch, 2026-10-25)

`PORT=5180 BRANCH=cursor-print-layout-fixes-f7ea npx tsx complete-matrix.ts`

| Fixture | Mode | margin | QR clean | QR degraded | QR 0.25in | body | heading | clipping | pages | overlap | fold | XL vs N |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| typical | Normal | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 6.5pt ✅ | 27.0pt ✅ | None ✅ | 2 ✅ | None ✅ | None ✅ | — |
| typical | Large | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 10.5pt ✅ | 10.5pt ✅ | None ✅ | 2 ✅ | None ✅ | None ✅ | — |
| typical | Extra Large | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 14.0pt ✅ | 14.0pt ✅ | None ✅ | 2 ✅ | None ✅ | None ✅ | 2.15× ✅ |
| special-musical-number | Normal | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 6.5pt ✅ | 27.0pt ✅ | None ✅ | 2 ✅ | None ✅ | None ✅ | — |
| special-musical-number | Large | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 10.5pt ✅ | 10.5pt ✅ | None ✅ | 2 ✅ | None ✅ | None ✅ | — |
| special-musical-number | Extra Large | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 14.0pt ✅ | 14.0pt ✅ | None ✅ | 2 ✅ | None ✅ | None ✅ | 2.15× ✅ |
| many-announcements | Normal | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 6.5pt ✅ | 27.0pt ✅ | None ✅ | 2 ✅ | None ✅ | None ✅ | — |
| many-announcements | Large | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 10.5pt ✅ | 10.5pt ✅ | None ✅ | 3 ✅ | None ✅ | None ✅ | — |
| many-announcements | Extra Large | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 14.0pt ✅ | 14.0pt ✅ | None ✅ | 3 ✅ | None ✅ | None ✅ | 2.15× ✅ |
| long-names | Normal | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 6.5pt ✅ | 27.0pt ✅ | None ✅ | 2 ✅ | None ✅ | None ✅ | — |
| long-names | Large | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 10.5pt ✅ | 10.5pt ✅ | None ✅ | 2 ✅ | None ✅ | None ✅ | — |
| long-names | Extra Large | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 14.0pt ✅ | 14.0pt ✅ | None ✅ | 2 ✅ | None ✅ | None ✅ | 2.15× ✅ |

All 12 cases pass the acceptance criteria:

- Edge margin ≥ 0.25in (measured 0.30in)
- No clipping, no overlapping text, no fold crossing
- QR found clean and photocopy-degraded, inside 0.25in
- Extra Large body 14.0pt; Large 10.5pt; Normal 6.5pt (same as main, not smaller)

PNG evidence: `tests/print/results/layout/`
