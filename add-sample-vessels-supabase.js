/**
 * Add sample vessels directly to Supabase using the correct schema
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSampleVessels() {
  try {
    console.log('Adding sample vessels to demonstrate port connections...');
    
    // First, let's check what columns exist in the vessels table
    const { data: existingVessels, error: checkError } = await supabase
      .from('vessels')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking vessels table:', checkError);
      return;
    }
    
    // Create sample vessels with proper port connections
    const sampleVessels = [
      {
        name: 'Atlantic Pioneer',
        imo: '9123456',
        mmsi: '123456789',
        vessel_type: 'Oil Tanker',
        flag: 'Panama',
        built: 2018,
        deadweight: 115000,
        current_lat: '33.7490',
        current_lng: '-118.2437',
        departure_port: 'Long Beach',
        destination_port: 'Singapore',
        status: 'En Route',
        speed: '14.2',
        cargo_type: 'Crude Oil'
      },
      {
        name: 'Gulf Trader',
        imo: '9234567',
        mmsi: '234567890',
        vessel_type: 'Product Tanker',
        flag: 'Liberia',
        built: 2020,
        deadweight: 45000,
        current_lat: '26.0667',
        current_lng: '50.1500',
        departure_port: 'Ras Tanura',
        destination_port: 'Houston',
        status: 'Loading',
        speed: '0.0',
        cargo_type: 'Refined Products'
      },
      {
        name: 'Nordic Express',
        imo: '9345678',
        mmsi: '345678901',
        vessel_type: 'Crude Tanker',
        flag: 'Norway',
        built: 2019,
        deadweight: 280000,
        current_lat: '29.7604',
        current_lng: '-95.3698',
        departure_port: 'Houston',
        destination_port: 'Rotterdam',
        status: 'Discharging',
        speed: '0.0',
        cargo_type: 'Crude Oil'
      },
      {
        name: 'Mediterranean Star',
        imo: '9456789',
        mmsi: '456789012',
        vessel_type: 'Oil Tanker',
        flag: 'Malta',
        built: 2017,
        deadweight: 156000,
        current_lat: '51.9244',
        current_lng: '4.4777',
        departure_port: 'Rotterdam',
        destination_port: 'Antwerp',
        status: 'En Route',
        speed: '12.8',
        cargo_type: 'Heavy Fuel Oil'
      },
      {
        name: 'Asian Voyager',
        imo: '9567890',
        mmsi: '567890123',
        vessel_type: 'Product Tanker',
        flag: 'Singapore',
        built: 2021,
        deadweight: 52000,
        current_lat: '1.3521',
        current_lng: '103.8198',
        departure_port: 'Singapore',
        destination_port: 'Tokyo',
        status: 'En Route',
        speed: '15.1',
        cargo_type: 'Diesel'
      }
    ];

    console.log('Inserting vessels into database...');
    
    const { data, error } = await supabase
      .from('vessels')
      .insert(sampleVessels)
      .select();

    if (error) {
      console.error('Error inserting vessels:', error);
      return;
    }

    console.log(`Successfully created ${sampleVessels.length} sample vessels`);
    console.log('Vessel connections created:');
    sampleVessels.forEach(vessel => {
      console.log(`- ${vessel.name}: ${vessel.departure_port} → ${vessel.destination_port}`);
    });
    
    console.log('\nYou can now refresh the Ports page to see vessel connections!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

addSampleVessels();