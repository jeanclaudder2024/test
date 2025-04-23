import { useState, useEffect } from "react";
import SimpleLeafletMap from "@/components/map/SimpleLeafletMap";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, MapPin, Eye } from "lucide-react";

export default function EmptyMap() {
  const [center] = useState<[number, number]>([20, 0]);
  const [zoom] = useState(2);

  // Make sure the URL has empty=true parameter to tell the map component not to show markers
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('empty')) {
      url.searchParams.set('empty', 'true');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  return (
    <div className="w-full h-screen relative">
      {/* Empty Map with no vessels or refineries */}
      <SimpleLeafletMap 
        vessels={[]}
        refineries={[]}
        selectedRegion={null}
        onVesselClick={() => {}}
        initialCenter={center}
        initialZoom={zoom}
      />
      
      {/* Navigation Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="bg-background/90 backdrop-blur-sm shadow-md text-xs"
        >
          <Link to="/">
            <ArrowLeft className="h-3 w-3 mr-1" />
            Back to Dashboard
          </Link>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="bg-background/90 backdrop-blur-sm shadow-md text-xs"
          onClick={() => {
            // Set a random position to explore
            const randomLat = Math.random() * 60 - 30; // -30 to 30
            const randomLng = Math.random() * 360 - 180; // -180 to 180
            const map = (window as any).L?.map?.('leaflet-map-container');
            if (map) {
              map.setView([randomLat, randomLng], 5);
            }
          }}
        >
          <MapPin className="h-3 w-3 mr-1" />
          Random Location
        </Button>
      </div>
      
      {/* Watermark and info */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-background/80 backdrop-blur-sm p-2 rounded-md shadow-md text-xs text-muted-foreground">
          <p className="flex items-center">
            <Eye className="h-3 w-3 mr-1" />
            Empty Map View
          </p>
        </div>
      </div>
    </div>
  );
}