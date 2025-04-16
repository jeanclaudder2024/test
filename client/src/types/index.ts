export type Region = 'North America' | 'Europe' | 'MEA' | 'Africa' | 'Russia' | 'Asia';

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
