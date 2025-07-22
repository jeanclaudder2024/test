import React from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Ship, MapPin, Calendar, Anchor, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MobileVesselCardProps {
  vessel: {
    id: number;
    name: string;
    imo: string;
    vesselType: string;
    flag: string;
    currentLat?: string | null;
    currentLng?: string | null;
    departurePort?: string | null;
    destinationPort?: string | null;
    eta?: string | null;
    status?: string | null;
    speed?: string | null;
    cargoCapacity?: number | null;
    dealValue?: string | null;
    quantity?: string | null;
    oilCategory?: string;
    cargoType?: string;
    built?: number | null;
    deadweight?: number | null;
    mmsi?: string;
    departureTime?: string | null;
    currentRegion?: string;
    previousPort?: string | null;
    lastPortDepatureTime?: string | null;
    voyageProgress?: number | null;
  };
  className?: string;
}

export function MobileVesselCard({ vessel, className }: MobileVesselCardProps) {
  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'en route':
      case 'underway':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'at anchor':
      case 'anchored':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'moored':
      case 'berthed':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'not under command':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const formatValue = (value: string | number | null) => {
    if (!value) return 'N/A';
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <Link href={`/vessels/${vessel.id}`}>
      <Card className={cn("touch-manipulation active:scale-95 transition-transform duration-150", className)}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{vessel.name}</h3>
              <p className="text-sm text-muted-foreground">IMO: {vessel.imo}</p>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <Badge variant="outline" className="text-xs">
                {vessel.vesselType}
              </Badge>
              {vessel.status && (
                <Badge className={cn("text-xs", getStatusColor(vessel.status))}>
                  {vessel.status}
                </Badge>
              )}
            </div>
          </div>

          {/* Route Information */}
          <div className="space-y-2 mb-4">
            {vessel.departurePort && (
              <div className="flex items-center gap-2 text-sm">
                <Anchor className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">From:</span>
                <span className="truncate">{vessel.departurePort}</span>
              </div>
            )}
            {vessel.destinationPort && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">To:</span>
                <span className="truncate">{vessel.destinationPort}</span>
              </div>
            )}
            {vessel.eta && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">ETA:</span>
                <span>{formatDate(vessel.eta)}</span>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Ship className="h-3 w-3" />
                <span>Speed</span>
              </div>
              <p className="font-medium">{vessel.speed || 'N/A'} knots</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>Capacity</span>
              </div>
              <p className="font-medium">{formatValue(vessel.cargoCapacity)} DWT</p>
            </div>
          </div>

          {/* Deal Information */}
          {(vessel.dealValue || vessel.quantity) && (
            <div className="mt-4 pt-3 border-t border-border/50">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {vessel.quantity && (
                  <div>
                    <span className="text-muted-foreground">Quantity:</span>
                    <p className="font-medium">{vessel.quantity}</p>
                  </div>
                )}
                {vessel.dealValue && (
                  <div>
                    <span className="text-muted-foreground">Value:</span>
                    <p className="font-medium text-green-600">{vessel.dealValue}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Flag */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Flag:</span>
              <span className="font-medium">{vessel.flag}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              View Details →
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}