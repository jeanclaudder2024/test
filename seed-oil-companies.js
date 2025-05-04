import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to read Excel file
function readExcelFile(filePath) {
  try {
    console.log(`Reading Excel file from: ${filePath}`);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    console.log(`Successfully read ${data.length} rows from Excel`);
    return data;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return [];
  }
}

// Main function to process Excel data
async function main() {
  const filePath = path.resolve('./attached_assets/Full_Oil_Shipping_Companies_List.xlsx');
  
  if (!fs.existsSync(filePath)) {
    console.error(`Excel file not found at ${filePath}`);
    return;
  }
  
  // Read the Excel file
  const companies = readExcelFile(filePath);
  
  if (companies.length === 0) {
    console.error('No companies found in Excel file');
    return;
  }
  
  // Display structure of the first company to understand the data format
  console.log('First company data structure:');
  console.log(JSON.stringify(companies[0], null, 2));
  
  // Count companies by region
  const regionCounts = {};
  companies.forEach(company => {
    const region = company.Region || 'Unknown';
    regionCounts[region] = (regionCounts[region] || 0) + 1;
  });
  
  console.log('\nCompanies by region:');
  Object.entries(regionCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([region, count]) => {
      console.log(`${region}: ${count} companies`);
    });
  
  // Count companies by country
  const countryCounts = {};
  companies.forEach(company => {
    const country = company.Country || 'Unknown';
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });
  
  console.log('\nTop 10 countries by number of companies:');
  Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([country, count]) => {
      console.log(`${country}: ${count} companies`);
    });
    
  // Check for completeness of data
  const fieldStats = {};
  const fields = ['CompanyName', 'Country', 'Region', 'FleetSize', 'FoundedYear', 'Headquarters', 'CEO', 'Revenue', 'Specialization', 'Website', 'Description'];
  
  fields.forEach(field => {
    fieldStats[field] = {
      present: 0,
      missing: 0
    };
  });
  
  companies.forEach(company => {
    fields.forEach(field => {
      if (company[field] !== undefined && company[field] !== null && company[field] !== '') {
        fieldStats[field].present++;
      } else {
        fieldStats[field].missing++;
      }
    });
  });
  
  console.log('\nData completeness:');
  fields.forEach(field => {
    const present = fieldStats[field].present;
    const total = companies.length;
    const percentage = ((present / total) * 100).toFixed(2);
    console.log(`${field}: ${present}/${total} (${percentage}%)`);
  });
}

main().catch(console.error);