import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Map, Globe2, Locate, ZoomIn, ZoomOut, Navigation, Layers, Ship, Factory } from 'lucide-react';
import { mapStyles } from './MapStyles';
import { Vessel, Refinery, Region } from '@/types';

interface MapControlsProps {
  map: any;
  vessels: Vessel[];
  displayVessels: Vessel[];
  refineries: Refinery[];
  selectedRegion: Region | null;
  mapStyle: string;
  setMapStyle: (styleId: string) => void;
  regionPositions: Record<string, { lat: number; lng: number; zoom: number }>;
}

export default function MapControls({
  map,
  vessels,
  displayVessels,
  refineries,
  selectedRegion,
  mapStyle,
  setMapStyle,
  regionPositions
}: MapControlsProps) {
  
  // Map control functions
  const zoomIn = () => {
    if (map) {
      map.setZoom(map.getZoom() + 1);
    }
  };
  
  const zoomOut = () => {
    if (map) {
      map.setZoom(map.getZoom() - 1);
    }
  };
  
  const resetView = () => {
    if (map) {
      if (selectedRegion) {
        const position = regionPositions[selectedRegion];
        map.setView([position.lat, position.lng], position.zoom);
      } else {
        map.setView([0, 0], 2);
      }
    }
  };
  
  // Setup coordinates display
  useEffect(() => {
    if (map) {
      const coordsDisplay = document.getElementById('map-coordinates');
      
      const updateCoordinates = (e: any) => {
        if (coordsDisplay) {
          const lat = e.latlng.lat.toFixed(3);
          const lng = e.latlng.lng.toFixed(3);
          
          const latDir = lat >= 0 ? 'N' : 'S';
          const lngDir = lng >= 0 ? 'E' : 'W';
          
          coordsDisplay.textContent = `${Math.abs(lat)}°${latDir}, ${Math.abs(lng)}°${lngDir}`;
        }
      };
      
      map.on('mousemove', updateCoordinates);
      
      return () => {
        if (map) {
          map.off('mousemove', updateCoordinates);
        }
      };
    }
  }, [map]);
  
  return (
    <>
      {/* Map Control Panel */}
      <div className="flex flex-col gap-2 absolute top-3 left-3 z-30">
        <div className="bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 backdrop-blur-sm p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-300 flex items-center border-b pb-1 border-gray-200 dark:border-gray-700">
            <Map className="h-3 w-3 mr-1" /> Map Controls
          </div>
          
          <div className="grid grid-cols-3 gap-1">
            <Button 
              variant="secondary" 
              className="h-8 w-8 rounded-md p-0 bg-white hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
              onClick={zoomIn}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </Button>
            
            <Button 
              variant="secondary" 
              className="h-8 w-8 rounded-md p-0 bg-white hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
              onClick={zoomOut}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </Button>
            
            <Button 
              variant="secondary" 
              className="h-8 w-8 rounded-md p-0 bg-white hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
              onClick={resetView}
              title="Reset View"
            >
              <Locate className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </Button>
          </div>
          
          {/* Layer Selector */}
          <div className="mt-2 text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center border-b pb-1 border-gray-200 dark:border-gray-700">
            <Layers className="h-3 w-3 mr-1" /> Map Style
          </div>
          
          <div className="grid grid-cols-1 gap-1 mt-1">
            <select
              value={mapStyle}
              onChange={(e) => setMapStyle(e.target.value)}
              className="text-xs border border-gray-200 dark:border-gray-700 rounded p-1 bg-white dark:bg-gray-700 dark:text-gray-200"
            >
              {mapStyles.map(style => (
                <option key={style.id} value={style.id}>
                  {style.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Status Display */}
        <div className="bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 backdrop-blur-sm p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-600 dark:text-gray-300 font-medium flex items-center">
              <Ship className="h-3 w-3 mr-1 text-blue-500" /> Vessels
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{vessels.length}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-600 dark:text-gray-300 font-medium">→ Tracked</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{displayVessels.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300 font-medium flex items-center">
              <Factory className="h-3 w-3 mr-1 text-green-500" /> Refineries
            </span>
            <span className="font-bold text-green-600 dark:text-green-400">{refineries.length}</span>
          </div>
        </div>
      </div>
      
      {/* Coordinates Display - Bottom Left */}
      <div className="coordinates-display map-overlay">
        <div className="flex items-center">
          <Navigation className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />
          <span id="map-coordinates" className="font-mono">0.000°N, 0.000°E</span>
        </div>
      </div>
    </>
  );
}