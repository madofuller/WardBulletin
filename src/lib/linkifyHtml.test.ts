// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { linkifyHtml } from './linkifyHtml';

describe('linkifyHtml', () => {
  it('converts a bare http(s) URL into an anchor', () => {
    const result = linkifyHtml('<p>Sign up at https://forms.gle/abc today</p>');
    expect(result).toContain('<a href="https://forms.gle/abc" target="_blank" rel="noopener noreferrer">https://forms.gle/abc</a>');
    expect(result).toContain('Sign up at ');
    expect(result).toContain(' today');
  });

  it('prepends https:// to www URLs', () => {
    const result = linkifyHtml('<p>Visit www.example.com for details</p>');
    expect(result).toContain('href="https://www.example.com"');
    expect(result).toContain('>www.example.com</a>');
  });

  it('keeps an existing anchor but adds target and rel', () => {
    const result = linkifyHtml('<p><a href="https://example.com">Sign up here</a></p>');
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener noreferrer"');
    expect(result).toContain('>Sign up here</a>');
  });

  it('does not double-linkify URL text inside an existing anchor', () => {
    const result = linkifyHtml('<p><a href="https://example.com">https://example.com</a></p>');
    expect((result.match(/<a /g) ?? []).length).toBe(1);
  });

  it('excludes trailing punctuation from the link', () => {
    const result = linkifyHtml('<p>Go to https://forms.gle/abc.</p>');
    expect(result).toContain('href="https://forms.gle/abc"');
    expect(result).toContain('</a>.');
  });

  it('neutralizes javascript: hrefs to plain text', () => {
    const result = linkifyHtml('<p><a href="javascript:alert(1)">click</a></p>');
    expect(result).not.toContain('<a');
    expect(result).not.toContain('javascript:');
    expect(result).toContain('click');
  });

  it('leaves plain text without URLs unchanged', () => {
    const html = '<p>Relief Society meets Tuesday at 7pm</p>';
    expect(linkifyHtml(html)).toBe(html);
  });

  it('returns empty string unchanged', () => {
    expect(linkifyHtml('')).toBe('');
  });
});
