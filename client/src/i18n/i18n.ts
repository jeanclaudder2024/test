import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import resourcesToBackend from 'i18next-resources-to-backend';

// Import language resources
import en from './locales/en/translation.json';
import ar from './locales/ar/translation.json';
import fr from './locales/fr/translation.json';
import es from './locales/es/translation.json';
import zh from './locales/zh/translation.json';
import ru from './locales/ru/translation.json';
import de from './locales/de/translation.json';
import ja from './locales/ja/translation.json';

// Define type for language details
export interface LanguageDetails {
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

// Define type for translation resources
type TranslationResource = typeof en;
interface ResourceType {
  translation: TranslationResource;
}

// Define available languages with their details
export const languages: Record<string, LanguageDetails> = {
  en: { nativeName: 'English', flag: 'US', dir: 'ltr' },
  ar: { nativeName: 'العربية', flag: 'SA', dir: 'rtl' },
  fr: { nativeName: 'Français', flag: 'FR', dir: 'ltr' },
  es: { nativeName: 'Español', flag: 'ES', dir: 'ltr' },
  zh: { nativeName: '中文', flag: 'CN', dir: 'ltr' },
  ru: { nativeName: 'Русский', flag: 'RU', dir: 'ltr' },
  de: { nativeName: 'Deutsch', flag: 'DE', dir: 'ltr' },
  ja: { nativeName: '日本語', flag: 'JP', dir: 'ltr' },
};

// Resources for the languages
const resources: Record<string, ResourceType> = {
  en: { translation: en },
  ar: { translation: ar },
  fr: { translation: fr },
  es: { translation: es },
  zh: { translation: zh },
  ru: { translation: ru },
  de: { translation: de },
  ja: { translation: ja },
};

// List of supported namespaces
const namespaces = ['translation'];

i18n
  // Load translation using http -> see /public/locales
  // For dynamic loading - https://github.com/i18next/i18next-http-backend
  .use(Backend)
  
  // Detect user language
  // Learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  
  // For static loading resources (bundled with app)
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      if (namespaces.includes(namespace)) {
        return Promise.resolve(resources[language]?.translation || {});
      }
      return Promise.resolve({});
    })
  )
  
  // Initialize i18next
  .init({
    // Default language
    fallbackLng: 'en',
    
    // Debug in development
    debug: process.env.NODE_ENV === 'development',
    
    // Namespaces
    defaultNS: 'translation',
    ns: namespaces,
    
    // Lazy load translations
    partialBundledLanguages: true,
    
    // Detect and cache language from localStorage
    detection: {
      // Order and from where user language should be detected
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      
      // Keys or params to lookup language from
      lookupLocalStorage: 'i18nextLng',
      
      // Cache user language on
      caches: ['localStorage'],
      
      // Optional htmlTag with lang attribute
      htmlTag: document.documentElement,
    },
    
    // Interpolation config
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // React config
    react: {
      useSuspense: true,
    },
  });

// Function to change the language
export const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
  
  // Set HTML dir attribute for RTL languages
  const langDetails = languages[lng];
  if (langDetails) {
    document.documentElement.dir = langDetails.dir;
    document.documentElement.lang = lng;
  } else {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = lng;
  }
};

// Initialize language direction
const currentLanguage = i18n.language;
const languageCode = currentLanguage.split('-')[0];
const currentLangDetails = languages[languageCode];
if (currentLangDetails) {
  document.documentElement.dir = currentLangDetails.dir;
  document.documentElement.lang = currentLanguage;
} else {
  document.documentElement.dir = 'ltr';
  document.documentElement.lang = currentLanguage;
}

export default i18n;