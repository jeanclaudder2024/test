import { Card, CardContent } from "@/components/ui/card";
import { Vessel } from "@/types";
import { Package, MapPin, Box } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface VesselInfoProps {
  vessel: Vessel;
}

export default function VesselInfo({ vessel }: VesselInfoProps) {
  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-heading font-medium text-gray-800">Vessel Information</h3>
      </div>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vessel Basic Info */}
          <div>
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-50 rounded-lg p-3">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">{vessel.name}</h4>
                <p className="text-sm text-gray-500">
                  IMO: {vessel.imo} | MMSI: {vessel.mmsi}
                </p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">VESSEL TYPE</p>
                <p className="text-sm font-medium">{vessel.vesselType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">FLAG</p>
                <p className="text-sm font-medium">{vessel.flag}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">BUILT</p>
                <p className="text-sm font-medium">{vessel.built || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">DEADWEIGHT</p>
                <p className="text-sm font-medium">
                  {vessel.deadweight ? `${vessel.deadweight.toLocaleString()} t` : "N/A"}
                </p>
              </div>
            </div>
          </div>
          
          {/* Voyage Info */}
          <div className="border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">CURRENT VOYAGE</h4>
            
            {/* Departure */}
            <div className="flex items-center mb-3">
              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">DEPARTURE</p>
                <p className="text-sm font-medium">{vessel.departurePort || "N/A"}</p>
                <p className="text-xs text-gray-500">{vessel.departureDate ? formatDate(new Date(vessel.departureDate)) : "N/A"}</p>
              </div>
            </div>
            
            {/* Destination */}
            <div className="flex items-center mb-3">
              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">DESTINATION</p>
                <p className="text-sm font-medium">{vessel.destinationPort || "N/A"}</p>
                <p className="text-xs text-gray-500">
                  {vessel.eta ? `ETA: ${formatDate(new Date(vessel.eta))}` : "ETA: N/A"}
                </p>
              </div>
            </div>
            
            {/* Cargo */}
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Box className="h-4 w-4 text-primary" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">CARGO</p>
                <p className="text-sm font-medium">{vessel.cargoType || "N/A"}</p>
                <p className="text-xs text-gray-500">
                  {vessel.cargoCapacity 
                    ? `${vessel.cargoCapacity.toLocaleString()} barrels` 
                    : "Capacity: N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
