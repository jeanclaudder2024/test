import { useEffect, useRef, useState } from 'react';

interface Vessel {
  id: number;
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
  built: number | null;
  deadweight: number | null;
  currentLat: string | null;
  currentLng: string | null;
  status: string | null;
  cargoCapacity: number | null;
  cargoType: string | null;
  owner: string | null;
}

// Types
interface Port {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: string | number;
  lng: string | number;
  type: string | null;
  status: string | null;
  capacity: number | null;
  description: string | null;
}

interface PortMapProps {
  port: Port;
  height?: string;
  className?: string;
  showControls?: boolean;
  showConnections?: boolean;
}

// Declare global Leaflet
declare global {
  interface Window {
    L: any;
  }
}

function PortMap({ 
  port, 
  height = '400px', 
  className = '',
  showControls = true,
  showConnections = true
}: PortMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const mapInitialized = useRef(false);
  
  // State for controlling layer visibility
  const [showRefineries, setShowRefineries] = useState(true);
  const [showVessels, setShowVessels] = useState(true);
  const [showConnectedVessels, setShowConnectedVessels] = useState(true);
  const [connectedRefineries, setConnectedRefineries] = useState<any[]>([]);
  const [nearbyVessels, setNearbyVessels] = useState<Vessel[]>([]);
  const [connectedVessels, setConnectedVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Layer groups to store markers
  const refineryLayerGroup = useRef<any>(null);
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
      lat = typeof port.lat === 'number' 
        ? port.lat 
        : Number(port.lat || 0);
        
      lng = typeof port.lng === 'number'
        ? port.lng
        : Number(port.lng || 0);
        
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
      zoom: 10,
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

    // Create a custom port icon
    const portIcon = L.divIcon({
      html: `
        <div class="relative group">
          <div class="absolute -inset-0.5 rounded-full bg-blue-500 opacity-25 blur group-hover:opacity-50 transition"></div>
          <div class="relative flex items-center justify-center w-12 h-12 bg-background rounded-full border-2 border-blue-500 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
              <circle cx="12" cy="5" r="3"></circle>
              <line x1="12" y1="22" x2="12" y2="8"></line>
              <path d="M5 12H2a10 10 0 0 0 20 0h-3"></path>
            </svg>
          </div>
        </div>
      `,
      className: 'custom-port-icon',
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });

    // Add marker for the port
    const marker = L.marker([lat, lng], { 
      icon: portIcon,
      title: port.name
    })
    .addTo(leafletMap.current)
    .bindPopup(`
      <div class="port-popup">
        <div class="font-medium text-base mb-1">${port.name}</div>
        <div class="text-xs text-muted-foreground mb-2">${port.country}, ${port.region}</div>
        
        <div class="text-xs font-medium mb-1 text-blue-500">Port Type</div>
        <div class="text-sm">${port.type || 'Commercial Port'}</div>
        
        <div class="text-xs font-medium mb-1 mt-2 text-blue-500">Capacity</div>
        <div class="text-sm">${port.capacity ? (port.capacity / 1000000).toFixed(1) + 'M TEU' : 'N/A'}</div>
        
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

    // Auto-open the popup
    marker.openPopup();

    // Draw a pulsing circle around the port
    L.circle([lat, lng], {
      color: 'rgba(59, 130, 246, 0.8)', // blue-500
      fillColor: 'rgba(59, 130, 246, 0.2)',
      fillOpacity: 0.2,
      radius: 8000,
      weight: 2,
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
        animation: pulse-animation 3s infinite;
      }
      
      @keyframes pulse-animation {
        0% { transform: scale(0.9); opacity: 0.8; }
        50% { transform: scale(1.05); opacity: 0.4; }
        100% { transform: scale(0.9); opacity: 0.8; }
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
  }, [port]);

  // Fetch connected refineries and vessels when component mounts
  useEffect(() => {
    if (!showConnections || !port.id) return;
    
    const fetchConnections = async () => {
      setLoading(true);
      
      try {
        // Fetch connected refineries
        const refineriesResponse = await fetch(`/api/refinery-port/port/${port.id}/refineries`);
        if (refineriesResponse.ok) {
          const refineriesData = await refineriesResponse.json();
          setConnectedRefineries(refineriesData);
        }
        
        // Fetch nearby vessels
        const vesselsResponse = await fetch(`/api/vessels/near-port/${port.id}`);
        if (vesselsResponse.ok) {
          const vesselsData = await vesselsResponse.json();
          setNearbyVessels(vesselsData);
        }
        
        // Fetch vessels that have this port as current or destination
        const portVesselsResponse = await fetch(`/api/vessels?currentPortId=${port.id}&destinationPortId=${port.id}`);
        if (portVesselsResponse.ok) {
          const portVesselsData = await portVesselsResponse.json();
          setConnectedVessels(portVesselsData);
        }
        
      } catch (error) {
        console.error('Failed to fetch connections:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConnections();
  }, [port.id, showConnections]);
  
  // Add connected refineries and vessels to map when data is available
  useEffect(() => {
    if (!leafletMap.current || !showConnections) return;
    
    const L = window.L;
    
    // Clear existing layers
    if (refineryLayerGroup.current) {
      refineryLayerGroup.current.clearLayers();
    } else {
      refineryLayerGroup.current = L.layerGroup().addTo(leafletMap.current);
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
    if (refineryLayerGroup.current) {
      if (showRefineries) {
        leafletMap.current.addLayer(refineryLayerGroup.current);
      } else {
        leafletMap.current.removeLayer(refineryLayerGroup.current);
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
    
    // Create refinery icons and add to map
    if (showRefineries && connectedRefineries.length > 0) {
      const refineryIcon = L.divIcon({
        html: `
          <div class="relative group">
            <div class="absolute -inset-0.5 rounded-full bg-orange-500 opacity-25 blur group-hover:opacity-50 transition"></div>
            <div class="relative flex items-center justify-center w-8 h-8 bg-background rounded-full border-2 border-orange-500 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-orange-500">
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
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      
      connectedRefineries.forEach(refinery => {
        try {
          const lat = typeof refinery.lat === 'number' ? refinery.lat : Number(refinery.lat || 0);
          const lng = typeof refinery.lng === 'number' ? refinery.lng : Number(refinery.lng || 0);
          
          if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            console.error('Invalid refinery coordinates:', { lat, lng, refinery });
            return;
          }
          
          // Add refinery marker
          const marker = L.marker([lat, lng], { 
            icon: refineryIcon,
            title: refinery.name
          })
          .addTo(refineryLayerGroup.current)
          .bindPopup(`
            <div class="refinery-popup">
              <div class="font-medium text-base mb-1">${refinery.name}</div>
              <div class="text-xs text-muted-foreground mb-2">${refinery.country || 'Unknown'}</div>
              
              <div class="text-xs font-medium mb-1 text-orange-500">Processing Capacity</div>
              <div class="text-sm">${refinery.capacity ? (refinery.capacity / 1000).toFixed(0) + ' kbpd' : 'N/A'}</div>
              
              <div class="mt-3 text-xs">
                <span class="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">${refinery.status || 'Active'}</span>
              </div>
            </div>
          `, {
            className: 'custom-popup',
            closeButton: false,
            maxWidth: 300,
            minWidth: 200
          });
          
          // Add connection line from port to refinery
          const portLat = typeof port.lat === 'number' ? port.lat : Number(port.lat || 0);
          const portLng = typeof port.lng === 'number' ? port.lng : Number(port.lng || 0);
          
          L.polyline([[portLat, portLng], [lat, lng]], {
            color: 'rgba(249, 115, 22, 0.6)', // orange-500 with opacity
            weight: 2,
            dashArray: '5, 5',
            className: 'connection-line'
          }).addTo(refineryLayerGroup.current);
          
        } catch (error) {
          console.error('Error adding refinery marker:', error);
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
                <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1"></path>
                <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"></path>
                <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"></path>
                <path d="M12 10v4"></path>
                <path d="M12 2v3"></path>
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
          
          const lat = typeof vessel.currentLat === 'number' ? vessel.currentLat : Number(vessel.currentLat);
          const lng = typeof vessel.currentLng === 'number' ? vessel.currentLng : Number(vessel.currentLng);
          
          if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            console.error('Invalid vessel coordinates:', { lat, lng, vessel });
            return;
          }
          
          // Add vessel marker
          L.marker([lat, lng], { 
            icon: vesselIcon,
            title: vessel.name
          })
          .addTo(vesselLayerGroup.current)
          .bindPopup(`
            <div class="vessel-popup">
              <div class="font-medium text-base mb-1">${vessel.name}</div>
              <div class="text-xs text-muted-foreground mb-2">${vessel.vesselType} • ${vessel.flag}</div>
              
              <div class="text-xs font-medium mb-1 text-emerald-500">Specifications</div>
              <div class="text-sm">
                ${vessel.cargoCapacity ? `${(vessel.cargoCapacity / 1000).toFixed(0)}k MT capacity` : 'Capacity N/A'}
              </div>
              
              <div class="text-xs font-medium mb-1 mt-2 text-emerald-500">Owner</div>
              <div class="text-sm">${vessel.owner || 'Unknown'}</div>
              
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
    
    // Add connected vessels with special styling
    if (showConnectedVessels && connectedVessels.length > 0) {
      const connectedVesselIcon = L.divIcon({
        html: `
          <div class="relative group">
            <div class="absolute -inset-1 rounded-full bg-purple-500 opacity-30 blur animate-pulse"></div>
            <div class="relative flex items-center justify-center w-10 h-10 bg-background rounded-full border-3 border-purple-500 shadow-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-500">
                <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1"></path>
                <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"></path>
                <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"></path>
                <path d="M12 10v4"></path>
                <path d="M12 2v3"></path>
              </svg>
            </div>
          </div>
        `,
        className: 'custom-connected-vessel-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
      
      connectedVessels.forEach(vessel => {
        try {
          if (!vessel.currentLat || !vessel.currentLng) return;
          
          const lat = typeof vessel.currentLat === 'number' ? vessel.currentLat : Number(vessel.currentLat);
          const lng = typeof vessel.currentLng === 'number' ? vessel.currentLng : Number(vessel.currentLng);
          
          if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return;
          }
          
          // Add connected vessel marker
          L.marker([lat, lng], { 
            icon: connectedVesselIcon,
            title: `${vessel.name} (Connected)`
          })
          .addTo(connectedVesselLayerGroup.current)
          .bindPopup(`
            <div class="connected-vessel-popup">
              <div class="font-medium text-base mb-1 text-purple-600">${vessel.name}</div>
              <div class="text-xs text-muted-foreground mb-2">${vessel.vesselType} • ${vessel.flag}</div>
              
              <div class="text-xs font-medium mb-1 text-purple-600">Port Connection</div>
              <div class="text-sm">Connected to ${port.name}</div>
              
              <div class="text-xs font-medium mb-1 mt-2 text-purple-600">Vessel Details</div>
              <div class="text-sm">
                ${vessel.cargoCapacity ? `${(vessel.cargoCapacity / 1000).toFixed(0)}k MT` : 'N/A'} • 
                ${vessel.cargoType || 'Various cargo'}
              </div>
              
              <div class="mt-3 text-xs">
                <span class="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">${vessel.status || 'Connected'}</span>
              </div>
            </div>
          `, {
            className: 'custom-popup',
            closeButton: false,
            maxWidth: 300,
            minWidth: 200
          });
          
          // Add connection line from port to connected vessel
          const portLat = typeof port.lat === 'number' ? port.lat : Number(port.lat || 0);
          const portLng = typeof port.lng === 'number' ? port.lng : Number(port.lng || 0);
          
          L.polyline([[portLat, portLng], [lat, lng]], {
            color: 'rgba(147, 51, 234, 0.8)', // purple-600 with opacity
            weight: 3,
            className: 'connection-line-strong'
          }).addTo(connectedVesselLayerGroup.current);
          
        } catch (error) {
          console.error('Error adding connected vessel marker:', error);
        }
      });
    }
    
  }, [showConnections, connectedRefineries, nearbyVessels, connectedVessels, showRefineries, showVessels, showConnectedVessels, port]);

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        style={{ height }}
      />
      
      {/* Layer Controls */}
      {showControls && showConnections && (
        <div className="absolute top-4 right-4 z-[1000] bg-background/90 backdrop-blur-sm rounded-lg shadow-lg border border-border p-3">
          <div className="space-y-2">
            <h4 className="text-sm font-medium mb-2">Map Layers</h4>
            
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input 
                type="checkbox" 
                checked={showRefineries}
                onChange={(e) => setShowRefineries(e.target.checked)}
                className="rounded border-border"
              />
              <span>Refineries ({connectedRefineries.length})</span>
            </label>
            
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input 
                type="checkbox" 
                checked={showVessels}
                onChange={(e) => setShowVessels(e.target.checked)}
                className="rounded border-border"
              />
              <span>Nearby Vessels ({nearbyVessels.length})</span>
            </label>
            
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input 
                type="checkbox" 
                checked={showConnectedVessels}
                onChange={(e) => setShowConnectedVessels(e.target.checked)}
                className="rounded border-border"
              />
              <span>Connected Vessels ({connectedVessels.length})</span>
            </label>
          </div>
          
          {loading && (
            <div className="mt-2 pt-2 border-t border-border">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <div className="animate-spin rounded-full h-3 w-3 border-t border-primary"></div>
                <span>Loading connections...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PortMap;