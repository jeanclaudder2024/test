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
import { Loader2, Ship, AlertCircle } from "lucide-react";
import { EnhancedMapSelector } from "./EnhancedMapSelector";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

interface SimpleVesselCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SimpleVesselCreator({ open, onOpenChange }: SimpleVesselCreatorProps) {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const [vessel, setVessel] = useState({
    name: "",
    mmsi: "123456789",
    imo: "1234567",
    vesselType: "OIL_TANKER",
    flag: "US",
    length: 100,
    width: 20,
    status: "AT_SEA",
    currentLat: 0,
    currentLng: 0,
    destination: "Sample Port",
    eta: new Date().toISOString().split('T')[0],
    cargo: "Crude Oil",
    cargoCapacity: 100000
  });

  // Add vessel mutation
  const { mutate: addVessel, isPending: isSubmitting } = useMutation({
    mutationFn: async (vesselData: any) => {
      try {
        // Format data to match API expectations
        const formattedData = {
          ...vesselData,
          // Make sure numbers are actually numbers
          mmsi: Number(vesselData.mmsi),
          imo: Number(vesselData.imo),
          length: Number(vesselData.length),
          width: Number(vesselData.width),
          currentLat: Number(vesselData.currentLat),
          currentLng: Number(vesselData.currentLng),
          cargoCapacity: Number(vesselData.cargoCapacity)
        };
        
        console.log("Sending vessel data:", formattedData);
        
        const response = await fetch("/api/vessels", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Server error:", errorData);
          throw new Error(errorData.message || "Failed to add vessel");
        }
        
        return response.json();
      } catch (error) {
        console.error("Error in mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Update the vessel list
      queryClient.invalidateQueries({ queryKey: ["/api/vessels"] });
      
      // Show success message
      setErrorMessage(""); // Clear any error messages
      setSuccessMessage("Vessel added successfully!");
      
      // Reset form
      setVessel({
        name: "",
        mmsi: "123456789",
        imo: "1234567",
        vesselType: "OIL_TANKER",
        flag: "US",
        length: 100,
        width: 20,
        status: "AT_SEA",
        currentLat: 0,
        currentLng: 0,
        destination: "Sample Port",
        eta: new Date().toISOString().split('T')[0],
        cargo: "Crude Oil",
        cargoCapacity: 100000
      });
      
      // Close dialog after showing success message
      setTimeout(() => {
        setSuccessMessage("");
        onOpenChange(false);
      }, 2000);
    },
    onError: (error: any) => {
      console.error("Failed to add vessel:", error);
      setSuccessMessage(""); // Clear any success messages
      setErrorMessage("Error: " + (error.message || "Failed to add vessel. Please check your data."));
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setVessel(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    addVessel(vessel);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Vessel</DialogTitle>
          <DialogDescription>
            Create a new vessel by filling out the form below. You can position it using the map, which shows ports and refineries.
          </DialogDescription>
        </DialogHeader>

        {/* Success message */}
        {successMessage && (
          <Alert className="bg-green-50 text-green-800 border-green-200 mb-4">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-800 text-sm">Success</AlertTitle>
            <AlertDescription className="text-green-700 text-xs">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Error message */}
        {errorMessage && (
          <Alert className="bg-red-50 text-red-800 border-red-200 mb-4">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertTitle className="text-red-800 text-sm">Error</AlertTitle>
            <AlertDescription className="text-red-700 text-xs">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Form Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Basic Information</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Vessel Name</label>
              <input 
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="Enter vessel name"
                value={vessel.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">MMSI</label>
                <input 
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="9-digit MMSI"
                  value={vessel.mmsi}
                  onChange={(e) => handleInputChange("mmsi", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">IMO</label>
                <input 
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="7-digit IMO"
                  value={vessel.imo}
                  onChange={(e) => handleInputChange("imo", e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Vessel Type</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={vessel.vesselType}
                  onChange={(e) => handleInputChange("vesselType", e.target.value)}
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
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g., US, GB"
                  value={vessel.flag}
                  onChange={(e) => handleInputChange("flag", e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={vessel.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
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
                <label className="text-sm font-medium">Destination</label>
                <input 
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Destination port"
                  value={vessel.destination}
                  onChange={(e) => handleInputChange("destination", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Position on Map</h3>
            <p className="text-xs text-gray-500 mb-2">
              Click on the map to position your vessel. The map shows ports (yellow) and refineries (orange) to help you place vessels at strategic locations.
            </p>
            
            <EnhancedMapSelector 
              onSelectPosition={(lat, lng) => {
                // Store coordinates as numbers directly
                handleInputChange("currentLat", lat);
                handleInputChange("currentLng", lng);
              }}
              initialLat={vessel.currentLat}
              initialLng={vessel.currentLng}
            />
            
            {vessel.currentLat !== 0 && vessel.currentLng !== 0 && (
              <div className="text-sm text-center">
                Selected position: {Number(vessel.currentLat).toFixed(4)}, {Number(vessel.currentLng).toFixed(4)}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !vessel.name || !vessel.currentLat || !vessel.currentLng}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Vessel...
              </>
            ) : (
              <>
                <Ship className="mr-2 h-4 w-4" />
                Add Vessel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}