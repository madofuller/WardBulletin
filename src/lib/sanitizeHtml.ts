import * as DOMPurifyModule from 'dompurify';

const DOMPurify =
  (DOMPurifyModule as { default?: { sanitize: typeof import('dompurify')['sanitize'] } }).default ??
  (DOMPurifyModule as { sanitize: typeof import('dompurify')['sanitize'] });

export function sanitizeHtml(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'div', 'span', 'a', 'img'
    ],
    ALLOWED_ATTR: ['class', 'style', 'href', 'target', 'rel', 'src', 'alt'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false
  });
}
