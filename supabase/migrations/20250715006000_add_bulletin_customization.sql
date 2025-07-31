-- Add customization column to bulletins table
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

-- Add comment to explain the customization field
COMMENT ON COLUMN bulletins.customization IS 'JSON object containing bulletin appearance customization settings including colors, fonts, themes, and branding options'; 