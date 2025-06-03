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

    // Generate daily waypoints during sailing
    for (let day = 1; day <= sailingDays; day++) {
      const progress = day / sailingDays;
      
      // Simple linear interpolation (could be enhanced with great circle routes)
      const lat = depLat + (destLat - depLat) * progress;
      const lng = depLng + (destLng - depLng) * progress;
      
      // Add some realistic variation to the route
      const variation = 0.1; // degrees
      const latVariation = (Math.random() - 0.5) * variation;
      const lngVariation = (Math.random() - 0.5) * variation;

      waypoints.push({
        lat: lat + latVariation,
        lng: lng + lngVariation,
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
}

export const voyageSimulationService = new VoyageSimulationService();
export default voyageSimulationService;