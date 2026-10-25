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
    
    // Wait for fonts
    await document.fonts.ready;
    
    // Wait a bit more for QR codes
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Render bulletin into portal
    const portalElement = document.getElementById('print-portal')!;
    const portalRoot = createRoot(portalElement);
    
    portalRoot.render(
      <React.StrictMode>
        <BulletinPrintLayout
          data={bulletinData}
          // @ts-ignore - mock profile for testing
          profile={mockProfile}
        />
      </React.StrictMode>
    );
    
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
