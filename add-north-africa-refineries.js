/**
 * Script to add North African refineries
 */
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure neon database
neonConfig.webSocketConstructor = ws;

// Initialize database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// North African refineries with accurate data
const northAfricanRefineries = [
  {
    name: "Skikda Refinery",
    country: "Algeria",
    region: "North Africa",
    lat: 36.8789,
    lng: 6.9428,
    capacity: 300000,
    description: "Skikda Refinery is one of Algeria's largest petroleum refineries located on the Mediterranean coast. It processes approximately 300,000 barrels per day and is operated by Sonatrach.",
    status: "active",
    type: "oil",
    operator: "Sonatrach"
  },
  {
    name: "Algiers Refinery",
    country: "Algeria", 
    region: "North Africa",
    lat: 36.7654,
    lng: 3.0892,
    capacity: 60000,
    description: "Algiers Refinery (also known as Sidi R'cine) is a refinery located near Algeria's capital. It has a processing capacity of around 60,000 barrels per day.",
    status: "active",
    type: "oil",
    operator: "Sonatrach"
  },
  {
    name: "Hassi Messaoud Refinery",
    country: "Algeria",
    region: "North Africa", 
    lat: 31.7004,
    lng: 6.0728,
    capacity: 30000,
    description: "Hassi Messaoud Refinery is located in Algeria's largest oil field. It processes approximately 30,000 barrels per day.",
    status: "active",
    type: "oil",
    operator: "Sonatrach"
  },
  {
    name: "Zawiya Refinery",
    country: "Libya",
    region: "North Africa",
    lat: 32.7817,
    lng: 12.7281,
    capacity: 120000,
    description: "Zawiya Refinery is one of Libya's major oil refineries, located west of Tripoli on the Mediterranean coast. It has a capacity of 120,000 barrels per day.",
    status: "active", 
    type: "oil",
    operator: "National Oil Corporation"
  },
  {
    name: "Ras Lanuf Refinery",
    country: "Libya",
    region: "North Africa",
    lat: 30.4982,
    lng: 18.5681,
    capacity: 220000,
    description: "Ras Lanuf Refinery is a major oil refinery in Libya's Oil Crescent region. It has a capacity of around 220,000 barrels per day.",
    status: "active",
    type: "oil",
    operator: "National Oil Corporation"
  },
  {
    name: "Tobruk Refinery",
    country: "Libya",
    region: "North Africa",
    lat: 32.0950,
    lng: 24.0104,
    capacity: 20000,
    description: "Tobruk Refinery is a smaller refinery in eastern Libya with a capacity of approximately 20,000 barrels per day.",
    status: "active",
    type: "oil",
    operator: "National Oil Corporation"
  },
  {
    name: "Suez Refinery",
    country: "Egypt",
    region: "North Africa",
    lat: 29.9669,
    lng: 32.5498,
    capacity: 146000, 
    description: "Suez Refinery is one of Egypt's most strategic refineries located near the Suez Canal. It has a capacity of 146,000 barrels per day.",
    status: "active",
    type: "oil",
    operator: "Egyptian General Petroleum Corporation"
  },
  {
    name: "Alexandria (El-Mex) Refinery",
    country: "Egypt",
    region: "North Africa",
    lat: 31.1256,
    lng: 29.8189,
    capacity: 115000,
    description: "Alexandria Refinery (El-Mex) is located in the El-Mex area of Alexandria. It has a capacity of 115,000 barrels per day.",
    status: "active",
    type: "oil",
    operator: "Alexandria Petroleum Company"
  },
  {
    name: "MIDOR Refinery",
    country: "Egypt",
    region: "North Africa",
    lat: 31.1234,
    lng: 29.7535,
    capacity: 100000,
    description: "Middle East Oil Refinery (MIDOR) is one of Egypt's most modern refineries. Located near Alexandria, it has a capacity of 100,000 barrels per day.",
    status: "active",
    type: "oil",
    operator: "Middle East Oil Refinery"
  },
  {
    name: "Mostorod Refinery",
    country: "Egypt",
    region: "North Africa",
    lat: 30.1574,
    lng: 31.3240,
    capacity: 142000,
    description: "Mostorod Refinery, also known as Cairo Oil Refinery, is located near Cairo. It has a capacity of approximately 142,000 barrels per day.",
    status: "active",
    type: "oil",
    operator: "Cairo Oil Refining Company"
  },
  {
    name: "Assiut Refinery",
    country: "Egypt",
    region: "North Africa",
    lat: 27.1809,
    lng: 31.1837,
    capacity: 90000,
    description: "Assiut Refinery is located in Upper Egypt and serves the southern regions of the country. It has a capacity of about 90,000 barrels per day.",
    status: "active",
    type: "oil", 
    operator: "Assiut Petroleum Refining Company"
  },
  {
    name: "Bizerte Refinery",
    country: "Tunisia",
    region: "North Africa",
    lat: 37.2812,
    lng: 9.8636,
    capacity: 34000,
    description: "Bizerte Refinery (STIR) is Tunisia's main refinery located in the northern port city of Bizerte. It has a capacity of approximately 34,000 barrels per day.",
    status: "active",
    type: "oil",
    operator: "Tunisian Company of Refining Industries"
  },
  {
    name: "Skhira Refinery",
    country: "Tunisia",
    region: "North Africa",
    lat: 34.3034,
    lng: 10.1082,
    capacity: 22000,
    description: "Skhira Refinery is located on Tunisia's eastern coast. It has a capacity of around 22,000 barrels per day.",
    status: "active",
    type: "oil",
    operator: "Tunisian Company of Refining Industries"
  },
  {
    name: "Mohammedia Refinery",
    country: "Morocco",
    region: "North Africa",
    lat: 33.6835,
    lng: -7.3969,
    capacity: 200000,
    description: "Mohammedia Refinery (SAMIR) is Morocco's largest refinery located near Casablanca. It has a capacity of approximately 200,000 barrels per day.",
    status: "active",
    type: "oil",
    operator: "SAMIR"
  },
  {
    name: "Sidi Kacem Refinery",
    country: "Morocco",
    region: "North Africa",
    lat: 34.2263,
    lng: -5.7182,
    capacity: 30000,
    description: "Sidi Kacem Refinery is a smaller refinery in northern Morocco with a capacity of about 30,000 barrels per day.",
    status: "active",
    type: "oil",
    operator: "SAMIR"
  }
];

// Insert North African refineries
async function addNorthAfricanRefineries() {
  try {
    // Check current counts
    const countQuery = "SELECT COUNT(*) FROM refineries WHERE region = 'North Africa'";
    const countResult = await pool.query(countQuery);
    const currentCount = parseInt(countResult.rows[0].count);
    
    console.log(`Current North African refineries in database: ${currentCount}`);
    
    // Insert each refinery if it doesn't already exist
    for (const refinery of northAfricanRefineries) {
      // Check if this refinery already exists
      const checkQuery = "SELECT id FROM refineries WHERE name = $1 AND country = $2";
      const existingResult = await pool.query(checkQuery, [refinery.name, refinery.country]);
      
      if (existingResult.rows.length === 0) {
        // Insert new refinery
        const insertQuery = `
          INSERT INTO refineries (
            name, country, region, lat, lng, capacity, status, 
            description, type, operator
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
          refinery.type,
          refinery.operator
        ];
        
        const result = await pool.query(insertQuery, values);
        console.log(`Inserted refinery: ${refinery.name} with ID ${result.rows[0].id}`);
      } else {
        console.log(`Refinery already exists: ${refinery.name}, updating...`);
        
        // Update existing refinery
        const updateQuery = `
          UPDATE refineries 
          SET region = $1, lat = $2, lng = $3, capacity = $4, status = $5, 
              description = $6, type = $7, operator = $8
          WHERE name = $9 AND country = $10
          RETURNING id
        `;
        
        const values = [
          refinery.region,
          refinery.lat,
          refinery.lng,
          refinery.capacity,
          refinery.status,
          refinery.description,
          refinery.type,
          refinery.operator,
          refinery.name,
          refinery.country
        ];
        
        const result = await pool.query(updateQuery, values);
        console.log(`Updated refinery: ${refinery.name} with ID ${result.rows[0].id}`);
      }
    }
    
    // Get final count
    const finalCountResult = await pool.query(countQuery);
    const finalCount = parseInt(finalCountResult.rows[0].count);
    
    console.log(`North African refineries import completed.`);
    console.log(`Current count: ${finalCount} refineries in North Africa region`);
  } catch (error) {
    console.error('Error importing North African refineries:', error);
  } finally {
    await pool.end();
  }
}

// Run import
addNorthAfricanRefineries();