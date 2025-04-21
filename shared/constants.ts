/**
 * Application constants including region definitions and other fixed values
 */

export const REGIONS = [
  { id: 'middle-east', name: 'Middle East', nameAr: 'الشرق الأوسط' },
  { id: 'north-africa', name: 'North Africa', nameAr: 'شمال أفريقيا' },
  { id: 'eastern-europe', name: 'Eastern Europe', nameAr: 'أوروبا الشرقية' },
  { id: 'western-europe', name: 'Western Europe', nameAr: 'أوروبا الغربية' },
  { id: 'north-america', name: 'North America', nameAr: 'أمريكا الشمالية' },
  { id: 'central-america', name: 'Central America', nameAr: 'أمريكا الوسطى' },
  { id: 'south-america', name: 'South America', nameAr: 'أمريكا الجنوبية' },
  { id: 'southern-africa', name: 'Southern Africa', nameAr: 'أفريقيا الجنوبية' },
  { id: 'russia', name: 'Russia', nameAr: 'روسيا' },
  { id: 'china', name: 'China', nameAr: 'الصين' },
  { id: 'asia-pacific', name: 'Asia & Pacific', nameAr: 'آسيا والمحيط الهادئ' },
  { id: 'southeast-asia-oceania', name: 'Southeast Asia & Oceania', nameAr: 'دول جنوب شرق آسيا وأستراليا ونيوزيلندا' },
];

export const VESSEL_TYPES = [
  'Oil Tanker',
  'LNG Carrier',
  'Chemical Tanker',
  'Bulk Carrier',
  'Container Ship',
  'General Cargo',
  'Ro-Ro Ship',
];

export const REFINERY_STATUSES = [
  'operational',
  'maintenance',
  'offline',
  'under construction',
];

export const DOCUMENT_TYPES = [
  'Bill of Lading',
  'Certificate of Origin',
  'Letter of Indemnity',
  'Charter Party',
  'Safety Data Sheet',
  'Cargo Manifest',
  'Invoice',
];