import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Package, 
  FileText, 
  Upload, 
  Building2, 
  Calendar, 
  DollarSign,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  TrendingUp
} from "lucide-react";

interface Broker {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt: string;
}

interface BrokerDeal {
  id: number;
  brokerId: number;
  fakeCompanyId: number;
  status: string;
  dealValue?: string;
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  fakeCompany: {
    id: number;
    realCompanyId: number;
    generatedName: string;
    realCompany: {
      id: number;
      name: string;
      industry: string;
      logo?: string;
      description?: string;
    };
  };
}

interface BrokerDocument {
  id: number;
  brokerId: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  title?: string;
  uploadedByAdmin?: number;
  isRead: boolean;
  createdAt: string;
}

interface OilMarketAlert {
  id: number;
  title: string;
  message: string;
  alertType: string;
  priority: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export default function BrokerManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBrokerId, setSelectedBrokerId] = useState<number | null>(null);
  const [dealUpdate, setDealUpdate] = useState({
    dealId: 0,
    status: "",
    adminNotes: "",
  });
  const [newDocument, setNewDocument] = useState({
    brokerId: 0,
    title: "",
    fileName: "",
    fileUrl: "",
    fileType: "pdf",
  });
  const [newAlert, setNewAlert] = useState({
    title: "",
    message: "",
    alertType: "info",
    priority: "medium",
    targetBrokers: "",
  });

  // Fetch all brokers
  const { data: brokers = [], isLoading: brokersLoading } = useQuery({
    queryKey: ["/api/admin/brokers"],
    queryFn: () => apiRequest("/api/admin/brokers"),
  });

  // Fetch all broker deals
  const { data: allDeals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ["/api/broker-deals"],
    queryFn: () => apiRequest("/api/broker-deals"),
  });

  // Fetch broker documents
  const { data: allDocuments = [], isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/broker-documents"],
    queryFn: () => apiRequest("/api/broker-documents"),
  });

  // Fetch oil market alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/oil-market-alerts"],
    queryFn: () => apiRequest("/api/oil-market-alerts"),
  });

  // Update deal status mutation
  const updateDealMutation = useMutation({
    mutationFn: async ({ dealId, status, adminNotes }: { dealId: number; status: string; adminNotes: string }) => {
      return apiRequest(`/api/broker-deals/${dealId}`, {
        method: "PATCH",
        body: JSON.stringify({ status, adminNotes }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broker-deals"] });
      toast({
        title: "Deal Updated",
        description: "Deal status has been updated successfully.",
      });
      setDealUpdate({ dealId: 0, status: "", adminNotes: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update deal status.",
        variant: "destructive",
      });
    },
  });

  // Create document mutation
  const createDocumentMutation = useMutation({
    mutationFn: async (documentData: any) => {
      return apiRequest("/api/broker-documents", {
        method: "POST",
        body: documentData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broker-documents"] });
      toast({
        title: "Document Uploaded",
        description: "Document has been sent to the broker successfully.",
      });
      setNewDocument({
        brokerId: 0,
        title: "",
        fileName: "",
        fileUrl: "",
        fileType: "pdf",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload document.",
        variant: "destructive",
      });
    },
  });

  // Create alert mutation
  const createAlertMutation = useMutation({
    mutationFn: async (alertData: any) => {
      return apiRequest("/api/oil-market-alerts", {
        method: "POST",
        body: alertData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/oil-market-alerts"] });
      toast({
        title: "Alert Created",
        description: "Oil market alert has been created successfully.",
      });
      setNewAlert({
        title: "",
        message: "",
        alertType: "info",
        priority: "medium",
        targetBrokers: "",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create market alert.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500";
      case "approved":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getBrokerDeals = (brokerId: number) => {
    return allDeals.filter((deal: BrokerDeal) => deal.brokerId === brokerId);
  };

  const getBrokerDocuments = (brokerId: number) => {
    return allDocuments.filter((doc: BrokerDocument) => doc.brokerId === brokerId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Broker Management</h2>
          <p className="text-gray-400">Manage broker deals, documents, and market alerts</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <TrendingUp className="h-4 w-4 mr-2" />
                Create Market Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create Market Alert</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Create a new oil market alert for brokers
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="alert-title" className="text-gray-300">Alert Title</Label>
                  <Input
                    id="alert-title"
                    value={newAlert.title}
                    onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                    placeholder="Oil price alert..."
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="alert-message" className="text-gray-300">Alert Message</Label>
                  <Textarea
                    id="alert-message"
                    value={newAlert.message}
                    onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                    placeholder="Detailed alert message..."
                    className="bg-gray-700 border-gray-600 text-white"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="alert-type" className="text-gray-300">Alert Type</Label>
                    <Select
                      value={newAlert.alertType}
                      onValueChange={(value) => setNewAlert({ ...newAlert, alertType: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="alert-priority" className="text-gray-300">Priority</Label>
                    <Select
                      value={newAlert.priority}
                      onValueChange={(value) => setNewAlert({ ...newAlert, priority: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="target-brokers" className="text-gray-300">Target Brokers (IDs)</Label>
                  <Input
                    id="target-brokers"
                    value={newAlert.targetBrokers}
                    onChange={(e) => setNewAlert({ ...newAlert, targetBrokers: e.target.value })}
                    placeholder="1,2,3 (leave empty for all brokers)"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <Button
                  onClick={() => {
                    const alertData = {
                      ...newAlert,
                      targetBrokers: newAlert.targetBrokers ? `[${newAlert.targetBrokers}]` : null,
                    };
                    createAlertMutation.mutate(alertData);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white w-full"
                  disabled={createAlertMutation.isPending || !newAlert.title || !newAlert.message}
                >
                  {createAlertMutation.isPending ? "Creating..." : "Create Alert"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Brokers</p>
                <p className="text-2xl font-bold text-white">{brokers.length}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Deals</p>
                <p className="text-2xl font-bold text-white">{allDeals.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Deals</p>
                <p className="text-2xl font-bold text-white">
                  {allDeals.filter((deal: BrokerDeal) => deal.status === "pending").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Alerts</p>
                <p className="text-2xl font-bold text-white">
                  {alerts.filter((alert: OilMarketAlert) => alert.isActive).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Brokers List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Brokers
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage broker accounts and their activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {brokersLoading ? (
            <div className="text-center py-8 text-gray-400">Loading brokers...</div>
          ) : brokers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No brokers found.</div>
          ) : (
            <div className="space-y-4">
              {brokers.map((broker: Broker) => {
                const brokerDeals = getBrokerDeals(broker.id);
                const brokerDocuments = getBrokerDocuments(broker.id);
                
                return (
                  <Card key={broker.id} className="bg-gray-700 border-gray-600">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {broker.firstName && broker.lastName 
                                ? `${broker.firstName} ${broker.lastName}` 
                                : broker.email}
                            </h3>
                            <p className="text-gray-400 text-sm">{broker.email}</p>
                            <p className="text-gray-400 text-sm">
                              Joined: {new Date(broker.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-blue-500 text-white">
                          {broker.role.charAt(0).toUpperCase() + broker.role.slice(1)}
                        </Badge>
                      </div>

                      {/* Broker Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-xl font-bold text-white">{brokerDeals.length}</p>
                          <p className="text-gray-400 text-sm">Total Deals</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-white">
                            {brokerDeals.filter((deal: BrokerDeal) => deal.status === "pending").length}
                          </p>
                          <p className="text-gray-400 text-sm">Pending</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-white">{brokerDocuments.length}</p>
                          <p className="text-gray-400 text-sm">Documents</p>
                        </div>
                      </div>

                      {/* Recent Deals */}
                      {brokerDeals.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-white font-medium mb-2">Recent Deals</h4>
                          <div className="space-y-2">
                            {brokerDeals.slice(0, 3).map((deal: BrokerDeal) => (
                              <div key={deal.id} className="flex items-center justify-between bg-gray-600 p-3 rounded-lg">
                                <div className="flex items-center gap-3">
                                  {deal.fakeCompany.realCompany.logo ? (
                                    <img
                                      src={deal.fakeCompany.realCompany.logo}
                                      alt={deal.fakeCompany.realCompany.name}
                                      className="w-8 h-8 rounded object-cover"
                                    />
                                  ) : (
                                    <Building2 className="h-8 w-8 text-gray-400" />
                                  )}
                                  <div>
                                    <p className="text-white font-medium text-sm">
                                      {deal.fakeCompany.realCompany.name}
                                    </p>
                                    <p className="text-gray-400 text-xs">
                                      {new Date(deal.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={`${getStatusColor(deal.status)} text-white text-xs`}>
                                    {getStatusIcon(deal.status)}
                                    <span className="ml-1">{deal.status}</span>
                                  </Badge>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                                        onClick={() => {
                                          setDealUpdate({
                                            dealId: deal.id,
                                            status: deal.status,
                                            adminNotes: deal.adminNotes || "",
                                          });
                                        }}
                                      >
                                        Update
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-gray-800 border-gray-700">
                                      <DialogHeader>
                                        <DialogTitle className="text-white">Update Deal</DialogTitle>
                                        <DialogDescription className="text-gray-400">
                                          Update deal status and add admin notes
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label htmlFor="deal-status" className="text-gray-300">Deal Status</Label>
                                          <Select
                                            value={dealUpdate.status}
                                            onValueChange={(value) => setDealUpdate({ ...dealUpdate, status: value })}
                                          >
                                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-gray-700 border-gray-600">
                                              <SelectItem value="pending">Pending</SelectItem>
                                              <SelectItem value="approved">Approved</SelectItem>
                                              <SelectItem value="rejected">Rejected</SelectItem>
                                              <SelectItem value="completed">Completed</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label htmlFor="admin-notes" className="text-gray-300">Admin Notes</Label>
                                          <Textarea
                                            id="admin-notes"
                                            value={dealUpdate.adminNotes}
                                            onChange={(e) => setDealUpdate({ ...dealUpdate, adminNotes: e.target.value })}
                                            placeholder="Add notes for the broker..."
                                            className="bg-gray-700 border-gray-600 text-white"
                                            rows={3}
                                          />
                                        </div>
                                        <Button
                                          onClick={() => {
                                            updateDealMutation.mutate({
                                              dealId: dealUpdate.dealId,
                                              status: dealUpdate.status,
                                              adminNotes: dealUpdate.adminNotes,
                                            });
                                          }}
                                          className="bg-orange-500 hover:bg-orange-600 text-white w-full"
                                          disabled={updateDealMutation.isPending}
                                        >
                                          {updateDealMutation.isPending ? "Updating..." : "Update Deal"}
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                              onClick={() => {
                                setNewDocument({
                                  ...newDocument,
                                  brokerId: broker.id,
                                });
                              }}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Send Document
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-800 border-gray-700">
                            <DialogHeader>
                              <DialogTitle className="text-white">Send Document to Broker</DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Upload a document for this broker
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="doc-title" className="text-gray-300">Document Title</Label>
                                <Input
                                  id="doc-title"
                                  value={newDocument.title}
                                  onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                                  placeholder="Document title..."
                                  className="bg-gray-700 border-gray-600 text-white"
                                />
                              </div>
                              <div>
                                <Label htmlFor="file-name" className="text-gray-300">File Name</Label>
                                <Input
                                  id="file-name"
                                  value={newDocument.fileName}
                                  onChange={(e) => setNewDocument({ ...newDocument, fileName: e.target.value })}
                                  placeholder="contract.pdf"
                                  className="bg-gray-700 border-gray-600 text-white"
                                />
                              </div>
                              <div>
                                <Label htmlFor="file-url" className="text-gray-300">File URL</Label>
                                <Input
                                  id="file-url"
                                  value={newDocument.fileUrl}
                                  onChange={(e) => setNewDocument({ ...newDocument, fileUrl: e.target.value })}
                                  placeholder="https://example.com/document.pdf"
                                  className="bg-gray-700 border-gray-600 text-white"
                                />
                              </div>
                              <div>
                                <Label htmlFor="file-type" className="text-gray-300">File Type</Label>
                                <Select
                                  value={newDocument.fileType}
                                  onValueChange={(value) => setNewDocument({ ...newDocument, fileType: value })}
                                >
                                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-700 border-gray-600">
                                    <SelectItem value="pdf">PDF</SelectItem>
                                    <SelectItem value="doc">DOC</SelectItem>
                                    <SelectItem value="docx">DOCX</SelectItem>
                                    <SelectItem value="xls">XLS</SelectItem>
                                    <SelectItem value="xlsx">XLSX</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                onClick={() => {
                                  createDocumentMutation.mutate({
                                    ...newDocument,
                                    uploadedByAdmin: 1, // Admin user ID placeholder
                                  });
                                }}
                                className="bg-blue-500 hover:bg-blue-600 text-white w-full"
                                disabled={createDocumentMutation.isPending || !newDocument.fileName || !newDocument.fileUrl}
                              >
                                {createDocumentMutation.isPending ? "Uploading..." : "Send Document"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}