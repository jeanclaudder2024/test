import { useState, useTransition, startTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { 
  CheckCircle, 
  IdCard, 
  Ship, 
  Star, 
  Globe, 
  Shield,
  User,
  Camera,
  MapPin,
  Phone,
  Mail,
  Building,
  Calendar,
  Award,
  Upload,
  FileText,
  ChevronRight,
  ChevronLeft,
  Flag
} from 'lucide-react';

interface MembershipFormData {
  // Step 1: Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  
  // Step 2: Professional Information
  experience: string;
  specialization: string;
  previousEmployer: string;
  certifications: string;
  
  // Step 3: Document Upload & Location
  passportPhoto: File | null;
  currentLocation: string;
  residenceAddress: string;
  
  // Step 4: Contact Information
  phoneNumber: string;
  email: string;
  emergencyContact: string;
}

const STEPS = [
  {
    id: 1,
    title: 'Personal Information',
    description: 'Basic personal details for membership registration',
    icon: User,
    color: 'blue'
  },
  {
    id: 2,
    title: 'Professional Background',
    description: 'Oil industry experience and specialization',
    icon: Building,
    color: 'orange'
  },
  {
    id: 3,
    title: 'Documents & Location',
    description: 'Passport photo and location information',
    icon: Camera,
    color: 'green'
  },
  {
    id: 4,
    title: 'Contact Details',
    description: 'Communication information for verification',
    icon: Phone,
    color: 'purple'
  }
];

export default function EnhancedMembershipCardRequest() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPending, startTransitionLocal] = useTransition();
  
  const [formData, setFormData] = useState<MembershipFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    experience: '',
    specialization: '',
    previousEmployer: '',
    certifications: '',
    passportPhoto: null,
    currentLocation: '',
    residenceAddress: '',
    phoneNumber: '',
    email: user?.email || '',
    emergencyContact: ''
  });

  const updateFormData = (field: keyof MembershipFormData, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.dateOfBirth && formData.nationality && formData.passportNumber);
      case 2:
        return !!(formData.experience && formData.specialization);
      case 3:
        return !!(formData.passportPhoto && formData.currentLocation && formData.residenceAddress);
      case 4:
        return !!(formData.phoneNumber && formData.email);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else if (!validateStep(currentStep)) {
      toast({
        title: "Please Complete All Fields",
        description: "Fill in all required fields to continue.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      updateFormData('passportPhoto', file);
      toast({
        title: "Photo Uploaded",
        description: "Passport photo uploaded successfully.",
      });
    }
  };

  const submitMembershipRequest = async () => {
    if (!validateStep(4)) {
      toast({
        title: "Please Complete All Steps",
        description: "Complete all required information before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          submitData.append(key, value as string | Blob);
        }
      });

      const response = await fetch('/api/broker/request-membership-card-enhanced', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: submitData
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Membership Card Requested! 🎉",
          description: "Your professional broker membership card request has been submitted successfully.",
          variant: "default",
        });

        // Navigate to broker dashboard
        startTransition(() => {
          setTimeout(() => {
            setLocation('/broker-dashboard');
          }, 1500);
        });
      } else {
        throw new Error(result.message || 'Failed to request membership card');
      }

    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to submit membership card request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  placeholder="Enter your last name"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality" className="text-sm font-medium">Nationality *</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => updateFormData('nationality', e.target.value)}
                  placeholder="Your nationality"
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passportNumber" className="text-sm font-medium">Passport Number *</Label>
              <Input
                id="passportNumber"
                value={formData.passportNumber}
                onChange={(e) => updateFormData('passportNumber', e.target.value)}
                placeholder="Enter passport number"
                className="w-full"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="experience" className="text-sm font-medium">Oil Industry Experience *</Label>
              <Textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => updateFormData('experience', e.target.value)}
                placeholder="Describe your experience in the oil industry (years, roles, achievements)"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization" className="text-sm font-medium">Specialization *</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => updateFormData('specialization', e.target.value)}
                placeholder="e.g., Crude Oil Trading, Refined Products, Maritime Logistics"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="previousEmployer" className="text-sm font-medium">Previous Employer</Label>
              <Input
                id="previousEmployer"
                value={formData.previousEmployer}
                onChange={(e) => updateFormData('previousEmployer', e.target.value)}
                placeholder="Most recent oil industry employer"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certifications" className="text-sm font-medium">Certifications</Label>
              <Textarea
                id="certifications"
                value={formData.certifications}
                onChange={(e) => updateFormData('certifications', e.target.value)}
                placeholder="List any relevant certifications or qualifications"
                className="min-h-[80px]"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <Label htmlFor="passportPhoto" className="text-sm font-medium cursor-pointer">
                  Upload Passport Photo *
                </Label>
                <Input
                  id="passportPhoto"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {formData.passportPhoto ? (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-600">Photo uploaded: {formData.passportPhoto.name}</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">Click to upload passport photo (Max 5MB)</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentLocation" className="text-sm font-medium">Current Location *</Label>
              <Input
                id="currentLocation"
                value={formData.currentLocation}
                onChange={(e) => updateFormData('currentLocation', e.target.value)}
                placeholder="City, Country"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="residenceAddress" className="text-sm font-medium">Residence Address *</Label>
              <Textarea
                id="residenceAddress"
                value={formData.residenceAddress}
                onChange={(e) => updateFormData('residenceAddress', e.target.value)}
                placeholder="Complete residence address"
                className="min-h-[80px]"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number *</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                placeholder="+1234567890"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="your.email@example.com"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact" className="text-sm font-medium">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => updateFormData('emergencyContact', e.target.value)}
                placeholder="Name and phone number of emergency contact"
                className="w-full"
              />
            </div>

            {/* Summary */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-3">Application Summary</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                <p><strong>Nationality:</strong> {formData.nationality}</p>
                <p><strong>Specialization:</strong> {formData.specialization}</p>
                <p><strong>Location:</strong> {formData.currentLocation}</p>
                <p><strong>Documents:</strong> {formData.passportPhoto ? 'Passport photo uploaded' : 'No documents'}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
            Professional Broker Membership Card Request
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete your professional information to receive your official broker membership card
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const StepIcon = step.icon;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                    ${isActive ? `border-${step.color}-500 bg-${step.color}-500 text-white` : ''}
                    ${isCompleted ? 'border-green-500 bg-green-500 text-white' : ''}
                    ${!isActive && !isCompleted ? 'border-gray-300 bg-gray-100 text-gray-400' : ''}
                  `}>
                    {isCompleted ? <CheckCircle className="h-6 w-6" /> : <StepIcon className="h-6 w-6" />}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`
                      h-0.5 w-16 mx-4 transition-all duration-300
                      ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
          
          <Progress value={(currentStep / STEPS.length) * 100} className="h-2" />
          
          <div className="mt-4 text-center">
            <h2 className="text-xl font-semibold">{STEPS[currentStep - 1].title}</h2>
            <p className="text-muted-foreground">{STEPS[currentStep - 1].description}</p>
          </div>
        </div>

        {/* Form Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={submitMembershipRequest}
              disabled={isProcessing || !validateStep(4)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <IdCard className="h-4 w-4" />
                  Request Membership Card
                </>
              )}
            </Button>
          )}
        </div>

        {/* Benefits Section */}
        <Card className="mt-8 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-600" />
              Your Membership Card Will Include
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Professional membership ID</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Broker certification number</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">QR code for verification</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Global recognition authority</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}