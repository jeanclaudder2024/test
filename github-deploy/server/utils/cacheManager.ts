import { Vessel, Port, Refinery, RefineryPortConnection } from "@shared/schema";

// Define cache types
type CacheData = {
  vessels?: Vessel[];
  ports?: Port[];
  refineries?: Refinery[];
  connections?: RefineryPortConnection[];
  regionalVessels?: { [region: string]: Vessel[] };
  lastVesselFetch?: number;
  lastPortFetch?: number;
  lastRefineryFetch?: number;
  lastConnectionFetch?: number;
};

// Initialize cache
const cache: CacheData = {
  regionalVessels: {}
};

// Cache expiry configuration in milliseconds
const CACHE_EXPIRY = {
  vessels: 5 * 60 * 1000, // 5 minutes
  ports: 30 * 60 * 1000,  // 30 minutes
  refineries: 60 * 60 * 1000, // 1 hour
  connections: 30 * 60 * 1000 // 30 minutes
};

// Vessel functions
export function getCachedVessels(): Vessel[] | undefined {
  if (!cache.vessels || !cache.lastVesselFetch || Date.now() - cache.lastVesselFetch > CACHE_EXPIRY.vessels) {
    return undefined;
  }
  return cache.vessels;
}

export function setCachedVessels(vessels: Vessel[]): void {
  cache.vessels = vessels;
  cache.lastVesselFetch = Date.now();
  
  // Clear regional cache when updating all vessels
  cache.regionalVessels = {};
}

export function getCachedVesselsByRegion(region: string): Vessel[] | undefined {
  if (!cache.regionalVessels || 
      !cache.regionalVessels[region] || 
      !cache.lastVesselFetch || 
      Date.now() - cache.lastVesselFetch > CACHE_EXPIRY.vessels) {
    return undefined;
  }
  return cache.regionalVessels[region];
}

export function setCachedVesselsByRegion(region: string, vessels: Vessel[]): void {
  if (!cache.regionalVessels) {
    cache.regionalVessels = {};
  }
  cache.regionalVessels[region] = vessels;
}

// Port functions
export function getCachedPorts(): Port[] | undefined {
  if (!cache.ports || !cache.lastPortFetch || Date.now() - cache.lastPortFetch > CACHE_EXPIRY.ports) {
    return undefined;
  }
  return cache.ports;
}

export function setCachedPorts(ports: Port[]): void {
  cache.ports = ports;
  cache.lastPortFetch = Date.now();
}

// Refinery functions
export function getCachedRefineries(): Refinery[] | undefined {
  if (!cache.refineries || !cache.lastRefineryFetch || Date.now() - cache.lastRefineryFetch > CACHE_EXPIRY.refineries) {
    return undefined;
  }
  return cache.refineries;
}

export function setCachedRefineries(refineries: Refinery[]): void {
  cache.refineries = refineries;
  cache.lastRefineryFetch = Date.now();
}

// Connection functions
export function getCachedConnections(): RefineryPortConnection[] | undefined {
  if (!cache.connections || !cache.lastConnectionFetch || Date.now() - cache.lastConnectionFetch > CACHE_EXPIRY.connections) {
    return undefined;
  }
  return cache.connections;
}

export function setCachedConnections(connections: RefineryPortConnection[]): void {
  cache.connections = connections;
  cache.lastConnectionFetch = Date.now();
}

// Clear all cache
export function clearCache(): void {
  cache.vessels = undefined;
  cache.ports = undefined;
  cache.refineries = undefined;
  cache.connections = undefined;
  cache.regionalVessels = {};
  cache.lastVesselFetch = undefined;
  cache.lastPortFetch = undefined;
  cache.lastRefineryFetch = undefined;
  cache.lastConnectionFetch = undefined;
}

// Clear specific cache
export function clearCacheByType(type: 'vessels' | 'ports' | 'refineries' | 'connections'): void {
  if (type === 'vessels') {
    cache.vessels = undefined;
    cache.regionalVessels = {};
    cache.lastVesselFetch = undefined;
  } else if (type === 'ports') {
    cache.ports = undefined;
    cache.lastPortFetch = undefined;
  } else if (type === 'refineries') {
    cache.refineries = undefined;
    cache.lastRefineryFetch = undefined;
  } else if (type === 'connections') {
    cache.connections = undefined;
    cache.lastConnectionFetch = undefined;
  }
}