import { describe, it, expect } from 'vitest';
import { decodeHtml } from './decodeHtml';

describe('decodeHtml', () => {
  it('keeps a literal plus sign in normal text', () => {
    expect(decodeHtml('Youth ages 12+ welcome')).toBe('Youth ages 12+ welcome');
    expect(decodeHtml('1+1 study groups')).toBe('1+1 study groups');
  });

  it('still decodes legacy URL-encoded text', () => {
    expect(decodeHtml('Ward%20Picnic%20%2D%20Saturday')).toBe('Ward Picnic - Saturday');
  });

  it('treats + as space only in form-encoded text', () => {
    expect(decodeHtml('Ward+Picnic%21')).toBe('Ward Picnic!');
  });

  it('decodes HTML entities', () => {
    expect(decodeHtml('Fish &amp; Chips&#33;')).toBe('Fish & Chips!');
  });
});
