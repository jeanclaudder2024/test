import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplet, Info } from "lucide-react";

interface OilType {
  id: number;
  name: string;
  category: string | null;
  description?: string | null;
  displayName?: string;
}

interface OilTypeHoverCardProps {
  oilTypeName: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function OilTypeHoverCard({ oilTypeName, children, position = 'top' }: OilTypeHoverCardProps) {
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

  // If no oil type found, just show children without hover card
  if (!oilType) {
    return <>{children}</>;
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-white',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-white',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-white',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-white'
  };

  // Category color mapping
  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      'Crude Oil': 'bg-amber-500 text-white',
      'Refined Products': 'bg-blue-500 text-white',
      'Heavy Fuel Oil': 'bg-gray-600 text-white',
      'Marine Gas Oil': 'bg-green-500 text-white',
      'Diesel': 'bg-red-500 text-white',
      'Gasoline': 'bg-purple-500 text-white',
      'Jet Fuel': 'bg-indigo-500 text-white',
      'Lubricants': 'bg-yellow-500 text-black',
      'Bunker Fuel': 'bg-slate-600 text-white',
      'Other': 'bg-gray-400 text-white'
    };
    return colorMap[category] || 'bg-gray-400 text-white';
  };

  return (
    <>
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help relative"
      >
        {children}
      </div>
      
      {/* Portal the hover card to body to avoid z-index issues */}
      {isVisible && (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          <div className={`absolute pointer-events-auto ${positionClasses[position]}`} 
               style={{
                 left: '50%',
                 top: '50%',
                 transform: 'translate(-50%, -50%)'
               }}>
            <Card className="w-80 shadow-2xl border border-blue-200 bg-white backdrop-blur-sm">
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
                    {oilType.category || 'Oil Type'}
                  </Badge>
                </div>

                {/* Description */}
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-start space-x-2">
                    <Info className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {oilType.description || 'Professional maritime oil type used in global petroleum trading and vessel operations.'}
                    </p>
                  </div>
                </div>

                {/* Professional styling footer */}
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">
                      PETRODEALHUB
                    </span>
                    <div className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                      <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
                      <div className="w-1 h-1 bg-blue-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}