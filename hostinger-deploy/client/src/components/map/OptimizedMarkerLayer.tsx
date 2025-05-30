import React, { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { Vessel, Refinery, Port } from '@shared/schema';
import { useMap } from 'react-leaflet';
import 'leaflet.markercluster';
import { cn } from '@/lib/utils';

// Import custom marker icons
import vesselIcon from '@/assets/vessel-icon.svg';
import refineryIcon from '@/assets/refinery-icon.svg';
import portIcon from '@/assets/port-icon.svg';

// Define fallback icons if custom icons fail to load
const fallbackVesselIcon = L.divIcon({
  className: 'custom-vessel-marker',
  html: '<div class="w-4 h-4 rounded-full bg-primary border-2 border-white"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const fallbackRefineryIcon = L.divIcon({
  className: 'custom-refinery-marker',
  html: '<div class="w-5 h-5 rounded-full bg-destructive border-2 border-white"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const fallbackPortIcon = L.divIcon({
  className: 'custom-port-marker',
  html: '<div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Custom vessel icon based on vessel type
const getVesselIcon = (vessel: Vessel) => {
  const vesselType = vessel.vesselType?.toLowerCase() || '';
  let color = 'bg-primary';
  
  if (vesselType.includes('crude')) {
    color = 'bg-red-500';
  } else if (vesselType.includes('product')) {
    color = 'bg-blue-500';
  } else if (vesselType.includes('lng')) {
    color = 'bg-green-500';
  } else if (vesselType.includes('lpg')) {
    color = 'bg-amber-500';
  } else if (vesselType.includes('chemical')) {
    color = 'bg-purple-500';
  }
  
  return L.divIcon({
    className: 'custom-vessel-marker',
    html: `<div class="w-4 h-4 rounded-full ${color} border-2 border-white"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

// Custom popup content for vessels
const createVesselPopupContent = (vessel: Vessel) => {
  let metadata = {
    mmsi: vessel.mmsi,
    imo: vessel.imo,
    heading: 0,
    course: 0,
    speed: 0,
    status: 'Unknown',
  };
  
  try {
    if (vessel.metadata) {
      const parsedMetadata = JSON.parse(vessel.metadata);
      metadata = { ...metadata, ...parsedMetadata };
    }
  } catch (e) {
    console.error('Failed to parse vessel metadata:', e);
  }
  
  return `
    <div class="px-1 py-2">
      <div class="font-bold text-sm mb-1">${vessel.name || 'Unknown vessel'}</div>
      <div class="text-xs text-muted-foreground">${vessel.vesselType || 'Unknown type'}</div>
      <div class="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-xs">
        <div class="font-medium">IMO:</div>
        <div>${vessel.imo || 'N/A'}</div>
        <div class="font-medium">MMSI:</div>
        <div>${vessel.mmsi || 'N/A'}</div>
        <div class="font-medium">Flag:</div>
        <div>${vessel.flag || 'N/A'}</div>
        <div class="font-medium">Speed:</div>
        <div>${metadata.speed} knots</div>
      </div>
    </div>
  `;
};

// Custom popup content for refineries
const createRefineryPopupContent = (refinery: Refinery) => {
  return `
    <div class="px-1 py-2">
      <div class="font-bold text-sm mb-1">${refinery.name || 'Unknown refinery'}</div>
      <div class="text-xs text-muted-foreground">${refinery.country || 'Unknown location'}</div>
      <div class="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-xs">
        <div class="font-medium">Operator:</div>
        <div>${refinery.operator || 'N/A'}</div>
        <div class="font-medium">Capacity:</div>
        <div>${refinery.capacity ? `${refinery.capacity.toLocaleString()} bpd` : 'N/A'}</div>
        <div class="font-medium">Status:</div>
        <div>${refinery.status || 'Unknown'}</div>
      </div>
    </div>
  `;
};

// Custom popup content for ports
const createPortPopupContent = (port: Port) => {
  return `
    <div class="px-1 py-2">
      <div class="font-bold text-sm mb-1">${port.name || 'Unknown port'}</div>
      <div class="text-xs text-muted-foreground">${port.country || 'Unknown location'}</div>
      <div class="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-xs">
        <div class="font-medium">Type:</div>
        <div>${port.type || 'N/A'}</div>
        <div class="font-medium">Status:</div>
        <div>${port.status || 'Unknown'}</div>
      </div>
    </div>
  `;
};

// Component for vessel markers with clustering
export const OptimizedVesselLayer: React.FC<{
  vessels: Vessel[];
  onVesselSelect: (vessel: Vessel) => void;
  vesselsWithRoutes: Record<number, boolean>;
  setVesselsWithRoutes: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
}> = ({ vessels, onVesselSelect, vesselsWithRoutes, setVesselsWithRoutes }) => {
  const map = useMap();
  const markerClusterGroup = useRef<L.MarkerClusterGroup | null>(null);
  const vesselMarkers = useRef<Record<number, L.Marker>>({});
  const routeLines = useRef<Record<number, L.Polyline>>({});
  
  // Configure clustering options
  const clusterOptions = {
    disableClusteringAtZoom: 8,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    maxClusterRadius: 50,
    iconCreateFunction: (cluster: L.MarkerCluster) => {
      const count = cluster.getChildCount();
      const size = count < 10 ? 'w-8 h-8' : count < 100 ? 'w-9 h-9' : 'w-10 h-10';
      const fontSize = count < 10 ? 'text-xs' : count < 100 ? 'text-sm' : 'text-base';
      
      return L.divIcon({
        html: `<div class="${size} flex items-center justify-center rounded-full bg-primary text-white font-bold ${fontSize} shadow-md">${count}</div>`,
        className: 'vessel-cluster',
        iconSize: L.point(40, 40),
        iconAnchor: L.point(20, 20)
      });
    }
  };
  
  // Create or update marker cluster group
  useEffect(() => {
    if (!map) return;
    
    // Create new cluster group if not exists
    if (!markerClusterGroup.current) {
      markerClusterGroup.current = L.markerClusterGroup(clusterOptions);
      map.addLayer(markerClusterGroup.current);
    }
    
    return () => {
      if (markerClusterGroup.current) {
        map.removeLayer(markerClusterGroup.current);
        markerClusterGroup.current = null;
      }
    };
  }, [map]);
  
  // Handle vessel route display
  useEffect(() => {
    if (!map) return;
    
    // Add or remove route lines based on vesselsWithRoutes state
    Object.entries(vesselsWithRoutes).forEach(([vesselIdStr, showRoute]) => {
      const vesselId = parseInt(vesselIdStr);
      const vessel = vessels.find(v => v.id === vesselId);
      
      if (!vessel) return;
      
      // Remove existing route line if present
      if (routeLines.current[vesselId]) {
        map.removeLayer(routeLines.current[vesselId]);
        delete routeLines.current[vesselId];
      }
      
      // Create new route line if showing route
      if (showRoute && vessel.currentLat && vessel.currentLng && vessel.destinationLat && vessel.destinationLng) {
        // Parse coordinates safely
        const parseLat = (lat: any): number => {
          return typeof lat === 'number' ? lat : parseFloat(String(lat));
        };
        
        const parseLng = (lng: any): number => {
          return typeof lng === 'number' ? lng : parseFloat(String(lng));
        };
        
        const startLatLng = L.latLng(parseLat(vessel.currentLat), parseLng(vessel.currentLng));
        const endLatLng = L.latLng(parseLat(vessel.destinationLat), parseLng(vessel.destinationLng));
        
        // Generate intermediate waypoints for a curved path
        const waypoints = [startLatLng];
        const midPoint = L.latLng(
          (startLatLng.lat + endLatLng.lat) / 2,
          (startLatLng.lng + endLatLng.lng) / 2
        );
        
        // Add slight offset to mid point for curved appearance
        const latOffset = (endLatLng.lat - startLatLng.lat) * 0.2;
        const lngOffset = (endLatLng.lng - startLatLng.lng) * 0.2;
        const curvedMidPoint = L.latLng(
          midPoint.lat + latOffset,
          midPoint.lng + lngOffset
        );
        
        waypoints.push(curvedMidPoint);
        waypoints.push(endLatLng);
        
        // Create and add polyline
        const routeLine = L.polyline(waypoints, {
          color: '#FF6F00',
          weight: 2,
          opacity: 0.7,
          dashArray: '5, 5',
          smoothFactor: 1
        });
        
        map.addLayer(routeLine);
        routeLines.current[vesselId] = routeLine;
      }
    });
    
    return () => {
      // Clean up all route lines
      Object.values(routeLines.current).forEach(line => {
        map.removeLayer(line);
      });
      routeLines.current = {};
    };
  }, [map, vessels, vesselsWithRoutes]);
  
  // Update vessel markers when vessels change
  useEffect(() => {
    console.log('OptimizedVesselLayer received vessels:', vessels ? vessels.length : 0);
    
    if (!map || !markerClusterGroup.current) {
      console.warn('Map or marker cluster group not initialized');
      return;
    }
    
    // Clear existing markers
    markerClusterGroup.current.clearLayers();
    vesselMarkers.current = {};
    
    // Check if we have vessels
    if (!vessels || vessels.length === 0) {
      console.warn('No vessels provided to OptimizedVesselLayer');
      return;
    }
    
    // Log sample vessel for debugging coordinate format
    if (vessels.length > 0) {
      const sample = vessels[0];
      console.log('Sample vessel for debugging:', {
        id: sample.id,
        name: sample.name,
        currentLat: sample.currentLat,
        currentLng: sample.currentLng,
        latType: typeof sample.currentLat,
        lngType: typeof sample.currentLng
      });
    }
    
    console.log('Adding vessel markers to map...');
    
    // Add markers for all vessels
    let validCount = 0;
    let invalidCount = 0;
    let coordinateErrors = 0;
    
    vessels.forEach(vessel => {
      try {
        // Check if coordinates exist
        if (vessel.currentLat === null || vessel.currentLat === undefined || 
            vessel.currentLng === null || vessel.currentLng === undefined) {
          console.warn(`Vessel ${vessel.id} (${vessel.name}) has null/undefined coordinates`);
          invalidCount++;
          return;
        }
        
        // Try to parse coordinates as numbers (they might be stored as strings)
        let lat: number, lng: number;
        
        try {
          // Enhanced parsing to handle both number and string types safely
          if (vessel.currentLat === null || vessel.currentLng === null) {
            throw new Error("Null coordinates");
          }
          
          if (typeof vessel.currentLat === 'number') {
            lat = vessel.currentLat;
          } else {
            lat = parseFloat(String(vessel.currentLat));
          }
            
          if (typeof vessel.currentLng === 'number') {
            lng = vessel.currentLng;
          } else {
            lng = parseFloat(String(vessel.currentLng));
          }
          
          // Additional debugging
          console.log(`Vessel ${vessel.name} coordinates parsed: ${lat}, ${lng} (from ${typeof vessel.currentLat}: ${vessel.currentLat}, ${typeof vessel.currentLng}: ${vessel.currentLng})`);
        } catch (parseError) {
          console.warn(`Coordinate parsing error for vessel ${vessel.id} (${vessel.name}):`, parseError);
          coordinateErrors++;
          return;
        }
        
        // Check for NaN after parsing
        if (isNaN(lat) || isNaN(lng)) {
          console.warn(`Vessel ${vessel.id} (${vessel.name}) has NaN coordinates after parsing:`, {
            lat, lng, originalLat: vessel.currentLat, originalLng: vessel.currentLng
          });
          invalidCount++;
          return;
        }
        
        // Validate coordinates are in reasonable range
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          console.warn(`Vessel ${vessel.id} (${vessel.name}) has invalid coordinate range:`, {
            lat, lng
          });
          invalidCount++;
          return;
        }
        
        validCount++;
        
        // Create marker with custom icon
        const customIcon = getVesselIcon(vessel);
        const marker = L.marker([lat, lng], {
          icon: customIcon || fallbackVesselIcon,
          title: vessel.name || 'Unknown vessel'
        });
        
        // Add popup
        marker.bindPopup(createVesselPopupContent(vessel));
        
        // Add click handler
        marker.on('click', () => {
          onVesselSelect(vessel);
        });
        
        // Store reference and add to cluster group
        vesselMarkers.current[vessel.id] = marker;
        markerClusterGroup.current?.addLayer(marker);
      } catch (error) {
        console.error(`Error processing vessel ${vessel.id} (${vessel.name}):`, error);
        invalidCount++;
      }
    });
    
    console.log(`Added ${validCount} valid vessel markers to map. Skipped ${invalidCount} invalid vessels. Parse errors: ${coordinateErrors}`);
    console.log('Final marker count in cluster group:', 
      markerClusterGroup.current ? markerClusterGroup.current.getLayers().length : 0);
    
    return () => {
      // Clean up markers when component unmounts or vessels change
      if (markerClusterGroup.current) {
        markerClusterGroup.current.clearLayers();
      }
    };
  }, [map, vessels, onVesselSelect]);
  
  return null; // Using Leaflet's DOM manipulation instead of React rendering
};

// Component for refinery markers with clustering
export const OptimizedRefineryLayer: React.FC<{
  refineries: Refinery[];
  onRefinerySelect: (refinery: Refinery) => void;
}> = ({ refineries, onRefinerySelect }) => {
  const map = useMap();
  const markerClusterGroup = useRef<L.MarkerClusterGroup | null>(null);
  
  // Configure clustering options
  const clusterOptions = {
    disableClusteringAtZoom: 7, // Show individual refineries at higher zoom levels
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    maxClusterRadius: 80,
    iconCreateFunction: (cluster: L.MarkerCluster) => {
      const count = cluster.getChildCount();
      
      return L.divIcon({
        html: `<div class="w-10 h-10 flex items-center justify-center rounded-full bg-destructive text-white font-bold shadow-md">${count}</div>`,
        className: 'refinery-cluster',
        iconSize: L.point(40, 40),
        iconAnchor: L.point(20, 20)
      });
    }
  };
  
  // Create or update marker cluster group
  useEffect(() => {
    if (!map) return;
    
    // Create new cluster group if not exists
    if (!markerClusterGroup.current) {
      markerClusterGroup.current = L.markerClusterGroup(clusterOptions);
      map.addLayer(markerClusterGroup.current);
    }
    
    return () => {
      if (markerClusterGroup.current) {
        map.removeLayer(markerClusterGroup.current);
        markerClusterGroup.current = null;
      }
    };
  }, [map]);
  
  // Update refinery markers when refineries change
  useEffect(() => {
    if (!map || !markerClusterGroup.current) return;
    
    // Clear existing markers
    markerClusterGroup.current.clearLayers();
    
    // Add markers for all refineries
    refineries.forEach(refinery => {
      if (!refinery.lat || !refinery.lng) return;
      
      // Parse coordinates safely
      let lat: number, lng: number;
      
      try {
        if (typeof refinery.lat === 'number') {
          lat = refinery.lat;
        } else {
          lat = parseFloat(String(refinery.lat));
        }
          
        if (typeof refinery.lng === 'number') {
          lng = refinery.lng;
        } else {
          lng = parseFloat(String(refinery.lng));
        }
      } catch (error) {
        console.warn(`Error parsing refinery coordinates for ${refinery.name}:`, error);
        return;
      }
      
      if (isNaN(lat) || isNaN(lng)) {
        console.warn(`Invalid refinery coordinates for ${refinery.name}: ${lat}, ${lng}`);
        return;
      }
      
      // Validate coordinate range
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.warn(`Refinery ${refinery.name} has out-of-range coordinates: ${lat}, ${lng}`);
        return;
      }
      
      // Create marker with custom icon
      const refIcon = new L.Icon({
        iconUrl: new URL('@/assets/refinery-icon.svg', import.meta.url).href,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      });
      
      const marker = L.marker([lat, lng], {
        icon: refIcon || fallbackRefineryIcon,
        title: refinery.name || 'Unknown refinery'
      });
      
      // Add popup
      marker.bindPopup(createRefineryPopupContent(refinery));
      
      // Add click handler
      marker.on('click', () => {
        onRefinerySelect(refinery);
      });
      
      // Add to cluster group
      markerClusterGroup.current?.addLayer(marker);
    });
    
    return () => {
      // Clean up markers when component unmounts or refineries change
      if (markerClusterGroup.current) {
        markerClusterGroup.current.clearLayers();
      }
    };
  }, [map, refineries, onRefinerySelect]);
  
  return null; // Using Leaflet's DOM manipulation instead of React rendering
};

// Component for port markers with clustering
export const OptimizedPortLayer: React.FC<{
  ports: Port[];
  onPortSelect: (port: Port) => void;
}> = ({ ports, onPortSelect }) => {
  const map = useMap();
  const markerClusterGroup = useRef<L.MarkerClusterGroup | null>(null);
  
  // Configure clustering options
  const clusterOptions = {
    disableClusteringAtZoom: 8, // Show individual ports at higher zoom levels
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    maxClusterRadius: 60,
    iconCreateFunction: (cluster: L.MarkerCluster) => {
      const count = cluster.getChildCount();
      
      return L.divIcon({
        html: `<div class="w-9 h-9 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold shadow-md">${count}</div>`,
        className: 'port-cluster',
        iconSize: L.point(36, 36),
        iconAnchor: L.point(18, 18)
      });
    }
  };
  
  // Create or update marker cluster group
  useEffect(() => {
    if (!map) return;
    
    // Create new cluster group if not exists
    if (!markerClusterGroup.current) {
      markerClusterGroup.current = L.markerClusterGroup(clusterOptions);
      map.addLayer(markerClusterGroup.current);
    }
    
    return () => {
      if (markerClusterGroup.current) {
        map.removeLayer(markerClusterGroup.current);
        markerClusterGroup.current = null;
      }
    };
  }, [map]);
  
  // Update port markers when ports change
  useEffect(() => {
    if (!map || !markerClusterGroup.current) return;
    
    // Clear existing markers
    markerClusterGroup.current.clearLayers();
    
    // Add markers for all ports
    ports.forEach(port => {
      if (!port.lat || !port.lng) return;
      
      // Parse coordinates safely
      let lat: number, lng: number;
      
      try {
        if (typeof port.lat === 'number') {
          lat = port.lat;
        } else {
          lat = parseFloat(String(port.lat));
        }
          
        if (typeof port.lng === 'number') {
          lng = port.lng;
        } else {
          lng = parseFloat(String(port.lng));
        }
      } catch (error) {
        console.warn(`Error parsing port coordinates for ${port.name}:`, error);
        return;
      }
      
      if (isNaN(lat) || isNaN(lng)) {
        console.warn(`Invalid port coordinates for ${port.name}: ${lat}, ${lng}`);
        return;
      }
      
      // Validate coordinate range
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.warn(`Port ${port.name} has out-of-range coordinates: ${lat}, ${lng}`);
        return;
      }
      
      // Create marker with custom icon
      const portIcon = new L.Icon({
        iconUrl: new URL('@/assets/port-icon.svg', import.meta.url).href,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
        className: `port-type-${port.type?.toLowerCase().replace(/\s+/g, '-') || 'default'}`
      });
      
      const marker = L.marker([lat, lng], {
        icon: portIcon || fallbackPortIcon,
        title: port.name || 'Unknown port'
      });
      
      // Add popup
      marker.bindPopup(createPortPopupContent(port));
      
      // Add click handler
      marker.on('click', () => {
        onPortSelect(port);
      });
      
      // Add to cluster group
      markerClusterGroup.current?.addLayer(marker);
    });
    
    return () => {
      // Clean up markers when component unmounts or ports change
      if (markerClusterGroup.current) {
        markerClusterGroup.current.clearLayers();
      }
    };
  }, [map, ports, onPortSelect]);
  
  return null; // Using Leaflet's DOM manipulation instead of React rendering
};