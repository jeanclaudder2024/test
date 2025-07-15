import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  XCircle
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
}

export function StepManagement({ selectedDeal }: StepManagementProps) {
  const [selectedStep, setSelectedStep] = useState<TransactionStep | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [stepNote, setStepNote] = useState('');
  const [messageText, setMessageText] = useState('');
  const { toast } = useToast();

  // Fetch transaction steps for the selected deal
  const { data: steps = [], isLoading: stepsLoading, refetch: refetchSteps } = useQuery<TransactionStep[]>({
    queryKey: ['broker-deals', selectedDeal?.id, 'steps'],
    queryFn: async () => {
      if (!selectedDeal) return [];
      const response = await fetch(`/api/broker-deals/${selectedDeal.id}/steps`);
      if (!response.ok) throw new Error('Failed to fetch transaction steps');
      return response.json();
    },
    enabled: !!selectedDeal
  });

  // Fetch documents for selected step
  const { data: stepDocuments = [], isLoading: documentsLoading } = useQuery<StepDocument[]>({
    queryKey: ['transaction-steps', selectedStep?.id, 'documents'],
    queryFn: async () => {
      if (!selectedStep) return [];
      const response = await fetch(`/api/transaction-steps/${selectedStep.id}/documents`);
      if (!response.ok) throw new Error('Failed to fetch step documents');
      return response.json();
    },
    enabled: !!selectedStep
  });

  // Submit transaction step
  const submitMutation = useMutation({
    mutationFn: async ({ stepId, notes }: { stepId: number; notes?: string }) => {
      const response = await fetch(`/api/transaction-steps/${stepId}/submit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      if (!response.ok) throw new Error('Failed to submit step');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Step submitted successfully' });
      refetchSteps();
    },
    onError: () => {
      toast({ title: 'Failed to submit step', variant: 'destructive' });
    }
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ stepId, file, dealId }: { stepId: number; file: File; dealId: number }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('stepId', stepId.toString());
      formData.append('dealId', dealId.toString());
      formData.append('documentType', 'Transaction Document');

      const response = await fetch('/api/transaction-documents/upload', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Failed to upload document');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Document uploaded successfully' });
      setUploadFile(null);
      setStepNote('');
      queryClient.invalidateQueries({ queryKey: ['transaction-steps'] });
    },
    onError: () => {
      toast({ title: 'Failed to upload document', variant: 'destructive' });
    }
  });

  // Send message mutation
  const messageMutation = useMutation({
    mutationFn: async ({ dealId, messageContent }: { dealId: number; messageContent: string }) => {
      const response = await fetch('/api/deal-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId,
          messageContent,
          messageType: 'step_inquiry'
        })
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Message sent successfully' });
      setMessageText('');
    },
    onError: () => {
      toast({ title: 'Failed to send message', variant: 'destructive' });
    }
  });

  const handleStepSubmit = (stepId: number) => {
    submitMutation.mutate({ stepId, notes: stepNote });
  };

  const handleDocumentUpload = (stepId: number) => {
    if (!uploadFile || !selectedDeal) return;
    uploadMutation.mutate({ stepId, file: uploadFile, dealId: selectedDeal.id });
  };

  const handleSendMessage = (stepId: number) => {
    if (!messageText.trim() || !selectedDeal) return;
    messageMutation.mutate({ dealId: selectedDeal.id, messageContent: messageText });
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'submitted': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-blue-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'submitted': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {!selectedDeal ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Deal Selected</h3>
            <p className="text-gray-400">Please select a deal from the Deals tab to view transaction steps.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Deal Overview */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-orange-500" />
                Transaction Steps - {selectedDeal.dealTitle}
              </CardTitle>
              <CardDescription className="text-gray-400">
                8-Step CIF-ASWP Transaction Workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Deal Status</p>
                  <Badge variant={selectedDeal.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                    {selectedDeal.status}
                  </Badge>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Current Step</p>
                  <p className="text-lg font-semibold text-white">{selectedDeal.currentStep} / 8</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Overall Progress</p>
                  <Progress value={selectedDeal.overallProgress} className="mt-2" />
                  <p className="text-sm text-white mt-1">{selectedDeal.overallProgress}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Steps List View */}
          <div className="grid gap-4">
            {stepsLoading ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-400">Loading transaction steps...</p>
                </CardContent>
              </Card>
            ) : steps.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-400">No transaction steps found for this deal.</p>
                </CardContent>
              </Card>
            ) : (
              steps.map((step) => (
                <Card key={step.id} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStepIcon(step.status)}
                        Step {step.stepNumber}: {step.stepName}
                      </div>
                      <Badge variant={getStatusVariant(step.status)} className="text-sm">
                        {step.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {step.stepDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-700 p-3 rounded">
                        <p className="text-sm text-gray-400">Last Updated</p>
                        <p className="text-white text-sm">{new Date(step.updatedAt).toLocaleDateString()}</p>
                      </div>
                      {step.submittedAt && (
                        <div className="bg-gray-700 p-3 rounded">
                          <p className="text-sm text-gray-400">Submitted At</p>
                          <p className="text-white text-sm">{new Date(step.submittedAt).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>

                    {/* Step Actions */}
                    <div className="flex gap-3 pt-2">
                      {step.status === 'pending' && (
                        <Button
                          onClick={() => handleStepSubmit(step.id)}
                          disabled={submitMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {submitMutation.isPending ? 'Submitting...' : 'Submit for Review'}
                        </Button>
                      )}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="border-gray-600">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Document
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-800 border-gray-700 text-white">
                          <DialogHeader>
                            <DialogTitle>Upload Document for Step {step.stepNumber}</DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Upload required documents for {step.stepName}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-gray-400">Select Document</Label>
                              <Input
                                type="file"
                                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                className="bg-gray-700 border-gray-600 text-white mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-400">Add Note (Optional)</Label>
                              <Textarea
                                placeholder="Add any additional notes..."
                                value={stepNote}
                                onChange={(e) => setStepNote(e.target.value)}
                                className="bg-gray-700 border-gray-600 text-white mt-1"
                                rows={3}
                              />
                            </div>
                            <Button
                              onClick={() => handleDocumentUpload(step.id)}
                              disabled={!uploadFile || uploadMutation.isPending}
                              className="bg-orange-600 hover:bg-orange-700 w-full"
                            >
                              {uploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="border-gray-600">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Send Message
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-800 border-gray-700 text-white">
                          <DialogHeader>
                            <DialogTitle>Send Message</DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Send a message to admin about Step {step.stepNumber}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Type your message here..."
                              value={messageText}
                              onChange={(e) => setMessageText(e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white"
                              rows={4}
                            />
                            <Button
                              onClick={() => handleSendMessage(step.id)}
                              disabled={!messageText.trim() || messageMutation.isPending}
                              className="bg-orange-600 hover:bg-orange-700 w-full"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              {messageMutation.isPending ? 'Sending...' : 'Send Message'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        className="border-gray-600"
                        onClick={() => setSelectedStep(selectedStep?.id === step.id ? null : step)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {selectedStep?.id === step.id ? 'Hide' : 'View'} Documents
                      </Button>
                    </div>

                    {/* Show step documents if selected */}
                    {selectedStep?.id === step.id && (
                      <div className="border border-gray-600 rounded-lg p-4 mt-4">
                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Step Documents
                        </h4>
                        {documentsLoading ? (
                          <p className="text-gray-400">Loading documents...</p>
                        ) : stepDocuments.length === 0 ? (
                          <p className="text-gray-400">No documents uploaded yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {stepDocuments.map((doc) => (
                              <div key={doc.id} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-4 w-4 text-blue-400" />
                                  <div>
                                    <p className="text-white text-sm">{doc.originalFilename}</p>
                                    <p className="text-gray-400 text-xs">
                                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" className="border-gray-600">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-gray-600">
                                    <Download className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}