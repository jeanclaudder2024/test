import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Upload, 
  FileText, 
  MessageCircle, 
  Send,
  Eye,
  Download,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type TransactionStep = {
  id: number;
  dealId: number;
  stepNumber: number;
  stepName: string;
  stepDescription: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
};

type StepDocument = {
  id: number;
  stepId: number;
  dealId: number;
  documentType: string;
  originalFilename: string;
  storedFilename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: number;
  uploadedAt: string;
};

type Deal = {
  id: number;
  dealTitle: string;
  status: string;
  overallProgress: number;
  currentStep: number;
};

interface StepManagementProps {
  selectedDeal: Deal | null;
  onBackToDashboard?: () => void;
}

export function StepManagement({ selectedDeal, onBackToDashboard }: StepManagementProps) {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [stepNote, setStepNote] = useState('');
  const [messageText, setMessageText] = useState('');
  const { toast } = useToast();

  // Fetch transaction steps for the selected deal
  const { data: steps = [], isLoading: stepsLoading, refetch: refetchSteps } = useQuery<TransactionStep[]>({
    queryKey: ['/api/broker-deals', selectedDeal?.id, 'steps'],
    enabled: !!selectedDeal?.id,
    queryFn: async () => {
      const response = await fetch(`/api/broker-deals/${selectedDeal?.id}/steps`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch steps');
      }
      const data = await response.json();
      console.log('Fetched steps:', data);
      return data;
    }
  });

  // Fetch documents for current step
  const { data: stepDocuments = [] } = useQuery<StepDocument[]>({
    queryKey: ['/api/transaction-steps', activeStep, 'documents'],
    enabled: !!activeStep,
  });

  // Submit step for approval mutation
  const submitStepMutation = useMutation({
    mutationFn: async ({ stepId, notes }: { stepId: number; notes: string }) => {
      const response = await fetch(`/api/transaction-steps/${stepId}/submit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ notes })
      });
      if (!response.ok) throw new Error('Failed to submit step');
      return response.json();
    },
    onSuccess: () => {
      refetchSteps();
      queryClient.invalidateQueries({ queryKey: ['/api/broker/deals'] });
      toast({
        title: "Step Submitted",
        description: "Step has been submitted for admin approval.",
      });
      setStepNote('');
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Could not submit step. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ stepId, file, dealId }: { stepId: number; file: File; dealId: number }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('stepId', stepId.toString());
      formData.append('dealId', dealId.toString());
      formData.append('documentType', `Step ${steps.find(s => s.id === stepId)?.stepNumber} Document`);
      
      const response = await fetch('/api/transaction-documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });
      if (!response.ok) throw new Error('Failed to upload document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transaction-steps', activeStep, 'documents'] });
      toast({
        title: "Document Uploaded",
        description: "Document has been uploaded successfully.",
      });
      setUploadFile(null);
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Could not upload document. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ dealId, message }: { dealId: number; message: string }) => {
      const response = await fetch('/api/deal-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          dealId,
          messageContent: message,
          messageType: 'step_communication'
        })
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Message has been sent to admin.",
      });
      setMessageText('');
    },
    onError: () => {
      toast({
        title: "Message Failed",
        description: "Could not send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>,
      in_progress: <Badge variant="outline" className="text-blue-600 border-blue-600">In Progress</Badge>,
      submitted: <Badge variant="outline" className="text-purple-600 border-purple-600">Submitted</Badge>,
      approved: <Badge variant="outline" className="text-green-600 border-green-600">Approved</Badge>,
      rejected: <Badge variant="outline" className="text-red-600 border-red-600">Rejected</Badge>,
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <Clock className="h-4 w-4 text-yellow-500" />,
      in_progress: <AlertCircle className="h-4 w-4 text-blue-500" />,
      submitted: <Upload className="h-4 w-4 text-purple-500" />,
      approved: <CheckCircle className="h-4 w-4 text-green-500" />,
      rejected: <AlertCircle className="h-4 w-4 text-red-500" />,
    };
    return icons[status as keyof typeof icons] || icons.pending;
  };

  const calculateOverallProgress = () => {
    if (!steps.length) return 0;
    const approvedSteps = steps.filter(step => step.status === 'approved').length;
    return (approvedSteps / steps.length) * 100;
  };

  const currentStepData = steps.find(step => step.id === activeStep) || steps[0];
  const canSubmitStep = currentStepData && ['pending', 'in_progress', 'rejected'].includes(currentStepData.status);

  if (!selectedDeal) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Deal Selected</h3>
          <p className="text-gray-500">Please select a deal to manage its transaction steps.</p>
        </CardContent>
      </Card>
    );
  }

  // Debug logging
  console.log('Selected Deal:', selectedDeal);
  console.log('Steps data:', steps);
  console.log('Steps loading:', stepsLoading);

  if (stepsLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={onBackToDashboard || (() => window.history.back())}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
          <h1 className="text-2xl font-bold text-white">Transaction Steps</h1>
        </div>
      </div>

      {/* Deal Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{selectedDeal.dealTitle}</span>
            <Badge variant={selectedDeal.status === 'active' ? 'default' : 'secondary'}>
              {selectedDeal.status}
            </Badge>
          </CardTitle>
          <CardDescription>8-Step CIF-ASWP Transaction Process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(calculateOverallProgress())}%</span>
              </div>
              <Progress value={calculateOverallProgress()} className="h-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {steps.slice(0, 8).map((step) => (
                <div 
                  key={step.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    activeStep === step.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveStep(step.id)}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(step.status)}
                    <span className="font-medium text-sm">Step {step.stepNumber}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{step.stepName}</p>
                  {getStatusBadge(step.status)}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Details */}
      {currentStepData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Step {currentStepData.stepNumber}: {currentStepData.stepName}</span>
              {getStatusBadge(currentStepData.status)}
            </CardTitle>
            <CardDescription>{currentStepData.stepDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="space-y-4">
                  {currentStepData.adminNotes && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">Admin Notes</h4>
                      <p className="text-yellow-700">{currentStepData.adminNotes}</p>
                    </div>
                  )}
                  
                  {currentStepData.status === 'rejected' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">Step Rejected</h4>
                      <p className="text-red-700">Please review the admin notes and resubmit with corrections.</p>
                    </div>
                  )}

                  {canSubmitStep && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="stepNote">Step Completion Notes</Label>
                        <Textarea
                          id="stepNote"
                          placeholder="Add notes about completing this step..."
                          value={stepNote}
                          onChange={(e) => setStepNote(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <Button 
                        onClick={() => submitStepMutation.mutate({ 
                          stepId: currentStepData.id, 
                          notes: stepNote 
                        })}
                        disabled={submitStepMutation.isPending}
                        className="w-full"
                      >
                        {submitStepMutation.isPending ? 'Submitting...' : 'Submit Step for Approval'}
                      </Button>
                    </div>
                  )}

                  {currentStepData.status === 'approved' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Step Approved</h4>
                      <p className="text-green-700">This step has been approved by admin. You can proceed to the next step.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <div className="space-y-4">
                  {canSubmitStep && (
                    <div className="p-4 border border-dashed border-gray-300 rounded-lg">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="document">Upload Step Document</Label>
                          <Input
                            id="document"
                            type="file"
                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                            className="mt-1"
                          />
                        </div>
                        <Button 
                          onClick={() => {
                            if (uploadFile && selectedDeal) {
                              uploadDocumentMutation.mutate({
                                stepId: currentStepData.id,
                                file: uploadFile,
                                dealId: selectedDeal.id
                              });
                            }
                          }}
                          disabled={!uploadFile || uploadDocumentMutation.isPending}
                          size="sm"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadDocumentMutation.isPending ? 'Uploading...' : 'Upload Document'}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-medium">Uploaded Documents</h4>
                    {stepDocuments.length === 0 ? (
                      <p className="text-gray-500 text-sm">No documents uploaded yet.</p>
                    ) : (
                      stepDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium text-sm">{doc.originalFilename}</p>
                              <p className="text-xs text-gray-500">
                                {(doc.fileSize / 1024).toFixed(1)} KB • {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="communication" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="message">Send Message to Admin</Label>
                      <Textarea
                        id="message"
                        placeholder="Type your message to admin about this step..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      onClick={() => {
                        if (messageText && selectedDeal) {
                          sendMessageMutation.mutate({
                            dealId: selectedDeal.id,
                            message: messageText
                          });
                        }
                      }}
                      disabled={!messageText || sendMessageMutation.isPending}
                      size="sm"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}