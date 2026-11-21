export function decodeHtml(html: string): string {
  if (!html) return '';
  
  // First, decode URL-encoded characters (%20, %2D, etc.)
  // This fixes issues where URLs or text got URL-encoded (like %20 for space, %2D for hyphen)
  let decoded = html;
  // Only URL-decode text that actually contains %XX escapes. A '+' means a space
  // only in form-encoded text, which never contains literal spaces; in normal text
  // it's a real plus ("Ages 12+") and must survive.
  const looksUrlEncoded = /%[0-9A-Fa-f]{2}/.test(html);
  try {
    if (looksUrlEncoded) {
      const formEncoded = !/\s/.test(html);
      decoded = decodeURIComponent(formEncoded ? html.replace(/\+/g, ' ') : html);
    }
  } catch (e) {
    // If decodeURIComponent fails (invalid encoding), try partial decoding
    // This handles cases where only some parts are URL-encoded
    decoded = html.replace(/%([0-9A-Fa-f]{2})/g, (match, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch {
        return match; // Return original if decoding fails
      }
    });
  }
  
  // Decode numeric HTML entities (&#160;, &#32;, etc.)
  decoded = decoded.replace(/&#(\d+);/g, (match, num) => {
    try {
      return String.fromCharCode(parseInt(num, 10));
    } catch {
      return match;
    }
  });
  
  // Decode hex HTML entities (&#x20;, &#xA0;, etc.)
  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
    try {
      return String.fromCharCode(parseInt(hex, 16));
    } catch {
      return match;
    }
  });
  
  // Decode named HTML entities
  decoded = decoded
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&apos;/g, "'");
  
  // Clean up common encoding artifacts:
  // Remove standalone dots on their own lines (common encoding artifact that creates extra spacing)
  decoded = decoded.replace(/^\.\s*$/gm, '');
  
  return decoded;
}
