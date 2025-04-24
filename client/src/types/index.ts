export interface RegionData {
  id: string;
  name: string;
  nameAr: string;
}

export type Region = string; // Region ID

export interface Vessel {
  id: number;
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
  built?: number;
  deadweight?: number;
  currentLat?: number;
  currentLng?: number;
  departurePort?: string;
  departureDate?: string;
  destinationPort?: string;
  eta?: string;
  cargoType?: string;
  cargoCapacity?: number;
  currentRegion?: string;
  heading?: number;      // Ship's heading in degrees (0-359)
  speed?: number;        // Ship's speed in knots
  lastUpdate?: string;   // Last AIS update timestamp
  status?: string;       // Navigation status: "underway", "anchored", etc.
}

export interface Refinery {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
  capacity?: number;
  status: string;
}

export interface ProgressEvent {
  id: number;
  vesselId: number;
  date: string;
  event: string;
  lat?: number;
  lng?: number;
  location?: string;
}

export interface Document {
  id: number;
  vesselId: number;
  type: string;
  title: string;
  content: string;
  status?: string; // active, expired, pending, revoked
  issueDate?: string;
  expiryDate?: string;
  reference?: string; // Document reference number
  issuer?: string; // Organization that issued document
  recipientName?: string;
  recipientOrg?: string;
  lastModified?: string;
  language?: string;
  createdAt: string;
}

export interface Broker {
  id: number;
  name: string;
  company: string;
  email: string;
  phone?: string;
  country?: string;
  active: boolean;
  
  // Elite Membership fields
  eliteMember?: boolean;
  eliteMemberSince?: string | Date;
  eliteMemberExpires?: string | Date;
  membershipId?: string;
  shippingAddress?: string;
  subscriptionPlan?: 'monthly' | 'annual';
  lastLogin?: string | Date;
}

export interface Stats {
  id: number;
  activeVessels: number;
  totalCargo: number;
  activeRefineries: number;
  activeBrokers: number;
  lastUpdated: string;
}

export interface AIQueryResponse {
  type: 'text' | 'vessel' | 'refinery' | 'document';
  content: string;
  vessel?: Vessel;
  refinery?: Refinery;
  document?: Document;
}

export interface MapPosition {
  lat: number;
  lng: number;
  zoom: number;
}
