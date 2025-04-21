import { Button } from "@/components/ui/button";
import {
  Map as MapIcon, Sunrise, Globe2 as Baseline, TreePine, 
  Satellite, Navigation, Anchor, Mountain
} from "lucide-react";

// Available free mapbox styles
export const mapStyles = [
  { 
    id: 'mapbox://styles/mapbox/streets-v12',
    name: 'Streets',
    icon: <MapIcon className="h-3 w-3" />,
    description: 'A complete basemap for urban navigation'
  },
  { 
    id: 'mapbox://styles/mapbox/light-v11',
    name: 'Light',
    icon: <Sunrise className="h-3 w-3" />,
    description: 'A light, minimal basemap'
  },
  { 
    id: 'mapbox://styles/mapbox/dark-v11',
    name: 'Dark',
    icon: <Baseline className="h-3 w-3" />,
    description: 'A dark basemap for data visualization'
  },
  { 
    id: 'mapbox://styles/mapbox/outdoors-v12',
    name: 'Outdoors',
    icon: <TreePine className="h-3 w-3" />,
    description: 'A topographic basemap with trails and terrain'
  },
  { 
    id: 'mapbox://styles/mapbox/satellite-v9',
    name: 'Satellite',
    icon: <Satellite className="h-3 w-3" />,
    description: 'High-resolution satellite imagery'
  },
  { 
    id: 'mapbox://styles/mapbox/satellite-streets-v12',
    name: 'Satellite Streets',
    icon: <Navigation className="h-3 w-3" />,
    description: 'Satellite imagery with streets and labels'
  },
  { 
    id: 'mapbox://styles/mapbox/navigation-day-v1',
    name: 'Navigation',
    icon: <Anchor className="h-3 w-3" />,
    description: 'Optimized for maritime navigation'
  },
  { 
    id: 'mapbox://styles/mapbox/standard',
    name: 'Standard',
    icon: <Mountain className="h-3 w-3" />,
    description: 'Beautiful 3D buildings and topography'
  }
];

interface MapStyleSelectorProps {
  currentStyle: string;
  onStyleChange: (styleId: string) => void;
}

export function MapStyleSelector({ currentStyle, onStyleChange }: MapStyleSelectorProps) {
  return (
    <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-md shadow-md p-2 flex flex-wrap gap-1.5 max-w-[320px]">
      {mapStyles.map(style => (
        <Button
          key={style.id}
          variant={style.id === currentStyle ? "default" : "outline"}
          size="sm"
          className={`flex flex-col items-center justify-center py-1 h-auto w-[70px] ${
            style.id === currentStyle ? 'bg-primary text-white' : 'border-primary/20 hover:bg-primary/10'
          }`}
          onClick={() => onStyleChange(style.id)}
          title={style.description}
        >
          <span className="mb-1">{style.icon}</span>
          <span className="text-[10px] font-medium">{style.name}</span>
        </Button>
      ))}
    </div>
  );
}