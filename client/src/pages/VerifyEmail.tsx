import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Email verification page
export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    // Verify the email token
    apiRequest('POST', '/api/auth/verify-email', { token })
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      })
      .catch((error) => {
        setStatus('error');
        setMessage(error.message || 'Verification failed');
      });
  }, []);

  const handleContinue = () => {
    setLocation('/login?verified=true');
  };

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <CardTitle className="mb-2">Verifying Your Email</CardTitle>
            <CardDescription>Please wait while we verify your email address...</CardDescription>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-600 mb-2">Email Verified!</CardTitle>
            <CardDescription className="mb-6">{message}</CardDescription>
            <Button onClick={handleContinue} className="w-full">
              Continue to Login
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600 mb-2">Verification Failed</CardTitle>
            <CardDescription className="mb-6">{message}</CardDescription>
            <Button onClick={() => setLocation('/login')} variant="outline" className="w-full">
              Back to Login
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Mail className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}