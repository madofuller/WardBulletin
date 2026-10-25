#!/usr/bin/env python3
"""Verify print PDFs: margins, fonts, fill, overlaps, fold, announcements.

Uses only pdfplumber character/word boxes. This is the single source of
font-size and geometry numbers for LAYOUT_NOTES.md.
"""
from __future__ import annotations

import argparse
import sys
from collections import Counter, defaultdict
from pathlib import Path

import pdfplumber

# Landscape Letter
PAGE_W = 11.0
PAGE_H = 8.5
FOLD_X = 5.5
MIN_EDGE_IN = 0.25
MIN_FILL_NON_LAST = 0.60
COVER_TITLE = "sunriver 2nd ward"

FIXTURE_ANNOUNCEMENTS = {
    "normal": ["Ward Picnic", "Tithing Settlement", "Temple Trip"],
    "musical-long-ward-name": ["Ward Picnic"],
    "bishops-exact-case": [
        "Stake Temple Trip",
        "Ward Christmas Party",
        "Youth Activity",
        "Relief Society Meeting",
        "Primary Program Practice",
    ],
    "heavy-announcements": [
        "Stake Temple Trip",
        "Ward Christmas Party Planning Committee",
        "Young Women Fundraiser for Girls Camp",
        "Missionary Farewell Next Week",
        "Primary Program Practice This Saturday",
        "Ward Emergency Preparedness Workshop",
        "Tithing Settlement Appointments Available",
        "Family History Center Open House Event",
        "Relief Society Service Project for Homeless",
        "Youth Activity Next Friday Evening",
        "Ward Choir Special Musical Number",
        "Ward Book Club Discussion Meeting",
        "Elder's Quorum Moving Service",
        "Seminary Registration Now Open",
        "Ward Budget Council Meeting",
    ],
}


def normalize(s: str) -> str:
    return " ".join("".join(ch.lower() if ch.isalnum() or ch.isspace() else " " for ch in s).split())


def boxes_intersect(a, b, pad=0.5):
    """True if two (x0,y0,x1,y1) boxes overlap by more than pad points."""
    return not (
        a[2] <= b[0] + pad
        or b[2] <= a[0] + pad
        or a[3] <= b[1] + pad
        or b[3] <= a[1] + pad
    )


def analyze_page(page):
    chars = page.chars or []
    words = page.extract_words(x_tolerance=2, y_tolerance=2, keep_blank_chars=False) or []
    images = page.images or []

    pw, ph = float(page.width), float(page.height)
    # pdfplumber uses points (72 per inch)
    to_in = lambda pt: pt / 72.0

    edges = {"left": pw, "right": pw, "top": ph, "bottom": ph}
    sizes = []
    for c in chars:
        sizes.append(round(float(c.get("size") or 0), 1))
        x0, y0, x1, y1 = float(c["x0"]), float(c["top"]), float(c["x1"]), float(c["bottom"])
        edges["left"] = min(edges["left"], x0)
        edges["right"] = min(edges["right"], pw - x1)
        edges["top"] = min(edges["top"], y0)
        edges["bottom"] = min(edges["bottom"], ph - y1)

    for im in images:
        x0, y0, x1, y1 = float(im["x0"]), float(im["top"]), float(im["x1"]), float(im["bottom"])
        edges["left"] = min(edges["left"], x0)
        edges["right"] = min(edges["right"], pw - x1)
        edges["top"] = min(edges["top"], y0)
        edges["bottom"] = min(edges["bottom"], ph - y1)

    edge_in = {k: to_in(v) for k, v in edges.items()}
    min_edge = min(edge_in.values()) if chars or images else 0.0

    body = 0.0
    heading = 0.0
    if sizes:
        body = Counter(sizes).most_common(1)[0][0]
        heading = max(sizes)

    ys = [float(c["top"]) for c in chars] + [float(c["bottom"]) for c in chars]
    if ys:
        fill = (max(ys) - min(ys)) / ph
    else:
        fill = 0.0

    overlaps = []
    word_boxes = []
    for w in words:
        box = (float(w["x0"]), float(w["top"]), float(w["x1"]), float(w["bottom"]))
        text = (w.get("text") or "").strip()
        if len(text) < 2:
            continue
        word_boxes.append((box, text))

    for i, (ba, ta) in enumerate(word_boxes):
        for bb, tb in word_boxes[i + 1 :]:
            if boxes_intersect(ba, bb):
                overlaps.append(f"{ta!r}∩{tb!r}")

    fold_crossers = []
    fold_pt = FOLD_X * 72
    for box, text in word_boxes:
        if box[0] < fold_pt - 2 and box[2] > fold_pt + 2:
            fold_crossers.append(text)

    page_text = normalize(" ".join(w.get("text") or "" for w in words))
    return {
        "min_edge": min_edge,
        "edge": edge_in,
        "body": body,
        "heading": heading,
        "fill": fill,
        "overlaps": overlaps,
        "fold_crossers": fold_crossers,
        "text": page_text,
        "width_in": to_in(pw),
        "height_in": to_in(ph),
    }


def check_pdf(pdf_path: Path, fixture: str):
    issues = []
    rows = []
    all_text = []
    with pdfplumber.open(pdf_path) as pdf:
        n = len(pdf.pages)
        for i, page in enumerate(pdf.pages, start=1):
            info = analyze_page(page)
            all_text.append(info["text"])
            last = i == n
            fail = []
            if info["min_edge"] < MIN_EDGE_IN - 0.005:
                fail.append(f"edge {info['min_edge']:.3f}in")
            if info["overlaps"]:
                fail.append(f"{len(info['overlaps'])} overlaps")
            if info["fold_crossers"]:
                fail.append(f"fold:{','.join(info['fold_crossers'][:4])}")
            if not last and info["fill"] < MIN_FILL_NON_LAST and info["fill"] > 0.02:
                fail.append(f"fill {info['fill']:.0%}")
            rows.append({
                "page": i,
                "pages": n,
                "min_edge": info["min_edge"],
                "body": info["body"],
                "heading": info["heading"],
                "fill": info["fill"],
                "overlaps": len(info["overlaps"]),
                "fold": len(info["fold_crossers"]),
                "fail": fail,
                "overlap_samples": info["overlaps"][:6],
            })
            issues.extend(f"p{i}: {f}" for f in fail)

    joined = " ".join(all_text)
    cover_hits = joined.count(COVER_TITLE)
    # Cover title appears on page 1 (front) and page 2 (program header) — that's 2.
    # 3+ means a duplicated front cover stacked on another page.
    if cover_hits >= 3:
        issues.append(f"cover title appears {cover_hits} times")

    expected = [normalize(t) for t in FIXTURE_ANNOUNCEMENTS.get(fixture, [])]
    found_counts = {}
    for t in expected:
        # Titles wrap across columns; require every significant word, in order.
        words = [w for w in t.split() if len(w) > 2]
        if not words:
            found_counts[t] = joined.count(t)
            continue
        idx = 0
        hits = 0
        search = joined
        while True:
            pos = 0
            ok = True
            for w in words:
                p = search.find(w, pos)
                if p < 0:
                    ok = False
                    break
                pos = p + len(w)
            if not ok:
                break
            hits += 1
            search = search[pos:]
        found_counts[t] = hits
    missing = [t for t, c in found_counts.items() if c == 0]
    duped = [t for t, c in found_counts.items() if c > 1]
    if missing:
        issues.append("missing announcements: " + ", ".join(missing))
    if duped:
        issues.append("duplicated announcements: " + ", ".join(duped))

    return rows, issues, n, found_counts


def parse_name(path: Path):
    # current_bishops-exact-case_extralarge.pdf or branch_... or main_...
    stem = path.stem
    parts = stem.split("_")
    prefix = parts[0]
    mode = parts[-1]
    fixture = "_".join(parts[1:-1])
    return prefix, fixture, mode


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dir", nargs="?", default="/opt/cursor/artifacts/print-pdfs-proper")
    ap.add_argument("--prefix", default="current")
    args = ap.parse_args()
    root = Path(args.dir)
    pdfs = sorted(root.glob(f"{args.prefix}_*.pdf"))
    if not pdfs:
        print(f"No PDFs matching {args.prefix}_*.pdf in {root}", file=sys.stderr)
        sys.exit(2)

    print("| Fixture | Mode | Pages | Body | Heading | Min edge | Min fill | Overlaps | Fold | Announcements | Status |")
    print("|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|")

    failed = 0
    for pdf in pdfs:
        prefix, fixture, mode = parse_name(pdf)
        rows, issues, n, found = check_pdf(pdf, fixture)
        bodies = [r["body"] for r in rows if r["body"]]
        heads = [r["heading"] for r in rows if r["heading"]]
        edges = [r["min_edge"] for r in rows]
        fills = [r["fill"] for r in rows]
        overlaps = sum(r["overlaps"] for r in rows)
        folds = sum(r["fold"] for r in rows)
        body = Counter(bodies).most_common(1)[0][0] if bodies else 0
        heading = max(heads) if heads else 0
        min_edge = min(edges) if edges else 0
        min_fill = min(fills) if fills else 0
        ann = "ok" if not any("announcement" in i for i in issues) else "fail"
        status = "PASS" if not issues else "FAIL: " + "; ".join(issues[:4])
        if issues:
            failed += 1
        print(
            f"| {fixture} | {mode} | {n} | {body:.1f}pt | {heading:.1f}pt | "
            f"{min_edge:.3f}in | {min_fill:.0%} | {overlaps} | {folds} | {ann} | {status} |"
        )
        for r in rows:
            if r["overlap_samples"]:
                print(f"  - {fixture}/{mode} p{r['page']} overlaps: {r['overlap_samples']}")

    print()
    if failed:
        print(f"{failed}/{len(pdfs)} PDFs failed.", file=sys.stderr)
        sys.exit(1)
    print(f"{len(pdfs)} PDFs passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main() or 0)
