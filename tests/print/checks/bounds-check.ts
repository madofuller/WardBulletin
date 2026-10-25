import sharp from 'sharp';
import { PageDimensions } from '../utils/render';

export interface BoundsCheckResult {
  passed: boolean;
  message: string;
  details?: {
    elementsOutside: number;
    marginViolations: string[];
  };
}

const SAFETY_MARGIN_INCHES = 0.25;
const DPI = 96; // Standard screen DPI

/**
 * Check if all content fits within printable area with safety margins
 */
export async function checkPrintableBounds(
  pngPath: string,
  dimensions: PageDimensions
): Promise<BoundsCheckResult> {
  try {
    const image = sharp(pngPath);
    const metadata = await image.metadata();
    
    if (!metadata.width || !metadata.height) {
      return {
        passed: false,
        message: 'Failed to read image dimensions',
      };
    }

    // Calculate safety margin in pixels
    const marginPixels = SAFETY_MARGIN_INCHES * DPI;
    
    // Get page dimensions in pixels
    const pageWidthPx = Math.round(dimensions.width * DPI);
    const pageHeightPx = Math.round(dimensions.height * DPI);
    
    // Define safe zones
    const safeLeft = marginPixels;
    const safeRight = pageWidthPx - marginPixels;
    const safeTop = marginPixels;
    const safeBottom = pageHeightPx - marginPixels;
    
    // Analyze image for content outside safe zones
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    const violations: string[] = [];
    let contentOutsideMargins = false;
    
    // Check edges for non-white pixels (indicating content)
    const threshold = 250; // Pixels darker than this are considered content
    
    // Check top margin
    for (let y = 0; y < safeTop && y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const idx = (y * info.width + x) * info.channels;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        if (r < threshold || g < threshold || b < threshold) {
          contentOutsideMargins = true;
          violations.push(`Content found in top margin at (${x}, ${y})`);
          break;
        }
      }
      if (contentOutsideMargins) break;
    }
    
    // Check bottom margin
    if (!contentOutsideMargins) {
      for (let y = Math.floor(safeBottom); y < info.height; y++) {
        for (let x = 0; x < info.width; x++) {
          const idx = (y * info.width + x) * info.channels;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          if (r < threshold || g < threshold || b < threshold) {
            contentOutsideMargins = true;
            violations.push(`Content found in bottom margin at (${x}, ${y})`);
            break;
          }
        }
        if (contentOutsideMargins) break;
      }
    }
    
    // Check left margin
    if (!contentOutsideMargins) {
      for (let x = 0; x < safeLeft && x < info.width; x++) {
        for (let y = 0; y < info.height; y++) {
          const idx = (y * info.width + x) * info.channels;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          if (r < threshold || g < threshold || b < threshold) {
            contentOutsideMargins = true;
            violations.push(`Content found in left margin at (${x}, ${y})`);
            break;
          }
        }
        if (contentOutsideMargins) break;
      }
    }
    
    // Check right margin
    if (!contentOutsideMargins) {
      for (let x = Math.floor(safeRight); x < info.width; x++) {
        for (let y = 0; y < info.height; y++) {
          const idx = (y * info.width + x) * info.channels;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          if (r < threshold || g < threshold || b < threshold) {
            contentOutsideMargins = true;
            violations.push(`Content found in right margin at (${x}, ${y})`);
            break;
          }
        }
        if (contentOutsideMargins) break;
      }
    }
    
    if (contentOutsideMargins) {
      return {
        passed: false,
        message: `Content extends outside ${SAFETY_MARGIN_INCHES}" safety margin`,
        details: {
          elementsOutside: violations.length,
          marginViolations: violations.slice(0, 5), // Limit to first 5 violations
        },
      };
    }
    
    return {
      passed: true,
      message: `All content within ${SAFETY_MARGIN_INCHES}" safety margin`,
    };
  } catch (error) {
    return {
      passed: false,
      message: `Error checking bounds: ${error}`,
    };
  }
}
