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
import { Loader2, Ship, FileText, Map } from "lucide-react";
import { MapPositionSelector } from "./MapPositionSelector";

interface AddVesselFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddVessel: (vesselData: any) => Promise<void>;
  loading: boolean;
}

export function AddVesselForm({ open, onOpenChange, onAddVessel, loading }: AddVesselFormProps) {
  const [vessel, setVessel] = useState({
    name: "",
    mmsi: "",
    imo: "",
    vesselType: "OIL_TANKER",
    flag: "US",
    length: "",
    width: "",
    status: "AT_SEA",
    currentLat: "",
    currentLng: "",
    destination: "",
    eta: "",
    cargo: "",
    cargoCapacity: "",
    // New cargo information fields
    oilType: "",
    quantity: "",
    dealValue: "",
    loadingPort: "",
    price: "",
    marketPrice: "",
    sourceCompany: "",
    targetRefinery: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setVessel(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    onAddVessel(vessel);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Vessel</DialogTitle>
          <DialogDescription>
            Create a new vessel in the system. All vessels require basic information.
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto pr-2 flex-grow">
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left column - Form fields */}
              <div className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold mb-3 flex items-center">
                    <Ship className="w-4 h-4 mr-2" />
                    Vessel Information
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Vessel Name</label>
                      <input 
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        placeholder="Enter vessel name"
                        value={vessel.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">MMSI Number</label>
                        <input 
                          type="text"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                          placeholder="9-digit MMSI"
                          value={vessel.mmsi}
                          onChange={(e) => handleInputChange('mmsi', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">IMO Number</label>
                        <input 
                          type="text"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                          placeholder="7-digit IMO"
                          value={vessel.imo}
                          onChange={(e) => handleInputChange('imo', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Vessel Type</label>
                        <select 
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                          value={vessel.vesselType}
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
                        <label className="text-sm font-medium">Flag</label>
                        <input 
                          type="text"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                          placeholder="e.g., US, GB"
                          value={vessel.flag}
                          onChange={(e) => handleInputChange('flag', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <select 
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                          value={vessel.status}
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
                        <label className="text-sm font-medium">Length (m)</label>
                        <input 
                          type="number"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                          placeholder="Length"
                          value={vessel.length}
                          onChange={(e) => handleInputChange('length', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Width (m)</label>
                        <input 
                          type="number"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                          placeholder="Width"
                          value={vessel.width}
                          onChange={(e) => handleInputChange('width', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Cargo Information
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">🛢️ Oil Type / Cargo Type</label>
                          <select 
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            value={vessel.oilType}
                            onChange={(e) => handleInputChange('oilType', e.target.value)}
                          >
                            <option value="">Select Oil Type</option>
                            <option value="Crude Oil">Crude Oil</option>
                            <option value="Brent Crude">Brent Crude</option>
                            <option value="WTI Crude">WTI Crude</option>
                            <option value="Heavy Crude">Heavy Crude</option>
                            <option value="Light Crude">Light Crude</option>
                            <option value="Gasoline">Gasoline</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Jet Fuel">Jet Fuel</option>
                            <option value="LNG">LNG</option>
                            <option value="LPG">LPG</option>
                            <option value="Naphtha">Naphtha</option>
                            <option value="Fuel Oil">Fuel Oil</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">📊 Quantity (barrels)</label>
                          <input 
                            type="number"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            placeholder="e.g., 2000000"
                            value={vessel.quantity}
                            onChange={(e) => handleInputChange('quantity', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">💰 Deal Value (USD)</label>
                          <input 
                            type="number"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            placeholder="e.g., 150000000"
                            value={vessel.dealValue}
                            onChange={(e) => handleInputChange('dealValue', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">⚓ Loading Port</label>
                          <input 
                            type="text"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            placeholder="e.g., Ras Tanura"
                            value={vessel.loadingPort}
                            onChange={(e) => handleInputChange('loadingPort', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">➕ Price per Barrel (USD)</label>
                          <input 
                            type="number"
                            step="0.01"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            placeholder="e.g., 85.50"
                            value={vessel.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">📈 Market Price per Barrel (USD)</label>
                          <input 
                            type="number"
                            step="0.01"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            placeholder="e.g., 87.25"
                            value={vessel.marketPrice}
                            onChange={(e) => handleInputChange('marketPrice', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">🏢 Source Company (اسم الشركة)</label>
                          <input 
                            type="text"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            placeholder="e.g., Saudi Aramco"
                            value={vessel.sourceCompany}
                            onChange={(e) => handleInputChange('sourceCompany', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">🏭 Target Refinery</label>
                          <input 
                            type="text"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            placeholder="e.g., Ruwais Refinery"
                            value={vessel.targetRefinery}
                            onChange={(e) => handleInputChange('targetRefinery', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Cargo Capacity (MT)</label>
                        <input 
                          type="number"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                          placeholder="Capacity in metric tons"
                          value={vessel.cargoCapacity}
                          onChange={(e) => handleInputChange('cargoCapacity', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3 flex items-center">
                      <Map className="w-4 h-4 mr-2" />
                      Destination
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Destination</label>
                        <input 
                          type="text"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                          placeholder="Destination port"
                          value={vessel.destination}
                          onChange={(e) => handleInputChange('destination', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">ETA</label>
                        <input 
                          type="datetime-local"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                          value={vessel.eta}
                          onChange={(e) => handleInputChange('eta', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right column - Map & Location */}
              <div className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold mb-3 flex items-center">
                    <Map className="w-4 h-4 mr-2" />
                    Position on Map
                  </h3>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Vessel Position (Click on map to set)
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Click on the map to position your vessel. You can see ports and refineries to help you place vessels at strategic locations.
                  </p>
                  
                  <MapPositionSelector 
                    onSelectPosition={(lat, lng) => {
                      handleInputChange('currentLat', lat.toString());
                      handleInputChange('currentLng', lng.toString());
                    }}
                    initialLat={vessel.currentLat}
                    initialLng={vessel.currentLng}
                  />
                  
                  {vessel.currentLat && vessel.currentLng && (
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <div>Latitude: {Number(vessel.currentLat).toFixed(6)}</div>
                      <div>Longitude: {Number(vessel.currentLng).toFixed(6)}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="ml-2"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Vessel...
              </>
            ) : 'Add Vessel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}