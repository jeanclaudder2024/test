import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Ship,
  Map,
  Database,
  FileText,
  Download,
  Upload,
  AlertCircle,
  Info,
  RotateCw,
  Clock,
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
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export function FixedDataManagement() {
  const [activeDataType, setActiveDataType] = useState("ports");

  // Mock data for the demo
  const dataStatus = {
    ports: {
      lastSync: "2023-06-15T14:30:00Z",
      status: "active",
      count: 223
    },
    refineries: {
      lastSync: "2023-06-14T09:15:00Z",
      status: "active",
      count: 189
    },
    documents: {
      lastSync: "2023-06-10T16:45:00Z",
      status: "active", 
      count: 478
    }
  };

  // Mock activities for the demo
  const activityLogs = [
    {
      id: 1,
      type: "sync",
      entity: "ports",
      status: "completed",
      startTime: "2023-06-15T14:00:00Z",
      endTime: "2023-06-15T14:30:00Z",
      details: "Successfully synchronized port data from external API"
    },
    {
      id: 2,
      type: "backup",
      entity: "refineries",
      status: "completed",
      startTime: "2023-06-14T09:00:00Z",
      endTime: "2023-06-14T09:15:00Z",
      details: "Backup of refinery data completed successfully"
    },
    {
      id: 3,
      type: "sync",
      entity: "documents",
      status: "completed",
      startTime: "2023-06-10T16:30:00Z",
      endTime: "2023-06-10T16:45:00Z",
      details: "Successfully synchronized document data"
    }
  ];

  // Mock port data for the demo
  const ports = [
    { id: 1, name: "Port of Rotterdam", country: "Netherlands", type: "International", capacity: "High" },
    { id: 2, name: "Port of Singapore", country: "Singapore", type: "International", capacity: "High" },
    { id: 3, name: "Port of Shanghai", country: "China", type: "International", capacity: "High" },
    { id: 4, name: "Port of Los Angeles", country: "USA", type: "International", capacity: "High" },
    { id: 5, name: "Port of Hamburg", country: "Germany", type: "International", capacity: "Medium" }
  ];

  // Mock refinery data for the demo
  const refineries = [
    { id: 1, name: "Rotterdam Refinery", country: "Netherlands", capacity: "580,000 bpd", type: "Full Conversion" },
    { id: 2, name: "Jamnagar Refinery", country: "India", capacity: "1,240,000 bpd", type: "Full Conversion" },
    { id: 3, name: "Baytown Refinery", country: "USA", capacity: "560,500 bpd", type: "Full Conversion" },
    { id: 4, name: "Ras Tanura Refinery", country: "Saudi Arabia", capacity: "550,000 bpd", type: "Full Conversion" },
    { id: 5, name: "SK Energy Ulsan", country: "South Korea", capacity: "840,000 bpd", type: "Full Conversion" }
  ];

  // Mock document data for the demo
  const documents = [
    { id: 1, title: "Bill of Lading #12345", type: "Bill of Lading", date: "2023-06-10", parties: "Shipper A, Consignee B" },
    { id: 2, title: "Certificate of Origin #789", type: "Certificate", date: "2023-06-09", parties: "Chamber of Commerce" },
    { id: 3, title: "Quality Certificate #456", type: "Inspection", date: "2023-06-08", parties: "SGS Inspection" },
    { id: 4, title: "Insurance Policy #INS-789", type: "Insurance", date: "2023-06-07", parties: "Marine Insurer" },
    { id: 5, title: "Charter Party Agreement", type: "Contract", date: "2023-06-06", parties: "Owner, Charterer" }
  ];

  const handleSyncData = (dataType) => {
    console.log(`Syncing ${dataType} data...`);
  };

  const handleBackupData = (dataType) => {
    console.log(`Backing up ${dataType} data...`);
  };

  const handleRestoreData = (dataType) => {
    console.log(`Restoring ${dataType} data...`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Database className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'syncing': return <RotateCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getEntityIcon = (entity) => {
    switch (entity) {
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
      title: "Ports",
      count: dataStatus.ports.count,
      icon: Map,
      type: "ports",
      color: "text-purple-500",
      lastSync: dataStatus.ports.lastSync,
      status: dataStatus.ports.status
    },
    {
      title: "Refineries",
      count: dataStatus.refineries.count,
      icon: Database,
      type: "refineries",
      color: "text-orange-500",
      lastSync: dataStatus.refineries.lastSync,
      status: dataStatus.refineries.status
    },
    {
      title: "Documents",
      count: dataStatus.documents.count,
      icon: FileText,
      type: "documents",
      color: "text-indigo-500",
      lastSync: dataStatus.documents.lastSync,
      status: dataStatus.documents.status
    }
  ];

  const renderTable = () => {
    if (activeDataType === "ports") {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Port Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ports.map((port) => (
              <TableRow key={port.id}>
                <TableCell>{port.id}</TableCell>
                <TableCell>{port.name}</TableCell>
                <TableCell>{port.country}</TableCell>
                <TableCell>{port.type}</TableCell>
                <TableCell>{port.capacity}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    } else if (activeDataType === "refineries") {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Refinery Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {refineries.map((refinery) => (
              <TableRow key={refinery.id}>
                <TableCell>{refinery.id}</TableCell>
                <TableCell>{refinery.name}</TableCell>
                <TableCell>{refinery.country}</TableCell>
                <TableCell>{refinery.capacity}</TableCell>
                <TableCell>{refinery.type}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    } else if (activeDataType === "documents") {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Parties</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.id}</TableCell>
                <TableCell>{doc.title}</TableCell>
                <TableCell>{doc.type}</TableCell>
                <TableCell>{doc.date}</TableCell>
                <TableCell>{doc.parties}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    } else if (activeDataType === "logs") {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activityLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.id}</TableCell>
                <TableCell className="flex items-center gap-2">
                  {getActionTypeIcon(log.type)}
                  <span className="capitalize">{log.type}</span>
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  {getEntityIcon(log.entity)}
                  <span className="capitalize">{log.entity}</span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                    log.status === "completed" ? "bg-green-100 text-green-800" :
                    log.status === "in-progress" ? "bg-blue-100 text-blue-800" :
                    log.status === "failed" ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>{formatDate(log.startTime)}</TableCell>
                <TableCell>{formatDate(log.endTime)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeDataType} onValueChange={setActiveDataType}>
        <TabsList className="mb-4">
          {dataCards.map((card) => (
            <TabsTrigger key={card.type} value={card.type} className="flex items-center gap-2">
              <card.icon className={`h-4 w-4 ${card.color}`} />
              {card.title}
            </TabsTrigger>
          ))}
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
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Data
                    </Button>
                    <Button variant="outline" onClick={() => handleBackupData(card.type)}>
                      <Download className="h-4 w-4 mr-2" />
                      Backup
                    </Button>
                    <Button variant="outline" onClick={() => handleRestoreData(card.type)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                  </div>
                </div>

                <div className="border rounded-md">
                  {renderTable()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-gray-100">
                    <Clock className="h-6 w-6 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Activity Logs</h3>
                    <p className="text-sm text-muted-foreground">
                      Recent system activities and data operations
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Logs
                  </Button>
                </div>
              </div>

              <div className="border rounded-md">
                {renderTable()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}