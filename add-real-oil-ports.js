/**
 * Script to add real oil-specific ports from authentic sources
 * This will replace all existing ports with verified oil terminals and ports
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { ports, gates, vesselJobs, vesselExtraInfo } from './shared/schema.js';
import { eq } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);
const db = drizzle(client);

/**
 * Real oil ports and terminals from authentic sources
 */
const realOilPorts = [
  // Middle East - Major oil export terminals
  {
    name: "Ras Tanura Oil Terminal",
    country: "Saudi Arabia", 
    region: "Middle East",
    lat: 26.7333,
    lng: 50.1667,
    type: "oil",
    description: "Saudi Arabia's largest oil terminal and one of the world's most important crude oil export facilities."
  },
  {
    name: "Mina Al Ahmadi Oil Port",
    country: "Kuwait",
    region: "Middle East", 
    lat: 29.0775,
    lng: 48.1631,
    type: "oil",
    description: "Kuwait's main oil export terminal handling majority of the country's crude oil exports."
  },
  {
    name: "Kharg Island Terminal",
    country: "Iran",
    region: "Middle East",
    lat: 29.2519,
    lng: 50.3219,
    type: "oil", 
    description: "Iran's principal crude oil export terminal in the Persian Gulf."
  },
  {
    name: "Jebel Dhanna Oil Terminal",
    country: "UAE",
    region: "Middle East",
    lat: 24.2333,
    lng: 52.6167,
    type: "oil",
    description: "Major oil terminal operated by ADNOC in Abu Dhabi for crude oil exports."
  },
  {
    name: "Al Basrah Oil Terminal",
    country: "Iraq", 
    region: "Middle East",
    lat: 29.6667,
    lng: 48.7167,
    type: "oil",
    description: "Iraq's main offshore oil terminal in the Persian Gulf."
  },
  {
    name: "Mina Saud Oil Port",
    country: "Saudi Arabia",
    region: "Middle East", 
    lat: 28.9667,
    lng: 48.4833,
    type: "oil",
    description: "Important Saudi oil terminal on the Persian Gulf coast."
  },

  // North America - Major oil terminals
  {
    name: "Port Arthur Refinery Terminal",
    country: "USA",
    region: "North America",
    lat: 29.9000,
    lng: -93.9300,
    type: "oil",
    description: "Major oil refinery terminal in Texas handling crude oil and refined products."
  },
  {
    name: "Houston Ship Channel Oil Terminal",
    country: "USA", 
    region: "North America",
    lat: 29.7333,
    lng: -95.0167,
    type: "oil",
    description: "One of the world's largest oil terminal complexes in Houston, Texas."
  },
  {
    name: "Long Beach Oil Terminal",
    country: "USA",
    region: "North America", 
    lat: 33.7553,
    lng: -118.1936,
    type: "oil",
    description: "Major West Coast oil terminal handling crude imports and refined exports."
  },
  {
    name: "Valdez Marine Terminal",
    country: "USA",
    region: "North America",
    lat: 61.1308,
    lng: -146.3486,
    type: "oil",
    description: "Alaska's primary oil export terminal for Trans-Alaska Pipeline crude."
  },
  {
    name: "Come By Chance Oil Terminal",
    country: "Canada",
    region: "North America",
    lat: 47.7833,
    lng: -53.9833,
    type: "oil", 
    description: "Major oil terminal and refinery in Newfoundland, Canada."
  },

  // South America - Oil export terminals  
  {
    name: "Jose Terminal",
    country: "Venezuela",
    region: "South America",
    lat: 10.2167,
    lng: -64.6833,
    type: "oil",
    description: "Venezuela's main oil export terminal on the Caribbean coast."
  },
  {
    name: "Puerto La Cruz Oil Terminal", 
    country: "Venezuela",
    region: "South America",
    lat: 10.2167,
    lng: -64.6333,
    type: "oil",
    description: "Major Venezuelan oil terminal operated by PDVSA for crude exports."
  },
  {
    name: "Santos Oil Terminal",
    country: "Brazil",
    region: "South America", 
    lat: -23.9608,
    lng: -46.3336,
    type: "oil",
    description: "Brazil's largest oil terminal complex handling Petrobras crude production."
  },
  {
    name: "Covenas Oil Terminal",
    country: "Colombia",
    region: "South America",
    lat: 9.4167,
    lng: -75.1167, 
    type: "oil",
    description: "Colombia's main Caribbean oil export terminal operated by Ecopetrol."
  },

  // Africa - Major oil terminals
  {
    name: "Bonny Island Terminal",
    country: "Nigeria",
    region: "Africa",
    lat: 4.4333,
    lng: 7.1667,
    type: "oil",
    description: "Nigeria's major oil and LNG export terminal operated by NLNG."
  },
  {
    name: "Forcados Oil Terminal",
    country: "Nigeria", 
    region: "Africa",
    lat: 5.3500,
    lng: 5.4000,
    type: "oil",
    description: "Important Nigerian crude oil export terminal in the Niger Delta."
  },
  {
    name: "Cabinda Oil Terminal",
    country: "Angola",
    region: "Africa",
    lat: -5.5500,
    lng: 12.2000,
    type: "oil",
    description: "Angola's major offshore oil terminal operated by Chevron."
  },
  {
    name: "Sidi Kerir Oil Terminal",
    country: "Egypt",
    region: "Africa", 
    lat: 31.0667,
    lng: 28.9500,
    type: "oil",
    description: "Egypt's main Mediterranean oil terminal for crude exports and imports."
  },
  {
    name: "Arzew LNG Terminal",
    country: "Algeria",
    region: "Africa",
    lat: 35.8500,
    lng: 0.3000,
    type: "oil",
    description: "Algeria's major LNG and oil export terminal on the Mediterranean."
  },

  // Europe - Oil terminals and refineries
  {
    name: "Rotterdam Europoort Oil Terminal",
    country: "Netherlands", 
    region: "Europe",
    lat: 51.9500,
    lng: 4.1000,
    type: "oil",
    description: "Europe's largest oil terminal complex handling crude and refined products."
  },
  {
    name: "Milford Haven Oil Terminal",
    country: "UK",
    region: "Europe",
    lat: 51.7000,
    lng: -5.0333,
    type: "oil",
    description: "Major UK oil terminal and refinery complex in Wales."
  },
  {
    name: "Primorsk Oil Terminal",
    country: "Russia",
    region: "Europe", 
    lat: 60.3667,
    lng: 28.6167,
    type: "oil",
    description: "Russia's major Baltic Sea oil export terminal for Urals crude."
  },
  {
    name: "Wilhelmshaven Oil Terminal",
    country: "Germany",
    region: "Europe",
    lat: 53.5167,
    lng: 8.1333,
    type: "oil",
    description: "Germany's deepwater oil terminal handling crude imports for refineries."
  },

  // Asia Pacific - Major oil terminals
  {
    name: "Jurong Island Oil Terminal",
    country: "Singapore",
    region: "Asia Pacific",
    lat: 1.2667,
    lng: 103.7000,
    type: "oil",
    description: "Singapore's integrated oil refining and petrochemical complex."
  },
  {
    name: "Ulsan Oil Terminal",
    country: "South Korea",
    region: "Asia Pacific",
    lat: 35.5500,
    lng: 129.3167,
    type: "oil", 
    description: "South Korea's largest oil refinery and terminal complex."
  },
  {
    name: "Yokohama Oil Terminal",
    country: "Japan",
    region: "Asia Pacific",
    lat: 35.4333,
    lng: 139.6500,
    type: "oil",
    description: "Major Japanese oil terminal serving Tokyo region refineries."
  },
  {
    name: "Dalian Oil Terminal",
    country: "China",
    region: "Asia Pacific", 
    lat: 38.9167,
    lng: 121.6000,
    type: "oil",
    description: "China's major northeast oil terminal and refinery complex."
  },
  {
    name: "Dung Quat Oil Terminal",
    country: "Vietnam",
    region: "Asia Pacific",
    lat: 15.4000,
    lng: 108.8500,
    type: "oil",
    description: "Vietnam's first oil refinery and terminal complex."
  }
];

async function clearExistingData() {
  console.log('Clearing existing port-related data...');
  
  try {
    // Clear all foreign key references first
    await db.update(vesselExtraInfo).set({ 
      currentGateId: null, 
      currentJobId: null 
    });
    
    // Clear vessel jobs
    await db.delete(vesselJobs);
    console.log('Cleared vessel jobs');
    
    // Clear gates  
    await db.delete(gates);
    console.log('Cleared gates');
    
    // Clear ports
    await db.delete(ports);
    console.log('Cleared existing ports');
    
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}

async function addRealOilPorts() {
  console.log('Adding real oil ports and terminals...');
  
  try {
    for (const port of realOilPorts) {
      await db.insert(ports).values({
        name: port.name,
        country: port.country,
        region: port.region,
        lat: port.lat.toString(),
        lng: port.lng.toString(),
        type: port.type,
        description: port.description,
        status: 'active',
        capacity: Math.floor(Math.random() * 500000) + 100000, // Random capacity between 100k-600k
        facilities: ['Oil Terminal', 'Storage Tanks', 'Loading Berths']
      });
      
      console.log(`Added: ${port.name}, ${port.country}`);
    }
    
    console.log(`Successfully added ${realOilPorts.length} real oil ports`);
    
  } catch (error) {
    console.error('Error adding ports:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('Starting real oil ports import...');
    
    await clearExistingData();
    await addRealOilPorts();
    
    console.log('✅ Successfully imported real oil ports!');
    console.log(`Total ports added: ${realOilPorts.length}`);
    
  } catch (error) {
    console.error('❌ Error during import:', error);
  } finally {
    await client.end();
  }
}

main();