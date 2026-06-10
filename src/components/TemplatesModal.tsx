import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Edit, FileText } from 'lucide-react';
import templateService, { Template } from '../lib/templateService';
import { BUILT_IN_TEMPLATES, BuiltInTemplate } from '../data/builtInTemplates';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: Template | null, builtIn?: BuiltInTemplate) => void;
}

export default function TemplatesModal({ isOpen, onClose, onSelect }: TemplatesModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTemplates(templateService.listTemplates());
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleDelete = (id: string) => {
    if (!confirm(t('modals.confirmDelete'))) return;
    templateService.deleteTemplate(id);
    setTemplates(templateService.listTemplates());
  };

  const startRename = (t: Template) => {
    setRenameId(t.id);
    setNewName(t.name);
  };

  const commitRename = () => {
    if (renameId) {
      templateService.renameTemplate(renameId, newName);
      setTemplates(templateService.listTemplates());
      setRenameId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div role="dialog" aria-modal="true" aria-labelledby="templates-modal-title" className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 id="templates-modal-title" className="text-xl font-semibold">{t('bulletin.bulletinTemplates')}</h3>
          <button autoFocus onClick={onClose} aria-label={t('common.close')} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <button
            className="w-full flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => { onSelect(null); }}
          >
            {t('bulletin.blankBulletin')}
          </button>

          {/* Built-in Quick Start Templates */}
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t('templates.quickStart')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BUILT_IN_TEMPLATES.filter(tmpl => tmpl.id !== 'builtin-baptism').map(tmpl => (
                <button
                  key={tmpl.id}
                  onClick={() => onSelect(null, tmpl)}
                  className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                >
                  <span className="text-xl flex-shrink-0">{tmpl.icon}</span>
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-gray-900">{t(tmpl.nameKey)}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t(tmpl.descriptionKey)}</div>
                  </div>
                </button>
              ))}
              {/* Baptism links to dedicated page */}
              <button
                onClick={() => { onClose(); navigate('/baptism'); }}
                className="flex items-start gap-2 p-3 border border-cyan-200 rounded-lg hover:border-cyan-400 hover:bg-cyan-50 transition-colors text-left"
              >
                <span className="text-xl flex-shrink-0">💧</span>
                <div className="min-w-0">
                  <div className="font-medium text-sm text-gray-900">{t('templates.baptismProgram')}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{t('templates.baptismProgramDesc')}</div>
                </div>
              </button>
            </div>
          </div>

          {/* User-saved Templates */}
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t('templates.yourTemplates')}
            </h4>
            {templates.length === 0 && (
              <div className="text-center text-gray-500 py-6">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">{t('bulletin.noTemplatesSaved')}</p>
              </div>
            )}
            {templates.map(tmpl => (
              <div key={tmpl.id} className="border rounded-lg p-3 flex justify-between items-center mb-2">
                {renameId === tmpl.id ? (
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={e => { if (e.key === 'Enter') commitRename(); }}
                    className="flex-1 border px-2 py-1 mr-2 rounded"
                  />
                ) : (
                  <span className="flex-1" onDoubleClick={() => startRename(tmpl)}>{tmpl.name}</span>
                )}
                <div className="flex items-center space-x-2">
                  <button onClick={() => onSelect(tmpl)} className="px-2 py-1 bg-green-600 text-white rounded text-sm">{t('common.use')}</button>
                  <button onClick={() => startRename(tmpl)} className="text-gray-500 hover:text-gray-700">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(tmpl.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700">
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
