import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Eye, Palette, Settings, Image, Layout } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Template asset URLs (will be loaded from server)
const exactTemplate = "/attached_assets/BACKGROUD DOCUMENTS PETRODEALHUB_1752789448946.jpg";
const mainLogo = "/attached_assets/image001_1752789059844.png";
const legalLogo = "/attached_assets/image002_1752789059843.png";
const fingerprintIcon = "/attached_assets/image003_1752789059843.png";
const clientCopyStamp = "/attached_assets/image004_1752789059843.png";

export default function PDFTestPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [designMode, setDesignMode] = useState('collaborative'); // 'collaborative' or 'quick'
  const [formData, setFormData] = useState({
    documentType: 'Maritime Legal Document',
    documentContent: 'This is a test document using your custom template background image. The content will be overlaid on top of your image001.png background template.',
    includeVesselDetails: true,
    includeLogo: true,
    vesselId: '26' // Default test vessel
  });
  
  // Design configuration state
  const [designConfig, setDesignConfig] = useState({
    headerLayout: 'split', // 'split', 'center', 'left'
    logoSize: 'large', // 'small', 'medium', 'large'
    contentPosition: 'center', // 'top', 'center', 'bottom'
    watermarkStyle: 'diagonal', // 'diagonal', 'center', 'corner'
    colorScheme: 'professional', // 'professional', 'maritime', 'legal'
    useClientCopyStamp: true,
    useSecurityIcon: true,
    backgroundOverlay: 'subtle' // 'none', 'subtle', 'strong'
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Professional PDF Design Builder</h1>
          <p className="text-gray-600">
            Collaborative design tool to build the perfect professional PDF template using your provided assets.
            Let's work together to create an exceptional document design!
          </p>
        </div>

        {/* Mode Selection */}
        <div className="mb-6">
          <div className="flex gap-4">
            <Button 
              variant={designMode === 'collaborative' ? 'default' : 'outline'}
              onClick={() => setDesignMode('collaborative')}
              className="flex items-center gap-2"
            >
              <Palette className="w-4 h-4" />
              Collaborative Design Builder
            </Button>
            <Button 
              variant={designMode === 'quick' ? 'default' : 'outline'}
              onClick={() => setDesignMode('quick')}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Quick Test
            </Button>
          </div>
        </div>

        {designMode === 'collaborative' ? (
          // Collaborative Design Builder
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Design Configuration */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="layout" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="layout" className="flex items-center gap-2">
                    <Layout className="w-4 h-4" />
                    Layout
                  </TabsTrigger>
                  <TabsTrigger value="assets" className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Assets
                  </TabsTrigger>
                  <TabsTrigger value="styling" className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Styling
                  </TabsTrigger>
                  <TabsTrigger value="content" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Content
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="layout" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Layout Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Header Layout Style</Label>
                        <Select value={designConfig.headerLayout} onValueChange={(value) => setDesignConfig(prev => ({...prev, headerLayout: value}))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="split">Split Header (Legal Document Services | PetroDealHub)</SelectItem>
                            <SelectItem value="center">Centered Layout</SelectItem>
                            <SelectItem value="left">Left Aligned</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Content Position</Label>
                        <Select value={designConfig.contentPosition} onValueChange={(value) => setDesignConfig(prev => ({...prev, contentPosition: value}))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="top">Top Area</SelectItem>
                            <SelectItem value="center">Center Area</SelectItem>
                            <SelectItem value="bottom">Bottom Area</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Logo Size</Label>
                        <Select value={designConfig.logoSize} onValueChange={(value) => setDesignConfig(prev => ({...prev, logoSize: value}))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small (100px)</SelectItem>
                            <SelectItem value="medium">Medium (150px)</SelectItem>
                            <SelectItem value="large">Large (200px)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="assets" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Template Assets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <img src={mainLogo} alt="PetroDealHub Logo" className="w-20 h-20 mx-auto mb-2 object-contain" />
                          <p className="text-sm font-medium">Main Logo</p>
                          <p className="text-xs text-gray-500">PetroDealHub Brand</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <img src={legalLogo} alt="Legal Document Services" className="w-20 h-20 mx-auto mb-2 object-contain" />
                          <p className="text-sm font-medium">Legal Logo</p>
                          <p className="text-xs text-gray-500">Document Services</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <img src={fingerprintIcon} alt="Security Icon" className="w-20 h-20 mx-auto mb-2 object-contain" />
                          <p className="text-sm font-medium">Security Icon</p>
                          <p className="text-xs text-gray-500">Fingerprint</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <img src={clientCopyStamp} alt="Client Copy Stamp" className="w-20 h-20 mx-auto mb-2 object-contain" />
                          <p className="text-sm font-medium">Client Copy</p>
                          <p className="text-xs text-gray-500">Red Stamp</p>
                        </div>
                      </div>
                      
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="useClientCopyStamp"
                            checked={designConfig.useClientCopyStamp}
                            onCheckedChange={(checked) => setDesignConfig(prev => ({...prev, useClientCopyStamp: checked as boolean}))}
                          />
                          <Label htmlFor="useClientCopyStamp">Include CLIENT COPY stamp</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="useSecurityIcon"
                            checked={designConfig.useSecurityIcon}
                            onCheckedChange={(checked) => setDesignConfig(prev => ({...prev, useSecurityIcon: checked as boolean}))}
                          />
                          <Label htmlFor="useSecurityIcon">Include security fingerprint icon</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="styling" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Design Styling</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Color Scheme</Label>
                        <Select value={designConfig.colorScheme} onValueChange={(value) => setDesignConfig(prev => ({...prev, colorScheme: value}))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Professional Blue/Gray</SelectItem>
                            <SelectItem value="maritime">Maritime Blue/Orange</SelectItem>
                            <SelectItem value="legal">Legal Black/White</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Watermark Style</Label>
                        <Select value={designConfig.watermarkStyle} onValueChange={(value) => setDesignConfig(prev => ({...prev, watermarkStyle: value}))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="diagonal">Diagonal CLIENT COPY</SelectItem>
                            <SelectItem value="center">Center Watermark</SelectItem>
                            <SelectItem value="corner">Corner Placement</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Background Overlay</Label>
                        <Select value={designConfig.backgroundOverlay} onValueChange={(value) => setDesignConfig(prev => ({...prev, backgroundOverlay: value}))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Overlay</SelectItem>
                            <SelectItem value="subtle">Subtle White Overlay</SelectItem>
                            <SelectItem value="strong">Strong Overlay for Text</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="content" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Content Configuration</CardTitle>
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
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Live Preview */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white border-2 rounded-lg p-4 min-h-[400px] relative overflow-hidden">
                    {/* Simulated PDF preview */}
                    <div className="relative">
                      {/* Header based on configuration */}
                      {designConfig.headerLayout === 'split' && (
                        <div className="flex justify-between items-center mb-4 text-xs">
                          <div className="flex items-center gap-2">
                            <img src={legalLogo} alt="Legal" className="w-8 h-8" />
                            <span className="font-semibold">LEGAL DOCUMENT SERVICES</span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold">PetroDealHub</span>
                            <div className="text-gray-600">Connecting Tankers, Refineries, and Deals</div>
                          </div>
                        </div>
                      )}

                      {/* Main logo */}
                      <div className="text-center mb-4">
                        <img 
                          src={mainLogo} 
                          alt="PetroDealHub" 
                          className={`mx-auto ${
                            designConfig.logoSize === 'small' ? 'w-16 h-16' :
                            designConfig.logoSize === 'medium' ? 'w-24 h-24' : 'w-32 h-32'
                          }`} 
                        />
                      </div>

                      {/* Document content */}
                      <div className={`text-center ${
                        designConfig.contentPosition === 'top' ? 'mt-2' :
                        designConfig.contentPosition === 'center' ? 'mt-8' : 'mt-16'
                      }`}>
                        <h3 className="font-bold text-sm mb-2">{formData.documentType}</h3>
                        <div className="text-xs text-gray-700 leading-relaxed">
                          {formData.documentContent.substring(0, 100)}...
                        </div>
                      </div>

                      {/* Security icon */}
                      {designConfig.useSecurityIcon && (
                        <div className="absolute bottom-4 left-4">
                          <img src={fingerprintIcon} alt="Security" className="w-6 h-6" />
                        </div>
                      )}

                      {/* Client copy stamp */}
                      {designConfig.useClientCopyStamp && (
                        <div className={`absolute ${
                          designConfig.watermarkStyle === 'diagonal' ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45' :
                          designConfig.watermarkStyle === 'center' ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' :
                          'bottom-4 right-4'
                        } opacity-30`}>
                          <img src={clientCopyStamp} alt="Client Copy" className="w-16 h-16" />
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={generateTestPDF} 
                    disabled={isGenerating}
                    className="w-full mt-4"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Building Your Design...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Generate PDF with Your Design
                      </>
                    )}
                  </Button>

                  <div className="mt-4 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Header Style:</span>
                      <span className="text-blue-600">{designConfig.headerLayout}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Logo Size:</span>
                      <span className="text-blue-600">{designConfig.logoSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Assets Used:</span>
                      <span className="text-green-600">
                        {[designConfig.useClientCopyStamp && 'Stamp', designConfig.useSecurityIcon && 'Security'].filter(Boolean).join(', ') || 'Basic'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Quick Test Mode (original simple interface)
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick PDF Test</CardTitle>
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
                  <Label htmlFor="documentContent">Document Content</Label>
                  <Textarea
                    id="documentContent"
                    value={formData.documentContent}
                    onChange={(e) => handleInputChange('documentContent', e.target.value)}
                    placeholder="Enter document content"
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={generateTestPDF} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? 'Generating...' : 'Quick Test PDF'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Assets Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <img src={mainLogo} alt="Main Logo" className="w-full h-20 object-contain border rounded" />
                  <img src={legalLogo} alt="Legal Logo" className="w-full h-20 object-contain border rounded" />
                  <img src={fingerprintIcon} alt="Security" className="w-full h-20 object-contain border rounded" />
                  <img src={clientCopyStamp} alt="Stamp" className="w-full h-20 object-contain border rounded" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}