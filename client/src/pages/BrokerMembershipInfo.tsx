import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Upload, User, FileText, MapPin, Phone, CheckCircle } from 'lucide-react';

export default function BrokerMembershipInfo() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [passportFile, setPassportFile] = useState<File | null>(null);

  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    industryExperience: '',
    specialization: '',
    previousEmployer: '',
    certifications: '',
    currentLocation: '',
    residenceAddress: '',
    phoneNumber: '',
    emergencyContact: ''
  });

  // Open external Google Maps for location selection
  const openLocationSelector = () => {
    const googleMapsUrl = 'https://www.google.com/maps/@25.2048,55.2708,10z';
    window.open(googleMapsUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    
    toast({
      title: "External Maps Opened",
      description: "Find your location on Google Maps, then copy the address back here",
      variant: "default",
    });
  };

  // Get user's current location using browser geolocation
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Use simple reverse geocoding via a public API or just use coordinates
          const locationString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          handleInputChange('currentLocation', locationString);
          
          toast({
            title: "Location Found",
            description: `Your coordinates: ${locationString}`,
            variant: "default",
          });
        },
        (error) => {
          toast({
            title: "Location Access Denied",
            description: "Please enable location access or use the external map option",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Location Not Supported", 
        description: "Your browser doesn't support location services",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file (JPG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      setPassportFile(file);
      toast({
        title: "Photo Uploaded",
        description: `${file.name} uploaded successfully`,
        variant: "default",
      });
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      // Validate step 1 fields
      if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.nationality) {
        toast({
          title: "Missing Information",
          description: "Please fill in all personal information fields",
          variant: "destructive",
        });
        return;
      }
    } else if (step === 2) {
      // Validate step 2 fields
      if (!formData.industryExperience || !formData.specialization) {
        toast({
          title: "Missing Information", 
          description: "Please fill in your professional background",
          variant: "destructive",
        });
        return;
      }
    } else if (step === 3) {
      // Validate step 3 fields
      if (!passportFile) {
        toast({
          title: "Missing Document",
          description: "Please upload your passport photo",
          variant: "destructive",
        });
        return;
      }
    }
    
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    // Validate final step
    if (!formData.currentLocation || !formData.residenceAddress || !formData.phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all contact details",
        variant: "destructive",
      });
      return;
    }

    if (!passportFile) {
      toast({
        title: "Missing Document",
        description: "Please upload your passport photo",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create form data for file upload
      const submitFormData = new FormData();
      
      // Map form fields to API expected field names
      const fieldMapping = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
        passportNumber: formData.passportNumber,
        experience: formData.industryExperience, // Map industryExperience to experience
        specialization: formData.specialization,
        previousEmployer: formData.previousEmployer,
        certifications: formData.certifications,
        currentLocation: formData.currentLocation,
        residenceAddress: formData.residenceAddress,
        phoneNumber: formData.phoneNumber,
        email: 'membership@petrodealhub.com', // Default email
        emergencyContact: formData.emergencyContact
      };
      
      // Add all mapped form fields
      Object.entries(fieldMapping).forEach(([key, value]) => {
        if (value) {
          submitFormData.append(key, value);
        }
      });
      
      // Add passport file
      submitFormData.append('passportPhoto', passportFile);

      console.log('Submitting membership info...');
      const response = await fetch('/api/broker/request-membership-card-enhanced', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: submitFormData
      });

      const data = await response.json();
      console.log('Membership info response:', data);

      if (response.ok && data.success) {
        toast({
          title: "Membership Application Complete! 🎉",
          description: `Your broker membership is now active! Membership ID: ${data.membershipId}`,
          variant: "default",
        });

        // Set a flag to indicate broker membership is complete
        localStorage.setItem('brokerMembershipCompleted', 'true');
        
        // Navigate to broker dashboard immediately
        setLocation('/broker-dashboard');
      } else {
        throw new Error(data.message || 'Failed to submit membership information');
      }
    } catch (error: any) {
      console.error('Membership info error:', error);
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit membership information",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <User className="h-5 w-5" />
        Personal Information
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="Enter first name"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Enter last name"
          />
        </div>
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="nationality">Nationality *</Label>
          <Input
            id="nationality"
            value={formData.nationality}
            onChange={(e) => handleInputChange('nationality', e.target.value)}
            placeholder="Enter nationality"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="passportNumber">Passport Number</Label>
          <Input
            id="passportNumber"
            value={formData.passportNumber}
            onChange={(e) => handleInputChange('passportNumber', e.target.value)}
            placeholder="Enter passport number"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Professional Background
      </h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="industryExperience">Years of Experience *</Label>
          <Select onValueChange={(value) => handleInputChange('industryExperience', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-2">0-2 years</SelectItem>
              <SelectItem value="3-5">3-5 years</SelectItem>
              <SelectItem value="6-10">6-10 years</SelectItem>
              <SelectItem value="10+">10+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="specialization">Oil Trading Specialization *</Label>
          <Select onValueChange={(value) => handleInputChange('specialization', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="crude-oil">Crude Oil Trading</SelectItem>
              <SelectItem value="refined-products">Refined Products</SelectItem>
              <SelectItem value="marine-logistics">Marine Logistics</SelectItem>
              <SelectItem value="risk-management">Risk Management</SelectItem>
              <SelectItem value="general">General Oil Trading</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="previousEmployer">Previous Employer</Label>
          <Input
            id="previousEmployer"
            value={formData.previousEmployer}
            onChange={(e) => handleInputChange('previousEmployer', e.target.value)}
            placeholder="Enter previous employer (optional)"
          />
        </div>
        <div>
          <Label htmlFor="certifications">Certifications & Qualifications</Label>
          <Textarea
            id="certifications"
            value={formData.certifications}
            onChange={(e) => handleInputChange('certifications', e.target.value)}
            placeholder="List relevant certifications (optional)"
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Upload className="h-5 w-5" />
        Document Upload
      </h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="passportPhoto">Passport Photo *</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              id="passportPhoto"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="passportPhoto" className="cursor-pointer">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                {passportFile ? (
                  <span className="text-green-600 font-semibold">
                    ✓ {passportFile.name}
                  </span>
                ) : (
                  <>Click to upload passport photo (Max 5MB)</>
                )}
              </p>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        Contact Information
      </h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="currentLocation">Current Location * 
            <span className="text-xs text-muted-foreground ml-2">(Click map to select)</span>
          </Label>
          <div className="space-y-3">
            <Input
              id="currentLocation"
              value={formData.currentLocation}
              onChange={(e) => handleInputChange('currentLocation', e.target.value)}
              placeholder="City, Country (or click map below)"
            />
            <div className="border rounded-lg overflow-hidden bg-slate-50">
              <div className="p-6 text-center">
                <MapPin className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Select Your Location</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose one of the options below to set your current location
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    className="flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    Use My Current Location
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    onClick={openLocationSelector}
                    className="flex items-center gap-2"
                  >
                    🗺️ Open Google Maps
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Click "Open Google Maps" → Find your location → Copy the address → Paste it in the field above
                </p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Label htmlFor="residenceAddress">Residence Address *</Label>
          <Textarea
            id="residenceAddress"
            value={formData.residenceAddress}
            onChange={(e) => handleInputChange('residenceAddress', e.target.value)}
            placeholder="Complete address for membership card mailing"
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="phoneNumber">Phone Number *</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div>
          <Label htmlFor="emergencyContact">Emergency Contact</Label>
          <Input
            id="emergencyContact"
            value={formData.emergencyContact}
            onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
            placeholder="Name and phone number (optional)"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
          Complete Your Membership
        </h1>
        <p className="text-lg text-muted-foreground">
          Step 2: Membership Information & Document Upload
        </p>
        <div className="flex justify-center items-center gap-2 text-sm text-gray-500">
          <span>Step {step} of 4</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i <= step ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {step === 1 && <User className="h-5 w-5" />}
            {step === 2 && <FileText className="h-5 w-5" />}
            {step === 3 && <Upload className="h-5 w-5" />}
            {step === 4 && <MapPin className="h-5 w-5" />}
            Membership Application
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              Previous
            </Button>
            
            {step < 4 ? (
              <Button onClick={handleNextStep}>
                Next Step
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Submitting...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Membership
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}