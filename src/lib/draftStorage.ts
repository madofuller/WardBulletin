import { BulletinData } from '../types/bulletin';

// The editor's unsaved-work draft. Lifecycle rule: a draft exists only while
// there is work that has not reached the cloud. Saving, loading a saved
// bulletin, or applying a template clears it. That makes "a draft exists"
// a reliable signal that local data is newer than the cloud, so restoring
// it can never lose anything.
const DRAFT_KEY = 'draft_bulletin';

export interface DraftEnvelope {
  data: BulletinData;
  /** Epoch ms of the last local edit; 0 for legacy drafts of unknown age. */
  savedAt: number;
  /** Cloud bulletin being edited when the draft was written, if any. */
  bulletinId: string | null;
  /**
   * Signed-in user who wrote the draft; null when written while signed out
   * (that draft is adopted by whoever signs in next, which is the save-before-
   * sign-in flow). A draft owned by a different user must never be restored.
   */
  userId: string | null;
}

export function readDraft(): DraftEnvelope | null {
  let raw: string | null;
  try {
    raw = localStorage.getItem(DRAFT_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'data' in parsed && 'savedAt' in parsed) {
      return {
        data: parsed.data as BulletinData,
        savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : 0,
        bulletinId: typeof parsed.bulletinId === 'string' ? parsed.bulletinId : null,
        userId: typeof parsed.userId === 'string' ? parsed.userId : null,
      };
    }
    // Legacy format: the bulletin data was stored bare, with no timestamp.
    // savedAt 0 marks it as unknown age, so cloud data is allowed to win.
    return { data: parsed as BulletinData, savedAt: 0, bulletinId: null, userId: null };
  } catch {
    clearDraft();
    return null;
  }
}

export function writeDraft(data: BulletinData, bulletinId: string | null, userId: string | null = null): void {
  const envelope: DraftEnvelope = { data, savedAt: Date.now(), bulletinId, userId };
  let serialized: string;
  try {
    serialized = JSON.stringify(envelope);
  } catch {
    return;
  }

  // localStorage is typically capped at 5-10MB; refuse oversized drafts and
  // shed the bulletin cache (wardbulletin_*) under quota pressure.
  if (serialized.length > 4 * 1024 * 1024) {
    clearBulletinCache();
    if (serialized.length > 4 * 1024 * 1024) return;
  }

  try {
    localStorage.setItem(DRAFT_KEY, serialized);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearBulletinCache();
      try {
        localStorage.setItem(DRAFT_KEY, serialized);
      } catch {
        // Still out of space; drop the draft write rather than crash typing.
      }
    }
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Storage unavailable (private mode, disabled) — nothing to clear.
  }
}

// Under quota pressure, shed only re-fetchable caches. wardbulletin_templates
// is the user's own saved templates — localStorage is its ONLY copy, so
// deleting it is permanent data loss, not cache eviction.
const QUOTA_CLEANUP_KEEP = new Set(['wardbulletin_templates']);

function clearBulletinCache(): void {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('wardbulletin_') && key !== DRAFT_KEY && !QUOTA_CLEANUP_KEEP.has(key)) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    // Best-effort cleanup only.
  }
}
