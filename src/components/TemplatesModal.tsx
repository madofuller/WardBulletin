import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Trash2, Edit, FileText } from 'lucide-react';
import templateService, { Template } from '../lib/templateService';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: Template | null) => void;
}

export default function TemplatesModal({ isOpen, onClose, onSelect }: TemplatesModalProps) {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTemplates(templateService.listTemplates());
    }
  }, [isOpen]);

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
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold">{t('bulletin.bulletinTemplates')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
          <button
            className="w-full flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => { onSelect(null); }}
          >
            {t('bulletin.blankBulletin')}
          </button>
          {templates.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              {t('bulletin.noTemplatesSaved')}
            </div>
          )}
          {templates.map(tmpl => (
            <div key={tmpl.id} className="border rounded p-3 flex justify-between items-center">
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
                <button onClick={() => onSelect(tmpl)} className="px-2 py-1 bg-green-600 text-white rounded">{t('common.use')}</button>
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
        <div className="p-4 border-t border-gray-200 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700">
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
