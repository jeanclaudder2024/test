// Utility to fix z-index issues with Leaflet maps
// This ensures markers and other elements remain visible at all zoom levels

/**
 * Apply z-index fixes to a Leaflet map instance
 * @param container The HTML container element of the map
 */
export function fixLeafletZIndexIssues(container: HTMLElement | null) {
  if (!container) return;
  
  // Find all marker icons and ensure they have proper z-index
  const markers = container.querySelectorAll('.leaflet-marker-icon');
  markers.forEach((marker) => {
    // Apply higher z-index to ensure visibility
    (marker as HTMLElement).style.zIndex = '1000';
  });
  
  // Fix z-index for marker panes
  const markerPane = container.querySelector('.leaflet-marker-pane');
  if (markerPane) {
    (markerPane as HTMLElement).style.zIndex = '900';
  }
  
  // Fix overlay pane z-index (for polygons, etc.)
  const overlayPane = container.querySelector('.leaflet-overlay-pane');
  if (overlayPane) {
    (overlayPane as HTMLElement).style.zIndex = '800';
  }
  
  // Fix shadow pane z-index
  const shadowPane = container.querySelector('.leaflet-shadow-pane');
  if (shadowPane) {
    (shadowPane as HTMLElement).style.zIndex = '700';
  }
}