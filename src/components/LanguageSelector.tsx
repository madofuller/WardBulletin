import React, { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSession } from '../lib/SessionContext';
import { userService } from '../lib/supabase';

interface LanguageSelectorProps {
  className?: string;
}

const languageOptions = [
  { value: 'en', label: 'English', short: 'EN' },
  { value: 'es', label: 'Español', short: 'ES' },
  { value: 'pt', label: 'Português', short: 'PT' },
  { value: 'fr', label: 'Français', short: 'FR' },
  { value: 'de', label: 'Deutsch', short: 'DE' },
  { value: 'it', label: 'Italiano', short: 'IT' },
  { value: 'ja', label: '日本語', short: '日本語' },
  { value: 'ko', label: '한국어', short: '한국어' },
  { value: 'zh', label: '繁體中文', short: '中文' },
];

export default function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { i18n, t } = useTranslation();
  const { user, profile, refreshProfile } = useSession();

  const currentLanguage = i18n.language || 'en';
  const currentOption = languageOptions.find(option => option.value === currentLanguage) || languageOptions[0];

  const handleSelect = async (language: string) => {
    setSaving(true);

    // Change the i18n language
    await i18n.changeLanguage(language);

    // Save to localStorage
    localStorage.setItem('selectedLanguage', language);

    // If user is logged in, also save to database
    if (user?.id) {
      try {
        await userService.updateLanguage(user.id, language);
        if (refreshProfile) {
          refreshProfile();
        }
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }
    }

    setSaving(false);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={saving}
        className="group relative inline-flex items-center px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 hover:shadow-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        title={`${t('modals.language')}: ${currentOption.label}`}
      >
        <Globe className="w-3.5 h-3.5 mr-1" />
        <span>{currentOption.short}</span>
        <ChevronDown className={`w-3 h-3 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 z-20 max-h-64 overflow-y-auto">
            <div className="py-1">
              {languageOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center gap-2 px-2 py-1 text-xs text-left hover:bg-gray-50 transition-colors whitespace-nowrap ${
                    option.value === currentLanguage ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <span className="font-medium">{option.short}</span>
                  {option.value === currentLanguage && (
                    <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
