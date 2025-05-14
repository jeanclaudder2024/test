#!/usr/bin/env node
/**
 * Script to import oil shipping companies from Excel file
 * This script will replace all existing companies with oil shipping companies
 */
import pkg from 'pg';
const { Pool } = pkg;
import xlsx from 'xlsx';
import * as dotenv from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const excelPath = './attached_assets/Full_Oil_Shipping_Companies_List.xlsx';
    console.log(`Reading Excel file from: ${excelPath}`);
    
    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert Excel data to JSON
    const rawCompanies = xlsx.utils.sheet_to_json(worksheet);
    console.log(`Read ${rawCompanies.length} raw entries from Excel file`);
    
    // Process the companies to ensure they have the required fields
    const companies = rawCompanies.map((rawCompany, index) => {
      // Normalize field names (handle different case variations)
      const company = Object.keys(rawCompany).reduce((acc, key) => {
        acc[key.toLowerCase()] = rawCompany[key];
        return acc;
      }, {});
      
      return {
        name: company.name || company.companyname || `Oil Shipping Company ${index + 1}`,
        country: company.country || company.headquarters_country || 'International',
        region: company.region || 'International',
        description: company.description || generateCompanyDescription(company),
        website: company.website || company.url || null,
        logo: company.logo || null,
        headquarters: company.headquarters || company.hq || null,
        foundedYear: company.founded_year || company.foundedyear || company.founded || null,
        fleetSize: company.fleet_size || company.fleetsize || company.fleet || null,
        specialization: company.specialization || company.focus || 'Oil Shipping',
        status: company.status || 'active'
      };
    });
    
    console.log(`Processed ${companies.length} oil shipping companies`);
    
    // First, clear existing companies
    console.log('Clearing existing companies from database...');
    await pool.query('DELETE FROM companies');
    
    // Insert companies in batches to avoid query size limits
    const batchSize = 50;
    for (let i = 0; i < companies.length; i += batchSize) {
      const batch = companies.slice(i, i + batchSize);
      const placeholders = batch.map((_, idx) => 
        `($${idx * 15 + 1}, $${idx * 15 + 2}, $${idx * 15 + 3}, $${idx * 15 + 4}, $${idx * 15 + 5}, 
          $${idx * 15 + 6}, $${idx * 15 + 7}, $${idx * 15 + 8}, $${idx * 15 + 9}, $${idx * 15 + 10}, 
          $${idx * 15 + 11}, $${idx * 15 + 12}, $${idx * 15 + 13}, $${idx * 15 + 14}, $${idx * 15 + 15})`
      ).join(', ');
      
      const params = batch.flatMap(company => [
        company.name,
        company.country,
        company.region,
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
      console.log(`Inserted batch of ${batch.length} companies (${i + 1} to ${Math.min(i + batchSize, companies.length)})`);
    }
    
    console.log('Successfully imported oil shipping companies');
    
    // Verify import by fetching a few companies
    const { rows } = await pool.query('SELECT id, name, country, specialization FROM companies LIMIT 5');
    console.log('Sample of imported companies:');
    console.table(rows);
    
    console.log(`Total companies imported: ${(await pool.query('SELECT COUNT(*) FROM companies')).rows[0].count}`);
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
  const name = company.name || company.companyname || 'Unknown';
  const country = company.country || company.headquarters_country || 'International';
  const fleetSize = company.fleet_size || company.fleetsize || company.fleet || 'several';
  const specialization = company.specialization || company.focus || 'oil transportation';
  const founded = company.founded_year || company.foundedyear || company.founded;
  
  let description = `${name} is a leading oil shipping company based in ${country}`;
  
  if (founded) {
    description += ` established in ${founded}`;
  }
  
  description += `. The company operates a fleet of ${fleetSize} vessels specializing in ${specialization}. `;
  description += `They are a key player in the global maritime oil transportation industry, `;
  description += `ensuring safe and efficient delivery of petroleum products worldwide.`;
  
  return description;
}

// Run the script
main().catch(console.error);