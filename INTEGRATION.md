# Integration verification: #172 → #173 → #171 → #174

Branch: `cursor/print-integration-172-173-171-174-d5a3`  
Pushed for inspection only. **No PR. Do not merge to main.**

## Recommended merge order

1. **#172 (harness)** — measurement only; safe first.
2. **#173 (print layout)** — one-sheet bifold + booklet. This is the layout source of truth.
3. **#171 (PDF/QR)** — `handleExportPDF` is `window.print()`, so after #173 it exports the same one-sheet vector PDF.
4. **#174 (public-page perf)** — public `/ :slug` split, PWA, chunking. Last so print/PDF conflicts stay small.

Do not merge #171 before #173 if the goal is a one-sheet export: #171 alone still prints the old multi-page layout.

## Conflicts and resolutions

### #172 + #173
| File | Resolution |
|---|---|
| `.gitignore` | Keep #172 exceptions (`COMPARISON.md`, `artifacts/`) and #173 `tests/print/output/`. |
| `tests/print/.gitignore` | Ignore `results/*/` and logs; do not ignore `*.png` globally (artifacts must stay). |
| `tests/print/package.json` | `npm test` → `tsx complete-matrix.ts`. |
| `tests/print/README.md` | #173 bifold/booklet docs. |
| `vite.config.ts` | Keep print-test stub plugin + `hmr: false` in `VITE_PRINT_TEST`. |

Auto-merged: `BulletinPrintLayout`, `PrintPreviewModal`, `printPagination.ts`, print CSS.

### #173 + #171
| File | Resolution |
|---|---|
| `PrintPreviewModal.tsx` | Keep #173 booklet / omit-plan UI. Keep #171 Save-as-PDF tooltip and vector print tips. |
| `src/i18n/locales/en.json` | Union booklet keys + vector PDF tip keys. |

Auto-merged: `EditorApp.tsx` / `BaptismEditor.tsx` (`window.print()` instead of html2canvas).

### #171 + #174
| File | Resolution |
|---|---|
| `src/App.tsx` | Keep `/print-test`. Use #174 `PublicBulletinReload` for `/:slug`. |
| `vite.config.ts` | #174 PWA + public chunking **plus** print-test stub and `print-test.html` input. |
| `package-lock.json` | Regenerated from the merged `package.json`. |

## Combined-branch verification

| Check | Result |
|---|---|
| `npm run build` | pass (7.12s) |
| `npm test` (vitest) | 10 files / 69 tests pass |
| Print harness (17 cases) | **17/17 PASS** |
| Extra Large body vs Normal | **1.75×** (14pt / 8pt) |
| Default pages | **2** (one duplex sheet) |
| Booklet Extra Large | **4** pages (two nested sheets) |

## #171 export vs #173 print (combined)

`handleExportPDF` calls `window.print()`. Playwright `page.pdf()` is the same print stylesheet.

| Check | Combined Extra Large bishops-exact-case |
|---|---|
| Path | `window.print()` / Chromium print PDF |
| Page size | **792 × 612 pt** (11×8.5 landscape) |
| Pages | **2** |
| Text | **Vector** (embedded Noto Sans TrueType; 269 words) |
| Blur / html2canvas | **None** (no raster page images) |
| Overlap | 0 |
| Fold crossing | 0 |
| QR clean | Found |
| QR degraded (ImageMagick photocopy) | Pass |
| Body / heading | 14pt / 36pt |

PNGs: `tests/print/results/artifacts/combined-bishops-exact-case-ExtraLarge-page-1.png` and `page-2.png`.

## Before (main) vs after (combined)

bishops-exact-case Extra Large, plus typical Extra Large for scale.

| Check | main | combined |
|---|---|---|
| pages | 2 (typical) / 3 (long-names, musical) | **2** single; **4** booklet |
| margin | 0.04in / −0.23in ❌ | **≥ 0.25in** ✅ |
| overlapping text | None | None |
| fold crossing | None | None |
| completeness | fail on dense fixtures | **pass** |
| region body Extra Large | program 12 / leadership 9 ❌ | **14pt all regions** ✅ |
| XL vs Normal body | 1.00× or 0.83× ❌ | **1.75×** ✅ |
| QR clean / degraded | Found / fail on long-names | **Found / Pass** |
| clipping | Yes on bishop + musical | **None** |
| print harness | 68 failing checks / 17 cases | **0 failing / 17 cases** |
