import React from 'react';
import { Vessel as VesselType } from '@shared/schema';

interface VesselPopupProps {
  vessel: VesselType;
  showStatus?: boolean;
}

// Helper function to determine vessel status class
const getVesselStatusClass = (status?: string | null) => {
  if (!status) return 'vessel-status-unknown';
  
  const statusLower = status.toLowerCase();
  if (statusLower.includes('sail') || statusLower.includes('underway') || statusLower.includes('en route')) {
    return 'vessel-status-sailing';
  } else if (statusLower.includes('anchor')) {
    return 'vessel-status-anchored';
  } else if (statusLower.includes('dock') || statusLower.includes('moor') || statusLower.includes('berth')) {
    return 'vessel-status-docked';
  } else if (statusLower.includes('stop') || statusLower.includes('not moving')) {
    return 'vessel-status-stopped';
  }
  return 'vessel-status-unknown';
};

// Helper function to format coordinate display
function formatCoordinate(coord: string | number | null | undefined): string {
  if (coord === null || coord === undefined) return 'N/A';
  
  const value = typeof coord === 'string' ? parseFloat(coord) : (typeof coord === 'number' ? coord : NaN);
  return isNaN(value) ? 'N/A' : value.toFixed(4) + '°';
}

const VesselPopup: React.FC<VesselPopupProps> = ({ vessel, showStatus = true }) => {
  return (
    <div className="p-1">
      <h3 className="font-bold text-sm">{vessel.name || 'Unknown Vessel'}</h3>
      <div className="text-xs mt-1">
        {showStatus && (
          <div className="mb-1">
            <span className="font-medium">Status: </span>
            <span className={`vessel-status-badge ${getVesselStatusClass(vessel.status || undefined)}`}>
              {vessel.status || 'Unknown'}
            </span>
          </div>
        )}
        <div><span className="font-medium">Type:</span> {vessel.vesselType || 'N/A'}</div>
        <div><span className="font-medium">Flag:</span> {vessel.flag || 'N/A'}</div>
        <div>
          <span className="font-medium">Coordinates:</span> {formatCoordinate(vessel.currentLat as string | number | undefined)}, {formatCoordinate(vessel.currentLng as string | number | undefined)}
        </div>
        {vessel.cargoType && <div><span className="font-medium">Cargo:</span> {vessel.cargoType}</div>}
        {vessel.destinationPort && <div><span className="font-medium">Destination:</span> {vessel.destinationPort}</div>}
        {vessel.built && <div><span className="font-medium">Built:</span> {vessel.built}</div>}
        {vessel.deadweight && <div><span className="font-medium">Deadweight:</span> {vessel.deadweight} tons</div>}
      </div>
    </div>
  );
};

export default VesselPopup;