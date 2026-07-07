import { describe, it, expect } from 'vitest';
import { pickTokenRow } from './tokenResolution';

describe('pickTokenRow', () => {
  const ownerRow = { value: 'owner content', created_by: 'owner-id' };
  const editorRow = { value: 'editor content', created_by: 'editor-id' };

  it('returns null for missing or empty row sets', () => {
    expect(pickTokenRow(null, 'owner-id')).toBeNull();
    expect(pickTokenRow(undefined, 'owner-id')).toBeNull();
    expect(pickTokenRow([], 'owner-id')).toBeNull();
  });

  it('returns the single row when only one exists', () => {
    expect(pickTokenRow([ownerRow], 'owner-id')).toBe(ownerRow);
  });

  it('prefers the bulletin creator row when duplicates exist', () => {
    // The shared-editor scenario that used to make bulletins load blank:
    // the same key exists under both the owner and an editor.
    expect(pickTokenRow([editorRow, ownerRow], 'owner-id')).toBe(ownerRow);
    expect(pickTokenRow([ownerRow, editorRow], 'owner-id')).toBe(ownerRow);
  });

  it('falls back to another row when the creator has none (legacy editor-saved tokens)', () => {
    expect(pickTokenRow([editorRow], 'owner-id')).toBe(editorRow);
  });

  it('returns the first row when no preferred owner is given', () => {
    expect(pickTokenRow([editorRow, ownerRow])).toBe(editorRow);
    expect(pickTokenRow([editorRow, ownerRow], null)).toBe(editorRow);
  });
});
