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
  mmsi?: number;
  imo?: number;
  type?: string;
  flag?: string;
  status?: string;
  destination?: string;
  eta?: string;
  lat?: number;
  lng?: number;
  heading?: number;
  speed?: number;
  lastReport?: string;
  sellerName?: string;
  buyerName?: string;
  cargoType?: string;
  cargoAmount?: number;
  cargoUnit?: string;
  departurePort?: string;
  departureLat?: number;
  departureLng?: number;
  destinationPort?: string;
  destinationLat?: number;
  destinationLng?: number;
  progress?: number;
}

// Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}