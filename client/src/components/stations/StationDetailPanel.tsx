import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Station } from '@/services/stationService';
import { format } from 'date-fns';
import { 
  MapPin, 
  Flag, 
  Calendar, 
  Radio, 
  X 
} from 'lucide-react';

interface StationDetailPanelProps {
  station: Station | null;
  onClose: () => void;
}

export const StationDetailPanel: React.FC<StationDetailPanelProps> = ({ station, onClose }) => {
  if (!station) return null;
  
  // Convert Unix timestamp to readable date
  const lastUpdateDate = new Date(parseInt(station.unix_time) * 1000);
  const formattedDate = format(lastUpdateDate, 'PPP p');
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div>
          <CardTitle className="text-xl font-bold flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-blue-600" />
            {station.location || `Station ${station.id}`}
          </CardTitle>
          <CardDescription className="text-sm mt-1">
            Station ID: {station.id}
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Badge variant={station.isActive ? "default" : "secondary"}>
            {station.isActive ? "Active" : "Inactive"}
          </Badge>
          <button 
            onClick={onClose}
            className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Flag className="h-4 w-4 mr-2 text-gray-500" />
            <span className="font-medium mr-2">Country:</span>
            <span>{station.country.toUpperCase()}</span>
          </div>
          
          {station.location && (
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium mr-2">Location:</span>
              <span>{station.location}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm">
            <Radio className="h-4 w-4 mr-2 text-gray-500" />
            <span className="font-medium mr-2">Status:</span>
            <span className={station.isActive ? "text-green-600" : "text-amber-600"}>
              {station.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <span className="font-medium mr-2">Last Update:</span>
            <span>{formattedDate}</span>
          </div>
        </div>
        
        <div className="pt-2 space-y-2">
          <div className="text-sm">
            <span className="font-medium">Coordinates:</span>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Latitude</span>
                <span>{station.latitude}°</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Longitude</span>
                <span>{station.longitude}°</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StationDetailPanel;