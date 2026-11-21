import { pushDocument, fetchDocuments } from './userDocuments';

export interface Template {
  id: string;
  name: string;
  data: import('../types/bulletin').BulletinData;
  /** Epoch ms of the last change, used to merge with the cloud copy. */
  updatedAt?: number;
}

const STORAGE_KEY = 'wardbulletin_templates';
const ACTIVE_TEMPLATE_KEY = 'active_template_id';

function loadTemplates(): Template[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as Template[] : [];
  } catch {
    return [];
  }
}

function saveTemplates(templates: Template[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    return true;
  } catch {
    // Quota exceeded or storage unavailable (e.g. private browsing).
    return false;
  }
}

function loadActiveTemplateId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_TEMPLATE_KEY);
  } catch {
    return null;
  }
}

function saveActiveTemplateId(id: string | null) {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_TEMPLATE_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_TEMPLATE_KEY);
    }
  } catch {
    // ignore
  }
}

export const templateService = {
  listTemplates(): Template[] {
    return loadTemplates();
  },
  getTemplate(id: string): Template | undefined {
    return loadTemplates().find(t => t.id === id);
  },
  saveTemplate(name: string, data: import('../types/bulletin').BulletinData): Template | null {
    const templates = loadTemplates();
    const template = { id: `tmpl-${Date.now()}`, name, data, updatedAt: Date.now() } as Template;
    templates.push(template);
    if (!saveTemplates(templates)) return null;
    void pushDocument('template', template.id, template);
    return template;
  },
  deleteTemplate(id: string): boolean {
    const templates = loadTemplates().filter(t => t.id !== id);
    if (!saveTemplates(templates)) return false;
    // Keep a tombstone in the cloud so other devices drop it too
    void pushDocument('template', id, {}, true);
    const activeId = loadActiveTemplateId();
    if (activeId === id) {
      saveActiveTemplateId(null);
    }
    return true;
  },
  renameTemplate(id: string, name: string): boolean {
    const templates = loadTemplates().map(t => t.id === id ? { ...t, name, updatedAt: Date.now() } : t);
    if (!saveTemplates(templates)) return false;
    const renamed = templates.find(t => t.id === id);
    if (renamed) void pushDocument('template', id, renamed);
    return true;
  },
  getActiveTemplateId(): string | null {
    return loadActiveTemplateId();
  },
  setActiveTemplateId(id: string | null) {
    saveActiveTemplateId(id);
  },
  /**
   * Merge this browser's templates with the signed-in user's cloud copy: newest
   * change wins per template, cloud deletions apply here, and templates only
   * this browser has are uploaded. Safe to call any time; no-op when signed out.
   */
  async syncWithCloud(): Promise<void> {
    const cloud = await fetchDocuments<Template>('template');
    if (!cloud) return;
    const local = loadTemplates();
    const byId = new Map(local.map(t => [t.id, t]));
    const cloudIds = new Set<string>();
    let changed = false;

    for (const doc of cloud) {
      cloudIds.add(doc.doc_key);
      const cloudTime = new Date(doc.updated_at).getTime();
      const mine = byId.get(doc.doc_key);
      if (doc.deleted) {
        if (mine && (mine.updatedAt ?? 0) <= cloudTime) {
          byId.delete(doc.doc_key);
          changed = true;
        }
        continue;
      }
      if (!mine || (mine.updatedAt ?? 0) < cloudTime) {
        byId.set(doc.doc_key, { ...(doc.data as Template), id: doc.doc_key, updatedAt: cloudTime });
        changed = true;
      } else if ((mine.updatedAt ?? 0) > cloudTime) {
        void pushDocument('template', mine.id, mine);
      }
    }
    // Templates created on this browser before cloud sync existed
    for (const t of local) {
      if (!cloudIds.has(t.id)) void pushDocument('template', t.id, t);
    }
    if (changed) saveTemplates(Array.from(byId.values()));
  }
};

export default templateService;
