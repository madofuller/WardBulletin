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

    from collections import Counter

    rounded = [round(s * 2) / 2 for s in sizes if 4.0 <= s <= 80.0]
    if not rounded:
        return {
            "body_pt": 0.0,
            "heading_pt": 0.0,
            "body_median_pt": 0.0,
            "heading_median_pt": 0.0,
            "max_pt": 0.0,
        }

    counts = Counter(rounded)
    # Ignore 1–2 glyph artifacts when picking min/max.
    frequent = sorted(size for size, n in counts.items() if n >= 8) or sorted(counts)
    max_pt = max(frequent)
    heading_pt = max_pt
    body_candidates = [size for size in frequent if size < heading_pt - 0.4]
    if not body_candidates:
        # Single-size page: treat the mode as body; heading check will fail.
        body_pt = counts.most_common(1)[0][0]
    else:
        # Modal size in the body cluster (not the smallest caption).
        body_counts = Counter(s for s in rounded if s in set(body_candidates) and s >= 6.0)
        body_pt = body_counts.most_common(1)[0][0] if body_counts else min(body_candidates)
    bodies = [size for size in rounded if size <= body_pt + 0.6] or rounded
    headings = [size for size in rounded if size >= heading_pt - 0.6] or [max_pt]

    return {
        "body_pt": body_pt,
        "heading_pt": heading_pt,
        "body_median_pt": statistics.median(bodies),
        "heading_median_pt": statistics.median(headings),
        "max_pt": max_pt,
    }


CAPTION_RE = ("scan", "qr")


def _region_for(page_index: int, x0: float) -> str:
    left = x0 < FOLD_PT
    if page_index == 0:
        return "leadership" if left else "cover"
    return "announcements" if left else "program"


def _region_body_pt(sizes: list[float], region: str) -> float:
    if not sizes:
        return 0.0
    from collections import Counter

    rounded = [round(s * 2) / 2 for s in sizes if 4.0 <= s <= 80.0]
    if not rounded:
        return 0.0
    counts = Counter(rounded)
    frequent = sorted(size for size, n in counts.items() if n >= 4) or sorted(counts)
    if region == "cover":
        # Ward name, not subtitles.
        return max(frequent)
    # Drop QR captions and other tiny clusters when a larger body exists.
    bodyish = [s for s in frequent if s >= 8.0] or frequent
    if len(bodyish) > 1:
        top = max(bodyish)
        bodyish = [s for s in bodyish if s <= top - 1.0] or bodyish
        # Prefer the modal remaining size (program/leadership/announcements body).
    chosen = Counter(s for s in rounded if s in set(bodyish)).most_common(1)
    return chosen[0][0] if chosen else min(bodyish)


def analyze(pdf_path: str) -> dict[str, Any]:
    overlaps: list[dict[str, Any]] = []
    fold_crosses: list[dict[str, Any]] = []
    all_sizes: list[float] = []
    min_edge_pt: float | None = None
    clipped = False
    word_count = 0
    page_count = 0
    region_sizes: dict[str, list[float]] = {
        "leadership": [],
        "cover": [],
        "announcements": [],
        "program": [],
    }
    text_parts: list[str] = []

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
            page_words: list[str] = []
            for w in usable:
                text = str(w.get("text", "")).strip()
                page_words.append(text)
                size = w.get("size")
                if isinstance(size, (int, float)):
                    low = text.lower()
                    if not any(token in low for token in CAPTION_RE):
                        region_sizes[_region_for(index, float(w["x0"]))].append(float(size))
            text_parts.append(" ".join(page_words))

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

    region_fonts = {name: _region_body_pt(vals, name) for name, vals in region_sizes.items()}

    return {
        "pages": page_count,
        "word_count": word_count,
        "margin_in": None if margin_in is None else round(margin_in, 3),
        "margin_pass": margin_in is not None and margin_in >= 0.25,
        "body_pt": round(fonts["body_pt"], 2),
        "heading_pt": round(fonts["heading_pt"], 2),
        "heading_gt_body": fonts["heading_pt"] > fonts["body_pt"] + 0.4,
        "body_median_pt": round(fonts["body_median_pt"], 2),
        "heading_median_pt": round(fonts["heading_median_pt"], 2),
        "max_pt": round(fonts["max_pt"], 2),
        "clipping": clipped,
        "overlap_count": len(overlaps),
        "overlap_samples": overlaps[:8],
        "fold_cross_count": len(fold_crosses),
        "fold_samples": fold_crosses[:8],
        "unique_sizes": sorted({round(s * 2) / 2 for s in all_sizes}),
        "full_text": "\n".join(text_parts),
        "region_fonts": {k: round(v, 2) for k, v in region_fonts.items()},
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
