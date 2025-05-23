import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/full-map.css';
import '../styles/marker-icons.css';
import { apiRequest } from '@/lib/queryClient';
import { refineryIcon, portIcon, oilTerminalIcon, tankFarmIcon } from '@/components/map/CustomMarkerIcons';
import RegionFilter from '@/components/map/RegionFilter';

// Define types for our data
interface Refinery {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: string;
  lng: string;
  capacity: number;
  description?: string;
  operator?: string;
  status?: string;
}

interface Port {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: string;
  lng: string;
  capacity?: number;
  description?: string;
  type?: string;
  status?: string;
}

export default function BasicMap() {
  const [refineries, setRefineries] = useState<Refinery[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  
  // Extract unique regions from combined refineries and ports
  const regions = useMemo(() => {
    const allRegions = new Set<string>();
    refineries.forEach(r => allRegions.add(r.region));
    ports.forEach(p => allRegions.add(p.region));
    return Array.from(allRegions).sort();
  }, [refineries, ports]);
  
  // Filter facilities by region
  const filteredRefineries = useMemo(() => {
    return selectedRegion === "all" 
      ? refineries 
      : refineries.filter(r => r.region === selectedRegion);
  }, [refineries, selectedRegion]);
  
  const filteredPorts = useMemo(() => {
    return selectedRegion === "all" 
      ? ports 
      : ports.filter(p => p.region === selectedRegion);
  }, [ports, selectedRegion]);

  useEffect(() => {
    // Fetch refineries
    apiRequest('/api/refineries')
      .then(response => {
        console.log('Refineries response:', response);
        setRefineries(response.refineries || []);
      })
      .catch(error => console.error('Error fetching refineries:', error));
    
    // Fetch ports
    apiRequest('/api/ports')
      .then(response => {
        console.log('Ports response:', response);
        setPorts(response.ports || []);
      })
      .catch(error => console.error('Error fetching ports:', error));
  }, []);

  return (
    <div className="map-container">
      {/* Region Filter Controls */}
      <div className="map-controls">
        <h3>Map Controls</h3>
        <RegionFilter 
          regions={regions} 
          selectedRegion={selectedRegion} 
          onRegionChange={setSelectedRegion} 
        />
        <div className="facility-count">
          Showing {filteredRefineries.length} refineries and {filteredPorts.length} ports
          {selectedRegion !== "all" && ` in ${selectedRegion}`}
        </div>
      </div>
      
      <MapContainer
        center={[20, 0]} 
        zoom={2}
        maxBounds={[[-90, -180], [90, 180]]}
        minZoom={1}
        maxZoom={18}
        worldCopyJump={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        attributionControl={true}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          noWrap={false}
          bounds={[[-90, -180], [90, 180]]}
        />

        <LayersControl position="topright">
          {/* Refineries Layer */}
          <LayersControl.Overlay checked name="Refineries">
            <LayerGroup>
              {filteredRefineries.map(refinery => (
                <Marker
                  key={`refinery-${refinery.id}`}
                  position={[parseFloat(refinery.lat), parseFloat(refinery.lng)]}
                  icon={refineryIcon}
                >
                  <Popup>
                    <div className="marker-popup">
                      <h3>{refinery.name}</h3>
                      <p><strong>Country:</strong> {refinery.country}</p>
                      <p><strong>Region:</strong> {refinery.region}</p>
                      <p><strong>Capacity:</strong> {refinery.capacity.toLocaleString()} bpd</p>
                      <p><strong>Status:</strong> {refinery.status || "Operational"}</p>
                      {refinery.operator && <p><strong>Operator:</strong> {refinery.operator}</p>}
                      {refinery.description && (
                        <div className="description">
                          <p><strong>Description:</strong></p>
                          <p>{refinery.description.substring(0, 150)}...</p>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
          
          {/* Ports Layer */}
          <LayersControl.Overlay checked name="Ports">
            <LayerGroup>
              {filteredPorts.map(port => {
                // Choose icon based on port type
                const icon = port.type?.includes('oil') ? oilTerminalIcon : portIcon;
                
                return (
                  <Marker
                    key={`port-${port.id}`}
                    position={[parseFloat(port.lat), parseFloat(port.lng)]}
                    icon={icon}
                  >
                    <Popup>
                      <div className="marker-popup">
                        <h3>{port.name}</h3>
                        <p><strong>Country:</strong> {port.country}</p>
                        <p><strong>Region:</strong> {port.region}</p>
                        <p><strong>Type:</strong> {port.type}</p>
                        {port.capacity && <p><strong>Capacity:</strong> {port.capacity.toLocaleString()}</p>}
                        <p><strong>Status:</strong> {port.status || "Active"}</p>
                        {port.description && (
                          <div className="description">
                            <p><strong>Description:</strong></p>
                            <p>{port.description}</p>
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    </div>
  );
}