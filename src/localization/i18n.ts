import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import gameEn from './en/game.json';
import uiEn from './en/ui.json';
import errorsEn from './en/errors.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      game: gameEn,
      ui: uiEn,
      errors: errorsEn,
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
