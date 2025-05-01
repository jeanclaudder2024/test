import { useEffect, useRef, useState } from 'react';
import { Vessel, Refinery } from '@shared/schema';
import { Station } from '@/services/stationService';
import { REGIONS } from '@/../../shared/constants';
import { Loader2, Navigation, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Import station SVG assets
import stationSvgUrl from '@assets/station.svg';
import stationSelectedSvgUrl from '@assets/station-selected.svg';

// Add MarkerClusterGroup interface to Leaflet
declare module 'leaflet' {
  interface MarkerClusterGroupOptions {
    maxClusterRadius?: number;
    spiderfyOnMaxZoom?: boolean;
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    chunkedLoading?: boolean;
    disableClusteringAtZoom?: number;
  }
  
  class MarkerClusterGroup extends L.FeatureGroup {
    constructor(options?: MarkerClusterGroupOptions);
    addLayer(layer: L.Layer): this;
    clearLayers(): this;
  }
  
  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
}

// Add vessel property to MarkerOptions
declare module 'leaflet' {
  interface MarkerOptions {
    vessel?: Vessel;
    refinery?: Refinery;
    port?: Vessel;
    station?: Station;
  }
}

// Type definitions
type Region = string;

interface EnhancedMapProps {
  vessels: Vessel[];
  refineries: Refinery[];
  ports?: Vessel[]; // Optional ports
  stations?: Station[]; // Optional stations from stations.json
  onVesselClick: (vessel: Vessel) => void;
  onRefineryClick?: (refinery: Refinery) => void;
  onPortClick?: (port: Vessel) => void;
  onStationClick?: (station: Station) => void; // Optional handler for station click events
  isLoading?: boolean;
  initialCenter?: [number, number]; // Optional [lat, lng] initial center
  initialZoom?: number;             // Optional initial zoom level
}

export default function EnhancedMap({
  vessels,
  refineries,
  ports = [],
  stations = [],
  onVesselClick,
  onRefineryClick,
  onPortClick,
  onStationClick,
  isLoading = false,
  initialCenter,
  initialZoom = 3
}: EnhancedMapProps) {
  // Refs
  const mapRef = useRef<L.Map | null>(null);
  const vesselMarkersRef = useRef<L.Marker[]>([]);
  const refineryMarkersRef = useRef<L.Marker[]>([]);
  const portMarkersRef = useRef<L.Marker[]>([]);
  const stationMarkersRef = useRef<L.Marker[]>([]);
  const connectionLinesRef = useRef<L.Polyline[]>([]);
  const markerClustersRef = useRef<L.MarkerClusterGroup | null>(null);
  
  // State
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedVesselId, setSelectedVesselId] = useState<number | null>(null);
  const [selectedRefineryId, setSelectedRefineryId] = useState<number | null>(null);
  const [selectedPortId, setSelectedPortId] = useState<number | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  
  // Clear all connection lines
  const clearConnectionLines = () => {
    if (!mapRef.current) return;
    
    connectionLinesRef.current.forEach(line => {
      if (mapRef.current) {
        line.remove();
      }
    });
    
    connectionLinesRef.current = [];
  };
  
  // Draw a connection between vessels and a refinery/port
  const drawConnectionToVessels = (
    sourceMarker: L.Marker, 
    targetVessels: Vessel[], 
    color: string = 'rgba(59, 130, 246, 0.6)'
  ) => {
    if (!mapRef.current) return;
    
    const sourcePoint = sourceMarker.getLatLng();
    
    // Find all vessel markers that match the target vessels
    const targetMarkers = vesselMarkersRef.current.filter(marker => {
      const vessel = marker.options.vessel as Vessel;
      return targetVessels.some(v => v.id === vessel.id);
    });
    
    // Draw lines to each vessel
    targetMarkers.forEach(targetMarker => {
      const targetPoint = targetMarker.getLatLng();
      
      const line = L.polyline([sourcePoint, targetPoint], {
        color: color,
        weight: 2,
        opacity: 0.7,
        dashArray: '5, 7',
        className: 'vessel-refinery-connection'
      }).addTo(mapRef.current!);
      
      // Add the line to the ref for later cleanup
      connectionLinesRef.current.push(line);
      
      // Highlight the vessel marker
      const markerElement = targetMarker.getElement();
      if (markerElement) {
        markerElement.classList.add('nearby-vessel-highlight');
      }
    });
  };

  // Initialize map on component mount
  useEffect(() => {
    // Exit if the map is already initialized
    if (mapRef.current) return;
    
    try {
      // Initialize the map
      const map = L.map('map-container', {
        center: initialCenter || [20, 0], // Default center if none provided
        zoom: initialZoom,
        layers: [
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          })
        ],
        zoomControl: true,
        attributionControl: true
      });
      
      // Create a marker cluster group for vessel markers
      const markerCluster = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,
        zoomToBoundsOnClick: true,
        chunkedLoading: true,
        disableClusteringAtZoom: 10
      });
      
      // Store references
      mapRef.current = map;
      markerClustersRef.current = markerCluster;
      
      // Add the marker cluster to the map
      map.addLayer(markerCluster);
      
      // Set map as ready
      setMapReady(true);
      
      // Cleanup function
      return () => {
        // Clean up map on component unmount
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
          vesselMarkersRef.current = [];
          refineryMarkersRef.current = [];
          portMarkersRef.current = [];
          stationMarkersRef.current = [];
          connectionLinesRef.current = [];
          setMapReady(false);
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map. Please refresh the page.');
    }
  }, [initialCenter, initialZoom]);

  // Update markers when the data changes
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    
    // Clear existing vessel markers
    if (markerClustersRef.current) {
      markerClustersRef.current.clearLayers();
    }
    
    // Clear existing refinery markers
    refineryMarkersRef.current.forEach(marker => {
      if (mapRef.current) {
        marker.remove();
      }
    });
    refineryMarkersRef.current = [];
    
    // Clear existing port markers
    portMarkersRef.current.forEach(marker => {
      if (mapRef.current) {
        marker.remove();
      }
    });
    portMarkersRef.current = [];
    
    // Clear existing station markers
    stationMarkersRef.current.forEach(marker => {
      if (mapRef.current) {
        marker.remove();
      }
    });
    stationMarkersRef.current = [];
    
    // Clear connection lines
    clearConnectionLines();
    
    // Get map instance
    const map = mapRef.current;
    const clusterGroup = markerClustersRef.current;
    
    if (!map || !clusterGroup) return;
    
    console.log(`Processing ${vessels.length} vessels for display on map`);
    
    // Process vessels
    vessels.forEach(vessel => {
      // Check for either lat/lng or currentLat/currentLng
      const hasCoordinates = (vessel.lat && vessel.lng) || (vessel.currentLat && vessel.currentLng);
      if (!hasCoordinates) return;
      
      // Parse coordinates - prioritize lat/lng but fall back to currentLat/currentLng
      const latValue = vessel.lat || vessel.currentLat;
      const lngValue = vessel.lng || vessel.currentLng;
      
      const lat = typeof latValue === 'string' ? parseFloat(latValue) : latValue;
      const lng = typeof lngValue === 'string' ? parseFloat(lngValue) : lngValue;
      
      if (isNaN(lat) || isNaN(lng)) return;
      
      // Get vessel color based on type
      const getVesselColor = () => {
        const type = vessel.vesselType?.toLowerCase() || '';
        if (type.includes('tanker') || type.includes('oil')) return "#ef4444"; // red
        if (type.includes('lng') || type.includes('gas')) return "#10b981"; // green
        if (type.includes('cargo')) return "#f59e0b"; // amber
        if (type.includes('container')) return "#3b82f6"; // blue
        if (type.includes('chemical')) return "#8b5cf6"; // purple
        return "#6b7280"; // gray default
      };
      
      // Get pulse color for animation
      const getPulseColor = () => {
        const type = vessel.vesselType?.toLowerCase() || '';
        if (type.includes('tanker') || type.includes('oil')) return "#ef4444"; // red
        if (type.includes('lng') || type.includes('gas')) return "#10b981"; // green
        if (type.includes('cargo')) return "#f59e0b"; // amber
        if (type.includes('container')) return "#3b82f6"; // blue
        if (type.includes('chemical')) return "#8b5cf6"; // purple
        return "#6b7280"; // gray default
      };
      
      // Create SVG icon for vessel
      const vesselIcon = L.divIcon({
        html: `
          <div class="vessel-marker-container">
            <div class="vessel-marker-pulse" style="border-color: ${getVesselColor()};"></div>
            <div class="vessel-marker" style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: white;
              border: 3px solid ${getVesselColor()};
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
              text-align: center;
              z-index: 900;
              display: flex;
              align-items: center;
              justify-content: center;
              transform: rotate(${vessel.heading || 0}deg);
              transition: all 0.3s ease;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" 
                stroke="${getVesselColor()}" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 20a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1" />
                <path d="M4 18l-1 -5h18l-1 5" />
                <path d="M5 13v-6h8l4 6" />
                <path d="M7 7v-4h-1" />
              </svg>
            </div>
          </div>
        `,
        className: `vessel-marker-wrapper vessel-marker-${vessel.vesselType?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'unknown'}`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      
      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'vessel-popup';
      popupContent.innerHTML = `
        <div class="vessel-popup-header" style="
          border-bottom: 2px solid ${getVesselColor()};
          padding: 8px;
          margin: -8px -8px 8px -8px;
          background-color: rgba(255,255,255,0.9);
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          <div style="
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid ${getVesselColor()};
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" stroke-width="2" 
              stroke="${getVesselColor()}" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 20a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1" />
              <path d="M4 18l-1 -5h18l-1 5" />
              <path d="M5 13v-6h8l4 6" />
              <path d="M7 7v-4h-1" />
            </svg>
          </div>
          <h3 style="
            font-weight: bold;
            margin: 0;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
          ">${vessel.name}</h3>
        </div>
        
        <div style="padding: 0 8px 8px; font-size: 12px; line-height: 1.6;">
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">🔍</span>
            <span style="font-weight: 500; margin-right: 4px; color: #555;">IMO:</span>
            <span style="flex: 1;">${vessel.imo || 'N/A'}</span>
          </div>
          
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">🚢</span>
            <span style="font-weight: 500; margin-right: 4px; color: #555;">Type:</span>
            <span style="flex: 1;">${vessel.vesselType || 'Unknown'}</span>
          </div>
          
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">🌊</span>
            <span style="font-weight: 500; margin-right: 4px; color: #555;">Speed:</span>
            <span style="flex: 1;">${vessel.speed ? vessel.speed + ' knots' : 'N/A'}</span>
          </div>
          
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">🧭</span>
            <span style="font-weight: 500; margin-right: 4px; color: #555;">Heading:</span>
            <span style="flex: 1;">${vessel.heading ? vessel.heading + '°' : 'N/A'}</span>
          </div>
          
          ${vessel.cargoType ? `
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">📦</span>
            <span style="font-weight: 500; margin-right: 4px; color: #555;">Cargo:</span>
            <span style="flex: 1;">${vessel.cargoType}</span>
          </div>
          ` : ''}
          
          ${vessel.destination ? `
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">🏁</span>
            <span style="font-weight: 500; margin-right: 4px; color: #555;">Destination:</span>
            <span style="flex: 1;">${vessel.destination}</span>
          </div>
          ` : ''}
          
          <div style="
            border-top: 1px solid #eee;
            margin-top: 8px;
            padding-top: 8px;
            display: flex;
            justify-content: center;
            gap: 6px;
          ">
            <button id="view-details-btn-${vessel.id}" style="
              background-color: ${getVesselColor()};
              color: white;
              padding: 3px 6px;
              border-radius: 4px;
              font-size: 10px;
              border: none;
              cursor: pointer;
            ">
              View Details
            </button>
            <button id="track-btn-${vessel.id}" style="
              background-color: #f8f9fa;
              color: #555;
              padding: 3px 6px;
              border-radius: 4px;
              font-size: 10px;
              border: 1px solid #ddd;
              cursor: pointer;
            ">
              Track Vessel
            </button>
          </div>
        </div>
      `;
      
      // Create the vessel marker
      const marker = L.marker([lat, lng], { 
        icon: vesselIcon,
        vessel: vessel // Store vessel data in the marker options for easy access
      });
      
      // Bind popup to vessel marker
      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'vessel-popup-container',
        autoPan: true
      });
      
      // Add event listeners
      marker.on('click', () => {
        setSelectedVesselId(vessel.id);
      });
      
      marker.on('popupopen', () => {
        // Add event listeners to buttons after the popup is opened
        setTimeout(() => {
          const viewDetailsBtn = document.getElementById(`view-details-btn-${vessel.id}`);
          const trackBtn = document.getElementById(`track-btn-${vessel.id}`);
          
          if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', (e: MouseEvent) => {
              e.stopPropagation();
              onVesselClick(vessel);
              marker.closePopup();
            });
          }
          
          if (trackBtn) {
            trackBtn.addEventListener('click', (e: MouseEvent) => {
              e.stopPropagation();
              
              // First, clear any previous tracking states
              document.querySelectorAll('.tracking-active').forEach(el => {
                el.classList.remove('tracking-active');
              });
              
              // Make sure popup stays open when tracking
              e.preventDefault();
              
              // Highlight the marker
              const markerEl = marker.getElement();
              if (markerEl) {
                markerEl.classList.add('tracking-active');
              }
              
              // Create a notification
              const notification = document.createElement('div');
              notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(255, 255, 255, 0.95);
                color: #333;
                padding: 10px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                font-size: 14px;
                text-align: center;
                border-left: 4px solid ${getVesselColor()};
                font-weight: 500;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
              `;
              notification.innerHTML = `Tracking vessel: ${vessel.name}`;
              document.body.appendChild(notification);
              
              // Remove notification after 3 seconds
              setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(-50%) translateY(-20px)';
                
                setTimeout(() => {
                  document.body.removeChild(notification);
                }, 300);
              }, 3000);
            });
          }
        }, 100);
      });
      
      // Add marker to the cluster group
      clusterGroup.addLayer(marker);
      
      // Store the marker for later reference
      vesselMarkersRef.current.push(marker);
    });
    
    // Process refineries
    console.log(`Processing ${refineries.length} refineries for display on map`);
    refineries.forEach(refinery => {
      if (!refinery.lat || !refinery.lng) return;
      
      // Parse coordinates
      const lat = typeof refinery.lat === 'string' ? parseFloat(refinery.lat) : refinery.lat;
      const lng = typeof refinery.lng === 'string' ? parseFloat(refinery.lng) : refinery.lng;
      
      if (isNaN(lat) || isNaN(lng)) return;
      
      // Get color based on refinery status
      const getRefineryColor = () => {
        const status = refinery.status?.toLowerCase() || '';
        if (status.includes('active') || status.includes('operational')) return "#22c55e"; // green
        if (status.includes('maintenance')) return "#f59e0b"; // amber
        if (status.includes('planned')) return "#3b82f6"; // blue
        if (status.includes('shutdown')) return "#ef4444"; // red
        return "#6b7280"; // gray default
      };
      
      // Create SVG icon for refinery
      const getRefineryIcon = () => {
        return `
          <svg width="28" height="28" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M138.142 85.9479C138.142 63.2129 156.562 44.8 179.307 44.8H261.689V119.703H138.142V85.9479Z" fill="#004D99"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M138.142 119.703H261.689V159.573H138.142V119.703Z" fill="#0066CC"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M187.142 199.443C171.797 199.443 158.462 188.463 158.462 174.861C158.462 161.282 171.797 158.881 187.142 158.881H212.689C228.034 158.881 241.369 161.282 241.369 174.861C241.369 188.463 228.034 199.443 212.689 199.443H187.142Z" fill="#1a1a1a"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M138.142 199.443H261.689V399.36H138.142V199.443Z" fill="#004D99"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M138.142 399.36H261.689V439.231H138.142V399.36Z" fill="#0066CC"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M123.867 439.231H275.964C283.62 439.231 289.724 445.334 289.724 452.991V506.24C289.724 513.341 283.62 519.444 275.964 519.444H123.867C116.211 519.444 110.107 513.341 110.107 506.24V452.991C110.107 445.334 116.211 439.231 123.867 439.231Z" fill="#00264D"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M397.64 379.093H336.396C327.697 379.093 322.064 369.32 326.598 362.053L356.935 311.936C358.157 309.908 358.563 307.485 358.563 305.064V127.823C358.563 122.149 363.292 117.421 369.039 117.421H378.491C392.306 117.421 406.317 117.269 406.317 137.177V305.064C406.317 307.485 406.722 309.908 407.944 311.936L438.281 362.053C442.814 369.32 437.182 379.093 428.483 379.093Z" fill="#0066CC"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M319.112 299.109H259.112C250.413 299.109 244.78 288.806 249.314 281.539L279.651 233.942C280.873 231.914 281.279 229.491 281.279 227.07C281.279 221.395 286.008 216.667 291.754 216.667C294.178 216.667 296.599 217.072 298.63 218.293L348.773 248.607C356.048 253.134 356.048 264.358 348.773 268.885L298.63 299.225C296.599 300.446 294.178 300.851 291.754 300.851H319.112Z" fill="#004D99"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M468.444 379.093V479.629C468.444 485.303 463.716 490.031 457.969 490.031H448.517C442.77 490.031 438.041 485.303 438.041 479.629V379.093H468.444Z" fill="#0066CC"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M417.778 439.23C424.115 439.23 429.448 444.562 429.448 450.9V460.341C429.448 466.679 424.115 472.011 417.778 472.011C411.44 472.011 406.107 466.679 406.107 460.341V450.9C406.107 444.562 411.44 439.23 417.778 439.23Z" fill="#004D99"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M417.778 399.36C424.115 399.36 429.448 404.693 429.448 411.03V420.471C429.448 426.809 424.115 432.141 417.778 432.141C411.44 432.141 406.107 426.809 406.107 420.471V411.03C406.107 404.693 411.44 399.36 417.778 399.36Z" fill="#004D99"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M509.333 44.8H397.64V85.948H509.333V44.8Z" fill="#0066CC"/>
          </svg>
        `;
      };
      
      // Create icon for refinery
      const refineryIcon = L.divIcon({
        html: `
          <div class="refinery-marker-container">
            <div class="refinery-marker-glow" style="background-color: ${getRefineryColor()}33;"></div>
            <div class="refinery-marker" style="
              width: 42px;
              height: 42px;
              border-radius: 8px;
              background: rgba(255,255,255,0.98);
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid ${getRefineryColor()};
              box-shadow: 0 3px 6px rgba(0,0,0,0.3);
              text-align: center;
              z-index: 910;
              position: relative;
              padding: 2px;
            ">
              ${getRefineryIcon()}
            </div>
          </div>
        `,
        className: 'refinery-marker-wrapper',
        iconSize: [45, 45],
        iconAnchor: [22, 22]
      });
      
      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'refinery-popup';
      popupContent.innerHTML = `
        <div class="refinery-popup-header" style="
          border-bottom: 2px solid ${getRefineryColor()};
          padding: 8px;
          margin: -8px -8px 8px -8px;
          background-color: rgba(255,255,255,0.9);
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          <div style="
            width: 26px;
            height: 26px;
            border-radius: 4px;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid ${getRefineryColor()};
            padding: 1px;
          ">${getRefineryIcon()}</div>
          <h3 style="
            font-weight: bold;
            margin: 0;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
          ">${refinery.name}</h3>
        </div>
        
        <div style="padding: 0 8px 8px; font-size: 12px; line-height: 1.6;">
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">🏢</span>
            <span style="font-weight: 500; margin-right: 4px; color: #555;">Company:</span>
            <span style="flex: 1;">${refinery.name}</span>
          </div>
          
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">🌍</span>
            <span style="font-weight: 500; margin-right: 4px; color: #555;">Country:</span>
            <span style="flex: 1;">${refinery.country || 'Unknown'}</span>
          </div>
          
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">🌐</span>
            <span style="font-weight: 500; margin-right: 4px; color: #555;">Region:</span>
            <span style="flex: 1;">${refinery.region || 'Unknown'}</span>
          </div>
          
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">📊</span>
            <span style="font-weight: 500; margin-right: 4px; color: #555;">Status:</span>
            <span style="
              flex: 1;
              color: ${getRefineryColor()};
              font-weight: 500;
            ">${refinery.status || 'Unknown'}</span>
          </div>
          
          ${refinery.capacity ? `
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">⚡</span>
            <span style="font-weight: 500; margin-right: 4px; color: #555;">Capacity:</span>
            <span style="flex: 1;">${refinery.capacity.toLocaleString()} bpd</span>
          </div>
          ` : ''}
          
          <div style="
            border-top: 1px solid #eee;
            margin-top: 8px;
            padding-top: 8px;
            display: flex;
            justify-content: center;
            gap: 6px;
          ">
            <button id="view-details-btn-${refinery.id}" style="
              background-color: ${getRefineryColor()};
              color: white;
              padding: 3px 6px;
              border-radius: 4px;
              font-size: 10px;
              border: none;
              cursor: pointer;
            ">
              View Details
            </button>
            <button id="view-vessels-btn-${refinery.id}" style="
              background-color: #f8f9fa;
              color: #555;
              padding: 3px 6px;
              border-radius: 4px;
              font-size: 10px;
              border: 1px solid #ddd;
              cursor: pointer;
            ">
              View Associated Vessels
            </button>
          </div>
        </div>
      `;
      
      // Create the refinery marker
      const marker = L.marker([lat, lng], { 
        icon: refineryIcon,
        refinery: refinery // Store refinery data in the marker
      });
      
      // Bind popup
      marker.bindPopup(popupContent, {
        maxWidth: 320,
        className: 'refinery-popup',
        autoClose: false,      // Don't auto close on map click
        closeOnClick: false,   // Keep popup open
        closeButton: true,     // Show close button
      });
      
      // Add event listeners
      marker.on('click', () => {
        setSelectedRefineryId(refinery.id);
        
        if (onRefineryClick) {
          onRefineryClick(refinery);
        }
      });
      
      marker.on('popupopen', () => {
        // Add click event listeners to buttons after popup is opened
        setTimeout(() => {
          const viewDetailsBtn = document.getElementById(`view-details-btn-${refinery.id}`);
          const viewVesselsBtn = document.getElementById(`view-vessels-btn-${refinery.id}`);
          
          if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', (e: MouseEvent) => {
              e.stopPropagation();
              if (onRefineryClick) {
                onRefineryClick(refinery);
              }
            });
          }
          
          if (viewVesselsBtn) {
            viewVesselsBtn.addEventListener('click', (e: MouseEvent) => {
              e.stopPropagation();
              
              // Clear any previous connection lines
              clearConnectionLines();
              
              // Remove any previous highlights
              document.querySelectorAll('.highlight-marker, .nearby-vessel-highlight').forEach(el => {
                el.classList.remove('highlight-marker', 'nearby-vessel-highlight');
              });
              
              // Show notification
              const notification = document.createElement('div');
              notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(255, 255, 255, 0.95);
                color: #333;
                padding: 10px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                font-size: 14px;
                text-align: center;
                border-left: 4px solid ${getRefineryColor()};
                font-weight: 500;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
              `;
              notification.innerHTML = `Showing vessels for refinery: ${refinery.name}`;
              document.body.appendChild(notification);
              
              // Find associated vessels (within ~500km of the refinery)
              // In a real app, this would call an API endpoint
              const nearbyVessels = vessels.filter(vessel => {
                // Check if vessel data is complete
                if (!vessel.lat || !vessel.lng) return false;
                
                // Parse coordinates
                const vLat = typeof vessel.lat === 'string' ? parseFloat(vessel.lat) : vessel.lat;
                const vLng = typeof vessel.lng === 'string' ? parseFloat(vessel.lng) : vessel.lng;
                
                if (isNaN(vLat) || isNaN(vLng)) return false;
                
                // Calculate rough distance using the Haversine formula
                const R = 6371; // Earth's radius in km
                const dLat = (vLat - lat) * Math.PI / 180;
                const dLon = (vLng - lng) * Math.PI / 180;
                const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                          Math.cos(lat * Math.PI / 180) * Math.cos(vLat * Math.PI / 180) * 
                          Math.sin(dLon/2) * Math.sin(dLon/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                const distance = R * c;
                
                // Return true if vessel is within ~500km of the refinery
                return distance <= 500;
              });
              
              // Create connections from the refinery to nearby vessels
              if (nearbyVessels.length > 0) {
                drawConnectionToVessels(marker, nearbyVessels);
                
                // Add subtle highlight effect to the marker
                const markerEl = marker.getElement();
                if (markerEl) {
                  markerEl.classList.add('highlight-marker');
                }
              }
              
              // Remove notification after 3 seconds
              setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(-50%) translateY(-20px)';
                
                setTimeout(() => {
                  document.body.removeChild(notification);
                }, 300);
              }, 3000);
            });
          }
        }, 100);
      });
      
      // Add marker directly to the map (not clustered)
      marker.addTo(map);
      
      // Store refinery marker for later reference
      refineryMarkersRef.current.push(marker);
    });
    
    // Process ports (similar to refineries but different styling)
    ports.forEach(port => {
      if (!port.lat || !port.lng) return;
      
      // Parse coordinates
      const lat = typeof port.lat === 'string' ? parseFloat(port.lat) : port.lat;
      const lng = typeof port.lng === 'string' ? parseFloat(port.lng) : port.lng;
      
      if (isNaN(lat) || isNaN(lng)) return;
      
      // Create icon for port
      const portIcon = L.divIcon({
        html: `
          <div class="port-marker-container">
            <div class="port-marker" style="
              width: 38px;
              height: 38px;
              border-radius: 4px;
              background: rgba(255,255,255,0.9);
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid #6366f1;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              text-align: center;
              z-index: 905;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 16a6 6 0 0 0-12 0v2h12v-2Z"></path>
                <path d="M4 21h16"></path>
                <path d="M4 21V9"></path>
                <path d="M12 13V3"></path>
                <path d="M20 21v-5"></path>
              </svg>
            </div>
          </div>
        `,
        className: 'port-marker-wrapper',
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });
      
      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'port-popup';
      popupContent.innerHTML = `
        <div class="port-popup-header" style="
          border-bottom: 2px solid #6366f1;
          padding: 8px;
          margin: -8px -8px 8px -8px;
          background-color: rgba(255,255,255,0.9);
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          <div style="
            width: 26px;
            height: 26px;
            border-radius: 4px;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #6366f1;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 16a6 6 0 0 0-12 0v2h12v-2Z"></path>
              <path d="M4 21h16"></path>
              <path d="M4 21V9"></path>
              <path d="M12 13V3"></path>
              <path d="M20 21v-5"></path>
            </svg>
          </div>
          <h3 style="
            font-weight: bold;
            margin: 0;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
          ">${port.name || 'Port'}</h3>
        </div>
        
        <div style="padding: 0 8px 8px; font-size: 12px; line-height: 1.6;">
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">🚢</span>
            <span style="font-weight: 500; margin-right: 4px; color: #555;">Port Type:</span>
            <span style="flex: 1;">Oil Terminal</span>
          </div>
          
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">🌍</span>
            <span style="font-weight: 500; margin-right: 4px; color: #555;">Location:</span>
            <span style="flex: 1;">${port.currentRegion || 'Unknown'}</span>
          </div>
          
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">📍</span>
            <span style="font-weight: 500; margin-right: 4px; color: #555;">Coordinates:</span>
            <span style="flex: 1;">${lat.toFixed(4)}, ${lng.toFixed(4)}</span>
          </div>
          
          <div style="
            border-top: 1px solid #eee;
            margin-top: 8px;
            padding-top: 8px;
            display: flex;
            justify-content: center;
            gap: 6px;
          ">
            <button id="view-vessels-at-port-btn-${port.id}" style="
              background-color: #6366f1;
              color: white;
              padding: 3px 8px;
              border-radius: 4px;
              font-size: 10px;
              border: none;
              cursor: pointer;
            ">
              Show Vessels at Port
            </button>
          </div>
        </div>
      `;
      
      // Create the port marker
      const marker = L.marker([lat, lng], { 
        icon: portIcon,
        port: port // Store port data in the marker
      });
      
      // Bind popup
      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'port-popup-container'
      });
      
      // Add event listeners
      marker.on('click', () => {
        setSelectedPortId(port.id);
        
        if (onPortClick) {
          onPortClick(port);
        }
      });
      
      marker.on('popupopen', () => {
        // Add click event listeners to buttons
        setTimeout(() => {
          const viewVesselsBtn = document.getElementById(`view-vessels-at-port-btn-${port.id}`);
          
          if (viewVesselsBtn) {
            viewVesselsBtn.addEventListener('click', (e: MouseEvent) => {
              e.stopPropagation();
              
              // Clear previous connections
              clearConnectionLines();
              
              // Find vessels at this port (within ~50km)
              const vesselsAtPort = vessels.filter(vessel => {
                if (!vessel.lat || !vessel.lng) return false;
                
                const vLat = typeof vessel.lat === 'string' ? parseFloat(vessel.lat) : vessel.lat;
                const vLng = typeof vessel.lng === 'string' ? parseFloat(vessel.lng) : vessel.lng;
                
                if (isNaN(vLat) || isNaN(vLng)) return false;
                
                // Calculate distance using the Haversine formula
                const R = 6371; // Earth's radius in km
                const dLat = (vLat - lat) * Math.PI / 180;
                const dLon = (vLng - lng) * Math.PI / 180;
                const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                          Math.cos(lat * Math.PI / 180) * Math.cos(vLat * Math.PI / 180) * 
                          Math.sin(dLon/2) * Math.sin(dLon/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                const distance = R * c;
                
                return distance <= 50; // 50km radius for port
              });
              
              // Create connections to vessels at this port
              if (vesselsAtPort.length > 0) {
                drawConnectionToVessels(marker, vesselsAtPort, 'rgba(99, 102, 241, 0.6)');
                
                // Highlight the port marker
                const markerEl = marker.getElement();
                if (markerEl) {
                  markerEl.classList.add('highlight-marker');
                }
                
                // Show notification
                const notification = document.createElement('div');
                notification.style.cssText = `
                  position: fixed;
                  top: 20px;
                  left: 50%;
                  transform: translateX(-50%);
                  background-color: rgba(255, 255, 255, 0.95);
                  color: #333;
                  padding: 10px 20px;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                  z-index: 10000;
                  font-size: 14px;
                  text-align: center;
                  border-left: 4px solid #6366f1;
                  font-weight: 500;
                  transition: all 0.3s ease;
                  backdrop-filter: blur(10px);
                  -webkit-backdrop-filter: blur(10px);
                `;
                notification.innerHTML = `
                  Showing ${vesselsAtPort.length} vessel${vesselsAtPort.length === 1 ? '' : 's'} at port: ${port.name || 'Port'}
                `;
                document.body.appendChild(notification);
                
                // Remove notification after 3 seconds
                setTimeout(() => {
                  notification.style.opacity = '0';
                  notification.style.transform = 'translateX(-50%) translateY(-20px)';
                  
                  setTimeout(() => {
                    document.body.removeChild(notification);
                  }, 300);
                }, 3000);
              } else {
                // Show no vessels notification
                const notification = document.createElement('div');
                notification.style.cssText = `
                  position: fixed;
                  top: 20px;
                  left: 50%;
                  transform: translateX(-50%);
                  background-color: rgba(255, 255, 255, 0.95);
                  color: #333;
                  padding: 10px 20px;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                  z-index: 10000;
                  font-size: 14px;
                  text-align: center;
                  border-left: 4px solid #6366f1;
                  font-weight: 500;
                  transition: all 0.3s ease;
                  backdrop-filter: blur(10px);
                  -webkit-backdrop-filter: blur(10px);
                `;
                notification.innerHTML = `No vessels currently at this port`;
                document.body.appendChild(notification);
                
                // Remove notification after 3 seconds
                setTimeout(() => {
                  notification.style.opacity = '0';
                  notification.style.transform = 'translateX(-50%) translateY(-20px)';
                  
                  setTimeout(() => {
                    document.body.removeChild(notification);
                  }, 300);
                }, 3000);
              }
            });
          }
        }, 100);
      });
      
      // Add marker directly to the map
      marker.addTo(map);
      
      // Store port marker for later reference
      portMarkersRef.current.push(marker);
    });
    
    // Set map view if initial center is not provided
    if (!initialCenter && mapRef.current) {
      // If there's a selected refinery, center on it
      if (selectedRefineryId && refineries.length > 0) {
        const selectedRefinery = refineries.find(r => r.id === selectedRefineryId);
        if (selectedRefinery && selectedRefinery.lat && selectedRefinery.lng) {
          const lat = typeof selectedRefinery.lat === 'string' ? parseFloat(selectedRefinery.lat) : selectedRefinery.lat;
          const lng = typeof selectedRefinery.lng === 'string' ? parseFloat(selectedRefinery.lng) : selectedRefinery.lng;
          
          if (!isNaN(lat) && !isNaN(lng)) {
            mapRef.current.setView([lat, lng], 6);
            console.log(`Setting map view to:`, [lat, lng], 6);
          }
        }
      }
      // If there's a selected vessel, center on it
      else if (selectedVesselId && vessels.length > 0) {
        const selectedVessel = vessels.find(v => v.id === selectedVesselId);
        if (selectedVessel && selectedVessel.lat && selectedVessel.lng) {
          const lat = typeof selectedVessel.lat === 'string' ? parseFloat(selectedVessel.lat) : selectedVessel.lat;
          const lng = typeof selectedVessel.lng === 'string' ? parseFloat(selectedVessel.lng) : selectedVessel.lng;
          
          if (!isNaN(lat) && !isNaN(lng)) {
            mapRef.current.setView([lat, lng], 6);
            console.log(`Setting map view to:`, [lat, lng], 6);
          }
        }
      }
      // Otherwise, if there are vessels, fit the map to show all vessels
      else if (vessels.length > 0) {
        const bounds = L.latLngBounds(
          vessels
            .filter(v => v.lat && v.lng)
            .map(v => {
              const lat = typeof v.lat === 'string' ? parseFloat(v.lat) : v.lat;
              const lng = typeof v.lng === 'string' ? parseFloat(v.lng) : v.lng;
              return [lat, lng] as [number, number];
            })
        );
        
        // Check if bounds are valid
        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds, {
            padding: [50, 50], // Add padding around bounds
            maxZoom: 10 // Limit maximum zoom level
          });
        }
      }
    }
  }, [vessels, refineries, ports, stations, onVesselClick, onRefineryClick, onPortClick, onStationClick, mapReady, selectedVesselId, selectedRefineryId, selectedStationId, initialCenter, initialZoom]);

  // Render component
  if (mapError) {
    return (
      <div className="map-error-container p-4 text-red-500 bg-red-50 rounded-md">
        <p>{mapError}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height: '70vh' }}>
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-2 text-sm text-gray-600">Loading map data...</p>
          </div>
        </div>
      )}
      <div id="map-container" className="w-full h-full z-10"></div>
    </div>
  );
}