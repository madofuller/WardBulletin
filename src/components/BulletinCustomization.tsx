import React from 'react';
import { Palette, Type, Layout, Eye, EyeOff } from 'lucide-react';
import type { BulletinCustomization } from '../types/bulletin';

interface BulletinCustomizationProps {
  customization: BulletinCustomization;
  onChange: (customization: BulletinCustomization) => void;
}

const defaultCustomization: BulletinCustomization = {
  primaryColor: '#1e40af',
  secondaryColor: '#3b82f6',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  accentColor: '#10b981',
  fontFamily: 'serif',
  headerFontSize: 'large',
  bodyFontSize: 'medium',
  theme: 'classic',
  showBranding: true,
  headerStyle: 'centered',
  spacing: 'normal'
};

const colorPresets = [
  { name: 'Classic Blue', primary: '#1e40af', secondary: '#3b82f6', accent: '#10b981' },
  { name: 'Warm Red', primary: '#dc2626', secondary: '#ef4444', accent: '#f59e0b' },
  { name: 'Forest Green', primary: '#059669', secondary: '#10b981', accent: '#84cc16' },
  { name: 'Purple', primary: '#7c3aed', secondary: '#8b5cf6', accent: '#ec4899' },
  { name: 'Gray', primary: '#374151', secondary: '#6b7280', accent: '#9ca3af' },
  { name: 'Custom', primary: '#1e40af', secondary: '#3b82f6', accent: '#10b981' }
];

const fontFamilies = [
  { value: 'serif', label: 'Serif (Traditional)' },
  { value: 'sans-serif', label: 'Sans Serif (Modern)' },
  { value: 'monospace', label: 'Monospace (Technical)' },
  { value: 'cursive', label: 'Cursive (Elegant)' }
];

const themes = [
  { value: 'classic', label: 'Classic', description: 'Traditional church bulletin style' },
  { value: 'modern', label: 'Modern', description: 'Clean and contemporary design' },
  { value: 'minimal', label: 'Minimal', description: 'Simple and uncluttered' },
  { value: 'elegant', label: 'Elegant', description: 'Sophisticated and refined' },
  { value: 'warm', label: 'Warm', description: 'Friendly and inviting' },
  { value: 'cool', label: 'Cool', description: 'Professional and calm' }
];

const headerStyles = [
  { value: 'centered', label: 'Centered' },
  { value: 'left-aligned', label: 'Left Aligned' },
  { value: 'bordered', label: 'Bordered' }
];

const spacingOptions = [
  { value: 'compact', label: 'Compact' },
  { value: 'normal', label: 'Normal' },
  { value: 'spacious', label: 'Spacious' }
];

export default function BulletinCustomization({ customization, onChange }: BulletinCustomizationProps) {
  const updateCustomization = (updates: Partial<BulletinCustomization>) => {
    onChange({ ...customization, ...updates });
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    updateCustomization({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent
    });
  };

  return (
    <div className="space-y-6">
      {/* Color Scheme */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Palette className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Color Scheme</h3>
        </div>
        
        {/* Color Presets */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quick Presets</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyColorPreset(preset)}
                className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex space-x-1">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: preset.secondary }}
                  />
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
                <span className="text-xs text-gray-700">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={customization.primaryColor}
                onChange={(e) => updateCustomization({ primaryColor: e.target.value })}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={customization.primaryColor}
                onChange={(e) => updateCustomization({ primaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="#1e40af"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={customization.secondaryColor}
                onChange={(e) => updateCustomization({ secondaryColor: e.target.value })}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={customization.secondaryColor}
                onChange={(e) => updateCustomization({ secondaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="#3b82f6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={customization.backgroundColor}
                onChange={(e) => updateCustomization({ backgroundColor: e.target.value })}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={customization.backgroundColor}
                onChange={(e) => updateCustomization({ backgroundColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={customization.textColor}
                onChange={(e) => updateCustomization({ textColor: e.target.value })}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={customization.textColor}
                onChange={(e) => updateCustomization({ textColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="#1f2937"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Type className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Typography</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
            <select
              value={customization.fontFamily}
              onChange={(e) => updateCustomization({ fontFamily: e.target.value as BulletinCustomization['fontFamily'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {fontFamilies.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Header Font Size</label>
            <select
              value={customization.headerFontSize}
              onChange={(e) => updateCustomization({ headerFontSize: e.target.value as BulletinCustomization['headerFontSize'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="xl">Extra Large</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Body Font Size</label>
            <select
              value={customization.bodyFontSize}
              onChange={(e) => updateCustomization({ bodyFontSize: e.target.value as BulletinCustomization['bodyFontSize'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Layout className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Theme & Layout</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <select
              value={customization.theme}
              onChange={(e) => updateCustomization({ theme: e.target.value as BulletinCustomization['theme'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {themes.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {themes.find(t => t.value === customization.theme)?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Header Style</label>
            <select
              value={customization.headerStyle}
              onChange={(e) => updateCustomization({ headerStyle: e.target.value as BulletinCustomization['headerStyle'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {headerStyles.map((style) => (
                <option key={style.value} value={style.value}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Spacing</label>
            <select
              value={customization.spacing}
              onChange={(e) => updateCustomization({ spacing: e.target.value as BulletinCustomization['spacing'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {spacingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          {customization.showBranding ? (
            <Eye className="w-5 h-5 text-gray-600" />
          ) : (
            <EyeOff className="w-5 h-5 text-gray-600" />
          )}
          <h3 className="text-lg font-semibold text-gray-900">Branding</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="showBranding"
              checked={customization.showBranding}
              onChange={(e) => updateCustomization({ showBranding: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="showBranding" className="text-sm font-medium text-gray-700">
              Show "Built with MyWardBulletin.com" branding
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Footer Text</label>
            <input
              type="text"
              value={customization.customFooter || ''}
              onChange={(e) => updateCustomization({ customFooter: e.target.value })}
              placeholder="Optional custom footer text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={() => onChange(defaultCustomization)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
} 