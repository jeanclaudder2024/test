import L from 'leaflet';

// Factory function to create custom marker icons
export function createMarkerIcon(color: string, size: number = 12) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color}; 
      width: ${size}px; 
      height: ${size}px; 
      border-radius: 50%; 
      border: 2px solid white;
      box-shadow: 0 0 4px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
}

// Create specific icons
export const refineryIcon = createMarkerIcon('#e74c3c', 14); // Red
export const portIcon = createMarkerIcon('#3498db', 14);     // Blue
export const oilTerminalIcon = createMarkerIcon('#2ecc71', 14); // Green
export const tankFarmIcon = createMarkerIcon('#f39c12', 14);   // Orange