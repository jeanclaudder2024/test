import fetch from 'node-fetch';

// Function to add a progress event for a vessel
async function addProgressEvent(vesselId, event, dateStr, lat, lng, location) {
  try {
    const response = await fetch(`http://localhost:5000/api/vessels/${vesselId}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        date: new Date(dateStr),
        lat,
        lng,
        location
      })
    });
    
    const data = await response.json();
    console.log(`Added event for vessel ${vesselId}:`, data);
    return data;
  } catch (error) {
    console.error('Error adding progress event:', error);
    throw error;
  }
}

// Add a series of progress events for vessel 28981
async function addTestRouteEvents() {
  // First get a random vessel
  const vesselsResponse = await fetch('http://localhost:5000/api/vessels');
  const vessels = await vesselsResponse.json();
  
  // Choose a vessel that has location data
  const vessel = vessels.find(v => v.currentLat && v.currentLng);
  
  if (!vessel) {
    console.error('No suitable vessel found with location data');
    return;
  }
  
  console.log(`Using vessel: ${vessel.name} (ID: ${vessel.id})`);
  
  // Start from the vessel's current position
  const baseLat = parseFloat(vessel.currentLat);
  const baseLng = parseFloat(vessel.currentLng);
  
  // Create a series of points to form a route (relative to the vessel's current position)
  const routePoints = [
    { offsetLat: -0.5, offsetLng: -0.3, date: '2025-04-21T18:00:00Z', event: 'Departure from previous port' },
    { offsetLat: -0.3, offsetLng: -0.1, date: '2025-04-21T22:00:00Z', event: 'Position update' },
    { offsetLat: -0.1, offsetLng: 0.1, date: '2025-04-22T02:00:00Z', event: 'Position update' },
    { offsetLat: 0.05, offsetLng: 0.2, date: '2025-04-22T06:00:00Z', event: 'Position update' },
    { offsetLat: 0, offsetLng: 0, date: '2025-04-22T10:00:00Z', event: 'Current position' }
  ];

  // Add each event sequentially
  for (const point of routePoints) {
    const lat = (baseLat + point.offsetLat).toFixed(6);
    const lng = (baseLng + point.offsetLng).toFixed(6);
    const location = `${lat}° ${baseLat >= 0 ? 'N' : 'S'}, ${lng}° ${baseLng >= 0 ? 'E' : 'W'}`;
    
    await addProgressEvent(
      vessel.id,
      point.event,
      point.date,
      lat,
      lng,
      location
    );
    
    // Wait a bit between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('All progress events added successfully!');
  console.log(`Now track vessel ID ${vessel.id} on the map to see the route.`);
}

// Run the main function
addTestRouteEvents().catch(console.error);