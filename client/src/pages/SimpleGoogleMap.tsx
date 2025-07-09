import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Ship, RefreshCw } from 'lucide-react';

// Declare Google Maps Web Components for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-map': any;
      'gmp-advanced-marker': any;
    }
  }
}

export default function SimpleGoogleMap() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load Google Maps script exactly as you provided
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      // Check if script already exists
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        setMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAVyB_LKIVJwkcUIPcgKeioPWH71ulpays&callback=console.debug&libraries=maps,marker&v=beta';
      
      script.onload = () => {
        console.log('Google Maps script loaded successfully');
        setMapLoaded(true);
      };
      
      script.onerror = (error) => {
        console.error('Failed to load Google Maps script:', error);
        setLoadError('Failed to load Google Maps script');
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
  }, []);

  // Get vessel data
  const { vessels, loading } = useVesselWebSocket({
    region: 'global',
    loadAllVessels: true,
    refreshInterval: 30000
  });

  // Get ports data
  const { data: ports = [] } = useQuery({
    queryKey: ['/api/ports'],
    enabled: true
  });

  // Get refineries data
  const { data: refineries = [] } = useQuery({
    queryKey: ['/api/refineries'],
    enabled: true
  });

  // Filter mappable vessels
  const mappableVessels = vessels.filter(vessel => 
    vessel.currentLat && vessel.currentLng &&
    !isNaN(parseFloat(vessel.currentLat)) && 
    !isNaN(parseFloat(vessel.currentLng))
  ).slice(0, 50); // Limit to 50 vessels for better performance

  if (loadError) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Ship className="h-5 w-5" />
              Google Maps Loading Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8">
              <div className="text-red-600 mb-4">
                Error: {loadError}
              </div>
              <div className="text-gray-600">
                Please check your internet connection and try refreshing the page.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Simple Google Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <div>Loading Google Maps...</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Simple Google Map - {mappableVessels.length} Vessels
            </div>
            <div className="text-sm text-muted-foreground">
              {ports.length} Ports • {refineries.length} Refineries
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[600px] rounded-lg overflow-hidden">
            <gmp-map 
              center="40.12150192260742,-100.45039367675781" 
              zoom="4" 
              map-id="DEMO_MAP_ID"
              style={{ width: '100%', height: '100%' }}
            >
              {/* Basic marker from your example */}
              <gmp-advanced-marker 
                position="40.12150192260742,-100.45039367675781" 
                title="My location"
              />
              
              {/* Vessel markers */}
              {mappableVessels.map((vessel, index) => {
                const lat = parseFloat(vessel.currentLat);
                const lng = parseFloat(vessel.currentLng);
                
                if (isNaN(lat) || isNaN(lng)) return null;

                return (
                  <gmp-advanced-marker
                    key={`vessel-${vessel.id}-${index}`}
                    position={`${lat},${lng}`}
                    title={vessel.name}
                  >
                    <div 
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        border: '2px solid white',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                    >
                      🚢
                    </div>
                  </gmp-advanced-marker>
                );
              })}

              {/* Port markers */}
              {ports.slice(0, 20).map((port: any, index) => {
                const lat = parseFloat(port.latitude || port.lat);
                const lng = parseFloat(port.longitude || port.lng);
                
                if (isNaN(lat) || isNaN(lng)) return null;

                return (
                  <gmp-advanced-marker
                    key={`port-${port.id}-${index}`}
                    position={`${lat},${lng}`}
                    title={port.name}
                  >
                    <div 
                      style={{
                        background: '#10b981',
                        color: 'white',
                        padding: '3px 6px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                    >
                      ⚓
                    </div>
                  </gmp-advanced-marker>
                );
              })}

              {/* Refinery markers */}
              {refineries.slice(0, 10).map((refinery: any, index) => {
                const lat = parseFloat(refinery.latitude);
                const lng = parseFloat(refinery.longitude);
                
                if (isNaN(lat) || isNaN(lng)) return null;

                return (
                  <gmp-advanced-marker
                    key={`refinery-${refinery.id}-${index}`}
                    position={`${lat},${lng}`}
                    title={refinery.name}
                  >
                    <div 
                      style={{
                        background: '#f59e0b',
                        color: 'white',
                        padding: '3px 6px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                    >
                      🏭
                    </div>
                  </gmp-advanced-marker>
                );
              })}
            </gmp-map>
          </div>
          
          {/* Statistics */}
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-blue-600">{mappableVessels.length}</div>
              <div className="text-sm text-gray-600">Vessels</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-green-600">{ports.length}</div>
              <div className="text-sm text-gray-600">Ports</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-orange-600">{refineries.length}</div>
              <div className="text-sm text-gray-600">Refineries</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}