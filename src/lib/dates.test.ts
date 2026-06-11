import { describe, it, expect } from 'vitest';
import { upcomingSundayISO } from './dates';

describe('upcomingSundayISO', () => {
  it('returns the same day when it is already Sunday', () => {
    expect(upcomingSundayISO(new Date(2026, 5, 14))).toBe('2026-06-14'); // a Sunday
  });

  it('returns the next Sunday from a Monday', () => {
    expect(upcomingSundayISO(new Date(2026, 5, 8))).toBe('2026-06-14');
  });

  it('returns the next Sunday from a Saturday', () => {
    expect(upcomingSundayISO(new Date(2026, 5, 13))).toBe('2026-06-14');
  });

  it('crosses month boundaries', () => {
    expect(upcomingSundayISO(new Date(2026, 5, 29))).toBe('2026-07-05'); // Mon Jun 29 -> Sun Jul 5
  });

  it('crosses year boundaries', () => {
    expect(upcomingSundayISO(new Date(2026, 11, 28))).toBe('2027-01-03'); // Mon Dec 28 -> Sun Jan 3
  });

  it('zero-pads month and day', () => {
    expect(upcomingSundayISO(new Date(2026, 0, 2))).toBe('2026-01-04'); // Fri Jan 2 -> Sun Jan 4
  });
});
