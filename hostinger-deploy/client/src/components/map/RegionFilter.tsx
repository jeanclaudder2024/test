import React from 'react';

interface RegionFilterProps {
  regions: string[];
  selectedRegion: string;
  onRegionChange: (region: string) => void;
}

export default function RegionFilter({ regions, selectedRegion, onRegionChange }: RegionFilterProps) {
  return (
    <div className="region-filter">
      <select 
        value={selectedRegion} 
        onChange={(e) => onRegionChange(e.target.value)}
        className="region-select"
      >
        <option value="all">All Regions</option>
        {regions.map(region => (
          <option key={region} value={region}>{region}</option>
        ))}
      </select>
    </div>
  );
}