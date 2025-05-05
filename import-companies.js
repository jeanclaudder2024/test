// Import Companies Excel file to database
import xlsx from 'xlsx';
import { pool } from './server/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    console.log('Starting import of oil shipping companies...');
    
    // Path to the Excel file
    const filePath = path.join(__dirname, 'attached_assets', 'Full_Oil_Shipping_Companies_List.xlsx');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }
    
    // Read the Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    console.log(`Found ${data.length} companies in Excel file`);
    
    // Establish database connection
    const client = await pool.connect();
    
    try {
      // Begin transaction
      await client.query('BEGIN');
      
      // Clear existing data (optional)
      await client.query('DELETE FROM companies');
      
      // Insert data
      let importedCount = 0;
      
      for (const company of data) {
        const query = `
          INSERT INTO companies (
            name, country, region, headquarters, 
            founded_year, ceo, fleet_size, revenue, 
            specialization, website, description, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING id
        `;
        
        const values = [
          company.Name || company.name,
          company.Country || company.country,
          company.Region || company.region,
          company.Headquarters || company.headquarters,
          company.FoundedYear || company.founded_year,
          company.CEO || company.ceo,
          company.FleetSize || company.fleet_size,
          company.Revenue || company.revenue,
          company.Specialization || company.specialization,
          company.Website || company.website,
          company.Description || company.description,
          company.Status || company.status || 'active'
        ];
        
        const result = await client.query(query, values);
        if (result.rows.length > 0) {
          importedCount++;
        }
      }
      
      // Commit transaction
      await client.query('COMMIT');
      
      console.log(`Successfully imported ${importedCount} companies to database`);
    } catch (err) {
      // Rollback on error
      await client.query('ROLLBACK');
      throw err;
    } finally {
      // Release client back to pool
      client.release();
    }
    
  } catch (error) {
    console.error('Error importing companies:', error);
  } finally {
    // Close pool
    await pool.end();
  }
}

main();