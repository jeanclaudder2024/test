import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type PortVesselConnection } from '@/hooks/usePortVesselProximity';

// Import marker icons to ensure they load correctly
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix leaflet marker icon issue
const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
  });
};

// Custom marker icons
const portIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1hbmNob3IiPjxjaXJjbGUgY3g9IjEyIiBjeT0iNSIgcj0iMyIvPjxsaW5lIHgxPSIxMiIgeTE9IjIyIiB4Mj0iMTIiIHkyPSI4Ii8+PHBhdGggZD0iTTUgMTJIOGMyLjIgMCA0LTEuOCA0LTR2MEMxMiAxMCAxMy44IDEyIDE2IDEyaDAiLz48bGluZSB4MT0iNSIgeTE9IjIyIiB4Mj0iMTkiIHkyPSIyMiIvPjwvc3ZnPg==',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const vesselIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjAwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1zaGlwIj48cGF0aCBkPSJNMiAyMGMyLjY2NC0xMC41NiA3LjMzLTE1LjQzNSAxMi0xNS45OTVhMzEuNzkyIDMxLjc5MiAwIDAgMSA4IC42My40MyA0IDAgMCAxLTQgNS44NjYiLz48cGF0aCBkPSJNNS43MDIgNmg4LjEyYTQgNCAwIDAgMSAzLjQxOCAxLjk1bDIuMyA0YTIgMiAwIDAgMSAxLjA0IDIuNzEzTDE4IDIyIi8+PHBhdGggZD0iTTIgMjBoMTYiLz48L3N2Zz4=',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

// Props for the map component
interface MapComponentProps {
  connections: PortVesselConnection[];
  proximityRadius?: number;
}

export default function MapComponent({ connections, proximityRadius = 10 }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const connectionLayersRef = useRef<{
    lines: (L.Polyline | L.Circle)[];
    markers: L.Marker[];
  }>({
    lines: [],
    markers: [],
  });

  // Initialize map on component mount
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      // Fix marker icons
      fixLeafletIcon();
      
      // Create map instance
      const map = L.map(mapContainerRef.current, {
        center: [20, 0], // Default center
        zoom: 2,
        minZoom: 2,
        maxZoom: 18,
      });
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      
      // Store map instance in ref
      mapRef.current = map;
      setIsMapReady(true);
      
      // Cleanup on unmount
      return () => {
        map.remove();
        mapRef.current = null;
      };
    }
  }, []);

  // Update map with connections when they change
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;
    
    const map = mapRef.current;
    
    // Clear existing connections
    connectionLayersRef.current.lines.forEach(line => line.remove());
    connectionLayersRef.current.markers.forEach(marker => marker.remove());
    connectionLayersRef.current.lines = [];
    connectionLayersRef.current.markers = [];
    
    // Skip if no connections
    if (connections.length === 0) return;
    
    // Prepare bounds for zooming
    const bounds = new L.LatLngBounds([]);
    const uniquePorts = new Map<number, PortVesselConnection>();
    const uniqueVessels = new Map<number, PortVesselConnection>();
    
    // Track unique ports and vessels
    connections.forEach(connection => {
      uniquePorts.set(connection.portId, connection);
      uniqueVessels.set(connection.vesselId, connection);
    });
    
    // Add port markers
    uniquePorts.forEach(connection => {
      const { lat, lng } = connection.coordinates.port;
      const portLatLng = new L.LatLng(Number(lat), Number(lng));
      
      // Add marker
      const marker = L.marker(portLatLng, { icon: portIcon })
        .addTo(map)
        .bindPopup(`
          <div class="text-center">
            <div class="font-bold">${connection.portName}</div>
            <div class="text-xs">${connection.portType}</div>
            <div class="mt-1 text-xs">
              ${connections.filter(c => c.portId === connection.portId).length} nearby vessels
            </div>
          </div>
        `);
      
      connectionLayersRef.current.markers.push(marker);
      bounds.extend(portLatLng);
    });
    
    // Add vessel markers
    uniqueVessels.forEach(connection => {
      const { lat, lng } = connection.coordinates.vessel;
      const vesselLatLng = new L.LatLng(Number(lat), Number(lng));
      
      // Add marker
      const marker = L.marker(vesselLatLng, { icon: vesselIcon })
        .addTo(map)
        .bindPopup(`
          <div class="text-center">
            <div class="font-bold">${connection.vesselName}</div>
            <div class="text-xs">${connection.vesselType}</div>
            <div class="mt-1 text-xs">
              Distance to port: ${connection.distance.toFixed(1)} km
            </div>
          </div>
        `);
      
      connectionLayersRef.current.markers.push(marker);
      bounds.extend(vesselLatLng);
    });
    
    // Add lines between connected vessels and ports
    connections.forEach(connection => {
      const portLatLng = new L.LatLng(
        Number(connection.coordinates.port.lat),
        Number(connection.coordinates.port.lng)
      );
      const vesselLatLng = new L.LatLng(
        Number(connection.coordinates.vessel.lat),
        Number(connection.coordinates.vessel.lng)
      );
      
      // Create line with dashed style
      const line = L.polyline([portLatLng, vesselLatLng], {
        color: '#0000ff',
        weight: 2,
        opacity: 0.6,
        dashArray: '5, 10',
      }).addTo(map);
      
      connectionLayersRef.current.lines.push(line);
    });
    
    // Add proximity circles around ports
    uniquePorts.forEach(connection => {
      const { lat, lng } = connection.coordinates.port;
      const portLatLng = new L.LatLng(Number(lat), Number(lng));
      
      // Create circle with the proximity radius
      const circle = L.circle(portLatLng, {
        radius: proximityRadius * 1000, // Convert km to meters
        color: '#0000ff',
        fillColor: '#0000ff',
        fillOpacity: 0.05,
        weight: 1,
      }).addTo(map);
      
      // Store circle in a separate array to avoid type issues
      // This is a workaround for the TypeScript error with circles vs polylines
      (circle as any).remove = circle.remove.bind(circle);
      connectionLayersRef.current.lines.push(circle as any);
    });
    
    // Fit map to bounds if we have connections
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [connections, isMapReady, proximityRadius]);

  return (
    <div 
      ref={mapContainerRef} 
      className="h-full w-full" 
      data-testid="port-vessel-proximity-map"
    />
  );
}