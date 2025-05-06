/**
 * Example script demonstrating how to connect vessels to ports
 * 
 * Usage:
 * 1. Using node: node connect-vessel-to-port-example.js
 * 2. In browser: Import the connectVesselToPort function and use it
 */

// API endpoint for connecting vessels to ports
const API_ENDPOINT = 'http://localhost:5000/api/port-vessels/connect';

/**
 * Connect a vessel to a port
 * 
 * @param {number} vesselId - The ID of the vessel to connect
 * @param {number} portId - The ID of the port to connect to 
 * @param {boolean} moveToPort - Whether to also move the vessel near the port (default: true)
 * @returns {Promise} - Promise that resolves with the connection result
 */
async function connectVesselToPort(vesselId, portId, moveToPort = true) {
  try {
    // Prepare the request data
    const requestData = {
      vesselId,
      portId,
      moveToPort
    };
    
    // Make the API request
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    // Parse and return the result
    return await response.json();
  } catch (error) {
    console.error('Error connecting vessel to port:', error);
    throw error;
  }
}

// Example: Connect a vessel to a port and move it nearby
async function example() {
  try {
    // Example vessel and port IDs
    const vesselId = 46484; // Aquitania Voyager
    const portId = 31;      // Port of Rotterdam
    
    console.log(`Connecting vessel ID ${vesselId} to port ID ${portId}...`);
    
    // Connect the vessel to the port
    const result = await connectVesselToPort(vesselId, portId, true);
    
    // Print the result
    console.log('Connection result:', result);
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
      console.log(`Vessel "${result.data.vessel.name}" is now connected to port "${result.data.port.name}"`);
      console.log(`Current distance: Approximately ${result.data.vessel.currentLat - result.data.port.lat} km`);
    } else {
      console.log(`❌ Failed to connect: ${result.error}`);
    }
  } catch (error) {
    console.error('Example error:', error);
  }
}

// Run the example if this script is executed directly
if (typeof window === 'undefined') {
  example();
}

// Export the function for browser use
if (typeof module !== 'undefined') {
  module.exports = {
    connectVesselToPort
  };
}