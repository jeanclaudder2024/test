import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Building2, 
  Calendar, 
  DollarSign,
  Bell,
  Users,
  Package
} from "lucide-react";

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
      website?: string;
      phone?: string;
      email?: string;
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

export default function Brokers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dealNotes, setDealNotes] = useState("");
  const [selectedDealId, setSelectedDealId] = useState<number | null>(null);

  // For development: using brokerId = 1 as placeholder
  const brokerId = 1;

  // Fetch broker deals
  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ["/api/broker-deals", brokerId],
    queryFn: () => apiRequest(`/api/broker-deals?brokerId=${brokerId}`),
  });

  // Fetch broker documents
  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/broker-documents", brokerId],
    queryFn: () => apiRequest(`/api/broker-documents?brokerId=${brokerId}`),
  });

  // Fetch oil market alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/oil-market-alerts", brokerId],
    queryFn: () => apiRequest(`/api/oil-market-alerts?brokerId=${brokerId}`),
  });

  // Update deal notes mutation
  const updateDealMutation = useMutation({
    mutationFn: async ({ dealId, notes }: { dealId: number; notes: string }) => {
      return apiRequest(`/api/broker-deals/${dealId}`, {
        method: "PATCH",
        body: JSON.stringify({ notes }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broker-deals", brokerId] });
      toast({
        title: "Deal Updated",
        description: "Your notes have been saved successfully.",
      });
      setSelectedDealId(null);
      setDealNotes("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update deal notes.",
        variant: "destructive",
      });
    },
  });

  // Mark document as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (documentId: number) => {
      return apiRequest(`/api/broker-documents/${documentId}/mark-read`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broker-documents", brokerId] });
      toast({
        title: "Document Marked as Read",
        description: "The document has been marked as read.",
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

  const getAlertColor = (alertType: string) => {
    switch (alertType.toLowerCase()) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <Bell className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Broker Dashboard</h1>
          <p className="text-gray-300">Manage your deals, documents, and stay updated with market alerts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Deals</p>
                  <p className="text-2xl font-bold text-white">{deals.length}</p>
                </div>
                <Package className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Deals</p>
                  <p className="text-2xl font-bold text-white">
                    {deals.filter((deal: BrokerDeal) => deal.status === "pending" || deal.status === "approved").length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Documents</p>
                  <p className="text-2xl font-bold text-white">{documents.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Unread Documents</p>
                  <p className="text-2xl font-bold text-white">
                    {documents.filter((doc: BrokerDocument) => !doc.isRead).length}
                  </p>
                </div>
                <Bell className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="deals" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="deals" className="text-gray-300 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Package className="h-4 w-4 mr-2" />
              Deals
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-gray-300 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-gray-300 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Market Alerts
            </TabsTrigger>
          </TabsList>

          {/* Deals Tab */}
          <TabsContent value="deals">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Your Deals
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manage all your requested deals with companies
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dealsLoading ? (
                  <div className="text-center py-8 text-gray-400">Loading deals...</div>
                ) : deals.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No deals found. Visit the Companies page to request deals.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {deals.map((deal: BrokerDeal) => (
                      <Card key={deal.id} className="bg-gray-700 border-gray-600">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              {deal.fakeCompany.realCompany.logo ? (
                                <img
                                  src={deal.fakeCompany.realCompany.logo}
                                  alt={deal.fakeCompany.realCompany.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                                  <Building2 className="h-6 w-6 text-white" />
                                </div>
                              )}
                              <div>
                                <h3 className="text-lg font-semibold text-white">
                                  {deal.fakeCompany.realCompany.name}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                  {deal.fakeCompany.realCompany.industry}
                                </p>
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(deal.status)} text-white`}>
                              {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                            </Badge>
                          </div>

                          {deal.dealValue && (
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              <span className="text-gray-300">Deal Value: {deal.dealValue}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 mb-4">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-400 text-sm">
                              Created: {new Date(deal.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {deal.notes && (
                            <div className="mb-4 p-3 bg-gray-600 rounded-lg">
                              <p className="text-gray-300 text-sm"><strong>Your Notes:</strong></p>
                              <p className="text-gray-300">{deal.notes}</p>
                            </div>
                          )}

                          {deal.adminNotes && (
                            <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                              <p className="text-blue-300 text-sm"><strong>Admin Notes:</strong></p>
                              <p className="text-blue-200">{deal.adminNotes}</p>
                            </div>
                          )}

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                                onClick={() => {
                                  setSelectedDealId(deal.id);
                                  setDealNotes(deal.notes || "");
                                }}
                              >
                                Add/Edit Notes
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-800 border-gray-700">
                              <DialogHeader>
                                <DialogTitle className="text-white">Deal Notes</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                  Add or update your notes for this deal
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="deal-notes" className="text-gray-300">Your Notes</Label>
                                  <Textarea
                                    id="deal-notes"
                                    value={dealNotes}
                                    onChange={(e) => setDealNotes(e.target.value)}
                                    placeholder="Add your notes about this deal..."
                                    className="bg-gray-700 border-gray-600 text-white"
                                    rows={4}
                                  />
                                </div>
                                <Button
                                  onClick={() => {
                                    if (selectedDealId) {
                                      updateDealMutation.mutate({
                                        dealId: selectedDealId,
                                        notes: dealNotes,
                                      });
                                    }
                                  }}
                                  className="bg-orange-500 hover:bg-orange-600 text-white"
                                  disabled={updateDealMutation.isPending}
                                >
                                  {updateDealMutation.isPending ? "Saving..." : "Save Notes"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Your Documents
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Documents sent to you by administrators
                </CardDescription>
              </CardHeader>
              <CardContent>
                {documentsLoading ? (
                  <div className="text-center py-8 text-gray-400">Loading documents...</div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No documents available yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((document: BrokerDocument) => (
                      <Card key={document.id} className={`bg-gray-700 border-gray-600 ${!document.isRead ? 'ring-2 ring-orange-500' : ''}`}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                <FileText className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-white">
                                  {document.title || document.fileName}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                  <span>{document.fileType.toUpperCase()}</span>
                                  <span>{formatFileSize(document.fileSize)}</span>
                                  <span>{new Date(document.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!document.isRead && (
                                <Badge className="bg-orange-500 text-white">New</Badge>
                              )}
                              <Button
                                size="sm"
                                className="bg-orange-500 hover:bg-orange-600 text-white"
                                onClick={() => {
                                  // Open document URL
                                  window.open(document.fileUrl, "_blank");
                                  // Mark as read if not already read
                                  if (!document.isRead) {
                                    markAsReadMutation.mutate(document.id);
                                  }
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Oil Market Alerts Tab */}
          <TabsContent value="alerts">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Oil Market Alerts
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Stay updated with the latest oil market trends and alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alertsLoading ? (
                  <div className="text-center py-8 text-gray-400">Loading alerts...</div>
                ) : alerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No active market alerts.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert: OilMarketAlert) => (
                      <Card key={alert.id} className={`${getAlertColor(alert.alertType)} border`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              {getPriorityIcon(alert.priority)}
                              <div>
                                <h3 className="font-semibold text-lg mb-2">{alert.title}</h3>
                                <p className="mb-3">{alert.message}</p>
                                <div className="flex items-center gap-4 text-sm opacity-70">
                                  <span>Priority: {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)}</span>
                                  <span>Created: {new Date(alert.createdAt).toLocaleDateString()}</span>
                                  {alert.expiresAt && (
                                    <span>Expires: {new Date(alert.expiresAt).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="border-current">
                              {alert.alertType.charAt(0).toUpperCase() + alert.alertType.slice(1)}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}