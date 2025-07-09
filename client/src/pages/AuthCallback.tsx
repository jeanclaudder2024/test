import { useEffect } from 'react';
import { useLocation } from 'wouter';

// OAuth callback handler page
export default function AuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      setLocation('/login?error=' + error);
      return;
    }

    if (token) {
      // Store the token
      localStorage.setItem('authToken', token);
      
      // Redirect to dashboard
      setLocation('/');
    } else {
      // No token, redirect to login
      setLocation('/login?error=no_token');
    }
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800">Completing sign in...</h2>
        <p className="text-gray-600 mt-2">Please wait while we finish setting up your account.</p>
      </div>
    </div>
  );
}