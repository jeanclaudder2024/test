import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Port, Vessel } from '@/types';
import { shipIcon, portIcon } from '@/lib/mapIcons';

interface PortMiniMapProps {
  port: Port;
  vessels: {
    vessels: Vessel;
    distance: number;
  }[];
  height?: string;
  width?: string;
  className?: string;
  interactive?: boolean;
  onVesselClick?: (vessel: Vessel) => void;
}

export default function PortMiniMap({
  port,
  vessels,
  height = '200px',
  width = '100%',
  className = '',
  interactive = false,
  onVesselClick
}: PortMiniMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      // Clean up any existing map
      if (mapRef.current) {
        mapRef.current.remove();
      }

      // Convert port coordinates to numbers
      const portLat = Number(port.lat);
      const portLng = Number(port.lng);

      if (isNaN(portLat) || isNaN(portLng)) {
        console.error(`Invalid port coordinates: lat=${port.lat}, lng=${port.lng}`);
        return;
      }

      // Create map centered on the port
      const map = L.map(mapContainerRef.current, {
        center: [portLat, portLng],
        zoom: 9,
        zoomControl: interactive,
        dragging: interactive,
        doubleClickZoom: interactive,
        scrollWheelZoom: interactive,
        attributionControl: false
      });
      mapRef.current = map;

      // Add tile layer with English country names
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://carto.com/attributions">CartoDB</a>, © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      // Add port marker
      const portMarker = L.marker([portLat, portLng], {
        icon: portIcon(port.type === 'oil')
      }).addTo(map);
      
      // Add tooltip to port marker
      portMarker.bindTooltip(`
        <div>
          <strong>${port.name}</strong>
          <div>${port.country}</div>
        </div>
      `, { offset: [0, -20] });

      // Add vessel markers with gradient color based on distance (closer = greener)
      if (vessels && vessels.length > 0) {
        // Create vessel layer group
        const vesselLayer = L.layerGroup().addTo(map);
        
        // Find max distance for normalization
        const maxDistance = Math.max(...vessels.map(v => v.distance));
        
        // Add each vessel to the map
        vessels.forEach(({ vessels: vessel, distance }) => {
          if (!vessel.currentLat || !vessel.currentLng) return;
          
          const vesselLat = Number(vessel.currentLat);
          const vesselLng = Number(vessel.currentLng);
          
          if (isNaN(vesselLat) || isNaN(vesselLng)) return;
          
          // Normalize distance (0 to 1)
          const normalizedDistance = maxDistance > 0 ? distance / maxDistance : 0;
          
          // Color gradient from green (close) to red (far)
          const hue = 120 - normalizedDistance * 120; // 120 = green, 0 = red
          
          const vesselMarker = L.marker([vesselLat, vesselLng], {
            icon: shipIcon(vessel.vesselType?.toLowerCase().includes('oil') || false, hue)
          }).addTo(vesselLayer);
          
          // Add vessel tooltip
          vesselMarker.bindTooltip(`
            <div>
              <strong>${vessel.name}</strong>
              <div>${vessel.vesselType || 'Unknown'}</div>
              <div>${distance.toFixed(1)} km away</div>
            </div>
          `, { offset: [0, -15] });
          
          // Add click handler if provided
          if (onVesselClick) {
            vesselMarker.on('click', () => onVesselClick(vessel));
          }
          
          // Show connection line to port
          L.polyline([[portLat, portLng], [vesselLat, vesselLng]], {
            color: `hsl(${hue}, 70%, 50%)`,
            weight: 1,
            opacity: 0.5,
            dashArray: '4,4'
          }).addTo(vesselLayer);
        });
        
        // Fit map bounds to show all vessels and port
        const bounds = L.featureGroup([...vessels.map(({ vessels: vessel }) => {
          if (!vessel.currentLat || !vessel.currentLng) return null;
          const vesselLat = Number(vessel.currentLat);
          const vesselLng = Number(vessel.currentLng);
          if (isNaN(vesselLat) || isNaN(vesselLng)) return null;
          return L.marker([vesselLat, vesselLng]);
        }).filter(Boolean) as L.Marker[], portMarker]).getBounds();
        
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    } catch (error) {
      console.error('Error initializing port mini map:', error);
    }

    // Clean up map on component unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [port, vessels, interactive, onVesselClick]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ height, width }} 
      className={`rounded-md overflow-hidden border border-border ${className}`}
    />
  );
}