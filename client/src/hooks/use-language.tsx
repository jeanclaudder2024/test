import { createContext, useContext, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import i18n, { changeLanguage, languages, LanguageDetails } from "@/i18n/i18n";
import { FlagIconCode } from "react-flag-kit";

// Extended language type to include all supported languages
type Language = keyof typeof languages;

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, options?: any) => string;
  languages: Record<string, LanguageDetails>;
  getLanguageFlag: (code: string) => FlagIconCode;
  dir: "ltr" | "rtl";
}

// Create a context with a default value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to convert flag code string to FlagIconCode type
const getLanguageFlag = (code: string): FlagIconCode => {
  return code as FlagIconCode;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  // Use the i18next translation hook
  const { t, i18n } = useTranslation();
  
  // Get current language and direction
  const currentLanguage = i18n.language.split('-')[0];
  const currentLangDetails = languages[currentLanguage] || languages.en;
  const direction = currentLangDetails?.dir || "ltr";
  
  // Set language using i18next's changeLanguage function
  const setLanguage = (newLanguage: string) => {
    changeLanguage(newLanguage);
  };

  // Create context value
  const contextValue: LanguageContextType = {
    language: currentLanguage,
    setLanguage,
    t,
    languages,
    getLanguageFlag,
    dir: direction,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}