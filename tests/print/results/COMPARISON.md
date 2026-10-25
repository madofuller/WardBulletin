# Print Regression Test Results - Full Matrix

Date: 2026-10-25T07:23:29.794Z

## Summary

- Branches tested: main, print-layout-fixes-f7ea, pdf-qr-fixes-aaec, public-page-performance-e836, print-regression-harness-d5a3
- Fixtures: 4
- Font modes: 3
- Total tests: 12

## Comparison Table

| Fixture | Mode | Check | main | print-layout-fixes-f7ea | pdf-qr-fixes-aaec | public-page-performance-e836 | print-regression-harness-d5a3 |
|---------|------|-------|--------|--------|--------|--------|--------|
| Typical | Normal | clipping | — | — | — | — | — |
| Typical | Normal | content_pct | — | — | — | — | ✅ 2.9% |
| Typical | Normal | error | — | — | — | — | ❌ [
  {
    "code": "invalid_union",
    "unionErrors": [
      {
        "issues": [
          {
            "code": "invalid_type",
            "expected": "object",
            "received": "number",
 |
| Typical | Normal | margins | — | — | — | — | ❌ 0.17in (< 0.25in) ([png](results/cursor-print-regression-harness-d5a3_typical_Normal/page-1.png)) |
| Typical | Normal | min_body_pt | — | — | — | — | ✅ 4.0pt |
| Typical | Normal | min_heading_pt | — | — | — | — | ✅ 14.0pt |
| Typical | Normal | page_count | — | — | — | — | ✅ 2 pages |
| Typical | Normal | pdf_size | — | — | — | — | ✅ 53.3KB |
| Typical | Normal | qr_p1_clean | — | — | — | — | ✅ https://mwbltn.com/test-ward |
| Typical | Normal | qr_p2_clean | — | — | — | — | — |
| Typical | Normal | text_content | — | — | — | — | — |
| Typical | Large | clipping | — | — | — | — | — |
| Typical | Large | content_pct | — | — | — | — | ✅ 2.9% |
| Typical | Large | error | — | — | — | — | ❌ [
  {
    "code": "invalid_union",
    "unionErrors": [
      {
        "issues": [
          {
            "code": "invalid_type",
            "expected": "object",
            "received": "number",
 |
| Typical | Large | margins | — | — | — | — | ❌ 0.17in (< 0.25in) ([png](results/cursor-print-regression-harness-d5a3_typical_Large/page-1.png)) |
| Typical | Large | min_body_pt | — | — | — | — | ✅ 4.0pt |
| Typical | Large | min_heading_pt | — | — | — | — | ✅ 14.0pt |
| Typical | Large | page_count | — | — | — | — | ✅ 2 pages |
| Typical | Large | pdf_size | — | — | — | — | ✅ 53.3KB |
| Typical | Large | qr_p1_clean | — | — | — | — | ✅ https://mwbltn.com/test-ward |
| Typical | Large | qr_p2_clean | — | — | — | — | — |
| Typical | Large | text_content | — | — | — | — | — |
| Typical | Extra Large | clipping | — | — | — | — | — |
| Typical | Extra Large | content_pct | — | — | — | — | ✅ 2.9% |
| Typical | Extra Large | error | — | — | — | — | ❌ [
  {
    "code": "invalid_union",
    "unionErrors": [
      {
        "issues": [
          {
            "code": "invalid_type",
            "expected": "object",
            "received": "number",
 |
| Typical | Extra Large | margins | — | — | — | — | ❌ 0.17in (< 0.25in) ([png](results/cursor-print-regression-harness-d5a3_typical_ExtraLarge/page-1.png)) |
| Typical | Extra Large | min_body_pt | — | — | — | — | ✅ 4.0pt |
| Typical | Extra Large | min_heading_pt | — | — | — | — | ✅ 14.0pt |
| Typical | Extra Large | page_count | — | — | — | — | ✅ 2 pages |
| Typical | Extra Large | pdf_size | — | — | — | — | ✅ 53.5KB |
| Typical | Extra Large | qr_p1_clean | — | — | — | — | ✅ https://mwbltn.com/test-ward |
| Typical | Extra Large | qr_p2_clean | — | — | — | — | — |
| Typical | Extra Large | text_content | — | — | — | — | — |
| Bishop Case (Mu | Normal | clipping | — | — | — | — | ✅ No clipping |
| Bishop Case (Mu | Normal | content_pct | — | — | — | — | ✅ 1.3% |
| Bishop Case (Mu | Normal | error | — | — | — | — | — |
| Bishop Case (Mu | Normal | margins | — | — | — | — | ❌ 0.17in (< 0.25in) ([png](results/cursor-print-regression-harness-d5a3_special-musical-number_Normal/page-1.png)) |
| Bishop Case (Mu | Normal | min_body_pt | — | — | — | — | ✅ 4.0pt |
| Bishop Case (Mu | Normal | min_heading_pt | — | — | — | — | ❌ No headings found |
| Bishop Case (Mu | Normal | page_count | — | — | — | — | ✅ 2 pages |
| Bishop Case (Mu | Normal | pdf_size | — | — | — | — | ✅ 44.4KB |
| Bishop Case (Mu | Normal | qr_p1_clean | — | — | — | — | ✅ Not rendered (OK) |
| Bishop Case (Mu | Normal | qr_p2_clean | — | — | — | — | ✅ Not rendered (OK) |
| Bishop Case (Mu | Normal | text_content | — | — | — | — | ✅ 791 chars |
| Bishop Case (Mu | Large | clipping | — | — | — | — | ✅ No clipping |
| Bishop Case (Mu | Large | content_pct | — | — | — | — | ✅ 1.3% |
| Bishop Case (Mu | Large | error | — | — | — | — | — |
| Bishop Case (Mu | Large | margins | — | — | — | — | ❌ 0.17in (< 0.25in) ([png](results/cursor-print-regression-harness-d5a3_special-musical-number_Large/page-1.png)) |
| Bishop Case (Mu | Large | min_body_pt | — | — | — | — | ✅ 4.0pt |
| Bishop Case (Mu | Large | min_heading_pt | — | — | — | — | ❌ No headings found |
| Bishop Case (Mu | Large | page_count | — | — | — | — | ✅ 2 pages |
| Bishop Case (Mu | Large | pdf_size | — | — | — | — | ✅ 44.4KB |
| Bishop Case (Mu | Large | qr_p1_clean | — | — | — | — | ✅ Not rendered (OK) |
| Bishop Case (Mu | Large | qr_p2_clean | — | — | — | — | ✅ Not rendered (OK) |
| Bishop Case (Mu | Large | text_content | — | — | — | — | ✅ 791 chars |
| Bishop Case (Mu | Extra Large | clipping | — | — | — | — | ✅ No clipping |
| Bishop Case (Mu | Extra Large | content_pct | — | — | — | — | ✅ 1.3% |
| Bishop Case (Mu | Extra Large | error | — | — | — | — | — |
| Bishop Case (Mu | Extra Large | margins | — | — | — | — | ❌ 0.17in (< 0.25in) ([png](results/cursor-print-regression-harness-d5a3_special-musical-number_ExtraLarge/page-1.png)) |
| Bishop Case (Mu | Extra Large | min_body_pt | — | — | — | — | ✅ 4.0pt |
| Bishop Case (Mu | Extra Large | min_heading_pt | — | — | — | — | ❌ No headings found |
| Bishop Case (Mu | Extra Large | page_count | — | — | — | — | ✅ 2 pages |
| Bishop Case (Mu | Extra Large | pdf_size | — | — | — | — | ✅ 44.4KB |
| Bishop Case (Mu | Extra Large | qr_p1_clean | — | — | — | — | ✅ Not rendered (OK) |
| Bishop Case (Mu | Extra Large | qr_p2_clean | — | — | — | — | ✅ Not rendered (OK) |
| Bishop Case (Mu | Extra Large | text_content | — | — | — | — | ✅ 791 chars |
| Many Announceme | Normal | clipping | — | — | — | — | ✅ No clipping |
| Many Announceme | Normal | content_pct | — | — | — | — | ✅ 0.8% |
| Many Announceme | Normal | error | — | — | — | — | — |
| Many Announceme | Normal | margins | — | — | — | — | ❌ 0.13in (< 0.25in) ([png](results/cursor-print-regression-harness-d5a3_many-announcements_Normal/page-1.png)) |
| Many Announceme | Normal | min_body_pt | — | — | — | — | ✅ 4.0pt |
| Many Announceme | Normal | min_heading_pt | — | — | — | — | ❌ No headings found |
| Many Announceme | Normal | page_count | — | — | — | — | ✅ 2 pages |
| Many Announceme | Normal | pdf_size | — | — | — | — | ✅ 53.8KB |
| Many Announceme | Normal | qr_p1_clean | — | — | — | — | ✅ Not rendered (OK) |
| Many Announceme | Normal | qr_p2_clean | — | — | — | — | ✅ Not rendered (OK) |
| Many Announceme | Normal | text_content | — | — | — | — | ✅ 3124 chars |
| Many Announceme | Large | clipping | — | — | — | — | ✅ No clipping |
| Many Announceme | Large | content_pct | — | — | — | — | ✅ 0.8% |
| Many Announceme | Large | error | — | — | — | — | — |
| Many Announceme | Large | margins | — | — | — | — | ❌ 0.13in (< 0.25in) ([png](results/cursor-print-regression-harness-d5a3_many-announcements_Large/page-1.png)) |
| Many Announceme | Large | min_body_pt | — | — | — | — | ✅ 4.0pt |
| Many Announceme | Large | min_heading_pt | — | — | — | — | ❌ No headings found |
| Many Announceme | Large | page_count | — | — | — | — | ✅ 2 pages |
| Many Announceme | Large | pdf_size | — | — | — | — | ✅ 54.3KB |
| Many Announceme | Large | qr_p1_clean | — | — | — | — | ✅ Not rendered (OK) |
| Many Announceme | Large | qr_p2_clean | — | — | — | — | ✅ Not rendered (OK) |
| Many Announceme | Large | text_content | — | — | — | — | ✅ 3132 chars |
| Many Announceme | Extra Large | clipping | — | — | — | — | ✅ No clipping |
| Many Announceme | Extra Large | content_pct | — | — | — | — | ✅ 0.8% |
| Many Announceme | Extra Large | error | — | — | — | — | — |
| Many Announceme | Extra Large | margins | — | — | — | — | ❌ 0.13in (< 0.25in) ([png](results/cursor-print-regression-harness-d5a3_many-announcements_ExtraLarge/page-1.png)) |
| Many Announceme | Extra Large | min_body_pt | — | — | — | — | ✅ 4.0pt |
| Many Announceme | Extra Large | min_heading_pt | — | — | — | — | ❌ No headings found |
| Many Announceme | Extra Large | page_count | — | — | — | — | ✅ 2 pages |
| Many Announceme | Extra Large | pdf_size | — | — | — | — | ✅ 54.2KB |
| Many Announceme | Extra Large | qr_p1_clean | — | — | — | — | ✅ Not rendered (OK) |
| Many Announceme | Extra Large | qr_p2_clean | — | — | — | — | ✅ Not rendered (OK) |
| Many Announceme | Extra Large | text_content | — | — | — | — | ✅ 3136 chars |
| Long Names | Normal | clipping | — | — | — | — | ✅ No clipping |
| Long Names | Normal | content_pct | — | — | — | — | ✅ 3.6% |
| Long Names | Normal | error | — | — | — | — | — |
| Long Names | Normal | margins | — | — | — | — | ❌ 0.17in (< 0.25in) ([png](results/cursor-print-regression-harness-d5a3_long-names_Normal/page-1.png)) |
| Long Names | Normal | min_body_pt | — | — | — | — | ✅ 4.0pt |
| Long Names | Normal | min_heading_pt | — | — | — | — | ❌ No headings found |
| Long Names | Normal | page_count | — | — | — | — | ✅ 3 pages |
| Long Names | Normal | pdf_size | — | — | — | — | ✅ 48.9KB |
| Long Names | Normal | qr_p1_clean | — | — | — | — | ✅ Not rendered (OK) |
| Long Names | Normal | qr_p2_clean | — | — | — | — | ✅ Not rendered (OK) |
| Long Names | Normal | text_content | — | — | — | — | ✅ 1370 chars |
| Long Names | Large | clipping | — | — | — | — | ✅ No clipping |
| Long Names | Large | content_pct | — | — | — | — | ✅ 3.6% |
| Long Names | Large | error | — | — | — | — | — |
| Long Names | Large | margins | — | — | — | — | ❌ 0.17in (< 0.25in) ([png](results/cursor-print-regression-harness-d5a3_long-names_Large/page-1.png)) |
| Long Names | Large | min_body_pt | — | — | — | — | ✅ 4.0pt |
| Long Names | Large | min_heading_pt | — | — | — | — | ❌ No headings found |
| Long Names | Large | page_count | — | — | — | — | ✅ 3 pages |
| Long Names | Large | pdf_size | — | — | — | — | ✅ 48.9KB |
| Long Names | Large | qr_p1_clean | — | — | — | — | ✅ Not rendered (OK) |
| Long Names | Large | qr_p2_clean | — | — | — | — | ✅ Not rendered (OK) |
| Long Names | Large | text_content | — | — | — | — | ✅ 1370 chars |
| Long Names | Extra Large | clipping | — | — | — | — | ✅ No clipping |
| Long Names | Extra Large | content_pct | — | — | — | — | ✅ 3.6% |
| Long Names | Extra Large | error | — | — | — | — | — |
| Long Names | Extra Large | margins | — | — | — | — | ❌ 0.17in (< 0.25in) ([png](results/cursor-print-regression-harness-d5a3_long-names_ExtraLarge/page-1.png)) |
| Long Names | Extra Large | min_body_pt | — | — | — | — | ✅ 4.0pt |
| Long Names | Extra Large | min_heading_pt | — | — | — | — | ❌ No headings found |
| Long Names | Extra Large | page_count | — | — | — | — | ✅ 3 pages |
| Long Names | Extra Large | pdf_size | — | — | — | — | ✅ 48.9KB |
| Long Names | Extra Large | qr_p1_clean | — | — | — | — | ✅ Not rendered (OK) |
| Long Names | Extra Large | qr_p2_clean | — | — | — | — | ✅ Not rendered (OK) |
| Long Names | Extra Large | text_content | — | — | — | — | ✅ 1370 chars |
