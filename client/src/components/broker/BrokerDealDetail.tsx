import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  FileText, 
  Upload, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Ship,
  DollarSign,
  Calendar,
  User,
  Building2,
  Download,
  Send
} from 'lucide-react';

interface TransactionStep {
  id: number;
  dealId: number;
  stepNumber: number;
  stepName: string;
  stepDescription: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: number | null;
  adminNotes: string | null;
}

interface Deal {
  id: number;
  brokerId: number;
  dealTitle: string;
  dealDescription: string;
  cargoType: string;
  quantity: number;
  quantityUnit: string;
  pricePerUnit: number;
  totalValue: number;
  currency: string;
  status: string;
  priority: string;
  originPort: string;
  destinationPort: string;
  currentStep: number;
  overallProgress: number;
  createdAt: string;
}

interface BrokerDealDetailProps {
  dealId: number;
  isOpen: boolean;
  onClose: () => void;
}

const stepFormSchema = z.object({
  notes: z.string().optional(),
  documents: z.any().optional(),
});

type StepFormData = z.infer<typeof stepFormSchema>;

export function BrokerDealDetail({ dealId, isOpen, onClose }: BrokerDealDetailProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<StepFormData>({
    resolver: zodResolver(stepFormSchema),
  });

  // Fetch deal data
  const { data: deal, isLoading: isLoadingDeal } = useQuery<Deal>({
    queryKey: ['/api/broker-deals', dealId],
    enabled: isOpen && !!dealId,
  });

  // Fetch transaction steps
  const { data: steps = [], isLoading: isLoadingSteps } = useQuery<TransactionStep[]>({
    queryKey: ['/api/broker-deals', dealId, 'steps'],
    enabled: isOpen && !!dealId,
  });

  // Submit step mutation
  const submitStepMutation = useMutation({
    mutationFn: async (data: { stepId: number; formData: FormData }) => {
      return apiRequest('POST', `/api/broker-deals/${dealId}/steps/${data.stepId}/submit`, data.formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/broker-deals', dealId] });
      toast({
        title: "Step Submitted",
        description: "Your submission has been sent for admin review.",
      });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const getStepStatus = (step: TransactionStep) => {
    switch (step.status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' };
      case 'in_progress':
        return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' };
      case 'rejected':
        return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100' };
      default:
        return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100' };
    }
  };

  const handleStepSubmit = (stepId: number) => {
    const formData = new FormData();
    formData.append('notes', form.getValues('notes') || '');
    
    // Handle file uploads if any
    const files = form.getValues('documents');
    if (files && files.length > 0) {
      Array.from(files).forEach((file: File) => {
        formData.append('documents', file);
      });
    }

    submitStepMutation.mutate({ stepId, formData });
  };

  const TRANSACTION_STEPS = [
    {
      number: 1,
      name: "Initial Documentation",
      description: "Prepare and submit initial deal documentation including company verification and preliminary terms."
    },
    {
      number: 2,
      name: "Letter of Intent (LOI)",
      description: "Submit signed Letter of Intent confirming interest and basic deal parameters."
    },
    {
      number: 3,
      name: "Full Corporate Offer (FCO)",
      description: "Provide complete corporate offer with detailed terms, specifications, and pricing."
    },
    {
      number: 4,
      name: "Signed Contract",
      description: "Execute and submit signed purchase contract with all legal documentation."
    },
    {
      number: 5,
      name: "Payment Terms Setup",
      description: "Establish payment methods, banking details, and financial guarantees."
    },
    {
      number: 6,
      name: "Cargo Loading Documentation",
      description: "Submit cargo loading permits, quality certificates, and loading schedules."
    },
    {
      number: 7,
      name: "Shipping Documentation",
      description: "Provide bills of lading, shipping manifests, and transportation insurance."
    },
    {
      number: 8,
      name: "Final Settlement",
      description: "Complete final payments, delivery confirmation, and close deal documentation."
    }
  ];

  if (isLoadingDeal || isLoadingSteps) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!deal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Ship className="h-6 w-6 text-blue-600" />
            {deal.dealTitle}
            <Badge variant={deal.status === 'active' ? 'default' : 'secondary'}>
              {deal.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deal Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Deal Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Total Value</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    ${deal.totalValue?.toLocaleString()} {deal.currency}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Cargo Details</span>
                  </div>
                  <p>{deal.cargoType}</p>
                  <p className="text-sm text-gray-600">
                    {deal.quantity?.toLocaleString()} {deal.quantityUnit}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">Route</span>
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">From:</span> {deal.originPort}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">To:</span> {deal.destinationPort}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="font-medium">Overall Progress</span>
                  <Progress value={deal.overallProgress || 0} className="h-2" />
                  <p className="text-sm text-gray-600">{deal.overallProgress || 0}% Complete</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Steps */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  CIF-ASWP Transaction Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeStep.toString()} onValueChange={(value) => setActiveStep(parseInt(value))}>
                  {/* Step Navigation */}
                  <TabsList className="grid grid-cols-4 lg:grid-cols-8 h-auto p-1 mb-6">
                    {TRANSACTION_STEPS.map((step) => {
                      const stepData = steps.find(s => s.stepNumber === step.number);
                      const { icon: StatusIcon, color, bg } = getStepStatus(stepData!);
                      
                      return (
                        <TabsTrigger
                          key={step.number}
                          value={step.number.toString()}
                          className="flex flex-col items-center gap-1 p-3 h-auto"
                        >
                          <div className={`p-2 rounded-full ${bg}`}>
                            <StatusIcon className={`h-4 w-4 ${color}`} />
                          </div>
                          <span className="text-xs font-medium">Step {step.number}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {/* Step Content */}
                  {TRANSACTION_STEPS.map((step) => {
                    const stepData = steps.find(s => s.stepNumber === step.number);
                    
                    return (
                      <TabsContent key={step.number} value={step.number.toString()}>
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-xl font-semibold">{step.name}</h3>
                            <p className="text-gray-600 mt-1">{step.description}</p>
                          </div>

                          {stepData && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-lg">Step Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      {(() => {
                                        const { icon: StatusIcon, color } = getStepStatus(stepData);
                                        return <StatusIcon className={`h-5 w-5 ${color}`} />;
                                      })()}
                                      <Badge variant={stepData.status === 'completed' ? 'default' : 'secondary'}>
                                        {stepData.status.replace('_', ' ').toUpperCase()}
                                      </Badge>
                                    </div>
                                    
                                    {stepData.submittedAt && (
                                      <p className="text-sm text-gray-600">
                                        Submitted: {new Date(stepData.submittedAt).toLocaleDateString()}
                                      </p>
                                    )}
                                    
                                    {stepData.adminNotes && (
                                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <p className="text-sm font-medium text-yellow-800">Admin Notes:</p>
                                        <p className="text-sm text-yellow-700">{stepData.adminNotes}</p>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-lg">Submit Documentation</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <Form {...form}>
                                    <form className="space-y-4">
                                      <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Notes & Comments</FormLabel>
                                            <FormControl>
                                              <Textarea
                                                placeholder="Add any notes or comments for this step..."
                                                className="min-h-[100px]"
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                      <FormField
                                        control={form.control}
                                        name="documents"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Upload Documents</FormLabel>
                                            <FormControl>
                                              <Input
                                                type="file"
                                                multiple
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                onChange={(e) => field.onChange(e.target.files)}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                      <Button
                                        type="button"
                                        onClick={() => handleStepSubmit(stepData.id)}
                                        disabled={submitStepMutation.isPending || stepData.status === 'completed'}
                                        className="w-full"
                                      >
                                        {submitStepMutation.isPending ? (
                                          <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Submitting...
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-2">
                                            <Upload className="h-4 w-4" />
                                            Submit Step {step.number}
                                          </div>
                                        )}
                                      </Button>
                                    </form>
                                  </Form>
                                </CardContent>
                              </Card>
                            </div>
                          )}

                          {/* Navigation Buttons */}
                          <div className="flex justify-between pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                              disabled={activeStep === 1}
                            >
                              Previous Step
                            </Button>
                            <Button
                              onClick={() => setActiveStep(Math.min(8, activeStep + 1))}
                              disabled={activeStep === 8}
                            >
                              Next Step
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setShowMessageDialog(true)}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Contact Admin
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Progress
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}