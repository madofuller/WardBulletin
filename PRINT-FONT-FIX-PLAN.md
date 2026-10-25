# Print Font Size Fix Plan

## Current Problem

**Measured sizes:**
- Normal: 6.8pt minimum (likely text-xs at base)
- Large (115%): 9.0pt 
- Extra Large (125%): 9.0pt

**User targets:**
- Normal: ~11pt body text
- Large: ~14pt body text  
- Extra Large: ~16-18pt body text

## Root Causes

1. **Scale factors too narrow:** 1.0 / 1.15 / 1.25 only gives 25% range
2. **Base sizes too small:** text-xs (12px = 9pt) is smallest, multiplied by scale
3. **Dynamic scaling:** Many elements use `scalePx()` which compounds the problem

## Proposed Fix

### New Scale Factors
```typescript
Normal: 1.0× (11-12pt body)
Large: 1.4× (14-15pt body)  
Extra Large: 1.8× (18-20pt body)
```

### Approach
1. **Change fontScale mapping:**
   - printFontScale 1.0 → 1.0× (Normal)
   - printFontScale 1.15 → 1.4× (Large)
   - printFontScale 1.25 → 1.8× (Extra Large)

2. **Verify Tailwind print classes:**
   - text-base (16px) × 1.8 = 28.8px = 21.6pt ✓
   - text-sm (14px) × 1.8 = 25.2px = 18.9pt ✓
   - text-lg (18px) × 1.8 = 32.4px = 24.3pt ✓

3. **Test with continuation pages:**
   - Content will overflow more in Extra Large
   - That's GOOD - it flows to continuation instead of shrinking

4. **Consider portrait mode for Extra Large:**
   - If landscape 11×8.5 can't fit a usable program at 1.8×
   - Switch to portrait Letter (8.5×11) single-column
   - More vertical space for larger text

## Implementation

### Step 1: Update fontScale mapping
```typescript
const fontScale = (() => {
  const scale = data.printFontScale || 1;
  if (scale >= 1.25) return 1.8;  // Extra Large
  if (scale >= 1.15) return 1.4;  // Large
  return 1.0;                      // Normal
})();
```

### Step 2: Test all three modes
- Generate PDFs with new scales
- Measure actual point sizes
- Verify continuation pages work
- Check if Extra Large needs portrait

### Step 3: Update thresholds
- isLargeOrExtraLarge: fontScale >= 1.4
- Continuation logic: Based on measurement, not heuristic

## Risks

1. **Extra Large may not fit landscape:** Acceptable - use portrait
2. **More pages per bulletin:** Acceptable - seniors prefer readability
3. **Back-compat:** Old bulletins with printFontScale will map to new scales

## Success Criteria

- [ ] Normal mode: Body text 11-12pt
- [ ] Large mode: Body text 14-15pt
- [ ] Extra Large mode: Body text 16-18pt
- [ ] All text fully visible (no clipping)
- [ ] Continuation pages flow properly
- [ ] QR codes render and verify
