import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Plus, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Vessel {
  id: number;
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
  built: number | null;
  deadweight: number | null;
  currentLat: string | null;
  currentLng: string | null;
}

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
}

const documentTemplates: DocumentTemplate[] = [
  {
    id: "vessel_certificate",
    name: "Vessel Certificate",
    description: "Official vessel certification document",
    content: `VESSEL CERTIFICATION DOCUMENT

Vessel Name: {VESSEL_NAME}
IMO Number: {VESSEL_IMO}
MMSI: {VESSEL_MMSI}
Vessel Type: {VESSEL_TYPE}
Flag State: {VESSEL_FLAG}
Year Built: {VESSEL_BUILT}
Deadweight: {VESSEL_DEADWEIGHT} MT

CERTIFICATION DETAILS:
This document certifies that the above-mentioned vessel meets all international maritime safety and environmental standards.

Current Position: {VESSEL_POSITION}
Certificate Issue Date: {CURRENT_DATE}
Certificate Valid Until: {VALIDITY_DATE}

PETRODEALHUB MARITIME SERVICES
Official Document Generator`
  },
  {
    id: "cargo_manifest",
    name: "Cargo Manifest",
    description: "Detailed cargo manifest for vessel operations",
    content: `CARGO MANIFEST

Vessel Details:
- Name: {VESSEL_NAME}
- IMO: {VESSEL_IMO}
- Type: {VESSEL_TYPE}
- Flag: {VESSEL_FLAG}
- Built: {VESSEL_BUILT}

Cargo Information:
- Vessel Capacity: {VESSEL_DEADWEIGHT} MT
- Current Position: {VESSEL_POSITION}
- Document Date: {CURRENT_DATE}

CARGO DECLARATION:
This manifest certifies the cargo details for the specified vessel in accordance with international maritime regulations.

Prepared by: PETRODEALHUB Maritime Documentation System`
  },
  {
    id: "safety_inspection",
    name: "Safety Inspection Report",
    description: "Comprehensive safety inspection documentation",
    content: `MARITIME SAFETY INSPECTION REPORT

VESSEL IDENTIFICATION:
Name: {VESSEL_NAME}
IMO Number: {VESSEL_IMO}
MMSI: {VESSEL_MMSI}
Type: {VESSEL_TYPE}
Flag: {VESSEL_FLAG}
Built: {VESSEL_BUILT}

INSPECTION DETAILS:
Inspection Date: {CURRENT_DATE}
Current Location: {VESSEL_POSITION}
Deadweight Tonnage: {VESSEL_DEADWEIGHT} MT

SAFETY COMPLIANCE:
✓ Hull Integrity: Satisfactory
✓ Navigation Equipment: Operational
✓ Safety Equipment: Compliant
✓ Communication Systems: Functional
✓ Emergency Procedures: Up to Date

This vessel has passed all required safety inspections and is certified for maritime operations.

PETRODEALHUB SAFETY CERTIFICATION DEPARTMENT`
  }
];

interface SimpleDocumentCreatorProps {
  vessel: Vessel;
}

export default function SimpleDocumentCreator({ vessel }: SimpleDocumentCreatorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [customContent, setCustomContent] = useState("");
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const { toast } = useToast();

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getValidityDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getVesselPosition = () => {
    if (vessel.currentLat && vessel.currentLng) {
      return `${parseFloat(vessel.currentLat).toFixed(4)}°N, ${parseFloat(vessel.currentLng).toFixed(4)}°E`;
    }
    return "Position Not Available";
  };

  const generateDocument = (template: DocumentTemplate) => {
    let content = template.content;
    
    // Replace all placeholders with vessel data
    content = content.replace(/{VESSEL_NAME}/g, vessel.name || "N/A");
    content = content.replace(/{VESSEL_IMO}/g, vessel.imo || "N/A");
    content = content.replace(/{VESSEL_MMSI}/g, vessel.mmsi || "N/A");
    content = content.replace(/{VESSEL_TYPE}/g, vessel.vesselType || "N/A");
    content = content.replace(/{VESSEL_FLAG}/g, vessel.flag || "N/A");
    content = content.replace(/{VESSEL_BUILT}/g, vessel.built?.toString() || "N/A");
    content = content.replace(/{VESSEL_DEADWEIGHT}/g, vessel.deadweight?.toString() || "N/A");
    content = content.replace(/{VESSEL_POSITION}/g, getVesselPosition());
    content = content.replace(/{CURRENT_DATE}/g, getCurrentDate());
    content = content.replace(/{VALIDITY_DATE}/g, getValidityDate());

    return content;
  };

  const downloadDocument = (template: DocumentTemplate) => {
    const content = generateDocument(template);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${vessel.name}_${template.name.replace(/\s+/g, '_')}_${getCurrentDate().replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Document Downloaded",
      description: `${template.name} has been generated and downloaded successfully.`
    });
  };

  const downloadCustomDocument = () => {
    if (!customTitle || !customContent) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and content for the document.",
        variant: "destructive"
      });
      return;
    }

    const blob = new Blob([customContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${vessel.name}_${customTitle.replace(/\s+/g, '_')}_${getCurrentDate().replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Custom Document Downloaded",
      description: `${customTitle} has been created and downloaded successfully.`
    });

    setCustomTitle("");
    setCustomContent("");
    setShowCustomDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <FileText className="h-8 w-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Document Creator</h2>
        </div>
        <p className="text-gray-600">Create professional maritime documents for {vessel.name}</p>
      </div>

      {/* Quick Templates */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Quick Templates
        </h3>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documentTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  {template.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                <div className="space-y-2">
                  <Dialog open={selectedTemplate?.id === template.id} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{template.name} - Preview</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <pre className="text-sm whitespace-pre-wrap font-mono">
                            {generateDocument(template)}
                          </pre>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                            Close
                          </Button>
                          <Button onClick={() => downloadDocument(template)} className="flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Download Document
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    onClick={() => downloadDocument(template)}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate & Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Document Creator */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-green-600" />
          Create Custom Document
        </h3>
        
        <Card>
          <CardContent className="pt-6">
            <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Custom Document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create Custom Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Document Title</Label>
                    <Input
                      id="title"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="Enter document title..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Document Content</Label>
                    <Textarea
                      id="content"
                      value={customContent}
                      onChange={(e) => setCustomContent(e.target.value)}
                      placeholder="Enter your document content here..."
                      rows={10}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowCustomDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={downloadCustomDocument} className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Create & Download
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}