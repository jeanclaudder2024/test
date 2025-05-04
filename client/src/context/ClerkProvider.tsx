import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

interface ClerkProviderProps {
  children: React.ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Function to fetch the Clerk publishable key from our backend
    async function fetchClerkKey() {
      try {
        const response = await fetch('/api/auth/config');
        if (!response.ok) {
          throw new Error('Failed to fetch auth configuration');
        }
        
        const data = await response.json();
        if (data.clerkPublishableKey) {
          setPublishableKey(data.clerkPublishableKey);
        } else {
          setError('No publishable key returned from server');
        }
      } catch (err) {
        console.error('Error fetching Clerk publishable key:', err);
        setError('Failed to load authentication configuration');
      } finally {
        setIsLoading(false);
      }
    }

    fetchClerkKey();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center">
        <h1 className="text-xl font-semibold">Loading authentication...</h1>
        <p className="mt-2 text-muted-foreground">
          Please wait while we initialize the authentication system.
        </p>
      </div>
    );
  }

  // Show error state
  if (error || !publishableKey) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-semibold">Authentication Error</h1>
        <p className="mt-2 text-muted-foreground">
          {error || "Clerk authentication isn't properly configured."}
          <br />
          Please contact the administrator.
        </p>
      </div>
    );
  }

  // Render Clerk provider when key is available
  return (
    <BaseClerkProvider
      publishableKey={publishableKey}
      appearance={{
        elements: {
          formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
          card: 'bg-card shadow-md rounded-lg border border-border',
          footerActionLink: 'text-primary hover:text-primary hover:underline'
        },
      }}
    >
      {children}
    </BaseClerkProvider>
  );
}