import { useState, useEffect, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  ZoomControl,
  useMap,
  CircleMarker
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Define missing types for MarkerClusterGroup
declare module 'leaflet' {
  interface MarkerClusterGroupOptions extends L.LayerOptions {
    maxClusterRadius?: number;
    spiderfyOnMaxZoom?: boolean;
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    disableClusteringAtZoom?: number;
    iconCreateFunction?: (cluster: MarkerCluster) => L.Icon | L.DivIcon;
    // Add other options as needed
  }
  
  interface MarkerCluster {
    getChildCount(): number;
    getAllChildMarkers(): L.Marker[];
    // Add other methods as needed
  }
  
  interface MarkerClusterGroupStatic {
    new(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
  }
  
  interface MarkerClusterGroup extends L.FeatureGroup {
    options: MarkerClusterGroupOptions;
    addLayer(layer: L.Layer): this;
    removeLayer(layer: L.Layer): this;
    clearLayers(): this;
    // Add other methods as needed
  }
  
  let MarkerClusterGroup: MarkerClusterGroupStatic;
  
  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
}
import { Vessel, Refinery, Port } from '@shared/schema';
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';
import { useMaritimeData } from '@/hooks/useMaritimeData';
import { Loader2, Ship, Factory, Anchor, Navigation, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Custom icons for map markers
const vesselIconUrl = '/assets/vessel-icon.svg';
const refineryIconUrl = '/assets/refinery-icon.svg';
const portIconUrl = '/assets/port-icon.svg';

// Create custom icon types
const createVesselIcon = (color: string = '#FF6F00') => L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5]
});

// Define vessel icon
const vesselIcon = (vesselType: string) => {
  let color = '#FF6F00'; // Default orange
  
  if (vesselType?.toLowerCase().includes('crude')) {
    color = '#e53935'; // Red for crude oil tankers
  } else if (vesselType?.toLowerCase().includes('lng')) {
    color = '#43a047'; // Green for LNG carriers
  } else if (vesselType?.toLowerCase().includes('lpg')) {
    color = '#ffb300'; // Amber for LPG carriers
  } else if (vesselType?.toLowerCase().includes('product')) {
    color = '#1e88e5'; // Blue for product tankers
  } else if (vesselType?.toLowerCase().includes('chemical')) {
    color = '#8e24aa'; // Purple for chemical tankers
  }
  
  return {
    color,
    fillColor: color,
    fillOpacity: 0.8,
    weight: 2,
    radius: 6
  };
};

// Define different map styles
const MAP_STYLES = {
  standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  nautical: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png'
};

// Define map tile attribution
const ATTRIBUTIONS = {
  standard: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  dark: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  light: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  satellite: '&copy; <a href="https://www.arcgis.com/">Esri</a>',
  nautical: '&copy; <a href="https://www.openseamap.org/">OpenSeaMap</a> contributors'
};

// Component to update map center
const SetViewOnRegionChange = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Create marker clusters component
function MarkerCluster({ vessels }: { vessels: Vessel[] }) {
  const map = useMap();
  const clusterGroupRef = useRef<any>(null);
  
  useEffect(() => {
    // Initialize or clear marker cluster group
    if (!clusterGroupRef.current) {
      // @ts-ignore: MarkerClusterGroup is not in the type definitions
      clusterGroupRef.current = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 15,
        iconCreateFunction: (cluster) => {
          const childCount = cluster.getChildCount();
          
          // Calculate size based on number of points
          let size = 'small';
          if (childCount > 100) {
            size = 'large';
          } else if (childCount > 30) {
            size = 'medium';
          }
          
          // Custom cluster style
          return L.divIcon({
            html: `<div class="custom-cluster-icon ${size}">
                     <span>${childCount}</span>
                   </div>`,
            className: `custom-cluster ${size}`,
            iconSize: L.point(40, 40)
          });
        }
      });
      
      // Add CSS style for clusters in head
      const style = document.createElement('style');
      style.textContent = `
        .custom-cluster-icon {
          background-color: rgba(0, 51, 102, 0.8);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #FF6F00;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
          font-weight: bold;
          font-family: sans-serif;
        }
        .custom-cluster-icon.small {
          width: 30px;
          height: 30px;
          font-size: 12px;
        }
        .custom-cluster-icon.medium {
          width: 40px;
          height: 40px;
          font-size: 14px;
        }
        .custom-cluster-icon.large {
          width: 50px;
          height: 50px;
          font-size: 16px;
        }
      `;
      document.head.appendChild(style);
      
      // Add to map
      map.addLayer(clusterGroupRef.current);
    } else {
      clusterGroupRef.current.clearLayers();
    }
    
    // Add vessel markers to cluster group
    vessels.forEach(vessel => {
      if (vessel.currentLat && vessel.currentLng) {
        try {
          const lat = parseFloat(String(vessel.currentLat));
          const lng = parseFloat(String(vessel.currentLng));
          
          if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return;
          }
          
          // Get vessel type color
          let markerColor = '#FF6F00'; // Default orange
          
          if (vessel.vesselType?.toLowerCase().includes('crude')) {
            markerColor = '#e53935'; // Red for crude oil tankers
          } else if (vessel.vesselType?.toLowerCase().includes('lng')) {
            markerColor = '#43a047'; // Green for LNG carriers
          } else if (vessel.vesselType?.toLowerCase().includes('lpg')) {
            markerColor = '#ffb300'; // Amber for LPG carriers
          } else if (vessel.vesselType?.toLowerCase().includes('product')) {
            markerColor = '#1e88e5'; // Blue for product tankers
          } else if (vessel.vesselType?.toLowerCase().includes('chemical')) {
            markerColor = '#8e24aa'; // Purple for chemical tankers
          }
          
          // Create custom vessel icon
          const icon = createVesselIcon(markerColor);
          
          // Create and add marker to cluster
          const marker = L.marker([lat, lng], { icon });
          
          // Create popup content
          const popupContent = document.createElement('div');
          popupContent.className = 'p-2 max-w-[250px]';
          popupContent.innerHTML = `
            <h3 class="font-bold text-sm">${vessel.name}</h3>
            <p class="text-xs text-muted-foreground">${vessel.vesselType || 'Unknown vessel type'}</p>
            <div class="mt-2 text-xs">
              <p>IMO: ${vessel.imo || 'N/A'}</p>
              <p>Flag: ${vessel.flag || 'N/A'}</p>
              <p>Deadweight: ${vessel.deadweight ? `${vessel.deadweight.toLocaleString()} tons` : 'N/A'}</p>
            </div>
            <button 
              class="mt-2 w-full text-xs px-2 py-1 bg-blue-600 text-white rounded flex items-center justify-center gap-1" 
              onclick="window.location.href='/vessels/${vessel.id}'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 9V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9"/>
                <path d="M9 3 C9 3 9 15 12 15 S15 3 15 3"/>
                <path d="M5 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4a1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 0-1-1H8a1 1 0 0 0-1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1z"/>
              </svg>
              View Details
            </button>
          `;
          
          marker.bindPopup(popupContent);
          clusterGroupRef.current?.addLayer(marker);
        } catch (err) {
          console.error('Error creating vessel marker:', err);
        }
      }
    });
    
    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
    };
  }, [vessels, map]);
  
  return null;
}

function RefineryMarkers({ refineries }: { refineries: Refinery[] }) {
  const map = useMap();
  const refineryClusterRef = useRef<any>(null);
  
  useEffect(() => {
    // Initialize refinery cluster group if needed
    if (!refineryClusterRef.current) {
      // @ts-ignore: MarkerClusterGroup is not in the type definitions
      refineryClusterRef.current = L.markerClusterGroup({
        maxClusterRadius: 80,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 10,
        iconCreateFunction: (cluster) => {
          const childCount = cluster.getChildCount();
          
          return L.divIcon({
            html: `<div class="refinery-cluster-icon">
                     <span>${childCount}</span>
                   </div>`,
            className: 'refinery-cluster',
            iconSize: L.point(40, 40)
          });
        }
      });
      
      // Add CSS for refinery clusters
      const style = document.createElement('style');
      style.textContent = `
        .refinery-cluster-icon {
          background-color: rgba(211, 47, 47, 0.8);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ff9800;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
          font-weight: bold;
          font-family: sans-serif;
          width: 36px;
          height: 36px;
          font-size: 14px;
        }
      `;
      document.head.appendChild(style);
      
      // Add to map
      map.addLayer(refineryClusterRef.current);
    } else {
      refineryClusterRef.current.clearLayers();
    }
    
    // Create a custom refinery icon
    const refineryIcon = L.divIcon({
      className: 'custom-refinery-icon',
      html: `<div style="background-color: #d32f2f; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);">
              <div style="position: absolute; bottom: -3px; right: -3px; width: 6px; height: 6px; background-color: #ff5722; border-radius: 50%; border: 1px solid white;"></div>
            </div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    
    // Add refineries to cluster group
    refineries.forEach(refinery => {
      if (refinery.lat && refinery.lng) {
        try {
          const lat = parseFloat(String(refinery.lat));
          const lng = parseFloat(String(refinery.lng));
          
          if (isNaN(lat) || isNaN(lng)) return;
          
          // Create marker with custom icon
          const marker = L.marker([lat, lng], { icon: refineryIcon });
          
          // Create popup content
          const content = document.createElement('div');
          content.className = 'p-3 max-w-[280px]';
          content.innerHTML = `
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 flex-shrink-0 rounded-full bg-red-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 8V4"/>
                  <path d="M15 4v4"/>
                  <path d="M11 4v4"/>
                  <path d="M7 4v4"/>
                  <path d="M20 12 H4c0 0 0 8 8 8s8-8 8-8z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-sm">${refinery.name}</h3>
                <p class="text-xs text-muted-foreground">${refinery.country}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-y-1 gap-x-3 mt-3 text-xs">
              <div class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                  <path d="M2 12h20"/>
                </svg>
                <span>Region:</span>
              </div>
              <div>${refinery.region}</div>
              
              <div class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 9v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9M6 9V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4M6 9h12"/>
                </svg>
                <span>Capacity:</span>
              </div>
              <div>${refinery.capacity ? `${Math.round(refinery.capacity / 1000)}k bpd` : 'N/A'}</div>
              
              <div class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4l3 3"/>
                </svg>
                <span>Status:</span>
              </div>
              <div>${refinery.status || 'Active'}</div>
            </div>
            <button 
              class="mt-3 w-full text-xs px-2 py-1.5 bg-red-600 text-white rounded flex items-center justify-center gap-1 hover:bg-red-700 transition-colors" 
              onclick="window.location.href='/refineries/${refinery.id}'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 8h2a2 2 0 0 1 2 2v2m-1.5 6.5L12 18l-1-5-5-1 14.5-7.5"/>
              </svg>
              View Details
            </button>
          `;
          
          marker.bindPopup(content);
          refineryClusterRef.current?.addLayer(marker);
        } catch (err) {
          console.error('Error creating refinery marker:', err);
        }
      }
    });
    
    return () => {
      if (refineryClusterRef.current) {
        map.removeLayer(refineryClusterRef.current);
        refineryClusterRef.current = null;
      }
    };
  }, [refineries, map]);
  
  return null;
}

function PortMarkers({ ports }: { ports: Port[] }) {
  const map = useMap();
  const portClusterRef = useRef<any>(null);
  
  useEffect(() => {
    // Initialize port cluster group if needed
    if (!portClusterRef.current) {
      // @ts-ignore: MarkerClusterGroup is not in the type definitions
      portClusterRef.current = L.markerClusterGroup({
        maxClusterRadius: 80,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 10,
        iconCreateFunction: (cluster) => {
          const childCount = cluster.getChildCount();
          
          return L.divIcon({
            html: `<div class="port-cluster-icon">
                     <span>${childCount}</span>
                   </div>`,
            className: 'port-cluster',
            iconSize: L.point(40, 40)
          });
        }
      });
      
      // Add CSS for port clusters
      const style = document.createElement('style');
      style.textContent = `
        .port-cluster-icon {
          background-color: rgba(2, 119, 189, 0.8);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #00bcd4;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
          font-weight: bold;
          font-family: sans-serif;
          width: 36px;
          height: 36px;
          font-size: 14px;
        }
      `;
      document.head.appendChild(style);
      
      // Add to map
      map.addLayer(portClusterRef.current);
    } else {
      portClusterRef.current.clearLayers();
    }
    
    // Create a custom port icon
    const portIcon = L.divIcon({
      className: 'custom-port-icon',
      html: `<div style="background-color: #0277bd; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);">
              <div style="position: absolute; bottom: -2px; right: -2px; width: 5px; height: 5px; background-color: #00bcd4; border-radius: 50%; border: 1px solid white;"></div>
            </div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
    
    // Add ports to cluster group
    ports.forEach(port => {
      if (port.lat && port.lng) {
        try {
          const lat = parseFloat(String(port.lat));
          const lng = parseFloat(String(port.lng));
          
          if (isNaN(lat) || isNaN(lng)) return;
          
          // Create marker with custom icon
          const marker = L.marker([lat, lng], { icon: portIcon });
          
          // Create popup content
          const content = document.createElement('div');
          content.className = 'p-3 max-w-[280px]';
          content.innerHTML = `
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 flex-shrink-0 rounded-full bg-blue-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 4V1m0 3L8 7m4-4l4 4"/>
                  <path d="M2 22h20"/>
                  <path d="M3 11c0 5 3 10 11 10s7-5 7-10"/>
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-sm">${port.name}</h3>
                <p class="text-xs text-muted-foreground">${port.country}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-y-1 gap-x-3 mt-3 text-xs">
              <div class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20a14.5 14.5 0 0 0 0-20"/>
                  <path d="M2 12h20"/>
                </svg>
                <span>Region:</span>
              </div>
              <div>${port.region}</div>
              
              <div class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9h18M9 20H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3h-3"/>
                  <path d="M16 20h2"/>
                  <path d="M12 20h2"/>
                </svg>
                <span>Type:</span>
              </div>
              <div>${port.type || 'Standard'}</div>
            </div>
            <button 
              class="mt-3 w-full text-xs px-2 py-1.5 bg-blue-600 text-white rounded flex items-center justify-center gap-1 hover:bg-blue-700 transition-colors" 
              onclick="window.location.href='/ports/${port.id}'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 9h.01M9 9h.01M15 15h.01M9 15h.01M9 3h6l2 2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2-2Z"/>
              </svg>
              View Details
            </button>
          `;
          
          marker.bindPopup(content);
          portClusterRef.current?.addLayer(marker);
        } catch (err) {
          console.error('Error creating port marker:', err);
        }
      }
    });
    
    return () => {
      if (portClusterRef.current) {
        map.removeLayer(portClusterRef.current);
        portClusterRef.current = null;
      }
    };
  }, [ports, map]);
  
  return null;
}

// Map Layers control component
function MapLayers({ mapStyle }: { mapStyle: string }) {
  const map = useMap();
  
  useEffect(() => {
    // Remove current tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });
    
    // Add selected style tile layer
    const url = MAP_STYLES[mapStyle as keyof typeof MAP_STYLES] || MAP_STYLES.standard;
    const attribution = ATTRIBUTIONS[mapStyle as keyof typeof ATTRIBUTIONS] || ATTRIBUTIONS.standard;
    L.tileLayer(url, {
      attribution,
      maxZoom: 19
    }).addTo(map);
    
    // Add nautical layer if style is nautical
    if (mapStyle === 'nautical') {
      L.tileLayer(MAP_STYLES.standard, {
        attribution: ATTRIBUTIONS.standard,
        maxZoom: 19
      }).addTo(map);
      
      L.tileLayer(MAP_STYLES.nautical, {
        attribution: ATTRIBUTIONS.nautical,
        maxZoom: 19
      }).addTo(map);
    }
  }, [mapStyle, map]);
  
  return null;
}

// Main Leaflet Map component
interface LeafletMapProps {
  initialRegion?: string;
  height?: string;
  showRoutes?: boolean;
  showVesselHistory?: boolean;
  showHeatmap?: boolean;
  mapStyle?: 'standard' | 'dark' | 'light' | 'satellite' | 'nautical';
  filterVesselTypes?: boolean;
  vessels?: any[]; // Add vessels data from parent component
}

type VesselTypeFilter = {
  type: string;
  label: string;
  color: string;
  enabled: boolean;
};

export default function LeafletMap({
  initialRegion = 'global',
  height = '600px',
  showRoutes = false,
  showVesselHistory = false,
  showHeatmap = false,
  mapStyle: initialMapStyle = 'standard',
  filterVesselTypes = true
}: LeafletMapProps) {
  // State
  const [mapStyle, setMapStyle] = useState(initialMapStyle);
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [center, setCenter] = useState<[number, number]>([20, 0]);
  const [zoom, setZoom] = useState(2);
  const [vesselTypeFilters, setVesselTypeFilters] = useState<VesselTypeFilter[]>([
    { type: 'crude', label: 'Crude Oil', color: '#e53935', enabled: true },
    { type: 'product', label: 'Product', color: '#1e88e5', enabled: true },
    { type: 'lng', label: 'LNG', color: '#43a047', enabled: true },
    { type: 'lpg', label: 'LPG', color: '#ffb300', enabled: true },
    { type: 'chemical', label: 'Chemical', color: '#8e24aa', enabled: true },
    { type: 'other', label: 'Other', color: '#FF6F00', enabled: true }
  ]);
  
  // Get vessel data from WebSocket
  const { 
    vessels: allVessels, 
    connected, 
    lastUpdated, 
    loading: vesselsLoading 
  } = useVesselWebSocket({
    region: selectedRegion,
    loadAllVessels: true
  });
  
  // Filter vessels based on selected vessel types
  const vessels = allVessels.filter(vessel => {
    if (!vessel.vesselType) return vesselTypeFilters.find(f => f.type === 'other')?.enabled || false;
    
    const vesselTypeLC = vessel.vesselType.toLowerCase();
    
    for (const filter of vesselTypeFilters) {
      if (filter.type === 'other') continue;
      if (vesselTypeLC.includes(filter.type) && filter.enabled) return true;
    }
    
    // If no specific type matches, it's considered "other"
    return vesselTypeFilters.find(f => f.type === 'other')?.enabled || false;
  });

  // Get maritime infrastructure data
  const { 
    refineries, 
    ports, 
    loading: infrastructureLoading 
  } = useMaritimeData({ 
    region: selectedRegion 
  });
  
  // Set center based on region
  useEffect(() => {
    switch (selectedRegion) {
      case 'middle_east':
        setCenter([25, 50]);
        setZoom(5);
        break;
      case 'north_america':
        setCenter([40, -100]);
        setZoom(4);
        break;
      case 'europe':
        setCenter([50, 10]);
        setZoom(4);
        break;
      case 'southeast_asia':
        setCenter([5, 115]);
        setZoom(4);
        break;
      case 'east_asia':
        setCenter([30, 120]);
        setZoom(4);
        break;
      case 'africa':
        setCenter([0, 20]);
        setZoom(3);
        break;
      case 'oceania':
        setCenter([-25, 135]);
        setZoom(4);
        break;
      case 'south_america':
        setCenter([-20, -60]);
        setZoom(3);
        break;
      default:
        setCenter([20, 0]);
        setZoom(2);
    }
  }, [selectedRegion]);
  
  // Update selected region when initialRegion changes
  useEffect(() => {
    setSelectedRegion(initialRegion);
  }, [initialRegion]);

  // Update map style when initialMapStyle changes
  useEffect(() => {
    setMapStyle(initialMapStyle);
  }, [initialMapStyle]);
  
  // Loading state
  const isLoading = vesselsLoading || infrastructureLoading;

  return (
    <div className="relative w-full" style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-[1000] backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4 p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-sm font-medium">Loading maritime data...</div>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        <Card className="w-[280px] bg-background/90 backdrop-blur-sm">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Region Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'global', name: 'Global' },
                { id: 'middle_east', name: 'Middle East' },
                { id: 'europe', name: 'Europe' },
                { id: 'north_america', name: 'North America' },
                { id: 'east_asia', name: 'East Asia' },
                { id: 'southeast_asia', name: 'Southeast Asia' },
                { id: 'south_america', name: 'South America' },
                { id: 'africa', name: 'Africa' },
                { id: 'oceania', name: 'Oceania' }
              ].map(region => (
                <Button
                  key={region.id}
                  variant={selectedRegion === region.id ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => setSelectedRegion(region.id)}
                >
                  {region.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-[280px] bg-background/90 backdrop-blur-sm">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm flex items-center">
              <Navigation className="h-4 w-4 mr-2" />
              Map Style
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <Tabs value={mapStyle} onValueChange={(v) => setMapStyle(v as any)}>
              <TabsList className="w-full grid grid-cols-5 h-8">
                <TabsTrigger value="standard" className="text-xs">
                  Standard
                </TabsTrigger>
                <TabsTrigger value="dark" className="text-xs">
                  Dark
                </TabsTrigger>
                <TabsTrigger value="light" className="text-xs">
                  Light
                </TabsTrigger>
                <TabsTrigger value="satellite" className="text-xs">
                  Satellite
                </TabsTrigger>
                <TabsTrigger value="nautical" className="text-xs">
                  Nautical
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Vessel Type Filters */}
        {filterVesselTypes && (
          <Card className="w-[280px] bg-background/90 backdrop-blur-sm">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center">
                <Ship className="h-4 w-4 mr-2" />
                Vessel Types
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-2 gap-2">
                {vesselTypeFilters.map((filter) => (
                  <div 
                    key={filter.type}
                    className="flex items-center gap-2 text-xs"
                    onClick={() => {
                      setVesselTypeFilters(filters => 
                        filters.map(f => 
                          f.type === filter.type 
                            ? { ...f, enabled: !f.enabled } 
                            : f
                        )
                      );
                    }}
                  >
                    <div 
                      className={`w-4 h-4 rounded cursor-pointer flex items-center justify-center ${filter.enabled ? 'bg-primary' : 'bg-muted'}`}
                      style={{ 
                        backgroundColor: filter.enabled ? filter.color : undefined,
                        borderColor: filter.color,
                        borderWidth: filter.enabled ? 0 : 1,
                        borderStyle: 'solid'
                      }}
                    >
                      {filter.enabled && (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="10" 
                          height="10" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="white" 
                          strokeWidth="3"
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <label className="cursor-pointer">{filter.label}</label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Stats */}
        <Card className="w-[280px] bg-background/90 backdrop-blur-sm">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-center">
              <Ship className="h-4 w-4 mr-2" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="flex flex-col items-center bg-primary/10 rounded p-2">
                <span className="text-xs text-muted-foreground">Vessels</span>
                <span className="text-sm font-bold">{vessels.length}</span>
              </div>
              <div className="flex flex-col items-center bg-red-500/10 rounded p-2">
                <span className="text-xs text-muted-foreground">Refineries</span>
                <span className="text-sm font-bold">{refineries.length}</span>
              </div>
              <div className="flex flex-col items-center bg-blue-500/10 rounded p-2">
                <span className="text-xs text-muted-foreground">Ports</span>
                <span className="text-sm font-bold">{ports.length}</span>
              </div>
            </div>
            
            {/* Vessel type breakdown */}
            <div className="text-xs text-muted-foreground mb-1">Vessel Types:</div>
            <div className="space-y-1">
              {vesselTypeFilters.map(filter => {
                // Count vessels by type
                const count = allVessels.filter(vessel => {
                  if (!vessel.vesselType && filter.type === 'other') return true;
                  if (!vessel.vesselType) return false;
                  
                  const vesselTypeLC = vessel.vesselType.toLowerCase();
                  if (filter.type === 'other') {
                    // Count as "other" if doesn't match any specific filter
                    return !vesselTypeFilters
                      .filter(f => f.type !== 'other')
                      .some(f => vesselTypeLC.includes(f.type));
                  }
                  
                  return vesselTypeLC.includes(filter.type);
                }).length;
                
                // Skip if no vessels of this type
                if (count === 0) return null;
                
                return (
                  <div key={filter.type} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: filter.color }}
                    />
                    <div className="flex-1 flex justify-between">
                      <span>{filter.label}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        className="z-10"
      >
        <ZoomControl position="topleft" />
        <TileLayer
          attribution={ATTRIBUTIONS.standard}
          url={MAP_STYLES.standard}
        />
        <SetViewOnRegionChange center={center} zoom={zoom} />
        <MapLayers mapStyle={mapStyle} />
        <MarkerCluster vessels={vessels} />
        <RefineryMarkers refineries={refineries} />
        <PortMarkers ports={ports} />
      </MapContainer>

      {/* Connection Status */}
      <div className="absolute bottom-3 left-3 z-[1000]">
        <Badge 
          variant={connected ? "outline" : "destructive"} 
          className={connected 
            ? "bg-green-50 text-green-700 border-green-200" 
            : ""
          }
        >
          {connected ? "Connected" : "Connecting..."}
        </Badge>
        
        {lastUpdated && (
          <div className="text-xs text-white bg-black/40 backdrop-blur-sm rounded px-2 py-1 mt-1">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}