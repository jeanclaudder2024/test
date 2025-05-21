import React, { useState, useEffect, useRef } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, useMap, LayersControl, FeatureGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import VesselMarkers from './VesselMarkers';
import PortMarkers from './PortMarkers';
import RefineryMarkers from './RefineryMarkers';
import PortPopup from '../PortPopup'; 
import RefineryPopup from '../RefineryPopup';

// Map initialization component that adds event listeners
const MapInitializer = ({ onZoomEnd }) => {
  const map = useMap();
  
  useEffect(() => {
    // Add event listener for zoom end
    map.on('zoomend', () => {
      onZoomEnd(map.getZoom());
      
      // Reset layer styles to ensure visibility
      const container = document.querySelector('.leaflet-container');
      container.classList.add('zoom-changed');
      
      // Force refresh of marker layer by toggling visibility
      const markerPane = document.querySelector('.leaflet-marker-pane');
      if (markerPane) {
        markerPane.style.display = 'none';
        setTimeout(() => {
          markerPane.style.display = 'block';
        }, 50);
      }
      
      // Clean up class after animation completes
      setTimeout(() => {
        container.classList.remove('zoom-changed');
      }, 300);
    });
    
    return () => {
      map.off('zoomend');
    };
  }, [map, onZoomEnd]);
  
  return null;
};

const EnhancedMapContainer = ({
  vessels,
  ports,
  refineries,
  portIcon,
  refineryIcon,
  getVesselIconUrl,
  getVesselStatus,
  getVesselRegion,
  getRegionFromCountry,
  children,
  ...props
}) => {
  const [zoom, setZoom] = useState(5);
  
  // Handle zoom end event
  const handleZoomEnd = (newZoom) => {
    setZoom(newZoom);
  };
  
  return (
    <LeafletMapContainer {...props}>
      <MapInitializer onZoomEnd={handleZoomEnd} />
      
      {/* Base tile layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Layer controls */}
      <LayersControl position="topright">
        {/* Vessel layer */}
        <LayersControl.Overlay checked name="Vessels">
          <FeatureGroup>
            <VesselMarkers
              vessels={vessels}
              getVesselIconUrl={getVesselIconUrl}
              getVesselStatus={getVesselStatus}
              getVesselRegion={getVesselRegion}
              currentZoom={zoom}
            />
          </FeatureGroup>
        </LayersControl.Overlay>
        
        {/* Ports layer */}
        <LayersControl.Overlay checked name="Ports">
          <FeatureGroup>
            <PortMarkers
              ports={ports}
              portIcon={portIcon}
              PortPopupComponent={PortPopup}
            />
          </FeatureGroup>
        </LayersControl.Overlay>
        
        {/* Refineries layer */}
        <LayersControl.Overlay checked name="Refineries">
          <FeatureGroup>
            <RefineryMarkers
              refineries={refineries}
              refineryIcon={refineryIcon}
              RefineryPopupComponent={({ refinery }) => (
                <RefineryPopup 
                  refinery={refinery} 
                  getRegionFromCountry={getRegionFromCountry}
                />
              )}
            />
          </FeatureGroup>
        </LayersControl.Overlay>
      </LayersControl>
      
      {children}
    </LeafletMapContainer>
  );
};

export default EnhancedMapContainer;