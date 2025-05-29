/**
 * Create sample vessels with proper port connections
 * This will create vessels that connect to your existing ports
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSampleVessels() {
  try {
    console.log('Creating sample vessels with port connections...');
    
    // Sample vessels with departure and destination ports that match your existing ports
    const sampleVessels = [
      {
        name: 'Atlantic Pioneer',
        imo: '9123456',
        mmsi: '123456789',
        vesselType: 'Oil Tanker',
        flag: 'Panama',
        built: 2018,
        deadweight: 115000,
        cargoCapacity: 110000,
        currentLat: '33.7490',
        currentLng: '-118.2437',
        departurePort: 'Long Beach',
        destinationPort: 'Singapore',
        status: 'En Route',
        speed: '14.2',
        cargoType: 'Crude Oil'
      },
      {
        name: 'Gulf Trader',
        imo: '9234567',
        mmsi: '234567890',
        vesselType: 'Product Tanker',
        flag: 'Liberia',
        built: 2020,
        deadweight: 45000,
        cargoCapacity: 42000,
        currentLat: '26.0667',
        currentLng: '50.1500',
        departurePort: 'Ras Tanura',
        destinationPort: 'Houston',
        status: 'Loading',
        speed: '0.0',
        cargoType: 'Refined Products'
      },
      {
        name: 'Nordic Express',
        imo: '9345678',
        mmsi: '345678901',
        vesselType: 'Crude Tanker',
        flag: 'Norway',
        built: 2019,
        deadweight: 280000,
        cargoCapacity: 275000,
        currentLat: '29.7604',
        currentLng: '-95.3698',
        departurePort: 'Houston',
        destinationPort: 'Rotterdam',
        status: 'Discharging',
        speed: '0.0',
        cargoType: 'Crude Oil'
      },
      {
        name: 'Mediterranean Star',
        imo: '9456789',
        mmsi: '456789012',
        vesselType: 'Oil Tanker',
        flag: 'Malta',
        built: 2017,
        deadweight: 156000,
        cargoCapacity: 150000,
        currentLat: '51.9244',
        currentLng: '4.4777',
        departurePort: 'Rotterdam',
        destinationPort: 'Antwerp',
        status: 'En Route',
        speed: '12.8',
        cargoType: 'Heavy Fuel Oil'
      },
      {
        name: 'Asian Voyager',
        imo: '9567890',
        mmsi: '567890123',
        vesselType: 'Product Tanker',
        flag: 'Singapore',
        built: 2021,
        deadweight: 52000,
        cargoCapacity: 48000,
        currentLat: '1.3521',
        currentLng: '103.8198',
        departurePort: 'Singapore',
        destinationPort: 'Tokyo',
        status: 'En Route',
        speed: '15.1',
        cargoType: 'Diesel'
      },
      {
        name: 'Pacific Glory',
        imo: '9678901',
        mmsi: '678901234',
        vesselType: 'Crude Tanker',
        flag: 'Japan',
        built: 2016,
        deadweight: 320000,
        cargoCapacity: 310000,
        currentLat: '35.6762',
        currentLng: '139.6503',
        departurePort: 'Tokyo',
        destinationPort: 'Long Beach',
        status: 'En Route',
        speed: '13.5',
        cargoType: 'Crude Oil'
      },
      {
        name: 'Arabian Princess',
        imo: '9789012',
        mmsi: '789012345',
        vesselType: 'Oil Tanker',
        flag: 'UAE',
        built: 2022,
        deadweight: 95000,
        cargoCapacity: 90000,
        currentLat: '25.2048',
        currentLng: '55.2708',
        departurePort: 'Dubai',
        destinationPort: 'Ras Tanura',
        status: 'En Route',
        speed: '16.2',
        cargoType: 'Light Crude Oil'
      },
      {
        name: 'Baltic Breeze',
        imo: '9890123',
        mmsi: '890123456',
        vesselType: 'Product Tanker',
        flag: 'Denmark',
        built: 2019,
        deadweight: 37000,
        cargoCapacity: 35000,
        currentLat: '51.2194',
        currentLng: '4.4025',
        departurePort: 'Antwerp',
        destinationPort: 'Hamburg',
        status: 'En Route',
        speed: '11.8',
        cargoType: 'Gasoline'
      }
    ];

    // Insert vessels into database
    const { data, error } = await supabase
      .from('vessels')
      .insert(sampleVessels);

    if (error) {
      console.error('Error creating vessels:', error);
      return;
    }

    console.log(`Successfully created ${sampleVessels.length} sample vessels`);
    console.log('Vessels created with port connections:');
    sampleVessels.forEach(vessel => {
      console.log(`- ${vessel.name}: ${vessel.departurePort} → ${vessel.destinationPort}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createSampleVessels();