# Print layout notes (PR #173)

Acceptance is the Chromium `page.pdf()` matrix in `tests/print/complete-matrix.ts`
(from PR #172, plus completeness / per-region font / heading-size checks).
Measurements come only from `tests/print/analyze_pdf.py`.

Firefox and WebKit Playwright runs in earlier notes were **print-emulated
screenshots, not real print output**. They are not used as pass/fail here.

## What was wrong

Scaling `html { font-size }` for Extra Large multiplied every Tailwind rem.
A later blanket `:not()` font-size rule was more specific than `h1`/`h2`, so
headings collapsed to body size. Extra Large only enlarged announcements
(`scalePx`); cover, leadership and program stayed at Normal size.

Announcements used a character budget plus `overflow: hidden`, which silently
truncated text (Ward Christmas Party never finished). The default “Ward”
audience rule sat under the panel title.

## What we changed

- Keep `html` at 16px. Scale Large/XL with **pt on glyphs by region**.
- Extra Large: body 14pt (program, leadership, announcements), headings 18pt, cover name 36pt.
- Large: body 10.5pt, headings 14pt, cover name 30pt.
- Headings stay larger than body in every mode.
- Announcements never clip: pack by height and split at a word boundary, or move the whole item to the next page.
- Program overflow continues with a “(continued)” header.
- Default unit audience header (“Ward”) is not printed.

## Harness matrix (this branch, 2026-10-25)

`PORT=5180 BRANCH=cursor-print-layout-fixes-f7ea npx tsx complete-matrix.ts`

| Fixture | Mode | margin | QR clean | QR deg | QR 0.25 | body | heading | h>b | region | complete | clip | pages | overlap | fold | XL vs N |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| typical | Normal | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 15.0pt ✅ | 27.0pt ✅ | 27.0>15.0 ✅ | l9 c27 a15 p15 ✅ | 30 fields ✅ | None ✅ | 2 ✅ | None ✅ | None ✅ | — |
| typical | Large | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 10.5pt ✅ | 30.0pt ✅ | 30.0>10.5 ✅ | l14 c30 a14 p14 ✅ | 30 fields ✅ | None ✅ | 2 ✅ | None ✅ | None ✅ | — |
| typical | Extra Large | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 14.0pt ✅ | 36.0pt ✅ | 36.0>14.0 ✅ | l14 c36 a14 p14 ✅ | 30 fields ✅ | None ✅ | 3 ✅ | None ✅ | None ✅ | 0.93× ✅ |
| special-musical-number | Normal | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 12.0pt ✅ | 27.0pt ✅ | 27.0>12.0 ✅ | l9 c27 a15 p15 ✅ | 21 fields ✅ | None ✅ | 2 ✅ | None ✅ | None ✅ | — |
| special-musical-number | Large | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 10.5pt ✅ | 30.0pt ✅ | 30.0>10.5 ✅ | l11 c30 a14 p14 ✅ | 21 fields ✅ | None ✅ | 2 ✅ | None ✅ | None ✅ | — |
| special-musical-number | Extra Large | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 14.0pt ✅ | 36.0pt ✅ | 36.0>14.0 ✅ | l14 c36 a14 p14 ✅ | 21 fields ✅ | None ✅ | 3 ✅ | None ✅ | None ✅ | 1.17× ✅ |
| many-announcements | Normal | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 10.5pt ✅ | 27.0pt ✅ | 27.0>10.5 ✅ | c27 a11 p15 ✅ | 43 fields ✅ | None ✅ | 4 ✅ | None ✅ | None ✅ | — |
| many-announcements | Large | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 10.5pt ✅ | 30.0pt ✅ | 30.0>10.5 ✅ | c30 a14 p14 ✅ | 43 fields ✅ | None ✅ | 5 ✅ | None ✅ | None ✅ | — |
| many-announcements | Extra Large | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 14.0pt ✅ | 36.0pt ✅ | 36.0>14.0 ✅ | c36 a14 p14 ✅ | 43 fields ✅ | None ✅ | 7 ✅ | None ✅ | None ✅ | 1.33× ✅ |
| long-names | Normal | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 12.0pt ✅ | 27.0pt ✅ | 27.0>12.0 ✅ | l9 c27 a15 p15 ✅ | 23 fields ✅ | None ✅ | 2 ✅ | None ✅ | None ✅ | — |
| long-names | Large | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 10.5pt ✅ | 30.0pt ✅ | 30.0>10.5 ✅ | l11 c30 a14 p14 ✅ | 23 fields ✅ | None ✅ | 3 ✅ | None ✅ | None ✅ | — |
| long-names | Extra Large | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 14.0pt ✅ | 36.0pt ✅ | 36.0>14.0 ✅ | l14 c36 a14 p14 ✅ | 23 fields ✅ | None ✅ | 3 ✅ | None ✅ | None ✅ | 1.17× ✅ |
| bishops-exact-case | Normal | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 15.0pt ✅ | 27.0pt ✅ | 27.0>15.0 ✅ | l9 c27 a15 p15 ✅ | 34 fields ✅ | None ✅ | 2 ✅ | None ✅ | None ✅ | — |
| bishops-exact-case | Large | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 10.5pt ✅ | 30.0pt ✅ | 30.0>10.5 ✅ | l11 c30 a14 p14 ✅ | 34 fields ✅ | None ✅ | 3 ✅ | None ✅ | None ✅ | — |
| bishops-exact-case | Extra Large | 0.30in ✅ | Found ✅ | Pass ✅ | Inside ✅ | 14.0pt ✅ | 36.0pt ✅ | 36.0>14.0 ✅ | l14 c36 a14 p14 ✅ | 34 fields ✅ | None ✅ | 3 ✅ | None ✅ | None ✅ | 0.93× ✅ |

All 15 cases pass:

- Edge margin ≥ 0.25in (measured 0.30in)
- No clipping, no overlapping text, no fold crossing
- QR found clean and photocopy-degraded, inside 0.25in
- Extra Large body 14pt on program, announcements, leadership and cover name; Large ≥ 10pt; Normal ≥ main
- Heading pt > body pt
- Every fixture field appears in the PDF text, in order

PNG evidence: `tests/print/results/layout/`
