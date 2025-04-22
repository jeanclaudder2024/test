import { Button } from "@/components/ui/button";
import {
  Map as MapIcon, Sunrise, Globe2 as Baseline, TreePine, 
  Satellite, Navigation, Anchor, Mountain
} from "lucide-react";

// Language settings - Add true for multilingual support
export type LanguageOption = 'en' | 'ar' | 'multilingual';

// Available free styles with proper Leaflet tile URLs
export const mapStyles = [
  { 
    id: 'osm-standard',
    name: 'OpenStreetMap',
    icon: <MapIcon className="h-3 w-3" />,
    description: 'Standard OpenStreetMap tiles in English',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  { 
    id: 'carto-light',
    name: 'Light',
    icon: <Sunrise className="h-3 w-3" />,
    description: 'Light Carto basemap optimized for data visualization',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>'
  },
  { 
    id: 'carto-dark',
    name: 'Dark',
    icon: <Baseline className="h-3 w-3" />,
    description: 'Dark Carto basemap optimized for data visualization',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>'
  },
  { 
    id: 'esri-world-imagery',
    name: 'Satellite',
    icon: <Satellite className="h-3 w-3" />,
    description: 'ESRI World Imagery satellite map',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  { 
    id: 'stamen-terrain',
    name: 'Terrain',
    icon: <TreePine className="h-3 w-3" />,
    description: 'Terrain map with natural features and elevation contours',
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  { 
    id: 'esri-world-street',
    name: 'Streets',
    icon: <Navigation className="h-3 w-3" />,
    description: 'ESRI World Street Map with detailed street network',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
  },
  { 
    id: 'esri-ocean-basemap',
    name: 'Ocean',
    icon: <Anchor className="h-3 w-3" />,
    description: 'ESRI Ocean Basemap optimized for maritime visualization',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri'
  },
  { 
    id: 'esri-gray',
    name: 'Grayscale',
    icon: <Mountain className="h-3 w-3" />,
    description: 'ESRI World Gray Canvas minimal basemap',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
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