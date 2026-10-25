import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const localeLoaders: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import('./locales/en.json'),
  es: () => import('./locales/es.json'),
  fr: () => import('./locales/fr.json'),
  de: () => import('./locales/de.json'),
  it: () => import('./locales/it.json'),
  pt: () => import('./locales/pt.json'),
  ja: () => import('./locales/ja.json'),
  ko: () => import('./locales/ko.json'),
  zh: () => import('./locales/zh.json'),
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {},
    lng: 'en',
    fallbackLng: 'en',
    debug: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
});

export async function loadPublicLocale(language?: string | null): Promise<string> {
  const requested = (language || 'en').split('-')[0];
  const lang = localeLoaders[requested] ? requested : 'en';
  if (!i18n.hasResourceBundle(lang, 'translation')) {
    const loader = localeLoaders[lang] || localeLoaders.en;
    const mod = await loader();
    i18n.addResourceBundle(lang, 'translation', mod.default, true, true);
  }
  if (i18n.language !== lang) {
    await i18n.changeLanguage(lang);
  } else if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
  }
  return lang;
}

export default i18n;
