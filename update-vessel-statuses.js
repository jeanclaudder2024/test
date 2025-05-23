/**
 * Script to update vessel statuses to ensure a more realistic distribution
 * Some vessels should be in port, some at sea, etc.
 */

import { OpenAI } from 'openai';
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Connect to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Possible vessel statuses with their descriptions
const vesselStatuses = {
  'At Sea': 'The vessel is currently sailing in open waters',
  'Underway': 'The vessel is moving, usually under its own propulsion',
  'In Port': 'The vessel is currently docked at a port',
  'Moored': 'The vessel is secured to a dock, pier, or other fixed object',
  'Anchored': 'The vessel is stationary, held in place by an anchor',
  'Loading': 'The vessel is currently loading cargo',
  'Unloading': 'The vessel is currently unloading cargo',
  'Delayed': 'The vessel is experiencing delays in its schedule',
  'Not Moving': 'The vessel is stationary but not necessarily anchored or moored',
  'Bunkering': 'The vessel is taking on fuel',
  'Undergoing Repairs': 'The vessel is currently being repaired',
  'Waiting for Berth': 'The vessel is waiting for a spot to dock',
  'In Drydock': 'The vessel is in a drydock for repairs or maintenance',
};

// Generate realistic vessel statuses using OpenAI
async function generateVesselStatuses(count, portCount) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a maritime data specialist. Generate realistic vessel statuses for an oil shipping fleet."
        },
        {
          role: "user",
          content: `Generate ${count} vessel statuses as a JSON array where each entry is an object with:
          1. status - one of these options: ${Object.keys(vesselStatuses).join(', ')}
          2. speed - realistic speed in knots (0-25) that makes sense for the status (0 for anchored/port, etc.)
          
          Make sure approximately 30% of vessels are in port/anchored/moored, 60% are at sea/underway, and 10% are delayed/not moving.
          Return ONLY the JSON array, no explanation or other text.`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    // Parse the response
    const contentText = response.choices[0].message.content.trim();
    // Extract just the JSON part in case there's any extra text
    const jsonMatch = contentText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }
    
    const statusData = JSON.parse(jsonMatch[0]);
    console.log(`Generated ${statusData.length} vessel statuses`);
    return statusData;
  } catch (error) {
    console.error('Error generating vessel statuses:', error);
    // Fallback method if OpenAI fails
    return generateFallbackStatuses(count, portCount);
  }
}

// Update vessels in the database with the generated statuses
async function updateVesselStatuses() {
  try {
    console.log('Fetching vessel count from database...');
    const vesselResult = await pool.query('SELECT COUNT(*) FROM vessels');
    const vesselCount = parseInt(vesselResult.rows[0].count);
    
    console.log('Fetching port count from database...');
    const portResult = await pool.query('SELECT COUNT(*) FROM ports');
    const portCount = parseInt(portResult.rows[0].count);
    
    console.log(`Found ${vesselCount} vessels and ${portCount} ports`);
    
    // Generate statuses for vessels
    console.log('Generating vessel statuses...');
    const statusData = await generateVesselStatuses(vesselCount, portCount);
    
    // Get all vessels from database
    console.log('Fetching all vessels from database...');
    const vesselsResult = await pool.query('SELECT id FROM vessels');
    const vessels = vesselsResult.rows;
    
    // Update vessels with new statuses
    console.log('Updating vessel statuses in database...');
    let inPortCount = 0;
    let atSeaCount = 0;
    let otherCount = 0;
    
    for (let i = 0; i < vessels.length; i++) {
      const vessel = vessels[i];
      const statusInfo = statusData[i % statusData.length]; // Use modulo to handle if we have fewer statuses than vessels
      
      // Set the vessel speed to 0 if it's in port/anchored/moored
      let speed = statusInfo.speed;
      
      // Count the vessels by status category
      if (['In Port', 'Moored', 'Anchored', 'Waiting for Berth', 'Bunkering', 'In Drydock', 'Loading', 'Unloading'].includes(statusInfo.status)) {
        inPortCount++;
      } else if (['At Sea', 'Underway'].includes(statusInfo.status)) {
        atSeaCount++;
      } else {
        otherCount++;
      }
      
      await pool.query(
        'UPDATE vessels SET status = $1, speed = $2 WHERE id = $3',
        [statusInfo.status, speed, vessel.id]
      );
      
      // Progress indicator
      if (i % 100 === 0) {
        console.log(`Updated ${i} vessels...`);
      }
    }
    
    console.log('Vessel status update complete');
    console.log(`Vessels in port: ${inPortCount} (${Math.round(inPortCount/vessels.length*100)}%)`);
    console.log(`Vessels at sea: ${atSeaCount} (${Math.round(atSeaCount/vessels.length*100)}%)`);
    console.log(`Vessels with other statuses: ${otherCount} (${Math.round(otherCount/vessels.length*100)}%)`);
    
  } catch (error) {
    console.error('Error updating vessel statuses:', error);
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

// Generate statuses without using OpenAI (fallback)
function generateFallbackStatuses(count, portCount) {
  const statuses = [];
  const statusOptions = Object.keys(vesselStatuses);
  
  // Ensure distribution: 30% in port, 60% at sea, 10% other
  for (let i = 0; i < count; i++) {
    let status;
    let speed;
    
    const rand = Math.random();
    if (rand < 0.3) {
      // In port statuses
      status = ['In Port', 'Moored', 'Anchored', 'Waiting for Berth', 'Bunkering', 'Loading', 'Unloading'][Math.floor(Math.random() * 7)];
      speed = 0;
    } else if (rand < 0.9) {
      // At sea
      status = ['At Sea', 'Underway'][Math.floor(Math.random() * 2)];
      speed = 5 + Math.floor(Math.random() * 15); // 5-20 knots
    } else {
      // Other
      status = ['Delayed', 'Not Moving', 'Undergoing Repairs'][Math.floor(Math.random() * 3)];
      speed = Math.floor(Math.random() * 3); // 0-2 knots
    }
    
    statuses.push({ status, speed });
  }
  
  return statuses;
}

// Run the update
updateVesselStatuses().catch(console.error);