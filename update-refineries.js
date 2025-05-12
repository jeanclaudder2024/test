/**
 * Script to import refinery data from attached Excel file
 * This script will replace all existing refineries with the updated data
 */
import { Pool, neonConfig } from '@neondatabase/serverless';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ws from 'ws';

// Configure neon database
neonConfig.webSocketConstructor = ws;

// Initialize database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Path to the Excel file - ESM doesn't have __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const excelFilePath = path.join(__dirname, 'attached_assets', 'Complete_Real_Refineries_By_Region.xlsx');

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
    'egypt', 'libya', 'algeria', 'tunisia', 'morocco', 'sudan', 
    'south sudan', 'djibouti', 'ethiopia', 'eritrea', 'somalia'
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
    'puerto rico', 'bahamas', 'barbados', 'trinidad', 'trinidad and tobago'
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
 * Generate a description for the refinery
 */
function generateRefineryDescription(refinery) {
  const name = refinery.Name || refinery.name || 'This refinery';
  const country = refinery.Country || refinery.country || 'its region';
  const capacity = refinery.Capacity || refinery.capacity || 'various quantities';
  const capacityDisplay = capacity 
    ? parseInt(capacity).toLocaleString() + ' barrels per day'
    : 'an undisclosed capacity';
  
  const owner = refinery.Owner || refinery.owner || '';
  const operator = refinery.Operator || refinery.operator || '';
  const ownerText = owner ? ` Owned by ${owner}` : '';
  const operatorText = operator && operator !== owner ? ` and operated by ${operator}` : '';
  
  return `${name} is a major petroleum refining facility located in ${country}. With a processing capacity of approximately ${capacityDisplay}, it plays a significant role in meeting regional energy demands.${ownerText}${operatorText}, the facility specializes in converting crude oil into a range of petroleum products including gasoline, diesel, jet fuel, and other essential petrochemicals.`;
}

/**
 * Import refineries from Excel file
 */
async function importRefineries() {
  try {
    console.log(`Reading Excel file from: ${excelFilePath}`);
    
    if (!fs.existsSync(excelFilePath)) {
      console.error(`File not found: ${excelFilePath}`);
      console.error(`Current directory: ${__dirname}`);
      console.error(`Files in directory:`, fs.readdirSync(__dirname));
      
      // Check if attached_assets directory exists
      const assetsDir = path.join(__dirname, 'attached_assets');
      if (fs.existsSync(assetsDir)) {
        console.error(`Files in attached_assets:`, fs.readdirSync(assetsDir));
      } else {
        console.error('attached_assets directory does not exist');
      }
      return;
    }
    
    // Read the Excel file
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const refineries = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Found ${refineries.length} refineries in Excel file`);
    console.log('Sample data from first refinery:', JSON.stringify(refineries[0], null, 2));
    
    // Check refineries data before proceeding
    if (refineries.length === 0) {
      console.error('No refineries found in Excel file. Aborting import.');
      return;
    }
    
    // Reset the auto-increment sequence for refineries
    await pool.query('TRUNCATE refineries RESTART IDENTITY CASCADE');
    console.log('Cleared existing refineries from database');
    
    // Check the table structure to ensure we're mapping fields correctly
    const tableInfo = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'refineries'
    `);
    
    console.log('Available database columns:', tableInfo.rows.map(r => r.column_name).join(', '));
    
    // Insert each refinery
    for (const refinery of refineries) {
      // Map Excel columns to database fields
      const insertQuery = `
        INSERT INTO refineries (
          name, country, region, lat, lng, capacity, status,
          description, operator, owner, type, products, year_built,
          complexity, city
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id
      `;
      
      // Try different field names that could be used in the Excel file
      const name = refinery.Name || refinery.name || refinery.REFINERY || refinery.Refinery || 'Unknown';
      const country = refinery.Country || refinery.country || refinery.COUNTRY || 'Unknown';
      const region = refinery.Region || refinery.region || refinery.REGION || determineRegionFromCountry(country);
      
      // Handle various possible field names for coordinates
      const lat = parseFloat(
        refinery.Latitude || refinery.latitude || refinery.LATITUDE || 
        refinery.Lat || refinery.lat || refinery.LAT || 0
      );
      
      const lng = parseFloat(
        refinery.Longitude || refinery.longitude || refinery.LONGITUDE || 
        refinery.Lng || refinery.lng || refinery.LNG || 0
      );
      
      // Handle capacity field
      let capacity = refinery.Capacity || refinery.capacity || refinery.CAPACITY || 0;
      // If capacity is a string with commas, clean it
      if (typeof capacity === 'string') {
        capacity = parseInt(capacity.replace(/,/g, ''));
      }
      
      // Get status and other fields, or use defaults
      const status = refinery.Status || refinery.status || refinery.STATUS || 'active';
      const description = refinery.Description || refinery.description || generateRefineryDescription(refinery);
      const operator = refinery.Operator || refinery.operator || refinery.OPERATOR || 'Unknown';
      const owner = refinery.Owner || refinery.owner || refinery.OWNER || 'Unknown';
      const type = refinery.Type || refinery.type || refinery.TYPE || 'oil';
      const products = refinery.Products || refinery.products || refinery.PRODUCTS || 'crude oil, gasoline, diesel';
      const yearBuilt = parseInt(refinery.YearBuilt || refinery.year_built || refinery.YEAR_BUILT || 0) || null;
      const complexity = parseFloat(refinery.Complexity || refinery.complexity || refinery.COMPLEXITY || 0) || null;
      const city = refinery.City || refinery.city || refinery.CITY || 'Unknown';
      
      const values = [
        name, country, region, lat, lng, capacity, status,
        description, operator, owner, type, products, yearBuilt,
        complexity, city
      ];
      
      try {
        const result = await pool.query(insertQuery, values);
        console.log(`Inserted refinery: ${name} with ID ${result.rows[0].id}`);
      } catch (error) {
        console.error(`Error inserting refinery ${name}:`, error.message);
        // Continue with next refinery despite error
      }
    }
    
    console.log('Refinery import completed');
    
    // Get count of imported refineries
    const countResult = await pool.query('SELECT COUNT(*) FROM refineries');
    console.log(`Total refineries in database: ${countResult.rows[0].count}`);
    
  } catch (error) {
    console.error('Error importing refineries:', error);
  } finally {
    await pool.end();
  }
}

// Run the import function
importRefineries();