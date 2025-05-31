import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  FileText, Download, Loader2, Ship, MapPin, Calendar, 
  Fuel, Package, AlertCircle, Globe, BarChart, Shield,
  Clipboard, FileCheck, Factory, Anchor, Copy, RefreshCw
} from 'lucide-react';

interface AIDocumentGeneratorProps {
  vessel: {
    id: number;
    name: string;
    imo: string;
    mmsi: string;
    vesselType: string;
    flag: string;
    built?: number | null;
    deadweight?: number | null;
    currentLat?: string;
    currentLng?: string;
    departurePort?: string;
    destinationPort?: string;
    cargoType?: string;
    cargoQuantity?: string;
    dealValue?: string;
    speed?: string;
    course?: string;
    status?: string;
  };
}

interface DocumentSection {
  title: string;
  content: string;
  type: 'header' | 'paragraph' | 'list' | 'table' | 'footer';
}

export default function AIDocumentGenerator({ vessel }: AIDocumentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<DocumentSection[] | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const { toast } = useToast();

  const generateComprehensiveReport = async (type: string) => {
    setIsGenerating(true);
    setDocumentType(type);
    
    try {
      const response = await fetch('/api/vessels/generate-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vesselId: vessel.id,
          documentType: type,
          vesselData: vessel
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate document');
      }

      const data = await response.json();
      setGeneratedDocument(data.sections);
      
      toast({
        title: "Document Generated",
        description: `${type} has been generated successfully`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to generate document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadDocument = () => {
    if (!generatedDocument) return;

    let content = `${documentType}\n`;
    content += `Generated on ${new Date().toLocaleDateString()}\n`;
    content += '='.repeat(50) + '\n\n';

    generatedDocument.forEach(section => {
      if (section.type === 'header') {
        content += `\n${section.title}\n`;
        content += '-'.repeat(section.title.length) + '\n';
      } else {
        content += `${section.content}\n\n`;
      }
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${vessel.name}_${documentType.replace(/\s+/g, '_')}_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const documentTypes = [
    {
      type: 'Vessel Technical Report',
      description: 'Comprehensive technical analysis and specifications',
      icon: Ship,
      color: 'bg-blue-500'
    },
    {
      type: 'Cargo Manifest',
      description: 'Detailed cargo documentation and inventory',
      icon: Package,
      color: 'bg-green-500'
    },
    {
      type: 'Voyage Analysis',
      description: 'Route optimization and operational analysis',
      icon: MapPin,
      color: 'bg-purple-500'
    },
    {
      type: 'Compliance Report',
      description: 'Safety and regulatory compliance assessment',
      icon: Shield,
      color: 'bg-orange-500'
    },
    {
      type: 'Market Analysis',
      description: 'Commercial and market intelligence report',
      icon: BarChart,
      color: 'bg-indigo-500'
    },
    {
      type: 'Environmental Impact',
      description: 'Environmental assessment and sustainability metrics',
      icon: Globe,
      color: 'bg-emerald-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documentTypes.map((doc) => {
          const IconComponent = doc.icon;
          return (
            <Card key={doc.type} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start mb-3">
                  <div className={`${doc.color} p-2 rounded-md mr-3`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{doc.type}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {doc.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => generateComprehensiveReport(doc.type)}
                  disabled={isGenerating}
                >
                  {isGenerating && documentType === doc.type ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {generatedDocument && (
        <Card className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-xl">
                <FileCheck className="h-6 w-6 mr-3" />
                {documentType}
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(
                      generatedDocument.map(s => `${s.title}\n${s.content}`).join('\n\n')
                    )
                    toast({ title: "Document copied to clipboard" })
                  }}
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button 
                  onClick={downloadDocument} 
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
            <CardDescription className="text-blue-100 mt-2">
              Comprehensive AI-generated analysis for {vessel.name} • Generated on {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="max-h-[600px] overflow-y-auto space-y-6 pr-2">
              {generatedDocument.map((section, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
                  {section.type === 'header' && (
                    <div className="flex items-start mb-4">
                      <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4 mt-1">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                          {section.title}
                        </h3>
                        <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded mt-2"></div>
                      </div>
                    </div>
                  )}
                  {section.type === 'paragraph' && (
                    <div className="ml-16">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base whitespace-pre-wrap">
                        {section.content}
                      </p>
                    </div>
                  )}
                  {section.type === 'list' && (
                    <div className="ml-16">
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        {section.content.split('\n').filter(item => item.trim()).map((item, i) => (
                          <li key={i} className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-base leading-relaxed">{item.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <Separator className="my-6" />
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  AI Generated
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                  Maritime Analysis
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                  Professional Report
                </Badge>
              </div>
              <Button 
                onClick={() => setGeneratedDocument(null)}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-950"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate New Document
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}