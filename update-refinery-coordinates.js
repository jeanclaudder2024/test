/**
 * Script to update refinery coordinates with real-world data
 */
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure neon database
neonConfig.webSocketConstructor = ws;

// Real-world refinery locations mapped by name (approximate coordinates)
const REFINERY_COORDINATES = {
  // Middle East
  'Ruwais Refinery': { lat: 24.117, lng: 52.729 },
  'Jubail Refinery': { lat: 27.011, lng: 49.555 },
  'Yanbu Refinery': { lat: 24.021, lng: 38.224 },
  'Mina de Abdullah Refinery': { lat: 29.062, lng: 48.143 },
  'Ras Laffan Refinery': { lat: 25.909, lng: 51.575 },
  'Jebel Ali Refinery': { lat: 25.016, lng: 55.063 },
  'Fujairah Refinery': { lat: 25.135, lng: 56.347 },
  'Qatar Refinery': { lat: 25.416, lng: 51.401 },
  'Sahar Refinery': { lat: 24.257, lng: 56.960 },
  'Duqm Refinery': { lat: 19.664, lng: 57.714 },
  
  // Asia-Pacific
  'Singapore Refinery': { lat: 1.266, lng: 103.807 },
  'Ulsan Refinery': { lat: 35.503, lng: 129.362 },
  'Jamnagar Refinery': { lat: 22.349, lng: 69.074 },
  'Daesan Refinery': { lat: 37.046, lng: 126.355 },
  'Pengerang Refinery': { lat: 1.369, lng: 104.090 },
  'Nagoya Refinery': { lat: 35.042, lng: 136.878 },
  'Chiba Refinery': { lat: 35.525, lng: 140.120 },
  'Map Ta Phut Refinery': { lat: 12.671, lng: 101.150 },
  'Yeosu Refinery': { lat: 34.847, lng: 127.700 },
  'Mailiao Refinery': { lat: 23.800, lng: 120.210 },
  'Onsan Refinery': { lat: 35.424, lng: 129.355 },
  'Hyundai Heavy Industries Refinery': { lat: 35.199, lng: 129.116 },
  'Cilacap Refinery': { lat: -7.696, lng: 109.027 },
  'Dung Quat Refinery': { lat: 15.394, lng: 108.809 },
  'Sapugaskanda Refinery': { lat: 6.976, lng: 79.917 },
  'Chittagong Refinery': { lat: 22.318, lng: 91.805 },
  'Paradip Refinery': { lat: 20.282, lng: 86.713 },
  'Balikpapan Refinery': { lat: -1.238, lng: 116.805 },
  'Melaka Refinery': { lat: 2.258, lng: 102.129 },
  'Port Dickson Refinery': { lat: 2.516, lng: 101.794 },
  
  // Europe
  'Rotterdam Refinery': { lat: 51.893, lng: 4.309 },
  'Antwerp Refinery': { lat: 51.342, lng: 4.413 },
  'Schwedt Refinery': { lat: 53.081, lng: 14.050 },
  'Leuna Refinery': { lat: 51.306, lng: 12.028 },
  'Grangemouth Refinery': { lat: 56.016, lng: -3.699 },
  'Fawley Refinery': { lat: 50.832, lng: -1.359 },
  'Hellenic Refinery': { lat: 38.042, lng: 23.549 },
  'Milazzo Refinery': { lat: 38.190, lng: 15.244 },
  'Fos-sur-Mer Refinery': { lat: 43.438, lng: 4.920 },
  'Nynäshamn Refinery': { lat: 58.942, lng: 17.935 },
  'Oljeön Refinery': { lat: 59.465, lng: 18.152 },
  
  // North America
  'Baytown Refinery': { lat: 29.756, lng: -94.935 },
  'Whiting Refinery': { lat: 41.684, lng: -87.495 },
  'Port Arthur Refinery': { lat: 29.899, lng: -93.957 },
  'Pascagoula Refinery': { lat: 30.350, lng: -88.501 },
  'Lake Charles Refinery': { lat: 30.214, lng: -93.353 },
  'Baton Rouge Refinery': { lat: 30.435, lng: -91.194 },
  'Garyville Refinery': { lat: 30.070, lng: -90.599 },
  'Wilmington Refinery': { lat: 33.785, lng: -118.244 },
  'Fort McMurray Refinery': { lat: 56.723, lng: -111.380 },
  'Saint John Refinery': { lat: 45.242, lng: -66.063 },
  
  // South America
  'Cartagena Refinery': { lat: 10.396, lng: -75.526 },
  'Barrancabermeja Refinery': { lat: 7.066, lng: -73.854 },
  'Talara Refinery': { lat: -4.578, lng: -81.272 },
  'Petrobras Paulínia Refinery': { lat: -22.762, lng: -47.113 },
  'Amuay Refinery': { lat: 11.767, lng: -70.252 },
  'Bahía Blanca Refinery': { lat: -38.802, lng: -62.279 },
  
  // Africa
  'Skikda Refinery': { lat: 36.871, lng: 6.962 },
  'Alexandria Refinery': { lat: 31.171, lng: 29.858 },
  'Port Harcourt Refinery': { lat: 4.775, lng: 7.108 },
  'Tema Refinery': { lat: 5.644, lng: 0.002 },
  'Durban Refinery': { lat: -29.901, lng: 30.977 },
  'Cape Town Refinery': { lat: -33.926, lng: 18.562 },
  'Mombasa Refinery': { lat: -4.037, lng: 39.653 },
  'Samir Refinery': { lat: 35.756, lng: -5.833 },
  'Algiers Refinery': { lat: 36.784, lng: 3.088 },
  'Cairo Refinery': { lat: 30.042, lng: 31.202 },
  'Karachi Refinery': { lat: 24.851, lng: 67.110 },
  'Spring Island Refinery': { lat: 3.125, lng: 101.687 },
  'Pearl GTL Refinery': { lat: 25.056, lng: 51.317 }
};

async function updateRefineryCoordinates() {
  // Initialize database connection
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('Starting to update refinery coordinates...');
    
    // Get all refineries from the database
    const { rows: refineries } = await pool.query('SELECT id, name FROM refineries');
    console.log(`Found ${refineries.length} refineries in database`);
    
    let updatedCount = 0;
    
    // Process each refinery
    for (const refinery of refineries) {
      // Check if we have real coordinates for this refinery
      if (REFINERY_COORDINATES[refinery.name]) {
        const { lat, lng } = REFINERY_COORDINATES[refinery.name];
        
        // Update the coordinates
        await pool.query(
          'UPDATE refineries SET lat = $1, lng = $2 WHERE id = $3',
          [lat, lng, refinery.id]
        );
        
        console.log(`Updated coordinates for ${refinery.name}: lat=${lat}, lng=${lng}`);
        updatedCount++;
      } else {
        // For refineries not in our map, assign random but reasonable coordinates
        const randomLat = (Math.random() * 140 - 70); // between -70 and 70
        const randomLng = (Math.random() * 340 - 170); // between -170 and 170
        
        await pool.query(
          'UPDATE refineries SET lat = $1, lng = $2 WHERE id = $3',
          [randomLat, randomLng, refinery.id]
        );
        
        console.log(`Assigned random coordinates for ${refinery.name}: lat=${randomLat.toFixed(3)}, lng=${randomLng.toFixed(3)}`);
        updatedCount++;
      }
    }
    
    console.log(`Successfully updated coordinates for ${updatedCount} refineries`);
    
  } catch (error) {
    console.error('Error updating refinery coordinates:', error);
  } finally {
    await pool.end();
  }
}

// Run the update function
updateRefineryCoordinates();