/**
 * Realistic Vessel Positioning Service
 * Distributes vessels across realistic maritime routes and shipping lanes
 */

import { db } from '../db.ts';
import { vessels } from '../../shared/schema.ts';
import { sql } from 'drizzle-orm';

// Major shipping routes and their coordinates
const MAJOR_SHIPPING_ROUTES = [
  // Strait of Hormuz (Persian Gulf - critical oil chokepoint)
  { name: 'Persian Gulf', coords: [[26.5, 56.0], [25.5, 57.2], [24.8, 58.1]] },
  
  // Suez Canal route
  { name: 'Suez Canal', coords: [[31.2, 32.3], [30.8, 32.5], [30.0, 32.8]] },
  
  // Strait of Malacca (Asia-Europe route)
  { name: 'Strait of Malacca', coords: [[1.4, 103.8], [2.5, 101.4], [3.8, 98.9]] },
  
  // North Atlantic routes
  { name: 'North Atlantic', coords: [[50.0, -40.0], [48.5, -30.0], [47.0, -20.0]] },
  
  // Cape of Good Hope route
  { name: 'Cape Route', coords: [[-34.4, 18.5], [-35.2, 20.1], [-36.0, 25.8]] },
  
  // US Gulf Coast oil routes
  { name: 'Gulf of Mexico', coords: [[29.0, -94.0], [28.5, -91.0], [27.8, -88.5]] },
  
  // North Sea oil routes
  { name: 'North Sea', coords: [[60.5, 2.0], [59.8, 1.2], [58.9, 0.8]] },
  
  // Caribbean oil routes
  { name: 'Caribbean', coords: [[12.1, -68.9], [11.0, -70.2], [10.5, -72.1]] },
  
  // Mediterranean routes
  { name: 'Mediterranean', coords: [[35.9, 14.4], [36.8, 3.1], [35.2, -5.6]] },
  
  // West Africa oil routes
  { name: 'West Africa', coords: [[4.5, 8.5], [0.4, 6.5], [-5.9, 12.3]] },
  
  // Asia Pacific routes
  { name: 'Asia Pacific', coords: [[22.3, 114.2], [1.3, 103.8], [-6.2, 106.8]] },
  
  // Bab el-Mandeb (Red Sea chokepoint)
  { name: 'Red Sea', coords: [[12.6, 43.3], [15.9, 41.8], [20.2, 38.5]] }
];

// Port areas where vessels might be anchored or loading
const MAJOR_OIL_PORTS = [
  { name: 'Houston', lat: 29.7604, lng: -95.3698, region: 'North America' },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, region: 'Asia Pacific' },
  { name: 'Rotterdam', lat: 51.9244, lng: 4.4777, region: 'Western Europe' },
  { name: 'Fujairah', lat: 25.1164, lng: 56.3269, region: 'Middle East' },
  { name: 'Jeddah', lat: 21.4858, lng: 39.1925, region: 'Middle East' },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, region: 'Asia Pacific' },
  { name: 'Lagos', lat: 6.5244, lng: 3.3792, region: 'North Africa' },
  { name: 'Algeciras', lat: 36.1408, lng: -5.4526, region: 'Western Europe' },
  { name: 'Port Said', lat: 31.2653, lng: 32.3019, region: 'North Africa' },
  { name: 'Ras Tanura', lat: 26.7069, lng: 50.1661, region: 'Middle East' }
];

/**
 * Generate a realistic coordinate along a shipping route
 */
function generateRouteCoordinate(route: typeof MAJOR_SHIPPING_ROUTES[0]): [number, number] {
  // Pick a random segment of the route
  const segmentIndex = Math.floor(Math.random() * (route.coords.length - 1));
  const start = route.coords[segmentIndex];
  const end = route.coords[segmentIndex + 1];
  
  // Generate a point along this segment with some random variation
  const t = Math.random(); // Position along the segment (0-1)
  const variation = 0.5; // Degrees of variation from the exact route
  
  const lat = start[0] + t * (end[0] - start[0]) + (Math.random() - 0.5) * variation;
  const lng = start[1] + t * (end[1] - start[1]) + (Math.random() - 0.5) * variation;
  
  return [lat, lng];
}

/**
 * Generate a coordinate near a major oil port
 */
function generatePortAreaCoordinate(port: typeof MAJOR_OIL_PORTS[0]): [number, number] {
  // Generate coordinates within 20km of the port
  const radius = 0.18; // Approximately 20km in degrees
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radius;
  
  const lat = port.lat + distance * Math.cos(angle);
  const lng = port.lng + distance * Math.sin(angle);
  
  return [lat, lng];
}

/**
 * Generate realistic vessel status based on location type
 */
function generateRealisticStatus(locationType: 'route' | 'port'): { status: string; speed: number } {
  if (locationType === 'port') {
    const statuses = [
      { status: 'At Anchor', speed: 0 },
      { status: 'Moored', speed: 0 },
      { status: 'Loading', speed: 0 },
      { status: 'Discharging', speed: 0 },
      { status: 'At Berth', speed: 0 }
    ];
    return statuses[Math.floor(Math.random() * statuses.length)];
  } else {
    const statuses = [
      { status: 'Underway', speed: 8 + Math.random() * 8 }, // 8-16 knots
      { status: 'En Route', speed: 10 + Math.random() * 6 }, // 10-16 knots
      { status: 'At Sea', speed: 9 + Math.random() * 7 }  // 9-16 knots
    ];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }
}

/**
 * Redistribute vessels across realistic maritime locations
 */
export async function redistributeVesselsRealistically() {
  try {
    console.log('Starting realistic vessel redistribution...');
    
    // Get all oil vessels that need repositioning
    const allVessels = await db.query.vessels.findMany({
      where: sql`${vessels.currentLat} IS NOT NULL AND ${vessels.currentLng} IS NOT NULL`,
      limit: 1000
    });
    
    console.log(`Found ${allVessels.length} vessels to redistribute`);
    
    let updatedCount = 0;
    
    for (const vessel of allVessels) {
      try {
        // Decide whether to place vessel on a shipping route (70%) or near a port (30%)
        const locationType = Math.random() < 0.7 ? 'route' : 'port';
        
        let newLat: number, newLng: number;
        
        if (locationType === 'route') {
          // Place on a shipping route
          const route = MAJOR_SHIPPING_ROUTES[Math.floor(Math.random() * MAJOR_SHIPPING_ROUTES.length)];
          [newLat, newLng] = generateRouteCoordinate(route);
        } else {
          // Place near a port
          const port = MAJOR_OIL_PORTS[Math.floor(Math.random() * MAJOR_OIL_PORTS.length)];
          [newLat, newLng] = generatePortAreaCoordinate(port);
        }
        
        // Generate realistic status and speed
        const { status, speed } = generateRealisticStatus(locationType);
        
        // Generate realistic course (0-359 degrees)
        const course = Math.floor(Math.random() * 360);
        
        // Update vessel in database
        await db.update(vessels)
          .set({
            currentLat: newLat.toFixed(6),
            currentLng: newLng.toFixed(6),
            status: status,
            speed: speed.toFixed(1),
            course: course.toString()
          })
          .where(sql`${vessels.id} = ${vessel.id}`);
        
        updatedCount++;
        
        // Log progress every 100 vessels
        if (updatedCount % 100 === 0) {
          console.log(`Updated ${updatedCount}/${allVessels.length} vessels`);
        }
        
      } catch (error) {
        console.error(`Error updating vessel ${vessel.id}:`, error);
      }
    }
    
    console.log(`Successfully redistributed ${updatedCount} vessels across realistic maritime locations`);
    
    return {
      success: true,
      vesselsUpdated: updatedCount,
      totalVessels: allVessels.length
    };
    
  } catch (error) {
    console.error('Error redistributing vessels:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get distribution statistics
 */
export async function getVesselDistributionStats() {
  try {
    const stats = await db.query.vessels.findMany({
      columns: {
        status: true,
        currentLat: true,
        currentLng: true,
        speed: true
      }
    });
    
    const statusCounts = stats.reduce((acc, vessel) => {
      const status = vessel.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalVessels: stats.length,
      statusDistribution: statusCounts,
      averageSpeed: stats
        .filter(v => v.speed && parseFloat(v.speed) > 0)
        .reduce((sum, v) => sum + parseFloat(v.speed || '0'), 0) / 
        stats.filter(v => v.speed && parseFloat(v.speed) > 0).length
    };
    
  } catch (error) {
    console.error('Error getting distribution stats:', error);
    return null;
  }
}