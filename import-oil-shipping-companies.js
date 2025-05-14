/**
 * Script to import oil shipping companies from Excel file
 * This script will replace all existing companies with oil shipping companies
 */
const { Pool } = require('pg');
const fs = require('fs');
const xlsx = require('xlsx');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log('Starting oil shipping companies import process...');
  
  try {
    // Read the Excel file
    const workbook = xlsx.readFile('./attached_assets/Full_Oil_Shipping_Companies_List.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert Excel data to JSON
    const companies = xlsx.utils.sheet_to_json(worksheet);
    
    console.log(`Read ${companies.length} oil shipping companies from Excel file`);
    
    // First, clear existing companies
    console.log('Clearing existing companies from database...');
    await pool.query('DELETE FROM companies');
    
    // Prepare companies for bulk insert
    const values = companies.map((company, index) => {
      return {
        name: company.Name || company.name || `Oil Shipping Company ${index + 1}`,
        country: company.Country || company.country || 'Unknown',
        description: company.Description || company.description || generateCompanyDescription(company),
        website: company.Website || company.website || null,
        logo: company.Logo || company.logo || null,
        foundedYear: company.FoundedYear || company.foundedYear || null,
        headquarters: company.Headquarters || company.headquarters || null,
        fleetSize: company.FleetSize || company.fleetSize || null,
        specialization: company.Specialization || company.specialization || 'Oil Shipping',
        status: company.Status || company.status || 'active'
      };
    });
    
    // Insert companies in batches to avoid query size limits
    const batchSize = 100;
    for (let i = 0; i < values.length; i += batchSize) {
      const batch = values.slice(i, i + batchSize);
      const placeholders = batch.map((_, idx) => 
        `($${idx * 15 + 1}, $${idx * 15 + 2}, $${idx * 15 + 3}, $${idx * 15 + 4}, $${idx * 15 + 5}, 
          $${idx * 15 + 6}, $${idx * 15 + 7}, $${idx * 15 + 8}, $${idx * 15 + 9}, $${idx * 15 + 10}, 
          $${idx * 15 + 11}, $${idx * 15 + 12}, $${idx * 15 + 13}, $${idx * 15 + 14}, $${idx * 15 + 15})`
      ).join(', ');
      
      const params = batch.flatMap(company => [
        company.name,
        company.country,
        'International', // region
        company.description,
        company.website,
        company.logo,
        company.headquarters,
        company.foundedYear,
        company.fleetSize,
        null, // revenue
        null, // employees
        false, // publicly_traded
        null, // stock_symbol
        company.specialization,
        company.status
      ]);
      
      const query = `
        INSERT INTO companies (
          name, country, region, description, website, logo, headquarters, 
          founded_year, fleet_size, revenue, employees, publicly_traded, 
          stock_symbol, specialization, status
        )
        VALUES ${placeholders}
      `;
      
      await pool.query(query, params);
      console.log(`Inserted batch of ${batch.length} companies (${i + 1} to ${Math.min(i + batchSize, values.length)})`);
    }
    
    console.log('Successfully imported oil shipping companies');
  } catch (error) {
    console.error('Error importing oil shipping companies:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

/**
 * Generate a description for a company based on its data
 */
function generateCompanyDescription(company) {
  const name = company.Name || company.name || 'Unknown';
  const country = company.Country || company.country || 'Unknown';
  const fleetSize = company.FleetSize || company.fleetSize || 'multiple';
  const specialization = company.Specialization || company.specialization || 'oil transportation';
  
  return `${name} is an oil shipping company based in ${country}. The company operates a fleet of ${fleetSize} vessels specializing in ${specialization}. They are a key player in the global maritime oil transportation industry.`;
}

// Run the script
main().catch(console.error);