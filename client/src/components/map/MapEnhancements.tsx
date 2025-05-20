import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Weather overlay options
type WeatherOverlayType = 'temperature' | 'precipitation' | 'wind' | 'pressure' | 'clouds' | 'none';

// Map Enhancement component that adds advanced features to the map
const MapEnhancements: React.FC<{
  enableWeather?: boolean;
  enableSeaState?: boolean;
  enableMapStyles?: boolean;
  enableShippingLanes?: boolean;
  weatherType?: WeatherOverlayType;
}> = ({ 
  enableWeather = true, 
  enableSeaState = true, 
  enableMapStyles = true,
  enableShippingLanes = true,
  weatherType = 'none'
}) => {
  const map = useMap();
  const layersRef = useRef<{[key: string]: L.Layer}>({});
  const [currentWeatherType, setCurrentWeatherType] = useState<WeatherOverlayType>(weatherType);
  const [seaStateVisible, setSeaStateVisible] = useState<boolean>(false);
  const [shippingLanesVisible, setShippingLanesVisible] = useState<boolean>(false);
  
  // Initialize advanced map features
  useEffect(() => {
    // Only add controls if they don't already exist
    if (!map || Object.keys(layersRef.current).length > 0) return;
    
    // Add map base layers (satellite, terrain, dark, etc.)
    if (enableMapStyles) {
      addMapStyles();
    }
    
    // Add weather overlay if enabled
    if (enableWeather) {
      addWeatherLayer(currentWeatherType);
    }
    
    // Add sea state data if enabled
    if (enableSeaState) {
      addSeaStateLayer();
    }
    
    // Add shipping lanes if enabled
    if (enableShippingLanes) {
      addShippingLanes();
    }
    
    // Add control panel to UI
    addControlPanel();
    
    // Cleanup function
    return () => {
      Object.values(layersRef.current).forEach(layer => {
        if (map && layer) {
          map.removeLayer(layer);
        }
      });
      
      layersRef.current = {};
    };
  }, [map, enableWeather, enableSeaState, enableMapStyles, enableShippingLanes]);
  
  // Update weather layer when type changes
  useEffect(() => {
    if (enableWeather && currentWeatherType !== weatherType) {
      setCurrentWeatherType(weatherType);
      addWeatherLayer(weatherType);
    }
  }, [weatherType, enableWeather]);
  
  // Add different map styles (satellite, terrain, dark mode, etc.)
  const addMapStyles = () => {
    // Standard OpenStreetMap layer (already added as base)
    const openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    
    // Satellite imagery
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    
    // Terrain map
    const terrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png', {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abcd',
      minZoom: 0,
      maxZoom: 18
    });
    
    // Dark mode map
    const darkMode = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
      subdomains: 'abcd',
      maxZoom: 19
    });
    
    // Nautical chart style
    const nautical = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
    });
    
    // Add as base layers - only one can be active at a time
    const baseLayers = {
      "Standard": openStreetMap,
      "Satellite": satellite,
      "Terrain": terrain,
      "Dark Mode": darkMode,
      "Nautical": nautical
    };
    
    // Add layer control
    L.control.layers(baseLayers, {}, { position: 'bottomleft' }).addTo(map);
    
    // Store layers in ref
    layersRef.current = { ...layersRef.current, ...baseLayers };
  };
  
  // Add weather overlay layer
  const addWeatherLayer = (type: WeatherOverlayType) => {
    // Remove existing weather layer if any
    Object.keys(layersRef.current).forEach(key => {
      if (key.startsWith('weather_')) {
        map.removeLayer(layersRef.current[key]);
        delete layersRef.current[key];
      }
    });
    
    if (type === 'none') return;
    
    // Weather API layer parameter
    let weatherParam = '';
    
    switch (type) {
      case 'temperature':
        weatherParam = 'temp_new';
        break;
      case 'precipitation':
        weatherParam = 'precipitation_new';
        break;
      case 'wind':
        weatherParam = 'wind_new';
        break;
      case 'pressure':
        weatherParam = 'pressure_new';
        break;
      case 'clouds':
        weatherParam = 'clouds_new';
        break;
      default:
        return;
    }
    
    // Create a weather overlay using OpenWeatherMap
    // Note: This is a free tier with attribution
    const weatherLayer = L.tileLayer(`https://tile.openweathermap.org/map/${weatherParam}/{z}/{x}/{y}.png?appid=9de243494c0b295cca9337e1e96b00e2`, {
      attribution: '&copy; <a href="https://openweathermap.org">OpenWeatherMap</a>',
      maxZoom: 19,
      opacity: 0.6
    });
    
    // Add weather layer
    weatherLayer.addTo(map);
    
    // Store in ref
    layersRef.current[`weather_${type}`] = weatherLayer;
  };
  
  // Add sea state visualization
  const addSeaStateLayer = () => {
    // Create a sea state layer with wave heights (simulated data in this example)
    // In a real implementation, this would fetch data from an oceanic data API
    
    // Create a canvas overlay
    const seaStateLayer = L.layerGroup();
    
    // Function to simulate wave height data based on lat/lng
    const getWaveHeight = (lat: number, lng: number): number => {
      // Simulate wave heights - in real implementation, fetch from API
      const base = Math.sin(lat * 0.1) * Math.cos(lng * 0.1);
      return Math.abs(base * 5) + 0.5; // 0.5 to 5.5 meters
    };
    
    // Generate wave markers across the oceans
    const addWaveMarkers = () => {
      // Clear existing markers
      seaStateLayer.clearLayers();
      
      // Current viewport bounds
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      
      // Only show detailed wave data at certain zoom levels
      if (zoom < 5) return;
      
      // Spacing between markers depends on zoom level
      const spacing = 20 / Math.pow(1.3, zoom - 5);
      
      for (let lat = bounds.getSouth(); lat <= bounds.getNorth(); lat += spacing) {
        for (let lng = bounds.getWest(); lng <= bounds.getEast(); lng += spacing) {
          // Only add markers in oceanic areas (simplified check)
          if (isLikelyWater(lat, lng)) {
            const waveHeight = getWaveHeight(lat, lng);
            
            // Color based on wave height
            const color = getWaveHeightColor(waveHeight);
            
            // Create wave marker
            const waveMarker = L.circleMarker([lat, lng], {
              radius: 3 + waveHeight,
              fillColor: color,
              color: 'rgba(0,0,0,0.3)',
              weight: 0.5,
              opacity: 0.8,
              fillOpacity: 0.6
            });
            
            // Add popup with wave info
            waveMarker.bindTooltip(`Wave height: ${waveHeight.toFixed(1)}m`, {
              direction: 'top',
              offset: L.point(0, -5)
            });
            
            seaStateLayer.addLayer(waveMarker);
          }
        }
      }
    };
    
    // Simplified check if a point is likely in water
    // In a real implementation, use a more accurate method
    const isLikelyWater = (lat: number, lng: number): boolean => {
      // This is a very simplified approximation
      // Pacific Ocean
      if ((lng > 140 || lng < -120) && (lat < 60 && lat > -60)) return true;
      
      // Atlantic Ocean
      if ((lng > -65 && lng < -10) && (lat < 65 && lat > -50)) return true;
      
      // Indian Ocean
      if ((lng > 50 && lng < 100) && (lat < 25 && lat > -45)) return true;
      
      // Mediterranean Sea
      if ((lng > -5 && lng < 35) && (lat > 30 && lat < 45)) return true;
      
      // Gulf of Mexico
      if ((lng > -98 && lng < -80) && (lat > 18 && lat < 30)) return true;
      
      return false;
    };
    
    // Get color based on wave height
    const getWaveHeightColor = (height: number): string => {
      if (height < 1) return '#00bcd4'; // Calm - light blue
      if (height < 2) return '#039be5'; // Light - blue
      if (height < 3) return '#1976d2'; // Moderate - medium blue
      if (height < 4) return '#303f9f'; // Rough - dark blue
      if (height < 5) return '#6a1b9a'; // Very rough - purple
      return '#c2185b'; // High - red/pink
    };
    
    // Add wave markers initially
    addWaveMarkers();
    
    // Update wave markers when map is moved
    map.on('moveend', addWaveMarkers);
    
    // Add layer to map but keep it invisible initially
    seaStateLayer.addTo(map);
    map.removeLayer(seaStateLayer); // Remove until toggled on
    
    // Store in ref for later access
    layersRef.current['seaState'] = seaStateLayer;
  };
  
  // Add global shipping lanes
  const addShippingLanes = () => {
    // Create a layer for the shipping lanes
    const shippingLanesLayer = L.layerGroup();
    
    // Major shipping lanes - in a real implementation, fetch from an API or GeoJSON source
    const majorShippingLanes = [
      // Atlantic routes
      { 
        from: [40.7128, -74.006], // New York
        to: [51.5074, -0.1278], // London
        width: 4,
        color: '#ffc107',
        name: 'New York - London'
      },
      { 
        from: [51.5074, -0.1278], // London
        to: [35.6762, 139.6503], // Tokyo
        width: 3,
        color: '#ff9800',
        name: 'London - Tokyo (Suez Route)'
      },
      { 
        from: [22.3193, 114.1694], // Hong Kong
        to: [34.0522, -118.2437], // Los Angeles
        width: 5,
        color: '#f44336',
        name: 'Hong Kong - Los Angeles (Trans-Pacific)'
      },
      { 
        from: [1.3521, 103.8198], // Singapore
        to: [31.2304, 121.4737], // Shanghai
        width: 4,
        color: '#ff5722',
        name: 'Singapore - Shanghai'
      },
      { 
        from: [1.3521, 103.8198], // Singapore
        to: [19.0760, 72.8777], // Mumbai
        width: 3,
        color: '#ff9800',
        name: 'Singapore - Mumbai'
      },
      { 
        from: [25.2048, 55.2708], // Dubai
        to: [1.3521, 103.8198], // Singapore
        width: 4,
        color: '#ffc107',
        name: 'Dubai - Singapore'
      },
      { 
        from: [31.2304, 121.4737], // Shanghai
        to: [37.7749, -122.4194], // San Francisco
        width: 5,
        color: '#f44336',
        name: 'Shanghai - San Francisco'
      },
      { 
        from: [40.7128, -74.006], // New York
        to: [22.3193, 114.1694], // Hong Kong
        width: 3,
        color: '#ff5722',
        name: 'New York - Hong Kong (Panama Canal)'
      },
      { 
        from: [53.3498, -6.2603], // Dublin
        to: [45.5017, -73.5673], // Montreal
        width: 2,
        color: '#ff9800',
        name: 'Dublin - Montreal'
      },
      { 
        from: [29.7604, -95.3698], // Houston
        to: [41.3851, 2.1734], // Barcelona
        width: 3,
        color: '#ffc107',
        name: 'Houston - Barcelona'
      }
    ];
    
    // Add lanes to the map with animated dashed lines
    majorShippingLanes.forEach((lane) => {
      // Create a curved path between points to simulate realistic shipping routes
      const curvedPath = generateCurvedPath([lane.from[0], lane.from[1]], [lane.to[0], lane.to[1]]);
      
      // Create polyline with dash animation
      const polyline = L.polyline(curvedPath, {
        color: lane.color,
        weight: lane.width,
        opacity: 0.7,
        dashArray: '10, 10',
        lineJoin: 'round',
        className: 'animated-dash'
      }).addTo(shippingLanesLayer);
      
      // Add popup with lane info
      polyline.bindTooltip(lane.name, {
        permanent: false,
        direction: 'center',
        className: 'shipping-lane-tooltip'
      });
    });
    
    // Generate a curved path between two points for more realistic shipping routes
    function generateCurvedPath(start: [number, number], end: [number, number]): [number, number][] {
      const points: [number, number][] = [];
      const numPoints = 20; // Number of points to generate
      
      // Check if route should go around continents (very simplified)
      const startLng = start[1];
      const endLng = end[1];
      const startLat = start[0];
      const endLat = end[0];
      
      // Determine if the route crosses the Pacific
      const crossesPacific = Math.abs(startLng - endLng) > 180;
      
      // Determine if the route should go through Panama Canal
      const goesThroughPanama = (
        // Route between Atlantic and Pacific
        ((startLng < -50 && endLng > -90) || (startLng > -90 && endLng < -50)) &&
        // Both in northern hemisphere
        (startLat > 0 && endLat > 0)
      );
      
      // Determine if the route should go through Suez Canal
      const goesThroughSuez = (
        // Route between Europe/Mediterranean and Asia
        ((startLng < 40 && endLng > 40) || (startLng > 40 && endLng < 40)) &&
        // Both not too far south
        (startLat > -30 && endLat > -30)
      );
      
      if (crossesPacific) {
        // Create a path that goes across the Pacific properly
        for (let i = 0; i <= numPoints; i++) {
          const ratio = i / numPoints;
          let lat, lng;
          
          // Create a curved path that avoids going straight across the Pacific
          if (startLng > 0 && endLng < 0) {
            // Going East to West (e.g., Tokyo to LA)
            lng = startLng + ratio * ((endLng + 360) - startLng);
            if (lng > 180) lng -= 360;
          } else {
            // Going West to East (e.g., LA to Tokyo)
            lng = startLng + ratio * ((endLng - 360) - startLng);
            if (lng < -180) lng += 360;
          }
          
          // Add a curve to avoid going straight across the ocean
          const latCurve = Math.sin(ratio * Math.PI) * 10;
          if (startLat > 0 && endLat > 0) {
            // Northern hemisphere - curve north
            lat = startLat + ratio * (endLat - startLat) + latCurve;
          } else {
            // Southern hemisphere or cross-equator - curve south
            lat = startLat + ratio * (endLat - startLat) - latCurve;
          }
          
          points.push([lat, lng]);
        }
      } else if (goesThroughPanama) {
        // Create a path that goes through the Panama Canal
        const panamaCoords: [number, number] = [9.08, -79.68]; // Approximate Panama Canal location
        
        // Create route with waypoint through Panama
        for (let i = 0; i <= numPoints; i++) {
          const ratio = i / numPoints;
          
          // First half goes to Panama
          if (ratio < 0.5) {
            const segmentRatio = ratio * 2;
            const lat = start[0] + segmentRatio * (panamaCoords[0] - start[0]);
            const lng = start[1] + segmentRatio * (panamaCoords[1] - start[1]);
            points.push([lat, lng]);
          } 
          // Second half from Panama to destination
          else {
            const segmentRatio = (ratio - 0.5) * 2;
            const lat = panamaCoords[0] + segmentRatio * (end[0] - panamaCoords[0]);
            const lng = panamaCoords[1] + segmentRatio * (end[1] - panamaCoords[1]);
            points.push([lat, lng]);
          }
        }
      } else if (goesThroughSuez) {
        // Create a path that goes through the Suez Canal
        const suezCoords: [number, number] = [30.5, 32.3]; // Approximate Suez Canal location
        
        // Create route with waypoint through Suez
        for (let i = 0; i <= numPoints; i++) {
          const ratio = i / numPoints;
          
          // First half goes to Suez
          if (ratio < 0.5) {
            const segmentRatio = ratio * 2;
            const lat = start[0] + segmentRatio * (suezCoords[0] - start[0]);
            const lng = start[1] + segmentRatio * (suezCoords[1] - start[1]);
            points.push([lat, lng]);
          } 
          // Second half from Suez to destination
          else {
            const segmentRatio = (ratio - 0.5) * 2;
            const lat = suezCoords[0] + segmentRatio * (end[0] - suezCoords[0]);
            const lng = suezCoords[1] + segmentRatio * (end[1] - suezCoords[1]);
            points.push([lat, lng]);
          }
        }
      } else {
        // Standard curved route
        for (let i = 0; i <= numPoints; i++) {
          const ratio = i / numPoints;
          
          // Latitude follows a slight curve using sine
          const latCurve = Math.sin(ratio * Math.PI) * 5;
          const lat = start[0] + ratio * (end[0] - start[0]) + 
                      (Math.abs(start[0] - end[0]) > 20 ? latCurve : 0);
          
          // Longitude follows a direct line
          const lng = start[1] + ratio * (end[1] - start[1]);
          
          points.push([lat, lng]);
        }
      }
      
      return points;
    }
    
    // Add stylesheet for dashed animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes dash {
        to {
          stroke-dashoffset: 40;
        }
      }
      
      .animated-dash {
        animation: dash 30s linear infinite;
        animation-direction: reverse;
      }
      
      .shipping-lane-tooltip {
        background-color: rgba(0, 0, 0, 0.7);
        border: none;
        color: white;
        font-weight: bold;
        padding: 6px 8px;
        border-radius: 4px;
      }
    `;
    document.head.appendChild(style);
    
    // Add to map but keep it invisible initially
    shippingLanesLayer.addTo(map);
    map.removeLayer(shippingLanesLayer); // Remove until toggled on
    
    // Store in ref for later access
    layersRef.current['shippingLanes'] = shippingLanesLayer;
  };
  
  // Add a custom control panel for the advanced features
  const addControlPanel = () => {
    // Create custom control
    const ControlPanel = L.Control.extend({
      options: {
        position: 'topright'
      },
      
      onAdd: function() {
        // Create control container
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control advanced-map-controls');
        container.style.backgroundColor = '#fff';
        container.style.padding = '8px';
        container.style.borderRadius = '4px';
        container.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)';
        container.style.cursor = 'auto';
        container.style.color = '#333';
        
        // Stop propagation of click events
        L.DomEvent.disableClickPropagation(container);
        
        // Create control title
        const title = L.DomUtil.create('div', 'control-title', container);
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '8px';
        title.style.borderBottom = '1px solid #ddd';
        title.style.paddingBottom = '4px';
        title.innerHTML = 'Advanced Features';
        
        // Weather controls
        if (enableWeather) {
          const weatherDiv = L.DomUtil.create('div', 'weather-controls', container);
          
          const weatherLabel = L.DomUtil.create('div', 'control-label', weatherDiv);
          weatherLabel.innerHTML = 'Weather Layer:';
          weatherLabel.style.marginBottom = '4px';
          
          const weatherOptions: WeatherOverlayType[] = [
            'none', 'temperature', 'precipitation', 'wind', 'pressure', 'clouds'
          ];
          
          // Create weather type selector
          const weatherSelect = L.DomUtil.create('select', 'weather-select', weatherDiv);
          weatherSelect.style.width = '100%';
          weatherSelect.style.marginBottom = '8px';
          weatherSelect.style.padding = '3px';
          
          weatherOptions.forEach(type => {
            const option = L.DomUtil.create('option', '', weatherSelect);
            option.value = type;
            option.selected = type === currentWeatherType;
            
            // Format option text
            let optionText = type.charAt(0).toUpperCase() + type.slice(1);
            if (type === 'none') optionText = 'No Weather';
            
            option.textContent = optionText;
          });
          
          // Handle weather selection
          L.DomEvent.on(weatherSelect, 'change', (e) => {
            const target = e.target as HTMLSelectElement;
            setCurrentWeatherType(target.value as WeatherOverlayType);
            addWeatherLayer(target.value as WeatherOverlayType);
          });
        }
        
        // Sea state toggle
        if (enableSeaState) {
          const seaStateDiv = L.DomUtil.create('div', 'sea-state-controls', container);
          
          const seaStateCheckbox = L.DomUtil.create('input', '', seaStateDiv);
          seaStateCheckbox.type = 'checkbox';
          seaStateCheckbox.id = 'sea-state-toggle';
          seaStateCheckbox.checked = seaStateVisible;
          seaStateCheckbox.style.marginRight = '5px';
          
          const seaStateLabel = L.DomUtil.create('label', '', seaStateDiv);
          seaStateLabel.htmlFor = 'sea-state-toggle';
          seaStateLabel.innerHTML = 'Show Sea State';
          
          // Handle checkbox change
          L.DomEvent.on(seaStateCheckbox, 'change', () => {
            const newState = !seaStateVisible;
            setSeaStateVisible(newState);
            
            if (newState) {
              if (layersRef.current['seaState']) map.addLayer(layersRef.current['seaState']);
            } else {
              if (layersRef.current['seaState']) map.removeLayer(layersRef.current['seaState']);
            }
          });
        }
        
        // Shipping lanes toggle
        if (enableShippingLanes) {
          const lanesDiv = L.DomUtil.create('div', 'lanes-controls', container);
          lanesDiv.style.marginTop = '8px';
          
          const lanesCheckbox = L.DomUtil.create('input', '', lanesDiv);
          lanesCheckbox.type = 'checkbox';
          lanesCheckbox.id = 'lanes-toggle';
          lanesCheckbox.checked = shippingLanesVisible;
          lanesCheckbox.style.marginRight = '5px';
          
          const lanesLabel = L.DomUtil.create('label', '', lanesDiv);
          lanesLabel.htmlFor = 'lanes-toggle';
          lanesLabel.innerHTML = 'Major Shipping Lanes';
          
          // Handle checkbox change
          L.DomEvent.on(lanesCheckbox, 'change', () => {
            const newState = !shippingLanesVisible;
            setShippingLanesVisible(newState);
            
            if (newState) {
              if (layersRef.current['shippingLanes']) map.addLayer(layersRef.current['shippingLanes']);
            } else {
              if (layersRef.current['shippingLanes']) map.removeLayer(layersRef.current['shippingLanes']);
            }
          });
        }
        
        return container;
      }
    });
    
    // Add control to map
    new ControlPanel().addTo(map);
  };
  
  return null; // This component doesn't render anything directly
};

export default MapEnhancements;