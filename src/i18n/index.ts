import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import en from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(resourcesToBackend((language: string) => {
    if (language === 'en') return;
    return import(`./locales/${language}.json`);
  }))
  .init({
    resources: { en: { translation: en } },
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'selectedLanguage',
      caches: ['localStorage'],
    },
    react: {
      useSuspense: true,
    },
  });

// Keep the document language in sync so screen readers and browser
// translation use the right pronunciation rules (WCAG 3.1.1) - public
// bulletins render in the ward's language, not necessarily English.
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
});
if (typeof document !== 'undefined' && i18n.language) {
  document.documentElement.lang = i18n.language;
}

export default i18n;
