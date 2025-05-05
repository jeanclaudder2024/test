import React, { ReactNode, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

interface TranslationProviderProps {
  children: ReactNode;
}

/**
 * TranslationProvider component that initializes and provides the i18n context
 * to the application, handling language detection and initialization.
 */
const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  // Effect to make sure document direction is set on mount and language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      const currentLang = i18n.language.split('-')[0];
      const isRtl = currentLang === 'ar';
      
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
      document.documentElement.lang = currentLang;
      
      // Add language-specific class to body for CSS targeting
      document.body.classList.remove('lang-en', 'lang-ar', 'lang-fr', 'lang-es', 'lang-zh', 'lang-ru', 'lang-de', 'lang-ja');
      document.body.classList.add(`lang-${currentLang}`);
      
      // Add RTL class if needed
      if (isRtl) {
        document.body.classList.add('rtl');
      } else {
        document.body.classList.remove('rtl');
      }
    };

    // Set up listener for language changes
    i18n.on('languageChanged', handleLanguageChange);
    
    // Initial setup
    handleLanguageChange();
    
    // Cleanup
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default TranslationProvider;