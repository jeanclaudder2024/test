import { storage } from "../storage";
import { InsertOilCompany } from "@shared/schema";
import { REGIONS } from "@shared/constants";
import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';

/**
 * Service for managing oil companies
 */
export const oilCompanyService = {

  /**
   * Seed oil company data from Excel file
   */
  async seedOilCompanyData(): Promise<{
    companies: number, 
    seeded: boolean
  }> {
    try {
      console.log("Checking existing oil companies in database...");
      const existingCompanies = await storage.getOilCompanies();
      
      // If we already have companies in the database, return early
      if (existingCompanies.length > 0) {
        console.log(`Database already contains ${existingCompanies.length} oil companies.`);
        return {
          companies: existingCompanies.length,
          seeded: false
        };
      }
      
      console.log("No oil companies found. Seeding from Excel file...");
      
      // Read the Excel file
      try {
        const filePath = path.resolve('./attached_assets/Full_Oil_Shipping_Companies_List.xlsx');
        if (!fs.existsSync(filePath)) {
          console.error(`Excel file not found at ${filePath}`);
          return { companies: 0, seeded: false };
        }
        
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        
        console.log(`Read ${data.length} oil companies from Excel file`);
        
        // Map the Excel data to our schema
        const oilCompanies: InsertOilCompany[] = data.map((row: any) => {
          // Determine region based on country
          const region = this.determineRegionFromCountry(row.Country || 'Unknown');
          
          return {
            name: row.CompanyName || 'Unknown Company',
            country: row.Country || 'Unknown',
            region: region,
            fleetSize: row.FleetSize ? parseInt(row.FleetSize) : null,
            foundedYear: row.FoundedYear ? parseInt(row.FoundedYear) : null,
            headquarters: row.Headquarters || null,
            ceo: row.CEO || null,
            revenue: row.Revenue || null,
            specialization: row.Specialization || null,
            website: row.Website || null,
            majorRoutes: row.MajorRoutes || null,
            description: row.Description || `${row.CompanyName} is an oil shipping company based in ${row.Country}.`
          };
        });
        
        // Insert oil companies
        let insertedCount = 0;
        for (const company of oilCompanies) {
          try {
            await storage.createOilCompany(company);
            insertedCount++;
          } catch (error) {
            console.error(`Error inserting oil company ${company.name}:`, error);
          }
        }
        
        console.log(`Successfully seeded ${insertedCount} oil companies`);
        return {
          companies: insertedCount,
          seeded: true
        };
        
      } catch (error) {
        console.error("Error reading Excel file:", error);
        return { companies: 0, seeded: false };
      }
    } catch (error) {
      console.error("Error in oil company seeding:", error);
      return { companies: 0, seeded: false };
    }
  },
  
  /**
   * Determine region from country name
   */
  determineRegionFromCountry(country: string): string {
    // Map countries to regions
    const regionMap: Record<string, string> = {
      // Asia-Pacific
      'China': 'Asia-Pacific',
      'Japan': 'Asia-Pacific',
      'South Korea': 'Asia-Pacific',
      'Taiwan': 'Asia-Pacific',
      'Singapore': 'Asia-Pacific',
      'Malaysia': 'Asia-Pacific',
      'Indonesia': 'Asia-Pacific',
      'Philippines': 'Asia-Pacific',
      'Thailand': 'Asia-Pacific',
      'Vietnam': 'Asia-Pacific',
      'Australia': 'Asia-Pacific',
      'New Zealand': 'Asia-Pacific',
      'India': 'Asia-Pacific',
      
      // Europe
      'United Kingdom': 'Europe',
      'UK': 'Europe',
      'England': 'Europe',
      'France': 'Europe',
      'Germany': 'Europe',
      'Italy': 'Europe',
      'Spain': 'Europe',
      'Netherlands': 'Europe',
      'Belgium': 'Europe',
      'Norway': 'Europe',
      'Sweden': 'Europe',
      'Denmark': 'Europe',
      'Finland': 'Europe',
      'Greece': 'Europe',
      'Russia': 'Europe',
      
      // North America
      'United States': 'North America',
      'USA': 'North America',
      'US': 'North America',
      'Canada': 'North America',
      'Mexico': 'North America',
      
      // Latin America
      'Brazil': 'Latin America',
      'Argentina': 'Latin America',
      'Chile': 'Latin America',
      'Peru': 'Latin America',
      'Colombia': 'Latin America',
      'Venezuela': 'Latin America',
      
      // Middle East
      'Saudi Arabia': 'Middle East',
      'UAE': 'Middle East',
      'United Arab Emirates': 'Middle East',
      'Qatar': 'Middle East',
      'Kuwait': 'Middle East',
      'Oman': 'Middle East',
      'Bahrain': 'Middle East',
      'Iran': 'Middle East',
      'Iraq': 'Middle East',
      
      // Africa
      'South Africa': 'Africa',
      'Nigeria': 'Africa',
      'Egypt': 'Africa',
      'Morocco': 'Africa',
      'Algeria': 'Africa',
      'Angola': 'Africa',
      'Ghana': 'Africa',
      'Kenya': 'Africa'
    };
    
    return regionMap[country] || this.guessRegion(country);
  },
  
  /**
   * Make an educated guess about the region based on the country name
   */
  guessRegion(country: string): string {
    // If no exact match, try to guess based on common patterns
    const countryLower = country.toLowerCase();
    
    if (countryLower.includes('asia') || 
        countryLower.includes('china') || 
        countryLower.includes('japan') || 
        countryLower.includes('korea') ||
        countryLower.includes('singapore')) {
      return 'Asia-Pacific';
    }
    
    if (countryLower.includes('europe') || 
        countryLower.includes('uk') || 
        countryLower.includes('france') || 
        countryLower.includes('germany') ||
        countryLower.includes('italy') ||
        countryLower.includes('spain')) {
      return 'Europe';
    }
    
    if (countryLower.includes('america') || 
        countryLower.includes('us') || 
        countryLower.includes('canada') || 
        countryLower.includes('mexico')) {
      return 'North America';
    }
    
    if (countryLower.includes('brazil') || 
        countryLower.includes('argentina') || 
        countryLower.includes('chile') ||
        countryLower.includes('latin')) {
      return 'Latin America';
    }
    
    if (countryLower.includes('middle east') || 
        countryLower.includes('saudi') || 
        countryLower.includes('arab') || 
        countryLower.includes('emirates') ||
        countryLower.includes('qatar') ||
        countryLower.includes('kuwait')) {
      return 'Middle East';
    }
    
    if (countryLower.includes('africa') || 
        countryLower.includes('nigeria') || 
        countryLower.includes('egypt') || 
        countryLower.includes('morocco')) {
      return 'Africa';
    }
    
    // If all else fails, return a default region
    return 'Global';
  }
};

export default oilCompanyService;