import { ClerkProvider as ClerkProviderBase } from '@clerk/clerk-react';
import { ReactNode } from 'react';

// Define the props interface
interface ClerkProviderProps {
  children: ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  if (!clerkPubKey) {
    console.error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable');
    // Return children without Clerk wrapping if no key is available
    return <>{children}</>;
  }

  return (
    <ClerkProviderBase
      publishableKey={clerkPubKey}
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
          card: 'bg-white',
        }
      }}
    >
      {children}
    </ClerkProviderBase>
  );
}