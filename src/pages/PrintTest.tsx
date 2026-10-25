import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import BulletinPrintLayout from '../components/BulletinPrintLayout';
import { BulletinData } from '../types/bulletin';
import { createPortal } from 'react-dom';

/**
 * Test-only route for print regression testing.
 * Loads fixture data from URL param and renders the print layout.
 * 
 * Usage: /print-test?fixture=minimal (loads from /test-fixtures/minimal.json)
 */
export default function PrintTest() {
  const [searchParams] = useSearchParams();
  const [bulletinData, setBulletinData] = useState<BulletinData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const fixtureName = searchParams.get('fixture');

  // Create portal container on mount
  useEffect(() => {
    const container = document.createElement('div');
    container.className = 'print-source-portal';
    document.body.appendChild(container);
    setPortalContainer(container);

    return () => {
      document.body.removeChild(container);
    };
  }, []);

  useEffect(() => {
    if (!fixtureName) {
      setError('No fixture specified. Use ?fixture=minimal');
      return;
    }

    // Fetch fixture from public folder
    fetch(`/test-fixtures/${fixtureName}.json`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load fixture: ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        setBulletinData(data);
        // Expose to window for test inspection
        (window as any).__BULLETIN_DATA__ = data;
      })
      .catch(err => setError(err.message));
  }, [fixtureName]);

  if (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>Print Test Error</h1>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  if (!bulletinData) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <p>Loading fixture: {fixtureName}...</p>
      </div>
    );
  }

  // Mock profile for QR code generation
  const mockProfile = {
    profile_slug: 'test-ward',
  };

  return (
    <>
      {/* Screen view */}
      <div style={{ padding: '20px', fontFamily: 'sans-serif', background: '#f5f5f5' }}>
        <h1>Print Test: {fixtureName}</h1>
        <p>Press Ctrl/Cmd+P to print, or call window.print() from console</p>
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
            marginTop: '10px',
          }}
        >
          Print
        </button>
      </div>

      {/* Print portal - hidden on screen, shown on print */}
      {portalContainer && bulletinData && createPortal(
        <BulletinPrintLayout
          data={bulletinData}
          // @ts-ignore - passing mock profile for test
          profile={mockProfile}
        />,
        portalContainer
      )}
    </>
  );
}
