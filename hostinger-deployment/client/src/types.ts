// Application-wide type definitions

export interface Vessel {
  id: number;
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
  built?: number | null;
  deadweight?: number | null;
  currentLat?: string | number | null;
  currentLng?: string | number | null;
  departurePort?: string | null;
  departureDate?: string | null;
  departureLat?: string | number | null;
  departureLng?: string | number | null;
  destinationPort?: string | null;
  destinationLat?: string | number | null;
  destinationLng?: string | number | null;
  eta?: string | null;
  cargoType?: string | null;
  cargoCapacity?: number | null;
  currentRegion?: string | null;
  buyerName?: string | null;
  sellerName?: string | null;
  metadata?: string | null; // JSON string with additional vessel information
  lastUpdated?: string | Date | null;
  // Additional fields that may be added by client-side code
  departureTime?: string | null;
  previousPort?: string | null;
  lastPortDepatureTime?: string | null;
  voyageProgress?: number | null;
}

export interface Refinery {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: number | string;
  lng: number | string;
  capacity?: number | null;
  status?: string;
  description?: string | null;
  operator?: string | null;
  owner?: string | null;
  type?: string | null;
  products?: string | null;
  year_built?: number | null;
  last_maintenance?: string | null;
  next_maintenance?: string | null;
  complexity?: number | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  technical_specs?: string | null;
  photo?: string | null;
  city?: string | null;
  last_updated?: string | null;
  utilization?: number | null;
}

export interface Port {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: number | string;
  lng: number | string;
  portType?: string;
  description?: string | null;
  capacity?: number | null;
  operator?: string | null;
  contactInfo?: string | null;
  website?: string | null;
  facilities?: string | null;
  status?: string | null;
  vesselLimit?: number | null;
  estimatedWaitTime?: number | null;
  currentVessels?: number | null;
  last_updated?: string | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  provider?: string | null;
  isSubscribed?: boolean;
  subscriptionTier?: string | null;
  createdAt?: string | null;
}

export interface VesselDocument {
  id: number;
  vesselId: number;
  documentType: string;
  title: string;
  content: string;
  fileUrl?: string | null;
  createdAt: string | Date;
  issuedBy?: string | null;
  signedBy?: string | null;
  expiryDate?: string | null;
  status?: string | null;
  notes?: string | null;
}

export interface TrackingData {
  vessel: Vessel;
  currentPosition?: {
    lat: number;
    lng: number;
    timestamp: string;
    heading?: number;
    speed?: number;
  };
  route?: {
    points: Array<{ lat: number; lng: number; timestamp?: string }>;
    distance?: number;
    eta?: string;
  };
  weather?: {
    temperature?: number;
    windSpeed?: number;
    windDirection?: string;
    waveHeight?: number;
    visibility?: string;
  };
}

export interface VoyageProgress {
  percentComplete: number;
  distanceTraveled?: number;
  distanceRemaining?: number;
  currentSpeed?: number;
  averageSpeed?: number;
  estimatedArrival?: string;
  fromAPI?: boolean;
  estimated?: boolean;
  generatedData?: boolean;
}

export interface OilCompany {
  id: number;
  name: string;
  country: string;
  region?: string;
  type: string; // Producer, Trader, Refiner, etc.
  description?: string;
  logo?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  headquarters?: string;
  foundedYear?: number;
  employees?: number;
  revenue?: number;
  marketCap?: number;
  productionCapacity?: number;
  tradingVolume?: number;
  refineryCount?: number;
  vesselCount?: number;
  oilReserves?: number;
  mainProducts?: string[];
  operatingRegions?: string[];
  sustainabilityRating?: number;
  isMember?: boolean;
  lastUpdated?: string;
}