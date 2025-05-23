import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Ship, Pencil, Trash, CheckCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { SimpleVesselCreator } from "./SimpleVesselCreator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function VesselManagement() {
  const [showAddVesselDialog, setShowAddVesselDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const queryClient = useQueryClient();

  // Fetch vessels
  const { data: vessels = [], isLoading } = useQuery({
    queryKey: ["/api/vessels"],
    queryFn: async () => {
      const response = await fetch("/api/vessels");
      if (!response.ok) {
        throw new Error("Failed to fetch vessels");
      }
      return response.json();
    }
  });

  // Add vessel mutation
  const { mutate: addVessel, isPending: addingVessel } = useMutation({
    mutationFn: async (vesselData: any) => {
      const response = await fetch("/api/vessels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vesselData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add vessel");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vessels"] });
      setShowAddVesselDialog(false);
      setSuccessMessage("Vessel added successfully!");
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    },
  });

  // Delete vessel mutation
  const { mutate: deleteVessel } = useMutation({
    mutationFn: async (vesselId: number) => {
      const response = await fetch(`/api/vessels/${vesselId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete vessel");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vessels"] });
    },
  });

  const handleAddVessel = async (vesselData: any) => {
    addVessel(vesselData);
  };

  const handleDeleteVessel = (vesselId: number) => {
    if (window.confirm("Are you sure you want to delete this vessel?")) {
      deleteVessel(vesselId);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Ship className="h-5 w-5" />
          Vessel Management
        </CardTitle>
        <CardDescription>
          Manage vessels in the system. Add, edit, or delete vessels as needed.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <Button onClick={() => setShowAddVesselDialog(true)} className="gap-2">
              <Ship className="h-4 w-4" />
              Add New Vessel
            </Button>
            
            {successMessage && (
              <Alert className="ml-4 bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle className="text-green-800 text-sm">Success</AlertTitle>
                <AlertDescription className="text-green-700 text-xs">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>MMSI</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Flag</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    Loading vessels...
                  </TableCell>
                </TableRow>
              ) : vessels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    No vessels found. Add your first vessel to get started.
                  </TableCell>
                </TableRow>
              ) : (
                vessels.map((vessel: any) => (
                  <TableRow key={vessel.id}>
                    <TableCell>{vessel.id}</TableCell>
                    <TableCell>{vessel.name}</TableCell>
                    <TableCell>{vessel.mmsi || "N/A"}</TableCell>
                    <TableCell>
                      {vessel.vesselType?.replace("_", " ") || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        vessel.status === "AT_SEA" ? "bg-blue-100 text-blue-800" :
                        vessel.status === "IN_PORT" ? "bg-green-100 text-green-800" :
                        vessel.status === "ANCHORED" ? "bg-amber-100 text-amber-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {vessel.status?.replace("_", " ") || "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell>{vessel.flag || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500"
                          onClick={() => handleDeleteVessel(vessel.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      {/* Using SimpleVesselForm for adding vessels */}
      <SimpleVesselForm
        open={showAddVesselDialog}
        onOpenChange={setShowAddVesselDialog}
        onAddVessel={handleAddVessel}
        loading={addingVessel}
      />
    </Card>
  );
}