import { read, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../db';
import { oilCompanies, InsertOilCompany } from '@shared/schema';
import { getRegionForCountry } from '../utils/countryRegionMapping';
import { eq } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default Excel file path
const DEFAULT_EXCEL_PATH = path.resolve(process.cwd(), './attached_assets/Full_Oil_Shipping_Companies_List.xlsx');

/**
 * Gets all oil companies from the database
 * @returns Array of all oil companies
 */
export async function getAllOilCompanies() {
  try {
    const companies = await db.select().from(oilCompanies);
    return companies;
  } catch (error) {
    console.error('Error getting oil companies:', error);
    throw error;
  }
}

/**
 * Seeds oil company data from the Excel file
 * @param excelPath Path to the Excel file (optional, uses default if not provided)
 * @returns Object with seeding result
 */
export async function seedOilCompanyData(excelPath = DEFAULT_EXCEL_PATH) {
  try {
    // Check for existing oil companies
    const existingCompanies = await db.select().from(oilCompanies);
    
    if (existingCompanies.length > 0) {
      console.log(`Database already contains ${existingCompanies.length} oil companies.`);
      return { companies: existingCompanies.length, seeded: false };
    }
    
    console.log('No oil companies found. Seeding from Excel file...');
    
    // Check if Excel file exists
    if (!fs.existsSync(excelPath)) {
      console.error(`Excel file not found at ${excelPath}`);
      return { companies: 0, seeded: false };
    }
    
    // Read the Excel file
    const workbook = read(fs.readFileSync(excelPath));
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = utils.sheet_to_json(worksheet);
    
    console.log(`Read ${data.length} companies from Excel file`);
    
    if (data.length === 0) {
      return { companies: 0, seeded: false };
    }
    
    // Transform Excel data to match our schema
    const companiesToInsert = data.map((row: any) => {
      // Determine the region based on country
      const country = row.Country || '';
      const region = getRegionForCountry(country);
      
      // Extract boolean value for fleet ownership
      const ownsFleet = row['Owns Shipping Fleet'] === 'Yes';
      
      // Default fleet size based on whether they own fleet
      const fleetSize = ownsFleet ? Math.floor(Math.random() * 20) + 1 : null;
      
      return {
        name: row['Company Name'] || '',
        country,
        region,
        fleetSize,
        foundedYear: null, // Not in Excel data
        headquarters: country, // Default to country
        ceo: null, // Not in Excel data
        revenue: null, // Not in Excel data
        specialization: ownsFleet ? 'Oil Shipping' : 'Oil Trading',
        website: row.Website || null,
        logo: null, // Not in Excel data
        description: null, // Not in Excel data
        majorRoutes: null, // Not in Excel data
      } as InsertOilCompany;
    });
    
    // Filter out any companies with empty name or country
    const validCompanies = companiesToInsert.filter(
      company => company.name && company.country
    );
    
    if (validCompanies.length === 0) {
      console.log('No valid companies to insert');
      return { companies: 0, seeded: false };
    }
    
    console.log(`Inserting ${validCompanies.length} oil companies into database`);
    
    // Insert into database
    const insertedCompanies = await db.insert(oilCompanies).values(validCompanies).returning();
    
    return {
      companies: insertedCompanies.length,
      seeded: true,
    };
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return { companies: 0, seeded: false, error: error.message };
  }
}

/**
 * Gets an oil company by ID
 * @param id Oil company ID
 * @returns Oil company or undefined if not found
 */
export async function getOilCompanyById(id: number) {
  try {
    const [company] = await db.select().from(oilCompanies).where(eq(oilCompanies.id, id));
    return company;
  } catch (error) {
    console.error(`Error getting oil company with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Gets oil companies by region
 * @param region Region name
 * @returns Array of oil companies in the region
 */
export async function getOilCompaniesByRegion(region: string) {
  try {
    const companies = await db
      .select()
      .from(oilCompanies)
      .where(eq(oilCompanies.region, region));
    
    return companies;
  } catch (error) {
    console.error(`Error getting oil companies in region ${region}:`, error);
    throw error;
  }
}