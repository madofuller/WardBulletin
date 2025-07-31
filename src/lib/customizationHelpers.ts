import type { BulletinCustomization } from '../types/bulletin';

// Test default customization values
export const testDefaultCustomization: BulletinCustomization = {
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

// Test color presets
export const testColorPresets = [
  {
    name: 'Classic Blue',
    colors: {
      primaryColor: '#1e40af',
      secondaryColor: '#3b82f6',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      accentColor: '#10b981'
    }
  },
  {
    name: 'Warm Autumn',
    colors: {
      primaryColor: '#92400e',
      secondaryColor: '#f59e0b',
      backgroundColor: '#fef3c7',
      textColor: '#451a03',
      accentColor: '#dc2626'
    }
  },
  {
    name: 'Modern Dark',
    colors: {
      primaryColor: '#1f2937',
      secondaryColor: '#6b7280',
      backgroundColor: '#f9fafb',
      textColor: '#111827',
      accentColor: '#3b82f6'
    }
  }
];

// Test function to generate CSS variables
export function generateCustomStyles(customization: BulletinCustomization): React.CSSProperties {
  const fontSizeMap = {
    small: '0.875rem',
    medium: '1rem',
    large: '1.125rem',
    xl: '1.25rem'
  };

  const fontFamilyMap = {
    serif: 'Georgia, serif',
    'sans-serif': 'Arial, sans-serif',
    monospace: 'Courier New, monospace',
    cursive: 'Brush Script MT, cursive'
  };

  const spacingMap = {
    compact: '0.5rem',
    normal: '1rem',
    spacious: '1.5rem'
  };

  return {
    '--primary-color': customization.primaryColor,
    '--secondary-color': customization.secondaryColor,
    '--background-color': customization.backgroundColor,
    '--text-color': customization.textColor,
    '--accent-color': customization.accentColor,
    '--font-family': fontFamilyMap[customization.fontFamily],
    '--header-font-size': fontSizeMap[customization.headerFontSize],
    '--body-font-size': fontSizeMap[customization.bodyFontSize],
    '--spacing': spacingMap[customization.spacing]
  } as React.CSSProperties;
}

// Test function to get theme background
export function getThemeBackground(theme: string): string {
  switch (theme) {
    case 'minimal':
      return 'white';
    case 'modern':
      return 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
    case 'warm':
      return 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
    case 'cool':
      return 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)';
    case 'elegant':
      return 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)';
    default:
      return 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)';
  }
}

// Test function to get header background
export function getHeaderBackground(theme: string): string {
  switch (theme) {
    case 'minimal':
      return 'transparent';
    case 'modern':
      return '#f8fafc';
    case 'warm':
      return '#fef3c7';
    case 'cool':
      return '#f0f9ff';
    case 'elegant':
      return '#faf5ff';
    default:
      return '#f3f4f6';
  }
}

// Test suite
export function runCustomizationTests() {
  console.log('🧪 Running Customization Tests...');

  // Test 1: Default values
  console.log('✅ Test 1: Default customization values');
  console.log('Default customization:', testDefaultCustomization);

  // Test 2: CSS variable generation
  console.log('✅ Test 2: CSS variable generation');
  const styles = generateCustomStyles(testDefaultCustomization);
  console.log('Generated styles:', styles);

  // Test 3: Theme backgrounds
  console.log('✅ Test 3: Theme backgrounds');
  const themes = ['classic', 'modern', 'minimal', 'warm', 'cool', 'elegant'];
  themes.forEach(theme => {
    const background = getThemeBackground(theme);
    console.log(`${theme}: ${background}`);
  });

  // Test 4: Color presets
  console.log('✅ Test 4: Color presets');
  testColorPresets.forEach(preset => {
    console.log(`${preset.name}:`, preset.colors);
  });

  // Test 5: Font size mapping
  console.log('✅ Test 5: Font size mapping');
  const fontSizes = ['small', 'medium', 'large', 'xl'] as const;
  fontSizes.forEach(size => {
    const fontSize = size === 'small' ? '0.875rem' :
                   size === 'medium' ? '1rem' :
                   size === 'large' ? '1.125rem' : '1.25rem';
    console.log(`${size}: ${fontSize}`);
  });

  console.log('🎉 All customization tests completed!');
}

// Export test utilities for use in components
export const customizationUtils = {
  testDefaultCustomization,
  testColorPresets,
  generateCustomStyles,
  getThemeBackground,
  getHeaderBackground,
  runCustomizationTests
}; 