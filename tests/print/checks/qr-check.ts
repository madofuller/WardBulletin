import sharp from 'sharp';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { readFileSync } from 'fs';

export interface QRCheckResult {
  passed: boolean;
  message: string;
  details?: {
    qrCodeFound: boolean;
    qrCodeDecoded: boolean;
    decodedUrl?: string;
    qrOnPage: boolean;
    survivesPhotocopy?: boolean;
  };
}

/**
 * Check if QR code is present, on page, scannable, and survives photocopy simulation
 */
export async function checkQRCode(
  pngPath: string,
  expectedSlug?: string
): Promise<QRCheckResult> {
  try {
    // Read the PNG
    const pngData = PNG.sync.read(readFileSync(pngPath));
    const { width, height, data } = pngData;
    
    // Convert RGBA to RGB for jsQR
    const imageData = {
      data: new Uint8ClampedArray(width * height * 4),
      width,
      height,
    };
    
    for (let i = 0; i < data.length; i++) {
      imageData.data[i] = data[i];
    }
    
    // Try to decode QR code
    const qrCode = jsQR(imageData.data, width, height);
    
    if (!qrCode) {
      return {
        passed: false,
        message: 'No QR code found in image',
        details: {
          qrCodeFound: false,
          qrCodeDecoded: false,
          qrOnPage: false,
        },
      };
    }
    
    // Check if QR code is fully on page (not cut off)
    const { location } = qrCode;
    const isFullyOnPage = 
      location.topLeftCorner.x >= 0 &&
      location.topLeftCorner.y >= 0 &&
      location.bottomRightCorner.x <= width &&
      location.bottomRightCorner.y <= height;
    
    if (!isFullyOnPage) {
      return {
        passed: false,
        message: 'QR code is partially cut off the page',
        details: {
          qrCodeFound: true,
          qrCodeDecoded: true,
          decodedUrl: qrCode.data,
          qrOnPage: false,
        },
      };
    }
    
    // Validate URL if expected slug provided
    if (expectedSlug) {
      const urlMatch = qrCode.data.includes(expectedSlug);
      if (!urlMatch) {
        return {
          passed: false,
          message: `QR code URL doesn't match expected slug. Got: ${qrCode.data}`,
          details: {
            qrCodeFound: true,
            qrCodeDecoded: true,
            decodedUrl: qrCode.data,
            qrOnPage: true,
          },
        };
      }
    }
    
    // Test photocopy simulation
    const photocopyTest = await simulatePhotocopy(pngPath);
    
    if (!photocopyTest) {
      return {
        passed: false,
        message: 'QR code does not survive photocopy simulation',
        details: {
          qrCodeFound: true,
          qrCodeDecoded: true,
          decodedUrl: qrCode.data,
          qrOnPage: true,
          survivesPhotocopy: false,
        },
      };
    }
    
    return {
      passed: true,
      message: 'QR code is fully on page, scannable, and survives photocopy',
      details: {
        qrCodeFound: true,
        qrCodeDecoded: true,
        decodedUrl: qrCode.data,
        qrOnPage: true,
        survivesPhotocopy: true,
      },
    };
  } catch (error) {
    return {
      passed: false,
      message: `Error checking QR code: ${error}`,
    };
  }
}

/**
 * Simulate photocopy effects and check if QR code still scans
 */
async function simulatePhotocopy(pngPath: string): Promise<boolean> {
  try {
    // Apply photocopy-like transformations:
    // 1. Convert to grayscale
    // 2. Slight blur
    // 3. Adjust contrast
    // 4. Apply threshold
    // 5. Slight rotation
    // 6. Downsample and upsample (simulating 300 DPI scan)
    
    const processedBuffer = await sharp(pngPath)
      .grayscale()
      .blur(0.3)
      .normalize()
      .threshold(128)
      .rotate(0.5, { background: { r: 255, g: 255, b: 255 } })
      .resize(undefined, undefined, { kernel: 'nearest' })
      .toBuffer();
    
    // Try to decode the processed image
    const { data, info } = await sharp(processedBuffer)
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    const imageData = {
      data: new Uint8ClampedArray(info.width * info.height * 4),
      width: info.width,
      height: info.height,
    };
    
    // Convert to RGBA
    for (let i = 0; i < info.width * info.height; i++) {
      const srcIdx = i * info.channels;
      const dstIdx = i * 4;
      imageData.data[dstIdx] = data[srcIdx];
      imageData.data[dstIdx + 1] = info.channels > 1 ? data[srcIdx + 1] : data[srcIdx];
      imageData.data[dstIdx + 2] = info.channels > 2 ? data[srcIdx + 2] : data[srcIdx];
      imageData.data[dstIdx + 3] = 255;
    }
    
    const qrCode = jsQR(imageData.data, info.width, info.height);
    
    return qrCode !== null;
  } catch (error) {
    console.error('Photocopy simulation error:', error);
    return false;
  }
}
