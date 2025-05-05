import 'i18next';
import en from './locales/en/translation.json';

// Define resource structure based on English translation file
type Resources = {
  translation: typeof en;
};

// Define our supported languages
type SupportedLanguages = 'en' | 'ar' | 'fr' | 'es' | 'zh' | 'ru' | 'de' | 'ja';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: Record<SupportedLanguages, Resources>;
  }
}