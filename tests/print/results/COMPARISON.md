# Print regression comparison

Generated: 2026-10-25T13:50:13.815Z

Columns are `main | #173 (print-layout-fixes) | #171 (pdf-qr-fixes) | #174 (public-page-performance)`.

Checks use Chromium `page.pdf()` plus pdfplumber word/char boxes. QR photocopy uses ImageMagick `convert … -colorspace Gray -blur 0x0.8 -level 10%,90% -rotate 1.5 -resample 150`, then jsQR/zbarimg.

- **margin in**: smallest edge from any word bbox to the page edge; fail if `< 0.25in`.
- **overlapping text**: fail if any two pdfplumber word bboxes intersect (inset 0.75pt so adjacent words do not count).
- **fold crossing**: fail if any word straddles the 5.5in landscape-Letter fold.
- **XL vs Normal body**: Extra Large min frequent body size (`<14pt`) must be `≥ 1.15×` Normal on the same fixture.

## Fail counts

| Branch | Cases | Failing checks |
|---|---:|---:|
| main | 12 | 21 |
| #173 | 12 | 33 |
| #171 | 12 | 21 |
| #174 | 12 | 21 |

## Full matrix

| Fixture | Mode | Check | main | #173 | #171 | #174 |
|---|---|---|---|---|---|---|
| typical | Normal | margin in | 0.04in ❌ | 0.23in ❌ | 0.04in ❌ | 0.04in ❌ |
| typical | Normal | QR clean | Found ✅ | Found ✅ | Found ✅ | Found ✅ |
| typical | Normal | QR degraded | Pass ✅ | Pass ✅ | Pass ✅ | Pass ✅ |
| typical | Normal | QR inside 0.25in | Inside ✅ | Inside ✅ | Inside ✅ | Inside ✅ |
| typical | Normal | body pt | 6.5pt ✅ | 6.5pt ✅ | 6.5pt ✅ | 6.5pt ✅ |
| typical | Normal | heading pt | 27.0pt ✅ | 27.0pt ✅ | 27.0pt ✅ | 27.0pt ✅ |
| typical | Normal | clipping | None ✅ | None ✅ | None ✅ | None ✅ |
| typical | Normal | pages | 2 ✅ | 2 ✅ | 2 ✅ | 2 ✅ |
| typical | Normal | overlapping text | None ✅ | None ✅ | None ✅ | None ✅ |
| typical | Normal | fold crossing | None ✅ | None ✅ | None ✅ | None ✅ |
| typical | Large | margin in | 0.04in ❌ | -0.30in ❌ | 0.04in ❌ | 0.04in ❌ |
| typical | Large | QR clean | Found ✅ | Found ✅ | Found ✅ | Found ✅ |
| typical | Large | QR degraded | Pass ✅ | Pass ✅ | Pass ✅ | Pass ✅ |
| typical | Large | QR inside 0.25in | Inside ✅ | Inside ✅ | Inside ✅ | Inside ✅ |
| typical | Large | body pt | 7.5pt ✅ | 9.5pt ✅ | 7.5pt ✅ | 7.5pt ✅ |
| typical | Large | heading pt | 27.0pt ✅ | 38.0pt ✅ | 27.0pt ✅ | 27.0pt ✅ |
| typical | Large | clipping | None ✅ | Yes ❌ | None ✅ | None ✅ |
| typical | Large | pages | 2 ✅ | 3 ✅ | 2 ✅ | 2 ✅ |
| typical | Large | overlapping text | None ✅ | None ✅ | None ✅ | None ✅ |
| typical | Large | fold crossing | None ✅ | None ✅ | None ✅ | None ✅ |
| typical | Extra Large | margin in | 0.04in ❌ | -0.29in ❌ | 0.04in ❌ | 0.04in ❌ |
| typical | Extra Large | QR clean | Found ✅ | Found ✅ | Found ✅ | Found ✅ |
| typical | Extra Large | QR degraded | Pass ✅ | Pass ✅ | Pass ✅ | Pass ✅ |
| typical | Extra Large | QR inside 0.25in | Inside ✅ | Inside ✅ | Inside ✅ | Inside ✅ |
| typical | Extra Large | body pt | 8.0pt ✅ | 12.0pt ✅ | 8.0pt ✅ | 8.0pt ✅ |
| typical | Extra Large | heading pt | 27.0pt ✅ | 48.5pt ✅ | 27.0pt ✅ | 27.0pt ✅ |
| typical | Extra Large | clipping | None ✅ | Yes ❌ | None ✅ | None ✅ |
| typical | Extra Large | pages | 2 ✅ | 3 ✅ | 2 ✅ | 2 ✅ |
| typical | Extra Large | overlapping text | None ✅ | 13 overlaps ❌ | None ✅ | None ✅ |
| typical | Extra Large | fold crossing | None ✅ | None ✅ | None ✅ | None ✅ |
| typical | Extra Large | XL vs Normal body | 1.23× ✅ | 1.85× ✅ | 1.23× ✅ | 1.23× ✅ |
| special-musical-number | Normal | margin in | -0.23in ❌ | -0.27in ❌ | -0.23in ❌ | -0.23in ❌ |
| special-musical-number | Normal | QR clean | Found ✅ | Found ✅ | Found ✅ | Found ✅ |
| special-musical-number | Normal | QR degraded | Pass ✅ | Pass ✅ | Pass ✅ | Pass ✅ |
| special-musical-number | Normal | QR inside 0.25in | Inside ✅ | Inside ✅ | Inside ✅ | Inside ✅ |
| special-musical-number | Normal | body pt | 6.5pt ✅ | 6.5pt ✅ | 6.5pt ✅ | 6.5pt ✅ |
| special-musical-number | Normal | heading pt | 27.0pt ✅ | 27.0pt ✅ | 27.0pt ✅ | 27.0pt ✅ |
| special-musical-number | Normal | clipping | Yes ❌ | Yes ❌ | Yes ❌ | Yes ❌ |
| special-musical-number | Normal | pages | 3 ✅ | 3 ✅ | 3 ✅ | 3 ✅ |
| special-musical-number | Normal | overlapping text | None ✅ | None ✅ | None ✅ | None ✅ |
| special-musical-number | Normal | fold crossing | None ✅ | None ✅ | None ✅ | None ✅ |
| special-musical-number | Large | margin in | -0.23in ❌ | -0.46in ❌ | -0.23in ❌ | -0.23in ❌ |
| special-musical-number | Large | QR clean | Found ✅ | Found ✅ | Found ✅ | Found ✅ |
| special-musical-number | Large | QR degraded | Pass ✅ | Pass ✅ | Pass ✅ | Pass ✅ |
| special-musical-number | Large | QR inside 0.25in | Inside ✅ | Inside ✅ | Inside ✅ | Inside ✅ |
| special-musical-number | Large | body pt | 7.5pt ✅ | 9.5pt ✅ | 7.5pt ✅ | 7.5pt ✅ |
| special-musical-number | Large | heading pt | 27.0pt ✅ | 37.0pt ✅ | 27.0pt ✅ | 27.0pt ✅ |
| special-musical-number | Large | clipping | Yes ❌ | Yes ❌ | Yes ❌ | Yes ❌ |
| special-musical-number | Large | pages | 3 ✅ | 3 ✅ | 3 ✅ | 3 ✅ |
| special-musical-number | Large | overlapping text | None ✅ | 10 overlaps ❌ | None ✅ | None ✅ |
| special-musical-number | Large | fold crossing | None ✅ | None ✅ | None ✅ | None ✅ |
| special-musical-number | Extra Large | margin in | -0.23in ❌ | -0.41in ❌ | -0.23in ❌ | -0.23in ❌ |
| special-musical-number | Extra Large | QR clean | Found ✅ | Found ✅ | Found ✅ | Found ✅ |
| special-musical-number | Extra Large | QR degraded | Pass ✅ | Pass ✅ | Pass ✅ | Pass ✅ |
| special-musical-number | Extra Large | QR inside 0.25in | Inside ✅ | Inside ✅ | Inside ✅ | Inside ✅ |
| special-musical-number | Extra Large | body pt | 8.0pt ✅ | 11.0pt ✅ | 8.0pt ✅ | 8.0pt ✅ |
| special-musical-number | Extra Large | heading pt | 27.0pt ✅ | 44.5pt ✅ | 27.0pt ✅ | 27.0pt ✅ |
| special-musical-number | Extra Large | clipping | Yes ❌ | Yes ❌ | Yes ❌ | Yes ❌ |
| special-musical-number | Extra Large | pages | 3 ✅ | 3 ✅ | 3 ✅ | 3 ✅ |
| special-musical-number | Extra Large | overlapping text | None ✅ | 36 overlaps ❌ | None ✅ | None ✅ |
| special-musical-number | Extra Large | fold crossing | None ✅ | 10 words ❌ | None ✅ | None ✅ |
| special-musical-number | Extra Large | XL vs Normal body | 1.23× ✅ | 1.69× ✅ | 1.23× ✅ | 1.23× ✅ |
| many-announcements | Normal | margin in | 0.04in ❌ | 0.23in ❌ | 0.04in ❌ | 0.04in ❌ |
| many-announcements | Normal | QR clean | Found ✅ | Found ✅ | Found ✅ | Found ✅ |
| many-announcements | Normal | QR degraded | Pass ✅ | Pass ✅ | Pass ✅ | Pass ✅ |
| many-announcements | Normal | QR inside 0.25in | Inside ✅ | Inside ✅ | Inside ✅ | Inside ✅ |
| many-announcements | Normal | body pt | 6.5pt ✅ | 6.5pt ✅ | 6.5pt ✅ | 6.5pt ✅ |
| many-announcements | Normal | heading pt | 27.0pt ✅ | 27.0pt ✅ | 27.0pt ✅ | 27.0pt ✅ |
| many-announcements | Normal | clipping | None ✅ | None ✅ | None ✅ | None ✅ |
| many-announcements | Normal | pages | 2 ✅ | 2 ✅ | 2 ✅ | 2 ✅ |
| many-announcements | Normal | overlapping text | None ✅ | None ✅ | None ✅ | None ✅ |
| many-announcements | Normal | fold crossing | None ✅ | None ✅ | None ✅ | None ✅ |
| many-announcements | Large | margin in | 0.04in ❌ | -0.12in ❌ | 0.04in ❌ | 0.04in ❌ |
| many-announcements | Large | QR clean | Found ✅ | Found ✅ | Found ✅ | Found ✅ |
| many-announcements | Large | QR degraded | Pass ✅ | Pass ✅ | Pass ✅ | Pass ✅ |
| many-announcements | Large | QR inside 0.25in | Inside ✅ | Inside ✅ | Inside ✅ | Inside ✅ |
| many-announcements | Large | body pt | 7.5pt ✅ | 9.5pt ✅ | 7.5pt ✅ | 7.5pt ✅ |
| many-announcements | Large | heading pt | 27.0pt ✅ | 38.0pt ✅ | 27.0pt ✅ | 27.0pt ✅ |
| many-announcements | Large | clipping | None ✅ | Yes ❌ | None ✅ | None ✅ |
| many-announcements | Large | pages | 2 ✅ | 3 ✅ | 2 ✅ | 2 ✅ |
| many-announcements | Large | overlapping text | None ✅ | None ✅ | None ✅ | None ✅ |
| many-announcements | Large | fold crossing | None ✅ | 2 words ❌ | None ✅ | None ✅ |
| many-announcements | Extra Large | margin in | 0.04in ❌ | -0.49in ❌ | 0.04in ❌ | 0.04in ❌ |
| many-announcements | Extra Large | QR clean | Found ✅ | Found ✅ | Found ✅ | Found ✅ |
| many-announcements | Extra Large | QR degraded | Pass ✅ | Pass ✅ | Pass ✅ | Pass ✅ |
| many-announcements | Extra Large | QR inside 0.25in | Inside ✅ | Inside ✅ | Inside ✅ | Inside ✅ |
| many-announcements | Extra Large | body pt | 8.0pt ✅ | 12.0pt ✅ | 8.0pt ✅ | 8.0pt ✅ |
| many-announcements | Extra Large | heading pt | 27.0pt ✅ | 48.5pt ✅ | 27.0pt ✅ | 27.0pt ✅ |
| many-announcements | Extra Large | clipping | None ✅ | Yes ❌ | None ✅ | None ✅ |
| many-announcements | Extra Large | pages | 2 ✅ | 3 ✅ | 2 ✅ | 2 ✅ |
| many-announcements | Extra Large | overlapping text | None ✅ | 5 overlaps ❌ | None ✅ | None ✅ |
| many-announcements | Extra Large | fold crossing | None ✅ | 4 words ❌ | None ✅ | None ✅ |
| many-announcements | Extra Large | XL vs Normal body | 1.23× ✅ | 1.85× ✅ | 1.23× ✅ | 1.23× ✅ |
| long-names | Normal | margin in | -0.01in ❌ | -0.20in ❌ | -0.01in ❌ | -0.01in ❌ |
| long-names | Normal | QR clean | Found ✅ | Found ✅ | Found ✅ | Found ✅ |
| long-names | Normal | QR degraded | Fail ❌ | Pass ✅ | Fail ❌ | Fail ❌ |
| long-names | Normal | QR inside 0.25in | Outside ❌ | Inside ✅ | Outside ❌ | Outside ❌ |
| long-names | Normal | body pt | 6.5pt ✅ | 6.5pt ✅ | 6.5pt ✅ | 6.5pt ✅ |
| long-names | Normal | heading pt | 27.0pt ✅ | 27.0pt ✅ | 27.0pt ✅ | 27.0pt ✅ |
| long-names | Normal | clipping | None ✅ | Yes ❌ | None ✅ | None ✅ |
| long-names | Normal | pages | 3 ✅ | 3 ✅ | 3 ✅ | 3 ✅ |
| long-names | Normal | overlapping text | None ✅ | None ✅ | None ✅ | None ✅ |
| long-names | Normal | fold crossing | None ✅ | None ✅ | None ✅ | None ✅ |
| long-names | Large | margin in | -0.01in ❌ | -0.41in ❌ | -0.01in ❌ | -0.01in ❌ |
| long-names | Large | QR clean | Found ✅ | Found ✅ | Found ✅ | Found ✅ |
| long-names | Large | QR degraded | Fail ❌ | Pass ✅ | Fail ❌ | Fail ❌ |
| long-names | Large | QR inside 0.25in | Outside ❌ | Inside ✅ | Outside ❌ | Outside ❌ |
| long-names | Large | body pt | 7.5pt ✅ | 9.0pt ✅ | 7.5pt ✅ | 7.5pt ✅ |
| long-names | Large | heading pt | 27.0pt ✅ | 34.0pt ✅ | 27.0pt ✅ | 27.0pt ✅ |
| long-names | Large | clipping | None ✅ | Yes ❌ | None ✅ | None ✅ |
| long-names | Large | pages | 3 ✅ | 3 ✅ | 3 ✅ | 3 ✅ |
| long-names | Large | overlapping text | None ✅ | 17 overlaps ❌ | None ✅ | None ✅ |
| long-names | Large | fold crossing | None ✅ | 7 words ❌ | None ✅ | None ✅ |
| long-names | Extra Large | margin in | -0.01in ❌ | -0.15in ❌ | -0.01in ❌ | -0.01in ❌ |
| long-names | Extra Large | QR clean | Found ✅ | Found ✅ | Found ✅ | Found ✅ |
| long-names | Extra Large | QR degraded | Fail ❌ | Pass ✅ | Fail ❌ | Fail ❌ |
| long-names | Extra Large | QR inside 0.25in | Outside ❌ | Inside ✅ | Outside ❌ | Outside ❌ |
| long-names | Extra Large | body pt | 8.0pt ✅ | 10.0pt ✅ | 8.0pt ✅ | 8.0pt ✅ |
| long-names | Extra Large | heading pt | 27.0pt ✅ | 40.0pt ✅ | 27.0pt ✅ | 27.0pt ✅ |
| long-names | Extra Large | clipping | None ✅ | Yes ❌ | None ✅ | None ✅ |
| long-names | Extra Large | pages | 3 ✅ | 3 ✅ | 3 ✅ | 3 ✅ |
| long-names | Extra Large | overlapping text | None ✅ | 34 overlaps ❌ | None ✅ | None ✅ |
| long-names | Extra Large | fold crossing | None ✅ | 16 words ❌ | None ✅ | None ✅ |
| long-names | Extra Large | XL vs Normal body | 1.23× ✅ | 1.54× ✅ | 1.23× ✅ | 1.23× ✅ |
