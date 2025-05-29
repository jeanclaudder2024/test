/**
 * Import vessel data from CSV to Supabase with correct column mapping
 */

import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { db } from './server/db.js';
import { vessels } from './shared/schema.js';

async function importVesselsFromCSV() {
  try {
    console.log('🚢 Reading vessel CSV data...');
    
    // Read CSV file
    const csvContent = fs.readFileSync('./attached_assets/vessels.csv', 'utf8');
    
    // Parse CSV with headers
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    console.log(`📊 Found ${records.length} vessels in CSV`);
    
    // Process vessels in batches
    let imported = 0;
    let errors = 0;
    const batchSize = 50;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      for (const record of batch) {
        try {
          // Convert CSV structure to match your database exactly
          const vesselData = {
            name: record.name || 'Unknown Vessel',
            imo: record.imo || '',
            mmsi: record.mmsi || '',
            vesselType: record.vessel_type || 'Oil Tanker',
            flag: record.flag || '',
            built: record.built && record.built !== '' ? parseInt(record.built) : null,
            deadweight: record.deadweight && record.deadweight !== '' ? parseInt(record.deadweight) : null,
            currentLat: record.current_lat || null,
            currentLng: record.current_lng || null,
            departurePort: record.departure_port || null,
            departureDate: record.departure_date && record.departure_date !== '' ? new Date(record.departure_date) : null,
            departureLat: record.departure_lat || null,
            departureLng: record.departure_lng || null,
            destinationPort: record.destination_port || null,
            destinationLat: record.destination_lat || null,
            destinationLng: record.destination_lng || null,
            eta: record.eta && record.eta !== '' ? new Date(record.eta) : null,
            cargoType: record.cargo_type || null,
            cargoCapacity: record.cargo_capacity && record.cargo_capacity !== '' ? parseInt(record.cargo_capacity) : null,
            currentRegion: record.current_region || null,
            status: 'underway',
            speed: '0',
            buyerName: record.buyer_name || 'NA',
            sellerName: record.seller_name || null,
            metadata: record.metadata || null
          };
          
          // Insert vessel into database
          await db.insert(vessels).values(vesselData);
          imported++;
          
          if (imported % 100 === 0) {
            console.log(`✅ Imported ${imported} vessels...`);
          }
          
        } catch (error) {
          errors++;
          if (errors <= 5) { // Only show first 5 errors
            console.error(`❌ Error importing vessel ${record.name}:`, error.message);
          }
        }
      }
    }
    
    console.log(`\n🎉 Import completed!`);
    console.log(`   ✅ Successfully imported: ${imported} vessels`);
    console.log(`   ❌ Errors: ${errors} vessels`);
    
    return { imported, errors };
    
  } catch (error) {
    console.error('💥 CSV import failed:', error);
    throw error;
  }
}

// Run the import
importVesselsFromCSV()
  .then((result) => {
    console.log('🎉 Vessel import completed!', result);
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });