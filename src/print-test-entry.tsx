/**
 * Standalone entry point for print regression testing.
 * No auth, no Supabase, no routing - just fixture rendering.
 */
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import BulletinPrintLayout from './components/BulletinPrintLayout';
import { BulletinData } from './types/bulletin';
import './index.css'; // Import all app CSS including print styles
import './i18n'; // Initialize i18n

// Mock profile for QR codes
const mockProfile = {
  profile_slug: 'test-ward',
};

function PrintTestApp() {
  const [bulletinData, setBulletinData] = useState<BulletinData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  
  // Get fixture name from URL
  const params = new URLSearchParams(window.location.search);
  const fixtureName = params.get('fixture') || 'minimal';
  
  useEffect(() => {
    // Load fixture
    fetch(`/test-fixtures/${fixtureName}.json`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load: ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        setBulletinData(data);
        // Expose for test inspection
        (window as any).__BULLETIN_DATA__ = data;
        
        // Wait for fonts to load
        document.fonts.ready.then(() => {
          // Wait a bit more for QR codes
          setTimeout(() => {
            setReady(true);
            (window as any).__PRINT_READY__ = true;
            console.log('[Print Test] Ready');
          }, 1000);
        });
      })
      .catch(err => {
        setError(err.message);
        console.error('[Print Test] Error:', err);
      });
  }, [fixtureName]);
  
  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Error: {error}
      </div>
    );
  }
  
  if (!bulletinData) {
    return (
      <div style={{ padding: '20px' }}>
        Loading fixture: {fixtureName}...
      </div>
    );
  }
  
  return (
    <>
      {/* Screen UI - hidden on print */}
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }} className="print:hidden">
        <h1>Print Test: {fixtureName}</h1>
        <p>Ready: {ready ? 'Yes' : 'No (fonts loading...)'}</p>
        <button
          onClick={() => window.print()}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            background: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Print
        </button>
      </div>
      
      {/* Print layout - always in DOM, visible only on print */}
      <div className="print-source-portal">
        <BulletinPrintLayout
          data={bulletinData}
          // @ts-ignore - mock profile for testing
          profile={mockProfile}
        />
      </div>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrintTestApp />
  </React.StrictMode>
);
