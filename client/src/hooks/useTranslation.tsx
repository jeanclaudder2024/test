import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Language = "en" | "ar" | "fr" | "es" | "zh";

interface TranslationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Translation dictionaries
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.vessels": "Vessels",
    "nav.oil_vessel_map": "Oil Vessel Map",
    "nav.refineries": "Refineries",
    "nav.ports": "Ports",
    "nav.documents": "Documents",
    "nav.companies": "Companies",
    "nav.brokers": "Brokers",
    "nav.ai_assistant": "AI Assistant",
    "nav.admin_panel": "Admin Panel",
    "nav.pricing": "Pricing",
    "nav.settings": "Settings",
    
    // Common
    "common.search": "Search vessels, ports, documents...",
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.view": "View",
    "common.export": "Export",
    
    // Vessel related
    "vessel.name": "Vessel Name",
    "vessel.type": "Vessel Type",
    "vessel.flag": "Flag",
    "vessel.status": "Status",
    "vessel.position": "Position",
    "vessel.cargo": "Cargo",
    "vessel.destination": "Destination",
    
    // Document types
    "doc.bill_of_lading": "Bill of Lading",
    "doc.commercial_invoice": "Commercial Invoice",
    "doc.certificate_of_origin": "Certificate of Origin",
    "doc.quality_certificate": "Quality Certificate",
    "doc.quantity_certificate": "Quantity Certificate",
    "doc.charter_party": "Charter Party Agreement",
    "doc.marine_insurance": "Marine Insurance Certificate",
  },
  
  ar: {
    // Navigation
    "nav.vessels": "السفن",
    "nav.oil_vessel_map": "خريطة سفن النفط",
    "nav.refineries": "المصافي",
    "nav.ports": "الموانئ",
    "nav.documents": "الوثائق",
    "nav.companies": "الشركات",
    "nav.brokers": "الوسطاء",
    "nav.ai_assistant": "المساعد الذكي",
    "nav.admin_panel": "لوحة الإدارة",
    "nav.pricing": "التسعير",
    "nav.settings": "الإعدادات",
    
    // Common
    "common.search": "البحث عن السفن والموانئ والوثائق...",
    "common.loading": "جار التحميل...",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.edit": "تعديل",
    "common.delete": "حذف",
    "common.view": "عرض",
    "common.export": "تصدير",
    
    // Vessel related
    "vessel.name": "اسم السفينة",
    "vessel.type": "نوع السفينة",
    "vessel.flag": "العلم",
    "vessel.status": "الحالة",
    "vessel.position": "الموقع",
    "vessel.cargo": "البضائع",
    "vessel.destination": "الوجهة",
    
    // Document types
    "doc.bill_of_lading": "بوليصة الشحن",
    "doc.commercial_invoice": "الفاتورة التجارية",
    "doc.certificate_of_origin": "شهادة المنشأ",
    "doc.quality_certificate": "شهادة الجودة",
    "doc.quantity_certificate": "شهادة الكمية",
    "doc.charter_party": "اتفاقية الاستئجار",
    "doc.marine_insurance": "شهادة التأمين البحري",
  },
  
  fr: {
    // Navigation
    "nav.vessels": "Navires",
    "nav.oil_vessel_map": "Carte des Navires Pétroliers",
    "nav.refineries": "Raffineries",
    "nav.ports": "Ports",
    "nav.documents": "Documents",
    "nav.companies": "Entreprises",
    "nav.brokers": "Courtiers",
    "nav.ai_assistant": "Assistant IA",
    "nav.admin_panel": "Panneau d'Administration",
    "nav.pricing": "Tarification",
    "nav.settings": "Paramètres",
    
    // Common
    "common.search": "Rechercher navires, ports, documents...",
    "common.loading": "Chargement...",
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.edit": "Modifier",
    "common.delete": "Supprimer",
    "common.view": "Voir",
    "common.export": "Exporter",
    
    // Vessel related
    "vessel.name": "Nom du Navire",
    "vessel.type": "Type de Navire",
    "vessel.flag": "Pavillon",
    "vessel.status": "Statut",
    "vessel.position": "Position",
    "vessel.cargo": "Cargaison",
    "vessel.destination": "Destination",
    
    // Document types
    "doc.bill_of_lading": "Connaissement",
    "doc.commercial_invoice": "Facture Commerciale",
    "doc.certificate_of_origin": "Certificat d'Origine",
    "doc.quality_certificate": "Certificat de Qualité",
    "doc.quantity_certificate": "Certificat de Quantité",
    "doc.charter_party": "Accord d'Affrètement",
    "doc.marine_insurance": "Certificat d'Assurance Maritime",
  },
  
  es: {
    // Navigation
    "nav.vessels": "Buques",
    "nav.oil_vessel_map": "Mapa de Buques Petroleros",
    "nav.refineries": "Refinerías",
    "nav.ports": "Puertos",
    "nav.documents": "Documentos",
    "nav.companies": "Empresas",
    "nav.brokers": "Corredores",
    "nav.ai_assistant": "Asistente IA",
    "nav.admin_panel": "Panel de Administración",
    "nav.pricing": "Precios",
    "nav.settings": "Configuración",
    
    // Common
    "common.search": "Buscar buques, puertos, documentos...",
    "common.loading": "Cargando...",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.edit": "Editar",
    "common.delete": "Eliminar",
    "common.view": "Ver",
    "common.export": "Exportar",
    
    // Vessel related
    "vessel.name": "Nombre del Buque",
    "vessel.type": "Tipo de Buque",
    "vessel.flag": "Bandera",
    "vessel.status": "Estado",
    "vessel.position": "Posición",
    "vessel.cargo": "Carga",
    "vessel.destination": "Destino",
    
    // Document types
    "doc.bill_of_lading": "Conocimiento de Embarque",
    "doc.commercial_invoice": "Factura Comercial",
    "doc.certificate_of_origin": "Certificado de Origen",
    "doc.quality_certificate": "Certificado de Calidad",
    "doc.quantity_certificate": "Certificado de Cantidad",
    "doc.charter_party": "Acuerdo de Fletamento",
    "doc.marine_insurance": "Certificado de Seguro Marítimo",
  },
  
  zh: {
    // Navigation
    "nav.vessels": "船只",
    "nav.oil_vessel_map": "石油船只地图",
    "nav.refineries": "炼油厂",
    "nav.ports": "港口",
    "nav.documents": "文件",
    "nav.companies": "公司",
    "nav.brokers": "经纪人",
    "nav.ai_assistant": "AI助手",
    "nav.admin_panel": "管理面板",
    "nav.pricing": "定价",
    "nav.settings": "设置",
    
    // Common
    "common.search": "搜索船只、港口、文件...",
    "common.loading": "加载中...",
    "common.save": "保存",
    "common.cancel": "取消",
    "common.edit": "编辑",
    "common.delete": "删除",
    "common.view": "查看",
    "common.export": "导出",
    
    // Vessel related
    "vessel.name": "船只名称",
    "vessel.type": "船只类型",
    "vessel.flag": "船旗",
    "vessel.status": "状态",
    "vessel.position": "位置",
    "vessel.cargo": "货物",
    "vessel.destination": "目的地",
    
    // Document types
    "doc.bill_of_lading": "提单",
    "doc.commercial_invoice": "商业发票",
    "doc.certificate_of_origin": "原产地证书",
    "doc.quality_certificate": "质量证书",
    "doc.quantity_certificate": "数量证书",
    "doc.charter_party": "租船协议",
    "doc.marine_insurance": "海上保险证书",
  }
};

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    // Set document direction for RTL languages
    document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLanguage;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage: handleLanguageChange, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}