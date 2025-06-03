import { db } from '../db';
import { vessels, ports } from '../../shared/schema';
import { eq, sql } from 'drizzle-orm';

interface VesselGenerationOptions {
  portId?: number;
  vesselCount?: number;
  radiusKm?: number;
  vesselTypes?: string[];
  useMLPrediction?: boolean;
}

interface GeneratedVessel {
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
  currentLat: number;
  currentLng: number;
  speed: number;
  course: number;
  status: string;
  cargoType: string;
  built: number;
  deadweight: number;
  cargoCapacity: number;
}

// Machine Learning-based vessel positioning patterns
class VesselPositioningML {
  // Common vessel behavior patterns around ports
  private static readonly VESSEL_PATTERNS = {
    'anchoring': { distance: [5, 15], speed: [0, 2], probability: 0.3 },
    'approaching': { distance: [15, 50], speed: [8, 15], probability: 0.25 },
    'departing': { distance: [10, 30], speed: [12, 18], probability: 0.25 },
    'transit': { distance: [50, 200], speed: [15, 22], probability: 0.2 }
  };

  private static readonly VESSEL_TYPES = [
    { type: 'Crude Oil Tanker', probability: 0.35, avgSize: 150000 },
    { type: 'Product Tanker', probability: 0.25, avgSize: 75000 },
    { type: 'LNG Carrier', probability: 0.15, avgSize: 125000 },
    { type: 'Chemical Tanker', probability: 0.15, avgSize: 45000 },
    { type: 'LPG Carrier', probability: 0.1, avgSize: 55000 }
  ];

  private static readonly CARGO_TYPES = [
    'Crude Oil', 'Diesel', 'Gasoline', 'Jet Fuel', 'Heavy Fuel Oil', 
    'LNG', 'LPG', 'Chemicals', 'Naphtha', 'Kerosene'
  ];

  private static readonly FLAGS = [
    'Panama', 'Liberia', 'Marshall Islands', 'Singapore', 'Malta', 
    'Bahamas', 'Cyprus', 'Norway', 'Denmark', 'Greece'
  ];

  // Generate realistic vessel position using ML-inspired algorithms
  static generateVesselPosition(portLat: number, portLng: number, radiusKm: number): {
    lat: number;
    lng: number;
    pattern: string;
    speed: number;
    course: number;
  } {
    // Select behavior pattern based on weighted probability
    const patterns = Object.entries(this.VESSEL_PATTERNS);
    const random = Math.random();
    let cumulative = 0;
    let selectedPattern = 'anchoring';

    for (const [pattern, config] of patterns) {
      cumulative += config.probability;
      if (random <= cumulative) {
        selectedPattern = pattern;
        break;
      }
    }

    const config = this.VESSEL_PATTERNS[selectedPattern as keyof typeof this.VESSEL_PATTERNS];
    
    // Generate distance based on pattern
    const minDist = Math.min(...config.distance);
    const maxDist = Math.min(Math.max(...config.distance), radiusKm);
    const distance = minDist + Math.random() * (maxDist - minDist);
    
    // Generate realistic angle (vessels tend to cluster in shipping lanes)
    let angle;
    if (selectedPattern === 'anchoring') {
      // Anchoring areas are usually in specific zones
      const anchorZones = [45, 135, 225, 315]; // Common anchor positions
      angle = anchorZones[Math.floor(Math.random() * anchorZones.length)] + (Math.random() - 0.5) * 30;
    } else {
      // Other patterns follow shipping lanes (prefer cardinal/intercardinal directions)
      const shippingLanes = [0, 45, 90, 135, 180, 225, 270, 315];
      angle = shippingLanes[Math.floor(Math.random() * shippingLanes.length)] + (Math.random() - 0.5) * 20;
    }

    // Convert to radians
    const angleRad = (angle * Math.PI) / 180;
    
    // Calculate position (1 degree ≈ 111 km)
    const latOffset = (distance * Math.cos(angleRad)) / 111;
    const lngOffset = (distance * Math.sin(angleRad)) / (111 * Math.cos((portLat * Math.PI) / 180));
    
    const lat = portLat + latOffset;
    const lng = portLng + lngOffset;
    
    // Generate speed and course based on pattern
    const speed = config.speed[0] + Math.random() * (config.speed[1] - config.speed[0]);
    const course = selectedPattern === 'anchoring' ? 0 : 
                  selectedPattern === 'approaching' ? ((angle + 180) % 360) :
                  selectedPattern === 'departing' ? angle :
                  Math.random() * 360;

    return { lat, lng, pattern: selectedPattern, speed, course };
  }

  // Generate realistic vessel characteristics
  static generateVesselCharacteristics(): {
    vesselType: string;
    cargoType: string;
    flag: string;
    built: number;
    deadweight: number;
    cargoCapacity: number;
  } {
    // Select vessel type based on probability
    const random = Math.random();
    let cumulative = 0;
    let selectedType = this.VESSEL_TYPES[0];

    for (const vesselType of this.VESSEL_TYPES) {
      cumulative += vesselType.probability;
      if (random <= cumulative) {
        selectedType = vesselType;
        break;
      }
    }

    // Generate realistic specifications
    const sizeVariation = 0.7 + Math.random() * 0.6; // 70-130% of average
    const deadweight = Math.round(selectedType.avgSize * sizeVariation);
    const cargoCapacity = Math.round(deadweight * 0.95); // Typically 95% of deadweight

    return {
      vesselType: selectedType.type,
      cargoType: this.CARGO_TYPES[Math.floor(Math.random() * this.CARGO_TYPES.length)],
      flag: this.FLAGS[Math.floor(Math.random() * this.FLAGS.length)],
      built: 2000 + Math.floor(Math.random() * 24), // 2000-2024
      deadweight,
      cargoCapacity
    };
  }

  // Generate realistic vessel names
  static generateVesselName(vesselType: string): string {
    const prefixes = ['Ocean', 'Sea', 'Maritime', 'Global', 'Pacific', 'Atlantic', 'Energy', 'Star', 'Pioneer', 'Victory'];
    const suffixes = ['Carrier', 'Trader', 'Navigator', 'Explorer', 'Guardian', 'Spirit', 'Pride', 'Legend', 'Champion', 'Master'];
    const numbers = Math.floor(100 + Math.random() * 900);
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${prefix} ${suffix} ${numbers}`;
  }

  // Generate realistic IMO and MMSI numbers
  static generateIdentifiers(): { imo: string; mmsi: string } {
    // IMO: 7-digit number starting with IMO
    const imoNumber = 1000000 + Math.floor(Math.random() * 8999999);
    const imo = `IMO${imoNumber}`;
    
    // MMSI: 9-digit number for ship identification
    const mmsi = (200000000 + Math.floor(Math.random() * 699999999)).toString();
    
    return { imo, mmsi };
  }
}

export class VesselGenerationService {
  // Generate vessels around a specific port using ML algorithms
  static async generateVesselsAroundPort(options: VesselGenerationOptions): Promise<GeneratedVessel[]> {
    const {
      portId,
      vesselCount = 10,
      radiusKm = 50,
      vesselTypes,
      useMLPrediction = true
    } = options;

    // Get port information
    const port = portId ? await db.query.ports.findFirst({
      where: eq(ports.id, portId)
    }) : null;

    if (!port || !port.lat || !port.lng) {
      throw new Error('Port not found or missing coordinates');
    }

    const portLat = parseFloat(port.lat);
    const portLng = parseFloat(port.lng);
    const generatedVessels: GeneratedVessel[] = [];

    // Generate vessels using ML-inspired positioning
    for (let i = 0; i < vesselCount; i++) {
      const position = VesselPositioningML.generateVesselPosition(portLat, portLng, radiusKm);
      const characteristics = VesselPositioningML.generateVesselCharacteristics();
      const { imo, mmsi } = VesselPositioningML.generateIdentifiers();
      const name = VesselPositioningML.generateVesselName(characteristics.vesselType);

      // Filter by vessel type if specified
      if (vesselTypes && vesselTypes.length > 0 && !vesselTypes.includes(characteristics.vesselType)) {
        continue;
      }

      const vessel: GeneratedVessel = {
        name,
        imo,
        mmsi,
        vesselType: characteristics.vesselType,
        flag: characteristics.flag,
        currentLat: position.lat,
        currentLng: position.lng,
        speed: parseFloat(position.speed.toFixed(1)),
        course: Math.round(position.course),
        status: position.pattern === 'anchoring' ? 'at anchor' : 'underway',
        cargoType: characteristics.cargoType,
        built: characteristics.built,
        deadweight: characteristics.deadweight,
        cargoCapacity: characteristics.cargoCapacity
      };

      generatedVessels.push(vessel);
    }

    return generatedVessels;
  }

  // Save generated vessels to database
  static async saveGeneratedVessels(generatedVessels: GeneratedVessel[], portId?: number): Promise<void> {
    const vesselsToInsert = generatedVessels.map(vessel => ({
      ...vessel,
      currentLat: vessel.currentLat.toString(),
      currentLng: vessel.currentLng.toString(),
      speed: vessel.speed.toString(),
      course: vessel.course.toString(),
      departurePort: portId || null,
      destinationPort: portId || null,
      currentRegion: 'auto-generated',
      ownerName: 'Auto Generated',
      operatorName: 'ML System',
      buyerName: 'Generated',
      sellerName: 'Generated'
    }));

    await db.insert(vessels).values(vesselsToInsert);
  }

  // Generate vessels around all ports
  static async generateVesselsAroundAllPorts(vesselsPerPort: number = 5): Promise<number> {
    const allPorts = await db.query.ports.findMany({
      where: sql`${ports.lat} IS NOT NULL AND ${ports.lng} IS NOT NULL`
    });

    let totalGenerated = 0;

    for (const port of allPorts) {
      try {
        const generatedVessels = await this.generateVesselsAroundPort({
          portId: port.id,
          vesselCount: vesselsPerPort,
          radiusKm: 30,
          useMLPrediction: true
        });

        await this.saveGeneratedVessels(generatedVessels, port.id);
        totalGenerated += generatedVessels.length;
      } catch (error) {
        console.error(`Error generating vessels for port ${port.name}:`, error);
      }
    }

    return totalGenerated;
  }

  // Clean up old generated vessels
  static async cleanupGeneratedVessels(): Promise<number> {
    const result = await db.delete(vessels)
      .where(eq(vessels.currentRegion, 'auto-generated'));
    
    return result.rowCount || 0;
  }
}