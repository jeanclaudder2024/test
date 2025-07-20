import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { 
  User, 
  Upload, 
  MapPin, 
  FileText, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  CreditCard,
  Clock,
  AlertCircle,
  Camera,
  Globe,
  Phone,
  Mail,
  Building,
  Award
} from 'lucide-react';

const steps = [
  { id: 1, title: 'Personal Information', icon: User, description: 'Complete your personal details' },
  { id: 2, title: 'Passport Upload', icon: Upload, description: 'Upload passport photo and documents' },
  { id: 3, title: 'Location & Contact', icon: MapPin, description: 'Provide address and contact information' },
  { id: 4, title: 'Professional Details', icon: Building, description: 'Business information and experience' },
  { id: 5, title: 'Review & Submit', icon: FileText, description: 'Review and submit application' }
];

export default function BrokerCardApplication() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  
  // Form data state
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    passportExpiry: '',
    placeOfBirth: '',
    gender: '',
    maritalStatus: '',
    
    // Passport Upload
    passportPhoto: null as File | null,
    passportDocument: null as File | null,
    
    // Location & Contact
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phoneNumber: '',
    alternatePhone: '',
    emergencyContact: '',
    emergencyPhone: '',
    
    // Professional Details
    companyName: '',
    jobTitle: '',
    yearsExperience: '',
    previousLicenses: '',
    specializations: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    linkedinProfile: '',
    professionalReferences: ''
  });

  // Check if user has broker membership
  useEffect(() => {
    if (!user?.hasBrokerMembership) {
      setLocation('/broker-membership');
    }
  }, [user, setLocation]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.fullName && formData.dateOfBirth && formData.nationality && 
                 formData.passportNumber && formData.passportExpiry);
      case 2:
        return !!(formData.passportPhoto && formData.passportDocument);
      case 3:
        return !!(formData.streetAddress && formData.city && formData.country && 
                 formData.phoneNumber);
      case 4:
        return !!(formData.companyName && formData.jobTitle && formData.yearsExperience);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields before proceeding.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const submitApplication = async () => {
    if (!validateStep(4)) {
      toast({
        title: "Incomplete Application",
        description: "Please complete all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create FormData for file uploads
      const submissionData = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          submissionData.append(key, value);
        } else if (value) {
          submissionData.append(key, value.toString());
        }
      });

      const response = await fetch('/api/broker-card-application', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: submissionData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      const result = await response.json();

      // Refresh user data
      await refreshUser();

      toast({
        title: "Application Submitted Successfully!",
        description: "Your broker card application is under review. You'll receive updates via email.",
      });

      // Redirect to broker dashboard
      setLocation('/broker-dashboard');

    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => updateFormData('fullName', e.target.value)}
                  placeholder="Enter your full legal name"
                />
              </div>
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
                  placeholder="Your nationality"
                />
              </div>
              <div>
                <Label htmlFor="passportNumber">Passport Number *</Label>
                <Input
                  id="passportNumber"
                  value={formData.passportNumber}
                  onChange={(e) => updateFormData('passportNumber', e.target.value)}
                  placeholder="Passport number"
                />
              </div>
              <div>
                <Label htmlFor="passportExpiry">Passport Expiry *</Label>
                <Input
                  id="passportExpiry"
                  type="date"
                  value={formData.passportExpiry}
                  onChange={(e) => updateFormData('passportExpiry', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="placeOfBirth">Place of Birth</Label>
                <Input
                  id="placeOfBirth"
                  value={formData.placeOfBirth}
                  onChange={(e) => updateFormData('placeOfBirth', e.target.value)}
                  placeholder="City, Country"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select onValueChange={(value) => updateFormData('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <Select onValueChange={(value) => updateFormData('maritalStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Upload Requirements</h3>
              </div>
              <p className="text-blue-700 text-sm">
                Please upload clear, high-quality images of your passport. Files must be in JPG, PNG, or PDF format and under 5MB.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="passportPhoto">Passport Photo Page *</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <input
                      type="file"
                      id="passportPhoto"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload('passportPhoto', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label
                      htmlFor="passportPhoto"
                      className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Upload Photo Page
                    </label>
                  </div>
                  {formData.passportPhoto && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ {formData.passportPhoto.name}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="passportDocument">Full Passport Document *</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <input
                      type="file"
                      id="passportDocument"
                      accept=".pdf,image/*"
                      onChange={(e) => handleFileUpload('passportDocument', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label
                      htmlFor="passportDocument"
                      className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Upload Full Document
                    </label>
                  </div>
                  {formData.passportDocument && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ {formData.passportDocument.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Residential Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="streetAddress">Street Address *</Label>
                  <Input
                    id="streetAddress"
                    value={formData.streetAddress}
                    onChange={(e) => updateFormData('streetAddress', e.target.value)}
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => updateFormData('state', e.target.value)}
                    placeholder="State or Province"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => updateFormData('postalCode', e.target.value)}
                    placeholder="Postal code"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => updateFormData('country', e.target.value)}
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phoneNumber">Primary Phone *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <Label htmlFor="alternatePhone">Alternate Phone</Label>
                  <Input
                    id="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={(e) => updateFormData('alternatePhone', e.target.value)}
                    placeholder="+1 234 567 8901"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => updateFormData('emergencyContact', e.target.value)}
                    placeholder="Emergency contact person"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={(e) => updateFormData('emergencyPhone', e.target.value)}
                    placeholder="+1 234 567 8902"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building className="h-5 w-5" />
                Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => updateFormData('companyName', e.target.value)}
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => updateFormData('jobTitle', e.target.value)}
                    placeholder="Your job title"
                  />
                </div>
                <div>
                  <Label htmlFor="yearsExperience">Years of Experience *</Label>
                  <Select onValueChange={(value) => updateFormData('yearsExperience', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-2">0-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="11-15">11-15 years</SelectItem>
                      <SelectItem value="15+">15+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="businessPhone">Business Phone</Label>
                  <Input
                    id="businessPhone"
                    value={formData.businessPhone}
                    onChange={(e) => updateFormData('businessPhone', e.target.value)}
                    placeholder="+1 234 567 8903"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Input
                    id="businessAddress"
                    value={formData.businessAddress}
                    onChange={(e) => updateFormData('businessAddress', e.target.value)}
                    placeholder="Company address"
                  />
                </div>
                <div>
                  <Label htmlFor="businessEmail">Business Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={formData.businessEmail}
                    onChange={(e) => updateFormData('businessEmail', e.target.value)}
                    placeholder="business@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
                  <Input
                    id="linkedinProfile"
                    value={formData.linkedinProfile}
                    onChange={(e) => updateFormData('linkedinProfile', e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="specializations">Specializations</Label>
                  <Textarea
                    id="specializations"
                    value={formData.specializations}
                    onChange={(e) => updateFormData('specializations', e.target.value)}
                    placeholder="Oil trading, vessel chartering, maritime law, etc."
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="previousLicenses">Previous Licenses & Certifications</Label>
                  <Textarea
                    id="previousLicenses"
                    value={formData.previousLicenses}
                    onChange={(e) => updateFormData('previousLicenses', e.target.value)}
                    placeholder="List any relevant licenses, certifications, or qualifications"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="professionalReferences">Professional References</Label>
                  <Textarea
                    id="professionalReferences"
                    value={formData.professionalReferences}
                    onChange={(e) => updateFormData('professionalReferences', e.target.value)}
                    placeholder="Provide 2-3 professional references with contact information"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">Application Review</h3>
              </div>
              <p className="text-green-700">
                Please review all the information below carefully before submitting your broker card application.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {formData.fullName}</p>
                  <p><strong>Date of Birth:</strong> {formData.dateOfBirth}</p>
                  <p><strong>Nationality:</strong> {formData.nationality}</p>
                  <p><strong>Passport:</strong> {formData.passportNumber}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Address:</strong> {formData.streetAddress}, {formData.city}</p>
                  <p><strong>Country:</strong> {formData.country}</p>
                  <p><strong>Phone:</strong> {formData.phoneNumber}</p>
                  <p><strong>Emergency:</strong> {formData.emergencyContact}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Professional Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Company:</strong> {formData.companyName}</p>
                  <p><strong>Title:</strong> {formData.jobTitle}</p>
                  <p><strong>Experience:</strong> {formData.yearsExperience}</p>
                  <p><strong>Business Email:</strong> {formData.businessEmail}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Documents Uploaded
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Passport Photo: {formData.passportPhoto?.name}
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Passport Document: {formData.passportDocument?.name}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-900">Important Notice</h3>
              </div>
              <p className="text-yellow-700 text-sm">
                By submitting this application, you confirm that all information provided is accurate and complete. 
                Your broker card will be processed within 3-5 business days after submission.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user?.hasBrokerMembership) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">Access Required</h2>
          <p className="text-gray-500">Please complete broker membership payment first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Award className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
            Broker Card Application
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Complete your professional broker card application to access all trading features
        </p>
      </div>

      {/* Progress Steps */}
      <div className="space-y-4">
        <Progress value={(currentStep / 5) * 100} className="w-full" />
        <div className="flex justify-between items-center">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center text-center space-y-2 ${
                currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep > step.id
                    ? 'bg-green-600 text-white'
                    : currentStep === step.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <div className="text-xs">
                <div className="font-semibold">{step.title}</div>
                <div className="text-gray-500 hidden md:block">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5" })}
            {steps[currentStep - 1].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep < 5 ? (
            <Button
              onClick={nextStep}
              className="flex items-center gap-2"
              disabled={!validateStep(currentStep)}
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={submitApplication}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Submit Application
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}