import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import WorldMap from "@/components/map/WorldMap";
import VesselInfo from "@/components/vessels/VesselInfo";
import ProgressTimeline from "@/components/vessels/ProgressTimeline";
import StatsCards from "@/components/dashboard/StatsCards";
import AIAssistant from "@/components/ai/AIAssistant";
import { Region, Vessel } from "@/types";
import { useVesselProgressEvents } from "@/hooks/useVessels";
import { Button } from "@/components/ui/button";
import { useDataStream } from "@/hooks/useDataStream";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  
  // Use streaming data
  const { vessels = [], refineries = [], loading, error, lastUpdated } = useDataStream();
  
  // Filter data by selected region
  const filteredVessels = selectedRegion 
    ? vessels.filter(v => v.currentRegion === selectedRegion)
    : vessels;
    
  const filteredRefineries = selectedRegion
    ? refineries.filter(r => r.region === selectedRegion)
    : refineries;
  
  // Fetch progress events for selected vessel
  const { data: progressEvents = [], isLoading: progressLoading } = useVesselProgressEvents(
    selectedVessel?.id || null
  );
  
  // Handle region selection
  const handleRegionSelect = (region: Region) => {
    setSelectedRegion(region === selectedRegion ? null : region);
  };
  
  // Handle vessel selection
  const handleVesselSelect = (vessel: Vessel) => {
    setSelectedVessel(vessel);
  };

  // Update the selected vessel when data refreshes
  useEffect(() => {
    if (selectedVessel && vessels.length > 0) {
      const updatedVessel = vessels.find(v => v.id === selectedVessel.id);
      if (updatedVessel) {
        setSelectedVessel(updatedVessel);
      }
    }
  }, [vessels, selectedVessel]);

  const regions: Region[] = ['North America', 'Europe', 'MEA', 'Africa', 'Russia', 'Asia'];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {/* App Header */}
        <Header />

        {/* Map Section */}
        <section className="p-4 md:p-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Region Selector Tabs */}
            <div className="bg-gray-50 border-b border-gray-200 flex overflow-x-auto">
              {regions.map((region) => (
                <Button
                  key={region}
                  variant="ghost"
                  className={`px-4 py-2 text-sm font-medium rounded-none ${
                    selectedRegion === region
                      ? 'text-primary bg-blue-50 border-b-2 border-primary'
                      : 'text-gray-600 hover:text-primary hover:bg-blue-50'
                  }`}
                  onClick={() => handleRegionSelect(region)}
                >
                  {region.toUpperCase()}
                </Button>
              ))}
            </div>
            
            {/* Map Container */}
            <WorldMap 
              vessels={filteredVessels}
              refineries={filteredRefineries}
              selectedRegion={selectedRegion}
              onVesselClick={handleVesselSelect}
              isLoading={loading}
            />
          </div>
        </section>
        
        {/* Vessel Information Section */}
        {selectedVessel && (
          <section className="p-4 md:p-6 pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Vessel Details Card */}
              <div className="lg:col-span-2">
                <VesselInfo vessel={selectedVessel} />
              </div>
              
              {/* Progress Card */}
              <div>
                <ProgressTimeline 
                  events={progressEvents} 
                  isLoading={progressLoading} 
                />
              </div>
            </div>
          </section>
        )}
        
        {/* Stats Cards Section */}
        <section className="p-4 md:p-6 pt-0">
          <StatsCards />
        </section>
        
        {/* AI Assistant Floating Button */}
        <AIAssistant />
      </main>
    </div>
  );
}
