import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Anchor, RefreshCw } from 'lucide-react';

interface MapControlPanelProps {
  showVessels: boolean;
  setShowVessels: (show: boolean) => void;
  showPorts: boolean;
  setShowPorts: (show: boolean) => void;
  showRefineries: boolean;
  setShowRefineries: (show: boolean) => void;
  mapMode: string;
  setMapMode: (mode: string) => void;
  mapStyles?: Record<string, any>;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedVesselType: string;
  setSelectedVesselType: (type: string) => void;
  showVesselStatus: boolean;
  setShowVesselStatus: (show: boolean) => void;
  trafficDensity: boolean;
  setTrafficDensity: (show: boolean) => void;
  showLegend: boolean;
  setShowLegend: (show: boolean) => void;
  vesselTypes: string[];
  showPortProximityControls: boolean;
  setShowPortProximityControls: (show: boolean) => void;
  handleRefresh: () => void;
}

const MapControlPanel: React.FC<MapControlPanelProps> = ({
  showVessels,
  setShowVessels,
  showPorts,
  setShowPorts,
  showRefineries,
  setShowRefineries,
  mapMode,
  setMapMode,
  mapStyles,
  selectedRegion,
  setSelectedRegion,
  selectedVesselType,
  setSelectedVesselType,
  showVesselStatus,
  setShowVesselStatus,
  trafficDensity,
  setTrafficDensity,
  showLegend,
  setShowLegend,
  vesselTypes,
  showPortProximityControls,
  setShowPortProximityControls,
  handleRefresh
}) => {
  return (
    <Card className="absolute top-3 right-3 z-[1500] bg-white rounded-md shadow-lg border border-gray-100 overflow-hidden w-72">
      {/* Map Layers & View Controls - Using higher z-index to stay on top of map */}
      <div className="p-3 pb-2 border-b border-gray-100">
        <h3 className="text-sm font-semibold mb-2 text-gray-700 flex items-center">
          <svg className="w-4 h-4 mr-1 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
          </svg>
          Map Layers
        </h3>
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          <button
            className={`px-1.5 py-1 text-xs rounded ${showVessels ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setShowVessels(!showVessels)}
          >
            <div className="flex flex-col items-center">
              <svg className="w-4 h-4 mb-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a4 4 0 0 0-8 0"></path>
                <path d="M10 18a4 4 0 0 0 8 0"></path>
                <circle cx="18" cy="8" r="4"></circle>
                <circle cx="10" cy="18" r="4"></circle>
              </svg>
              Vessels
            </div>
          </button>
          <button
            className={`px-1.5 py-1 text-xs rounded ${showPorts ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setShowPorts(!showPorts)}
          >
            <div className="flex flex-col items-center">
              <svg className="w-4 h-4 mb-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              Ports
            </div>
          </button>
          <button
            className={`px-1.5 py-1 text-xs rounded ${showRefineries ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setShowRefineries(!showRefineries)}
          >
            <div className="flex flex-col items-center">
              <svg className="w-4 h-4 mb-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.5 21.5l-5-5"></path>
                <path d="M18.5 12.5v4h4"></path>
                <path d="M4.5 21.5l5-5"></path>
                <path d="M6.5 12.5v4h-4"></path>
                <path d="M12.5 2.5v10l2 2"></path>
                <path d="M12.5 2.5v10l-2 2"></path>
                <path d="M4.5 10.5h16"></path>
              </svg>
              Refineries
            </div>
          </button>
        </div>
        <h3 className="text-sm font-semibold mb-2 text-gray-700 flex items-center">
          <svg className="w-4 h-4 mr-1 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          Map View
        </h3>
        <div className="flex gap-1.5 mb-2">
          <button
            className={`px-2 py-1 text-xs rounded flex-1 ${mapMode === 'standard' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setMapMode('standard')}
          >
            Standard
          </button>
          <button
            className={`px-2 py-1 text-xs rounded flex-1 ${mapMode === 'satellite' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setMapMode('satellite')}
          >
            Satellite
          </button>
          <button
            className={`px-2 py-1 text-xs rounded flex-1 ${mapMode === 'dark' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setMapMode('dark')}
          >
            Dark Mode
          </button>
        </div>
      </div>
      
      {/* Filters Section */}
      <div className="p-3 pb-2 border-b border-gray-100">
        <h3 className="text-sm font-semibold mb-2 text-gray-700 flex items-center">
          <svg className="w-4 h-4 mr-1 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
          Filters
        </h3>
        <div className="space-y-2 mb-2">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Region</label>
            <select 
              className="w-full text-xs border-gray-200 rounded-md py-1 pl-2 pr-7 bg-white" 
              value={selectedRegion} 
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="all">All Regions</option>
              <option value="Europe">Europe</option>
              <option value="Asia-Pacific">Asia-Pacific</option>
              <option value="North America">North America</option>
              <option value="Latin America">Latin America</option>
              <option value="Middle East">Middle East</option>
              <option value="Africa">Africa</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Vessel Type</label>
            <select 
              className="w-full text-xs border-gray-200 rounded-md py-1 pl-2 pr-7 bg-white" 
              value={selectedVesselType} 
              onChange={(e) => setSelectedVesselType(e.target.value)}
            >
              <option value="all">All Types</option>
              {vesselTypes.filter(type => type !== 'all').map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Options Section */}
      <div className="p-3 pb-2">
        <h3 className="text-sm font-semibold mb-2 text-gray-700 flex items-center">
          <svg className="w-4 h-4 mr-1 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Options
        </h3>
        <div className="space-y-2 mb-2">
          <label className="flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={showVesselStatus}
              onChange={(e) => setShowVesselStatus(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 h-3 w-3 mr-2"
            />
            <span className="text-xs text-gray-700">Show Vessel Status</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={trafficDensity}
              onChange={() => setTrafficDensity(!trafficDensity)}
              className="rounded text-blue-600 focus:ring-blue-500 h-3 w-3 mr-2"
            />
            <span className="text-xs text-gray-700">Show Traffic Density</span>
          </label>
        </div>
        <div className="flex items-center justify-between mt-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowLegend(!showLegend)}
            className="text-xs text-gray-600 hover:text-blue-600 px-2 py-1 h-7"
          >
            {showLegend ? 'Hide Legend' : 'Show Legend'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            className="text-xs flex items-center gap-1 px-2 py-1 h-7"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Refresh</span>
          </Button>
        </div>
        <Button 
          variant={showPortProximityControls ? "default" : "outline"} 
          size="sm"
          onClick={() => setShowPortProximityControls(!showPortProximityControls)}
          className={`mt-2 w-full flex items-center gap-1 justify-center h-7 text-xs`}
        >
          <Anchor className="h-3 w-3" />
          {showPortProximityControls ? "Hide Port Controls" : "Show Port Controls"}
        </Button>
      </div>
    </Card>
  );
};

export default MapControlPanel;