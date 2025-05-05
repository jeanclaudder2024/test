// Import Companies Excel file to database directly into PostgreSQL
import xlsx from 'xlsx';
import { Pool } from '@neondatabase/serverless';
import { db } from './server/db';
import { companies } from './shared/schema';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// Get current directory
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
    
    // Clear existing data
    try {
      await db.delete(companies);
      console.log('Cleared existing companies data');
    } catch (error) {
      console.error('Error clearing companies table:', error);
    }
    
    // Helper function to convert numeric strings to proper format
    const parseNumeric = (value: any) => {
      if (value === undefined || value === null || value === '') {
        return null;
      }
      // If value is a number or a string that can be parsed as a number
      if (!isNaN(Number(value))) {
        return Number(value);
      }
      return null;
    };
    
    // Insert each company
    let importedCount = 0;
    for (const row of data) {
      try {
        // Process row data (row is a generic object from the Excel file)
        const rowData: Record<string, any> = row as Record<string, any>;
        
        const company = {
          name: String(rowData.Name || rowData.name || ''),
          country: String(rowData.Country || rowData.country || ''),
          region: String(rowData.Region || rowData.region || ''),
          headquarters: String(rowData.Headquarters || rowData.headquarters || ''),
          foundedYear: parseNumeric(rowData.FoundedYear || rowData.founded_year),
          ceo: String(rowData.CEO || rowData.ceo || ''),
          fleetSize: parseNumeric(rowData.FleetSize || rowData.fleet_size),
          revenue: parseNumeric(rowData.Revenue || rowData.revenue),
          specialization: String(rowData.Specialization || rowData.specialization || ''),
          website: String(rowData.Website || rowData.website || ''),
          description: String(rowData.Description || rowData.description || ''),
          status: String(rowData.Status || rowData.status || 'active')
        };
        
        // Insert into database
        const result = await db.insert(companies).values(company).returning();
        importedCount++;
        
        if (importedCount % 10 === 0) {
          console.log(`Imported ${importedCount} companies so far...`);
        }
      } catch (error) {
        console.error(`Error importing company ${row.Name || row.name}:`, error);
      }
    }
    
    console.log(`Successfully imported ${importedCount} companies to database`);
    
  } catch (error) {
    console.error('Error importing companies:', error);
  }
}

main().catch(console.error);