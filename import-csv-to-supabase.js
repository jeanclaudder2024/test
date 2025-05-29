/**
 * Import CSV vessel data to Supabase database
 * This script converts your old database CSV format to the new Supabase structure
 */

import fs from 'fs';
import { parse } from 'csv-parse';
import { db } from './server/db.js';
import { vessels } from './shared/schema.js';

async function importVesselCSV() {
  try {
    console.log('🚢 Starting CSV import to Supabase...');
    
    // Read and parse CSV file
    const csvData = fs.readFileSync('./attached_assets/vessels.csv', 'utf8');
    
    return new Promise((resolve, reject) => {
      parse(csvData, {
        columns: true,
        skip_empty_lines: true
      }, async (err, records) => {
        if (err) {
          reject(err);
          return;
        }
        
        console.log(`📊 Found ${records.length} vessels in CSV`);
        
        let imported = 0;
        let errors = 0;
        
        for (const record of records.slice(0, 10)) { // Import first 10 for testing
          try {
            // Convert CSV structure to Supabase structure
            const vesselData = {
              name: record.name || 'Unknown Vessel',
              imo: record.imo || '',
              mmsi: record.mmsi || '',
              vesselType: record.vessel_type || 'Oil Tanker',
              flag: record.flag || '',
              built: record.built ? parseInt(record.built) : null,
              deadweight: record.deadweight ? parseInt(record.deadweight) : null,
              currentLat: record.current_lat || null,
              currentLng: record.current_lng || null,
              departurePort: record.departure_port || null,
              departureDate: record.departure_date ? new Date(record.departure_date) : null,
              departureLat: record.departure_lat || null,
              departureLng: record.departure_lng || null,
              destinationPort: record.destination_port || null,
              destinationLat: record.destination_lat || null,
              destinationLng: record.destination_lng || null,
              eta: record.eta ? new Date(record.eta) : null,
              cargoType: record.cargo_type || null,
              cargoCapacity: record.cargo_capacity ? parseInt(record.cargo_capacity) : null,
              currentRegion: record.current_region || null,
              status: 'underway',
              speed: '0',
              buyerName: record.buyer_name || 'NA',
              sellerName: record.seller_name || null,
              metadata: record.metadata || null
            };
            
            // Insert into Supabase
            await db.insert(vessels).values(vesselData);
            imported++;
            console.log(`✅ Imported vessel: ${vesselData.name}`);
            
          } catch (error) {
            errors++;
            console.error(`❌ Error importing vessel ${record.name}:`, error.message);
          }
        }
        
        console.log(`\n📈 Import completed:`);
        console.log(`   ✅ Successfully imported: ${imported} vessels`);
        console.log(`   ❌ Errors: ${errors} vessels`);
        
        resolve({ imported, errors });
      });
    });
    
  } catch (error) {
    console.error('❌ CSV import failed:', error);
    throw error;
  }
}

// Run the import
importVesselCSV()
  .then((result) => {
    console.log('🎉 CSV import process completed!', result);
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });