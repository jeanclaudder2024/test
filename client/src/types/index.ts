// Type definitions for client components

export interface Port {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: string | number;
  lng: string | number;
  capacity: number | null;
  status: 'active' | 'maintenance' | 'planned' | 'operational';
  description?: string | null;
  type?: string | null;
  lastUpdated?: Date | string | null;
}

export interface Vessel {
  id: number;
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
  built: number | null;
  deadweight: number | null;
  currentLat: string | number | null;
  currentLng: string | number | null;
  currentSpeed: number | null;
  currentRegion: string | null;
  departurePort: string | null;
  departureTime: Date | string | null;
  destinationPort: string | null;
  eta: Date | string | null;
  status: string | null;
  course: number | null;
  cargoType: string | null;
  cargoAmount: number | null;
  progress: number | null;
  isOilVessel: boolean | null;
  lastUpdated: Date | string | null;
}

export interface PortWithVessels extends Port {
  vesselCount: number;
  nearbyVessels?: Array<{
    vessels: Vessel;
    distance: number;
  }>;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface Region {
  id: string;
  name: string;
  description?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface FilterOptions {
  region?: string;
  type?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type SortDirection = 'asc' | 'desc';