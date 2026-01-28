import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import ar from './ar.json';
import ha from './ha.json';

// Get saved language from localStorage
const getSavedLanguage = (): string => {
    try {
        const saved = localStorage.getItem('maktab_language');
        if (saved) {
            const lang = JSON.parse(saved);
            // Set document direction for RTL languages
            if (lang === 'ar') {
                document.documentElement.setAttribute('dir', 'rtl');
            }
            return lang;
        }
    } catch {
        // Ignore errors
    }
    return 'en';
};

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            ar: { translation: ar },
            ha: { translation: ha },
        },
        lng: getSavedLanguage(),
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;

