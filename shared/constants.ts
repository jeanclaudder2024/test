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

export const OIL_PRODUCT_TYPES = [
  'Diesel (Gasoil)',
  'Jet Fuel (Jet A-1)',
  'Fuel Oil (IFO / HFO / MFO)',
  'Gasoline (Petrol / Mogas)',
  'Naphtha',
  'LPG (Liquefied Petroleum Gas)',
  'LNG (Liquefied Natural Gas)',
  'Kerosene',
  'Bitumen / Asphalt',
  'Marine Gas Oil (MGO)',
  'Straight Run Fuel Oil (SRFO)',
  'Vacuum Gas Oil (VGO)',
  'Base Oils',
  'Petroleum Coke (Petcoke)',
  'DIESEL GAS D2 OIL',
  'MAZUT M100',
  'AVIATION KEROSENE COLONIAL GRADE 54 JET FUEL',
  'JET A1 FUEL',
  'VIRGIN FUEL OIL D6',
  'EXPORT BLEND CRUDE',
  'LIQUIDIFIED PETROLEUM GAS',
  'LIQUEFIED NATURAL GAS (LNG)',
  'BASE OIL SN150 / SN300 / SN400 /SN500/ SN100',
  'FUEL OIL CST-180',
  'UREA 46%',
  'SULPHUR GRANULAR',
  'ULTRA‐LOW SULPHUR DIESEL',
  'LIGHT CYCLE OIL (LCO)',
  'AUTOMATIVE GAS OIL - AGO OIL',
  'BITUMEN GRADE 60/70 AND 80/100',
  'GASOLENE 89 OCTANES',
  'ULTRA LOW SULPHUR DIESEL FUEL (EN590)',
  'EASTERN SIBERIA PACIFIC OCEAN CRUDE OIL (ESPO)',
  'DIAMMONIUM PHOSPHATE (DAP)',
  'COMPRESSED NATURAL GAS (CNG)',
  'BITUMEN GRADE: 40/50, 60/70 AND 80/100',
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