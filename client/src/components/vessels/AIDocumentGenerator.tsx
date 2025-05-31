import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  FileText, Download, Loader2, Ship, MapPin, Calendar, 
  Fuel, Package, AlertCircle, Globe, BarChart, Shield,
  Clipboard, FileCheck, Factory, Anchor
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FileCheck className="h-5 w-5 mr-2 text-green-600" />
                {documentType}
              </CardTitle>
              <Button onClick={downloadDocument} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-4 border rounded-lg p-4 bg-muted/30">
              {generatedDocument.map((section, index) => (
                <div key={index}>
                  {section.type === 'header' && (
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      {section.title}
                    </h3>
                  )}
                  {section.type === 'paragraph' && (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {section.content}
                    </p>
                  )}
                  {section.type === 'list' && (
                    <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                      {section.content.split('\n').map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {index < generatedDocument.length - 1 && section.type !== 'header' && (
                    <Separator className="my-3" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Generated using AI analysis</span>
              <Badge variant="outline">
                {new Date().toLocaleDateString()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}