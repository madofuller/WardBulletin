import sharp from 'sharp';

export interface OverflowCheckResult {
  passed: boolean;
  message: string;
  details?: {
    blankPages: number;
    expectedPages: number;
    actualPages: number;
  };
}

/**
 * Check for unexpected blank pages or overflow
 */
export async function checkOverflow(
  pngPaths: string[],
  expectedPages: number = 2
): Promise<OverflowCheckResult> {
  try {
    const pageAnalyses = await Promise.all(
      pngPaths.map(async (path) => {
        const image = sharp(path);
        const stats = await image.stats();
        
        // Check if page is mostly blank (high mean values = white)
        const avgBrightness = stats.channels.reduce((sum, ch) => sum + ch.mean, 0) / stats.channels.length;
        const isBlank = avgBrightness > 250; // Nearly all white
        
        return { path, isBlank, avgBrightness };
      })
    );
    
    const blankPages = pageAnalyses.filter(p => p.isBlank).length;
    const actualPages = pngPaths.length;
    
    // If we have more pages than expected and any are blank, that's overflow
    if (actualPages > expectedPages && blankPages > 0) {
      return {
        passed: false,
        message: `Found ${blankPages} unexpected blank page(s). Expected ${expectedPages} pages, got ${actualPages}`,
        details: {
          blankPages,
          expectedPages,
          actualPages,
        },
      };
    }
    
    // If we have more non-blank pages than expected, content is overflowing
    const nonBlankPages = actualPages - blankPages;
    if (nonBlankPages > expectedPages) {
      return {
        passed: false,
        message: `Content overflows onto ${nonBlankPages - expectedPages} extra page(s)`,
        details: {
          blankPages,
          expectedPages,
          actualPages,
        },
      };
    }
    
    return {
      passed: true,
      message: `No unexpected overflow. ${actualPages} page(s) as expected`,
      details: {
        blankPages,
        expectedPages,
        actualPages,
      },
    };
  } catch (error) {
    return {
      passed: false,
      message: `Error checking overflow: ${error}`,
    };
  }
}
