import React from 'react';
import { createRoot } from 'react-dom/client';
import BulletinPrintLayout from './components/BulletinPrintLayout';
import { BulletinData } from './types/bulletin';
import { SessionProvider } from './lib/SessionContext';
import './index.css';
import './i18n';

const mockProfile = { profile_slug: 'test-ward' };

function ScreenUI({ fixtureName, ready, fontScale }: { fixtureName: string; ready: boolean; fontScale: number }) {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Print Test: {fixtureName}</h1>
      <p>Font Scale: {fontScale}x</p>
      <p>Ready: {ready ? 'Yes ✓' : 'Loading...'}</p>
    </div>
  );
}

const params = new URLSearchParams(window.location.search);
const fixtureName = params.get('fixture') || 'minimal';
const fontScale = parseFloat(params.get('fontScale') || '1');

const rootElement = document.getElementById('root')!;
const rootRoot = createRoot(rootElement);
rootRoot.render(<ScreenUI fixtureName={fixtureName} ready={false} fontScale={fontScale} />);

async function renderBulletin() {
  try {
    const res = await fetch(\`/test-fixtures/\${fixtureName}.json\`);
    if (!res.ok) throw new Error(\`Failed to load: \${res.statusText}\`);
    const bulletinData: BulletinData = await res.json();
    
    // ALWAYS set font scale, even if 1
    bulletinData.printFontScale = fontScale;
    console.log(\`[Print Test] Loaded \${fixtureName}, fontScale=\${fontScale}\`);
    (window as any).__BULLETIN_DATA__ = bulletinData;
    
    const portalElement = document.getElementById('print-portal')!;
    const portalRoot = createRoot(portalElement);
    
    portalRoot.render(
      <React.StrictMode>
        <SessionProvider>
          <BulletinPrintLayout data={bulletinData} profile={mockProfile as any} />
        </SessionProvider>
      </React.StrictMode>
    );
    
    await document.fonts.ready;
    console.log('[Print Test] Fonts ready');
    
    const waitForProfile = async () => {
      const maxWait = 3000;
      const startTime = Date.now();
      while (Date.now() - startTime < maxWait) {
        const portalText = portalElement.textContent || '';
        if (portalText.toLowerCase().includes('scan')) {
          console.log('[Print Test] Profile loaded (QR sections visible)');
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      console.warn('[Print Test] Profile timeout - QR codes may not render');
      return false;
    };
    
    await waitForProfile();
    
    const waitForQR = async () => {
      const maxWait = 5000;
      const startTime = Date.now();
      
      while (Date.now() - startTime < maxWait) {
        const canvases = Array.from(portalElement.querySelectorAll('canvas'));
        
        if (canvases.length > 0) {
          const allReady = canvases.every(canvas => {
            const ctx = (canvas as HTMLCanvasElement).getContext('2d');
            if (!ctx || (canvas as HTMLCanvasElement).width === 0) return false;
            
            const imageData = ctx.getImageData(0, 0, (canvas as HTMLCanvasElement).width, (canvas as HTMLCanvasElement).height);
            for (let i = 0; i < imageData.data.length; i += 4) {
              if (imageData.data[i] < 200) return true;
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
      
      console.warn('[Print Test] QR code timeout');
      return false;
    };
    
    await waitForQR();
    
    rootRoot.render(<ScreenUI fixtureName={fixtureName} ready={true} fontScale={fontScale} />);
    (window as any).__PRINT_READY__ = true;
    console.log('[Print Test] Ready');
  } catch (err) {
    console.error('[Print Test] Error:', err);
    rootRoot.render(<div style={{ padding: '20px', color: 'red' }}>Error: {String(err)}</div>);
  }
}

renderBulletin();
