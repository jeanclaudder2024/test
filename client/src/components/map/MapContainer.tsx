import { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Vessel, Refinery } from '@shared/schema';
import vesselIcon from '@/assets/vessel.svg';
import vesselSelectedIcon from '@/assets/vessel-selected.svg';
import refineryIcon from '@/assets/refinery.svg';
import refinerySelectedIcon from '@/assets/refinery-selected.svg';

// Define props interface
interface MapContainerProps {
  vessels: Vessel[];
  refineries: Refinery[];
  onVesselClick: (vessel: Vessel) => void;
  onRefineryClick: (refinery: Refinery) => void;
  selectedVesselId?: number;
  selectedRefineryId?: number;
  initialZoom?: number;
  filterRegion?: string;
}

const MapContainer = ({
  vessels,
  refineries,
  onVesselClick,
  onRefineryClick,
  selectedVesselId,
  selectedRefineryId,
  initialZoom = 3,
  filterRegion
}: MapContainerProps) => {
  // Reference to the map div
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  
  // References to marker layers
  const vesselLayerRef = useRef<L.LayerGroup | null>(null);
  const refineryLayerRef = useRef<L.LayerGroup | null>(null);
  
  // Create custom icons
  const createVesselIcon = (selected: boolean) => {
    return L.icon({
      iconUrl: selected ? vesselSelectedIcon : vesselIcon,
      iconSize: selected ? [35, 35] : [25, 25],
      iconAnchor: selected ? [17.5, 17.5] : [12.5, 12.5],
      popupAnchor: [0, -10],
    });
  };
  
  const createRefineryIcon = (selected: boolean) => {
    return L.icon({
      iconUrl: selected ? refinerySelectedIcon : refineryIcon,
      iconSize: selected ? [35, 35] : [25, 25],
      iconAnchor: selected ? [17.5, 17.5] : [12.5, 12.5],
      popupAnchor: [0, -10],
    });
  };
  
  // Initialize the map
  useEffect(() => {
    if (mapRef.current && !map) {
      // Create the map instance
      const mapInstance = L.map(mapRef.current, {
        center: [20, 0], // Center the map on the equator
        zoom: initialZoom,
        zoomControl: true,
        attributionControl: true,
      });
      
      // Add the tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);
      
      // Create vessel marker layer
      const vesselLayer = L.layerGroup().addTo(mapInstance);
      vesselLayerRef.current = vesselLayer;
      
      // Create refinery marker layer
      const refineryLayer = L.layerGroup().addTo(mapInstance);
      refineryLayerRef.current = refineryLayer;
      
      // Save the map instance to state
      setMap(mapInstance);
      
      // Clean up on unmount
      return () => {
        mapInstance.remove();
      };
    }
  }, [mapRef, map, initialZoom]);
  
  // Update markers when vessel data changes
  useEffect(() => {
    if (map && vesselLayerRef.current && vessels) {
      // Clear existing markers
      vesselLayerRef.current.clearLayers();
      
      // Add vessel markers
      vessels.forEach(vessel => {
        if (vessel.currentLat && vessel.currentLng) {
          try {
            const lat = parseFloat(vessel.currentLat);
            const lng = parseFloat(vessel.currentLng);
            
            if (isNaN(lat) || isNaN(lng)) return;
            
            // Create marker with appropriate icon
            const isSelected = vessel.id === selectedVesselId;
            const marker = L.marker([lat, lng], {
              icon: createVesselIcon(isSelected),
              title: vessel.name,
              riseOnHover: true,
              riseOffset: 250
            });
            
            // Add popup with basic vessel info
            marker.bindPopup(`
              <div style="min-width: 180px;">
                <h3 style="margin-bottom: 8px; font-weight: bold;">${vessel.name}</h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="font-weight: 500;">Type:</span>
                  <span>${vessel.vesselType}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="font-weight: 500;">IMO:</span>
                  <span>${vessel.imo}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="font-weight: 500;">Flag:</span>
                  <span>${vessel.flag}</span>
                </div>
                <button 
                  style="
                    background-color: #3B82F6; 
                    color: white; 
                    border: none; 
                    padding: 8px 12px; 
                    border-radius: 4px; 
                    margin-top: 8px;
                    cursor: pointer;
                    width: 100%;
                    font-weight: 500;
                  "
                  class="vessel-details-btn"
                  data-vessel-id="${vessel.id}"
                >
                  View Details
                </button>
              </div>
            `);
            
            // Add click event to marker
            marker.on('click', () => {
              onVesselClick(vessel);
            });
            
            // Add click event to the details button in the popup
            marker.on('popupopen', () => {
              const btn = document.querySelector(`.vessel-details-btn[data-vessel-id="${vessel.id}"]`);
              if (btn) {
                btn.addEventListener('click', (e) => {
                  e.preventDefault();
                  onVesselClick(vessel);
                  map.closePopup();
                });
              }
            });
            
            // If selected, make sure it's visible and centered
            if (isSelected) {
              map.setView([lat, lng], Math.max(map.getZoom() || initialZoom, 6));
            }
            
            // Add marker to layer
            vesselLayerRef.current?.addLayer(marker);
          } catch (error) {
            console.error('Error creating vessel marker:', error);
          }
        }
      });
    }
  }, [map, vessels, selectedVesselId, onVesselClick, initialZoom]);
  
  // Update markers when refinery data changes
  useEffect(() => {
    if (map && refineryLayerRef.current && refineries) {
      // Clear existing markers
      refineryLayerRef.current.clearLayers();
      
      // Add refinery markers
      refineries.forEach(refinery => {
        if (refinery.lat && refinery.lng) {
          try {
            const lat = parseFloat(refinery.lat);
            const lng = parseFloat(refinery.lng);
            
            if (isNaN(lat) || isNaN(lng)) return;
            
            // Create marker with appropriate icon
            const isSelected = refinery.id === selectedRefineryId;
            const marker = L.marker([lat, lng], {
              icon: createRefineryIcon(isSelected),
              title: refinery.name,
              riseOnHover: true,
              riseOffset: 250
            });
            
            // Add popup with basic refinery info
            marker.bindPopup(`
              <div style="min-width: 180px;">
                <h3 style="margin-bottom: 8px; font-weight: bold;">${refinery.name}</h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="font-weight: 500;">Country:</span>
                  <span>${refinery.country}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="font-weight: 500;">Region:</span>
                  <span>${refinery.region}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="font-weight: 500;">Status:</span>
                  <span>${refinery.status || 'Unknown'}</span>
                </div>
                <button 
                  style="
                    background-color: #F59E0B; 
                    color: white; 
                    border: none; 
                    padding: 8px 12px; 
                    border-radius: 4px; 
                    margin-top: 8px;
                    cursor: pointer;
                    width: 100%;
                    font-weight: 500;
                  "
                  class="refinery-details-btn"
                  data-refinery-id="${refinery.id}"
                >
                  View Details
                </button>
              </div>
            `);
            
            // Add click event to marker
            marker.on('click', () => {
              onRefineryClick(refinery);
            });
            
            // Add click event to the details button in the popup
            marker.on('popupopen', () => {
              const btn = document.querySelector(`.refinery-details-btn[data-refinery-id="${refinery.id}"]`);
              if (btn) {
                btn.addEventListener('click', (e) => {
                  e.preventDefault();
                  onRefineryClick(refinery);
                  map.closePopup();
                });
              }
            });
            
            // If selected, make sure it's visible and centered
            if (isSelected) {
              map.setView([lat, lng], Math.max(map.getZoom() || initialZoom, 6));
            }
            
            // Add marker to layer
            refineryLayerRef.current?.addLayer(marker);
          } catch (error) {
            console.error('Error creating refinery marker:', error);
          }
        }
      });
    }
  }, [map, refineries, selectedRefineryId, onRefineryClick, initialZoom]);
  
  // When filterRegion changes, zoom to that region
  useEffect(() => {
    if (map && filterRegion) {
      // Define region coordinates - these are approximate center points
      const regionCoordinates: Record<string, [number, number, number]> = {
        'North America': [40, -100, 4],
        'South America': [-20, -60, 4],
        'Europe': [50, 10, 4],
        'Middle East': [25, 45, 5],
        'Africa': [0, 20, 4],
        'Asia': [30, 100, 4],
        'Southeast Asia': [10, 115, 5],
        'Australia': [-25, 135, 4],
        'Caribbean': [20, -75, 6],
        'Mediterranean': [38, 15, 5],
        'Baltic': [58, 20, 6]
      };
      
      if (regionCoordinates[filterRegion]) {
        const [lat, lng, zoom] = regionCoordinates[filterRegion];
        map.setView([lat, lng], zoom);
      }
    }
  }, [map, filterRegion]);
  
  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
  );
};

export default MapContainer;