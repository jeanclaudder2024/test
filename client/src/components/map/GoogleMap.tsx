import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  vessels?: any[];
  ports?: any[];
  refineries?: any[];
  style?: React.CSSProperties;
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
  selectedVessel?: any;
  showVessels?: boolean;
  showPorts?: boolean;
  showRefineries?: boolean;
}

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    case Status.FAILURE:
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-red-600">Error loading Google Maps</div>
        </div>
      );
    case Status.SUCCESS:
      return <MapComponent />;
  }
};

function MapComponent({
  center,
  zoom,
  vessels = [],
  ports = [],
  refineries = [],
  style,
  className,
  onMapClick,
  selectedVessel,
  showVessels = true,
  showPorts = true,
  showRefineries = true,
}: GoogleMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeId: 'roadmap',
        styles: [
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#1e3a8a' }]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#ffffff' }]
          },
          {
            featureType: 'administrative',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#c9b2a6' }]
          },
          {
            featureType: 'administrative.land_parcel',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#dcd2be' }]
          },
          {
            featureType: 'landscape.natural',
            elementType: 'geometry',
            stylers: [{ color: '#dfd2ae' }]
          }
        ]
      });

      if (onMapClick) {
        newMap.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            onMapClick(e.latLng.lat(), e.latLng.lng());
          }
        });
      }

      setMap(newMap);
    }
  }, [ref, map, center, zoom, onMapClick]);

  // Clear existing markers
  const clearMarkers = useCallback(() => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
  }, [markers]);

  // Add vessel markers
  useEffect(() => {
    if (!map || !showVessels) return;

    clearMarkers();
    const newMarkers: google.maps.Marker[] = [];

    vessels.forEach(vessel => {
      if (!vessel.currentLat || !vessel.currentLng) return;

      const marker = new google.maps.Marker({
        position: { lat: parseFloat(vessel.currentLat), lng: parseFloat(vessel.currentLng) },
        map,
        title: vessel.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: selectedVessel?.id === vessel.id ? '#ef4444' : '#3b82f6',
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-bold text-blue-900">${vessel.name}</h3>
            <p class="text-sm text-gray-600">IMO: ${vessel.imo || 'N/A'}</p>
            <p class="text-sm text-gray-600">Type: ${vessel.vesselType || 'Oil Tanker'}</p>
            <p class="text-sm text-gray-600">Flag: ${vessel.flag || 'Unknown'}</p>
            <p class="text-sm text-gray-600">Status: ${vessel.status || 'At Sea'}</p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  }, [map, vessels, showVessels, selectedVessel, clearMarkers]);

  // Add port markers
  useEffect(() => {
    if (!map || !showPorts) return;

    ports.forEach(port => {
      if (!port.lat || !port.lng) return;

      const marker = new google.maps.Marker({
        position: { lat: parseFloat(port.lat), lng: parseFloat(port.lng) },
        map,
        title: port.name,
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#16a34a',
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-bold text-green-900">${port.name}</h3>
            <p class="text-sm text-gray-600">Country: ${port.country || 'Unknown'}</p>
            <p class="text-sm text-gray-600">Type: ${port.type || 'Commercial'}</p>
            <p class="text-sm text-gray-600">Status: ${port.status || 'Active'}</p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    });
  }, [map, ports, showPorts]);

  // Add refinery markers
  useEffect(() => {
    if (!map || !showRefineries) return;

    refineries.forEach(refinery => {
      if (!refinery.latitude || !refinery.longitude) return;

      const marker = new google.maps.Marker({
        position: { lat: parseFloat(refinery.latitude), lng: parseFloat(refinery.longitude) },
        map,
        title: refinery.name,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#ea580c',
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-bold text-orange-900">${refinery.name}</h3>
            <p class="text-sm text-gray-600">Country: ${refinery.country || 'Unknown'}</p>
            <p class="text-sm text-gray-600">Capacity: ${refinery.capacity || 'N/A'}</p>
            <p class="text-sm text-gray-600">Status: ${refinery.status || 'Active'}</p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    });
  }, [map, refineries, showRefineries]);

  // Update map center and zoom
  useEffect(() => {
    if (map) {
      map.setCenter(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);

  return <div ref={ref} style={style} className={className} />;
}

export default function GoogleMap(props: GoogleMapProps) {
  return (
    <Wrapper
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
      render={render}
      libraries={['places']}
    >
      <MapComponent {...props} />
    </Wrapper>
  );
}