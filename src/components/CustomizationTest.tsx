import React, { useState } from 'react';
import { BulletinCustomization } from '../types/bulletin';
import { runCustomizationTests, testDefaultCustomization, testColorPresets } from '../lib/customization.test';

interface CustomizationTestProps {
  onClose: () => void;
}

export default function CustomizationTest({ onClose }: CustomizationTestProps) {
  const [customization, setCustomization] = useState<BulletinCustomization>(testDefaultCustomization);
  const [testResults, setTestResults] = useState<string[]>([]);

  const runTests = () => {
    const results: string[] = [];
    
    // Capture console.log output
    const originalLog = console.log;
    console.log = (...args) => {
      results.push(args.join(' '));
      originalLog(...args);
    };

    try {
      runCustomizationTests();
    } finally {
      console.log = originalLog;
    }

    setTestResults(results);
  };

  const applyPreset = (preset: typeof testColorPresets[0]) => {
    setCustomization(prev => ({
      ...prev,
      ...preset.colors
    }));
  };

  const updateCustomization = (updates: Partial<BulletinCustomization>) => {
    setCustomization(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Customization Test Panel</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Controls */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Controls</h3>
            
            <button
              onClick={runTests}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Run All Tests
            </button>

            <div className="space-y-2">
              <h4 className="font-medium">Color Presets</h4>
              {testColorPresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => applyPreset(preset)}
                  className="w-full text-left p-2 border rounded hover:bg-gray-50"
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Quick Tests</h4>
              <button
                onClick={() => updateCustomization({ theme: 'minimal', showBranding: false })}
                className="w-full text-left p-2 border rounded hover:bg-gray-50"
              >
                Minimal Theme (No Branding)
              </button>
              <button
                onClick={() => updateCustomization({ theme: 'warm', fontFamily: 'cursive' })}
                className="w-full text-left p-2 border rounded hover:bg-gray-50"
              >
                Warm Theme + Cursive Font
              </button>
              <button
                onClick={() => updateCustomization({ spacing: 'spacious', headerFontSize: 'xl' })}
                className="w-full text-left p-2 border rounded hover:bg-gray-50"
              >
                Spacious + Large Headers
              </button>
            </div>
          </div>

          {/* Current Customization */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Settings</h3>
            
            <div className="space-y-2 text-sm">
              <div><strong>Theme:</strong> {customization.theme}</div>
              <div><strong>Font Family:</strong> {customization.fontFamily}</div>
              <div><strong>Header Size:</strong> {customization.headerFontSize}</div>
              <div><strong>Body Size:</strong> {customization.bodyFontSize}</div>
              <div><strong>Spacing:</strong> {customization.spacing}</div>
              <div><strong>Show Branding:</strong> {customization.showBranding ? 'Yes' : 'No'}</div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Colors</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries({
                  Primary: customization.primaryColor,
                  Secondary: customization.secondaryColor,
                  Background: customization.backgroundColor,
                  Text: customization.textColor,
                  Accent: customization.accentColor
                }).map(([name, color]) => (
                  <div key={name} className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs">{name}: {color}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Test Results</h3>
            <div className="bg-gray-100 p-4 rounded max-h-40 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Live Preview</h3>
          <div
            className="border rounded p-4"
            style={{
              backgroundColor: customization.backgroundColor,
              color: customization.textColor,
              fontFamily: customization.fontFamily === 'serif' ? 'Georgia, serif' :
                         customization.fontFamily === 'sans-serif' ? 'Arial, sans-serif' :
                         customization.fontFamily === 'monospace' ? 'Courier New, monospace' :
                         'Brush Script MT, cursive',
              fontSize: customization.bodyFontSize === 'small' ? '0.875rem' :
                       customization.bodyFontSize === 'medium' ? '1rem' : '1.125rem'
            }}
          >
            <div
              className="text-center mb-4 p-3 border-b"
              style={{
                backgroundColor: customization.theme === 'minimal' ? 'transparent' :
                               customization.theme === 'modern' ? '#f8fafc' :
                               customization.theme === 'warm' ? '#fef3c7' :
                               customization.theme === 'cool' ? '#f0f9ff' :
                               customization.theme === 'elegant' ? '#faf5ff' : '#f3f4f6'
              }}
            >
              <h1
                style={{
                  color: customization.primaryColor,
                  fontSize: customization.headerFontSize === 'small' ? '0.875rem' :
                           customization.headerFontSize === 'medium' ? '1rem' :
                           customization.headerFontSize === 'large' ? '1.125rem' : '1.25rem'
                }}
              >
                Sample Ward Name
              </h1>
              <h2
                style={{
                  color: customization.textColor,
                  fontSize: `calc(${customization.headerFontSize === 'small' ? '0.875rem' :
                                   customization.headerFontSize === 'medium' ? '1rem' :
                                   customization.headerFontSize === 'large' ? '1.125rem' : '1.25rem'} * 1.2)`
                }}
              >
                Sacrament Meeting
              </h2>
              <p style={{ color: customization.secondaryColor }}>
                Sunday, January 1, 2024
              </p>
            </div>
            
            <div style={{ marginBottom: customization.spacing === 'compact' ? '0.5rem' :
                                              customization.spacing === 'normal' ? '1rem' : '1.5rem' }}>
              <p>This is a sample bulletin preview showing how your customization settings will look.</p>
            </div>

            {customization.showBranding && (
              <div className="text-center mt-4 pt-3 border-t" style={{ color: customization.secondaryColor }}>
                <p className="text-xs">Built with MyWardBulletin.com</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 