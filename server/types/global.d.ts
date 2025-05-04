import { Vessel } from "@shared/schema";

declare global {
  var cachedVessels: Vessel[] | undefined;
  var lastVesselCacheTime: number | undefined;
}

export {};