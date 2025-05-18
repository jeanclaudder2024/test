import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from '@/hooks/use-toast';

// Define vessel interface
interface Vessel {
  id: number;
  name: string;
  vesselType?: string;
  currentLat?: number | string;
  currentLng?: number | string;
  currentSpeed?: number;
  currentHeading?: number;
  destination?: string;
  currentRegion?: string;
}

// Props for the map component
interface VesselMapV2Props {
  height?: string;
  centerLat?: number;
  centerLng?: number;
  initialZoom?: number;
}

const VesselMapV2: React.FC<VesselMapV2Props> = ({
  height = '800px',
  centerLat = 25,
  centerLng = 10,
  initialZoom = 3
}) => {
  // Create map container ref
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize the map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Only create the map if it doesn't exist
    if (!mapRef.current) {
      console.log('Creating new map instance');
      const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], initialZoom);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Create a layer for markers
      const markersLayer = L.layerGroup().addTo(map);
      
      // Store references
      mapRef.current = map;
      markersLayerRef.current = markersLayer;
    }

    return () => {
      if (mapRef.current) {
        console.log('Cleaning up map instance');
        mapRef.current.remove();
        mapRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, [centerLat, centerLng, initialZoom]);

  // Connect to WebSocket for real-time data
  useEffect(() => {
    // Use a secure WebSocket URL that works in both development and production
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${Math.random().toString(36).substring(2, 15)}`;
    console.log('Attempting to connect WebSocket to URL:', wsUrl);

    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
      // Request data for all vessels
      ws.send(JSON.stringify({ 
        type: 'config', 
        region: 'global', 
        loadAllVessels: true,
        page: 1,
        pageSize: 500,
        trackPortProximity: false
      }));
    };
    
    ws.onmessage = (event) => {
      try {
        console.log('WebSocket message received, length:', event.data.length);
        const data = JSON.parse(event.data);
        
        if (data.vessels && Array.isArray(data.vessels)) {
          setVessels(data.vessels);
          setLoading(false);
          updateMarkers(data.vessels);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'Connection error',
        description: 'Trying to reconnect to the vessel tracking service...',
        variant: 'destructive'
      });
      
      // Fall back to REST API if WebSocket fails
      fetchVesselsViaAPI();
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
    
    return () => {
      ws.close();
    };
  }, []);

  // Fetch vessels via REST API as a fallback
  const fetchVesselsViaAPI = async () => {
    try {
      const response = await fetch('/api/vessels');
      if (response.ok) {
        const data = await response.json();
        setVessels(data);
        setLoading(false);
        updateMarkers(data);
      } else {
        throw new Error('Failed to fetch vessel data');
      }
    } catch (error) {
      console.error('API fetch error:', error);
      toast({
        title: 'Data loading error',
        description: 'Could not load vessel data. Please try again later.',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  // Update markers on the map
  const updateMarkers = (vessels: Vessel[]) => {
    if (!markersLayerRef.current || !mapRef.current) return;
    
    // Clear existing markers
    markersLayerRef.current.clearLayers();
    
    // Add new markers for each vessel
    vessels.forEach(vessel => {
      if (!vessel.currentLat || !vessel.currentLng) return;
      
      const lat = parseFloat(String(vessel.currentLat));
      const lng = parseFloat(String(vessel.currentLng));
      
      if (isNaN(lat) || isNaN(lng)) return;
      
      // Get color based on vessel type
      const color = getVesselColor(vessel.vesselType);
      
      // Create marker
      const marker = L.circleMarker([lat, lng], {
        radius: 6,
        fillColor: color.fillColor,
        color: color.color,
        weight: color.weight,
        opacity: 1,
        fillOpacity: color.fillOpacity
      });
      
      // Add tooltip
      marker.bindTooltip(`
        <div style="font-weight: bold">${vessel.name}</div>
        <div>${vessel.vesselType || 'Unknown'}</div>
        ${vessel.destination ? `<div>To: ${vessel.destination}</div>` : ''}
      `);
      
      // Add popup with more details
      marker.bindPopup(`
        <div style="min-width: 200px">
          <h3 style="font-weight: bold; margin-bottom: 8px">${vessel.name}</h3>
          <p><strong>Type:</strong> ${vessel.vesselType || 'Unknown'}</p>
          <p><strong>Region:</strong> ${vessel.currentRegion || 'Unknown'}</p>
          <p><strong>Speed:</strong> ${vessel.currentSpeed || 0} knots</p>
          <p><strong>Heading:</strong> ${vessel.currentHeading || 0}°</p>
          ${vessel.destination ? `<p><strong>Destination:</strong> ${vessel.destination}</p>` : ''}
          <button 
            onclick="window.location.href='/vessels/${vessel.id}'"
            style="background: #0077ff; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-top: 8px; width: 100%;"
          >
            View Details
          </button>
        </div>
      `);
      
      // Add to layer
      marker.addTo(markersLayerRef.current!);
    });
  };

  // Get color for vessel marker based on vessel type
  const getVesselColor = (vesselType: string | undefined): {
    fillColor: string;
    color: string;
    weight: number;
    fillOpacity: number;
  } => {
    if (!vesselType) return { fillColor: '#95a5a6', color: '#7f8c8d', weight: 1, fillOpacity: 0.8 };
    
    const type = vesselType.toLowerCase();
    
    if (type.includes('crude')) {
      return { fillColor: '#e74c3c', color: '#c0392b', weight: 1.5, fillOpacity: 0.9 };
    } else if (type.includes('product')) {
      return { fillColor: '#3498db', color: '#2980b9', weight: 1.5, fillOpacity: 0.9 };
    } else if (type.includes('oil')) {
      return { fillColor: '#FF5722', color: '#E64A19', weight: 2, fillOpacity: 0.9 };
    } else if (type.includes('lng')) {
      return { fillColor: '#2ecc71', color: '#27ae60', weight: 1.5, fillOpacity: 0.9 };
    } else if (type.includes('lpg')) {
      return { fillColor: '#9b59b6', color: '#8e44ad', weight: 1.5, fillOpacity: 0.9 };
    } else {
      return { fillColor: '#f1c40f', color: '#f39c12', weight: 1.5, fillOpacity: 0.9 };
    }
  };

  return (
    <div className="relative w-full" style={{ height }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 z-10">
          <div className="p-4 rounded-md bg-white shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              <span>Loading vessel data...</span>
            </div>
          </div>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full z-0"></div>
    </div>
  );
};

export default VesselMapV2;