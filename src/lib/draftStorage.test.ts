// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { readDraft, writeDraft, clearDraft } from './draftStorage';
import type { BulletinData } from '../types/bulletin';

const sampleData = { wardName: 'Sunset Hills Ward', date: '2026-06-14' } as BulletinData;

beforeEach(() => {
  localStorage.clear();
});

describe('draftStorage', () => {
  it('round-trips a draft with timestamp and bulletin id', () => {
    const before = Date.now();
    writeDraft(sampleData, 'bulletin-123');
    const draft = readDraft();
    expect(draft).not.toBeNull();
    expect(draft!.data.wardName).toBe('Sunset Hills Ward');
    expect(draft!.bulletinId).toBe('bulletin-123');
    expect(draft!.savedAt).toBeGreaterThanOrEqual(before);
  });

  it('stores null bulletinId for anonymous drafts', () => {
    writeDraft(sampleData, null);
    expect(readDraft()!.bulletinId).toBeNull();
  });

  it('reads legacy bare-data drafts as savedAt 0', () => {
    localStorage.setItem('draft_bulletin', JSON.stringify(sampleData));
    const draft = readDraft();
    expect(draft).not.toBeNull();
    expect(draft!.data.wardName).toBe('Sunset Hills Ward');
    expect(draft!.savedAt).toBe(0);
    expect(draft!.bulletinId).toBeNull();
  });

  it('returns null when no draft exists', () => {
    expect(readDraft()).toBeNull();
  });

  it('clears corrupt drafts instead of throwing', () => {
    localStorage.setItem('draft_bulletin', '{not json');
    expect(readDraft()).toBeNull();
    expect(localStorage.getItem('draft_bulletin')).toBeNull();
  });

  it('clearDraft removes the draft', () => {
    writeDraft(sampleData, null);
    clearDraft();
    expect(readDraft()).toBeNull();
  });
});
