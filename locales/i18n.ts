import { default as i18nInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en';
import rw from './rw';

i18nInstance.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    rw: { translation: rw },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18nInstance;
