import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

// Define types for marker data
interface MarkerData {
  position: [number, number]; // lat, lng
  title: string;
  popup?: string;
  type?: 'refinery' | 'port' | 'vessel' | 'custom';
  icon?: string;
}

interface SimpleLeafletMapProps {
  center: [number, number]; // lat, lng
  zoom: number;
  markers?: MarkerData[];
  showConnections?: boolean;
  centralPoint?: [number, number]; // Central point for connections (usually refinery location)
  className?: string;
}

// Custom icon for refineries
const refineryIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/6769/6769264.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Custom icon for ports
const portIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3011/3011265.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Custom icon for vessels
const vesselIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2942/2942076.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

export default function SimpleLeafletMap({
  center,
  zoom,
  markers = [],
  showConnections = false,
  centralPoint,
  className = ''
}: SimpleLeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const connectionsLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    // Initialize map if it doesn't exist yet
    if (!mapRef.current && mapContainerRef.current) {
      // Create map instance
      mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);

      // Add tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);

      // Create marker layer group
      markerLayerRef.current = L.layerGroup().addTo(mapRef.current);
      
      // Create connections layer group if needed
      if (showConnections) {
        connectionsLayerRef.current = L.layerGroup().addTo(mapRef.current);
      }
    } else if (mapRef.current) {
      // If map exists but center or zoom changed, update the view
      mapRef.current.setView(center, zoom);
    }

    return () => {
      // Clean up map on component unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this runs only on mount/unmount

  // Update markers when markers prop changes
  useEffect(() => {
    if (!mapRef.current || !markerLayerRef.current) return;

    // Clear existing markers
    markerLayerRef.current.clearLayers();
    
    // Clear existing connections if they exist
    if (connectionsLayerRef.current) {
      connectionsLayerRef.current.clearLayers();
    }

    // Add new markers
    markers.forEach(marker => {
      // Choose the appropriate icon based on marker type
      let icon;
      switch (marker.type) {
        case 'refinery':
          icon = refineryIcon;
          break;
        case 'port':
          icon = portIcon;
          break;
        case 'vessel':
          icon = vesselIcon;
          break;
        default:
          // Default to standard marker
          icon = new L.Icon.Default();
      }

      // Create marker with the selected icon
      const mapMarker = L.marker(marker.position, {
        title: marker.title,
        icon: icon
      });

      // Add popup if provided
      if (marker.popup) {
        mapMarker.bindPopup(marker.popup);
      }

      // Add marker to layer group
      mapMarker.addTo(markerLayerRef.current!);
      
      // Add connection lines from central point to each port if requested
      if (showConnections && centralPoint && marker.type === 'port') {
        if (connectionsLayerRef.current) {
          const connectionLine = L.polyline([centralPoint, marker.position], {
            color: '#3388ff',
            weight: 2,
            opacity: 0.6,
            dashArray: '5, 5'
          });
          
          connectionLine.addTo(connectionsLayerRef.current);
        }
      }
    });
    
    // Fit bounds if there are markers and we're not specifically setting a center
    if (markers.length > 1 && !center) {
      const markerPositions = markers.map(m => m.position);
      const bounds = L.latLngBounds(markerPositions);
      mapRef.current.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [markers, showConnections, centralPoint]);

  // Update center and zoom when those props change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  return (
    <div 
      ref={mapContainerRef} 
      className={`w-full h-full ${className}`}
      style={{ minHeight: '100%' }}
    />
  );
}