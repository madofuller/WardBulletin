#!/usr/bin/env python3
"""
Extract actual font sizes from rendered PDFs
Measures real printed point sizes, not calculated values
"""
import pdfplumber
import sys
from pathlib import Path
from collections import defaultdict

ARTIFACTS_DIR = Path('/opt/cursor/artifacts/print-pdfs-proper')

def extract_font_sizes(pdf_path):
    """Extract all font sizes from PDF"""
    font_sizes = []
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                # Get all characters with their font information
                chars = page.chars
                for char in chars:
                    if 'size' in char and char['size']:
                        font_sizes.append(round(char['size'], 1))
    except Exception as e:
        print(f"Error processing {pdf_path}: {e}", file=sys.stderr)
        return []
    
    return font_sizes

def analyze_fixture(fixture_name, mode_name):
    """Analyze font sizes for a specific fixture and mode"""
    pdf_path = ARTIFACTS_DIR / f"current_{fixture_name}_{mode_name}.pdf"
    
    if not pdf_path.exists():
        return None
    
    sizes = extract_font_sizes(pdf_path)
    
    if not sizes:
        return None
    
    # Group by size range to identify body text vs headings
    size_counts = defaultdict(int)
    for size in sizes:
        size_counts[size] += 1
    
    # Sort by frequency to find most common sizes
    sorted_sizes = sorted(size_counts.items(), key=lambda x: x[1], reverse=True)
    
    # Most common size is likely body text
    body_size = sorted_sizes[0][0] if sorted_sizes else 0
    
    # Find heading sizes (larger than body)
    heading_sizes = [s for s in set(sizes) if s > body_size + 2]
    
    return {
        'min': min(sizes) if sizes else 0,
        'max': max(sizes) if sizes else 0,
        'body': body_size,
        'headings': sorted(heading_sizes, reverse=True)[:3] if heading_sizes else [],
        'all_unique': sorted(set(sizes), reverse=True)
    }

def main():
    print("="*80)
    print("PDF FONT SIZE EXTRACTION")
    print("="*80)
    print()
    
    fixtures = ['normal', 'bishops-exact-case', 'heavy-announcements']
    modes = ['normal', 'large', 'extralarge']
    mode_display = {
        'normal': 'Normal (100%)',
        'large': 'Large (115%)',
        'extralarge': 'Extra Large (125%)'
    }
    
    results = {}
    
    for fixture in fixtures:
        print(f"\n{fixture}:")
        for mode in modes:
            analysis = analyze_fixture(fixture, mode)
            if analysis:
                results[f"{fixture}_{mode}"] = analysis
                print(f"  {mode_display[mode]}:")
                print(f"    Body text: {analysis['body']}pt")
                heading_str = ', '.join([f"{h}pt" for h in analysis['headings']])
                print(f"    Headings: {heading_str}")
                print(f"    Range: {analysis['min']}pt - {analysis['max']}pt")
    
    # Summary table
    print("\n" + "="*80)
    print("SUMMARY TABLE")
    print("="*80)
    print()
    print("Mode              | Body Text | H1/H2/H3 Headings      | Min-Max Range")
    print("------------------+-----------+------------------------+----------------")
    
    for mode in modes:
        # Average across fixtures for this mode
        mode_results = [v for k, v in results.items() if k.endswith(f"_{mode}")]
        if mode_results:
            avg_body = sum(r['body'] for r in mode_results) / len(mode_results)
            all_headings = []
            for r in mode_results:
                all_headings.extend(r['headings'])
            unique_headings = sorted(set(all_headings), reverse=True)[:3]
            
            body_str = f"{avg_body:.1f}pt".ljust(9)
            heading_parts = [f"{h:.1f}pt" for h in unique_headings[:3]]
            heading_str = ', '.join(heading_parts).ljust(22)
            
            # Get typical range
            typical_min = min(r['min'] for r in mode_results)
            typical_max = max(r['max'] for r in mode_results)
            range_str = f"{typical_min:.1f}-{typical_max:.1f}pt"
            
            print(f"{mode_display[mode].ljust(17)} | {body_str} | {heading_str} | {range_str}")
    
    print("\n✓ Font extraction complete\n")

if __name__ == '__main__':
    main()
