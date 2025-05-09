/**
 * Script to import real refinery data from Excel file
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

async function importRefineries() {
  try {
    console.log(`Reading Excel file from: ${excelFilePath}`);
    
    if (!fs.existsSync(excelFilePath)) {
      console.error(`File not found: ${excelFilePath}`);
      return;
    }
    
    // Read the Excel file
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const refineries = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Found ${refineries.length} refineries in Excel file`);
    
    // Reset the auto-increment sequence for refineries
    await pool.query('TRUNCATE refineries RESTART IDENTITY CASCADE');
    
    // Insert each refinery
    for (const refinery of refineries) {
      // Map Excel columns to database fields
      // Adjust these mappings based on your actual Excel structure
      const insertQuery = `
        INSERT INTO refineries (
          name, country, region, lat, lng, capacity, status, 
          description, operator, owner, type, products, year_built,
          complexity, city
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id
      `;
      
      const values = [
        refinery.Name || refinery.name || 'Unknown',
        refinery.Country || refinery.country || 'Unknown',
        refinery.Region || refinery.region || determineRegionFromCountry(refinery.Country || refinery.country),
        parseFloat(refinery.Latitude || refinery.Lat || refinery.lat || 0),
        parseFloat(refinery.Longitude || refinery.Lng || refinery.lng || 0),
        parseInt(refinery.Capacity || refinery.capacity || 0),
        refinery.Status || refinery.status || 'active',
        refinery.Description || refinery.description || generateRefineryDescription(refinery),
        refinery.Operator || refinery.operator || 'Unknown',
        refinery.Owner || refinery.owner || 'Unknown',
        refinery.Type || refinery.type || 'oil',
        refinery.Products || refinery.products || 'crude oil, gasoline, diesel',
        parseInt(refinery.YearBuilt || refinery.year_built || 1980),
        parseFloat(refinery.Complexity || refinery.complexity || 5.5),
        refinery.City || refinery.city || 'Unknown'
      ];
      
      const result = await pool.query(insertQuery, values);
      console.log(`Inserted refinery: ${refinery.Name || refinery.name} with ID ${result.rows[0].id}`);
    }
    
    console.log('Refinery import completed successfully');
    
    // Get count of imported refineries
    const countResult = await pool.query('SELECT COUNT(*) FROM refineries');
    console.log(`Total refineries in database: ${countResult.rows[0].count}`);
    
  } catch (error) {
    console.error('Error importing refineries:', error);
  } finally {
    await pool.end();
  }
}

// Helper function to determine region from country if not specified
function determineRegionFromCountry(country) {
  const regionMap = {
    'USA': 'North America',
    'United States': 'North America',
    'Canada': 'North America',
    'Mexico': 'North America',
    'Brazil': 'South America',
    'Argentina': 'South America',
    'Colombia': 'South America',
    'Venezuela': 'South America',
    'UK': 'Europe',
    'United Kingdom': 'Europe',
    'France': 'Europe',
    'Germany': 'Europe',
    'Italy': 'Europe',
    'Spain': 'Europe',
    'Netherlands': 'Europe',
    'Belgium': 'Europe',
    'Russia': 'Europe',
    'Saudi Arabia': 'Middle East',
    'UAE': 'Middle East',
    'Kuwait': 'Middle East',
    'Qatar': 'Middle East',
    'Iran': 'Middle East',
    'Iraq': 'Middle East',
    'China': 'Asia Pacific',
    'Japan': 'Asia Pacific',
    'South Korea': 'Asia Pacific',
    'Indonesia': 'Asia Pacific',
    'India': 'Asia Pacific',
    'Australia': 'Asia Pacific',
    'Singapore': 'Asia Pacific',
    'Malaysia': 'Asia Pacific',
    'Nigeria': 'Africa',
    'South Africa': 'Africa',
    'Egypt': 'Africa',
    'Angola': 'Africa',
    'Libya': 'Africa'
  };
  
  return regionMap[country] || 'Other';
}

// Helper function to generate a description if not provided
function generateRefineryDescription(refinery) {
  const name = refinery.Name || refinery.name || 'This refinery';
  const country = refinery.Country || refinery.country || 'its region';
  const capacity = refinery.Capacity || refinery.capacity || 'various quantities';
  
  return `${name} is a major petroleum refining facility located in ${country}. With a processing capacity of approximately ${capacity} barrels per day, it plays a significant role in meeting regional energy demands. The facility specializes in converting crude oil into a range of petroleum products including gasoline, diesel, jet fuel, and other essential petrochemicals.`;
}

// Run the import function
importRefineries();