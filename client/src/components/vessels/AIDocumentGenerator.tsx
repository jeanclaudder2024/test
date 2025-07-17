import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Plus, Eye, BookOpen, Clock, Loader2, Lock, ExternalLink, MessageCircle, Ship, FileCheck, Users, Building, Award, Shield } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "wouter";
import type { Vessel } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface DocumentTemplate {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  canGenerate: boolean;
  accessMessage: string;
}

// Category mapping for templates
const getTemplateCategory = (title: string, description: string) => {
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();
  
  if (titleLower.includes('certificate') || titleLower.includes('certification') || descLower.includes('certificate')) {
    return { name: 'Certificates & Compliance', icon: Award, color: 'text-green-600 bg-green-50' };
  }
  if (titleLower.includes('manifest') || titleLower.includes('cargo') || descLower.includes('cargo')) {
    return { name: 'Cargo Documentation', icon: Ship, color: 'text-blue-600 bg-blue-50' };
  }
  if (titleLower.includes('inspection') || titleLower.includes('survey') || descLower.includes('inspection')) {
    return { name: 'Inspections & Surveys', icon: FileCheck, color: 'text-orange-600 bg-orange-50' };
  }
  if (titleLower.includes('crew') || titleLower.includes('manning') || descLower.includes('crew')) {
    return { name: 'Crew & Manning', icon: Users, color: 'text-purple-600 bg-purple-50' };
  }
  if (titleLower.includes('commercial') || titleLower.includes('business') || descLower.includes('commercial')) {
    return { name: 'Commercial Documents', icon: Building, color: 'text-indigo-600 bg-indigo-50' };
  }
  if (titleLower.includes('safety') || titleLower.includes('security') || descLower.includes('safety')) {
    return { name: 'Safety & Security', icon: Shield, color: 'text-red-600 bg-red-50' };
  }
  
  return { name: 'General Documents', icon: FileText, color: 'text-gray-600 bg-gray-50' };
};

interface GeneratedDocument {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  vesselId: number;
  templateId: number;
}

interface AIDocumentGeneratorProps {
  vesselId: number;
  vesselName: string;
}

export default function AIDocumentGenerator({ vesselId, vesselName }: AIDocumentGeneratorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [expandedDocument, setExpandedDocument] = useState<number | null>(null);

  // Fetch available document templates based on user access level
  const { data: templates = [], isLoading: templatesLoading } = useQuery<DocumentTemplate[]>({
    queryKey: ['/api/document-templates'],
    queryFn: async () => {
      const response = await fetch('/api/document-templates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      return response.json();
    },
    staleTime: 0
  });

  // Fetch generated documents for this vessel
  const { data: generatedDocuments = [], isLoading: documentsLoading } = useQuery<GeneratedDocument[]>({
    queryKey: ['/api/generated-documents', vesselId],
    queryFn: async () => {
      const response = await fetch(`/api/generated-documents?vesselId=${vesselId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch generated documents');
      }
      return response.json();
    },
    staleTime: 0
  });

  // Generate document mutation
  const generateDocumentMutation = useMutation({
    mutationFn: async (templateId: number) => {
      const response = await fetch('/api/generate-document', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ 
          templateId,
          vesselId,
          vesselName
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Failed to generate document: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Document Generated Successfully",
        description: "Document has been generated and is ready for download.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/generated-documents', vesselId] });
      setSelectedTemplate(null);
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate document. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Download document function
  const downloadDocument = async (doc: GeneratedDocument, format: 'pdf' | 'docx' = 'pdf') => {
    try {
      const response = await fetch(`/api/download-document/${doc.id}?format=${format}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `${doc.title.replace(/[^a-z0-9]/gi, '_')}.${format}`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `${doc.title} is being downloaded as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download document. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (templatesLoading || documentsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Professional Documentation
          </CardTitle>
          <CardDescription>
            Loading available document templates...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group templates by category
  const categorizedTemplates = templates.reduce((acc, template) => {
    const category = getTemplateCategory(template.title, template.description);
    if (!acc[category.name]) {
      acc[category.name] = { ...category, templates: [] };
    }
    acc[category.name].templates.push(template);
    return acc;
  }, {} as Record<string, { name: string; icon: any; color: string; templates: DocumentTemplate[] }>);

  return (
    <div className="space-y-6">
      {/* Available Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Document Templates
          </CardTitle>
          <CardDescription>
            Get maritime documentation for {vesselName} organized by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No Templates Available</p>
              <p className="text-sm">Contact your administrator to add document templates.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(categorizedTemplates).map(([categoryName, categoryData]) => (
                <div key={categoryName} className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center space-x-3 pb-2 border-b border-gray-200">
                    <div className={`p-2 rounded-lg ${categoryData.color}`}>
                      <categoryData.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{categoryName}</h3>
                      <p className="text-sm text-gray-600">{categoryData.templates.length} template{categoryData.templates.length !== 1 ? 's' : ''} available</p>
                    </div>
                  </div>
                  
                  {/* Templates Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {categoryData.templates.map((template: DocumentTemplate) => (
                      <Card key={template.id} className="border hover:border-primary/50 transition-all duration-200 hover:shadow-lg group">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center justify-between">
                            <span className="truncate pr-2">{template.title}</span>
                      {template.canGenerate ? (
                        <Button
                          size="sm"
                          onClick={() => generateDocumentMutation.mutate(template.id)}
                          disabled={generateDocumentMutation.isPending}
                          className="ml-2"
                        >
                          {generateDocumentMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                          Get
                        </Button>
                      ) : (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="ml-2 bg-orange-200 text-orange-700 cursor-not-allowed hover:bg-orange-300 border border-orange-300"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (template.accessMessage === 'BROKER_ACCESS_REQUIRED') {
                                    toast({
                                      title: "🔒 Broker Verification Required",
                                      description: "Contact us through your broker dashboard for professional verification and template access.",
                                      variant: "destructive",
                                    });
                                  } else if (template.accessMessage === 'UPGRADE_TO_PROFESSIONAL') {
                                    toast({
                                      title: "📈 Professional Plan Required",
                                      description: "Unlock advanced maritime documentation with Professional subscription.",
                                      variant: "destructive",
                                    });
                                  } else if (template.accessMessage === 'UPGRADE_TO_ENTERPRISE') {
                                    toast({
                                      title: "🏢 Enterprise Plan Required", 
                                      description: "Access premium business documentation suite with Enterprise subscription.",
                                      variant: "destructive",
                                    });
                                  } else {
                                    toast({
                                      title: "🔐 Subscription Required",
                                      description: "Upgrade your plan to access professional maritime documentation tools.",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                <Lock className="h-4 w-4" />
                                Locked
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent 
                              className="max-w-sm bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white p-5 rounded-xl shadow-2xl border border-blue-400/30 backdrop-blur-sm" 
                              side="top"
                              sideOffset={8}
                            >
                              <div className="space-y-4">
                                {template.accessMessage === 'BROKER_ACCESS_REQUIRED' ? (
                                  <>
                                    <div className="text-center">
                                      <div className="inline-flex items-center justify-center w-10 h-10 bg-orange-500/20 rounded-full mb-3">
                                        <Lock className="h-5 w-5 text-orange-400" />
                                      </div>
                                      <h3 className="text-sm font-semibold text-white mb-1">Broker Member Verification Required</h3>
                                      <p className="text-xs text-blue-200 leading-relaxed">
                                        If you are a licensed broker, please contact us through your dashboard. Our team will review your verification documents and unlock access to this professional template.
                                      </p>
                                    </div>
                                    <Link href="/broker-dashboard" className="block">
                                      <Button size="sm" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        Contact from Dashboard
                                      </Button>
                                    </Link>
                                  </>
                                ) : template.accessMessage === 'UPGRADE_TO_PROFESSIONAL' ? (
                                  <>
                                    <div className="text-center">
                                      <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-full mb-3">
                                        <Lock className="h-5 w-5 text-blue-400" />
                                      </div>
                                      <h3 className="text-sm font-semibold text-white mb-1">Professional Plan Required</h3>
                                      <p className="text-xs text-blue-200 leading-relaxed">
                                        This advanced document template is available for Professional subscribers. Upgrade now to access premium maritime documentation tools.
                                      </p>
                                    </div>
                                    <Link href="/plans" className="block">
                                      <Button size="sm" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Upgrade to Professional
                                      </Button>
                                    </Link>
                                  </>
                                ) : template.accessMessage === 'UPGRADE_TO_ENTERPRISE' ? (
                                  <>
                                    <div className="text-center">
                                      <div className="inline-flex items-center justify-center w-10 h-10 bg-purple-500/20 rounded-full mb-3">
                                        <Lock className="h-5 w-5 text-purple-400" />
                                      </div>
                                      <h3 className="text-sm font-semibold text-white mb-1">Enterprise Plan Required</h3>
                                      <p className="text-xs text-blue-200 leading-relaxed">
                                        This premium document template is exclusive to Enterprise subscribers. Unlock comprehensive maritime business documentation suite.
                                      </p>
                                    </div>
                                    <Link href="/plans" className="block">
                                      <Button size="sm" className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Upgrade to Enterprise
                                      </Button>
                                    </Link>
                                  </>
                                ) : (
                                  <>
                                    <div className="text-center">
                                      <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-full mb-3">
                                        <Lock className="h-5 w-5 text-blue-400" />
                                      </div>
                                      <h3 className="text-sm font-semibold text-white mb-1">Access Required</h3>
                                      <p className="text-xs text-blue-200 leading-relaxed">
                                        This document template requires a subscription plan. Please upgrade your account to access professional maritime documentation tools.
                                      </p>
                                    </div>
                                    <Link href="/plans" className="block">
                                      <Button size="sm" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View Subscription Plans
                                      </Button>
                                    </Link>
                                  </>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                            )}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 text-sm">
                            {template.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(template.createdAt).toLocaleDateString()}
                            </div>
                            {!template.canGenerate && (
                              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                                Access Required
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Downloaded Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Downloaded Documents
          </CardTitle>
          <CardDescription>
            Documents generated for {vesselName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generatedDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No Documents Generated Yet</p>
              <p className="text-sm">Get your first document using the templates above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {generatedDocuments.map((document: GeneratedDocument) => (
                <Card key={document.id} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{document.title}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <Clock className="h-4 w-4 mr-1" />
                          Created {new Date(document.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setExpandedDocument(
                            expandedDocument === document.id ? null : document.id
                          )}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {expandedDocument === document.id ? 'Hide' : 'Preview'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadDocument(document, 'pdf')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadDocument(document, 'docx')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Word
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {expandedDocument === document.id && (
                    <CardContent>
                      <ScrollArea className="h-64 w-full rounded border p-4">
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: document.content }}
                        />
                      </ScrollArea>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}