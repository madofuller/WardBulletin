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
    ward_settings: 'Ward Settings',
    program: 'Program',
    announcements: 'Announcements',
    sacrament_meeting: 'Sacrament Meeting',
    presiding: 'Presiding',
    conducting: 'Conducting',
    chorister: 'Chorister',
    organist: 'Organist',
    prelude_music: 'Prelude Music',
    opening_hymn: 'Opening Hymn',
    closing_hymn: 'Closing Hymn',
    sacrament_hymn: 'Sacrament Hymn',
    invocation: 'Invocation',
    benediction: 'Benediction',
    administration_sacrament: 'Administration of the Sacrament',
    basic_information: 'Basic Information',
    leadership: 'Leadership',
    music_program: 'Music Program',
    prayers: 'Prayers',
    agenda: 'Agenda',
    ward_leadership: 'Ward Leadership',
    missionaries: 'Missionaries',
    digital_version: 'Digital Version',
    build_your_own: 'Build your own at',
    announcements_events: 'Announcements & Events',
    copy_link: 'Copy Link',
    copied: 'Copied!',
    create_account: 'Create Account',
    youth_speaker: 'Youth Speaker',
    speaker: 'Speaker',
    musical_number: 'Musical Number',
    bearing_testimonies: 'Bearing of Testimonies',
    have_announcement: 'Have an announcement?',
    submit_announcement_cta: 'Submit your announcement to be included in the next bulletin!',
    submit_announcement: 'Submit Announcement',
    no_announcements: 'No announcements',
    meetings_this_week: 'Meetings This Week',
    special_events: 'Special Events',
    contact: 'Contact',
    audience_ward: 'Ward',
    audience_relief_society: 'Relief Society',
    audience_elders_quorum: 'Elders Quorum',
    audience_young_women: 'Young Women',
    audience_young_men: 'Young Men',
    audience_youth: 'Youth',
    audience_primary: 'Primary',
    audience_stake: 'Stake',
    audience_other: 'Other'
    ,please_wait: 'Please wait...'
    ,sign_up_info: 'Create a free account to save and manage your bulletins with your own permanent QR code.'
    ,sign_in_info: 'Sign in to access your saved bulletins and manage your QR codes.'
    ,already_have_account: 'Already have an account? Sign in'
    ,no_account: "Don't have an account? Create one"
  },
  es: {
    new_bulletin: 'Nuevo Boletín',
    export_pdf: 'Exportar PDF',
    save_bulletin: 'Guardar Boletín',
    update_bulletin: 'Actualizar Boletín',
    saving: 'Guardando...',
    my_qr_code: 'Mi Código QR',
    share: 'Compartir',
    sign_in: 'Iniciar Sesión',
    sign_out: 'Cerrar Sesión',
    sign_in_setup: 'Iniciar Sesión (Configuración Requerida)',
    my_bulletins: 'Mis Boletines',
    save_changes: 'Guardar Cambios',
    no_changes: 'Sin cambios para guardar',
    review_submissions: 'Revisar Envíos',
    create_your_bulletin: 'Crea tu Boletín',
    bulletin_preview: 'Vista Previa del Boletín',
    saved_bulletin: 'Boletín Guardado',
    unsaved_changes: 'Cambios Sin Guardar',
    set_qr_bulletin: 'Establecer este Boletín como Boletín del Código QR',
    save_template: 'Guardar como Plantilla',
    qr_sign_in: 'Inicia sesión para crear tu código QR permanente',
    profile_settings: 'Configuración de Perfil',
    ward_settings: 'Configuración de Barrio',
    program: 'Programa',
    announcements: 'Anuncios',
    sacrament_meeting: 'Reunión Sacramental',
    presiding: 'Preside',
    conducting: 'Dirige',
    chorister: 'Director(a) de Música',
    organist: 'Organista',
    prelude_music: 'Música de Preludio',
    opening_hymn: 'Himno de Apertura',
    closing_hymn: 'Himno de Clausura',
    sacrament_hymn: 'Himno de la Santa Cena',
    invocation: 'Invocación',
    benediction: 'Bendición',
    administration_sacrament: 'Administración de la Santa Cena',
    basic_information: 'Información Básica',
    leadership: 'Liderazgo',
    music_program: 'Programa Musical',
    prayers: 'Oraciones',
    agenda: 'Agenda',
    ward_leadership: 'Liderazgo de Barrio',
    missionaries: 'Misioneros',
    digital_version: 'Versión Digital',
    build_your_own: 'Crea la tuya en',
    announcements_events: 'Anuncios y Eventos',
    copy_link: 'Copiar Enlace',
    copied: '¡Copiado!',
    create_account: 'Crear Cuenta',
    youth_speaker: 'Orador Joven',
    speaker: 'Orador',
    musical_number: 'Número Musical',
    bearing_testimonies: 'Testimonios',
    have_announcement: '¿Tienes un anuncio?',
    submit_announcement_cta: '¡Envía tu anuncio para incluirlo en el próximo boletín!',
    submit_announcement: 'Enviar Anuncio',
    no_announcements: 'No hay anuncios',
    meetings_this_week: 'Reuniones Esta Semana',
    special_events: 'Eventos Especiales',
    contact: 'Contacto',
    audience_ward: 'Barrio',
    audience_relief_society: 'Sociedad de Socorro',
    audience_elders_quorum: 'Quórum de Élderes',
    audience_young_women: 'Mujeres Jóvenes',
    audience_young_men: 'Hombres Jóvenes',
    audience_youth: 'Jóvenes',
    audience_primary: 'Primaria',
    audience_stake: 'Estaca',
    audience_other: 'Otro'
    ,please_wait: 'Por favor espera...'
    ,sign_up_info: 'Crea una cuenta gratis para guardar y gestionar tus boletines con tu código QR permanente.'
    ,sign_in_info: 'Inicia sesión para acceder a tus boletines guardados y administrar tus códigos QR.'
    ,already_have_account: '¿Ya tienes una cuenta? Inicia sesión'
    ,no_account: '¿No tienes una cuenta? Crea una'
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
