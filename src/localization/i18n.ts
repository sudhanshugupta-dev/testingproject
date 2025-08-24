import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import hi from './hi.json';
import es from './es.json';
import fr from './fr.json';
import ja from './ja.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'en',
  fallbackLng: 'en',
  resources: { en: { translation: en }, hi: { translation: hi }, es: { translation: es }, fr: { translation: fr }, ja: { translation: ja } },
  interpolation: { escapeValue: false },
});

export default i18n;
