import { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayerGroup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from '@/hooks/use-toast';
import { Factory, Anchor, Ship, Pin, Navigation, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Interfaces for map data
interface MapItem {
  id: number;
  name: string;
  lat: string | number;
  lng: string | number;
}

interface Vessel extends MapItem {
  vesselType: string;
  imo: string;
  mmsi: string;
  flag: string;
  cargoType?: string;
  status?: string;
  cargoCapacity?: number;
  departurePort?: string;
  destinationPort?: string;
  eta?: string;
}

interface Port extends MapItem {
  country: string;
  region: string;
  type: string;
  status?: string;
  capacity?: number;
}

interface Refinery extends MapItem {
  country: string;
  region: string;
  operator?: string;
  capacity?: number;
  status?: string;
}

// Component to update map center when props change
function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function FullscreenMap() {
  // State for map data
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [refineries, setRefineries] = useState<Refinery[]>([]);
  
  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]); 
  const [mapZoom, setMapZoom] = useState(3);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Selected item state
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedItemType, setSelectedItemType] = useState<'vessel' | 'port' | 'refinery' | null>(null);
  const [infoCardOpen, setInfoCardOpen] = useState(false);
  
  // Display layers state
  const [showVessels, setShowVessels] = useState(true);
  const [showPorts, setShowPorts] = useState(true);
  const [showRefineries, setShowRefineries] = useState(true);
  
  // Timer reference for auto-updates
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch initial data
  useEffect(() => {
    const fetchMapData = async () => {
      setLoading(true);
      try {
        // Fetch vessels
        const vesselsResponse = await fetch('/api/vessels');
        const vesselsData = await vesselsResponse.json();
        
        const processedVessels = (vesselsData.vessels || [])
          .filter((v: any) => v && v.id && v.name && v.currentLat && v.currentLng)
          .map((v: any) => ({
            id: v.id,
            name: v.name,
            lat: v.currentLat,
            lng: v.currentLng,
            vesselType: v.vesselType || 'Unknown',
            imo: v.imo || 'N/A',
            mmsi: v.mmsi || 'N/A',
            flag: v.flag || 'Unknown',
            cargoType: v.cargoType || 'Unknown',
            status: v.status || 'At Sea',
            cargoCapacity: v.cargoCapacity,
            departurePort: v.departurePort,
            destinationPort: v.destinationPort,
            eta: v.eta
          }));
        
        setVessels(processedVessels);
        
        // Fetch ports
        const portsResponse = await fetch('/api/ports');
        const portsData = await portsResponse.json();
        setPorts(portsData.ports || []);
        
        // Fetch refineries
        const refineriesResponse = await fetch('/api/refineries');
        const refineriesData = await refineriesResponse.json();
        setRefineries(refineriesData.refineries || []);
        
        setLastUpdated(new Date());
        setLoading(false);
        
        // Start auto-updates
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Update every 5 minutes (300000 milliseconds)
        timerRef.current = setInterval(() => {
          updateVessels();
        }, 300000);
        
      } catch (err) {
        console.error('Error fetching map data:', err);
        setLoading(false);
        toast({
          title: "Error Loading Map",
          description: "Could not load map data. Please try again later.",
          variant: "destructive",
        });
      }
    };
    
    fetchMapData();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Function to update vessel positions
  const updateVessels = async () => {
    try {
      const response = await fetch('/api/vessels/polling');
      const data = await response.json();
      
      // Process vessels data
      const processedVessels = (data.vessels || [])
        .filter((v: any) => {
          return v && v.id && v.name && v.currentLat && v.currentLng;
        })
        .map((v: any) => ({
          id: v.id,
          name: v.name,
          lat: v.currentLat,
          lng: v.currentLng,
          vesselType: v.vesselType || 'Unknown',
          imo: v.imo || 'N/A',
          mmsi: v.mmsi || 'N/A',
          flag: v.flag || 'Unknown',
          cargoType: v.cargoType || 'Unknown',
          status: v.status || 'At Sea',
          cargoCapacity: v.cargoCapacity,
          departurePort: v.departurePort,
          destinationPort: v.destinationPort,
          eta: v.eta
        }));
      
      setVessels(processedVessels);
      setLastUpdated(new Date());
      
      // If we have a selected vessel, update its data
      if (selectedItem && selectedItemType === 'vessel') {
        const updatedVessel = processedVessels.find(v => v.id === selectedItem.id);
        if (updatedVessel) {
          setSelectedItem(updatedVessel);
        }
      }
      
      // Show a success notification
      toast({
        title: "Map Updated",
        description: `Updated positions for ${processedVessels.length} vessels`,
        variant: "default",
        duration: 2000,
      });
      
    } catch (err) {
      console.error('Error updating vessel data:', err);
      
      // Show error toast
      toast({
        title: "Update Failed",
        description: "Could not refresh vessel positions. Retrying in 5 minutes.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  // Generate vessel marker icons
  const getVesselIcon = (vessel: Vessel) => {
    // Determine color based on vessel type
    let primaryColor = 'rgb(var(--primary))';
    
    // Crude/product oil tankers in green
    if (vessel.vesselType.includes('Tanker') || vessel.vesselType.includes('Oil')) {
      primaryColor = '#10b981'; // emerald-500
    } 
    // Gas carriers in purple
    else if (vessel.vesselType.includes('LNG') || vessel.vesselType.includes('LPG')) {
      primaryColor = '#8b5cf6'; // violet-500
    } 
    // Container ships in blue
    else if (vessel.vesselType.includes('Container')) {
      primaryColor = '#3b82f6'; // blue-500
    }
    // Bulk carriers in orange
    else if (vessel.vesselType.includes('Bulk')) {
      primaryColor = '#f97316'; // orange-500
    }
    // Passenger vessels in pink
    else if (vessel.vesselType.includes('Passenger') || vessel.vesselType.includes('Cruise')) {
      primaryColor = '#ec4899'; // pink-500
    }
    
    // Add a direction indicator if the vessel has a status of "underway"
    const hasDirection = vessel.status?.toLowerCase().includes('underway') || 
                       vessel.status?.toLowerCase().includes('at sea');
    
    return L.divIcon({
      className: 'vessel-marker',
      html: `
        <div class="relative group">
          <div class="absolute inset-0 rounded-full opacity-25 blur-[2px] group-hover:opacity-40 transition-opacity" 
               style="background-color: ${primaryColor}"></div>
          <div class="relative w-4 h-4 rounded-full border-2 border-white shadow-lg flex items-center justify-center" 
               style="background-color: ${primaryColor}">
            ${hasDirection ? `<div class="w-0 h-0 absolute -top-3 left-1/2 -translate-x-1/2 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[4px] border-white"></div>` : ''}
          </div>
          <div class="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white text-[8px] px-1 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            ${vessel.name}
          </div>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };
  
  // Generate port marker icons
  const getPortIcon = (port: Port) => {
    // Different styles for different port types
    let bgColor = '#3b82f6'; // blue-500 (default)
    let icon = '⚓'; // Default anchor
    
    if (port.type?.toLowerCase().includes('oil')) {
      bgColor = '#10b981'; // emerald-500
      icon = '🛢️';
    } else if (port.type?.toLowerCase().includes('container')) {
      bgColor = '#f97316'; // orange-500
      icon = '📦';
    } else if (port.type?.toLowerCase().includes('passenger')) {
      bgColor = '#8b5cf6'; // violet-500
      icon = '🚢';
    }
    
    return L.divIcon({
      className: 'port-marker',
      html: `
        <div class="relative group">
          <div class="absolute inset-0 rounded-full opacity-30 blur-[2px] group-hover:opacity-50 transition-opacity" 
               style="background-color: ${bgColor}"></div>
          <div class="relative w-6 h-6 bg-white rounded-full border-2 shadow-lg flex items-center justify-center text-xs font-bold" 
               style="border-color: ${bgColor}; color: ${bgColor}">
            ${icon}
          </div>
          <div class="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white text-[8px] px-1 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            ${port.name}
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };
  
  // Generate refinery marker icons
  const getRefineryIcon = (refinery: Refinery) => {
    return L.divIcon({
      className: 'refinery-marker',
      html: `
        <div class="relative group">
          <div class="absolute inset-0 rounded-full opacity-30 blur-[2px] group-hover:opacity-50 transition-opacity bg-red-500"></div>
          <div class="relative w-7 h-7 bg-white rounded-full border-2 border-red-500 shadow-lg flex items-center justify-center text-red-500 text-xs font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 22h8"></path><path d="M12 11v11"></path><path d="M20 19V7l-4 4V7l-4 4V7L8 11V7L4 11v8"></path></svg>
          </div>
          <div class="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white text-[8px] px-1 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            ${refinery.name}
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  };
  
  // Handle item selection from search or map click
  const handleItemSelect = (item: any, type: 'vessel' | 'port' | 'refinery') => {
    // Make sure we preserve the correct type when setting the selected item
    console.log(`Selected ${type}:`, item);
    
    // Always ensure we mark the type explicitly to avoid confusion
    const itemWithType = { ...item, itemType: type };
    
    setSelectedItem(itemWithType);
    setSelectedItemType(type);
    setInfoCardOpen(true);
    
    // Center the map on the selected item
    const lat = typeof item.lat === 'string' ? parseFloat(item.lat) : item.lat;
    const lng = typeof item.lng === 'string' ? parseFloat(item.lng) : item.lng;
    
    setMapCenter([lat, lng]);
    // Adjust zoom based on item type
    setMapZoom(type === 'vessel' ? 8 : type === 'refinery' ? 9 : 7);
    
    // Show a toast notification
    toast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Selected`,
      description: `Now showing details for ${item.name}`,
      variant: "default",
      duration: 2000,
    });
  };
  
  // Clear selection
  const clearSelection = () => {
    setSelectedItem(null);
    setSelectedItemType(null);
    setInfoCardOpen(false);
  };
  
  return (
    <div className="w-full h-screen relative">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="mt-2 text-sm">Loading maritime map data...</span>
          </div>
        </div>
      ) : (
        <>
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            style={{ height: '100%', width: '100%' }} 
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapCenterUpdater center={mapCenter} />
            
            {/* Vessels Layer */}
            {showVessels && (
              <LayerGroup>
                {vessels.map((vessel) => (
                  <Marker
                    key={`vessel-${vessel.id}`}
                    position={[
                      typeof vessel.lat === 'string' ? parseFloat(vessel.lat) : vessel.lat,
                      typeof vessel.lng === 'string' ? parseFloat(vessel.lng) : vessel.lng
                    ]}
                    icon={getVesselIcon(vessel)}
                    eventHandlers={{
                      click: () => handleItemSelect(vessel, 'vessel')
                    }}
                  >
                    <Popup className="vessel-popup custom-popup">
                      <div className="p-1">
                        <h3 className="font-bold text-base flex items-center gap-1.5">
                          <Ship className="h-3.5 w-3.5 text-primary" />
                          {vessel.name}
                        </h3>
                        <div className="grid grid-cols-1 gap-y-1 mt-2 text-xs">
                          <p><strong>IMO:</strong> {vessel.imo}</p>
                          <p><strong>MMSI:</strong> {vessel.mmsi}</p>
                          <p><strong>Flag:</strong> {vessel.flag}</p>
                          <p><strong>Type:</strong> {vessel.vesselType}</p>
                          {vessel.cargoType && <p><strong>Cargo:</strong> {vessel.cargoType}</p>}
                          {vessel.status && <p><strong>Status:</strong> {vessel.status}</p>}
                        </div>
                        <Button 
                          variant="link" 
                          size="sm"
                          className="p-0 h-auto text-xs mt-2"
                          onClick={() => handleItemSelect(vessel, 'vessel')}
                        >
                          View Details
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </LayerGroup>
            )}
            
            {/* Ports Layer */}
            {showPorts && (
              <LayerGroup>
                {ports.map((port) => (
                  <Marker
                    key={`port-${port.id}`}
                    position={[
                      typeof port.lat === 'string' ? parseFloat(port.lat) : port.lat,
                      typeof port.lng === 'string' ? parseFloat(port.lng) : port.lng
                    ]}
                    icon={getPortIcon(port)}
                    eventHandlers={{
                      click: () => handleItemSelect(port, 'port')
                    }}
                  >
                    <Popup className="port-popup custom-popup">
                      <div className="p-1">
                        <h3 className="font-bold text-base flex items-center gap-1.5">
                          <Anchor className="h-3.5 w-3.5 text-blue-500" />
                          {port.name}
                        </h3>
                        <div className="grid grid-cols-1 gap-y-1 mt-2 text-xs">
                          <p><strong>Country:</strong> {port.country}</p>
                          <p><strong>Region:</strong> {port.region}</p>
                          <p><strong>Type:</strong> {port.type}</p>
                          {port.status && <p><strong>Status:</strong> {port.status}</p>}
                          {port.capacity && (
                            <p><strong>Capacity:</strong> {port.capacity.toLocaleString()} TEU/day</p>
                          )}
                        </div>
                        <Button 
                          variant="link" 
                          size="sm"
                          className="p-0 h-auto text-xs mt-2"
                          onClick={() => handleItemSelect(port, 'port')}
                        >
                          View Details
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </LayerGroup>
            )}
            
            {/* Refineries Layer */}
            {showRefineries && (
              <LayerGroup>
                {refineries.map((refinery) => (
                  <Marker
                    key={`refinery-${refinery.id}`}
                    position={[
                      typeof refinery.lat === 'string' ? parseFloat(refinery.lat) : refinery.lat,
                      typeof refinery.lng === 'string' ? parseFloat(refinery.lng) : refinery.lng
                    ]}
                    icon={getRefineryIcon(refinery)}
                    eventHandlers={{
                      click: () => handleItemSelect(refinery, 'refinery')
                    }}
                  >
                    <Popup className="refinery-popup custom-popup">
                      <div className="p-1">
                        <h3 className="font-bold text-base flex items-center gap-1.5">
                          <Factory className="h-3.5 w-3.5 text-red-500" />
                          {refinery.name}
                        </h3>
                        <div className="grid grid-cols-1 gap-y-1 mt-2 text-xs">
                          <p><strong>Country:</strong> {refinery.country}</p>
                          <p><strong>Region:</strong> {refinery.region}</p>
                          {refinery.operator && <p><strong>Operator:</strong> {refinery.operator}</p>}
                          {refinery.capacity && (
                            <p><strong>Capacity:</strong> {refinery.capacity.toLocaleString()} BPD</p>
                          )}
                          <p><strong>Status:</strong> {refinery.status || 'Active'}</p>
                        </div>
                        <Button 
                          variant="link" 
                          size="sm"
                          className="p-0 h-auto text-xs mt-2"
                          onClick={() => handleItemSelect(refinery, 'refinery')}
                        >
                          View Refinery Details
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </LayerGroup>
            )}
          </MapContainer>
            
          {/* Detail panel when an item is selected */}
          {selectedItem && selectedItemType && infoCardOpen && (
            <div className="absolute top-4 right-4 z-[1000] w-72 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
              <div className="p-4 border-b flex justify-between items-center">
                {selectedItemType === 'vessel' && <Ship className="h-5 w-5 text-primary" />}
                {selectedItemType === 'port' && <Anchor className="h-5 w-5 text-blue-500" />}
                {selectedItemType === 'refinery' && <Factory className="h-5 w-5 text-red-500" />}
                
                <span className="font-medium text-sm flex-grow ml-2">
                  {selectedItem.name}
                </span>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  onClick={clearSelection}
                >
                  ×
                </Button>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Vessel specific details */}
                {selectedItemType === 'vessel' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-1">
                      <Badge>{selectedItem.vesselType}</Badge>
                      <Badge variant="outline">{selectedItem.flag}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                        <p className="font-medium mb-1">IMO</p>
                        <span>{selectedItem.imo}</span>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                        <p className="font-medium mb-1">MMSI</p>
                        <span>{selectedItem.mmsi}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Pin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Current Position</span>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md text-xs">
                        <p>Latitude: {typeof selectedItem.lat === 'string' ? 
                          parseFloat(selectedItem.lat).toFixed(6) : 
                          selectedItem.lat.toFixed(6)}
                        </p>
                        <p>Longitude: {typeof selectedItem.lng === 'string' ? 
                          parseFloat(selectedItem.lng).toFixed(6) : 
                          selectedItem.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Port specific details */}
                {selectedItemType === 'port' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-1">
                      <Badge>{selectedItem.type}</Badge>
                      <Badge variant="outline">{selectedItem.status || 'Active'}</Badge>
                    </div>
                    
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md text-xs">
                      <p className="font-medium mb-1">Location</p>
                      <p>Country: {selectedItem.country}</p>
                      <p>Region: {selectedItem.region}</p>
                    </div>
                    
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md text-xs">
                      <p className="font-medium mb-1">Coordinates</p>
                      <p>Latitude: {typeof selectedItem.lat === 'string' ? 
                        parseFloat(selectedItem.lat).toFixed(6) : 
                        selectedItem.lat.toFixed(6)}
                      </p>
                      <p>Longitude: {typeof selectedItem.lng === 'string' ? 
                        parseFloat(selectedItem.lng).toFixed(6) : 
                        selectedItem.lng.toFixed(6)}
                      </p>
                    </div>
                    
                    {selectedItem.capacity && (
                      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md text-xs">
                        <p className="font-medium mb-1">Port Capacity</p>
                        <p>{selectedItem.capacity.toLocaleString()} TEU/day</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Refinery specific details */}
                {selectedItemType === 'refinery' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">Refinery</Badge>
                      <Badge variant="outline">{selectedItem.status || 'Active'}</Badge>
                    </div>
                    
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md text-xs">
                      <p className="font-medium mb-1">Location</p>
                      <p>Country: {selectedItem.country}</p>
                      <p>Region: {selectedItem.region}</p>
                    </div>
                    
                    {selectedItem.operator && (
                      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md text-xs">
                        <p className="font-medium mb-1">Operator</p>
                        <p>{selectedItem.operator}</p>
                      </div>
                    )}
                    
                    {selectedItem.capacity && (
                      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md text-xs">
                        <p className="font-medium mb-1">Refining Capacity</p>
                        <p>{selectedItem.capacity.toLocaleString()} BPD</p>
                      </div>
                    )}
                    
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md text-xs">
                      <p className="font-medium mb-1">Coordinates</p>
                      <p>Latitude: {typeof selectedItem.lat === 'string' ? 
                        parseFloat(selectedItem.lat).toFixed(6) : 
                        selectedItem.lat.toFixed(6)}
                      </p>
                      <p>Longitude: {typeof selectedItem.lng === 'string' ? 
                        parseFloat(selectedItem.lng).toFixed(6) : 
                        selectedItem.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Layer control in the bottom left */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 text-xs">
            <div className="font-medium mb-2">Map Layers</div>
            <div className="space-y-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showVessels}
                  onChange={(e) => setShowVessels(e.target.checked)}
                  className="rounded"
                />
                <span>Vessels</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPorts}
                  onChange={(e) => setShowPorts(e.target.checked)}
                  className="rounded"
                />
                <span>Ports</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRefineries}
                  onChange={(e) => setShowRefineries(e.target.checked)}
                  className="rounded"
                />
                <span>Refineries</span>
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
}