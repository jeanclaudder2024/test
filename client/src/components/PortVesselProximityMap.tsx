import { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PortVesselConnection } from '@/hooks/usePortVesselProximity';
import { Ship, Anchor } from 'lucide-react';

// Make Leaflet work with React in client-side environment
if (typeof window !== 'undefined') {
  // Fix icon paths in Leaflet CSS
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/marker-icon-2x.png',
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
  });
}

interface PortVesselProximityMapProps {
  connections: PortVesselConnection[];
  proximityRadius: number;
}

const VESSEL_COLORS = {
  oil: '#FF6B6B',
  lng: '#4ECDC4',
  container: '#118AB2',
  chemical: '#9A48D0',
  cargo: '#FFD166',
  default: '#6C757D',
};

const MAP_ATTRIBUTION = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export default function PortVesselProximityMap({
  connections,
  proximityRadius,
}: PortVesselProximityMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const connectionsLayerRef = useRef<L.LayerGroup | null>(null);
  const radiusCirclesRef = useRef<L.LayerGroup | null>(null);
  
  const [mapInitialized, setMapInitialized] = useState<boolean>(false);
  
  // Initialize map on component mount
  useEffect(() => {
    if (mapRef.current && !leafletMapRef.current) {
      // Create the Leaflet map
      const map = L.map(mapRef.current, {
        center: [25, 0], // Default center (will be adjusted based on data)
        zoom: 3,
        minZoom: 2,
        maxZoom: 18,
        layers: [
          // Base map layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: MAP_ATTRIBUTION,
          }),
        ],
      });
      
      // Create layers for markers, connections, and radius circles
      const markersLayer = L.layerGroup().addTo(map);
      const connectionsLayer = L.layerGroup().addTo(map);
      const radiusCirclesLayer = L.layerGroup().addTo(map);
      
      // Store references
      leafletMapRef.current = map;
      markersLayerRef.current = markersLayer;
      connectionsLayerRef.current = connectionsLayer;
      radiusCirclesRef.current = radiusCirclesLayer;
      
      setMapInitialized(true);
      
      // Cleanup on component unmount
      return () => {
        map.remove();
        leafletMapRef.current = null;
        markersLayerRef.current = null;
        connectionsLayerRef.current = null;
        radiusCirclesRef.current = null;
      };
    }
  }, []);
  
  // Update map when connections or radius changes
  useEffect(() => {
    const map = leafletMapRef.current;
    const markersLayer = markersLayerRef.current;
    const connectionsLayer = connectionsLayerRef.current;
    const radiusCirclesLayer = radiusCirclesRef.current;
    
    if (!map || !markersLayer || !connectionsLayer || !radiusCirclesLayer || !mapInitialized) {
      return;
    }
    
    // Clear existing data
    markersLayer.clearLayers();
    connectionsLayer.clearLayers();
    radiusCirclesLayer.clearLayers();
    
    if (connections.length === 0) {
      return;
    }
    
    // Track bounds to fit the map around the data
    const bounds = L.latLngBounds([]);
    
    // Create a Map to keep track of unique ports
    const uniquePorts = new Map<number, {
      id: number;
      name: string;
      type: string;
      coordinates: { lat: number; lng: number };
    }>();
    
    // Create a Map to keep track of unique vessels
    const uniqueVessels = new Map<number, {
      id: number;
      name: string;
      type: string;
      coordinates: { lat: number; lng: number };
    }>();
    
    // Add port and vessel markers, and draw connections
    connections.forEach(connection => {
      const portLatLng = L.latLng(
        connection.coordinates.port.lat,
        connection.coordinates.port.lng
      );
      
      const vesselLatLng = L.latLng(
        connection.coordinates.vessel.lat,
        connection.coordinates.vessel.lng
      );
      
      // Extend bounds
      bounds.extend(portLatLng);
      bounds.extend(vesselLatLng);
      
      // Store unique ports
      if (!uniquePorts.has(connection.portId)) {
        uniquePorts.set(connection.portId, {
          id: connection.portId,
          name: connection.portName,
          type: connection.portType,
          coordinates: connection.coordinates.port,
        });
      }
      
      // Store unique vessels
      if (!uniqueVessels.has(connection.vesselId)) {
        uniqueVessels.set(connection.vesselId, {
          id: connection.vesselId,
          name: connection.vesselName,
          type: connection.vesselType,
          coordinates: connection.coordinates.vessel,
        });
      }
      
      // Get color based on vessel type
      const vesselTypeLower = connection.vesselType.toLowerCase();
      let vesselColor = VESSEL_COLORS.default;
      
      if (vesselTypeLower.includes('oil') || vesselTypeLower.includes('tanker')) {
        vesselColor = VESSEL_COLORS.oil;
      } else if (vesselTypeLower.includes('lng')) {
        vesselColor = VESSEL_COLORS.lng;
      } else if (vesselTypeLower.includes('container')) {
        vesselColor = VESSEL_COLORS.container;
      } else if (vesselTypeLower.includes('chemical')) {
        vesselColor = VESSEL_COLORS.chemical;
      } else if (vesselTypeLower.includes('cargo')) {
        vesselColor = VESSEL_COLORS.cargo;
      }
      
      // Draw connection line
      const line = L.polyline([portLatLng, vesselLatLng], {
        color: vesselColor,
        weight: 2,
        opacity: 0.7,
        dashArray: '5, 5',
      }).addTo(connectionsLayer);
      
      // Add distance label
      const midpoint = L.latLng(
        (portLatLng.lat + vesselLatLng.lat) / 2,
        (portLatLng.lng + vesselLatLng.lng) / 2
      );
      
      L.marker(midpoint, {
        icon: L.divIcon({
          html: `<div class="bg-background/90 px-1.5 py-0.5 rounded-sm text-xs font-medium border border-border">
            ${connection.distance.toFixed(1)} km
          </div>`,
          className: 'distance-label',
          iconSize: L.point(50, 20),
          iconAnchor: L.point(25, 10),
        }),
      }).addTo(connectionsLayer);
    });
    
    // Add port markers
    uniquePorts.forEach(port => {
      const portIcon = L.divIcon({
        html: `<div class="bg-background border-2 border-primary rounded-full p-1 flex items-center justify-center">
          <div class="text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v7"></path><path d="m4.93 10.93 1.41 1.41"></path><path d="M2 18h2"></path><path d="M20 18h2"></path><path d="m19.07 10.93-1.41 1.41"></path><path d="M22 22H2"></path><path d="m16 6-4 4-4-4"></path><path d="M16 18a4 4 0 0 0-8 0"></path>
            </svg>
          </div>
        </div>`,
        className: 'port-marker',
        iconSize: L.point(28, 28),
        iconAnchor: L.point(14, 14),
      });
      
      const portLatLng = L.latLng(port.coordinates.lat, port.coordinates.lng);
      
      const portMarker = L.marker(portLatLng, { icon: portIcon })
        .addTo(markersLayer)
        .bindTooltip(`<div>
          <div class="font-medium">${port.name}</div>
          <div class="text-xs text-muted-foreground">${port.type} Port</div>
          <div class="text-xs text-primary mt-1">
            ${uniqueVessels.size} vessels within ${proximityRadius}km
          </div>
        </div>`, {
          offset: L.point(0, -20),
          direction: 'top',
          className: 'custom-tooltip',
        });
      
      // Add radius circle
      L.circle(portLatLng, {
        radius: proximityRadius * 1000, // Convert km to meters
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.05,
        weight: 1,
        dashArray: '4, 4',
      }).addTo(radiusCirclesLayer);
    });
    
    // Add vessel markers
    uniqueVessels.forEach(vessel => {
      const vesselLatLng = L.latLng(vessel.coordinates.lat, vessel.coordinates.lng);
      
      // Get color based on vessel type
      const vesselTypeLower = vessel.type.toLowerCase();
      let vesselColor = VESSEL_COLORS.default;
      
      if (vesselTypeLower.includes('oil') || vesselTypeLower.includes('tanker')) {
        vesselColor = VESSEL_COLORS.oil;
      } else if (vesselTypeLower.includes('lng')) {
        vesselColor = VESSEL_COLORS.lng;
      } else if (vesselTypeLower.includes('container')) {
        vesselColor = VESSEL_COLORS.container;
      } else if (vesselTypeLower.includes('chemical')) {
        vesselColor = VESSEL_COLORS.chemical;
      } else if (vesselTypeLower.includes('cargo')) {
        vesselColor = VESSEL_COLORS.cargo;
      }
      
      const vesselIcon = L.divIcon({
        html: `<div class="bg-background border-2 rounded-full p-1 flex items-center justify-center" style="border-color: ${vesselColor}">
          <div style="color: ${vesselColor}">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"></path><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"></path><path d="M12 10v4"></path><path d="M12 2v3"></path>
            </svg>
          </div>
        </div>`,
        className: 'vessel-marker',
        iconSize: L.point(24, 24),
        iconAnchor: L.point(12, 12),
      });
      
      L.marker(vesselLatLng, { icon: vesselIcon })
        .addTo(markersLayer)
        .bindTooltip(`<div>
          <div class="font-medium">${vessel.name}</div>
          <div class="text-xs text-muted-foreground">${vessel.type}</div>
        </div>`, {
          offset: L.point(0, -16),
          direction: 'top',
          className: 'custom-tooltip',
        });
    });
    
    // Adjust bounds if we have data
    if (connections.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [connections, proximityRadius, mapInitialized]);
  
  return (
    <div ref={mapRef} className="w-full h-full"></div>
  );
}