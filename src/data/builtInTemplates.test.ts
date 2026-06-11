import { describe, it, expect } from 'vitest';
import { BUILT_IN_TEMPLATES } from './builtInTemplates';

describe('BUILT_IN_TEMPLATES', () => {
  it('has exactly 5 templates (baptism lives in the dedicated /baptism editor)', () => {
    expect(BUILT_IN_TEMPLATES).toHaveLength(5);
  });

  it('does not include a baptism template', () => {
    expect(BUILT_IN_TEMPLATES.some(t => t.id === 'builtin-baptism')).toBe(false);
  });

  it('each template has required fields: id, nameKey, descriptionKey, icon, data', () => {
    for (const template of BUILT_IN_TEMPLATES) {
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('nameKey');
      expect(template).toHaveProperty('descriptionKey');
      expect(template).toHaveProperty('icon');
      expect(template).toHaveProperty('data');
      expect(typeof template.id).toBe('string');
      expect(typeof template.nameKey).toBe('string');
      expect(typeof template.descriptionKey).toBe('string');
      expect(typeof template.icon).toBe('string');
    }
  });

  it('each template data has meetingType and agenda array', () => {
    for (const template of BUILT_IN_TEMPLATES) {
      expect(template.data).toHaveProperty('meetingType');
      expect(template.data).toHaveProperty('agenda');
      expect(Array.isArray(template.data.agenda)).toBe(true);
    }
  });

  it('each template has a unique id', () => {
    const ids = BUILT_IN_TEMPLATES.map(t => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('agenda items have valid types', () => {
    const validTypes = ['speaker', 'musical', 'testimony', 'sacrament', 'baby_blessing', 'baptism_ordinance', 'confirmation'];
    for (const template of BUILT_IN_TEMPLATES) {
      for (const item of template.data.agenda!) {
        expect(validTypes).toContain(item.type);
      }
    }
  });
});
