import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Upload, 
  MessageSquare, 
  FileText,
  Calendar,
  User,
  Banknote,
  Shield,
  Globe,
  Target,
  Award,
  Download
} from 'lucide-react';

interface TransactionStep {
  id: number;
  dealId: number;
  stepNumber: number;
  stepName: string;
  stepDescription: string;
  requiredDocuments?: string[];
  status: 'pending' | 'approved' | 'refused' | 'cancelled';
  submittedAt?: Date;
  reviewedAt?: Date;
  adminNotes?: string;
  adminId?: number;
  notes?: string;
}

interface DealMessage {
  id: number;
  dealId: number;
  senderId: number;
  receiverId: number;
  message: string;
  isRead: boolean;
  createdAt: Date;
  senderName: string;
  receiverName: string;
}

interface TransactionProgressProps {
  dealId: number;
  currentUserRole: 'broker' | 'admin';
  currentUserId: number;
}

const stepIcons = [
  FileText,    // 1) Buyer Issues PO
  Globe,       // 2) ICPO
  Shield,      // 3) Contract Under Review
  Target,      // 4) PPOP Sent
  Banknote,    // 5) Buyer Issues Bank Instrument
  Clock,       // 6) Waiting for Bank Instrument
  CheckCircle, // 7) POP + 2% PB
  Award        // 8) Commission
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-500';
    case 'refused': return 'bg-red-500';
    case 'cancelled': return 'bg-gray-500';
    default: return 'bg-yellow-500';
  }
};

const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'approved': return 'default';
    case 'refused': return 'destructive';
    case 'cancelled': return 'secondary';
    default: return 'outline';
  }
};

export default function TransactionProgress({ dealId, currentUserRole, currentUserId }: TransactionProgressProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch transaction steps
  const { data: steps = [], isLoading: stepsLoading } = useQuery({
    queryKey: ['transaction-steps', dealId],
    queryFn: () => apiRequest('GET', `/api/broker-deals/${dealId}/steps`).then(res => res.json()),
    staleTime: 0
  });

  // Fetch deal messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['deal-messages', dealId],
    queryFn: () => apiRequest('GET', `/api/broker-deals/${dealId}/messages`).then(res => res.json()),
    staleTime: 0
  });

  // Fetch documents for each step
  const { data: stepDocuments = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['step-documents', dealId],
    queryFn: () => apiRequest('GET', `/api/broker-deals/${dealId}/documents`).then(res => res.json()),
    staleTime: 0
  });

  // Update step status mutation (admin only)
  const updateStepMutation = useMutation({
    mutationFn: ({ stepId, status, adminNotes }: { stepId: number; status: string; adminNotes?: string }) =>
      apiRequest('PATCH', `/api/admin/transaction-steps/${stepId}`, { status, adminNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction-steps', dealId] });
      toast({
        title: "Step Updated",
        description: "Transaction step status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update step status",
        variant: "destructive"
      });
    }
  });

  // Submit step mutation (broker only)
  const submitStepMutation = useMutation({
    mutationFn: (stepId: number) =>
      apiRequest('POST', `/api/broker-deals/steps/${stepId}/submit`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction-steps', dealId] });
      toast({
        title: "Step Submitted",
        description: "Transaction step has been submitted for review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit step",
        variant: "destructive"
      });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ receiverId, message }: { receiverId: number; message: string }) =>
      apiRequest('POST', `/api/broker-deals/${dealId}/messages`, { receiverId, message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-messages', dealId] });
      setMessageText('');
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Message Failed",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    }
  });

  const calculateProgress = () => {
    if (steps.length === 0) return 0;
    const approvedSteps = steps.filter((step: TransactionStep) => step.status === 'approved').length;
    return Math.round((approvedSteps / steps.length) * 100);
  };

  const handleUpdateStep = (stepId: number, status: string, adminNotes?: string) => {
    updateStepMutation.mutate({ stepId, status, adminNotes });
  };

  const handleSubmitStep = (stepId: number) => {
    submitStepMutation.mutate(stepId);
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    // For demo purposes, send message to admin (user ID 1) if current user is broker
    // In real implementation, you'd determine the appropriate receiver
    const receiverId = currentUserRole === 'broker' ? 1 : currentUserId;
    sendMessageMutation.mutate({ receiverId, message: messageText });
  };

  if (stepsLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            CIF-ASWP Transaction Progress
          </CardTitle>
          <CardDescription>
            Track your deal progress through all 8 required steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="text-xs text-muted-foreground">
              {steps.filter((s: TransactionStep) => s.status === 'approved').length} of {steps.length} steps completed
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Steps */}
      <div className="space-y-4">
        {steps.map((step: TransactionStep, index: number) => {
          const StepIcon = stepIcons[index] || FileText;
          const isExpanded = expandedStep === step.id;
          
          return (
            <Card key={step.id} className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(step.status)}`}>
                      <StepIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Step {step.stepNumber}: {step.stepName}
                      </CardTitle>
                      <CardDescription>{step.stepDescription}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(step.status)}>
                      {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                    >
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Required Documents */}
                    {step.requiredDocuments && step.requiredDocuments.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Required Documents
                        </h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {step.requiredDocuments.map((doc, idx) => (
                            <li key={idx}>{doc}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Broker Submissions - Show what broker sent for this step */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2 text-blue-800">
                        <Upload className="h-4 w-4" />
                        Broker Submissions for This Step
                      </h4>
                      
                      {/* Broker Notes */}
                      {step.notes && (
                        <div className="mb-3">
                          <h5 className="font-medium text-sm text-blue-700 mb-1">Broker Notes:</h5>
                          <div className="bg-white rounded p-2 text-sm border border-blue-200">
                            {step.notes}
                          </div>
                        </div>
                      )}

                      {/* Step Status and Progress */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <h5 className="font-medium text-sm text-blue-700 mb-1">Status:</h5>
                          <Badge variant={getStatusBadgeVariant(step.status)}>
                            {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                          </Badge>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm text-blue-700 mb-1">Progress:</h5>
                          <div className="text-sm">{step.progressPercentage}% Complete</div>
                        </div>
                      </div>

                      {/* Comprehensive Broker Submission Section */}
                      {(step.submittedAt || step.notes || stepDocuments.filter((doc: any) => doc.stepId === step.id).length > 0) && (
                        <div className="mb-4">
                          <h5 className="font-medium text-sm text-green-700 mb-2 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Broker Submission Details
                          </h5>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-3">
                            
                            {/* Submission Timestamp */}
                            {step.submittedAt && (
                              <div className="flex items-center gap-2 text-sm text-green-800">
                                <Calendar className="h-4 w-4" />
                                <span><strong>Submitted:</strong> {new Date(step.submittedAt).toLocaleString()}</span>
                              </div>
                            )}
                            
                            {/* Broker Notes */}
                            {step.notes && (
                              <div className="text-sm text-green-800">
                                <strong className="flex items-center gap-2 mb-1">
                                  <MessageSquare className="h-4 w-4" />
                                  Broker Notes:
                                </strong>
                                <div className="bg-white rounded p-2 border border-green-300">
                                  {step.notes}
                                </div>
                              </div>
                            )}
                            
                            {/* Document Summary */}
                            {stepDocuments.filter((doc: any) => doc.stepId === step.id).length > 0 && (
                              <div className="text-sm text-green-800">
                                <strong className="flex items-center gap-2 mb-1">
                                  <FileText className="h-4 w-4" />
                                  Documents Submitted: {stepDocuments.filter((doc: any) => doc.stepId === step.id).length} file(s)
                                </strong>
                              </div>
                            )}
                            
                            {/* No submission message */}
                            {!step.submittedAt && !step.notes && stepDocuments.filter((doc: any) => doc.stepId === step.id).length === 0 && (
                              <div className="text-sm text-gray-500 italic">
                                No submission from broker yet for this step
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Related Messages for this step */}
                      {messages.filter((msg: any) => msg.stepId === step.id).length > 0 && (
                        <div className="mb-3">
                          <h5 className="font-medium text-sm text-blue-700 mb-2">Step Messages:</h5>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {messages
                              .filter((msg: any) => msg.stepId === step.id)
                              .map((msg: any) => (
                                <div key={msg.id} className="bg-white rounded p-2 border border-blue-200">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-xs text-blue-600">
                                      {msg.senderName || 'Unknown'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(msg.createdAt).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="text-sm">{msg.message}</div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Uploaded Documents for this step */}
                      {stepDocuments.filter((doc: any) => doc.stepId === step.id).length > 0 && (
                        <div className="mb-3">
                          <h5 className="font-medium text-sm text-blue-700 mb-2">Uploaded Documents:</h5>
                          <div className="space-y-2">
                            {stepDocuments
                              .filter((doc: any) => doc.stepId === step.id)
                              .map((doc: any) => (
                                <div key={doc.id} className="bg-white rounded p-2 border border-blue-200 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    <div>
                                      <div className="font-medium text-sm">{doc.fileName}</div>
                                      <div className="text-xs text-gray-500">
                                        {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'} • 
                                        Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Admin Notes (if any) */}
                      {step.adminNotes && (
                        <div className="mb-3">
                          <h5 className="font-medium text-sm text-blue-700 mb-1">Admin Feedback:</h5>
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm">
                            {step.adminNotes}
                          </div>
                        </div>
                      )}

                      {/* No submissions message */}
                      {!step.notes && !step.submittedAt && stepDocuments.filter((doc: any) => doc.stepId === step.id).length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">No submissions yet for this step</p>
                        </div>
                      )}
                    </div>

                    {/* Step Actions */}
                    <div className="flex flex-wrap gap-2">
                      {currentUserRole === 'broker' && step.status === 'pending' && (
                        <Button
                          onClick={() => handleSubmitStep(step.id)}
                          disabled={submitStepMutation.isPending}
                          size="sm"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Submit Step
                        </Button>
                      )}

                      {currentUserRole === 'admin' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleUpdateStep(step.id, 'approved')}
                            disabled={updateStepMutation.isPending}
                            size="sm"
                            variant="default"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleUpdateStep(step.id, 'refused')}
                            disabled={updateStepMutation.isPending}
                            size="sm"
                            variant="destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Refuse
                          </Button>
                        </div>
                      )}

                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Documents
                      </Button>
                    </div>

                    {/* Admin Notes */}
                    {step.adminNotes && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-1">Admin Notes</h4>
                        <p className="text-sm text-blue-700">{step.adminNotes}</p>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="text-xs text-muted-foreground space-y-1">
                      {step.submittedAt && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          Submitted: {new Date(step.submittedAt).toLocaleString()}
                        </div>
                      )}
                      {step.reviewedAt && (
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          Reviewed: {new Date(step.reviewedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Messages Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Deal Messages
          </CardTitle>
          <CardDescription>
            Communicate with {currentUserRole === 'broker' ? 'admin' : 'broker'} about this deal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Messages List */}
            <ScrollArea className="h-64 w-full border rounded-md p-4">
              {messagesLoading ? (
                <div className="text-center text-muted-foreground">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground">No messages yet</div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message: DealMessage) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg max-w-[80%] ${
                        message.senderId === currentUserId
                          ? 'bg-blue-600 text-white ml-auto'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {message.senderId === currentUserId ? 'You' : message.senderName}
                      </div>
                      <div className="text-sm">{message.message}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(message.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Send Message */}
            <div className="space-y-2">
              <Textarea
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="min-h-[80px]"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sendMessageMutation.isPending}
                className="w-full"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}