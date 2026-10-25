/**
 * Standalone entry point for print regression testing.
 * Renders BulletinPrintLayout into .print-source-portal (direct child of body),
 * matching the app's print CSS structure so @media print works correctly.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import BulletinPrintLayout from './components/BulletinPrintLayout';
import { BulletinData } from './types/bulletin';
import { SessionProvider } from './lib/SessionContext';
import './index.css'; // Import all app CSS including print styles
import './i18n'; // Initialize i18n

// Mock profile for QR codes - must have profile_slug for QR to render
const mockProfile = {
  profile_slug: 'test-ward',
};

// Simple screen UI component
function ScreenUI({ fixtureName, ready }: { fixtureName: string; ready: boolean }) {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Print Test: {fixtureName}</h1>
      <p>Ready: {ready ? 'Yes ✓' : 'Loading...'}</p>
      <p style={{ fontSize: '12px', color: '#666' }}>
        The bulletin renders in .print-source-portal (direct child of body).
        Use browser print preview or @media print to see it.
      </p>
    </div>
  );
}

// Get fixture name from URL
const params = new URLSearchParams(window.location.search);
const fixtureName = params.get('fixture') || 'minimal';

// Render screen UI into #root
const rootElement = document.getElementById('root')!;
const rootRoot = createRoot(rootElement);
rootRoot.render(<ScreenUI fixtureName={fixtureName} ready={false} />);

// Load and render bulletin into .print-source-portal
async function renderBulletin() {
  try {
    // Load fixture
    const res = await fetch(`/test-fixtures/${fixtureName}.json`);
    if (!res.ok) throw new Error(`Failed to load: ${res.statusText}`);
    const bulletinData: BulletinData = await res.json();
    
    // Expose for test inspection
    (window as any).__BULLETIN_DATA__ = bulletinData;
    
    // Render bulletin into portal
    const portalElement = document.getElementById('print-portal')!;
    const portalRoot = createRoot(portalElement);
    
    portalRoot.render(
      <React.StrictMode>
        <SessionProvider>
          <BulletinPrintLayout
            data={bulletinData}
            // @ts-ignore - mock profile for testing
            profile={mockProfile}
          />
        </SessionProvider>
      </React.StrictMode>
    );
    
    // Wait for fonts
    await document.fonts.ready;
    console.log('[Print Test] Fonts ready');
    
    // Wait for QR codes to actually render (they use useEffect -> async QRCode.toCanvas)
    // Poll for canvas elements with actual content
    const waitForQR = async () => {
      const maxWait = 5000;
      const startTime = Date.now();
      
      while (Date.now() - startTime < maxWait) {
        const canvases = Array.from(portalElement.querySelectorAll('canvas'));
        
        if (canvases.length > 0) {
          // Check if all canvases have been drawn (width > 0 means sized, but check if drawn)
          const allReady = canvases.every(canvas => {
            const ctx = (canvas as HTMLCanvasElement).getContext('2d');
            if (!ctx || (canvas as HTMLCanvasElement).width === 0) return false;
            
            // Check if canvas has non-white pixels (QR code is black on white)
            const imageData = ctx.getImageData(0, 0, (canvas as HTMLCanvasElement).width, (canvas as HTMLCanvasElement).height);
            for (let i = 0; i < imageData.data.length; i += 4) {
              if (imageData.data[i] < 200) return true; // Found dark pixel
            }
            return false;
          });
          
          if (allReady) {
            console.log('[Print Test] QR codes ready:', canvases.length);
            return true;
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.warn('[Print Test] QR code timeout - proceeding anyway');
      return false;
    };
    
    await waitForQR();
    
    // Update screen UI to show ready
    rootRoot.render(<ScreenUI fixtureName={fixtureName} ready={true} />);
    
    // Signal ready
    (window as any).__PRINT_READY__ = true;
    console.log('[Print Test] Ready');
  } catch (err) {
    console.error('[Print Test] Error:', err);
    rootRoot.render(
      <div style={{ padding: '20px', color: 'red' }}>
        Error: {String(err)}
      </div>
    );
  }
}

renderBulletin();
