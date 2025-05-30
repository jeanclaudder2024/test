import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CompanyConnections } from '@/components/broker/CompanyConnections';
import { CompanyProfile } from '@/components/broker/CompanyProfile';
import { DealManager } from '@/components/broker/DealManager';

// Using local types
type Broker = {
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
  specialization?: string[];
  activeDeals?: number;
  totalDealsValue?: number;
  performanceRating?: number;
};

export default function BrokerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [showCompanyProfile, setShowCompanyProfile] = useState(false);

  // Fetch broker data (using a default broker ID for demo)
  const { data: broker, isLoading: isLoadingBroker } = useQuery<Broker>({
    queryKey: ['/api/brokers/1'],
  });

  // Handle viewing company profile
  const handleViewCompany = (companyId: number) => {
    setSelectedCompanyId(companyId);
    setShowCompanyProfile(true);
  };

  // Handle closing company profile
  const handleCloseCompanyProfile = () => {
    setShowCompanyProfile(false);
  };

  // Loading state
  if (isLoadingBroker) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Default brokerId for demo purposes if no broker is loaded
  const brokerId = broker?.id || 1;

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Broker Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Connect oil shipping companies, manage deals, and track your performance
            </p>
          </div>
        </div>

        {/* Broker metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-muted-foreground">Active Connections</h3>
              <div className="p-2 bg-primary/10 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold mt-2">24</p>
            <p className="text-sm text-muted-foreground mt-1">+3 since last month</p>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-muted-foreground">Active Deals</h3>
              <div className="p-2 bg-primary/10 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold mt-2">7</p>
            <p className="text-sm text-muted-foreground mt-1">+2 in progress</p>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-muted-foreground">Commission (Month)</h3>
              <div className="p-2 bg-primary/10 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold mt-2">$143,250</p>
            <p className="text-sm text-muted-foreground mt-1">+12% from last month</p>
          </div>
        </div>

        {/* Main sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Company connections list */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg shadow-sm border">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Company Connections</h2>
                <CompanyConnections brokerId={brokerId} />
              </div>
            </div>
          </div>

          {/* Deal stats */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-sm border h-full">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Deals</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                    <div>
                      <p className="font-medium">Saudi Aramco &rarr; Shell Trading</p>
                      <p className="text-sm text-muted-foreground">Crude Oil - 500,000 bbl</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$38.5M</p>
                      <p className="text-sm text-green-600">$385K comm.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                    <div>
                      <p className="font-medium">ADNOC &rarr; BP Trading</p>
                      <p className="text-sm text-muted-foreground">Jet Fuel - 250,000 bbl</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$24.2M</p>
                      <p className="text-sm text-green-600">$242K comm.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                    <div>
                      <p className="font-medium">Kuwait Petro. &rarr; Total</p>
                      <p className="text-sm text-muted-foreground">LNG - 150,000 cu.m</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$18.7M</p>
                      <p className="text-sm text-green-600">$187K comm.</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button className="w-full bg-primary/10 text-primary font-medium py-2 rounded-md hover:bg-primary/20 transition-colors">
                    Manage All Deals
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Deal management */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg shadow-sm border">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Deal Management</h2>
                <DealManager brokerId={brokerId} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company profile modal */}
      {showCompanyProfile && selectedCompanyId && (
        <CompanyProfile 
          companyId={selectedCompanyId} 
          onClose={handleCloseCompanyProfile} 
        />
      )}
    </div>
  );
}