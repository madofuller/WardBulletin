import sharp from 'sharp';

export interface ContrastCheckResult {
  passed: boolean;
  message: string;
  details?: {
    avgContrast: number;
    minContrast: number;
    lowContrastAreas: number;
  };
}

/**
 * Check text contrast ratio for readability
 * WCAG AA requires 4.5:1 for normal text, 3:1 for large text
 * For print bulletins for seniors, we should aim higher
 */
export async function checkContrast(pngPath: string): Promise<ContrastCheckResult> {
  try {
    const image = sharp(pngPath);
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Sample regions and calculate local contrast
    const sampleSize = 20; // 20x20 pixel regions
    const samples: number[] = [];
    
    for (let y = 0; y < info.height - sampleSize; y += sampleSize) {
      for (let x = 0; x < info.width - sampleSize; x += sampleSize) {
        // Get average brightness in this region
        let sum = 0;
        let count = 0;
        
        for (let dy = 0; dy < sampleSize; dy++) {
          for (let dx = 0; dx < sampleSize; dx++) {
            const idx = ((y + dy) * info.width + (x + dx)) * info.channels;
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            sum += brightness;
            count++;
          }
        }
        
        const avgBrightness = sum / count;
        
        // Calculate contrast with neighboring region
        if (x + sampleSize * 2 < info.width) {
          let neighborSum = 0;
          let neighborCount = 0;
          
          for (let dy = 0; dy < sampleSize; dy++) {
            for (let dx = sampleSize; dx < sampleSize * 2; dx++) {
              const idx = ((y + dy) * info.width + (x + dx)) * info.channels;
              const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
              neighborSum += brightness;
              neighborCount++;
            }
          }
          
          const neighborBrightness = neighborSum / neighborCount;
          const contrast = Math.abs(avgBrightness - neighborBrightness);
          
          // Only consider areas with significant contrast (likely text)
          if (contrast > 30) {
            samples.push(contrast);
          }
        }
      }
    }
    
    if (samples.length === 0) {
      return {
        passed: true,
        message: 'No text areas detected for contrast check',
      };
    }
    
    const avgContrast = samples.reduce((a, b) => a + b, 0) / samples.length;
    const minContrast = Math.min(...samples);
    
    // For print, we want good contrast - minimum 100 on 0-255 scale
    const MIN_CONTRAST = 100;
    const lowContrastAreas = samples.filter(c => c < MIN_CONTRAST).length;
    
    if (minContrast < MIN_CONTRAST || lowContrastAreas > samples.length * 0.1) {
      return {
        passed: false,
        message: `Low contrast detected. Min: ${minContrast.toFixed(1)}, ${lowContrastAreas} areas below ${MIN_CONTRAST}`,
        details: {
          avgContrast,
          minContrast,
          lowContrastAreas,
        },
      };
    }
    
    return {
      passed: true,
      message: `Good contrast throughout. Avg: ${avgContrast.toFixed(1)}, Min: ${minContrast.toFixed(1)}`,
      details: {
        avgContrast,
        minContrast,
        lowContrastAreas,
      },
    };
  } catch (error) {
    return {
      passed: false,
      message: `Error checking contrast: ${error}`,
    };
  }
}
