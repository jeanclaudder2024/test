import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Clock } from "lucide-react";

interface SimpleDocument {
  id: number;
  title: string;
  description: string;
  content: string;
  status: string;
  createdAt: string;
}

interface SimpleDocumentViewerProps {
  vessel: any;
}

export function SimpleDocumentViewer({ vessel }: SimpleDocumentViewerProps) {
  const [selectedDocument, setSelectedDocument] = useState<SimpleDocument | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  // Sample documents without API dependency
  const sampleDocuments: SimpleDocument[] = [
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
      createdAt: new Date().toISOString()
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
      createdAt: new Date(Date.now() - 86400000).toISOString()
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
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  const handleDownloadPDF = async (document: SimpleDocument) => {
    try {
      setIsDownloading(true);
      
      // Call the enhanced PDF generation endpoint with logo design
      const response = await fetch(`/api/vessels/${vessel.id}/professional-document-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: document.title,
          documentContent: document.content,
          includeVesselDetails: true,
          includeLogo: true
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      // Get the PDF as blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${document.title.replace(/\s+/g, '_')}_${vessel.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Downloaded",
        description: `${document.title} downloaded successfully with company logo`,
      });
    } catch (error) {
      console.error('PDF download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF document",
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
          {sampleDocuments.map((document) => (
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
                    {isDownloading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </>
                    )}
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
      </CardContent>
    </Card>
  );
}