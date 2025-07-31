# Bulletin Customization Feature

## Overview

The bulletin customization feature allows users to personalize the appearance of their public bulletin view. Users can customize colors, fonts, themes, and branding options to match their ward's preferences.

## Features

### Color Customization
- **Primary Color**: Main color used for headers and important elements
- **Secondary Color**: Used for secondary text and accents
- **Background Color**: Main background color of the bulletin
- **Text Color**: Primary text color
- **Accent Color**: Used for highlights and interactive elements

### Typography
- **Font Family**: Choose from Serif (Traditional), Sans Serif (Modern), Monospace (Technical), or Cursive (Elegant)
- **Header Font Size**: Small, Medium, Large, or Extra Large
- **Body Font Size**: Small, Medium, or Large

### Themes
- **Classic**: Traditional church bulletin style
- **Modern**: Clean and contemporary design
- **Minimal**: Simple and uncluttered
- **Elegant**: Sophisticated and refined
- **Warm**: Friendly and inviting
- **Cool**: Professional and calm

### Layout Options
- **Header Style**: Centered, Left Aligned, or Bordered
- **Spacing**: Compact, Normal, or Spacious

### Branding
- **Show Branding**: Toggle to show/hide "Built with MyWardBulletin.com"
- **Custom Footer**: Optional custom footer text

## How to Use

1. **Access Customization**: In the bulletin editor, click on the "Customize" tab
2. **Choose Colors**: Use the color picker or select from preset color schemes
3. **Select Fonts**: Choose your preferred font family and sizes
4. **Pick a Theme**: Select from available themes to change the overall look
5. **Adjust Layout**: Customize header style and spacing
6. **Manage Branding**: Control whether to show the MyWardBulletin.com branding
7. **Preview**: Changes are applied in real-time to the preview
8. **Save**: Save your bulletin to preserve the customization settings

## Technical Implementation

### Database Schema
The customization settings are stored in a JSONB column called `customization` in the `bulletins` table:

```sql
ALTER TABLE bulletins 
ADD COLUMN customization JSONB DEFAULT '{
  "primaryColor": "#1e40af",
  "secondaryColor": "#3b82f6", 
  "backgroundColor": "#ffffff",
  "textColor": "#1f2937",
  "accentColor": "#10b981",
  "fontFamily": "serif",
  "headerFontSize": "large",
  "bodyFontSize": "medium",
  "theme": "classic",
  "showBranding": true,
  "headerStyle": "centered",
  "spacing": "normal"
}'::jsonb;
```

### TypeScript Types
The customization is defined in the `BulletinCustomization` interface:

```typescript
export interface BulletinCustomization {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: 'serif' | 'sans-serif' | 'monospace' | 'cursive';
  headerFontSize: 'small' | 'medium' | 'large' | 'xl';
  bodyFontSize: 'small' | 'medium' | 'large';
  theme: 'classic' | 'modern' | 'minimal' | 'elegant' | 'warm' | 'cool';
  showBranding: boolean;
  customLogo?: string;
  customFooter?: string;
  headerStyle: 'centered' | 'left-aligned' | 'bordered';
  spacing: 'compact' | 'normal' | 'spacious';
}
```

### Components
- **BulletinCustomization**: Main customization component with all options
- **BulletinPreview**: Updated to apply customization styles
- **PublicBulletinView**: Updated to respect branding settings

### CSS Variables
The customization uses CSS custom properties for dynamic styling:

```css
--primary-color: #1e40af;
--secondary-color: #3b82f6;
--background-color: #ffffff;
--text-color: #1f2937;
--accent-color: #10b981;
--font-family: Georgia, serif;
--header-font-size: 1.125rem;
--body-font-size: 1rem;
--spacing: 1rem;
```

## Default Values

When no customization is set, the system uses these default values:

```typescript
{
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
}
```

## Migration

To add this feature to an existing database, run the migration:

```bash
npx supabase db push
```

This will add the `customization` column to the `bulletins` table with the default values.

## Future Enhancements

Potential future improvements:
- Custom logo upload
- More theme options
- Advanced typography controls
- Custom CSS injection
- Template-based customization
- Ward-specific default settings 