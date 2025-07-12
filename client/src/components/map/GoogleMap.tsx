import React, { useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  vessels?: any[];
  ports?: any[];
  refineries?: any[];
  onVesselClick?: (vessel: any) => void;
  onPortClick?: (port: any) => void;
  onRefineryClick?: (refinery: any) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface MapComponentProps extends GoogleMapProps {
  map: google.maps.Map | null;
  setMap: (map: google.maps.Map | null) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  center,
  zoom,
  vessels = [],
  ports = [],
  refineries = [],
  onVesselClick,
  onPortClick,
  onRefineryClick,
  map,
  setMap,
  style
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        // Force English language for all map labels and country names
        language: 'en',
        region: 'US',
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_CENTER,
        },
        styles: [
          {
            featureType: 'all',
            elementType: 'labels.text',
            stylers: [
              { color: '#000000' },
              { visibility: 'on' }
            ]
          }
        ]
      });
      setMap(newMap);
    }
  }, [ref, map, center, zoom, setMap]);

  // Clear existing markers
  useEffect(() => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
  }, [vessels, ports, refineries]);

  // Add vessel markers
  useEffect(() => {
    if (!map) return;

    const newMarkers: google.maps.Marker[] = [];

    // Add vessel markers
    vessels.forEach(vessel => {
      if (vessel.currentLat && vessel.currentLng) {
        const marker = new google.maps.Marker({
          position: { lat: parseFloat(vessel.currentLat), lng: parseFloat(vessel.currentLng) },
          map,
          title: vessel.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#ef4444',
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }
        });

        if (onVesselClick) {
          marker.addListener('click', () => onVesselClick(vessel));
        }

        // Info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 4px 0; color: #1f2937;">${vessel.name}</h3>
              <p style="margin: 2px 0; font-size: 12px; color: #6b7280;">
                Type: ${vessel.vesselType || 'Unknown'}<br/>
                Status: ${vessel.status || 'At Sea'}<br/>
                Speed: ${vessel.speed || 0} knots
              </p>
            </div>
          `
        });

        marker.addListener('mouseover', () => {
          infoWindow.open(map, marker);
        });

        marker.addListener('mouseout', () => {
          infoWindow.close();
        });

        newMarkers.push(marker);
      }
    });

    // Add port markers
    ports.forEach(port => {
      if (port.lat && port.lng) {
        const marker = new google.maps.Marker({
          position: { lat: parseFloat(port.lat), lng: parseFloat(port.lng) },
          map,
          title: port.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#3b82f6',
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }
        });

        if (onPortClick) {
          marker.addListener('click', () => onPortClick(port));
        }

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 4px 0; color: #1f2937;">${port.name}</h3>
              <p style="margin: 2px 0; font-size: 12px; color: #6b7280;">
                Country: ${port.country || 'Unknown'}<br/>
                Type: ${port.type || 'Commercial'}<br/>
                Status: ${port.status || 'Active'}
              </p>
            </div>
          `
        });

        marker.addListener('mouseover', () => {
          infoWindow.open(map, marker);
        });

        marker.addListener('mouseout', () => {
          infoWindow.close();
        });

        newMarkers.push(marker);
      }
    });

    // Add refinery markers
    refineries.forEach(refinery => {
      if (refinery.lat && refinery.lng) {
        const marker = new google.maps.Marker({
          position: { lat: parseFloat(refinery.lat), lng: parseFloat(refinery.lng) },
          map,
          title: refinery.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#10b981',
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }
        });

        if (onRefineryClick) {
          marker.addListener('click', () => onRefineryClick(refinery));
        }

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 4px 0; color: #1f2937;">${refinery.name}</h3>
              <p style="margin: 2px 0; font-size: 12px; color: #6b7280;">
                Country: ${refinery.country || 'Unknown'}<br/>
                Type: ${refinery.type || 'Refinery'}<br/>
                Capacity: ${refinery.capacity || 'Unknown'}
              </p>
            </div>
          `
        });

        marker.addListener('mouseover', () => {
          infoWindow.open(map, marker);
        });

        marker.addListener('mouseout', () => {
          infoWindow.close();
        });

        newMarkers.push(marker);
      }
    });

    setMarkers(newMarkers);
  }, [map, vessels, ports, refineries, onVesselClick, onPortClick, onRefineryClick]);

  return <div ref={ref} style={style} className="w-full h-full" />;
};

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    case Status.FAILURE:
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-red-600 text-center">
            <p>Failed to load Google Maps</p>
            <p className="text-sm">Please check your API key</p>
          </div>
        </div>
      );
    default:
      return null;
  }
};

const GoogleMap: React.FC<GoogleMapProps> = (props) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  return (
    <Wrapper
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY!}
      render={render}
      language="en"
      region="US"
      libraries={['places', 'geometry']}
    >
      <MapComponent
        {...props}
        map={map}
        setMap={setMap}
      />
    </Wrapper>
  );
};

export default GoogleMap;