import { describe, it, expect } from 'vitest';
import {
  searchSongsByTitle,
  getSongTitle,
  isValidSongNumber,
  getMaxHymnNumber,
} from './songService';

describe('songService', () => {
  describe('searchSongsByTitle', () => {
    it('returns results for known hymns', () => {
      const results = searchSongsByTitle('come');
      expect(results.length).toBeGreaterThan(0);
    });

    it('returns empty array for empty string', () => {
      const results = searchSongsByTitle('');
      expect(results).toEqual([]);
    });

    it('returns empty array for whitespace-only string', () => {
      const results = searchSongsByTitle('   ');
      expect(results).toEqual([]);
    });

    it('puts prefix matches first (sortResults behavior)', () => {
      const results = searchSongsByTitle('The Spirit');
      // "The Spirit of God" should appear before non-prefix matches
      if (results.length > 1) {
        expect(results[0].title.toLowerCase().startsWith('the spirit')).toBe(true);
      }
    });
  });

  describe('getSongTitle', () => {
    it('returns correct title for hymn #2 in English', () => {
      const title = getSongTitle('2', 'hymn', 'en');
      expect(title).toBe('The Spirit of God');
    });

    it('falls back to English for unknown language', () => {
      const title = getSongTitle('2', 'hymn', 'xx');
      expect(title).toBe('The Spirit of God');
    });
  });

  describe('isValidSongNumber', () => {
    it('returns true for valid hymn numbers', () => {
      expect(isValidSongNumber('1', 'hymn')).toBe(true);
      expect(isValidSongNumber('100', 'hymn')).toBe(true);
      expect(isValidSongNumber('341', 'hymn')).toBe(true);
    });

    it('returns false for invalid hymn numbers', () => {
      expect(isValidSongNumber('0', 'hymn')).toBe(false);
      expect(isValidSongNumber('999', 'hymn')).toBe(false);
      expect(isValidSongNumber('-1', 'hymn')).toBe(false);
    });
  });

  describe('getMaxHymnNumber', () => {
    it('returns 341 for English', () => {
      expect(getMaxHymnNumber('en')).toBe(341);
    });

    it('returns 341 for unknown language (fallback)', () => {
      expect(getMaxHymnNumber('xx')).toBe(341);
    });
  });
});
