import { useState, useRef, useEffect, useCallback } from 'react';
import Map, {
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  Source,
  Layer,
  Popup
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';
import { useMaritimeData } from '@/hooks/useMaritimeData';
import { Vessel, Refinery, Port } from '@shared/schema';
import { Loader2, Ship, Factory, Anchor, Navigation, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Access token from environment variable
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Define map styles
const MAP_STYLES = {
  dark: 'mapbox://styles/mapbox/dark-v11',
  light: 'mapbox://styles/mapbox/light-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  nautical: 'mapbox://styles/mapbox/navigation-day-v1'
};

// Layer IDs for interaction
const VESSEL_LAYER = 'vessels';
const VESSEL_CLUSTER_LAYER = 'vessel-clusters';
const REFINERY_LAYER = 'refineries';
const PORT_LAYER = 'ports';

interface MapboxMapProps {
  initialRegion?: string;
  height?: string;
  showRoutes?: boolean;
  showVesselHistory?: boolean;
  showHeatmap?: boolean;
  mapStyle?: 'dark' | 'light' | 'satellite' | 'nautical';
}

export default function MapboxMap({
  initialRegion = 'global',
  height = '600px',
  showRoutes = false,
  showVesselHistory = false,
  showHeatmap = false,
  mapStyle: initialMapStyle = 'dark'
}: MapboxMapProps) {
  // State
  const [mapStyle, setMapStyle] = useState(initialMapStyle);
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [selectedRefinery, setSelectedRefinery] = useState<Refinery | null>(null);
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [popupInfo, setPopupInfo] = useState<{
    longitude: number;
    latitude: number;
    data: any;
    type: 'vessel' | 'refinery' | 'port';
  } | null>(null);
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 2,
    bearing: 0,
    pitch: 0
  });

  // Get vessel data from WebSocket
  const { 
    vessels, 
    connected, 
    lastUpdated, 
    loading: vesselsLoading 
  } = useVesselWebSocket({
    region: selectedRegion,
    loadAllVessels: true
  });

  // Get maritime infrastructure data
  const { 
    refineries, 
    ports, 
    loading: infrastructureLoading 
  } = useMaritimeData({ 
    region: selectedRegion 
  });

  // Convert vessels to GeoJSON
  const vesselGeoJson = {
    type: 'FeatureCollection',
    features: vessels
      .filter(v => v.currentLat && v.currentLng)
      .map(vessel => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            parseFloat(String(vessel.currentLng)),
            parseFloat(String(vessel.currentLat))
          ]
        },
        properties: {
          id: vessel.id,
          name: vessel.name,
          type: 'vessel',
          vesselType: vessel.vesselType || 'oil tanker',
          vessel: JSON.stringify(vessel)
        }
      }))
  };

  // Convert refineries to GeoJSON
  const refineryGeoJson = {
    type: 'FeatureCollection',
    features: refineries
      .filter(r => r.lat && r.lng)
      .map(refinery => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            parseFloat(String(refinery.lng)),
            parseFloat(String(refinery.lat))
          ]
        },
        properties: {
          id: refinery.id,
          name: refinery.name,
          type: 'refinery',
          refinery: JSON.stringify(refinery)
        }
      }))
  };

  // Convert ports to GeoJSON
  const portGeoJson = {
    type: 'FeatureCollection',
    features: ports
      .filter(p => p.lat && p.lng)
      .map(port => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            parseFloat(String(port.lng)),
            parseFloat(String(port.lat))
          ]
        },
        properties: {
          id: port.id,
          name: port.name,
          type: 'port',
          port: JSON.stringify(port)
        }
      }))
  };

  // Handle clicks on the map
  const onClick = useCallback(event => {
    const { features } = event;
    
    if (!features || features.length === 0) {
      setPopupInfo(null);
      return;
    }
    
    // Sort features by type to prioritize what we click on
    const feature = features[0];
    const properties = feature.properties;
    
    if (properties && properties.type) {
      const longitude = feature.geometry.coordinates[0];
      const latitude = feature.geometry.coordinates[1];
      
      if (properties.type === 'vessel' && properties.vessel) {
        const vessel = JSON.parse(properties.vessel);
        setSelectedVessel(vessel);
        setSelectedRefinery(null);
        setSelectedPort(null);
        setPopupInfo({
          longitude,
          latitude,
          data: vessel,
          type: 'vessel'
        });
      } else if (properties.type === 'refinery' && properties.refinery) {
        const refinery = JSON.parse(properties.refinery);
        setSelectedVessel(null);
        setSelectedRefinery(refinery);
        setSelectedPort(null);
        setPopupInfo({
          longitude,
          latitude,
          data: refinery,
          type: 'refinery'
        });
      } else if (properties.type === 'port' && properties.port) {
        const port = JSON.parse(properties.port);
        setSelectedVessel(null);
        setSelectedRefinery(null);
        setSelectedPort(port);
        setPopupInfo({
          longitude,
          latitude,
          data: port,
          type: 'port'
        });
      }
    }
  }, []);

  // Loading state
  const isLoading = vesselsLoading || infrastructureLoading;

  return (
    <div className="relative w-full" style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4 p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-sm font-medium">Loading maritime data...</div>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <Card className="w-48 bg-background/90 backdrop-blur-sm">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm">Map Style</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <Tabs value={mapStyle} onValueChange={(v) => setMapStyle(v as any)}>
              <TabsList className="w-full grid grid-cols-2 h-8">
                <TabsTrigger value="dark" className="text-xs">
                  Dark
                </TabsTrigger>
                <TabsTrigger value="light" className="text-xs">
                  Light
                </TabsTrigger>
                <TabsTrigger value="satellite" className="text-xs">
                  Satellite
                </TabsTrigger>
                <TabsTrigger value="nautical" className="text-xs">
                  Nautical
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Stats */}
        <Card className="w-48 bg-background/90 backdrop-blur-sm">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-center">
              <Ship className="h-4 w-4 mr-2" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2 text-xs">
            <div>Vessels: {vessels.length}</div>
            <div>Refineries: {refineries.length}</div>
            <div>Ports: {ports.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Map
        longitude={viewState.longitude}
        latitude={viewState.latitude}
        zoom={viewState.zoom}
        bearing={viewState.bearing}
        pitch={viewState.pitch}
        onMove={(evt: any) => setViewState(evt.viewState)}
        mapStyle={MAP_STYLES[mapStyle]}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        interactiveLayerIds={[VESSEL_LAYER, REFINERY_LAYER, PORT_LAYER]}
        onClick={onClick}
      >
        <NavigationControl position="top-left" />
        <FullscreenControl position="top-left" />
        <ScaleControl position="bottom-left" />

        {/* Vessels */}
        <Source id="vessels-source" type="geojson" data={vesselGeoJson} cluster={true} clusterMaxZoom={14} clusterRadius={50}>
          {/* Clusters */}
          <Layer
            id={VESSEL_CLUSTER_LAYER}
            type="circle"
            filter={['has', 'point_count']}
            paint={{
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                100,
                '#f1f075',
                750,
                '#f28cb1'
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                100,
                30,
                750,
                40
              ]
            }}
          />
          
          {/* Cluster count */}
          <Layer
            id="cluster-count"
            type="symbol"
            filter={['has', 'point_count']}
            layout={{
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12
            }}
          />
          
          {/* Vessels */}
          <Layer
            id={VESSEL_LAYER}
            type="circle"
            filter={['!', ['has', 'point_count']]}
            paint={{
              'circle-color': [
                'match',
                ['get', 'vesselType'],
                'crude oil tanker', '#e53935',
                'lng carrier', '#43a047',
                'lpg carrier', '#ffb300',
                'product tanker', '#1e88e5',
                'chemical tanker', '#8e24aa',
                '#FF6F00' // default
              ],
              'circle-radius': 6,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff'
            }}
          />
        </Source>

        {/* Refineries */}
        <Source id="refineries-source" type="geojson" data={refineryGeoJson}>
          <Layer
            id={REFINERY_LAYER}
            type="circle"
            paint={{
              'circle-color': '#f44336',
              'circle-radius': 8,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff'
            }}
          />
        </Source>

        {/* Ports */}
        <Source id="ports-source" type="geojson" data={portGeoJson}>
          <Layer
            id={PORT_LAYER}
            type="circle"
            paint={{
              'circle-color': '#2196f3',
              'circle-radius': 6,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff'
            }}
          />
        </Source>

        {/* Popup */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            closeButton={true}
            closeOnClick={false}
            onClose={() => setPopupInfo(null)}
            anchor="bottom"
            className="z-20"
          >
            <div className="p-2 max-w-[280px]">
              {popupInfo.type === 'vessel' && (
                <div>
                  <h3 className="font-bold text-sm">{popupInfo.data.name}</h3>
                  <p className="text-xs text-muted-foreground">{popupInfo.data.vesselType}</p>
                  <div className="mt-2 text-xs">
                    <p>IMO: {popupInfo.data.imo || 'N/A'}</p>
                    <p>Flag: {popupInfo.data.flag || 'N/A'}</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="mt-2 w-full text-xs"
                    onClick={() => window.location.href = `/vessels/${popupInfo.data.id}`}
                  >
                    <Ship className="h-3 w-3 mr-1" /> View Details
                  </Button>
                </div>
              )}
              
              {popupInfo.type === 'refinery' && (
                <div>
                  <h3 className="font-bold text-sm">{popupInfo.data.name}</h3>
                  <p className="text-xs text-muted-foreground">{popupInfo.data.country}</p>
                  <div className="mt-2 text-xs">
                    <p>Region: {popupInfo.data.region}</p>
                    <p>Capacity: {popupInfo.data.capacity ? `${Math.round(popupInfo.data.capacity / 1000)}k bpd` : 'N/A'}</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="mt-2 w-full text-xs"
                    onClick={() => window.location.href = `/refineries/${popupInfo.data.id}`}
                  >
                    <Factory className="h-3 w-3 mr-1" /> View Details
                  </Button>
                </div>
              )}
              
              {popupInfo.type === 'port' && (
                <div>
                  <h3 className="font-bold text-sm">{popupInfo.data.name}</h3>
                  <p className="text-xs text-muted-foreground">{popupInfo.data.country}</p>
                  <div className="mt-2 text-xs">
                    <p>Region: {popupInfo.data.region}</p>
                    <p>Type: {popupInfo.data.type || 'Standard'}</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="mt-2 w-full text-xs"
                    onClick={() => window.location.href = `/ports/${popupInfo.data.id}`}
                  >
                    <Anchor className="h-3 w-3 mr-1" /> View Details
                  </Button>
                </div>
              )}
            </div>
          </Popup>
        )}
      </Map>

      {/* Connection Status */}
      <div className="absolute bottom-3 left-3 z-10">
        <Badge 
          variant={connected ? "outline" : "destructive"} 
          className={connected 
            ? "bg-green-50 text-green-700 border-green-200" 
            : ""
          }
        >
          {connected ? "Connected" : "Connecting..."}
        </Badge>
        
        {lastUpdated && (
          <div className="text-xs text-white bg-black/40 backdrop-blur-sm rounded px-2 py-1 mt-1">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}