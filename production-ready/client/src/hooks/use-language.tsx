import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

// Create a context with a default value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// English and Arabic translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.navigation": "NAVIGATION",
    "nav.dashboard": "Dashboard",
    "nav.vessels": "Vessels",
    "nav.live_tracking": "Live Tracking",
    "nav.refineries": "Refineries",
    "nav.ports": "Ports",
    "nav.documents": "Documents",
    "nav.brokers": "Brokers",
    "nav.trading": "Trading",
    "nav.api_test": "API Test",
    "nav.ai_assistant": "AI Assistant",
    "nav.settings": "Settings",
    "nav.profile": "Profile",
    
    // Common actions
    "action.view": "View",
    "action.edit": "Edit",
    "action.delete": "Delete",
    "action.save": "Save",
    "action.cancel": "Cancel",
    "action.search": "Search",
    "action.filter": "Filter",
    "action.export": "Export Data",
    "action.view_home": "View Home",
    "action.logout": "Log Out",
    
    // Auth
    "auth.login": "Log In",
    "auth.signup": "Sign Up",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.username": "Username",
    "auth.forgot_password": "Forgot Password?",
    "auth.get_started": "Get Started",
    
    // Landing page
    "landing.title": "Global Vessel Tracking Platform",
    "landing.subtitle": "Track and analyze vessel movements with real-time data",
    "landing.features": "Features",
    "landing.pricing": "Pricing",
    "landing.testimonials": "Testimonials",
    "landing.faq": "FAQ",
    
    // Dashboard
    "dashboard.active_vessels": "Active Vessels",
    "dashboard.vessels_by_region": "Vessels by Region",
    "dashboard.recent_movements": "Recent Movements",
    "dashboard.statistics": "Statistics",
    
    // Vessels
    "vessels.vessel_details": "Vessel Details",
    "vessels.vessel_type": "Vessel Type",
    "vessels.imo": "IMO Number",
    "vessels.mmsi": "MMSI Number",
    "vessels.flag": "Flag",
    "vessels.built": "Built",
    "vessels.deadweight": "Deadweight",
    "vessels.current_location": "Current Location",
    "vessels.departure_port": "Departure Port",
    "vessels.destination_port": "Destination Port",
    "vessels.eta": "ETA",
    "vessels.cargo_type": "Cargo Type",
    "vessels.cargo_capacity": "Cargo Capacity",
    
    // Refineries
    "refineries.refinery_details": "Refinery Details",
    "refineries.country": "Country",
    "refineries.capacity": "Capacity",
    "refineries.owner": "Owner",
    "refineries.contact": "Contact",
    "refineries.products": "Products",
    "refineries.status": "Status",
    
    // Documents
    "documents.title": "Documents",
    "documents.create": "Create Document",
    "documents.document_type": "Document Type",
    "documents.status": "Status",
    "documents.date": "Date",
    "documents.vessel": "Vessel",
    "documents.content": "Content",
    "documents.generate": "Generate Document",
    
    // Brokers
    "brokers.title": "Brokers",
    "brokers.elite_membership": "Elite Membership",
    "brokers.company": "Company",
    "brokers.contact": "Contact",
    "brokers.specialization": "Specialization",
    "brokers.tenders": "Tenders",
    "brokers.messages": "Messages",
    
    // Trading
    "trading.title": "Trading Dashboard",
    "trading.oil_prices": "Oil Prices",
    "trading.active_deals": "Active Deals",
    "trading.market_trends": "Market Trends",
    "trading.price": "Price",
    "trading.change": "Change",
    "trading.volume": "Volume",
    
    // Settings
    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.language_description": "Select your preferred language for the application interface",
    "settings.english": "English",
    "settings.arabic": "Arabic",
    "settings.theme": "Theme",
    "settings.theme_description": "Choose your preferred visual theme for the application",
    "settings.light": "Light",
    "settings.dark": "Dark",
    "settings.system": "System",
    "settings.notifications": "Notifications",
    "settings.security": "Security",
    "settings.appearance": "Appearance",
    "settings.timezone": "Timezone",
    "settings.timezone_description": "Select your preferred timezone for date and time display",
    
    // Regions
    "region.north_america": "North America",
    "region.central_america": "Central America",
    "region.south_america": "South America",
    "region.western_europe": "Western Europe",
    "region.eastern_europe": "Eastern Europe",
    "region.russia": "Russia",
    "region.middle_east": "Middle East",
    "region.north_africa": "North Africa",
    "region.southern_africa": "Southern Africa",
    "region.asia_pacific": "Asia & Pacific",
    "region.china": "China",
    "region.southeast_asia_oceania": "Southeast Asia & Oceania",
  },
  ar: {
    // Navigation
    "nav.navigation": "التنقل",
    "nav.dashboard": "لوحة التحكم",
    "nav.vessels": "السفن",
    "nav.live_tracking": "التتبع المباشر",
    "nav.refineries": "المصافي",
    "nav.ports": "الموانئ",
    "nav.documents": "المستندات",
    "nav.brokers": "الوسطاء",
    "nav.trading": "التداول",
    "nav.api_test": "اختبار API",
    "nav.ai_assistant": "مساعد الذكاء الاصطناعي",
    "nav.settings": "الإعدادات",
    "nav.profile": "الملف الشخصي",
    
    // Common actions
    "action.view": "عرض",
    "action.edit": "تحرير",
    "action.delete": "حذف",
    "action.save": "حفظ",
    "action.cancel": "إلغاء",
    "action.search": "بحث",
    "action.filter": "تصفية",
    "action.export": "تصدير البيانات",
    "action.view_home": "عرض الصفحة الرئيسية",
    "action.logout": "تسجيل الخروج",
    
    // Auth
    "auth.login": "تسجيل الدخول",
    "auth.signup": "إنشاء حساب",
    "auth.email": "البريد الإلكتروني",
    "auth.password": "كلمة المرور",
    "auth.username": "اسم المستخدم",
    "auth.forgot_password": "نسيت كلمة المرور؟",
    "auth.get_started": "ابدأ الآن",
    
    // Landing page
    "landing.title": "منصة تتبع السفن العالمية",
    "landing.subtitle": "تتبع وتحليل حركة السفن ببيانات في الوقت الفعلي",
    "landing.features": "الميزات",
    "landing.pricing": "الأسعار",
    "landing.testimonials": "آراء العملاء",
    "landing.faq": "الأسئلة الشائعة",
    
    // Dashboard
    "dashboard.active_vessels": "السفن النشطة",
    "dashboard.vessels_by_region": "السفن حسب المنطقة",
    "dashboard.recent_movements": "التحركات الأخيرة",
    "dashboard.statistics": "الإحصائيات",
    
    // Vessels
    "vessels.vessel_details": "تفاصيل السفينة",
    "vessels.vessel_type": "نوع السفينة",
    "vessels.imo": "رقم IMO",
    "vessels.mmsi": "رقم MMSI",
    "vessels.flag": "العلم",
    "vessels.built": "سنة البناء",
    "vessels.deadweight": "الوزن الميت",
    "vessels.current_location": "الموقع الحالي",
    "vessels.departure_port": "ميناء المغادرة",
    "vessels.destination_port": "ميناء الوصول",
    "vessels.eta": "الوقت المتوقع للوصول",
    "vessels.cargo_type": "نوع الشحنة",
    "vessels.cargo_capacity": "سعة الشحن",
    
    // Refineries
    "refineries.refinery_details": "تفاصيل المصفاة",
    "refineries.country": "البلد",
    "refineries.capacity": "السعة",
    "refineries.owner": "المالك",
    "refineries.contact": "الاتصال",
    "refineries.products": "المنتجات",
    "refineries.status": "الحالة",
    
    // Documents
    "documents.title": "المستندات",
    "documents.create": "إنشاء مستند",
    "documents.document_type": "نوع المستند",
    "documents.status": "الحالة",
    "documents.date": "التاريخ",
    "documents.vessel": "السفينة",
    "documents.content": "المحتوى",
    "documents.generate": "إنشاء مستند",
    
    // Brokers
    "brokers.title": "الوسطاء",
    "brokers.elite_membership": "العضوية المميزة",
    "brokers.company": "الشركة",
    "brokers.contact": "الاتصال",
    "brokers.specialization": "التخصص",
    "brokers.tenders": "المناقصات",
    "brokers.messages": "الرسائل",
    
    // Trading
    "trading.title": "لوحة التداول",
    "trading.oil_prices": "أسعار النفط",
    "trading.active_deals": "الصفقات النشطة",
    "trading.market_trends": "اتجاهات السوق",
    "trading.price": "السعر",
    "trading.change": "التغيير",
    "trading.volume": "الحجم",
    
    // Settings
    "settings.title": "الإعدادات",
    "settings.language": "اللغة",
    "settings.language_description": "اختر لغتك المفضلة لواجهة التطبيق",
    "settings.english": "الإنجليزية",
    "settings.arabic": "العربية",
    "settings.theme": "السمة",
    "settings.theme_description": "اختر السمة المرئية المفضلة للتطبيق",
    "settings.light": "فاتحة",
    "settings.dark": "داكنة",
    "settings.system": "النظام",
    "settings.notifications": "الإشعارات",
    "settings.security": "الأمان",
    "settings.appearance": "المظهر",
    "settings.timezone": "المنطقة الزمنية",
    "settings.timezone_description": "اختر المنطقة الزمنية المفضلة لعرض التاريخ والوقت",
    
    // Regions
    "region.north_america": "أمريكا الشمالية",
    "region.central_america": "أمريكا الوسطى",
    "region.south_america": "أمريكا الجنوبية",
    "region.western_europe": "أوروبا الغربية",
    "region.eastern_europe": "أوروبا الشرقية",
    "region.russia": "روسيا",
    "region.middle_east": "الشرق الأوسط",
    "region.north_africa": "شمال أفريقيا",
    "region.southern_africa": "جنوب أفريقيا",
    "region.asia_pacific": "آسيا والمحيط الهادئ",
    "region.china": "الصين",
    "region.southeast_asia_oceania": "جنوب شرق آسيا وأوقيانوسيا",
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  // Initialize language state with browser preference or default to English
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      // Check localStorage first
      const savedLanguage = localStorage.getItem("language") as Language;
      if (savedLanguage === "en" || savedLanguage === "ar") {
        return savedLanguage;
      }
    } catch (error) {
      console.log("localStorage not available, using default language");
    }
    
    // Then check browser language
    const browserLang = navigator.language.split('-')[0];
    return browserLang === "ar" ? "ar" : "en";
  });

  // Set language and save it to localStorage
  const setLanguage = (newLanguage: Language) => {
    console.log("Setting language to:", newLanguage);
    setLanguageState(newLanguage);
    
    try {
      localStorage.setItem("language", newLanguage);
    } catch (error) {
      console.log("Failed to save language to localStorage:", error);
    }
    
    // Set document direction based on language
    document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr";
    
    // Add language-specific class to body for CSS targeting
    document.documentElement.lang = newLanguage;
    document.body.classList.remove("lang-en", "lang-ar");
    document.body.classList.add(`lang-${newLanguage}`);
    
    console.log("Language updated to:", newLanguage, "Direction:", document.documentElement.dir);
  };
  
  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };
  
  // Set initial document direction on mount
  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    document.body.classList.add(`lang-${language}`);
    
    return () => {
      document.body.classList.remove(`lang-${language}`);
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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