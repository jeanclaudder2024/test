import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronLeft,
  FileText,
  Download,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  PlusCircle,
  Calendar,
  Ship,
  Flag,
  FileOutput,
  FileCheck,
  Search,
  Filter,
  Printer,
  Copy,
  Pencil,
  Globe,
  Users,
  History,
  BarChart4,
  Tags,
  Shield,
  BookOpen,
  FileSpreadsheet,
  FileCog,
  Anchor,
  Settings,
  Plus,
  CheckCheck,
  Eye,
  EyeOff,
  MoreHorizontal,
  RefreshCw,
  Building
} from "lucide-react";

// Define Document interface
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
  
  // Extract vessel id from URL
  const vesselId = location.split("/")[2];
  
  // State management
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedDocumentId, setGeneratedDocumentId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [documentFilter, setDocumentFilter] = useState('all');
  
  // Advanced document generation options
  const [advancedOptions, setAdvancedOptions] = useState({
    language: "English",
    format: "Professional",
    includeDetails: true,
    includeAttachments: true,
    includeTechnicalSpecs: true,
    includeCargoDetails: true,
    includeVoyageHistory: true,
    includeRegulationCompliance: true,
    recipientName: "",
    recipientOrg: "",
    issuerName: ""
  });

  // Handle option changes
  const handleAdvancedOptionChange = (option: string, value: string | boolean) => {
    setAdvancedOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };
  
  // Fetch vessel details
  const { 
    data: vessel, 
    isLoading: isLoadingVessel 
  } = useQuery({
    queryKey: ["/api/vessels", vesselId],
    enabled: !!vesselId
  });
  
  // Fetch vessel documents
  const { 
    data: documentsResponse, 
    isLoading: isLoadingDocuments,
    refetch: refetchDocuments
  } = useQuery({
    queryKey: ['/api/documents', { vessel: vesselId }],
    queryFn: () => fetch(`/api/documents?vessel=${vesselId}`).then(res => res.json()),
    enabled: !!vesselId
  });

  // Extract documents from response
  const documents = documentsResponse?.data || [];
  
  // Type the vessel properly to avoid type errors
  const typedVessel = vessel as any;
  
  // Generate document mutation
  const generateDocument = useMutation({
    mutationFn: async (formData: any) => {
      return apiRequest(`/api/vessels/${vesselId}/generate-document`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
    },
    onSuccess: (data) => {
      if (data && data.documentId) {
        setGeneratedDocumentId(data.documentId);
        
        // Invalidate documents query to refresh list
        queryClient.invalidateQueries({ queryKey: ['/api/documents', { vessel: vesselId }] });
        
        // Show success toast
        toast({
          title: "Document Generated",
          description: "Your document has been successfully created.",
          variant: "default",
        });
        
        // Close dialog and set loading to false
        setGenerating(false);
        setOpenGenerateDialog(false);
        
        // Refetch documents
        refetchDocuments().then(() => {
          // Find the newly generated document and set it as active
          if (documents && Array.isArray(documents)) {
            const newDoc = documents.find(doc => doc.id === data.documentId);
            if (newDoc) {
              setActiveDocument(newDoc);
            }
          }
        });
      }
    },
    onError: (error: any) => {
      setGenerating(false);
      toast({
        title: "Generation Failed",
        description: error.message || "There was an error generating the document.",
        variant: "destructive",
      });
    }
  });
  
  // Handle document generation form submission
  const handleGenerateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocType) {
      toast({
        title: "Missing Information",
        description: "Please select a document type.",
        variant: "destructive",
      });
      return;
    }
    
    setGenerating(true);
    
    const formData = {
      documentType: selectedDocType,
      ...advancedOptions
    };
    
    generateDocument.mutate(formData);
  };
  
  // Function to get status color for badges
  const getStatusColor = (status: string | undefined) => {
    if (!status) return '';
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-500/10 text-green-500 border-green-200/50';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-200/50';
      case 'draft':
        return 'bg-blue-500/10 text-blue-500 border-blue-200/50';
      case 'rejected':
        return 'bg-red-500/10 text-red-500 border-red-200/50';
      case 'expired':
        return 'bg-gray-500/10 text-gray-500 border-gray-200/50';
      default:
        return 'bg-muted/50';
    }
  };
  
  // Document type information mapped by type with more detailed descriptions
  const documentInfo: {[key: string]: {icon: React.ReactNode, description: string, category: string}} = {
    "Bill of Lading": {
      icon: <FileCheck className="h-4 w-4 mr-2" />,
      description: "Legal receipt for cargo shipment and title document that serves as evidence of the contract of carriage",
      category: "shipping"
    },
    "Certificate of Origin": {
      icon: <Globe className="h-4 w-4 mr-2" />,
      description: "Document certifying that goods in a shipment were obtained, produced, or manufactured in a particular country",
      category: "compliance"
    },
    "Inspection Report": {
      icon: <CheckCircle className="h-4 w-4 mr-2" />,
      description: "Comprehensive vessel inspection document detailing condition, compliance, and maintenance requirements",
      category: "compliance"
    },
    "Charter Party": {
      icon: <FileText className="h-4 w-4 mr-2" />,
      description: "Contract between a vessel owner and charterer for the hire of a vessel with detailed terms and conditions",
      category: "legal"
    },
    "Cargo Manifest": {
      icon: <FileSpreadsheet className="h-4 w-4 mr-2" />,
      description: "Detailed inventory of all cargo aboard including specifications, quantities, and handling requirements",
      category: "shipping"
    },
    "Letter of Indemnity": {
      icon: <Shield className="h-4 w-4 mr-2" />,
      description: "Document protecting the carrier from liability when delivering cargo without proper documentation",
      category: "legal"
    },
    "Sea Waybill": {
      icon: <FileOutput className="h-4 w-4 mr-2" />,
      description: "Non-negotiable transport document serving as evidence of receipt of goods and the contract of carriage",
      category: "shipping"
    },
    "Voyage Report": {
      icon: <Ship className="h-4 w-4 mr-2" />,
      description: "Comprehensive summary of voyage details including navigation, weather conditions, and performance metrics",
      category: "shipping"
    },
    "Safety Compliance": {
      icon: <Shield className="h-4 w-4 mr-2" />,
      description: "Document certifying compliance with international safety standards and regulations",
      category: "compliance"
    },
    "Technical Specification": {
      icon: <FileCog className="h-4 w-4 mr-2" />,
      description: "Detailed technical information about vessel's systems, capabilities, and operational parameters",
      category: "technical"
    },
    "Cargo Quality Report": {
      icon: <BarChart4 className="h-4 w-4 mr-2" />,
      description: "Analysis of cargo quality parameters, composition, and compliance with industry standards",
      category: "shipping"
    },
    "Ullage Report": {
      icon: <FileSpreadsheet className="h-4 w-4 mr-2" />,
      description: "Measurement of empty space in cargo tanks with detailed volume calculations and quality parameters",
      category: "shipping"
    },
    "Voyage Instructions": {
      icon: <BookOpen className="h-4 w-4 mr-2" />,
      description: "Comprehensive instructions for vessel routing, port calls, cargo operations, and special procedures",
      category: "shipping"
    }
  };
  
  // Define available document types
  const documentTypes = Object.keys(documentInfo);
  
  // Document rendering function with improved formatting
  const renderDocumentContent = (content: string | undefined) => {
    if (!content) return <p className="text-muted-foreground italic">No content available</p>;
    
    // Split content by lines
    return content.split('\n').map((line, index) => {
      // Check for headers (lines in all caps with colons)
      if (/^[A-Z\s]+:/.test(line)) {
        return (
          <p key={index} className="font-bold text-primary mt-3 mb-1">
            {line}
          </p>
        );
      }
      
      // Check for tables (lines with multiple spaces or tabs)
      if (line.includes('\t') || /\s{3,}/.test(line)) {
        return (
          <p key={index} className="font-mono text-xs my-1">
            {line}
          </p>
        );
      }
      
      // Regular content
      return (
        <p key={index} className="my-1">
          {line.trim()}
        </p>
      );
    });
  };
  
  // Format date helper
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'N/A';
    }
  };
  
  // Loading state
  if (isLoadingVessel || isLoadingDocuments) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  // Vessel not found state
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
            >
              <Link href={`/vessels/${vesselId}`}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Vessel
              </Link>
            </Button>
            
            <div className="flex gap-1">
              <Badge variant="outline" className="bg-primary/5 text-primary">
                <Ship className="mr-1 h-3 w-3" />
                {typedVessel?.vesselType || 'Vessel'}
              </Badge>
              
              <Badge variant="outline" className="bg-primary/5">
                <Flag className="mr-1 h-3 w-3" />
                {typedVessel?.flag || 'Unknown Flag'}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Ship className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {typedVessel?.name || ''} Documents
              </h1>
              <p className="text-muted-foreground mt-1">
                IMO: <span className="font-mono">{typedVessel?.imo || ''}</span> • 
                MMSI: <span className="font-mono">{typedVessel?.mmsi || ''}</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2 mt-4 md:mt-0">
          <Dialog open={openGenerateDialog} onOpenChange={setOpenGenerateDialog}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <FileOutput className="mr-2 h-4 w-4" />
                Create Professional Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Advanced Document</DialogTitle>
                <DialogDescription>
                  Create professional maritime documents with AI-powered content generation.
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Options</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 py-4">
                  <div className="grid gap-6">
                    <div>
                      <Label htmlFor="docType" className="text-sm font-medium mb-2 block">
                        Document Type
                      </Label>
                      <Select
                        value={selectedDocType}
                        onValueChange={setSelectedDocType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              <div className="flex items-center">
                                {documentInfo[type]?.icon}
                                {type}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {selectedDocType && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {documentInfo[selectedDocType]?.description}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="format" className="text-sm font-medium mb-2 block">
                        Document Format
                      </Label>
                      <Select
                        value={advancedOptions.format}
                        onValueChange={(value) => handleAdvancedOptionChange('format', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard">Standard Format</SelectItem>
                          <SelectItem value="Professional">Professional Format</SelectItem>
                          <SelectItem value="Comprehensive">Comprehensive Format</SelectItem>
                          <SelectItem value="Technical">Technical Specification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="language" className="text-sm font-medium mb-2 block">
                        Document Language
                      </Label>
                      <Select
                        value={advancedOptions.language}
                        onValueChange={(value) => handleAdvancedOptionChange('language', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="Arabic">Arabic</SelectItem>
                          <SelectItem value="Chinese">Chinese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4 py-4">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <Checkbox 
                            id="includeDetails"
                            checked={advancedOptions.includeDetails}
                            onCheckedChange={(checked) => 
                              handleAdvancedOptionChange('includeDetails', Boolean(checked))
                            }
                          />
                          <div className="grid gap-1.5">
                            <Label
                              htmlFor="includeDetails"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Include Vessel Details
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Add comprehensive vessel specifications
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <Checkbox 
                            id="includeAttachments"
                            checked={advancedOptions.includeAttachments}
                            onCheckedChange={(checked) => 
                              handleAdvancedOptionChange('includeAttachments', Boolean(checked))
                            }
                          />
                          <div className="grid gap-1.5">
                            <Label
                              htmlFor="includeAttachments"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Include Attachments
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Generate reference to supporting documents
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <Checkbox 
                            id="includeTechnicalSpecs"
                            checked={advancedOptions.includeTechnicalSpecs}
                            onCheckedChange={(checked) => 
                              handleAdvancedOptionChange('includeTechnicalSpecs', Boolean(checked))
                            }
                          />
                          <div className="grid gap-1.5">
                            <Label
                              htmlFor="includeTechnicalSpecs"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Include Technical Specifications
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Add detailed technical parameters and capabilities
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <Checkbox 
                            id="includeCargoDetails"
                            checked={advancedOptions.includeCargoDetails}
                            onCheckedChange={(checked) => 
                              handleAdvancedOptionChange('includeCargoDetails', Boolean(checked))
                            }
                          />
                          <div className="grid gap-1.5">
                            <Label
                              htmlFor="includeCargoDetails"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Include Cargo Details
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Add comprehensive cargo information
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <Checkbox 
                            id="includeVoyageHistory"
                            checked={advancedOptions.includeVoyageHistory}
                            onCheckedChange={(checked) => 
                              handleAdvancedOptionChange('includeVoyageHistory', Boolean(checked))
                            }
                          />
                          <div className="grid gap-1.5">
                            <Label
                              htmlFor="includeVoyageHistory"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Include Voyage History
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Add detailed voyage timeline and history
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <Checkbox 
                            id="includeRegulationCompliance"
                            checked={advancedOptions.includeRegulationCompliance}
                            onCheckedChange={(checked) => 
                              handleAdvancedOptionChange('includeRegulationCompliance', Boolean(checked))
                            }
                          />
                          <div className="grid gap-1.5">
                            <Label
                              htmlFor="includeRegulationCompliance"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Include Regulatory Information
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Add compliance with international regulations
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div>
                      <Label htmlFor="recipientName" className="text-sm font-medium mb-2 block">
                        Recipient Name
                      </Label>
                      <Input
                        id="recipientName"
                        value={advancedOptions.recipientName}
                        onChange={(e) => handleAdvancedOptionChange('recipientName', e.target.value)}
                        placeholder="Enter recipient name (optional)"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="recipientOrg" className="text-sm font-medium mb-2 block">
                        Recipient Organization
                      </Label>
                      <Input
                        id="recipientOrg"
                        value={advancedOptions.recipientOrg}
                        onChange={(e) => handleAdvancedOptionChange('recipientOrg', e.target.value)}
                        placeholder="Enter recipient organization (optional)"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="issuerName" className="text-sm font-medium mb-2 block">
                        Issuer / Authority
                      </Label>
                      <Input
                        id="issuerName"
                        value={advancedOptions.issuerName}
                        onChange={(e) => handleAdvancedOptionChange('issuerName', e.target.value)}
                        placeholder="Enter issuer name (optional)"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setOpenGenerateDialog(false)}
                  disabled={generating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleGenerateDocument}
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileOutput className="mr-2 h-4 w-4" />
                      Generate Document
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Document Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Document List with Filtering */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  <CardTitle>Document Library</CardTitle>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {documents && Array.isArray(documents) ? documents.length : 0}
                </Badge>
              </div>
              
              <div className="relative">
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-8"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <Button 
                  variant={documentFilter === 'all' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setDocumentFilter('all')}
                  className="text-xs px-3 h-7"
                >
                  All
                </Button>
                <Button 
                  variant={documentFilter === 'shipping' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setDocumentFilter('shipping')}
                  className="text-xs px-3 h-7"
                >
                  Shipping
                </Button>
                <Button 
                  variant={documentFilter === 'compliance' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setDocumentFilter('compliance')}
                  className="text-xs px-3 h-7"
                >
                  Compliance
                </Button>
                <Button 
                  variant={documentFilter === 'legal' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setDocumentFilter('legal')}
                  className="text-xs px-3 h-7"
                >
                  Legal
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {!documents || !Array.isArray(documents) || documents.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-25" />
                  <h3 className="mt-4 text-lg font-semibold">No Documents</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    This vessel doesn't have any documents yet.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => setOpenGenerateDialog(true)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create First Document
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-2">
                    {documents
                      .filter((doc: Document) => {
                        // Filter by search term
                        const matchesSearch = searchTerm === '' || 
                          (doc.title && doc.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (doc.type && doc.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (doc.content && doc.content.toLowerCase().includes(searchTerm.toLowerCase()));
                        
                        // Filter by category
                        const docCategory = doc.type && documentInfo[doc.type]?.category;
                        const matchesCategory = documentFilter === 'all' || docCategory === documentFilter;
                        
                        return matchesSearch && matchesCategory;
                      })
                      .map((doc: Document) => {
                        const docIcon = doc.type && documentInfo[doc.type]?.icon;
                        
                        return (
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
                              <div className="flex items-start gap-2">
                                <div className={`mt-0.5 ${activeDocument?.id === doc.id ? "text-primary-foreground" : "text-primary"}`}>
                                  {docIcon || <FileText className="h-4 w-4" />}
                                </div>
                                <div>
                                  <h4 className="font-medium line-clamp-1">{doc.title || `${doc.type || 'Document'}`}</h4>
                                  <p className="text-xs opacity-80 mt-1">
                                    {doc.reference ? `${doc.reference} • ` : ''}
                                    {formatDate(doc.issueDate || doc.createdAt)}
                                  </p>
                                </div>
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
                        );
                      })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
          
        {/* Enhanced Document Viewer */}
        <div className="lg:col-span-2">
          {activeDocument ? (
            <Card className="h-full">
              <CardHeader className="bg-muted/50 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      {activeDocument.type && documentInfo[activeDocument.type]?.icon}
                      <CardTitle>{activeDocument.title || `${activeDocument.type || 'Document'}`}</CardTitle>
                    </div>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <span>{activeDocument.type || 'Document'}</span>
                      {activeDocument.reference && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="rounded-sm font-mono text-xs">
                                REF: {activeDocument.reference}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Document Reference Number</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {activeDocument.issueDate && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(activeDocument.issueDate)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Issue Date</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`uppercase font-semibold ${getStatusColor(activeDocument.status)}`}
                    >
                      {activeDocument.status || 'draft'}
                    </Badge>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Print Document</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download Document</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardHeader>
              
              <Tabs defaultValue="content" className="w-full">
                <div className="px-4 pt-2">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="content">Document Content</TabsTrigger>
                    <TabsTrigger value="details">Document Details</TabsTrigger>
                    <TabsTrigger value="history">History & Metadata</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="content" className="mt-0">
                  <CardContent className="pt-6 pb-4 px-6">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="font-mono bg-muted p-6 rounded-md whitespace-pre-line text-sm">
                        {renderDocumentContent(activeDocument?.content)}
                      </div>
                    </div>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="details" className="mt-0">
                  <CardContent className="pt-6 pb-4 px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-primary flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          Document Type
                        </h4>
                        <p className="text-sm">{activeDocument.type || 'N/A'}</p>
                        {activeDocument.type && documentInfo[activeDocument.type]?.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {documentInfo[activeDocument.type]?.description}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-primary flex items-center">
                          <FileCheck className="h-4 w-4 mr-2" />
                          Reference Number
                        </h4>
                        <p className="text-sm font-mono">{activeDocument.reference || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-primary flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Issue Date
                        </h4>
                        <p className="text-sm">{formatDate(activeDocument.issueDate)}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-primary flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Expiry Date
                        </h4>
                        <p className="text-sm">{formatDate(activeDocument.expiryDate)}</p>
                        {activeDocument.expiryDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(activeDocument.expiryDate) < new Date() 
                              ? 'This document has expired'
                              : `Valid for ${Math.ceil((new Date(activeDocument.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} more days`
                            }
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-primary flex items-center">
                          <FileCheck className="h-4 w-4 mr-2" />
                          Issuing Authority
                        </h4>
                        <p className="text-sm">{activeDocument.issuer || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-primary flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Status
                        </h4>
                        <Badge variant="outline" className={`${getStatusColor(activeDocument.status)} capitalize`}>
                          {activeDocument.status || 'N/A'}
                        </Badge>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-primary flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Recipient
                        </h4>
                        <p className="text-sm">
                          {activeDocument.recipientName ? (
                            <>
                              {activeDocument.recipientName}
                              {activeDocument.recipientOrg ? ` (${activeDocument.recipientOrg})` : ''}
                            </>
                          ) : (
                            'N/A'
                          )}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-primary flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          Language
                        </h4>
                        <p className="text-sm">{activeDocument.language || 'English'}</p>
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-3 text-primary flex items-center">
                        <Ship className="h-4 w-4 mr-2" />
                        Related Vessel Information
                      </h4>
                      <div className="bg-muted rounded-md p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Vessel Name</p>
                            <p className="text-sm font-medium">{vessel?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">IMO Number</p>
                            <p className="text-sm font-medium">{vessel?.imo || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Flag</p>
                            <p className="text-sm font-medium">{vessel?.flag || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="history" className="mt-0">
                  <CardContent className="pt-6 pb-4 px-6">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-3 text-primary flex items-center">
                          <History className="h-4 w-4 mr-2" />
                          Document History
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="bg-primary/10 text-primary rounded-full p-1.5">
                              <Plus className="h-3 w-3" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Document Created</p>
                              <p className="text-xs text-muted-foreground">
                                {activeDocument.createdAt ? new Date(activeDocument.createdAt).toLocaleString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                          
                          {activeDocument.lastModified && (
                            <div className="flex items-start gap-3">
                              <div className="bg-amber-500/10 text-amber-500 rounded-full p-1.5">
                                <Pencil className="h-3 w-3" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Last Modified</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(activeDocument.lastModified).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {activeDocument.issueDate && (
                            <div className="flex items-start gap-3">
                              <div className="bg-green-500/10 text-green-500 rounded-full p-1.5">
                                <CheckCheck className="h-3 w-3" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Issued</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(activeDocument.issueDate).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3 text-primary flex items-center">
                          <Tags className="h-4 w-4 mr-2" />
                          Document Metadata
                        </h4>
                        <div className="bg-muted rounded-md p-4">
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell className="text-xs font-medium">Document ID</TableCell>
                                <TableCell className="text-xs font-mono">{activeDocument.id}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="text-xs font-medium">Associated Vessel ID</TableCell>
                                <TableCell className="text-xs font-mono">{activeDocument.vesselId}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="text-xs font-medium">Format</TableCell>
                                <TableCell className="text-xs">TEXT</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="text-xs font-medium">Content Length</TableCell>
                                <TableCell className="text-xs">{activeDocument.content?.length || 0} characters</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </TabsContent>
              </Tabs>
              
              <CardFooter className="bg-muted/50 px-6 py-4 flex justify-between border-t">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="default" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export as PDF
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="p-8 text-center">
                <FileText className="mx-auto h-16 w-16 text-muted-foreground opacity-25" />
                <h3 className="mt-4 text-lg font-semibold">No Document Selected</h3>
                <p className="text-sm text-muted-foreground max-w-md mt-2">
                  Select a document from the list to view its details, or generate a new document using the button above.
                </p>
                <Button 
                  onClick={() => setOpenGenerateDialog(true)}
                  className="mt-6"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Generate New Document
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}