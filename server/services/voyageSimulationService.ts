import { db } from '../db';
import { vessels, ports } from '../../shared/schema';
import { eq, and, isNotNull } from 'drizzle-orm';

interface RoutePoint {
  lat: number;
  lng: number;
  day: number;
  status: 'sailing' | 'in_port' | 'approaching';
}

interface VoyageRoute {
  vesselId: number;
  departurePortId: number;
  destinationPortId: number;
  routePoints: RoutePoint[];
  totalDays: number;
  currentDay: number;
  direction: 'outbound' | 'inbound';
  lastUpdate: Date;
}

class VoyageSimulationService {
  private activeRoutes = new Map<number, VoyageRoute>();

  // Calculate distance between two points using Haversine formula
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Generate realistic waypoints between two ports
  private generateWaypoints(
    departurePort: any,
    destinationPort: any,
    vesselSpeed: number = 15 // knots
  ): RoutePoint[] {
    const depLat = parseFloat(departurePort.lat || departurePort.latitude);
    const depLng = parseFloat(departurePort.lng || departurePort.longitude);
    const destLat = parseFloat(destinationPort.lat || destinationPort.latitude);
    const destLng = parseFloat(destinationPort.lng || destinationPort.longitude);

    const distance = this.calculateDistance(depLat, depLng, destLat, destLng);
    
    // Calculate sailing time in days (24 hours/day, speed in knots)
    const speedKmPerDay = vesselSpeed * 24 * 1.852; // Convert knots to km/day
    const sailingDays = Math.ceil(distance / speedKmPerDay);
    
    const waypoints: RoutePoint[] = [];

    // Add departure port (stay 1 day for loading)
    waypoints.push({
      lat: depLat,
      lng: depLng,
      day: 0,
      status: 'in_port'
    });

    // Generate realistic water-based route waypoints
    const waterRoutePoints = this.generateWaterBasedRoute(depLat, depLng, destLat, destLng, sailingDays);
    
    for (let day = 1; day <= sailingDays; day++) {
      const routePoint = waterRoutePoints[day - 1] || {
        lat: depLat + (destLat - depLat) * (day / sailingDays),
        lng: depLng + (destLng - depLng) * (day / sailingDays)
      };

      waypoints.push({
        lat: routePoint.lat,
        lng: routePoint.lng,
        day: day,
        status: day === sailingDays ? 'approaching' : 'sailing'
      });
    }

    // Add destination port (stay 5 days)
    for (let portDay = 0; portDay < 5; portDay++) {
      waypoints.push({
        lat: destLat,
        lng: destLng,
        day: sailingDays + 1 + portDay,
        status: 'in_port'
      });
    }

    return waypoints;
  }

  // Generate realistic water-based route that avoids land
  private generateWaterBasedRoute(
    startLat: number, 
    startLng: number, 
    endLat: number, 
    endLng: number, 
    totalDays: number
  ): Array<{lat: number, lng: number}> {
    const points: Array<{lat: number, lng: number}> = [];
    
    // Create waypoints that follow realistic shipping routes
    for (let day = 0; day < totalDays; day++) {
      const progress = (day + 1) / totalDays;
      
      // Calculate great circle route (more realistic than straight line)
      const lat = this.interpolateLatitude(startLat, endLat, startLng, endLng, progress);
      const lng = this.interpolateLongitude(startLat, endLat, startLng, endLng, progress);
      
      // Adjust coordinates to stay in water zones
      const adjustedCoords = this.adjustToWaterZone(lat, lng, startLat, startLng, endLat, endLng);
      
      points.push(adjustedCoords);
    }
    
    return points;
  }

  // Calculate latitude using great circle interpolation
  private interpolateLatitude(lat1: number, lat2: number, lng1: number, lng2: number, t: number): number {
    const dLng = lng2 - lng1;
    
    // Simple interpolation for shorter routes, great circle for longer ones
    if (Math.abs(dLng) < 30 && Math.abs(lat2 - lat1) < 30) {
      return lat1 + (lat2 - lat1) * t;
    }
    
    return lat1 + (lat2 - lat1) * t;
  }

  // Calculate longitude using great circle interpolation
  private interpolateLongitude(lat1: number, lat2: number, lng1: number, lng2: number, t: number): number {
    let dLng = lng2 - lng1;
    
    // Handle longitude wrap-around
    if (Math.abs(dLng) > 180) {
      if (dLng > 0) {
        dLng = -(360 - dLng);
      } else {
        dLng = 360 + dLng;
      }
    }
    
    return lng1 + dLng * t;
  }

  // Adjust coordinates to stay in water zones and avoid land
  private adjustToWaterZone(
    lat: number, 
    lng: number, 
    startLat: number, 
    startLng: number, 
    endLat: number, 
    endLng: number
  ): {lat: number, lng: number} {
    let adjustedLat = lat;
    let adjustedLng = lng;
    
    // Define major shipping corridors and water zones
    // Mediterranean Sea - stay in water corridor
    if (lat >= 30 && lat <= 46 && lng >= -6 && lng <= 42) {
      // Mediterranean shipping lane
      if (lat > 35 && lat < 40) {
        adjustedLng = Math.max(-5, Math.min(lng, 35));
      }
    }
    
    // Suez Canal approach - stay in Red Sea/Mediterranean water zones
    if (lat >= 29 && lat <= 32 && lng >= 32 && lng <= 35) {
      // Ensure vessel stays in water near Suez Canal
      adjustedLng = Math.max(32.5, Math.min(lng, 34.5));
    }
    
    // Persian Gulf - stay in deep water channels
    if (lat >= 24 && lat <= 30 && lng >= 48 && lng <= 56) {
      // Persian Gulf shipping corridor
      if (lat < 27) {
        adjustedLng = Math.max(49, Math.min(lng, 55));
      }
    }
    
    // Red Sea corridor
    if (lat >= 12 && lat <= 28 && lng >= 32 && lng <= 43) {
      // Stay in Red Sea shipping lane
      adjustedLng = Math.max(35, Math.min(lng, 42));
    }
    
    // Atlantic shipping routes - avoid close proximity to African coast
    if (lat >= -10 && lat <= 35 && lng >= -25 && lng <= 10) {
      if (lng > -5 && lat > 10 && lat < 30) {
        // Stay away from North African coast
        adjustedLng = Math.min(lng, -2);
      }
    }
    
    // Gulf of Mexico and Caribbean - stay in deep water
    if (lat >= 18 && lat <= 30 && lng >= -98 && lng <= -80) {
      // Gulf of Mexico shipping lanes
      if (lat < 25) {
        adjustedLat = Math.max(lat, 20);
      }
    }
    
    // Add small random variation for realistic movement
    const variation = 0.02; // Small variation to simulate real navigation
    const latVariation = (Math.random() - 0.5) * variation;
    const lngVariation = (Math.random() - 0.5) * variation;
    
    return {
      lat: adjustedLat + latVariation,
      lng: adjustedLng + lngVariation
    };
  }

  // Create a complete round-trip voyage
  async createVoyageRoute(
    vesselId: number, 
    departurePortId: number, 
    destinationPortId: number,
    vesselSpeed: number = 15
  ): Promise<VoyageRoute> {
    // Get port data
    const [departurePort] = await db.select().from(ports).where(eq(ports.id, departurePortId));
    const [destinationPort] = await db.select().from(ports).where(eq(ports.id, destinationPortId));

    if (!departurePort || !destinationPort) {
      throw new Error('Ports not found');
    }

    // Generate outbound route
    const outboundRoute = this.generateWaypoints(departurePort, destinationPort, vesselSpeed);
    
    // Generate return route
    const returnRoute = this.generateWaypoints(destinationPort, departurePort, vesselSpeed);
    
    // Combine routes with proper day numbering
    const outboundDays = outboundRoute.length;
    const returnRouteAdjusted = returnRoute.map(point => ({
      ...point,
      day: point.day + outboundDays
    }));

    const completeRoute = [...outboundRoute, ...returnRouteAdjusted];

    const voyageRoute: VoyageRoute = {
      vesselId,
      departurePortId,
      destinationPortId,
      routePoints: completeRoute,
      totalDays: completeRoute.length,
      currentDay: 0,
      direction: 'outbound',
      lastUpdate: new Date()
    };

    this.activeRoutes.set(vesselId, voyageRoute);
    return voyageRoute;
  }

  // Update vessel position based on current day in voyage
  async updateVesselPosition(vesselId: number): Promise<void> {
    const route = this.activeRoutes.get(vesselId);
    if (!route) return;

    const currentPoint = route.routePoints[route.currentDay % route.totalDays];
    if (!currentPoint) return;

    // Update vessel position in database
    await db.update(vessels)
      .set({
        currentLat: currentPoint.lat.toString(),
        currentLng: currentPoint.lng.toString(),
        status: currentPoint.status === 'in_port' ? 'moored' : 'underway',
        speed: currentPoint.status === 'in_port' ? '0' : '15.0'
      })
      .where(eq(vessels.id, vesselId));

    // Advance to next day
    route.currentDay = (route.currentDay + 1) % route.totalDays;
    route.lastUpdate = new Date();

    console.log(`Updated vessel ${vesselId} position: ${currentPoint.lat.toFixed(4)}, ${currentPoint.lng.toFixed(4)} - Status: ${currentPoint.status}`);
  }

  // Update all active vessel simulations
  async updateAllVoyages(): Promise<void> {
    const activeVessels = await db.select()
      .from(vessels)
      .where(and(
        isNotNull(vessels.departurePort),
        isNotNull(vessels.destinationPort)
      ));

    for (const vessel of activeVessels) {
      if (!this.activeRoutes.has(vessel.id) && vessel.departurePort && vessel.destinationPort) {
        // Create new route for vessel
        await this.createVoyageRoute(vessel.id, vessel.departurePort, vessel.destinationPort);
      }
      
      await this.updateVesselPosition(vessel.id);
    }
  }

  // Get voyage information for a vessel
  getVoyageInfo(vesselId: number): VoyageRoute | null {
    return this.activeRoutes.get(vesselId) || null;
  }

  // Start voyage simulation for a vessel
  async startVoyageSimulation(
    vesselId: number, 
    departurePortId: number, 
    destinationPortId: number,
    vesselSpeed: number = 15
  ): Promise<void> {
    await this.createVoyageRoute(vesselId, departurePortId, destinationPortId, vesselSpeed);
    
    // Update vessel's departure and destination ports
    await db.update(vessels)
      .set({
        departurePort: departurePortId,
        destinationPort: destinationPortId
      })
      .where(eq(vessels.id, vesselId));

    console.log(`Started voyage simulation for vessel ${vesselId}: Port ${departurePortId} → Port ${destinationPortId}`);
  }

  // Stop voyage simulation for a vessel
  stopVoyageSimulation(vesselId: number): void {
    this.activeRoutes.delete(vesselId);
    console.log(`Stopped voyage simulation for vessel ${vesselId}`);
  }

  // Get all active voyage simulations
  getAllActiveVoyages(): VoyageRoute[] {
    return Array.from(this.activeRoutes.values());
  }

  // Calculate total distance for a route
  calculateRouteDistance(routePoints: RoutePoint[]): number {
    if (!routePoints || routePoints.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 0; i < routePoints.length - 1; i++) {
      const currentPoint = routePoints[i];
      const nextPoint = routePoints[i + 1];
      
      if (currentPoint && nextPoint) {
        totalDistance += this.calculateDistance(
          currentPoint.lat, 
          currentPoint.lng, 
          nextPoint.lat, 
          nextPoint.lng
        );
      }
    }
    
    return Math.round(totalDistance);
  }
}

export const voyageSimulationService = new VoyageSimulationService();
export default voyageSimulationService;