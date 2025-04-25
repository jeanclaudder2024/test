export type LanguageOption = 'en' | 'ar';

// Map style definitions for Leaflet
// Since this is a .ts file and not .tsx, we can't use JSX here
// We'll define just the map styles without icons for now

export const mapStyles = [
  {
    id: 'standard',
    name: 'Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  {
    id: 'carto-voyager',
    name: 'Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  {
    id: 'satellite',
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  {
    id: 'dark',
    name: 'Dark',
    url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
  },
  {
    id: 'light',
    name: 'Light',
    url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg',
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 1,
    maxZoom: 16
  }
];

// Icons for vessels based on cargo type
export const getVesselIcon = (cargoType: string = '', isSelected: boolean = false) => {
  // Define colors for different cargo types
  const colors: Record<string, string> = {
    'Crude Oil': '#e74c3c',
    'LNG': '#f39c12',
    'LPG': '#e67e22',
    'Refined Products': '#3498db',
    'Jet Fuel': '#9b59b6',
    'Gasoline': '#2ecc71',
    'Diesel': '#1abc9c',
    'Chemicals': '#d35400',
    'Petrochemicals': '#c0392b'
  };
  
  // Default color if cargo type doesn't match
  const defaultColor = '#95a5a6';
  
  // Use matched color or default
  const color = colors[cargoType] || defaultColor;
  
  // Make the selected vessel icon larger and differently styled
  return {
    color: isSelected ? '#2980b9' : color,
    fillColor: color,
    fillOpacity: isSelected ? 0.9 : 0.6,
    weight: isSelected ? 3 : 1,
    radius: isSelected ? 8 : 5,
    pulsing: isSelected
  };
};

// Icons for refineries based on status
export const getRefineryIcon = (status: string = '', isSelected: boolean = false) => {
  // Define colors for different statuses
  const colors: Record<string, string> = {
    'operational': '#27ae60',
    'maintenance': '#f39c12',
    'offline': '#e74c3c',
    'planned': '#3498db'
  };
  
  // Default color if status doesn't match
  const defaultColor = '#7f8c8d';
  
  // Use matched color or default
  const color = colors[status] || defaultColor;
  
  // Make the selected refinery icon larger and differently styled
  return {
    color: isSelected ? '#2980b9' : color,
    fillColor: color,
    fillOpacity: isSelected ? 0.8 : 0.6,
    weight: isSelected ? 3 : 1,
    radius: isSelected ? 12 : 7
  };
};