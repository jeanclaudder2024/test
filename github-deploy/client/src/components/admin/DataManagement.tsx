import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimpleVesselForm } from "./SimpleVesselForm";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { MapPositionSelector } from "@/components/admin/MapPositionSelector";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle,
  Ship, 
  Database, 
  Map, 
  FileText, 
  RefreshCw,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Info,
  MoreHorizontal,
  Clock,
  RotateCw
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function DataManagement() {
  const [activeTab, setActiveTab] = useState("vessels");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showAddVesselDialog, setShowAddVesselDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [newVessel, setNewVessel] = useState({
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
    cargoCapacity: ""
  });
  const [dataStatus, setDataStatus] = useState({
    vessels: { lastSync: "2023-05-22T14:30:00Z", status: "completed", count: 2499 },
    ports: { lastSync: "2023-05-21T10:15:00Z", status: "completed", count: 223 },
    refineries: { lastSync: "2023-05-20T08:45:00Z", status: "completed", count: 105 },
    documents: { lastSync: "2023-05-19T16:20:00Z", status: "completed", count: 87 }
  });
  
  // Fetch real vessels from the database
  const { data: vessels, isLoading: loadingVessels, refetch: refetchVessels } = useQuery({
    queryKey: ['/api/vessels/admin'],
    queryFn: () => fetch('/api/vessels/polling?limit=50').then(res => res.json()),
  });

  const [actionLog, setActionLog] = useState([
    { 
      id: 1, 
      type: "sync", 
      entity: "vessels", 
      status: "completed", 
      startTime: "2023-05-22T14:00:00Z", 
      endTime: "2023-05-22T14:30:00Z",
      details: "Successfully synchronized 2499 vessels"
    },
    { 
      id: 2, 
      type: "sync", 
      entity: "ports", 
      status: "completed", 
      startTime: "2023-05-21T10:00:00Z", 
      endTime: "2023-05-21T10:15:00Z",
      details: "Successfully synchronized 223 ports"
    },
    { 
      id: 3, 
      type: "sync", 
      entity: "refineries", 
      status: "completed", 
      startTime: "2023-05-20T08:30:00Z", 
      endTime: "2023-05-20T08:45:00Z",
      details: "Successfully synchronized 105 refineries"
    },
    { 
      id: 4, 
      type: "sync", 
      entity: "documents", 
      status: "completed", 
      startTime: "2023-05-19T16:00:00Z", 
      endTime: "2023-05-19T16:20:00Z", 
      details: "Successfully synchronized 87 documents"
    },
    { 
      id: 5, 
      type: "backup", 
      entity: "all", 
      status: "completed", 
      startTime: "2023-05-18T01:00:00Z", 
      endTime: "2023-05-18T01:15:00Z",
      details: "Full database backup completed successfully"
    }
  ]);

  const handleSyncData = (dataType) => {
    // This would trigger an API call to sync data in a real app
    setConfirmAction({
      type: 'sync',
      dataType: dataType,
      title: `Sync ${dataType} Data`,
      description: `This will synchronize all ${dataType} data from external sources. This operation can take several minutes.`
    });
    setShowConfirmDialog(true);
  };

  const handleBackupData = (dataType) => {
    setConfirmAction({
      type: 'backup',
      dataType: dataType,
      title: `Backup ${dataType} Data`,
      description: `This will create a full backup of all ${dataType} data.`
    });
    setShowConfirmDialog(true);
  };

  const handleResetData = (dataType) => {
    setConfirmAction({
      type: 'reset',
      dataType: dataType,
      title: `Reset ${dataType} Data`,
      description: `WARNING: This will completely reset all ${dataType} data. This action cannot be undone.`,
      destructive: true
    });
    setShowConfirmDialog(true);
  };

  const confirmActionExecute = () => {
    if (!confirmAction) return;
    
    // Here you would make the API call in a real implementation
    // For now, we'll just update the UI
    
    const newLog = { 
      id: actionLog.length + 1, 
      type: confirmAction.type, 
      entity: confirmAction.dataType, 
      status: "in_progress", 
      startTime: new Date().toISOString(), 
      endTime: null,
      details: `${confirmAction.type} operation started for ${confirmAction.dataType}`
    };
    
    setActionLog([newLog, ...actionLog]);
    
    if (confirmAction.type === 'sync') {
      setDataStatus({
        ...dataStatus,
        [confirmAction.dataType]: {
          ...dataStatus[confirmAction.dataType],
          status: "syncing"
        }
      });
    }
    
    setShowConfirmDialog(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  const [addingVessel, setAddingVessel] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const handleAddVessel = async () => {
    try {
      setAddingVessel(true);
      
      // Create a vessel object with the form data
      const vesselData = {
        ...newVessel,
        mmsi: newVessel.mmsi ? parseInt(newVessel.mmsi) : null,
        imo: newVessel.imo ? parseInt(newVessel.imo) : null,
        length: newVessel.length ? parseFloat(newVessel.length) : null,
        width: newVessel.width ? parseFloat(newVessel.width) : null,
        currentLat: newVessel.currentLat ? parseFloat(newVessel.currentLat) : null,
        currentLng: newVessel.currentLng ? parseFloat(newVessel.currentLng) : null,
        cargoCapacity: newVessel.cargoCapacity ? parseInt(newVessel.cargoCapacity) : null
      };
      
      // Make an API call to create the vessel
      const response = await fetch('/api/vessels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vesselData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create vessel');
      }
      
      // Get the created vessel from the response
      const createdVessel = await response.json();
      
      // Set success message
      setSuccessMessage(`Vessel "${newVessel.name}" added successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      
      // Add a log entry for the vessel creation
      const now = new Date().toISOString();
      const newLog = { 
        id: actionLog.length + 1, 
        type: 'create', 
        entity: 'vessels', 
        status: "completed", 
        startTime: now, 
        endTime: now,
        details: `Added new vessel: ${newVessel.name}`
      };
      
      setActionLog([newLog, ...actionLog]);
      
      // Update vessel count
      setDataStatus({
        ...dataStatus,
        vessels: {
          ...dataStatus.vessels,
          count: dataStatus.vessels.count + 1,
          lastSync: now
        }
      });
      
      // Refresh the vessels list
      refetchVessels();
      
      // Close dialog and reset form
      setShowAddVesselDialog(false);
      setNewVessel({
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
        cargoCapacity: ""
      });
    } catch (error) {
      console.error('Error adding vessel:', error);
      // Display error in the log
      const now = new Date().toISOString();
      const errorLog = { 
        id: actionLog.length + 1, 
        type: 'error', 
        entity: 'vessels', 
        status: "failed", 
        startTime: now, 
        endTime: now,
        details: `Failed to add vessel: ${newVessel.name}. Error: ${error.message}`
      };
      
      setActionLog([errorLog, ...actionLog]);
    } finally {
      setAddingVessel(false);
    }
  };
  
  const handleVesselInputChange = (field, value) => {
    setNewVessel({
      ...newVessel,
      [field]: value
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress': return <RotateCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'syncing': return <RotateCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getEntityIcon = (entity) => {
    switch (entity) {
      case 'vessels': return <Ship className="h-5 w-5 text-blue-500" />;
      case 'ports': return <Map className="h-5 w-5 text-purple-500" />;
      case 'refineries': return <Database className="h-5 w-5 text-orange-500" />;
      case 'documents': return <FileText className="h-5 w-5 text-indigo-500" />;
      default: return <Database className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActionTypeIcon = (type) => {
    switch (type) {
      case 'sync': return <RefreshCw className="h-5 w-5 text-blue-500" />;
      case 'backup': return <Download className="h-5 w-5 text-green-500" />;
      case 'reset': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'restore': return <Upload className="h-5 w-5 text-amber-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const dataCards = [
    {
      title: "Vessels",
      count: dataStatus.vessels.count,
      icon: Ship,
      type: "vessels",
      lastSync: dataStatus.vessels.lastSync,
      status: dataStatus.vessels.status,
      color: "text-blue-500"
    },
    {
      title: "Ports",
      count: dataStatus.ports.count,
      icon: Map,
      type: "ports",
      lastSync: dataStatus.ports.lastSync,
      status: dataStatus.ports.status,
      color: "text-purple-500"
    },
    {
      title: "Refineries",
      count: dataStatus.refineries.count,
      icon: Database,
      type: "refineries",
      lastSync: dataStatus.refineries.lastSync,
      status: dataStatus.refineries.status,
      color: "text-orange-500"
    },
    {
      title: "Documents",
      count: dataStatus.documents.count,
      icon: FileText,
      type: "documents",
      lastSync: dataStatus.documents.lastSync,
      status: dataStatus.documents.status,
      color: "text-indigo-500"
    }
  ];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="vessels" className="flex items-center gap-2">
            <Ship className="h-4 w-4" />
            Vessels
          </TabsTrigger>
          <TabsTrigger value="ports" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Ports
          </TabsTrigger>
          <TabsTrigger value="refineries" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Refineries
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Activity Logs
          </TabsTrigger>
        </TabsList>

        {/* Data type specific tabs */}
        {dataCards.map((card) => (
          <TabsContent key={card.type} value={card.type} className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full bg-${card.type}-100`}>
                      <card.icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{card.title} Data Management</h3>
                      <p className="text-sm text-muted-foreground">
                        {card.count.toLocaleString()} records | Last Sync: {formatDate(card.lastSync)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleSyncData(card.type)}
                      disabled={card.status === 'syncing'}
                      className={card.status === 'syncing' ? 'opacity-50' : ''}
                    >
                      {card.status === 'syncing' ? (
                        <>
                          <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync Data
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => handleBackupData(card.type)}>
                      <Download className="h-4 w-4 mr-2" />
                      Backup
                    </Button>
                    <Button variant="destructive" onClick={() => handleResetData(card.type)}>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Reset Data
                    </Button>
                  </div>
                </div>

                {card.status === 'syncing' && (
                  <Alert className="mb-6">
                    <RotateCw className="h-4 w-4 animate-spin" />
                    <AlertTitle>Sync in Progress</AlertTitle>
                    <AlertDescription>
                      {card.title} data is currently being synchronized. This may take several minutes.
                    </AlertDescription>
                  </Alert>
                )}
                
                {card.type === "vessels" && (
                  <div className="mb-4">
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
                    
                    {/* Using our new SimpleVesselForm component */}
                    <SimpleVesselForm
                      open={showAddVesselDialog}
                      onOpenChange={setShowAddVesselDialog}
                      onAddVessel={handleAddVessel}
                      loading={addingVessel}
                    />
                  </div>
                )}

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
                      {card.type === "vessels" ? (
                        loadingVessels ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <div className="flex justify-center items-center">
                                <RotateCw className="h-6 w-6 animate-spin text-primary mr-2" />
                                <span>Loading vessels...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : vessels?.vessels && vessels.vessels.length > 0 ? (
                          vessels.vessels.map((vessel) => (
                            <TableRow key={vessel.id}>
                              <TableCell>{vessel.id}</TableCell>
                              <TableCell className="font-medium">{vessel.name}</TableCell>
                              <TableCell>{vessel.mmsi || "N/A"}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-blue-500 bg-blue-50">
                                  {vessel.vesselType?.replace(/_/g, ' ') || "Unknown"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={
                                    vessel.status === "AT_SEA" ? "bg-green-100 text-green-800" :
                                    vessel.status === "IN_PORT" ? "bg-blue-100 text-blue-800" :
                                    vessel.status === "ANCHORED" ? "bg-yellow-100 text-yellow-800" :
                                    vessel.status === "MOORED" ? "bg-purple-100 text-purple-800" :
                                    "bg-gray-100 text-gray-800"
                                  }
                                >
                                  {vessel.status?.replace(/_/g, ' ') || "Unknown"}
                                </Badge>
                              </TableCell>
                              <TableCell>{vessel.flag}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                    <DropdownMenuItem>Edit Vessel</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No vessels found. Add some vessels to see them here.
                            </TableCell>
                          </TableRow>
                        )
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            This is a placeholder for {card.title.toLowerCase()} data table.
                            In a real application, this would list actual {card.title.toLowerCase()} records.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        {/* Activity Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">System Activity Logs</h3>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Logs
                </Button>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {actionLog.map((log) => {
                      const duration = log.endTime ? 
                        Math.round((new Date(log.endTime) - new Date(log.startTime)) / 1000) : 
                        null;
                        
                      return (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getActionTypeIcon(log.type)}
                              <span className="capitalize">{log.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getEntityIcon(log.entity)}
                              <span className="capitalize">{log.entity}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              log.status === 'completed' ? 'bg-green-100 text-green-800' :
                              log.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(log.status)}
                                <span className="capitalize">{log.status.replace('_', ' ')}</span>
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(log.startTime)}</TableCell>
                          <TableCell>
                            {duration !== null ? `${duration} seconds` : 'In progress'}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Download Log</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmAction?.title}</DialogTitle>
            <DialogDescription>{confirmAction?.description}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant={confirmAction?.destructive ? "destructive" : "default"}
              onClick={confirmActionExecute}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Add Vessel Dialog */}
      <Dialog open={showAddVesselDialog} onOpenChange={setShowAddVesselDialog}>
        <DialogContent className="max-w-4xl h-[90vh] p-4">
          <DialogHeader>
            <DialogTitle>Add New Vessel</DialogTitle>
            <DialogDescription>
              Create a new vessel in the system. All vessels require basic information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="h-[calc(100%-8rem)] overflow-y-auto mt-4">
            <div className="grid grid-cols-1 gap-6 mb-4">
              {/* Form content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        value={newVessel.name}
                        onChange={(e) => handleVesselInputChange('name', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">MMSI Number</label>
                      <input 
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        placeholder="Enter 9-digit MMSI number"
                        value={newVessel.mmsi}
                        onChange={(e) => handleVesselInputChange('mmsi', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">IMO Number</label>
                      <input 
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        placeholder="Enter 7-digit IMO number"
                        value={newVessel.imo}
                        onChange={(e) => handleVesselInputChange('imo', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Flag</label>
                      <input 
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        placeholder="Enter country code (e.g. US, GB)"
                        value={newVessel.flag}
                        onChange={(e) => handleVesselInputChange('flag', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Middle column - Vessel specs & Status */}
                <div className="space-y-6">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold mb-3 flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Vessel Specifications
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Vessel Type</label>
                      <select 
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        value={newVessel.vesselType}
                        onChange={(e) => handleVesselInputChange('vesselType', e.target.value)}
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
                        value={newVessel.status}
                        onChange={(e) => handleVesselInputChange('status', e.target.value)}
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
                        value={newVessel.length}
                        onChange={(e) => handleVesselInputChange('length', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Width (meters)</label>
                      <input 
                        type="number"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        placeholder="Enter vessel width"
                        value={newVessel.width}
                        onChange={(e) => handleVesselInputChange('width', e.target.value)}
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
                        value={newVessel.cargo}
                        onChange={(e) => handleVesselInputChange('cargo', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cargo Capacity (MT)</label>
                      <input 
                        type="number"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        placeholder="Enter cargo capacity"
                        value={newVessel.cargoCapacity}
                        onChange={(e) => handleVesselInputChange('cargoCapacity', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Right column - Map & Location */}
                <div className="space-y-6 lg:col-span-1">
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
                          handleVesselInputChange('currentLat', lat.toString());
                          handleVesselInputChange('currentLng', lng.toString());
                        }}
                        initialLat={newVessel.currentLat}
                        initialLng={newVessel.currentLng}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 mt-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Destination</label>
                        <input 
                          type="text"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                          placeholder="Enter destination port"
                          value={newVessel.destination}
                          onChange={(e) => handleVesselInputChange('destination', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">ETA</label>
                        <input 
                          type="datetime-local"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                          value={newVessel.eta}
                          onChange={(e) => handleVesselInputChange('eta', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddVesselDialog(false)} disabled={addingVessel}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleAddVessel} disabled={addingVessel}>
              {addingVessel ? (
                <>
                  <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Ship className="h-4 w-4 mr-2" />
                  Add Vessel
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}