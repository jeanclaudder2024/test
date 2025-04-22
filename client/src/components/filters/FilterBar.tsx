import { useState } from 'react';
import { RegionFilter } from './RegionFilter';
import { AdvancedFilters, FilterOptions } from './AdvancedFilters';
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface FilterBarProps {
  onFilterChange: (filters: CombinedFilters) => void;
  initialFilters?: CombinedFilters;
}

export interface CombinedFilters extends FilterOptions {
  region?: string;
}

export function FilterBar({ onFilterChange, initialFilters = {} }: FilterBarProps) {
  const [filters, setFilters] = useState<CombinedFilters>(initialFilters);
  
  // Handle region filter changes
  const handleRegionChange = (region: string) => {
    const updatedFilters = { ...filters, region };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };
  
  // Handle advanced filter changes
  const handleAdvancedFilterChange = (advancedFilters: FilterOptions) => {
    const updatedFilters = { ...filters, ...advancedFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };
  
  // Clear a specific filter
  const clearFilter = (key: keyof CombinedFilters) => {
    const updatedFilters = { ...filters };
    delete updatedFilters[key];
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };
  
  // Check if we have any active filters to display
  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key as keyof CombinedFilters] !== undefined && 
    filters[key as keyof CombinedFilters] !== ''
  );
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <RegionFilter 
          selectedRegion={filters.region || ''} 
          onChange={handleRegionChange} 
        />
        <AdvancedFilters 
          initialFilters={filters} 
          onFilterChange={handleAdvancedFilterChange} 
        />
      </div>
      
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.region && (
            <Badge variant="outline" className="flex items-center">
              Region: {filters.region}
              <X 
                className="ml-2 h-3 w-3 cursor-pointer" 
                onClick={() => clearFilter('region')} 
              />
            </Badge>
          )}
          
          {filters.vesselType && (
            <Badge variant="outline" className="flex items-center">
              Vessel: {filters.vesselType}
              <X 
                className="ml-2 h-3 w-3 cursor-pointer" 
                onClick={() => clearFilter('vesselType')} 
              />
            </Badge>
          )}
          
          {filters.cargoType && (
            <Badge variant="outline" className="flex items-center">
              Cargo: {filters.cargoType}
              <X 
                className="ml-2 h-3 w-3 cursor-pointer" 
                onClick={() => clearFilter('cargoType')} 
              />
            </Badge>
          )}
          
          {(filters.minCapacity !== undefined || filters.maxCapacity !== undefined) && (
            <Badge variant="outline" className="flex items-center">
              Capacity: {filters.minCapacity || 0} - {filters.maxCapacity || 1000000} tons
              <X 
                className="ml-2 h-3 w-3 cursor-pointer" 
                onClick={() => {
                  clearFilter('minCapacity');
                  clearFilter('maxCapacity');
                }} 
              />
            </Badge>
          )}
          
          {filters.flag && (
            <Badge variant="outline" className="flex items-center">
              Flag: {filters.flag}
              <X 
                className="ml-2 h-3 w-3 cursor-pointer" 
                onClick={() => clearFilter('flag')} 
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}