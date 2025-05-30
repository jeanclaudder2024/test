import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Map, FileText, Ship } from "lucide-react";
import { MapPositionSelector } from "./MapPositionSelector";

interface VesselFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (vesselData: any) => Promise<void>;
  initialData?: any;
}

export function VesselForm({
  open,
  onOpenChange,
  onSubmit,
  initialData = {}
}: VesselFormProps) {
  const [vesselData, setVesselData] = useState({
    name: "",
    mmsi: "",
    imo: "",
    vesselType: "OIL_TANKER",
    flag: "",
    status: "AT_SEA",
    length: "",
    width: "",
    cargo: "",
    cargoCapacity: "",
    currentLat: "",
    currentLng: "",
    destination: "",
    eta: "",
    ...initialData
  });
  
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setVesselData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(vesselData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting vessel data:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Vessel</DialogTitle>
          <DialogDescription>
            Create a new vessel in the system. All vessels require basic information.
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto pr-2 flex-grow">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - Basic vessel information */}
              <div className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold mb-3 flex items-center">
                    <Ship className="w-4 h-4 mr-2" />
                    Basic Information
                  </h3>
                </div>
              
                {/* Basic Information Fields */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vessel Name</label>
                    <input 
                      type="text"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      placeholder="Enter vessel name"
                      value={vesselData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">MMSI Number</label>
                    <input 
                      type="text"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      placeholder="Enter 9-digit MMSI number"
                      value={vesselData.mmsi}
                      onChange={(e) => handleInputChange('mmsi', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">IMO Number</label>
                    <input 
                      type="text"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      placeholder="Enter 7-digit IMO number"
                      value={vesselData.imo}
                      onChange={(e) => handleInputChange('imo', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Flag</label>
                    <input 
                      type="text"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      placeholder="Enter country code (e.g. US, GB)"
                      value={vesselData.flag}
                      onChange={(e) => handleInputChange('flag', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Middle column - Vessel specs & Status */}
              <div className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold mb-3 flex items-center">
                    <Ship className="w-4 h-4 mr-2" />
                    Vessel Specifications
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vessel Type</label>
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      value={vesselData.vesselType}
                      onChange={(e) => handleInputChange('vesselType', e.target.value)}
                    >
                      <option value="OIL_TANKER">Oil Tanker</option>
                      <option value="CRUDE_OIL_TANKER">Crude Oil Tanker</option>
                      <option value="CHEMICAL_TANKER">Chemical Tanker</option>
                      <option value="LNG_TANKER">LNG Tanker</option>
                      <option value="LPG_TANKER">LPG Tanker</option>
                      <option value="PRODUCT_TANKER">Product Tanker</option>
                      <option value="VLCC">VLCC</option>
                      <option value="ULCC">ULCC</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      value={vesselData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <option value="AT_SEA">At Sea</option>
                      <option value="IN_PORT">In Port</option>
                      <option value="ANCHORED">Anchored</option>
                      <option value="MOORED">Moored</option>
                      <option value="UNDERWAY">Underway</option>
                      <option value="STOPPED">Stopped</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Length (meters)</label>
                    <input 
                      type="number"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      placeholder="Enter vessel length"
                      value={vesselData.length}
                      onChange={(e) => handleInputChange('length', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Width (meters)</label>
                    <input 
                      type="number"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      placeholder="Enter vessel width"
                      value={vesselData.width}
                      onChange={(e) => handleInputChange('width', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg mt-6">
                  <h3 className="text-sm font-semibold mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Cargo Information
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cargo Type</label>
                    <input 
                      type="text"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      placeholder="Enter cargo type"
                      value={vesselData.cargo}
                      onChange={(e) => handleInputChange('cargo', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cargo Capacity (MT)</label>
                    <input 
                      type="number"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      placeholder="Enter cargo capacity"
                      value={vesselData.cargoCapacity}
                      onChange={(e) => handleInputChange('cargoCapacity', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Right column - Map & Location */}
              <div className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold mb-3 flex items-center">
                    <Map className="w-4 h-4 mr-2" />
                    Position & Destination
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vessel Position (Click on map)</label>
                    <MapPositionSelector 
                      onSelectPosition={(lat, lng) => {
                        handleInputChange('currentLat', lat.toString());
                        handleInputChange('currentLng', lng.toString());
                      }}
                      initialLat={vesselData.currentLat}
                      initialLng={vesselData.currentLng}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 mt-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Destination</label>
                      <input 
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        placeholder="Enter destination port"
                        value={vesselData.destination}
                        onChange={(e) => handleInputChange('destination', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">ETA</label>
                      <input 
                        type="datetime-local"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        value={vesselData.eta}
                        onChange={(e) => handleInputChange('eta', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="ml-2"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : 'Add Vessel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}