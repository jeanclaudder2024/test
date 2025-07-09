import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  User, 
  FileText, 
  CheckCircle, 
  ArrowRight, 
  Camera,
  Shield,
  Award,
  Building
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UpgradeFormData {
  // Step 1: Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  
  // Step 2: Professional Information
  experience: string;
  specialization: string;
  previousEmployer: string;
  certifications: string;
  
  // Step 3: Document Upload
  passportPhoto: File | null;
  
  // Step 4: Contact Information
  phoneNumber: string;
  email: string;
  address: string;
}

const STEPS = [
  {
    id: 1,
    title: 'Personal Information',
    description: 'Basic personal details for membership registration',
    icon: User
  },
  {
    id: 2,
    title: 'Professional Background',
    description: 'Oil industry experience and specialization',
    icon: Building
  },
  {
    id: 3,
    title: 'Document Upload',
    description: 'Passport photo for membership card',
    icon: Camera
  },
  {
    id: 4,
    title: 'Contact Details',
    description: 'Communication information for verification',
    icon: FileText
  }
];

export default function BrokerUpgrade() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<UpgradeFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    experience: '',
    specialization: '',
    previousEmployer: '',
    certifications: '',
    passportPhoto: null,
    phoneNumber: '',
    email: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const updateFormData = (field: keyof UpgradeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      updateFormData('passportPhoto', file);
      toast({
        title: "Photo uploaded",
        description: "Passport photo uploaded successfully"
      });
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.dateOfBirth && formData.nationality);
      case 2:
        return !!(formData.experience && formData.specialization);
      case 3:
        return !!formData.passportPhoto;
      case 4:
        return !!(formData.phoneNumber && formData.email && formData.address);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
        toast({
          title: "Step completed",
          description: `Moving to step ${currentStep + 1}`,
        });
      } else {
        handleSubmit();
      }
    } else {
      toast({
        title: "Incomplete information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Validate all required fields one more time
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber) {
        toast({
          title: "Missing required information",
          description: "Please fill in all required fields before submitting",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Save broker data to localStorage for payment process
      localStorage.setItem('brokerUpgradeData', JSON.stringify(formData));
      
      toast({
        title: "Application submitted successfully!",
        description: "Redirecting to payment page for your elite membership",
      });
      
      // Use proper router navigation instead of window.location
      setTimeout(() => {
        setLocation('/broker-payment');
      }, 1000);
      
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission failed",
        description: "Please try again later",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  const progressPercentage = (currentStep / 4) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="nationality">Nationality *</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => updateFormData('nationality', e.target.value)}
                  placeholder="Enter your nationality"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="experience">Years of Experience *</Label>
              <Input
                id="experience"
                value={formData.experience}
                onChange={(e) => updateFormData('experience', e.target.value)}
                placeholder="e.g., 5 years in oil trading"
              />
            </div>
            <div>
              <Label htmlFor="specialization">Oil Industry Specialization *</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => updateFormData('specialization', e.target.value)}
                placeholder="e.g., Crude Oil Trading, Refining, Maritime Transport"
              />
            </div>
            <div>
              <Label htmlFor="previousEmployer">Previous Employer</Label>
              <Input
                id="previousEmployer"
                value={formData.previousEmployer}
                onChange={(e) => updateFormData('previousEmployer', e.target.value)}
                placeholder="Company name (optional)"
              />
            </div>
            <div>
              <Label htmlFor="certifications">Professional Certifications</Label>
              <Textarea
                id="certifications"
                value={formData.certifications}
                onChange={(e) => updateFormData('certifications', e.target.value)}
                placeholder="List any relevant certifications (optional)"
                rows={3}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                {formData.passportPhoto ? (
                  <CheckCircle className="h-12 w-12 text-green-500" />
                ) : (
                  <Camera className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload Passport Photo</h3>
              <p className="text-gray-600 mb-4">
                This photo will be used for your oil union membership card
              </p>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="passport-upload"
              />
              <label htmlFor="passport-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">
                  {formData.passportPhoto ? 'Photo uploaded successfully' : 'Click to upload passport photo'}
                </p>
                <p className="text-gray-500">PNG, JPG up to 5MB</p>
              </label>
            </div>
            
            {formData.passportPhoto && (
              <div className="text-center">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {formData.passportPhoto.name}
                </Badge>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                placeholder="Full address for membership verification"
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Award className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Oil Union Membership Application
          </h1>
          <p className="text-gray-600">
            Join the Professional Oil Specialists Union - Complete your registration below
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of 4
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Steps Navigation */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div
                key={step.id}
                className={`p-4 rounded-lg border text-center transition-all ${
                  isActive
                    ? 'border-blue-500 bg-blue-50'
                    : isCompleted
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <h3 className="font-medium text-sm">{step.title}</h3>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {React.createElement(STEPS[currentStep - 1].icon, { className: "h-5 w-5 mr-2" })}
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <p className="text-gray-600">{STEPS[currentStep - 1].description}</p>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              <Button
                onClick={nextStep}
                disabled={!validateCurrentStep() || isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : currentStep === 4 ? (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Submit Application
                  </>
                ) : (
                  <>
                    Next Step
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Union Information */}
        <Card className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 mr-3" />
              <div>
                <h3 className="text-xl font-bold">Professional Oil Specialists Union</h3>
                <p className="text-blue-100">Elevating standards in the global oil industry</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Membership Benefits</h4>
                <ul className="text-sm text-blue-100 space-y-1">
                  <li>• Professional certification</li>
                  <li>• Industry networking</li>
                  <li>• Exclusive trading opportunities</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Global Recognition</h4>
                <ul className="text-sm text-blue-100 space-y-1">
                  <li>• International standards</li>
                  <li>• Professional credibility</li>
                  <li>• Market access privileges</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Support Services</h4>
                <ul className="text-sm text-blue-100 space-y-1">
                  <li>• 24/7 member support</li>
                  <li>• Professional development</li>
                  <li>• Legal assistance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}