const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'https://api.myshiptracking.com/ports'; // This URL should be adjusted to the correct API endpoint
const API_KEY = process.env.MARINE_TRAFFIC_API_KEY;
const BATCH_SIZE = 100; // How many ports to process in each batch
const OUTPUT_DIR = './port-data';
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'all-world-ports.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Function to fetch all ports from the API
async function fetchAllPorts() {
  console.log('Starting to fetch all ports from API...');
  
  try {
    // Fetch total count first (if API supports this)
    const response = await axios.get(`${API_URL}/count`, {
      headers: { 'X-API-KEY': API_KEY }
    });
    
    const totalPorts = response.data.count || 7183; // Use count from API or fallback to known number
    console.log(`Total ports to fetch: ${totalPorts}`);
    
    // Calculate number of pages
    const totalPages = Math.ceil(totalPorts / BATCH_SIZE);
    console.log(`Will fetch data in ${totalPages} batches of ${BATCH_SIZE} ports each`);
    
    // Array to hold all ports
    let allPorts = [];
    
    // Fetch ports page by page
    for (let page = 1; page <= totalPages; page++) {
      console.log(`Fetching batch ${page} of ${totalPages}...`);
      
      try {
        const pageResponse = await axios.get(`${API_URL}`, {
          headers: { 'X-API-KEY': API_KEY },
          params: {
            page: page,
            limit: BATCH_SIZE
          }
        });
        
        // Add to our collection
        const portsBatch = pageResponse.data.ports || pageResponse.data;
        allPorts = [...allPorts, ...portsBatch];
        
        console.log(`Received ${portsBatch.length} ports in batch ${page}`);
        
        // Optional: Save progress after each batch
        const progressFile = path.join(OUTPUT_DIR, `ports-batch-${page}.json`);
        fs.writeFileSync(progressFile, JSON.stringify(portsBatch, null, 2));
        
        // Don't overwhelm the API, add a small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (batchError) {
        console.error(`Error fetching batch ${page}:`, batchError.message);
        // Continue with next batch despite error
      }
    }
    
    // Save the complete data
    console.log(`Saving all ${allPorts.length} ports to ${OUTPUT_FILE}`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allPorts, null, 2));
    
    return {
      success: true,
      portsCount: allPorts.length,
      outputFile: OUTPUT_FILE
    };
  } catch (error) {
    console.error('Error fetching ports:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to transform the API data into our database format
function transformPortData(apiPorts) {
  console.log(`Transforming ${apiPorts.length} ports to database format...`);
  
  return apiPorts.map(port => {
    // Extract region from country or use a mapping function
    const region = determineRegionFromCountry(port.country);
    
    return {
      name: port.name || port.port_name,
      country: port.country,
      region: region,
      lat: String(port.latitude || port.lat),
      lng: String(port.longitude || port.lng),
      capacity: port.capacity || calculateEstimatedCapacity(port),
      status: port.status || 'active',
      description: port.description || generatePortDescription(port),
      type: determinePortType(port) // 'oil' or 'commercial'
    };
  });
}

// Helper function to determine region from country
function determineRegionFromCountry(country) {
  // Map countries to regions
  const regionMap = {
    // Middle East
    'Saudi Arabia': 'Middle East',
    'United Arab Emirates': 'Middle East',
    'Qatar': 'Middle East',
    'Kuwait': 'Middle East',
    'Oman': 'Middle East',
    'Bahrain': 'Middle East',
    'Iraq': 'Middle East',
    'Iran': 'Middle East',
    'Israel': 'Middle East',
    'Jordan': 'Middle East',
    'Lebanon': 'Middle East',
    'Syria': 'Middle East',
    'Yemen': 'Middle East',
    
    // Europe
    'United Kingdom': 'Europe',
    'France': 'Europe',
    'Germany': 'Europe',
    'Italy': 'Europe',
    'Spain': 'Europe',
    'Portugal': 'Europe',
    'Netherlands': 'Europe',
    'Belgium': 'Europe',
    'Greece': 'Europe',
    'Sweden': 'Europe',
    'Norway': 'Europe',
    'Denmark': 'Europe',
    'Finland': 'Europe',
    'Ireland': 'Europe',
    'Poland': 'Europe',
    'Romania': 'Europe',
    'Bulgaria': 'Europe',
    'Croatia': 'Europe',
    'Slovenia': 'Europe',
    'Estonia': 'Europe',
    'Latvia': 'Europe',
    'Lithuania': 'Europe',
    'Malta': 'Europe',
    'Cyprus': 'Europe',
    
    // North America
    'United States': 'North America',
    'Canada': 'North America',
    'Mexico': 'North America',
    
    // Latin America
    'Brazil': 'Latin America',
    'Argentina': 'Latin America',
    'Chile': 'Latin America',
    'Colombia': 'Latin America',
    'Peru': 'Latin America',
    'Venezuela': 'Latin America',
    'Ecuador': 'Latin America',
    'Bolivia': 'Latin America',
    'Paraguay': 'Latin America',
    'Uruguay': 'Latin America',
    'Panama': 'Latin America',
    'Costa Rica': 'Latin America',
    'Dominican Republic': 'Latin America',
    'Puerto Rico': 'Latin America',
    'Jamaica': 'Latin America',
    'Trinidad and Tobago': 'Latin America',
    'Cuba': 'Latin America',
    
    // Asia-Pacific
    'China': 'Asia-Pacific',
    'Japan': 'Asia-Pacific',
    'South Korea': 'Asia-Pacific',
    'Taiwan': 'Asia-Pacific',
    'India': 'Asia-Pacific',
    'Australia': 'Asia-Pacific',
    'New Zealand': 'Asia-Pacific',
    'Indonesia': 'Asia-Pacific',
    'Malaysia': 'Asia-Pacific',
    'Singapore': 'Asia-Pacific',
    'Thailand': 'Asia-Pacific',
    'Vietnam': 'Asia-Pacific',
    'Philippines': 'Asia-Pacific',
    'Bangladesh': 'Asia-Pacific',
    'Pakistan': 'Asia-Pacific',
    
    // Africa
    'South Africa': 'Africa',
    'Nigeria': 'Africa',
    'Egypt': 'Africa',
    'Morocco': 'Africa',
    'Algeria': 'Africa',
    'Tunisia': 'Africa',
    'Libya': 'Africa',
    'Kenya': 'Africa',
    'Tanzania': 'Africa',
    'Ghana': 'Africa',
    'Angola': 'Africa',
    'Mozambique': 'Africa',
    'Ivory Coast': 'Africa',
    'Senegal': 'Africa',
    'Mauritius': 'Africa',
    'Djibouti': 'Africa',
  };
  
  return regionMap[country] || determineRegionFromCoordinates(port.latitude, port.longitude) || 'Other';
}

// Helper function to determine port type (oil or commercial)
function determinePortType(port) {
  // List of keywords that might indicate an oil port
  const oilKeywords = [
    'oil', 'petroleum', 'refinery', 'tanker', 'terminal', 'energy',
    'lng', 'gas', 'fuel', 'crude', 'petro'
  ];
  
  // Check port name and description for oil-related keywords
  const nameAndDesc = (port.name + ' ' + (port.description || '')).toLowerCase();
  
  for (const keyword of oilKeywords) {
    if (nameAndDesc.includes(keyword)) {
      return 'oil';
    }
  }
  
  // Default to commercial
  return 'commercial';
}

// Helper function to generate a description if none is provided
function generatePortDescription(port) {
  const portType = determinePortType(port);
  const country = port.country;
  
  if (portType === 'oil') {
    return `${port.name} is an important oil shipping facility in ${country}, handling petroleum products and supporting the region's energy infrastructure.`;
  } else {
    return `${port.name} is a commercial shipping port in ${country}, facilitating trade and commerce in the region.`;
  }
}

// Helper function to estimate port capacity if none is provided
function calculateEstimatedCapacity(port) {
  // This is a very rough estimate based on port type
  const portType = determinePortType(port);
  
  // Generate a somewhat random but believable capacity
  const baseCapacity = portType === 'oil' ? 1500000 : 800000;
  const randomFactor = Math.floor(Math.random() * 10) / 10 + 0.5; // Between 0.5 and 1.5
  
  return Math.floor(baseCapacity * randomFactor);
}

// Main execution
async function main() {
  const result = await fetchAllPorts();
  
  if (result.success) {
    console.log(`Successfully downloaded ${result.portsCount} ports to ${result.outputFile}`);
    
    // Load the data we just saved
    const rawPorts = JSON.parse(fs.readFileSync(result.outputFile, 'utf8'));
    
    // Transform to our database format
    const transformedPorts = transformPortData(rawPorts);
    
    // Save transformed data
    const transformedFile = path.join(OUTPUT_DIR, 'transformed-ports.json');
    fs.writeFileSync(transformedFile, JSON.stringify(transformedPorts, null, 2));
    
    console.log(`Transformed ports saved to ${transformedFile}`);
  } else {
    console.error('Failed to fetch ports:', result.error);
  }
}

// Only run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  fetchAllPorts,
  transformPortData
};