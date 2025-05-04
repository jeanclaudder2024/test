import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';
import { ReactNode } from 'react';

// Get the publishable key from environment variables
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Missing Clerk Publishable Key');
}

interface ClerkProviderProps {
  children: ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  return (
    <BaseClerkProvider 
      publishableKey={publishableKey}
      appearance={{
        elements: {
          footer: 'hidden',
          card: 'border border-gray-200 shadow-md',
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
        },
      }}
    >
      {children}
    </BaseClerkProvider>
  );
}