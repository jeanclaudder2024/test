// Type definitions
export interface Broker {
  id: number;
  name: string;
  company: string;
  email: string;
  phone?: string;
  country?: string;
  active: boolean;
  eliteMember?: boolean;
  eliteMemberSince?: string;
  eliteMemberExpires?: string;
  membershipId?: string;
  shippingAddress?: string;
  subscriptionPlan?: string;
  lastLogin?: string;
  
  // Additional broker fields for enhanced dashboard
  specialization?: string[];
  activeDeals?: number;
  totalDealsValue?: number;
  performanceRating?: number;
  preferredRegions?: string[];
  verificationStatus?: 'verified' | 'pending' | 'unverified';
  kycCompleted?: boolean;
  profileCompleteness?: number;
}

export interface Company {
  id: number;
  name: string;
  country?: string;
  region?: string;
  headquarters?: string;
  foundedYear?: number;
  ceo?: string;
  fleetSize?: number;
  specialization?: string;
  website?: string;
  logo?: string;
  description?: string;
  revenue?: number;
  employees?: number;
  publiclyTraded?: boolean;
  stockSymbol?: string;
  status?: string;
  createdAt?: string;
  lastUpdated?: string;
}

export interface BrokerClient {
  id: number;
  name: string;
  companyId?: number;
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  country?: string;
  preferredCommodities?: string[];
  budget?: number;
  status?: 'active' | 'inactive' | 'lead';
  notes?: string;
  createdAt?: string;
  lastContact?: string;
}

export interface Deal {
  id: number;
  brokerId: number;
  brokerName: string;
  sellerId: number;
  sellerName: string;
  buyerId: number;
  buyerName: string;
  vesselId?: number;
  vesselName?: string;
  cargoType: string;
  volume: number;
  volumeUnit: string;
  price: number;
  currency: string;
  status: 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  departurePortId?: number;
  departurePortName?: string;
  destinationPortId?: number;
  destinationPortName?: string;
  estimatedDeparture?: string;
  estimatedArrival?: string;
  createdAt: string;
  lastUpdated?: string;
  commissionRate?: number;
  commissionAmount?: number;
  documents?: Document[];
}

export interface BrokerCompanyConnection {
  id: number;
  brokerId: number;
  companyId: number;
  connectionType: 'buyer' | 'seller' | 'both';
  status: 'pending' | 'active' | 'inactive' | 'rejected';
  connectionDate?: string;
  lastActivityDate?: string;
  dealsCount?: number;
  totalVolume?: number;
  notes?: string;
}

export interface Document {
  id: number;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadDate: string;
  status?: string;
  ownerId?: number;
  ownerType?: 'vessel' | 'broker' | 'company' | 'deal';
}

export interface Vessel {
  id: number;
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
  built?: number | null;
  deadweight?: number | null;
  currentLat?: string | null;
  currentLng?: string | null;
  departurePort?: string | null;
  departureDate?: string | null;
  departureLat?: string | null;
  departureLng?: string | null;
  destinationPort?: string | null;
  destinationLat?: string | null;
  destinationLng?: string | null;
  eta?: string | null;
  cargoType?: string | null;
  cargoCapacity?: number | null;
  currentRegion?: string | null;
  status?: string | null;
  speed?: string | null;
  buyerName?: string | null;
  sellerName?: string | null;
  ownerName?: string | null;
  operatorName?: string | null;
  oilSource?: string | null;
  
  // Deal Information Fields
  oilType?: string | null;
  quantity?: number | null;
  dealValue?: number | null;
  loadingPort?: string | null;
  price?: number | null;
  marketPrice?: number | null;
  sourceCompany?: string | null;
  targetRefinery?: string | null;
  shippingType?: string | null;
  routeDistance?: number | null;
  
  metadata?: string | null;
  lastUpdated?: string | null;
}

// Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}