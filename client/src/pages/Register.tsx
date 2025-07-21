import { useLocation } from 'wouter';
import LocationBasedRegistration from '@/components/registration/LocationBasedRegistration';
import SimpleInputTest from '@/components/SimpleInputTest';

export default function RegisterPage() {
  const [, setLocation] = useLocation();

  const handleComplete = (data: { selectedPlan: number; selectedPort: number; previewData: any }) => {
    console.log('Registration completed:', data);
    // Redirect to dashboard after registration completion
    setLocation('/dashboard');
  };

  return (
    <div>
      <SimpleInputTest />
      <hr className="my-8" />
      <LocationBasedRegistration onComplete={handleComplete} />
    </div>
  );
}