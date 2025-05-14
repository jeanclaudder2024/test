import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronLeft, FileText, Download, Clock, AlertTriangle, CheckCircle, PlusCircle, Loader2, RefreshCw, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// No need for MainLayout import as it's already provided by App.tsx

// Define Document type interface
interface Document {
  id: number;
  vesselId: number;
  type: string;
  title: string;
  content: string;
  status: string;
  issueDate: string | null;
  expiryDate: string | null;
  reference: string | null;
  issuer: string | null;
  recipientName: string | null;
  recipientOrg: string | null;
  language: string | null;
  createdAt?: string | Date | null;
  lastModified?: string | Date | null;
}

export default function VesselDocuments() {
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Available document types for generation
  const documentTypes = [
    "Bill of Lading",
    "Certificate of Origin",
    "Inspection Report",
    "Customs Declaration", 
    "Letter of Protest",
    "Sea Waybill",
    "Cargo Manifest",
    "Maritime Labour Certificate",
    "Charter Party Agreement"
  ];
  
  // Extract vessel ID from URL
  const vesselId = parseInt(location.split("/")[2]);
  
  // Fetch vessel data
  const { data: vessel, isLoading: isLoadingVessel } = useQuery<any>({
    queryKey: ["/api/vessels", vesselId],
    enabled: !!vesselId,
  });
  
  // Fetch vessel documents
  const { data: documents, isLoading: isLoadingDocuments } = useQuery<any[]>({
    queryKey: ["/api/vessels", vesselId, "documents"],
    enabled: !!vesselId,
  });
  
  // Document generation mutation
  const generateDocumentMutation = useMutation({
    mutationFn: async (documentType: string) => {
      setIsGenerating(true);
      console.log("Generating document:", documentType, "for vessel ID:", vesselId);
      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          vesselId,
          documentType
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate document");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setIsGenerating(false);
      setOpenGenerateDialog(false);
      setSelectedDocType("");
      
      // Show success message
      toast({
        title: "Document Generated",
        description: `Successfully generated ${data.document.type} document.`,
      });
      
      // Refresh documents list
      queryClient.invalidateQueries({ queryKey: ["/api/vessels", vesselId, "documents"] });
    },
    onError: (error) => {
      setIsGenerating(false);
      console.error("Error generating document:", error);
      
      toast({
        title: "Error",
        description: "Failed to generate document. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Set first document as active when documents load
  useEffect(() => {
    if (documents && Array.isArray(documents) && documents.length > 0 && !activeDocument) {
      setActiveDocument(documents[0]);
    }
  }, [documents, activeDocument]);
  
  // Function to get color based on document status
  const getStatusColor = (status: string | undefined | null) => {
    if (!status) {
      return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
    }
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20';
      case 'expired':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      case 'revoked':
        return 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
    }
  };
  
  const renderDocumentContent = (content: string | undefined | null) => {
    // Handle undefined/null content
    if (!content) {
      return <p className="py-1 my-1 text-muted-foreground">No content available</p>;
    }
    
    // Split by newlines and render each line
    return content.split('\n').map((line, index) => {
      // Check if the line is a header (all caps or starts with "#")
      const isHeader = line.trim() === line.trim().toUpperCase() && line.trim().length > 3;
      const isSubHeader = line.trim().startsWith('#') || line.trim().startsWith('**');
      
      // Check if the line is a list item (starts with "-", "•", "*", or "1.", "2.", etc.)
      const isListItem = /^\s*[-•*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line);
      
      // Apply appropriate styling
      let className = 'py-1 my-1 break-words';
      
      if (isHeader) {
        className += ' font-bold text-lg mt-4';
      } else if (isSubHeader) {
        className += ' font-semibold mt-3';
      } else if (isListItem) {
        className += ' pl-4';
      } else if (line.trim() === '') {
        className += ' h-4'; // Empty line height
      }
      
      // Return formatted paragraph
      return (
        <p key={index} className={className}>
          {line.trim()}
        </p>
      );
    });
  };
  
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return 'N/A';
    }
  };
  
  if (isLoadingVessel || isLoadingDocuments) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!vessel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h2 className="text-2xl font-bold mb-4">Vessel Not Found</h2>
        <p className="text-muted-foreground mb-8">
          We couldn't find the vessel you're looking for.
        </p>
        <Button asChild>
          <Link href="/vessels">Back to Vessels</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-4"
            asChild
          >
            <Link href={`/vessels/${vesselId}`}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Vessel
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {vessel && typeof vessel === 'object' ? vessel.name : ''} Documents
          </h1>
          <p className="text-muted-foreground mt-1">
            IMO: {vessel && typeof vessel === 'object' ? vessel.imo : ''} • 
            Type: {vessel && typeof vessel === 'object' ? vessel.vesselType : ''}
          </p>
          </div>
          
        <Dialog open={openGenerateDialog} onOpenChange={setOpenGenerateDialog}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0">
              <PlusCircle className="mr-2 h-4 w-4" />
              Generate Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Generate New Document</DialogTitle>
              <DialogDescription>
                Create a new vessel document using AI. Select the document type you need.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="docType" className="text-right text-sm font-medium col-span-1">
                  Document Type
                </label>
                <Select
                  value={selectedDocType}
                  onValueChange={setSelectedDocType}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpenGenerateDialog(false)}
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button
                onClick={() => generateDocumentMutation.mutate(selectedDocType)}
                disabled={!selectedDocType || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Document List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Document List
              </CardTitle>
              <CardDescription>
                {documents && Array.isArray(documents) ? documents.length : 0} documents found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!documents || !Array.isArray(documents) || documents.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-25" />
                  <h3 className="mt-4 text-lg font-semibold">No Documents</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    This vessel doesn't have any documents yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc: Document) => (
                    <div
                      key={doc.id}
                      className={`p-3 rounded-md cursor-pointer transition-all ${
                        activeDocument?.id === doc.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setActiveDocument(doc)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium line-clamp-1">{doc.title || `${doc.type || 'Document'}`}</h4>
                          <p className="text-xs opacity-80 mt-1">
                            {doc.type || 'Document'} • {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : (doc.issueDate ? new Date(doc.issueDate).toLocaleDateString() : 'N/A')}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`ml-2 uppercase text-xs ${
                            activeDocument?.id === doc.id 
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : getStatusColor(doc.status)
                          }`}
                        >
                          {doc.status || 'draft'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Document Viewer */}
          <div className="lg:col-span-2">
            {activeDocument ? (
              <Card className="h-full">
                <CardHeader className="bg-muted/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{activeDocument.title || `${activeDocument.type || 'Document'}`}</CardTitle>
                      <CardDescription className="mt-1">
                        {activeDocument.type || 'Document'} 
                        {activeDocument.reference ? ` • Ref: ${activeDocument.reference}` : ''}
                      </CardDescription>
                    </div>
                    
                    <Badge 
                      variant="outline" 
                      className={`ml-2 uppercase ${getStatusColor(activeDocument.status)}`}
                    >
                      {activeDocument.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <Tabs defaultValue="content" className="w-full">
                  <div className="px-4 pt-2">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="content">Document Content</TabsTrigger>
                      <TabsTrigger value="details">Document Details</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="content" className="mt-0">
                    <CardContent className="pt-6 pb-4 px-6">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="font-mono bg-muted p-4 rounded-md whitespace-pre-line text-sm">
                          {renderDocumentContent(activeDocument?.content)}
                        </div>
                      </div>
                    </CardContent>
                  </TabsContent>
                  
                  <TabsContent value="details" className="mt-0">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Issue Date</h4>
                            <p className="text-sm font-medium flex items-center mt-1">
                              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                              {activeDocument.createdAt ? new Date(activeDocument.createdAt).toLocaleDateString() : 
                               (activeDocument.issueDate ? new Date(activeDocument.issueDate).toLocaleDateString() : 'N/A')}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Expiry Date</h4>
                            <p className="text-sm font-medium flex items-center mt-1">
                              {activeDocument.expiryDate ? (
                                <>
                                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                  {formatDate(activeDocument.expiryDate)}
                                </>
                              ) : (
                                <span className="text-muted-foreground">No expiry date</span>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Issuer</h4>
                          <p className="text-sm mt-1">{activeDocument.issuer}</p>
                        </div>
                        
                        {(activeDocument.recipientName || activeDocument.recipientOrg) && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">Recipient</h4>
                              <p className="text-sm mt-1">
                                {activeDocument.recipientName} 
                                {activeDocument.recipientOrg && ` (${activeDocument.recipientOrg})`}
                              </p>
                            </div>
                          </>
                        )}
                        
                        <Separator />
                        
                        <Accordion type="single" collapsible>
                          <AccordionItem value="status">
                            <AccordionTrigger className="text-sm py-2">
                              Document Status Information
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="p-3 rounded-md bg-muted/50 flex items-start">
                                {activeDocument.status === 'active' && (
                                  <>
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                      <p className="font-medium">This document is active and valid</p>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        The document has been verified and is currently valid for use.
                                      </p>
                                    </div>
                                  </>
                                )}
                                
                                {activeDocument.status === 'pending' && (
                                  <>
                                    <Clock className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                      <p className="font-medium">This document is pending verification</p>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        The document has been submitted but is still awaiting verification.
                                      </p>
                                    </div>
                                  </>
                                )}
                                
                                {activeDocument.status === 'expired' && (
                                  <>
                                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                      <p className="font-medium">This document has expired</p>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        The document is no longer valid as it has passed its expiry date.
                                      </p>
                                    </div>
                                  </>
                                )}
                                
                                {activeDocument.status === 'revoked' && (
                                  <>
                                    <AlertTriangle className="h-5 w-5 text-slate-500 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                      <p className="font-medium">This document has been revoked</p>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        The document has been invalidated by the issuer.
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </CardContent>
                  </TabsContent>
                </Tabs>
                
                <CardFooter className="bg-muted/50 border-t flex justify-between">
                  <div className="text-xs text-muted-foreground">
                    Document ID: {activeDocument.id} • Last updated: {activeDocument.lastModified ? new Date(activeDocument.lastModified).toLocaleDateString() : 
                     (activeDocument.createdAt ? new Date(activeDocument.createdAt).toLocaleDateString() : 
                      (activeDocument.issueDate ? new Date(activeDocument.issueDate).toLocaleDateString() : 'N/A'))}
                  </div>
                  
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="h-full flex flex-col items-center justify-center p-12">
                <FileText className="h-16 w-16 text-muted-foreground/25 mb-6" />
                <h3 className="text-xl font-semibold text-center">No Document Selected</h3>
                <p className="text-muted-foreground text-center mt-2 mb-6 max-w-md">
                  Select a document from the list on the left to view its details here.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
  );
}