import { describe, it, expect } from 'vitest';
import { upcomingSundayISO, nextBulletinDateISO } from './dates';

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

describe('nextBulletinDateISO', () => {
  const mon = new Date(2026, 10, 23); // Mon Nov 23 2026; upcoming Sunday is Nov 29

  it('moves a copy of this week\'s bulletin to the following Sunday', () => {
    expect(nextBulletinDateISO('2026-11-29', mon)).toBe('2026-12-06');
  });

  it('moves a copy of last Sunday\'s bulletin to the upcoming Sunday', () => {
    expect(nextBulletinDateISO('2026-11-22', mon)).toBe('2026-11-29');
  });

  it('never dates a copy of an old template in the past', () => {
    expect(nextBulletinDateISO('2025-07-27', mon)).toBe('2026-11-29');
  });

  it('handles a non-Sunday source date', () => {
    expect(nextBulletinDateISO('2026-12-02', mon)).toBe('2026-12-06');
  });

  it('falls back to the upcoming Sunday for a missing or bad date', () => {
    expect(nextBulletinDateISO(undefined, mon)).toBe('2026-11-29');
    expect(nextBulletinDateISO('not a date', mon)).toBe('2026-11-29');
  });
});
