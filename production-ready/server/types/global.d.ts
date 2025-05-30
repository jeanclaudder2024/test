import { Vessel } from "@shared/schema";

declare global {
  var cachedVessels: Vessel[] | undefined;
  var lastVesselCacheTime: number | undefined;
  
  // Region-specific vessel caches
  var vessels_north_america: Vessel[] | undefined;
  var vessels_europe: Vessel[] | undefined;
  var vessels_asia_pacific: Vessel[] | undefined;
  var vessels_middle_east: Vessel[] | undefined;
  var vessels_africa: Vessel[] | undefined;
  var vessels_latin_america: Vessel[] | undefined;
}

// Add index signature to allow dynamic access to global
declare namespace NodeJS {
  interface Global {
    [key: string]: any;
  }
}

export {};