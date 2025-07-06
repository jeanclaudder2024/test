import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Droplets } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface OilType {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  isActive: boolean | null;
}

interface OilTypeListProps {
  oilTypes: OilType[];
  selectedType: string;
  onTypeSelect: (type: string) => void;
  vesselCounts?: Record<string, number>;
}

export function OilTypeList({ oilTypes, selectedType, onTypeSelect, vesselCounts = {} }: OilTypeListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  // Filter oil types based on search term
  const filteredOilTypes = oilTypes.filter(oilType =>
    oilType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (oilType.description && oilType.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Add "All Types" option
  const allOptions = [
    { id: 0, name: 'All Types', description: 'Show all vessels regardless of oil type', category: null, isActive: true },
    ...filteredOilTypes
  ];

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Droplets className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-lg">Oil Types</h3>
        </div>
        
        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search oil types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Oil Types List */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {allOptions.map((oilType) => {
            const isSelected = selectedType === oilType.name;
            const vesselCount = vesselCounts[oilType.name] || 0;
            
            return (
              <div
                key={oilType.id}
                className={`
                  p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }
                `}
                onClick={() => onTypeSelect(oilType.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                        {oilType.name}
                      </span>
                      {vesselCount > 0 && (
                        <Badge variant={isSelected ? "default" : "secondary"} className="text-xs">
                          {vesselCount}
                        </Badge>
                      )}
                    </div>
                    
                    {oilType.description && (
                      <p className={`text-sm mt-1 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
                        {oilType.description}
                      </p>
                    )}
                    
                    {oilType.category && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {oilType.category}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {isSelected && (
                    <div className="ml-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredOilTypes.length === 0 && searchTerm && (
          <div className="text-center py-4 text-gray-500">
            <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No oil types found for "{searchTerm}"</p>
          </div>
        )}

        {/* Clear Selection Button */}
        {selectedType !== 'All Types' && (
          <div className="mt-4 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTypeSelect('All Types')}
              className="w-full"
            >
              Clear Selection
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}