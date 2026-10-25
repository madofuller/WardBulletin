/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './sanitizeHtml';

describe('sanitizeHtml', () => {
  it('strips script tags and event handlers', () => {
    const dirty = '<img src="x" onerror="alert(1)"><script>alert(1)</script>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toMatch(/<script>/);
    expect(clean).not.toMatch(/onerror/);
  });

  it('preserves safe markup', () => {
    const html = '<p><strong>Hi</strong></p>';
    expect(sanitizeHtml(html)).toBe(html);
  });
});
