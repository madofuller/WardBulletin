import React, { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'en' | 'es';

const translations: Record<Lang, Record<string, string>> = {
  en: {
    new_bulletin: 'New Bulletin',
    export_pdf: 'Export PDF',
    save_bulletin: 'Save Bulletin',
    update_bulletin: 'Update Bulletin',
    saving: 'Saving...',
    my_qr_code: 'My QR Code',
    share: 'Share',
    sign_in: 'Sign In',
    sign_out: 'Sign Out',
    sign_in_setup: 'Sign In (Setup Required)',
    my_bulletins: 'My Bulletins',
    save_changes: 'Save Changes',
    no_changes: 'No Changes to Save',
    review_submissions: 'Review Submissions',
    create_your_bulletin: 'Create Your Bulletin',
    bulletin_preview: 'Bulletin Preview',
    saved_bulletin: 'Saved Bulletin',
    unsaved_changes: 'Unsaved Changes',
    set_qr_bulletin: 'Set This Bulletin as QR Code Bulletin',
    save_template: 'Save as Template',
    qr_sign_in: 'Sign in to create your permanent QR code',
    profile_settings: 'Profile Settings',
    ward_settings: 'Ward Settings'
  },
  es: {
    new_bulletin: 'Nuevo Bolet\u00edn',
    export_pdf: 'Exportar PDF',
    save_bulletin: 'Guardar Bolet\u00edn',
    update_bulletin: 'Actualizar Bolet\u00edn',
    saving: 'Guardando...',
    my_qr_code: 'Mi C\u00f3digo QR',
    share: 'Compartir',
    sign_in: 'Iniciar Sesi\u00f3n',
    sign_out: 'Cerrar Sesi\u00f3n',
    sign_in_setup: 'Iniciar Sesi\u00f3n (Configuraci\u00f3n Requerida)',
    my_bulletins: 'Mis Boletines',
    save_changes: 'Guardar Cambios',
    no_changes: 'Sin cambios para guardar',
    review_submissions: 'Revisar Env\u00edos',
    create_your_bulletin: 'Crea tu Bolet\u00edn',
    bulletin_preview: 'Vista Previa del Bolet\u00edn',
    saved_bulletin: 'Bolet\u00edn Guardado',
    unsaved_changes: 'Cambios Sin Guardar',
    set_qr_bulletin: 'Establecer este Bolet\u00edn como Bolet\u00edn del C\u00f3digo QR',
    save_template: 'Guardar como Plantilla',
    qr_sign_in: 'Inicia sesi\u00f3n para crear tu c\u00f3digo QR permanente',
    profile_settings: 'Configuraci\u00f3n de Perfil',
    ward_settings: 'Configuraci\u00f3n de Barrio'
  }
};

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  toggleLang: () => {},
  t: (key: string) => key
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const toggleLang = () => setLang(prev => (prev === 'en' ? 'es' : 'en'));
  const t = (key: string) =>
    translations[lang][key] ?? translations.en[key] ?? key;
  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
