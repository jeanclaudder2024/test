/**
 * Script to import refinery data from our text file
 * For real refinery data import
 */
import { Pool, neonConfig } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ws from 'ws';

// Configure neon database
neonConfig.webSocketConstructor = ws;

// Initialize database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Path to the text file containing refinery information
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const textFilePath = path.join(__dirname, 'attached_assets', 'Pasted--Refineries--1744882635510.txt');

// Function to extract coordinates from text data
function extractCoordinates(text) {
  // This function is a placeholder since we don't have coordinates in the text
  // We would need to use a geocoding service to get actual coordinates
  // For now, we'll use predefined coordinates based on refinery names
  
  const predefinedCoordinates = {
    // Middle East
    'Ruwais Refinery': { lat: 24.1175, lng: 52.73 },
    'Al-Zour Refinery': { lat: 28.7325, lng: 48.3832 },
    'Ras Tanura Refinery': { lat: 26.6442, lng: 50.1525 },
    'Mina Al-Ahmadi Refinery': { lat: 29.0758, lng: 48.1458 },
    'Yanbu SAMREF Refinery': { lat: 23.9408, lng: 38.2192 },
    'Jubail SATORP Refinery': { lat: 27.0122, lng: 49.5952 },
    'Jazan Refinery': { lat: 16.9892, lng: 42.5511 },
    'Duqm Refinery': { lat: 19.6164, lng: 57.5925 },
    'Ras Laffan Refinery': { lat: 25.9033, lng: 51.5158 },
    
    // North Africa
    'Sidi R\'cine Refinery': { lat: 36.7544, lng: 3.0586 },
    'Hassi Messaoud Refinery': { lat: 31.7004, lng: 6.0728 },
    'Skikda Refinery': { lat: 36.8789, lng: 6.9428 },
    'Zawiya Refinery': { lat: 32.7817, lng: 12.7281 },
    'Ras Lanuf Refinery': { lat: 30.4982, lng: 18.5681 },
    'Brega Refinery': { lat: 30.4176, lng: 19.5895 },
    'Suez Refinery': { lat: 29.9669, lng: 32.5498 },
    'MIDOR Refinery': { lat: 31.1234, lng: 29.7535 },
    'Assiut Refinery': { lat: 27.1809, lng: 31.1837 },
    
    // North America
    'Port Arthur Refinery': { lat: 29.8956, lng: -93.9936 },
    'Baytown Refinery': { lat: 29.7544, lng: -95.0107 },
    'Garyville Refinery': { lat: 30.0681, lng: -90.6323 },
    'Baton Rouge Refinery': { lat: 30.5057, lng: -91.1465 },
    'Galveston Bay Refinery': { lat: 29.3758, lng: -94.9173 },
    'Los Angeles Refinery': { lat: 33.8058, lng: -118.2425 },
    'Wood River Refinery': { lat: 38.8362, lng: -90.0717 },
    'Saint John Refinery': { lat: 45.2733, lng: -66.0633 },
    'Edmonton Refinery': { lat: 53.5461, lng: -113.4938 },
    'Montreal Refinery': { lat: 45.6414, lng: -73.5070 },
    'Salina Cruz Refinery': { lat: 16.1811, lng: -95.1961 },
    'Tula Refinery': { lat: 20.0467, lng: -99.3411 },
    'Cadereyta Refinery': { lat: 25.5936, lng: -99.9892 },
    
    // Central and South America
    'La Libertad Refinery': { lat: -2.2156, lng: -80.9039 },
    'Esmeraldas Refinery': { lat: 0.9592, lng: -79.6548 },
    'Cartagena Refinery': { lat: 10.4042, lng: -75.5058 },
    'Puerto La Cruz Refinery': { lat: 10.2125, lng: -64.6775 },
    'Paraguaná Refinery Complex': { lat: 11.6504, lng: -70.2236 },
    'Amuay Refinery': { lat: 11.7489, lng: -70.2139 },
    'Presidente Getúlio Vargas Refinery': { lat: -25.5628, lng: -49.3549 },
    'Duque de Caxias Refinery': { lat: -22.7033, lng: -43.2558 },
    
    // Default coordinates (Atlantic Ocean) for unknown refineries
    'default': { lat: 0, lng: 0 }
  };
  
  return predefinedCoordinates[text] || predefinedCoordinates.default;
}

// Parse the text file to extract refinery information
async function extractRefineryData() {
  try {
    console.log(`Reading refinery data from: ${textFilePath}`);
    
    if (!fs.existsSync(textFilePath)) {
      console.error(`File not found: ${textFilePath}`);
      return [];
    }
    
    const fileContent = fs.readFileSync(textFilePath, 'utf8');
    const lines = fileContent.split('\n');
    
    const refineries = [];
    let currentRefinery = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // New refinery entry starts with a number followed by a period and refinery name
      if (/^\d+\.\s+مصفاة/.test(line)) {
        // Save previous refinery if exists
        if (currentRefinery) {
          refineries.push(currentRefinery);
        }
        
        // Extract refinery name - format: "1. مصفاة الرويس – Ruwais Refinery"
        const nameMatch = line.match(/–\s+(.+)$/);
        const name = nameMatch ? nameMatch[1].trim() : line;
        
        currentRefinery = {
          name: name,
          country: '',
          region: '',
          capacity: 0,
          lat: 0,
          lng: 0
        };
      } 
      // Country information - format: "o الدولة: الإمارات العربية المتحدة"
      else if (line.includes('الدولة:')) {
        const countryMatch = line.match(/الدولة:\s+(.+)$/);
        if (countryMatch && currentRefinery) {
          currentRefinery.country = translateArabicCountry(countryMatch[1].trim());
        }
      }
      // Capacity information - format: "o الطاقة التكريرية: 817,000 برميل/يوم"
      else if (line.includes('الطاقة التكريرية:')) {
        const capacityMatch = line.match(/التكريرية:\s+([0-9,]+)/);
        if (capacityMatch && currentRefinery) {
          currentRefinery.capacity = parseInt(capacityMatch[1].replace(/,/g, '')) || 0;
        }
      }
      // Region detection (look for section headers)
      else if (line.includes('Middle East') || line.includes('North Africa') || 
               line.includes('Eastern Europe') || line.includes('Western Europe') ||
               line.includes('North America') || line.includes('South America') ||
               line.includes('Central America') || line.includes('Southern Africa') ||
               line.includes('Asia Pacific')) {
        // Extract the English region name
        const regionMatch = line.match(/(Middle East|North Africa|Eastern Europe|Western Europe|North America|South America|Central America|Southern Africa|Asia Pacific)/);
        if (regionMatch) {
          // This will set the region for the next refineries until a new region is found
          if (currentRefinery) {
            currentRefinery.region = regionMatch[1];
          }
        }
      }
    }
    
    // Add the last refinery
    if (currentRefinery) {
      refineries.push(currentRefinery);
    }
    
    // Add coordinates to refineries
    for (const refinery of refineries) {
      const coordinates = extractCoordinates(refinery.name);
      refinery.lat = coordinates.lat;
      refinery.lng = coordinates.lng;
      
      // Set default values for missing fields
      refinery.type = 'oil';
      refinery.status = 'active';
      refinery.description = generateRefineryDescription(refinery);
    }
    
    return refineries;
  } catch (error) {
    console.error('Error extracting refinery data:', error);
    return [];
  }
}

// Helper function to translate Arabic country names to English
function translateArabicCountry(arabicName) {
  const countryMap = {
    'الإمارات العربية المتحدة': 'United Arab Emirates',
    'الكويت': 'Kuwait',
    'السعودية': 'Saudi Arabia',
    'سلطنة عمان': 'Oman',
    'قطر': 'Qatar',
    'اليمن': 'Yemen',
    'الجزائر': 'Algeria',
    'ليبيا': 'Libya',
    'مصر': 'Egypt',
    'تونس': 'Tunisia',
    'المغرب': 'Morocco',
    'رومانيا': 'Romania',
    'بولندا': 'Poland',
    'سلوفاكيا': 'Slovakia',
    'كرواتيا': 'Croatia',
    'بلغاريا': 'Bulgaria',
    'بيلاروسيا': 'Belarus',
    'جمهورية التشيك': 'Czech Republic',
    'صربيا': 'Serbia',
    'هولندا': 'Netherlands',
    'بلجيكا': 'Belgium',
    'ألمانيا': 'Germany',
    'المملكة المتحدة': 'United Kingdom',
    'فرنسا': 'France',
    'السويد': 'Sweden',
    'إيطاليا': 'Italy',
    'الولايات المتحدة الأمريكية': 'United States',
    'كندا': 'Canada',
    'المكسيك': 'Mexico',
    'الإكوادور': 'Ecuador',
    'كولومبيا': 'Colombia',
    'فنزويلا': 'Venezuela',
    'كوستاريكا': 'Costa Rica',
    'غواتيمالا': 'Guatemala',
    'هندوراس': 'Honduras',
    'نيكاراغوا': 'Nicaragua',
    'بنما': 'Panama',
    'البرازيل': 'Brazil',
    'بيرو': 'Peru',
    'أوروغواي': 'Uruguay',
    'تشيلي': 'Chile',
    'الأرجنتين': 'Argentina',
    'جنوب أفريقيا': 'South Africa',
    'روسيا': 'Russia',
    'الصين': 'China'
  };
  
  return countryMap[arabicName] || 'Unknown';
}

// Helper function to generate a description if not provided
function generateRefineryDescription(refinery) {
  return `${refinery.name} is a major petroleum refining facility located in ${refinery.country}. With a processing capacity of approximately ${refinery.capacity.toLocaleString()} barrels per day, it plays a significant role in meeting regional energy demands. The facility specializes in converting crude oil into a range of petroleum products including gasoline, diesel, jet fuel, and other essential petrochemicals.`;
}

// Main function to import refineries into the database
async function importRefineries() {
  try {
    // Extract refinery data from text file
    const refineries = await extractRefineryData();
    
    console.log(`Extracted ${refineries.length} refineries from text data`);
    
    if (refineries.length === 0) {
      console.error('No refineries extracted, aborting import');
      return;
    }
    
    // Clear existing refineries
    await pool.query('TRUNCATE refineries RESTART IDENTITY CASCADE');
    console.log('Cleared existing refineries from database');
    
    // Insert each refinery
    for (const refinery of refineries) {
      const insertQuery = `
        INSERT INTO refineries (
          name, country, region, lat, lng, capacity, status, 
          description, type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `;
      
      const values = [
        refinery.name,
        refinery.country,
        refinery.region,
        refinery.lat,
        refinery.lng,
        refinery.capacity,
        refinery.status,
        refinery.description,
        refinery.type
      ];
      
      const result = await pool.query(insertQuery, values);
      console.log(`Inserted refinery: ${refinery.name} with ID ${result.rows[0].id}`);
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

// Run the import function
importRefineries();