import React, { useState } from 'react';
import { AlertCircle, Droplet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import type { OilType } from '@shared/schema';

interface OilTypeInfoButtonProps {
  oilTypeName: string;
  className?: string;
}

function getCategoryColor(category: string): string {
  switch (category?.toLowerCase()) {
    case 'crude':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'refined':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'gas':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'chemical':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function OilTypeInfoButton({ oilTypeName, className = '' }: OilTypeInfoButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Fetch oil types from the API
  const { data: oilTypes = [] } = useQuery({
    queryKey: ['/api/oil-types'],
    staleTime: 0,
  });

  // Find the matching oil type by name
  const oilType = oilTypes.find((type: OilType) => 
    type.name === oilTypeName || 
    type.displayName === oilTypeName ||
    type.category === oilTypeName
  );

  // If no oil type found, don't show the button
  if (!oilType) {
    return null;
  }

  return (
    <div className="relative inline-block">
      <Button
        variant="ghost"
        size="sm"
        className={`h-6 w-6 p-0 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 ${className}`}
        onClick={() => setIsVisible(!isVisible)}
      >
        <AlertCircle className="h-3 w-3 text-blue-600" />
      </Button>
      
      {/* Info card */}
      {isVisible && (
        <>
          {/* Backdrop to close when clicking outside */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsVisible(false)}
          />
          
          {/* Info card */}
          <div className="absolute top-8 left-0 z-50 w-80">
            <Card className="shadow-2xl border border-blue-200 bg-white backdrop-blur-sm">
              <CardContent className="p-4">
                {/* Header with oil type info */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-50 rounded-full">
                      <Droplet className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {oilType.displayName || oilType.name}
                      </h3>
                    </div>
                  </div>
                  <Badge 
                    className={`text-xs px-2 py-1 ${getCategoryColor(oilType.category || 'Other')}`}
                    variant="secondary"
                  >
                    {oilType.category || 'Other'}
                  </Badge>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {oilType.description || `Information about ${oilType.name} oil type.`}
                  </p>
                  
                  {/* Additional info if available */}
                  {oilType.specifications && (
                    <div className="text-xs text-gray-500 border-t pt-2">
                      <strong>Specifications:</strong> {oilType.specifications}
                    </div>
                  )}
                  
                  {oilType.uses && (
                    <div className="text-xs text-gray-500">
                      <strong>Uses:</strong> {oilType.uses}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}