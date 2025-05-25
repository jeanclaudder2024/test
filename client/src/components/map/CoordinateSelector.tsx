import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useQuery } from "@tanstack/react-query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.divIcon({
  html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

let RefineryIcon = L.divIcon({
  html: `<div style="background-color: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

let PortIcon = L.divIcon({
  html: `<div style="background-color: #10b981; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface CoordinateSelectorProps {
  onCoordinateSelect: (lat: number, lng: number) => void;
  selectedLat?: number;
  selectedLng?: number;
  height?: string;
}

interface ClickHandler {
  onCoordinateSelect: (lat: number, lng: number) => void;
}

function MapClickHandler({ onCoordinateSelect }: ClickHandler) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onCoordinateSelect(lat, lng);
    },
  });
  return null;
}

export function CoordinateSelector({ 
  onCoordinateSelect, 
  selectedLat, 
  selectedLng, 
  height = "400px" 
}: CoordinateSelectorProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([25.0, 55.0]); // Default to Dubai area

  // Fetch refineries
  const { data: refineries = [] } = useQuery({
    queryKey: ["/api/refineries"],
  });

  // Fetch ports
  const { data: ports = [] } = useQuery({
    queryKey: ["/api/ports"],
  });

  return (
    <div className="w-full border rounded-lg overflow-hidden" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onCoordinateSelect={onCoordinateSelect} />
        
        {/* Selected coordinate marker */}
        {selectedLat && selectedLng && (
          <Marker position={[selectedLat, selectedLng]} icon={DefaultIcon}>
            <Popup>
              <div className="text-center">
                <strong>Selected Location</strong><br/>
                Lat: {selectedLat.toFixed(6)}<br/>
                Lng: {selectedLng.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Refinery markers */}
        {refineries.map((refinery: any) => {
          const lat = parseFloat(refinery.lat);
          const lng = parseFloat(refinery.lng);
          
          if (isNaN(lat) || isNaN(lng)) return null;
          
          return (
            <Marker 
              key={`refinery-${refinery.id}`} 
              position={[lat, lng]} 
              icon={RefineryIcon}
            >
              <Popup>
                <div className="text-center">
                  <strong>🏭 {refinery.name}</strong><br/>
                  <small>{refinery.country}</small><br/>
                  Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Port markers */}
        {ports.map((port: any) => {
          const lat = parseFloat(port.lat);
          const lng = parseFloat(port.lng);
          
          if (isNaN(lat) || isNaN(lng)) return null;
          
          return (
            <Marker 
              key={`port-${port.id}`} 
              position={[lat, lng]} 
              icon={PortIcon}
            >
              <Popup>
                <div className="text-center">
                  <strong>⚓ {port.name}</strong><br/>
                  <small>{port.country}</small><br/>
                  Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Legend */}
      <div className="p-2 bg-gray-50 border-t flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-500 rounded-full border border-white"></div>
          <span>Selected Location</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
          <span>Refineries</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-full border border-white"></div>
          <span>Ports</span>
        </div>
      </div>
    </div>
  );
}