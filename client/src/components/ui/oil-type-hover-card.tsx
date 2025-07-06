import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplet, Info } from "lucide-react";

interface OilType {
  id: number;
  name: string;
  displayName: string;
  category: string;
  description?: string;
}

interface OilTypeHoverCardProps {
  oilType: OilType;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function OilTypeHoverCard({ oilType, children, position = 'top' }: OilTypeHoverCardProps) {
  const [isVisible, setIsVisible] = useState(false);

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
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]}`}>
          <Card className="w-80 shadow-2xl border border-blue-200 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-4">
              {/* Header with oil type info */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <Droplet className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {oilType.displayName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {oilType.name}
                    </p>
                  </div>
                </div>
                <Badge 
                  className={`text-xs px-2 py-1 ${getCategoryColor(oilType.category)}`}
                  variant="secondary"
                >
                  {oilType.category}
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
          
          {/* Arrow */}
          <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}></div>
        </div>
      )}
    </div>
  );
}