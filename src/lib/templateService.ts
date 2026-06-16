export interface Template {
  id: string;
  name: string;
  data: import('../types/bulletin').BulletinData;
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
    const template = { id: `tmpl-${Date.now()}`, name, data } as Template;
    templates.push(template);
    return saveTemplates(templates) ? template : null;
  },
  deleteTemplate(id: string): boolean {
    const templates = loadTemplates().filter(t => t.id !== id);
    if (!saveTemplates(templates)) return false;
    const activeId = loadActiveTemplateId();
    if (activeId === id) {
      saveActiveTemplateId(null);
    }
    return true;
  },
  renameTemplate(id: string, name: string): boolean {
    const templates = loadTemplates().map(t => t.id === id ? { ...t, name } : t);
    return saveTemplates(templates);
  },
  getActiveTemplateId(): string | null {
    return loadActiveTemplateId();
  },
  setActiveTemplateId(id: string | null) {
    saveActiveTemplateId(id);
  }
};

export default templateService;
