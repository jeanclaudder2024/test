import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Clock, Settings } from "lucide-react";

interface SimpleDocument {
  id: number;
  title: string;
  description: string;
  content: string;
  status: string;
  createdAt: string;
  documentType?: string;
  category?: string;
  source: 'vessel' | 'admin';
}

interface AdminDocument {
  id: number;
  title: string;
  description: string | null;
  content: string;
  documentType: string;
  status: string;
  category: string;
  tags: string | null;
  isTemplate: boolean;
  createdBy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SimpleDocumentViewerProps {
  vessel: any;
}

export function SimpleDocumentViewer({ vessel }: SimpleDocumentViewerProps) {
  const [selectedDocument, setSelectedDocument] = useState<SimpleDocument | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  // Custom fetch function that includes authentication
  const authenticatedFetch = async (url: string) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('401: Unauthorized - Please log in again');
      }
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  // Fetch admin documents with authentication
  const { data: adminDocuments = [], isLoading: adminLoading, error: adminError } = useQuery<AdminDocument[]>({
    queryKey: ["/api/admin/documents"],
    queryFn: () => authenticatedFetch("/api/admin/documents"),
    retry: false,
  });

  // Sample vessel-specific documents
  const vesselDocuments: SimpleDocument[] = [
    {
      id: 1,
      title: "Vessel Inspection Certificate",
      description: "Comprehensive vessel inspection and safety certification documentation",
      content: `VESSEL INSPECTION CERTIFICATE

Vessel Name: ${vessel.name}
IMO Number: ${vessel.imo}
Flag State: ${vessel.flag}

INSPECTION DETAILS:
This document certifies that the above vessel has undergone comprehensive inspection according to international maritime safety standards. All systems have been verified and meet regulatory requirements.

SAFETY SYSTEMS CHECKED:
- Navigation equipment operational
- Fire safety systems functional
- Life-saving appliances inspected
- Cargo handling equipment verified
- Communication systems tested

COMPLIANCE STATUS: APPROVED
Valid until: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}

Issued by: Maritime Safety Authority
Certificate Number: MSA-${vessel.id}-2024`,
      status: "published",
      createdAt: new Date().toISOString(),
      source: 'vessel' as const,
    },
    {
      id: 2,
      title: "Commercial Viability Report",
      description: "Analysis of commercial potential and market conditions for maritime operations",
      content: `COMMERCIAL VIABILITY REPORT

Vessel: ${vessel.name}
Analysis Date: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY:
This report provides a comprehensive analysis of the commercial viability for the specified vessel in current market conditions.

VESSEL SPECIFICATIONS:
- Type: ${vessel.vesselType}
- Deadweight: ${vessel.deadweight || 'N/A'} DWT
- Built: ${vessel.built || 'N/A'}
- Current Status: ${vessel.status}

MARKET ANALYSIS:
Current market conditions show favorable opportunities for oil tanker operations in the specified trade routes. Demand for petroleum products remains strong with stable freight rates.

FINANCIAL PROJECTIONS:
- Estimated daily operating costs: $12,000 - $15,000
- Average charter rates: $18,000 - $25,000 per day
- Projected annual utilization: 85%

RECOMMENDATIONS:
The vessel demonstrates strong commercial potential with current market conditions supporting profitable operations.`,
      status: "published",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      source: 'vessel' as const,
    },
    {
      id: 3,
      title: "Technical Specifications Report",
      description: "Detailed technical specifications and operational capabilities",
      content: `TECHNICAL SPECIFICATIONS REPORT

Vessel Name: ${vessel.name}
Report Generated: ${new Date().toLocaleDateString()}

GENERAL SPECIFICATIONS:
- Length Overall: ${vessel.length || 'Not specified'}
- Beam: ${vessel.width || 'Not specified'}
- Depth: Available on request
- Gross Tonnage: ${vessel.grossTonnage || 'Not specified'}

ENGINE SPECIFICATIONS:
- Main Engine: Details available upon inspection
- Auxiliary Engines: Standard maritime configuration
- Fuel Consumption: Optimized for efficiency

CARGO SYSTEMS:
- Cargo Capacity: ${vessel.cargoCapacity || 'Not specified'} cubic meters
- Pumping Systems: High-capacity cargo pumps
- Tank Configuration: Segregated ballast tanks

NAVIGATION & COMMUNICATION:
- GPS Navigation System
- Radar Systems (X-band and S-band)
- VHF/UHF Radio Equipment
- Satellite Communication Systems

CERTIFICATION STATUS:
All technical systems meet international maritime standards and regulatory requirements.`,
      status: "published",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      source: 'vessel' as const,
    }
  ];

  // Convert admin documents to SimpleDocument format and combine with vessel documents
  const adminDocsConverted: SimpleDocument[] = adminError ? [] : adminDocuments.map(doc => ({
    id: doc.id + 1000, // Offset to avoid ID conflicts
    title: doc.title,
    description: doc.description || '',
    content: doc.content,
    status: doc.status,
    createdAt: typeof doc.createdAt === 'string' ? doc.createdAt : new Date(doc.createdAt).toISOString(),
    documentType: doc.documentType,
    category: doc.category,
    source: 'admin' as const,
  }));

  // Combine all documents
  const allDocuments = [...vesselDocuments, ...adminDocsConverted];

  // Show admin documents error if it exists
  if (adminError) {
    console.warn('Admin documents could not be loaded:', adminError.message);
  }

  const handleDownloadWord = async (doc: SimpleDocument) => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/vessels/${vessel.id}/professional-document-word`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: doc.title,
          documentContent: doc.content,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate Word document');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const filename = `${doc.title.replace(/\s+/g, '_')}_${vessel.name.replace(/\s+/g, '_')}.docx`;
      
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Word Document Downloaded",
        description: `${doc.title} downloaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate Word document",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPDF = async (doc: SimpleDocument) => {
    try {
      setIsDownloading(true);
      
      // Call the enhanced PDF generation endpoint with logo design
      const response = await fetch(`/api/vessels/${vessel.id}/professional-document-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: doc.title,
          documentContent: doc.content,
          includeVesselDetails: true,
          includeLogo: true
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate PDF: ${errorText}`);
      }
      
      // Ensure we get the response as a blob
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error('Server did not return a PDF file');
      }
      
      // Get the PDF as blob and download
      const blob = await response.blob();
      
      // Verify blob has content
      if (blob.size === 0) {
        throw new Error('PDF file is empty');
      }
      
      // Use a more reliable download approach
      const url = window.URL.createObjectURL(blob);
      const filename = `${doc.title.replace(/\s+/g, '_')}_${vessel.name.replace(/\s+/g, '_')}.pdf`;
      
      // Try modern download approach first
      if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
        // IE fallback
        (window.navigator as any).msSaveOrOpenBlob(blob, filename);
      } else {
        // Create and trigger download link
        const downloadLink = document.createElement('a');
        downloadLink.style.display = 'none';
        downloadLink.href = url;
        downloadLink.download = filename;
        downloadLink.target = '_blank';
        
        // Append to body, click, and remove
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Clean up immediately
        document.body.removeChild(downloadLink);
      }
      
      // Clean up URL after short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
      
      toast({
        title: "PDF Downloaded",
        description: `${doc.title} downloaded successfully with your custom template design`,
      });
    } catch (error) {
      console.error('PDF download error:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to generate PDF document",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant="secondary" className="text-green-700 bg-green-100">
        Published
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Professional Documents
        </CardTitle>
        <CardDescription>
          Professional maritime documents for {vessel.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allDocuments.map((document) => (
            <Card key={document.id} className="border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{document.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {document.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {document.source === 'admin' && (
                      <Badge variant="outline" className="text-purple-700 bg-purple-50 border-purple-200">
                        <Settings className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                    {document.source === 'vessel' && (
                      <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">
                        <FileText className="h-3 w-3 mr-1" />
                        Vessel
                      </Badge>
                    )}
                    {getStatusBadge(document.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Created: {formatDate(document.createdAt)}
                  </div>
                </div>

                <div className="flex gap-2">
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
                    onClick={() => handleDownloadPDF(document)}
                    disabled={isDownloading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadWord(document)}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Download Word
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedDocument && (
          <div className="mt-8 p-6 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedDocument.title}</h3>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-muted-foreground">
                  Created: {formatDate(selectedDocument.createdAt)}
                </span>
                {getStatusBadge(selectedDocument.status)}
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDocument(null)}
              >
                Close Details
              </Button>
            </div>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-white p-4 rounded border">
                {selectedDocument.content}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}