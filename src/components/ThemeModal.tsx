import React from 'react';
import { useTranslation } from 'react-i18next';
import { themes } from '../data/themes';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTheme: (theme: { name: string; fontFamily: string }) => void;
  currentUserTheme: string;
}

export default function ThemeModal({ isOpen, onClose, onSelectTheme, currentUserTheme }: ThemeModalProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md mx-2 sm:mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl font-semibold">{t('themeModal.selectTheme')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl">&times;</button>
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {themes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => onSelectTheme(theme)}
              className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base transition-colors ${
                currentUserTheme === theme.name 
                  ? 'bg-blue-500 text-white' 
                  : 'hover:bg-gray-100'
              }`}
              style={{ fontFamily: theme.fontFamily }}
            >
              {theme.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
