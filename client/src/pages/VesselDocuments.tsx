import React, { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, FileBadge, FileText, Calendar, Tag, Clock, Award, Building, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Document interface from API
interface Document {
  id: number;
  vesselId: number;
  type: string;
  title: string;
  content: string;
  status: string;
  issueDate: string;
  expiryDate: string | null;
  reference: string;
  issuer: string | null;
  recipientName: string | null;
  recipientOrg: string | null;
  language: string;
}

// Vessel interface
interface Vessel {
  id: number;
  name: string;
  imo: string;
  vesselType: string;
}

const VesselDocuments: React.FC = () => {
  const { vesselId } = useParams<{ vesselId: string }>();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Fetch vessel documents
  const { data: vessel, isLoading: vesselLoading } = useQuery<Vessel>({
    queryKey: [`/api/vessels/${vesselId}`],
    enabled: !!vesselId,
  });

  const { data: documents, isLoading: documentsLoading, refetch: refetchDocuments } = useQuery<Document[]>({
    queryKey: [`/api/vessels/${vesselId}/documents`],
    enabled: !!vesselId,
  });
  
  // Function to generate test documents
  const generateDocuments = async () => {
    try {
      const response = await fetch('/api/generate-documents?count=10', {
        method: 'POST',
      });
      
      if (response.ok) {
        // Refetch documents after generation
        refetchDocuments();
      } else {
        console.error('Failed to generate documents:', await response.text());
      }
    } catch (error) {
      console.error('Error generating documents:', error);
    }
  };

  // Loading state
  if (vesselLoading || documentsLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" onClick={() => setLocation(`/vessels/${vesselId}`)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Vessel
            </Button>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <Skeleton className="h-8 w-48" />
          </h1>
          <p className="text-muted-foreground mb-6">
            <Skeleton className="h-4 w-96" />
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-6 w-32" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-6 w-48" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state if vessel not found
  if (!vessel) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" onClick={() => setLocation(`/vessels`)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Vessels
            </Button>
          </div>
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Vessel Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                The vessel with ID {vesselId} could not be found or you don't have access to view it.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => setLocation("/vessels")}>Return to Vessels List</Button>
            </CardFooter>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // Group documents by type for tabs
  const documentTypes = documents && Array.isArray(documents) 
    ? Array.from(new Set(documents.map((doc: Document) => doc.type)))
    : [];

  // Set selected document if none is selected yet
  React.useEffect(() => {
    if (documents && Array.isArray(documents) && documents.length > 0 && !selectedDocument) {
      setSelectedDocument(documents[0]);
    }
  }, [documents, selectedDocument]);

  // Render document status badge with appropriate color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "expired":
        return "bg-red-500";
      case "revoked":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Render document content with proper formatting
  const renderDocumentContent = (content: string) => {
    if (!content) return <p>No content available</p>;
    
    // Split by newlines and create paragraphs
    return content.split("\n").map((line, i) => {
      // Skip empty lines
      if (line.trim() === "") return <br key={i} />;
      
      // Check if line is a header (all caps or starts with # or has : at the end)
      if (line.toUpperCase() === line && line.trim() !== "" && line.length > 3) {
        return <h3 key={i} className="font-bold mt-4 mb-2">{line}</h3>;
      }
      
      // Check if line contains a label (something like "NAME: value")
      if (line.includes(":")) {
        const [label, ...rest] = line.split(":");
        const value = rest.join(":").trim();
        
        if (value) {
          return (
            <div key={i} className="my-2">
              <span className="font-semibold">{label.trim()}:</span> {value}
            </div>
          );
        }
      }
      
      // Regular paragraph
      return <p key={i} className="my-2">{line}</p>;
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => setLocation(`/vessels/${vesselId}`)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Vessel
          </Button>
          
          {/* Only show in development mode */}
          {process.env.NODE_ENV === 'development' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={generateDocuments}
              className="ml-auto"
            >
              Generate Test Documents
            </Button>
          )}
        </div>
        
        <h1 className="text-3xl font-bold mb-2">
          Documents for {vessel?.name || 'Vessel'}
          {vessel?.imo && <span className="text-muted-foreground text-sm ml-2">IMO {vessel.imo}</span>}
        </h1>
        <p className="text-muted-foreground mb-6">
          View and manage all documents related to {vessel?.name || 'this vessel'}
          {vessel?.vesselType && ` (${vessel.vesselType})`}
        </p>
        
        {!documents || !Array.isArray(documents) || documents.length === 0 ? (
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle className="text-center">No Documents Available</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                There are no documents available for this vessel.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => setLocation(`/vessels/${vesselId}`)}>
                Return to Vessel Details
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileBadge className="h-5 w-5 mr-2" />
                    Documents
                  </CardTitle>
                  <CardDescription>
                    {Array.isArray(documents) ? documents.length : 0} document{Array.isArray(documents) && documents.length === 1 ? "" : "s"} available
                  </CardDescription>
                </CardHeader>
                
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="px-6">
                    <TabsList className="w-full mb-4">
                      <TabsTrigger value="all">All</TabsTrigger>
                      {documentTypes.slice(0, 3).map((type) => (
                        <TabsTrigger key={type} value={type}>
                          {type.split(" ")[0]}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                  
                  <TabsContent value="all" className="m-0">
                    <ScrollArea className="h-[400px]">
                      <CardContent className="space-y-2 pt-0">
                        {documents.map((doc: Document) => (
                          <div
                            key={doc.id}
                            onClick={() => setSelectedDocument(doc)}
                            className={`p-3 rounded-md cursor-pointer transition-colors ${
                              selectedDocument?.id === doc.id
                                ? "bg-primary/10 border-l-4 border-primary"
                                : "hover:bg-muted"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium truncate max-w-[200px]">{doc.title}</p>
                                <p className="text-sm text-muted-foreground flex items-center">
                                  <FileText className="h-3 w-3 mr-1" />
                                  {doc.type}
                                </p>
                              </div>
                              <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              Issued: {formatDate(doc.issueDate)}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </ScrollArea>
                  </TabsContent>
                  
                  {documentTypes.map((type) => (
                    <TabsContent key={type} value={type} className="m-0">
                      <ScrollArea className="h-[400px]">
                        <CardContent className="space-y-2 pt-0">
                          {documents
                            .filter((doc: Document) => doc.type === type)
                            .map((doc: Document) => (
                              <div
                                key={doc.id}
                                onClick={() => setSelectedDocument(doc)}
                                className={`p-3 rounded-md cursor-pointer transition-colors ${
                                  selectedDocument?.id === doc.id
                                    ? "bg-primary/10 border-l-4 border-primary"
                                    : "hover:bg-muted"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium truncate max-w-[200px]">{doc.title}</p>
                                    <p className="text-sm text-muted-foreground flex items-center">
                                      <FileText className="h-3 w-3 mr-1" />
                                      {doc.type}
                                    </p>
                                  </div>
                                  <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                                </div>
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Issued: {formatDate(doc.issueDate)}
                                </div>
                              </div>
                            ))}
                        </CardContent>
                      </ScrollArea>
                    </TabsContent>
                  ))}
                </Tabs>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              {selectedDocument ? (
                <Card>
                  <CardHeader className="border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedDocument.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Badge variant="outline" className="mr-2">
                            {selectedDocument.type}
                          </Badge>
                          <Badge className={getStatusColor(selectedDocument.status)}>
                            {selectedDocument.status}
                          </Badge>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Ref: {selectedDocument.reference}</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                        <Calendar className="h-5 w-5 text-primary mb-1" />
                        <p className="text-xs text-muted-foreground">Issue Date</p>
                        <p className="font-medium text-sm">{formatDate(selectedDocument.issueDate)}</p>
                      </div>
                      
                      <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                        <Clock className="h-5 w-5 text-primary mb-1" />
                        <p className="text-xs text-muted-foreground">Expiry Date</p>
                        <p className="font-medium text-sm">
                          {selectedDocument.expiryDate ? formatDate(selectedDocument.expiryDate) : "No Expiry"}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                        <Tag className="h-5 w-5 text-primary mb-1" />
                        <p className="text-xs text-muted-foreground">Language</p>
                        <p className="font-medium text-sm">
                          {selectedDocument.language === "en" ? "English" : selectedDocument.language}
                        </p>
                      </div>
                    </div>
                    
                    {(selectedDocument.issuer || selectedDocument.recipientName || selectedDocument.recipientOrg) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {selectedDocument.issuer && (
                          <div className="flex items-start p-3 bg-muted/50 rounded-lg">
                            <Award className="h-5 w-5 text-primary mr-3 mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Issuing Authority</p>
                              <p className="font-medium">{selectedDocument.issuer}</p>
                            </div>
                          </div>
                        )}
                        
                        {(selectedDocument.recipientName || selectedDocument.recipientOrg) && (
                          <div className="flex items-start p-3 bg-muted/50 rounded-lg">
                            <User className="h-5 w-5 text-primary mr-3 mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Recipient</p>
                              {selectedDocument.recipientName && (
                                <p className="font-medium">{selectedDocument.recipientName}</p>
                              )}
                              {selectedDocument.recipientOrg && (
                                <p className="text-sm text-muted-foreground">
                                  <Building className="h-3 w-3 inline mr-1" />
                                  {selectedDocument.recipientOrg}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">Document Content</h3>
                      <div className="p-4 border rounded-lg bg-muted/30 whitespace-pre-line">
                        {renderDocumentContent(selectedDocument.content)}
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between border-t pt-6">
                    <div className="text-sm text-muted-foreground">
                      {selectedDocument.issueDate && (
                        <>Issued {formatDistanceToNow(new Date(selectedDocument.issueDate))} ago</>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Print
                      </Button>
                      <Button size="sm">Download</Button>
                    </div>
                  </CardFooter>
                </Card>
              ) : (
                <Card className="h-full flex flex-col justify-center items-center p-6">
                  <FileBadge className="h-16 w-16 text-muted-foreground mb-4" />
                  <CardTitle className="text-center mb-2">No Document Selected</CardTitle>
                  <CardDescription className="text-center">
                    Select a document from the list to view its details
                  </CardDescription>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default VesselDocuments;