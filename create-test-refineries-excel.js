/**
 * Script to create a test Excel file with refineries data
 * This is just for testing the import functionality
 */
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Path to the Excel file - ESM doesn't have __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const excelFilePath = path.join(__dirname, 'attached_assets', 'Complete_Real_Refineries_By_Region.xlsx');

// Sample refinery data
const refineries = [
  {
    Name: "Saudi Aramco Ras Tanura Refinery",
    Country: "Saudi Arabia",
    Region: "Middle East",
    Latitude: 26.6442,
    Longitude: 50.152,
    Capacity: 550000,
    Status: "active",
    Operator: "Saudi Aramco",
    Owner: "Saudi Aramco",
    Type: "integrated",
    Products: "gasoline, diesel, jet fuel, LPG, petrochemicals",
    YearBuilt: 1945,
    Complexity: 7.8,
    City: "Ras Tanura"
  },
  {
    Name: "ExxonMobil Baytown Refinery",
    Country: "United States",
    Region: "North America",
    Latitude: 29.7544,
    Longitude: -95.0107,
    Capacity: 584000,
    Status: "operational",
    Operator: "ExxonMobil",
    Owner: "ExxonMobil",
    Type: "integrated",
    Products: "gasoline, diesel, jet fuel, lubricants, petrochemicals",
    YearBuilt: 1919,
    Complexity: 9.5,
    City: "Baytown, Texas"
  },
  {
    Name: "Shell Pernis Refinery",
    Country: "Netherlands",
    Region: "Western Europe",
    Latitude: 51.8854,
    Longitude: 4.3752,
    Capacity: 404000,
    Status: "active",
    Operator: "Shell",
    Owner: "Royal Dutch Shell",
    Type: "integrated",
    Products: "gasoline, diesel, jet fuel, petrochemicals",
    YearBuilt: 1936,
    Complexity: 9.1,
    City: "Rotterdam"
  },
  {
    Name: "Sinopec Zhenhai Refinery",
    Country: "China",
    Region: "Asia Pacific",
    Latitude: 29.9663,
    Longitude: 121.7375,
    Capacity: 460000,
    Status: "operational",
    Operator: "Sinopec",
    Owner: "China Petroleum & Chemical Corporation",
    Type: "integrated",
    Products: "gasoline, diesel, jet fuel, petrochemicals",
    YearBuilt: 1975,
    Complexity: 10.5,
    City: "Ningbo"
  },
  {
    Name: "ADNOC Ruwais Refinery",
    Country: "United Arab Emirates",
    Region: "Middle East",
    Latitude: 24.1249,
    Longitude: 52.7291,
    Capacity: 837000,
    Status: "operational",
    Operator: "ADNOC Refining",
    Owner: "Abu Dhabi National Oil Company",
    Type: "integrated",
    Products: "gasoline, diesel, jet fuel, LPG, naphtha, petrochemicals",
    YearBuilt: 1981,
    Complexity: 8.9,
    City: "Ruwais"
  },
  {
    Name: "Reliance Jamnagar Refinery",
    Country: "India",
    Region: "Asia Pacific",
    Latitude: 22.2873,
    Longitude: 69.0815,
    Capacity: 1240000,
    Status: "operational",
    Operator: "Reliance Industries",
    Owner: "Reliance Industries",
    Type: "integrated",
    Products: "gasoline, diesel, jet fuel, LPG, petrochemicals",
    YearBuilt: 1999,
    Complexity: 12.7,
    City: "Jamnagar"
  },
  {
    Name: "SK Energy Ulsan Refinery",
    Country: "South Korea",
    Region: "Asia Pacific",
    Latitude: 35.5125,
    Longitude: 129.3555,
    Capacity: 840000,
    Status: "operational",
    Operator: "SK Energy",
    Owner: "SK Innovation",
    Type: "integrated",
    Products: "gasoline, diesel, jet fuel, LPG, petrochemicals",
    YearBuilt: 1964,
    Complexity: 9.8,
    City: "Ulsan"
  },
  {
    Name: "Marathon Galveston Bay Refinery",
    Country: "United States",
    Region: "North America",
    Latitude: 29.3748,
    Longitude: -94.9252,
    Capacity: 585000,
    Status: "operational",
    Operator: "Marathon Petroleum",
    Owner: "Marathon Petroleum",
    Type: "integrated",
    Products: "gasoline, diesel, jet fuel, asphalt, petrochemicals",
    YearBuilt: 1934,
    Complexity: 15.3,
    City: "Texas City, Texas"
  },
  {
    Name: "Rosneft Tuapse Refinery",
    Country: "Russia",
    Region: "Eastern Europe",
    Latitude: 44.1058,
    Longitude: 39.0737,
    Capacity: 240000,
    Status: "operational",
    Operator: "Rosneft",
    Owner: "Rosneft",
    Type: "hydroskimming",
    Products: "gasoline, diesel, fuel oil",
    YearBuilt: 1929,
    Complexity: 5.2,
    City: "Tuapse"
  },
  {
    Name: "Pertamina Cilacap Refinery",
    Country: "Indonesia",
    Region: "Asia Pacific",
    Latitude: -7.7308,
    Longitude: 109.0194,
    Capacity: 348000,
    Status: "operational",
    Operator: "Pertamina",
    Owner: "Pertamina",
    Type: "integrated",
    Products: "gasoline, diesel, jet fuel, LPG, asphalt",
    YearBuilt: 1976,
    Complexity: 6.5,
    City: "Cilacap"
  },
  {
    Name: "ENAP Aconcagua Refinery",
    Country: "Chile",
    Region: "South America",
    Latitude: -32.9101,
    Longitude: -71.4961,
    Capacity: 104000,
    Status: "operational",
    Operator: "ENAP",
    Owner: "Empresa Nacional del Petróleo",
    Type: "cracking",
    Products: "gasoline, diesel, jet fuel, LPG",
    YearBuilt: 1955,
    Complexity: 7.2,
    City: "Concón"
  },
  {
    Name: "EGPC Cairo Refinery",
    Country: "Egypt",
    Region: "North Africa",
    Latitude: 30.1116,
    Longitude: 31.3067,
    Capacity: 142000,
    Status: "operational",
    Operator: "EGPC",
    Owner: "Egyptian General Petroleum Corporation",
    Type: "cracking",
    Products: "gasoline, diesel, jet fuel, asphalt",
    YearBuilt: 1969,
    Complexity: 5.9,
    City: "Cairo"
  }
];

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Add data to a worksheet
const worksheet = XLSX.utils.json_to_sheet(refineries);

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheet, "Refineries");

// Ensure directory exists
const assetsDir = path.dirname(excelFilePath);
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Write the workbook to a file
XLSX.writeFile(workbook, excelFilePath);

console.log(`Created test Excel file at: ${excelFilePath}`);
console.log(`Contains ${refineries.length} sample refineries`);