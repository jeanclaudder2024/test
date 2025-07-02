import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, 
  Download, 
  Calendar, 
  User, 
  Building, 
  Ship, 
  Plus,
  Loader2,
  Shield,
  FileCheck,
  Clock,
  FileSignature,
  Receipt,
  Package,
  Truck,
  Scale,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  DollarSign,
  MapPin,
  Anchor,
  Fuel,
  ClipboardList
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Article {
  id: number;
  title: string;
  type: string;
  content: string;
  pdfUrl?: string;
  createdAt: string;
  authorId: number;
  vesselId: number;
}

interface ProfessionalArticleGeneratorProps {
  vesselId: number;
  vesselName: string;
}

const ARTICLE_TYPES = [
  // Trading Documents
  {
    id: 'letter_of_intent',
    title: 'Letter of Intent (LOI)',
    description: 'Formal declaration of intent to purchase oil cargo',
    icon: FileSignature
  },
  {
    id: 'soft_corporate_offer',
    title: 'Soft Corporate Offer (SCO)',
    description: 'Initial non-binding oil trading offer',
    icon: FileText
  },
  {
    id: 'purchase_order',
    title: 'Irrevocable Corporate Purchase Order',
    description: 'Binding purchase order for oil products',
    icon: ClipboardList
  },
  {
    id: 'sales_purchase_agreement',
    title: 'Sales & Purchase Agreement (SPA)',
    description: 'Complete oil trading contract agreement',
    icon: FileCheck
  },
  
  // Financial Documents
  {
    id: 'performance_bond',
    title: 'Performance Bond (PB)',
    description: 'Financial guarantee for contract performance',
    icon: Shield
  },
  {
    id: 'standby_letter_credit',
    title: 'Standby Letter of Credit (SBLC)',
    description: 'Bank guarantee for payment security',
    icon: CreditCard
  },
  {
    id: 'documentary_letter_credit',
    title: 'Documentary Letter of Credit (DLC)',
    description: 'Payment method for international trade',
    icon: DollarSign
  },
  {
    id: 'proforma_invoice',
    title: 'Proforma Invoice',
    description: 'Preliminary invoice for customs and quotation',
    icon: Receipt
  },
  {
    id: 'commercial_invoice',
    title: 'Commercial Invoice',
    description: 'Final invoice for payment processing',
    icon: Receipt
  },
  
  // Shipping & Logistics
  {
    id: 'bill_of_lading',
    title: 'Bill of Lading (B/L)',
    description: 'Legal document for cargo ownership transfer',
    icon: Ship
  },
  {
    id: 'packing_list',
    title: 'Packing List',
    description: 'Detailed cargo packaging information',
    icon: Package
  },
  {
    id: 'shipping_declaration',
    title: 'Shipping Declaration',
    description: 'Official shipping route and cargo declaration',
    icon: MapPin
  },
  {
    id: 'discharge_permit',
    title: 'Discharge Permit',
    description: 'Authorization for cargo discharge at port',
    icon: Anchor
  },
  {
    id: 'delivery_report',
    title: 'Delivery Report',
    description: 'Confirmation of successful cargo delivery',
    icon: CheckCircle
  },
  {
    id: 'bunker_delivery_note',
    title: 'Bunker Delivery Note (BDN)',
    description: 'Fuel delivery confirmation for vessels',
    icon: Fuel
  },
  
  // Certificates & Quality
  {
    id: 'certificate_origin',
    title: 'Certificate of Origin',
    description: 'Document certifying oil product origin',
    icon: FileCheck
  },
  {
    id: 'sgs_inspection',
    title: 'SGS Inspection Certificate',
    description: 'Third-party quality inspection report',
    icon: Shield
  },
  {
    id: 'certificate_quality',
    title: 'Certificate of Quality',
    description: 'Oil quality analysis and specifications',
    icon: CheckCircle
  },
  {
    id: 'certificate_quantity',
    title: 'Certificate of Quantity',
    description: 'Verified cargo quantity measurements',
    icon: Scale
  },
  {
    id: 'pre_discharge_inspection',
    title: 'Pre-discharge Inspection',
    description: 'Inspection report before cargo discharge',
    icon: AlertTriangle
  },
  
  // Safety & Compliance
  {
    id: 'safety_data_sheet',
    title: 'Safety Data Sheet (SDS)',
    description: 'Chemical safety information for oil products',
    icon: Shield
  },
  {
    id: 'cargo_insurance',
    title: 'Cargo Insurance',
    description: 'Insurance coverage for transported cargo',
    icon: Shield
  },
  {
    id: 'risk_assessment',
    title: 'Risk Assessment',
    description: 'Comprehensive risk analysis for operation',
    icon: AlertTriangle
  },
  
  // Licenses & Permits
  {
    id: 'export_license',
    title: 'Export License',
    description: 'Government authorization for oil export',
    icon: FileText
  },
  {
    id: 'import_license',
    title: 'Import License',
    description: 'Government authorization for oil import',
    icon: FileText
  },
  
  // Financial Records
  {
    id: 'payment_receipt',
    title: 'Payment Receipt',
    description: 'Confirmation of payment transaction',
    icon: Receipt
  },
  {
    id: 'statement_account',
    title: 'Statement of Account',
    description: 'Detailed financial account statement',
    icon: DollarSign
  },
  
  // Original Documents (kept for backward compatibility)
  {
    id: 'commercial_analysis',
    title: 'Commercial Analysis Report',
    description: 'Comprehensive commercial viability and market analysis',
    icon: Building
  },
  {
    id: 'technical_certificate',
    title: 'Technical Certificate',
    description: 'Technical specifications and compliance documentation',
    icon: FileCheck
  },
  {
    id: 'inspection_report',
    title: 'Vessel Inspection Report',
    description: 'Detailed inspection findings and recommendations',
    icon: Shield
  },
  {
    id: 'cargo_manifest',
    title: 'Cargo Manifest Document',
    description: 'Detailed cargo documentation and specifications',
    icon: Ship
  }
];

export default function ProfessionalArticleGenerator({ vesselId, vesselName }: ProfessionalArticleGeneratorProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedArticleType, setSelectedArticleType] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);

  // Fetch existing articles for this vessel
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['/api/vessels', vesselId, 'articles'],
    enabled: isAuthenticated
  });

  // Generate article mutation
  const generateArticleMutation = useMutation({
    mutationFn: async (articleType: string) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }
      
      return await apiRequest(`/api/vessels/${vesselId}/generate-article`, {
        method: 'POST',
        body: JSON.stringify({ 
          articleType,
          vesselName
        })
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Article Generated Successfully",
        description: "Professional article has been created and is ready for download.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/vessels', vesselId, 'articles'] });
      setSelectedArticleType(null);
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate article. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Download PDF mutation
  const downloadPdfMutation = useMutation({
    mutationFn: async (articleId: number) => {
      const response = await fetch(`/api/vessels/${vesselId}/articles/${articleId}/pdf`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to download PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vessel-article-${articleId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    },
    onError: () => {
      toast({
        title: "Download Failed",
        description: "Could not download PDF. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateArticle = () => {
    if (!selectedArticleType) return;
    generateArticleMutation.mutate(selectedArticleType);
  };

  const handleDownloadPdf = (articleId: number) => {
    downloadPdfMutation.mutate(articleId);
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Professional Articles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-4">
              Please log in to access AI-powered article generation and professional documentation.
            </p>
            <Button onClick={() => window.location.href = '/api/login'}>
              Sign In to Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Article Generation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Professional Articles
          </CardTitle>
          <p className="text-sm text-gray-600">
            Create professional documentation for {vesselName} using AI-powered generation
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {ARTICLE_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedArticleType === type.id;
              
              return (
                <Card 
                  key={type.id}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedArticleType(type.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{type.title}</h4>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleGenerateArticle}
              disabled={!selectedArticleType || generateArticleMutation.isPending}
              size="lg"
              className="min-w-[200px]"
            >
              {generateArticleMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Article
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Articles Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Generated Articles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {articlesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading articles...
            </div>
          ) : !articles || articles.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Articles Generated</h3>
              <p className="text-gray-600">
                Generate your first professional article using the options above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article: Article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-2">{article.title}</h4>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(article.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            Generated by AI
                          </div>
                          <Badge variant="outline">{article.type}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedArticle(
                            expandedArticle === article.id ? null : article.id
                          )}
                        >
                          {expandedArticle === article.id ? 'Collapse' : 'Preview'}
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleDownloadPdf(article.id)}
                          disabled={downloadPdfMutation.isPending}
                        >
                          {downloadPdfMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {expandedArticle === article.id && (
                      <>
                        <Separator className="my-4" />
                        <div className="prose max-w-none">
                          <div 
                            className="text-sm leading-relaxed whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}