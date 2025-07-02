import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Clock, Download, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Document {
  id: number;
  title: string;
  description: string;
  content: string;
  status: 'draft' | 'under_review' | 'approved' | 'published';
  createdAt: string;
  updatedAt: string;
}

export default function AdminDocumentsSimple() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 1,
      title: "Vessel Inspection Certificate Template",
      description: "Standard template for vessel inspection documentation",
      content: `VESSEL INSPECTION CERTIFICATE

This document certifies that the vessel has undergone comprehensive inspection according to international maritime safety standards. All systems have been verified and meet regulatory requirements.

SAFETY SYSTEMS CHECKED:
- Navigation equipment operational
- Fire safety systems functional
- Life-saving appliances inspected
- Cargo handling equipment verified
- Communication systems tested

COMPLIANCE STATUS: APPROVED`,
      status: "published",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      title: "Commercial Viability Report Template",
      description: "Template for analyzing commercial potential and market conditions",
      content: `COMMERCIAL VIABILITY REPORT

EXECUTIVE SUMMARY:
This report provides a comprehensive analysis of the commercial viability for the specified vessel in current market conditions.

MARKET ANALYSIS:
Current market conditions show favorable opportunities for oil tanker operations in the specified trade routes. Demand for petroleum products remains strong with stable freight rates.

FINANCIAL PROJECTIONS:
- Estimated daily operating costs: Variable by vessel size
- Average charter rates: Market dependent
- Projected annual utilization: Target 85%

RECOMMENDATIONS:
The vessel demonstrates strong commercial potential with current market conditions supporting profitable operations.`,
      status: "published",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 3,
      title: "Technical Specifications Report Template",
      description: "Template for detailed technical specifications and capabilities",
      content: `TECHNICAL SPECIFICATIONS REPORT

GENERAL SPECIFICATIONS:
- Length Overall: [To be filled]
- Beam: [To be filled]
- Depth: [To be filled]
- Gross Tonnage: [To be filled]

ENGINE SPECIFICATIONS:
- Main Engine: [Details to be specified]
- Auxiliary Engines: Standard maritime configuration
- Fuel Consumption: Optimized for efficiency

CARGO SYSTEMS:
- Cargo Capacity: [To be specified] cubic meters
- Pumping Systems: High-capacity cargo pumps
- Tank Configuration: Segregated ballast tanks

NAVIGATION & COMMUNICATION:
- GPS Navigation System
- Radar Systems (X-band and S-band)
- VHF/UHF Radio Equipment
- Satellite Communication Systems

CERTIFICATION STATUS:
All technical systems meet international maritime standards and regulatory requirements.`,
      status: "draft",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString()
    }
  ]);

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [documentStatus, setDocumentStatus] = useState<'draft' | 'under_review' | 'approved' | 'published'>('draft');

  const handleCreateDocument = () => {
    if (!documentTitle.trim() || !documentDescription.trim() || !documentContent.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const newDocument: Document = {
      id: Math.max(...documents.map(d => d.id)) + 1,
      title: documentTitle,
      description: documentDescription,
      content: documentContent,
      status: documentStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setDocuments([newDocument, ...documents]);
    setIsCreating(false);
    setDocumentTitle("");
    setDocumentDescription("");
    setDocumentContent("");
    setDocumentStatus('draft');

    toast({
      title: "Success",
      description: "Document created successfully",
    });
  };

  const handleUpdateStatus = (id: number, status: 'draft' | 'under_review' | 'approved' | 'published') => {
    setDocuments(docs => docs.map(doc => 
      doc.id === id 
        ? { ...doc, status, updatedAt: new Date().toISOString() }
        : doc
    ));

    toast({
      title: "Success",
      description: "Document status updated",
    });
  };

  const handleDeleteDocument = (id: number) => {
    setDocuments(docs => docs.filter(doc => doc.id !== id));
    toast({
      title: "Success",
      description: "Document deleted successfully",
    });
  };

  const handleDownload = (document: Document) => {
    const element = window.document.createElement('a');
    const file = new Blob([document.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${document.title.replace(/\s+/g, '_')}.txt`;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);

    toast({
      title: "Download Started",
      description: "Document downloaded successfully",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: "secondary" as const, color: "text-gray-700 bg-gray-100" },
      under_review: { variant: "secondary" as const, color: "text-yellow-700 bg-yellow-100" },
      approved: { variant: "secondary" as const, color: "text-blue-700 bg-blue-100" },
      published: { variant: "secondary" as const, color: "text-green-700 bg-green-100" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {status === 'under_review' ? 'Under Review' : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage professional maritime documents and templates
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Document</DialogTitle>
              <DialogDescription>
                Create a new professional maritime document template
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="document-title">Document Title</Label>
                <Input
                  id="document-title"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="Enter document title..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="document-description">Description</Label>
                <Textarea
                  id="document-description"
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  placeholder="Provide a brief description..."
                  className="mt-1"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="document-content">Content</Label>
                <Textarea
                  id="document-content"
                  value={documentContent}
                  onChange={(e) => setDocumentContent(e.target.value)}
                  placeholder="Enter the document content..."
                  className="mt-1"
                  rows={8}
                />
              </div>
              <div>
                <Label htmlFor="document-status">Status</Label>
                <Select value={documentStatus} onValueChange={(value: any) => setDocumentStatus(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateDocument}>Create Document</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {documents.map((document) => (
          <Card key={document.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="mb-2">{document.title}</CardTitle>
                  <CardDescription>{document.description}</CardDescription>
                </div>
                <div className="flex gap-2 ml-4">
                  {getStatusBadge(document.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Created: {formatDate(document.createdAt)}
                  </div>
                  <div>Updated: {formatDate(document.updatedAt)}</div>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDocument(document)}
                >
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(document)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Select 
                  value={document.status} 
                  onValueChange={(value: any) => handleUpdateStatus(document.id, value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteDocument(document.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <Card className="fixed inset-4 z-50 bg-background border shadow-lg">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedDocument.title}</CardTitle>
                  <CardDescription>
                    {formatDate(selectedDocument.createdAt)} • {getStatusBadge(selectedDocument.status)}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDocument(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[calc(100vh-200px)] overflow-auto">
                <div className="p-6 prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {selectedDocument.content}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}