import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PDFTestPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    documentType: 'Maritime Legal Document',
    documentContent: 'This is a test document using your custom template background image. The content will be overlaid on top of your image001.png background template.',
    includeVesselDetails: true,
    includeLogo: true,
    vesselId: '26' // Default test vessel
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateTestPDF = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/vessels/${formData.vesselId}/professional-document-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: formData.documentType,
          documentContent: formData.documentContent,
          includeVesselDetails: formData.includeVesselDetails,
          includeLogo: formData.includeLogo
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `test-pdf-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "PDF Generated Successfully",
          description: "Your test PDF with background template has been downloaded.",
        });
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating the test PDF.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">PDF Template Design Test</h1>
          <p className="text-gray-600">
            Test and preview your custom PDF template with background image. This page allows you to customize 
            the document content and generate test PDFs using your image001.png background template.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                PDF Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type</Label>
                <Input
                  id="documentType"
                  value={formData.documentType}
                  onChange={(e) => handleInputChange('documentType', e.target.value)}
                  placeholder="Enter document type"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vesselId">Test Vessel ID</Label>
                <Input
                  id="vesselId"
                  value={formData.vesselId}
                  onChange={(e) => handleInputChange('vesselId', e.target.value)}
                  placeholder="Enter vessel ID (e.g., 26)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentContent">Document Content</Label>
                <Textarea
                  id="documentContent"
                  value={formData.documentContent}
                  onChange={(e) => handleInputChange('documentContent', e.target.value)}
                  placeholder="Enter document content"
                  rows={6}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeVesselDetails"
                    checked={formData.includeVesselDetails}
                    onCheckedChange={(checked) => handleInputChange('includeVesselDetails', checked as boolean)}
                  />
                  <Label htmlFor="includeVesselDetails">Include Vessel Details</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeLogo"
                    checked={formData.includeLogo}
                    onCheckedChange={(checked) => handleInputChange('includeLogo', checked as boolean)}
                  />
                  <Label htmlFor="includeLogo">Use Background Template</Label>
                </div>
              </div>

              <Button 
                onClick={generateTestPDF} 
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate Test PDF
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Template Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">PDF Template Design</h3>
                  <p className="text-gray-600 mb-4">
                    Using your image001.png as full page background template with content overlay
                  </p>
                  <div className="space-y-2 text-sm text-left">
                    <div className="flex justify-between">
                      <span>Background Image:</span>
                      <span className="text-green-600">✓ image001.png</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Template Assets:</span>
                      <span className="text-green-600">✓ Loaded</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Content Overlay:</span>
                      <span className="text-green-600">✓ Positioned</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PDF Generation:</span>
                      <span className="text-blue-600">Ready</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Template Features:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Full page background using your template image
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Content overlay positioned on background
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Vessel information integration
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Professional document formatting
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">1. Configure</h4>
                <p className="text-gray-600">
                  Customize the document type, content, and options in the configuration panel.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. Generate</h4>
                <p className="text-gray-600">
                  Click "Generate Test PDF" to create a PDF using your background template design.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. Review</h4>
                <p className="text-gray-600">
                  Download and review the PDF to see how your template background looks with content overlay.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}