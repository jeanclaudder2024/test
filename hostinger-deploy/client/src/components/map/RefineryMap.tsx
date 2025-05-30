import { useEffect, useRef, useState } from 'react';
import { Refinery, Port } from '@shared/schema';
import { Vessel } from '@/types'; 
import { Compass, ZoomIn, ZoomOut, Map as MapIcon, Layers, Eye, EyeOff, Anchor, Ship, Factory } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

// Define Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

interface RefineryMapProps {
  refinery: Refinery;
  height?: string;
  className?: string;
  showControls?: boolean;
  showConnections?: boolean;
}

export default function RefineryMap({ 
  refinery, 
  height = '400px', 
  className = '',
  showControls = true,
  showConnections = true
}: RefineryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const mapInitialized = useRef(false);
  
  // State for controlling layer visibility
  const [showPorts, setShowPorts] = useState(true);
  const [showVessels, setShowVessels] = useState(true);
  const [showConnectedVessels, setShowConnectedVessels] = useState(true);
  const [connectedPorts, setConnectedPorts] = useState<any[]>([]);
  const [nearbyVessels, setNearbyVessels] = useState<Vessel[]>([]);
  const [connectedVessels, setConnectedVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Layer groups to store markers
  const portLayerGroup = useRef<any>(null);
  const vesselLayerGroup = useRef<any>(null);
  const connectedVesselLayerGroup = useRef<any>(null);

  useEffect(() => {
    // Wait for the component to mount
    if (!mapRef.current || mapInitialized.current) return;

    // Make sure Leaflet is available
    if (!window.L) {
      console.error('Leaflet is not loaded');
      return;
    }

    const L = window.L;
    
    // Parse and validate coordinates
    let lat = 0, lng = 0;
    
    try {
      lat = typeof refinery.lat === 'number' 
        ? refinery.lat 
        : Number(refinery.lat || 0);
        
      lng = typeof refinery.lng === 'number'
        ? refinery.lng
        : Number(refinery.lng || 0);
        
      // Validate coordinates
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.error('Invalid coordinates:', { lat, lng });
        lat = 0;
        lng = 0;
      }
    } catch (error) {
      console.error('Error parsing coordinates:', error);
      lat = 0;
      lng = 0;
    }

    // Initialize map with modern style
    leafletMap.current = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 9,
      zoomControl: false, // We'll add custom zoom controls
      scrollWheelZoom: true,
      attributionControl: false,
    });

    // Add a modern and minimal tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(leafletMap.current);

    // Add attribution in a more subtle way
    L.control.attribution({
      position: 'bottomright',
      prefix: false
    }).addTo(leafletMap.current);

    // Create a custom refinery icon
    const refineryIcon = L.divIcon({
      html: `
        <div class="relative group">
          <div class="absolute -inset-0.5 rounded-full bg-primary opacity-25 blur group-hover:opacity-50 transition"></div>
          <div class="relative flex items-center justify-center w-10 h-10 bg-background rounded-full border-2 border-primary shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
              <path d="M2 22h20"></path>
              <path d="M15 10h4c.8 0 1.3.5 1.5 1.2.3 1-.2 2.2-1.2 2.8H15"></path>
              <rect x="8" y="10" width="7" height="8" rx="1"></rect>
              <path d="M8 14H5c-.8 0-1.3-.5-1.5-1.2-.3-1 .2-2.2 1.2-2.8H8"></path>
              <path d="M2 6h20"></path>
              <path d="M22 2H2"></path>
            </svg>
          </div>
        </div>
      `,
      className: 'custom-refinery-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    // Add marker for the refinery
    const marker = L.marker([lat, lng], { 
      icon: refineryIcon,
      title: refinery.name
    })
    .addTo(leafletMap.current)
    .bindPopup(`
      <div class="refinery-popup">
        <div class="font-medium text-base mb-1">${refinery.name}</div>
        <div class="text-xs text-muted-foreground mb-2">${refinery.country}, ${refinery.region}</div>
        
        <div class="text-xs font-medium mb-1 text-primary">Processing Capacity</div>
        <div class="text-sm">${refinery.capacity ? (refinery.capacity / 1000).toFixed(0) + ' kbpd' : 'N/A'}</div>
        
        <div class="mt-3 text-xs">
          <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary">${refinery.status || 'Unknown'}</span>
        </div>
      </div>
    `, {
      className: 'custom-popup',
      closeButton: false,
      maxWidth: 300,
      minWidth: 200
    });

    // Auto-open the popup
    marker.openPopup();

    // Draw a pulsing circle around the refinery
    L.circle([lat, lng], {
      color: 'var(--primary)',
      fillColor: 'var(--primary)',
      fillOpacity: 0.1,
      radius: 5000,
      weight: 1,
      className: 'pulsing-circle'
    }).addTo(leafletMap.current);

    // Add scale control
    L.control.scale({
      position: 'bottomleft',
      imperial: false
    }).addTo(leafletMap.current);

    // Add custom CSS for the pulsing effect
    const style = document.createElement('style');
    style.textContent = `
      .pulsing-circle {
        animation: pulse-animation 2s infinite;
      }
      
      @keyframes pulse-animation {
        0% { transform: scale(0.9); opacity: 0.7; }
        50% { transform: scale(1); opacity: 0.5; }
        100% { transform: scale(0.9); opacity: 0.7; }
      }
      
      .custom-popup .leaflet-popup-content-wrapper {
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      }
      
      .custom-popup .leaflet-popup-tip {
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      }
    `;
    document.head.appendChild(style);

    mapInitialized.current = true;

    // Cleanup on unmount
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
      
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
      
      mapInitialized.current = false;
    };
  }, [refinery]);

  // Fetch connected ports and vessels when component mounts
  useEffect(() => {
    if (!showConnections || !refinery.id) return;
    
    const fetchConnections = async () => {
      setLoading(true);
      
      try {
        // Fetch connected ports
        const portsResponse = await fetch(`/api/refinery-port/refinery/${refinery.id}/ports`);
        if (portsResponse.ok) {
          const portsData = await portsResponse.json();
          setConnectedPorts(portsData);
        }
        
        // Fetch nearby vessels
        const vesselsResponse = await fetch(`/api/vessels/near-refinery/${refinery.id}`);
        if (vesselsResponse.ok) {
          const vesselsData = await vesselsResponse.json();
          setNearbyVessels(vesselsData);
        }
        
        // Fetch vessels directly connected to this refinery via vessel-refinery connections
        const connectionsResponse = await fetch(`/api/vessel-refinery`);
        if (connectionsResponse.ok) {
          const connections = await connectionsResponse.json();
          // Filter connections for this specific refinery
          const refineryConnections = connections.filter((conn: any) => conn.refineryId === refinery.id);
          
          if (refineryConnections.length > 0) {
            // Now get the actual vessel details for each connection
            const vesselsPromises = refineryConnections.map(async (connection: any) => {
              const vesselResponse = await fetch(`/api/vessels/${connection.vesselId}`);
              if (vesselResponse.ok) {
                const vessel = await vesselResponse.json();
                // Add connection details to vessel object
                return {
                  ...vessel,
                  connectionType: connection.connectionType,
                  cargoVolume: connection.cargoVolume,
                  connectionStartDate: connection.startDate,
                  connectionEndDate: connection.endDate,
                  connectionStatus: connection.status
                };
              }
              return null;
            });
            
            const vesselsData = await Promise.all(vesselsPromises);
            // Filter out any null values in case some vessel fetches failed
            setConnectedVessels(vesselsData.filter(v => v !== null));
          } else {
            setConnectedVessels([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch connections:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConnections();
  }, [refinery.id, showConnections]);
  
  // Add connected ports and vessels to map when data is available
  useEffect(() => {
    if (!leafletMap.current || !showConnections) return;
    
    const L = window.L;
    
    // Clear existing layers
    if (portLayerGroup.current) {
      portLayerGroup.current.clearLayers();
    } else {
      portLayerGroup.current = L.layerGroup().addTo(leafletMap.current);
    }
    
    if (vesselLayerGroup.current) {
      vesselLayerGroup.current.clearLayers();
    } else {
      vesselLayerGroup.current = L.layerGroup().addTo(leafletMap.current);
    }
    
    if (connectedVesselLayerGroup.current) {
      connectedVesselLayerGroup.current.clearLayers();
    } else {
      connectedVesselLayerGroup.current = L.layerGroup().addTo(leafletMap.current);
    }
    
    // Update layer visibility
    if (portLayerGroup.current) {
      if (showPorts) {
        leafletMap.current.addLayer(portLayerGroup.current);
      } else {
        leafletMap.current.removeLayer(portLayerGroup.current);
      }
    }
    
    if (vesselLayerGroup.current) {
      if (showVessels) {
        leafletMap.current.addLayer(vesselLayerGroup.current);
      } else {
        leafletMap.current.removeLayer(vesselLayerGroup.current);
      }
    }
    
    if (connectedVesselLayerGroup.current) {
      if (showConnectedVessels) {
        leafletMap.current.addLayer(connectedVesselLayerGroup.current);
      } else {
        leafletMap.current.removeLayer(connectedVesselLayerGroup.current);
      }
    }
    
    // Create port icons and add to map
    if (showPorts && connectedPorts.length > 0) {
      const portIcon = L.divIcon({
        html: `
          <div class="relative group">
            <div class="absolute -inset-0.5 rounded-full bg-blue-500 opacity-25 blur group-hover:opacity-50 transition"></div>
            <div class="relative flex items-center justify-center w-8 h-8 bg-background rounded-full border-2 border-blue-500 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
                <circle cx="12" cy="5" r="3"></circle>
                <line x1="12" y1="22" x2="12" y2="8"></line>
                <path d="M5 12H2a10 10 0 0 0 20 0h-3"></path>
              </svg>
            </div>
          </div>
        `,
        className: 'custom-port-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      
      connectedPorts.forEach(port => {
        try {
          const lat = typeof port.lat === 'number' ? port.lat : Number(port.lat || 0);
          const lng = typeof port.lng === 'number' ? port.lng : Number(port.lng || 0);
          
          if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            console.error('Invalid port coordinates:', { lat, lng, port });
            return;
          }
          
          // Add port marker
          const marker = L.marker([lat, lng], { 
            icon: portIcon,
            title: port.name
          })
          .addTo(portLayerGroup.current)
          .bindPopup(`
            <div class="port-popup">
              <div class="font-medium text-base mb-1">${port.name}</div>
              <div class="text-xs text-muted-foreground mb-2">${port.country || 'Unknown'}</div>
              
              <div class="text-xs font-medium mb-1 text-blue-500">Port Type</div>
              <div class="text-sm">${port.type || 'Commercial'}</div>
              
              <div class="mt-3 text-xs">
                <span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">${port.status || 'Operational'}</span>
              </div>
            </div>
          `, {
            className: 'custom-popup',
            closeButton: false,
            maxWidth: 300,
            minWidth: 200
          });
          
          // Add connection line from refinery to port
          const refineryLat = typeof refinery.lat === 'number' ? refinery.lat : Number(refinery.lat || 0);
          const refineryLng = typeof refinery.lng === 'number' ? refinery.lng : Number(refinery.lng || 0);
          
          L.polyline([[refineryLat, refineryLng], [lat, lng]], {
            color: 'rgba(59, 130, 246, 0.6)', // blue-500 with opacity
            weight: 2,
            dashArray: '5, 5',
            className: 'connection-line'
          }).addTo(portLayerGroup.current);
          
        } catch (error) {
          console.error('Error adding port marker:', error);
        }
      });
    }
    
    // Create vessel icons and add to map
    if (showVessels && nearbyVessels.length > 0) {
      const vesselIcon = L.divIcon({
        html: `
          <div class="relative group">
            <div class="absolute -inset-0.5 rounded-full bg-emerald-500 opacity-25 blur group-hover:opacity-50 transition"></div>
            <div class="relative flex items-center justify-center w-8 h-8 bg-background rounded-full border-2 border-emerald-500 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500">
                <path d="M18 17 A 10 10 0 0 1 6 17 H18"></path>
                <path d="M12 2v7"></path>
                <path d="M4.93 10H19.07"></path>
                <path d="M12 18v4"></path>
              </svg>
            </div>
          </div>
        `,
        className: 'custom-vessel-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      
      nearbyVessels.forEach(vessel => {
        try {
          if (!vessel.currentLat || !vessel.currentLng) return;
          
          const lat = typeof vessel.currentLat === 'number' ? vessel.currentLat : Number(vessel.currentLat || 0);
          const lng = typeof vessel.currentLng === 'number' ? vessel.currentLng : Number(vessel.currentLng || 0);
          
          if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            console.error('Invalid vessel coordinates:', { lat, lng, vessel });
            return;
          }
          
          // Add vessel marker
          const marker = L.marker([lat, lng], { 
            icon: vesselIcon,
            title: vessel.name
          })
          .addTo(vesselLayerGroup.current)
          .bindPopup(`
            <div class="vessel-popup">
              <div class="font-medium text-base mb-1">${vessel.name}</div>
              <div class="text-xs text-muted-foreground mb-2">${vessel.flag || 'Unknown'}</div>
              
              <div class="text-xs font-medium mb-1 text-emerald-500">Vessel Type</div>
              <div class="text-sm">${vessel.vesselType || 'Tanker'}</div>
              
              <div class="mt-2 text-xs font-medium mb-1 text-emerald-500">Cargo Capacity</div>
              <div class="text-sm">${vessel.cargoCapacity ? `${(vessel.cargoCapacity / 1000).toFixed(0)}k DWT` : 'N/A'}</div>
              
              <div class="mt-3 text-xs">
                <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">${vessel.status || 'At Sea'}</span>
              </div>
            </div>
          `, {
            className: 'custom-popup',
            closeButton: false,
            maxWidth: 300,
            minWidth: 200
          });
        } catch (error) {
          console.error('Error adding vessel marker:', error);
        }
      });
    }
    
    // Add connected vessels with a special styling
    if (showConnectedVessels && connectedVessels.length > 0) {
      const connectedVesselIcon = L.divIcon({
        html: `
          <div class="relative group">
            <div class="absolute -inset-0.5 rounded-full bg-primary opacity-40 blur-sm group-hover:opacity-70 transition animate-pulse"></div>
            <div class="relative flex items-center justify-center w-9 h-9 bg-background rounded-full border-2 border-primary shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
                <path d="M18 17 A 10 10 0 0 1 6 17 H18"></path>
                <path d="M12 2v7"></path>
                <path d="M4.93 10H19.07"></path>
                <path d="M12 18v4"></path>
              </svg>
            </div>
          </div>
        `,
        className: 'custom-connected-vessel-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });
      
      connectedVessels.forEach(vessel => {
        try {
          if (!vessel.currentLat || !vessel.currentLng) return;
          
          const lat = typeof vessel.currentLat === 'number' ? vessel.currentLat : Number(vessel.currentLat || 0);
          const lng = typeof vessel.currentLng === 'number' ? vessel.currentLng : Number(vessel.currentLng || 0);
          
          if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            console.error('Invalid vessel coordinates:', { lat, lng, vessel });
            return;
          }
          
          // Add connected vessel marker
          const marker = L.marker([lat, lng], { 
            icon: connectedVesselIcon,
            title: vessel.name
          })
          .addTo(connectedVesselLayerGroup.current)
          .bindPopup(`
            <div class="vessel-popup">
              <div class="font-medium text-base mb-1">${vessel.name}</div>
              <div class="text-xs text-muted-foreground mb-2">${vessel.flag || 'Unknown'}</div>
              
              <div class="text-xs font-medium mb-1 text-primary">Connected Vessel</div>
              <div class="text-sm">${vessel.connectionType || 'Standard'} Connection</div>
              
              <div class="mt-2 text-xs font-medium mb-1 text-primary">Vessel Type</div>
              <div class="text-sm">${vessel.vesselType || 'Tanker'}</div>
              
              ${vessel.cargoVolume ? `
              <div class="mt-2 text-xs font-medium mb-1 text-primary">Cargo Volume</div>
              <div class="text-sm">${vessel.cargoVolume} MT</div>
              ` : ''}
              
              ${vessel.connectionStartDate ? `
              <div class="mt-2 text-xs font-medium mb-1 text-primary">Connection Start</div>
              <div class="text-sm">${new Date(vessel.connectionStartDate).toLocaleDateString()}</div>
              ` : ''}
              
              <div class="mt-3 text-xs">
                <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary">${vessel.connectionStatus || 'Active'}</span>
              </div>
            </div>
          `, {
            className: 'custom-popup connected-vessel-popup',
            closeButton: false,
            maxWidth: 300,
            minWidth: 200
          });
          
          // Add connection line from refinery to connected vessel
          const refineryLat = typeof refinery.lat === 'number' ? refinery.lat : Number(refinery.lat || 0);
          const refineryLng = typeof refinery.lng === 'number' ? refinery.lng : Number(refinery.lng || 0);
          
          L.polyline([[refineryLat, refineryLng], [lat, lng]], {
            color: 'rgba(147, 51, 234, 0.6)', // purple with opacity
            weight: 2,
            dashArray: '5, 5',
            className: 'vessel-connection-line'
          }).addTo(connectedVesselLayerGroup.current);
          
        } catch (error) {
          console.error('Error adding connected vessel marker:', error);
        }
      });
    }
    
  }, [connectedPorts, nearbyVessels, connectedVessels, showPorts, showVessels, showConnectedVessels, refinery.lat, refinery.lng, showConnections]);
  
  // Handle window resize to update map
  useEffect(() => {
    const handleResize = () => {
      if (leafletMap.current) {
        leafletMap.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Force a resize after mounting to ensure the map fully renders
    setTimeout(handleResize, 100);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleZoomIn = () => {
    if (leafletMap.current) {
      leafletMap.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (leafletMap.current) {
      leafletMap.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (leafletMap.current) {
      const lat = typeof refinery.lat === 'number' ? refinery.lat : Number(refinery.lat || 0);
      const lng = typeof refinery.lng === 'number' ? refinery.lng : Number(refinery.lng || 0);
      
      leafletMap.current.setView([lat, lng], 9);
    }
  };

  // Coordinates fallback warning
  const invalidCoordinates = !refinery.lat || !refinery.lng || 
    typeof refinery.lat === 'string' && refinery.lat.trim() === '' ||
    typeof refinery.lng === 'string' && refinery.lng.trim() === '';

  return (
    <div className={`relative rounded-lg overflow-hidden border border-border ${className}`}>
      {invalidCoordinates && (
        <div className="absolute top-3 left-3 z-20 bg-amber-50 text-amber-800 px-3 py-1.5 rounded text-xs flex items-center">
          <Badge variant="outline" className="bg-amber-100 border-amber-300 text-amber-800 mr-2">Note</Badge>
          Using fallback coordinates
        </div>
      )}
      
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full z-10"
        style={{ height }}
      />

      {/* Custom Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
        <button 
          onClick={handleZoomIn}
          className="w-8 h-8 bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm rounded-full border border-border flex items-center justify-center text-foreground transition-colors"
          title="Zoom in"
        >
          <ZoomIn size={16} />
        </button>
        
        <button 
          onClick={handleZoomOut}
          className="w-8 h-8 bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm rounded-full border border-border flex items-center justify-center text-foreground transition-colors"
          title="Zoom out"
        >
          <ZoomOut size={16} />
        </button>
        
        <button 
          onClick={handleResetView}
          className="w-8 h-8 bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm rounded-full border border-border flex items-center justify-center text-foreground transition-colors"
          title="Reset view"
        >
          <Compass size={16} />
        </button>
      </div>
      
      {/* Map Info Badge */}
      <div className="absolute top-3 right-3 z-20">
        <div className="bg-background/80 backdrop-blur-sm text-xs px-2.5 py-1 rounded-full flex items-center shadow-sm border border-border">
          <MapIcon className="h-3 w-3 mr-1 text-primary" />
          <span>Refinery Location</span>
        </div>
      </div>
      
      {/* Layer Controls */}
      {showControls && showConnections && (
        <div className="absolute top-3 left-3 z-20">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm h-8 px-3 text-xs shadow-sm">
                <Layers className="h-3.5 w-3.5 mr-1.5" />
                <span>Layers</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="start" side="bottom">
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Map Layers</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-ports" className="flex items-center cursor-pointer text-sm">
                      <Anchor className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Connected Ports</span>
                      {connectedPorts.length > 0 && (
                        <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200" variant="outline">
                          {connectedPorts.length}
                        </Badge>
                      )}
                    </Label>
                    <Switch 
                      id="show-ports" 
                      checked={showPorts}
                      onCheckedChange={setShowPorts}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-vessels" className="flex items-center cursor-pointer text-sm">
                      <Ship className="h-4 w-4 mr-2 text-emerald-500" />
                      <span>Nearby Vessels</span>
                      {nearbyVessels.length > 0 && (
                        <Badge className="ml-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-200" variant="outline">
                          {nearbyVessels.length}
                        </Badge>
                      )}
                    </Label>
                    <Switch 
                      id="show-vessels" 
                      checked={showVessels}
                      onCheckedChange={setShowVessels}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-connected-vessels" className="flex items-center cursor-pointer text-sm">
                      <Ship className="h-4 w-4 mr-2 text-primary" />
                      <span>Connected Vessels</span>
                      {connectedVessels.length > 0 && (
                        <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/20" variant="outline">
                          {connectedVessels.length}
                        </Badge>
                      )}
                    </Label>
                    <Switch 
                      id="show-connected-vessels" 
                      checked={showConnectedVessels}
                      onCheckedChange={setShowConnectedVessels}
                    />
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  {loading ? (
                    <div className="flex items-center justify-center py-1">
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-primary/30 border-t-primary animate-spin mr-2"></div>
                      <span>Loading data...</span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span>
                        {connectedPorts.length === 0 && nearbyVessels.length === 0 
                          ? 'No connections found'
                          : `${connectedPorts.length + nearbyVessels.length} total connections`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
      
      {/* Loading Indicator */}
      {loading && (
        <div className="absolute inset-0 bg-background/20 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="bg-background rounded-lg shadow-lg p-4 flex items-center gap-3">
            <div className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
            <span className="text-sm">Loading connections...</span>
          </div>
        </div>
      )}
    </div>
  );
}