#!/usr/bin/env python3
"""Extract print-regression measurements from a Chromium print PDF via pdfplumber."""
from __future__ import annotations

import json
import statistics
import sys
from typing import Any

import pdfplumber

FOLD_PT = 5.5 * 72.0
MARGIN_PT = 0.25 * 72.0
# Shared edges of adjacent words should not count as overlaps.
OVERLAP_PAD_PT = 0.75
# Ignore hairline fold grazes (rules, ornaments).
FOLD_PAD_PT = 2.0


def _boxes_overlap(a: dict, b: dict, pad: float = OVERLAP_PAD_PT) -> bool:
    return (
        a["x0"] + pad < b["x1"] - pad
        and a["x1"] - pad > b["x0"] + pad
        and a["top"] + pad < b["bottom"] - pad
        and a["bottom"] - pad > b["top"] + pad
    )


def _intersection_area(a: dict, b: dict) -> float:
    x0 = max(a["x0"], b["x0"])
    x1 = min(a["x1"], b["x1"])
    y0 = max(a["top"], b["top"])
    y1 = min(a["bottom"], b["bottom"])
    if x1 <= x0 or y1 <= y0:
        return 0.0
    return (x1 - x0) * (y1 - y0)


def _classify_sizes(sizes: list[float]) -> dict[str, float]:
    if not sizes:
        return {
            "body_pt": 0.0,
            "heading_pt": 0.0,
            "body_median_pt": 0.0,
            "heading_median_pt": 0.0,
            "max_pt": 0.0,
        }

    rounded = [round(s * 2) / 2 for s in sizes if 4.0 <= s <= 80.0]
    if not rounded:
        return {
            "body_pt": 0.0,
            "heading_pt": 0.0,
            "body_median_pt": 0.0,
            "heading_median_pt": 0.0,
            "max_pt": 0.0,
        }

    max_pt = max(rounded)
    # Headings are the largest character sizes (ward name / section titles).
    heading_cut = max(14.0, max_pt * 0.7)
    headings = [s for s in rounded if s >= heading_cut]
    bodies = [s for s in rounded if s < heading_cut]

    # If almost everything is "heading", treat the modal size as body.
    if not bodies:
        bodies = [s for s in rounded if s <= statistics.median(rounded)]
        headings = [s for s in rounded if s > statistics.median(rounded)] or [max_pt]

    return {
        "body_pt": min(bodies) if bodies else 0.0,
        "heading_pt": min(headings) if headings else max_pt,
        "body_median_pt": statistics.median(bodies) if bodies else 0.0,
        "heading_median_pt": statistics.median(headings) if headings else max_pt,
        "max_pt": max_pt,
    }


def analyze(pdf_path: str) -> dict[str, Any]:
    overlaps: list[dict[str, Any]] = []
    fold_crosses: list[dict[str, Any]] = []
    all_sizes: list[float] = []
    min_edge_pt: float | None = None
    clipped = False
    word_count = 0
    page_count = 0

    with pdfplumber.open(pdf_path) as pdf:
        page_count = len(pdf.pages)
        for index, page in enumerate(pdf.pages):
            width, height = float(page.width), float(page.height)
            chars = page.chars or []
            for char in chars:
                size = char.get("size")
                if isinstance(size, (int, float)) and 4.0 <= size <= 80.0:
                    all_sizes.append(float(size))

            try:
                words = page.extract_words(extra_attrs=["size", "fontname"]) or []
            except TypeError:
                words = page.extract_words() or []

            usable = [
                w
                for w in words
                if str(w.get("text", "")).strip() and (w["x1"] - w["x0"]) > 1.0
            ]
            word_count += len(usable)

            if usable:
                x0 = min(w["x0"] for w in usable)
                y0 = min(w["top"] for w in usable)
                x1 = max(w["x1"] for w in usable)
                y1 = max(w["bottom"] for w in usable)
                edges = [x0, y0, width - x1, height - y1]
                edge = min(edges)
                min_edge_pt = edge if min_edge_pt is None else min(min_edge_pt, edge)
                if x1 > width + 1.5 or y1 > height + 1.5 or x0 < -1.5 or y0 < -1.5:
                    clipped = True

            for i, a in enumerate(usable):
                if a["x0"] < FOLD_PT - FOLD_PAD_PT and a["x1"] > FOLD_PT + FOLD_PAD_PT:
                    fold_crosses.append(
                        {
                            "page": index + 1,
                            "text": a["text"],
                            "x0": round(a["x0"], 2),
                            "x1": round(a["x1"], 2),
                        }
                    )
                for b in usable[i + 1 :]:
                    if not _boxes_overlap(a, b):
                        continue
                    area = _intersection_area(a, b)
                    if area < 2.0:
                        continue
                    overlaps.append(
                        {
                            "page": index + 1,
                            "a": a["text"],
                            "b": b["text"],
                            "area": round(area, 2),
                        }
                    )

    fonts = _classify_sizes(all_sizes)
    margin_in = (min_edge_pt / 72.0) if min_edge_pt is not None else None

    return {
        "pages": page_count,
        "word_count": word_count,
        "margin_in": None if margin_in is None else round(margin_in, 3),
        "margin_pass": margin_in is not None and margin_in >= 0.25,
        "body_pt": round(fonts["body_pt"], 2),
        "heading_pt": round(fonts["heading_pt"], 2),
        "body_median_pt": round(fonts["body_median_pt"], 2),
        "heading_median_pt": round(fonts["heading_median_pt"], 2),
        "max_pt": round(fonts["max_pt"], 2),
        "clipping": clipped,
        "overlap_count": len(overlaps),
        "overlap_samples": overlaps[:8],
        "fold_cross_count": len(fold_crosses),
        "fold_samples": fold_crosses[:8],
        "unique_sizes": sorted({round(s * 2) / 2 for s in all_sizes}),
    }


def main() -> None:
    if len(sys.argv) < 2:
        print("usage: analyze_pdf.py <pdf> [json-out]", file=sys.stderr)
        sys.exit(2)
    result = analyze(sys.argv[1])
    blob = json.dumps(result, indent=2)
    if len(sys.argv) >= 3:
        with open(sys.argv[3 - 1], "w", encoding="utf-8") as fh:
            fh.write(blob)
    print(blob)


if __name__ == "__main__":
    main()
