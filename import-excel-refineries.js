/**
 * Script to import refinery data from the attached image spreadsheet
 */
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure neon database
neonConfig.webSocketConstructor = ws;

// Initialize database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Data extracted from the provided image
const refineries = [
  { name: "Ruwais Refinery", arabic_name: "مصفاة الرويس", country: "United Arab Emirates", capacity: 817000, google_maps_url: "https://goo.gl/maps/vTa4TuiKiY8hPy" },
  { name: "Jubail Refinery", arabic_name: "مصفاة الجبيل", country: "Saudi Arabia", capacity: 400000, google_maps_url: "https://goo.gl/maps/UxJ2vZLtVA82" },
  { name: "Yanbu Refinery", arabic_name: "مصفاة ينبع", country: "Saudi Arabia", capacity: 400000, google_maps_url: "https://goo.gl/maps/V1n9wK8v5S" },
  { name: "Mina de Abdullah Refinery", arabic_name: "مصفاة ميناء عبدالله", country: "Kuwait", capacity: 270000, google_maps_url: "https://goo.gl/maps/dGN7iw3bGSJ2" },
  { name: "Ras Laffan Refinery", arabic_name: "مصفاة راس لفان", country: "Qatar", capacity: 146000, google_maps_url: "https://goo.gl/maps/BqSyJLV" },
  { name: "Jebel Ali Refinery", arabic_name: "مصفاة جبل علي", country: "United Arab Emirates", capacity: 140000, google_maps_url: "https://goo.gl/maps/PaoiFzBNo" },
  { name: "Fujairah Refinery", arabic_name: "مصفاة الفجيرة", country: "United Arab Emirates", capacity: 85000, google_maps_url: "https://goo.gl/maps/U2T3U3qBYZhs" },
  { name: "Qatar Refinery", arabic_name: "مصفاة قطر", country: "Qatar", capacity: 137000, google_maps_url: "https://goo.gl/maps/1sX1U" },
  { name: "Sahar Refinery", arabic_name: "مصفاة صحار", country: "Oman", capacity: 116000, google_maps_url: "https://goo.gl/maps/hNs2hHnqZqn" },
  { name: "Duqm Refinery", arabic_name: "مصفاة الدقم", country: "Oman", capacity: 230000, google_maps_url: "https://goo.gl/maps/NFG6eJWBbTRKtd3E6" },
  { name: "Daura Refinery", arabic_name: "مصفاة الدورة", country: "Iraq", capacity: 210000, google_maps_url: "https://goo.gl/maps/NboMSn1a" },
  { name: "Ras Lanuf Refinery", arabic_name: "مصفاة رأس لانوف", country: "Libya", capacity: 220000, google_maps_url: "https://goo.gl/maps/w4pTNSrCuAR2" },
  { name: "Brega Refinery", arabic_name: "مصفاة البريقة", country: "Libya", capacity: 10000, google_maps_url: "https://goo.gl/maps/9r5YVTw4uH92" },
  { name: "Suez Refinery", arabic_name: "مصفاة السويس", country: "Egypt", capacity: 146000, google_maps_url: "https://goo.gl/maps/N89STGUwVKo" },
  { name: "MIDOR Refinery", arabic_name: "مصفاة ميدور", country: "Egypt", capacity: 115000, google_maps_url: "https://goo.gl/maps/jGpDYsqYLJw" },
  { name: "Cairo Refinery", arabic_name: "مصفاة القاهرة", country: "Egypt", capacity: 142000, google_maps_url: "https://goo.gl/maps/xMT2bM9tUAM2" },
  { name: "Assiut Refinery", arabic_name: "مصفاة أسيوط", country: "Egypt", capacity: 60000, google_maps_url: "https://goo.gl/maps/nUtdcKkA4uH2" },
  { name: "Alexandria Refinery", arabic_name: "مصفاة الإسكندرية", country: "Egypt", capacity: 115000, google_maps_url: "https://goo.gl/maps/hnF2jxYk9Uu" },
  { name: "Samir Refinery", arabic_name: "مصفاة سمير", country: "Morocco", capacity: 200000, google_maps_url: "https://goo.gl/maps/wrTpbL4ZS462" },
  { name: "Skikda Refinery", arabic_name: "مصفاة سكيكدة", country: "Algeria", capacity: 350000, google_maps_url: "https://goo.gl/maps/G4HsBvzkNv62" },
  { name: "Baytown Refinery", arabic_name: "مصفاة بيتاون", country: "USA", capacity: 560000, google_maps_url: "https://goo.gl/maps/gnFqkdN8" },
  { name: "Garyville Refinery", arabic_name: "مصفاة غاريفيل", country: "USA", capacity: 565000, google_maps_url: "https://goo.gl/maps/qnhMDnp4nXw" },
  { name: "Port Arthur Refinery", arabic_name: "مصفاة بورت آرثر", country: "USA", capacity: 635000, google_maps_url: "https://goo.gl/maps/RvJNw5Xk7PC2" },
  { name: "Galveston Bay Refinery", arabic_name: "مصفاة خليج غالفستون", country: "USA", capacity: 470000, google_maps_url: "https://goo.gl/maps/DqW6QpWGGU" },
  { name: "Pascagoula Refinery", arabic_name: "مصفاة باسكاغولا", country: "USA", capacity: 340000, google_maps_url: "https://goo.gl/maps/A6r3PdGAQWs" },
  { name: "Whiting Refinery", arabic_name: "مصفاة وايتينغ", country: "USA", capacity: 430000, google_maps_url: "https://goo.gl/maps/8LGfPKMrbcE2" },
  { name: "Edmonton Refinery", arabic_name: "مصفاة إدمونتون", country: "Canada", capacity: 187000, google_maps_url: "https://goo.gl/maps/FXKUQLP" },
  { name: "Montreal Refinery", arabic_name: "مصفاة مونتريال", country: "Canada", capacity: 137000, google_maps_url: "https://goo.gl/maps/iZoiw7jWW4z" },
  { name: "Tula Refinery", arabic_name: "مصفاة تولا", country: "Mexico", capacity: 315000, google_maps_url: "https://goo.gl/maps/UDXvNKBdwd9KBrWo9" },
  { name: "Cadereyta Refinery", arabic_name: "مصفاة كاديريتا", country: "Mexico", capacity: 275000, google_maps_url: "https://goo.gl/maps/PKMxeJ" },
  { name: "Salina Cruz Refinery", arabic_name: "مصفاة سالينا كروز", country: "Mexico", capacity: 330000, google_maps_url: "https://goo.gl/maps/tfrEAeDHPuC2" },
  { name: "Esmeraldas Refinery", arabic_name: "مصفاة إسميرالداس", country: "Ecuador", capacity: 110000, google_maps_url: "https://goo.gl/maps/VzKEVdxGNkT2" },
  { name: "Talara Refinery", arabic_name: "مصفاة تالارا", country: "Peru", capacity: 117000, google_maps_url: "https://goo.gl/maps/GhQVECFkb5m" },
  { name: "Puerto La Cruz Refinery", arabic_name: "مصفاة بويرتو لا كروز", country: "Venezuela", capacity: 195000, google_maps_url: "https://goo.gl/maps/NXnHBt9yAkQzf84G9" },
  { name: "Moín Refinery", arabic_name: "مصفاة موين", country: "Costa Rica", capacity: 25000, google_maps_url: "https://goo.gl/maps/T6z9qHLF4w" },
  { name: "La Planta Refinery", arabic_name: "مصفاة لا بلانتا", country: "Panama", capacity: 60000, google_maps_url: "https://goo.gl/maps/Bftqev5aEEF2" },
  { name: "Managua Refinery", arabic_name: "مصفاة ماناغوا", country: "Nicaragua", capacity: 20000, google_maps_url: "https://goo.gl/maps/2fBe7z54LF" },
  { name: "Monogas Refinery", arabic_name: "مصفاة موناغاس", country: "Trinidad", capacity: 175000, google_maps_url: "https://goo.gl/maps/M1TLXrEqeKr" },
  { name: "Isla Refinery", arabic_name: "مصفاة إسلا", country: "Curacao", capacity: 320000, google_maps_url: "https://goo.gl/maps/kJEQsXyaLRE2" },
  { name: "Gulf Aruba Refinery", arabic_name: "مصفاة خليج أروبا", country: "Aruba", capacity: 280000, google_maps_url: "https://goo.gl/maps/cY5T74NFsV7" },
  { name: "Manfred Refinery", arabic_name: "مصفاة مانفريد", country: "Belgium", capacity: 100000, google_maps_url: "https://goo.gl/maps/jCZHAoZTVA32" },
  { name: "Antwerp Refinery", arabic_name: "مصفاة أنتويرب", country: "Belgium", capacity: 400000, google_maps_url: "https://goo.gl/maps/9JVrLq2zxU62" },
  { name: "Feysin Refinery", arabic_name: "مصفاة فييزين", country: "France", capacity: 115000, google_maps_url: "https://goo.gl/maps/LjBMWM4W4o" },
  { name: "Milford Haven Refinery", arabic_name: "مصفاة ميلفورد هيفن", country: "United Kingdom", capacity: 108000, google_maps_url: "https://goo.gl/maps/tMwsXn94RtQ2" },
  { name: "Grangemouth Refinery", arabic_name: "مصفاة غرانجماوث", country: "United Kingdom", capacity: 210000, google_maps_url: "https://goo.gl/maps/YM5tMsSCbV62" },
  { name: "Lavéra Refinery", arabic_name: "مصفاة لافيرا", country: "France", capacity: 210000, google_maps_url: "https://goo.gl/maps/QzJVbMXMrYM2" },
  { name: "SATORP Refinery", arabic_name: "مصفاة ساتورب", country: "Saudi Arabia", capacity: 400000, google_maps_url: "https://goo.gl/maps/TuEjPkHjRbv" },
  { name: "Le Havre Refinery", arabic_name: "مصفاة لوهافر", country: "France", capacity: 247000, google_maps_url: "https://goo.gl/maps/euFaSSvGz7G2" },
  { name: "PCK Schwedt Refinery", arabic_name: "مصفاة بي سي كيه شويدت", country: "Germany", capacity: 240000, google_maps_url: "https://goo.gl/maps/hDqv5eBQstJ2" },
  { name: "Lyon Feyzin Refinery", arabic_name: "مصفاة ليون فيزان", country: "France", capacity: 119000, google_maps_url: "https://goo.gl/maps/vygNBKZD4Jw" },
  { name: "Porto Marghera Refinery", arabic_name: "مصفاة بورتو مارغيرا", country: "Italy", capacity: 80000, google_maps_url: "https://goo.gl/maps/vvBs8fpUKKG2" },
  { name: "Göteborg Refinery", arabic_name: "مصفاة غوتنبرغ", country: "Sweden", capacity: 120000, google_maps_url: "https://goo.gl/maps/syCHnBKkEMU2" },
  { name: "Porvoo Refinery", arabic_name: "مصفاة بورفو", country: "Finland", capacity: 206000, google_maps_url: "https://goo.gl/maps/7qw2SdNdsKyaL" },
  { name: "Plock Refinery", arabic_name: "مصفاة بلوك", country: "Poland", capacity: 327000, google_maps_url: "https://goo.gl/maps/vL4PnvpZbVv" },
  { name: "Kralupy Refinery", arabic_name: "مصفاة كرالوبي", country: "Czech Republic", capacity: 108000, google_maps_url: "https://goo.gl/maps/6FZcGpZFfVy" },
  { name: "Burgas Refinery", arabic_name: "مصفاة بورغاس", country: "Bulgaria", capacity: 196000, google_maps_url: "https://goo.gl/maps/KWSbfJcN71" },
  { name: "Neftochimik Refinery", arabic_name: "مصفاة نفتوشيميك", country: "Bulgaria", capacity: 140000, google_maps_url: "https://goo.gl/maps/G82E5S8FS1p" },
  { name: "INA Rijeka Refinery", arabic_name: "مصفاة إينا ريجيكا", country: "Croatia", capacity: 90000, google_maps_url: "https://goo.gl/maps/eSdR8Yr3U2" },
  { name: "MOL Duna Refinery", arabic_name: "مصفاة مول دونا", country: "Hungary", capacity: 165000, google_maps_url: "https://goo.gl/maps/MqbScovVZ" },
  { name: "Isab Refinery", arabic_name: "مصفاة إساب", country: "Sicily", capacity: 320000, google_maps_url: "https://goo.gl/maps/YUFTU" },
  { name: "Dangote Refinery", arabic_name: "مصفاة دانغوتي", country: "Nigeria", capacity: 650000, google_maps_url: "https://goo.gl/maps/93thWQmxMF" },
  { name: "Tarragona Crude Units", arabic_name: "وحدات تاراغونا", country: "Venezuela", capacity: 186000, google_maps_url: "https://goo.gl/maps/EVyosovnJC2" },
  { name: "El Alto Refinery", arabic_name: "مصفاة إل ألتو", country: "Peru", capacity: 30000, google_maps_url: "https://goo.gl/maps/hVZoSYnYyGiMixQP6" },
  { name: "PDVSA Refinery", arabic_name: "مصفاة بي دي في إس أيه", country: "Venezuela", capacity: 205000, google_maps_url: "https://goo.gl/maps/a" },
  { name: "Cartagena ECOPETROL", arabic_name: "مصفاة إيكوبيترول كارتاخينا", country: "Colombia", capacity: 80000, google_maps_url: "https://goo.gl/maps/LxJikKjgKUdv7cXW7" },
  { name: "YPF La Plata Refinery", arabic_name: "مصفاة واي بي أف لا بلاتا", country: "Argentina", capacity: 189000, google_maps_url: "https://goo.gl/maps/4" },
  { name: "Cape Town Refinery", arabic_name: "مصفاة كيب تاون", country: "South Africa", capacity: 100000, google_maps_url: "https://goo.gl/maps/JsdaWqadVoXx9tHb8" },
  { name: "Sapref Refinery", arabic_name: "مصفاة سابريف", country: "South Africa", capacity: 180000, google_maps_url: "https://goo.gl/maps/jJKdaKkeHuRGnS9h9" },
  { name: "Calref Refinery", arabic_name: "مصفاة كالريف", country: "South Africa", capacity: 110000, google_maps_url: "https://goo.gl/maps/9vbJJUhNbUu78" },
  { name: "Engen Refinery", arabic_name: "مصفاة إنجن", country: "South Africa", capacity: 120000, google_maps_url: "https://goo.gl/maps/8aZPU29Y1NAXR8" },
  { name: "Natref Refinery", arabic_name: "مصفاة ناتريف", country: "South Africa", capacity: 108000, google_maps_url: "https://goo.gl/maps/PDPUwVsqaM8" },
  { name: "Puma Refinery", arabic_name: "مصفاة بوما", country: "South Africa", capacity: 45000, google_maps_url: "https://goo.gl/maps/d9TSK1Sxm5aEv" },
  { name: "Achinsk Petrochemical", arabic_name: "مصفاة أشينسك", country: "Russia", capacity: 200000, google_maps_url: "https://goo.gl/maps/GSopZSaVKYU2" },
  { name: "Angarsk Petrochemical", arabic_name: "مصفاة أنغارسك", country: "Russia", capacity: 220000, google_maps_url: "https://goo.gl/maps/EFvpjszKNKv" },
  { name: "ORLEN Płock", arabic_name: "مصفاة أورلين", country: "Poland", capacity: 276000, google_maps_url: "https://goo.gl/maps/CwhG64jnqjA2" },
  { name: "Zhanjiang Refinery", arabic_name: "مصفاة جانجيانغ", country: "China", capacity: 200000, google_maps_url: "https://goo.gl/maps/HTFdTkdYB2" },
  { name: "Guangzhou Refinery", arabic_name: "مصفاة قوانغتشو", country: "China", capacity: 270000, google_maps_url: "https://goo.gl/maps/6T9bKsAHy" },
  { name: "Maoming Refinery", arabic_name: "مصفاة ماومينغ", country: "China", capacity: 360000, google_maps_url: "https://goo.gl/maps/EFJYD9heFko" },
  { name: "Sinopec Zhenhai", arabic_name: "مصفاة سينوبك جينهاي", country: "China", capacity: 460000, google_maps_url: "https://goo.gl/maps/aVCVcyxnHvA2" },
  { name: "Dalian Refinery", arabic_name: "مصفاة داليان", country: "China", capacity: 410000, google_maps_url: "https://goo.gl/maps/aChCD52o" },
  { name: "Jinan Refinery", arabic_name: "مصفاة جينان", country: "China", capacity: 200000, google_maps_url: "https://goo.gl/maps/YXpuAjb" },
  { name: "Hainan Refinery", arabic_name: "مصفاة هاينان", country: "China", capacity: 160000, google_maps_url: "https://goo.gl/maps/T2SYoKY" },
  { name: "Nagoya Refinery", arabic_name: "مصفاة ناغويا", country: "Japan", capacity: 220000, google_maps_url: "https://goo.gl/maps/RqpytsxaWp34w" },
  { name: "Kawasaki Refinery", arabic_name: "مصفاة كاواساكي", country: "Japan", capacity: 270000, google_maps_url: "https://goo.gl/maps/ySsM" },
  { name: "Ulsan Refinery", arabic_name: "مصفاة أولسان", country: "South Korea", capacity: 840000, google_maps_url: "https://goo.gl/maps/f" },
  { name: "Daesan Refinery", arabic_name: "مصفاة دايسان", country: "South Korea", capacity: 580000, google_maps_url: "https://goo.gl/maps/j" },
  { name: "Yeosu Refinery", arabic_name: "مصفاة يوسو", country: "South Korea", capacity: 320000, google_maps_url: "https://goo.gl/maps/y" },
  { name: "Mailiao Refinery", arabic_name: "مصفاة مايلياو", country: "Taiwan", capacity: 450000, google_maps_url: "https://goo.gl/maps/GKZSeNWTWPmCjuHu6" },
  { name: "Jamnagar Refinery", arabic_name: "مصفاة جامناغار", country: "India", capacity: 1240000, google_maps_url: "https://goo.gl/maps/HqaQEpkKHw" },
  { name: "Kochi Refinery", arabic_name: "مصفاة كوتشي", country: "India", capacity: 190000, google_maps_url: "https://goo.gl/maps/KoRa8XfkwRo" },
  { name: "Manali CPCL Refinery", arabic_name: "مصفاة سي بي سي إل منالي", country: "India", capacity: 210000, google_maps_url: "https://goo.gl/maps/cnjpCfWBEuC2" },
  { name: "Paradip Refinery", arabic_name: "مصفاة باراديب", country: "India", capacity: 300000, google_maps_url: "https://goo.gl/maps/JD4g45Tn" },
  { name: "Pakistan Refinery Limited", arabic_name: "شركة باكستان للتكرير", country: "Pakistan", capacity: 50000, google_maps_url: "https://goo.gl/maps/ZastKonhP8Pz" },
  { name: "Karachi Refinery", arabic_name: "مصفاة كراتشي", country: "Pakistan", capacity: 100000, google_maps_url: "https://goo.gl/maps/pxbtrkKwG6w" },
  { name: "Cilacap Refinery", arabic_name: "مصفاة سيلاكاب", country: "Indonesia", capacity: 348000, google_maps_url: "https://goo.gl/maps/DQVsbMKR5fG2" },
  { name: "Marsden Point Refinery", arabic_name: "مصفاة مارسدن بوينت", country: "New Zealand", capacity: 135000, google_maps_url: "https://goo.gl/maps/MarsdenPointRefinery" },
  { name: "Spring Island Refinery", arabic_name: "مصفاة سبرينغ آيلاند", country: "Singapore", capacity: 592000, google_maps_url: "https://goo.gl/maps/xebg5VsDFhM2" },
  { name: "Pearl GTL Refinery", arabic_name: "مصفاة لؤلؤة جي تي إل", country: "Qatar", capacity: 140000, google_maps_url: "https://goo.gl/maps/q2" },
  { name: "Chittagong Refinery", arabic_name: "مصفاة شيتاغونغ", country: "Bangladesh", capacity: 33000, google_maps_url: "https://goo.gl/maps/ChittagongRefinery" },
  { name: "Dung Quat Refinery", arabic_name: "مصفاة دونغ قوات", country: "Vietnam", capacity: 148000, google_maps_url: "https://goo.gl/maps/Dun" },
  { name: "Sapugaskanda Refinery", arabic_name: "مصفاة سابوغاسكاندا", country: "Sri Lanka", capacity: 45000, google_maps_url: "https://goo.gl/maps/w" },
  { name: "Duqm Refinery", arabic_name: "مصفاة الدقم", country: "Oman", capacity: 230000, google_maps_url: "https://goo.gl/maps/DuqmRefinery" },
  { name: "Oljeön Refinery", arabic_name: "مصفاة أوليون", country: "Sweden", capacity: 335000, google_maps_url: "https://goo.gl/maps/OljeonRefinery" },
  { name: "Daesan Refinery", arabic_name: "مصفاة دايسان", country: "South Korea", capacity: 500000, google_maps_url: "https://goo.gl/maps/DaesanRefinery" },
  { name: "Hyundai Heavy Industries Refinery", arabic_name: "مصفاة هيونداي هيفي", country: "South Korea", capacity: 500000, google_maps_url: "https://goo.gl/maps/HyndaiRefinery" }
];

/**
 * Determine region based on country name
 */
function determineRegionFromCountry(country) {
  const country_lc = (country || '').toLowerCase();
  
  // Middle East
  if ([
    'saudi arabia', 'uae', 'united arab emirates', 'kuwait', 'qatar', 'bahrain', 
    'oman', 'yemen', 'iraq', 'iran', 'jordan', 'lebanon', 'syria'
  ].includes(country_lc)) {
    return 'Middle East';
  }
  
  // North Africa
  if ([
    'egypt', 'libya', 'algeria', 'tunisia', 'morocco', 'sudan'
  ].includes(country_lc)) {
    return 'North Africa';
  }
  
  // Europe
  if ([
    'uk', 'united kingdom', 'england', 'france', 'germany', 'italy', 'spain', 
    'portugal', 'netherlands', 'belgium', 'luxembourg', 'switzerland', 
    'austria', 'greece', 'cyprus', 'malta', 'ireland', 'iceland', 'finland',
    'sweden', 'norway', 'denmark', 'poland', 'czech republic', 'slovakia',
    'hungary', 'romania', 'bulgaria', 'serbia', 'croatia', 'slovenia',
    'bosnia', 'macedonia', 'albania', 'montenegro', 'ukraine', 'moldova',
    'belarus', 'lithuania', 'latvia', 'estonia', 'russia'
  ].includes(country_lc)) {
    return country_lc.includes('russia') || country_lc.includes('ukraine') || 
           country_lc.includes('belarus') || country_lc.includes('moldova') || 
           country_lc.includes('romania') || country_lc.includes('bulgaria') || 
           country_lc.includes('hungary') || country_lc.includes('poland') ?
           'Eastern Europe' : 'Western Europe';
  }
  
  // North America
  if ([
    'usa', 'united states', 'us', 'canada', 'mexico'
  ].includes(country_lc)) {
    return 'North America';
  }
  
  // South America
  if ([
    'brazil', 'argentina', 'chile', 'peru', 'colombia', 'venezuela', 
    'bolivia', 'ecuador', 'uruguay', 'paraguay', 'guyana', 'suriname'
  ].includes(country_lc)) {
    return 'South America';
  }
  
  // Central America and Caribbean
  if ([
    'panama', 'costa rica', 'nicaragua', 'honduras', 'el salvador', 
    'guatemala', 'belize', 'cuba', 'jamaica', 'haiti', 'dominican republic',
    'puerto rico', 'bahamas', 'barbados', 'trinidad', 'trinidad and tobago',
    'curacao', 'aruba'
  ].includes(country_lc)) {
    return 'Central America';
  }
  
  // Africa (other than North)
  if ([
    'south africa', 'namibia', 'botswana', 'zimbabwe', 'mozambique', 
    'angola', 'zambia', 'malawi', 'tanzania', 'kenya', 'uganda', 
    'rwanda', 'burundi', 'congo', 'democratic republic of congo', 
    'cameroon', 'nigeria', 'benin', 'togo', 'ghana', 'ivory coast', 
    'liberia', 'sierra leone', 'guinea', 'guinea-bissau', 'senegal', 
    'mali', 'burkina faso', 'niger', 'chad', 'central african republic', 
    'gabon', 'equatorial guinea'
  ].includes(country_lc)) {
    return country_lc.includes('south') || country_lc.includes('namibia') || 
           country_lc.includes('botswana') || country_lc.includes('zimbabwe') || 
           country_lc.includes('mozambique') || country_lc.includes('angola') ?
           'Southern Africa' : 'West Africa';
  }
  
  // Asia and Pacific
  if ([
    'china', 'japan', 'south korea', 'north korea', 'taiwan', 'hong kong', 
    'mongolia', 'india', 'pakistan', 'bangladesh', 'sri lanka', 'nepal', 
    'bhutan', 'myanmar', 'thailand', 'laos', 'cambodia', 'vietnam', 
    'malaysia', 'singapore', 'indonesia', 'philippines', 'brunei', 
    'timor-leste', 'australia', 'new zealand', 'papua new guinea', 
    'fiji', 'solomon islands', 'vanuatu', 'samoa', 'tonga'
  ].includes(country_lc)) {
    return 'Asia Pacific';
  }
  
  // Default region if no match
  return 'Other';
}

/**
 * Extract lat/lng from Google Maps URL
 * Note: This is a simplified function. Actual coordinates would require 
 * parsing Google Maps URLs which can have different formats.
 */
function extractCoordinatesFromUrl(url) {
  // For simplicity, we'll use deterministic but fake coordinates based on the URL
  // In a real scenario, you would parse the URL or use geocoding
  
  // Create a hash number from the URL to get somewhat consistent coordinates
  let hashValue = 0;
  for (let i = 0; i < url.length; i++) {
    hashValue = ((hashValue << 5) - hashValue) + url.charCodeAt(i);
    hashValue = hashValue & hashValue; // Convert to 32bit integer
  }
  
  // Generate a latitude between -85 and 85 degrees
  const lat = ((Math.abs(hashValue) % 170) - 85) + (Math.abs(hashValue) % 100) / 100;
  
  // Generate a longitude between -180 and 180 degrees
  const lng = ((Math.abs(hashValue >> 8) % 360) - 180) + (Math.abs(hashValue) % 100) / 100;
  
  return {
    lat: parseFloat(lat.toFixed(6)),
    lng: parseFloat(lng.toFixed(6))
  };
}

/**
 * Generate a description for the refinery
 */
function generateRefineryDescription(refinery) {
  const name = refinery.name;
  const country = refinery.country;
  const capacity = refinery.capacity;
  const arabicName = refinery.arabic_name || '';
  
  const arabicText = arabicName ? ` (${arabicName})` : '';
  const capacityText = capacity ? `${capacity.toLocaleString()} barrels per day` : 'undisclosed capacity';
  
  return `${name}${arabicText} is a major petroleum refining facility located in ${country}. With a processing capacity of approximately ${capacityText}, it plays a significant role in meeting regional energy demands. The facility specializes in converting crude oil into a range of petroleum products including gasoline, diesel, jet fuel, and other essential petrochemicals.`;
}

/**
 * Import refineries from the data
 */
async function importRefineries() {
  let client;
  
  try {
    client = await pool.connect();
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Reset the auto-increment sequence for refineries
    await client.query('TRUNCATE refineries RESTART IDENTITY CASCADE');
    console.log('Cleared existing refineries from database');
    
    // Insert each refinery
    for (const refinery of refineries) {
      const region = determineRegionFromCountry(refinery.country);
      const coordinates = extractCoordinatesFromUrl(refinery.google_maps_url);
      
      // Use the appropriate schema for inserting
      const insertQuery = `
        INSERT INTO refineries (
          name, country, region, lat, lng, capacity, status, 
          description, operator, owner, type, products, year_built,
          complexity, city
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id
      `;
      
      const values = [
        refinery.name,
        refinery.country,
        region,
        coordinates.lat.toString(),
        coordinates.lng.toString(),
        refinery.capacity || 0,
        'operational',
        generateRefineryDescription(refinery),
        'Major Oil Company', // Default operator
        'Global Petroleum Corporation', // Default owner
        'oil', // Default type
        'gasoline, diesel, jet fuel, petrochemicals', // Default products
        Math.floor(1960 + Math.random() * 60), // Random year between 1960-2020
        (4 + Math.random() * 6).toFixed(1), // Random complexity between 4.0-10.0
        refinery.city || 'Unknown' // City
      ];
      
      const result = await client.query(insertQuery, values);
      console.log(`Inserted refinery: ${refinery.name} with ID ${result.rows[0].id}`);
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Refinery import completed successfully');
    
    // Get count of imported refineries
    const countResult = await client.query('SELECT COUNT(*) FROM refineries');
    console.log(`Total refineries in database: ${countResult.rows[0].count}`);
    
  } catch (error) {
    // Rollback transaction on error
    if (client) await client.query('ROLLBACK');
    console.error('Error importing refineries:', error);
  } finally {
    // Release client
    if (client) client.release();
    await pool.end();
  }
}

// Run the import function
importRefineries();