import { ClerkProvider as BaseClerkProvider, dark } from '@clerk/clerk-react';
import { ReactNode } from 'react';

// Get the publishable key from the environment
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Check if the key is available
if (!publishableKey) {
  console.error("Missing Clerk publishable key. Set VITE_CLERK_PUBLISHABLE_KEY in your environment.");
}

interface ClerkProviderProps {
  children: ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  return (
    <BaseClerkProvider 
      publishableKey={publishableKey}
      appearance={{
        baseTheme: dark,
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
          card: 'bg-white shadow-none',
          socialButtonsIconButton: 'border-gray-300',
          formFieldInput: 'border-gray-300',
          footer: 'hidden',
        }
      }}
    >
      {children}
    </BaseClerkProvider>
  );
}