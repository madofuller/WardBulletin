import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import BulletinPrintLayout from './components/BulletinPrintLayout';
import { BulletinData } from './types/bulletin';
import { SessionProvider } from './lib/SessionContext';
import './index.css';
import './i18n';

function ScreenUI({ fixtureName, ready, fontScale }: { fixtureName: string; ready: boolean; fontScale: number }) {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Print Test: {fixtureName}</h1>
      <p>Font Scale: {fontScale}x</p>
      <p>Ready: {ready ? 'Yes' : 'Loading...'}</p>
    </div>
  );
}

const params = new URLSearchParams(window.location.search);
const fixtureName = params.get('fixture') || 'minimal';
const fontScale = parseFloat(params.get('fontScale') || '1');

const rootElement = document.getElementById('root')!;
const rootRoot = createRoot(rootElement);
rootRoot.render(<ScreenUI fixtureName={fixtureName} ready={false} fontScale={fontScale} />);

function markReady(reason: string) {
  if ((window as any).__PRINT_READY__) return;
  (window as any).__PRINT_READY__ = true;
  (window as any).__PRINT_READY_REASON__ = reason;
  console.log('[Print Test] Ready:', reason);
  rootRoot.render(<ScreenUI fixtureName={fixtureName} ready={true} fontScale={fontScale} />);
}

window.setTimeout(() => markReady('failsafe-timeout'), 10000);

async function waitMs(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function renderBulletin() {
  try {
    const res = await fetch(`/test-fixtures/${fixtureName}.json`);
    if (!res.ok) throw new Error(`Failed to load fixture: ${res.status} ${res.statusText}`);
    const bulletinData: BulletinData = await res.json();

    bulletinData.printFontScale = fontScale;
    bulletinData.showQRCodeOnPrint = true;
    (window as any).__BULLETIN_DATA__ = bulletinData;
    console.log(`[Print Test] Loaded ${fixtureName}, fontScale=${fontScale}`);

    const portalElement = document.getElementById('print-portal')!;
    portalElement.setAttribute('data-font-scale', String(fontScale));
    const portalRoot = createRoot(portalElement);

    portalRoot.render(
      <Suspense fallback={<div>Loading print layout…</div>}>
        <SessionProvider>
          <BulletinPrintLayout data={bulletinData} />
        </SessionProvider>
      </Suspense>
    );

    await Promise.race([
      document.fonts.ready,
      waitMs(2000),
    ]);
    console.log('[Print Test] Fonts settled');

    const deadline = Date.now() + 6000;
    while (Date.now() < deadline) {
      const text = (portalElement.textContent || '').trim();
      const canvases = Array.from(portalElement.querySelectorAll('canvas')) as HTMLCanvasElement[];
      const qrReady = canvases.some((canvas) => {
        if (canvas.width === 0) return false;
        const ctx = canvas.getContext('2d');
        if (!ctx) return false;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
          if (imageData.data[i] < 200) return true;
        }
        return false;
      });
      if (text.length > 40 && (qrReady || text.toLowerCase().includes('scan'))) {
        console.log('[Print Test] Portal content ready, canvases=', canvases.length);
        break;
      }
      await waitMs(100);
    }

    // One extra frame so QR canvases finish painting into the print tree.
    await waitMs(200);
    markReady('content-ready');
  } catch (err) {
    console.error('[Print Test] Error:', err);
    rootRoot.render(<div style={{ padding: '20px', color: 'red' }}>Error: {String(err)}</div>);
    markReady('error');
  }
}

renderBulletin();
