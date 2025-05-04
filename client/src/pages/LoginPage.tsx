import { SignIn } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function LoginPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute left-2 top-2"
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <CardTitle className="text-2xl font-bold text-blue-800">Maritime Tracker</CardTitle>
          <CardDescription>
            Sign in to access the maritime tracking platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignIn 
            path="/login"
            routing="path"
            signUpUrl="/signup"
            afterSignInUrl="/dashboard"
            appearance={{
              elements: {
                card: '',
                rootBox: '',
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}