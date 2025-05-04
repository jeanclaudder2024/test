import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';

interface ClerkProviderProps {
  children: React.ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 
                      process.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!clerkPubKey) {
    console.error("Missing Clerk Publishable Key!");
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-semibold">Configuration Error</h1>
        <p className="mt-2 text-muted-foreground">
          Clerk authentication isn't properly configured.
          <br />
          Make sure you've added your Clerk Publishable Key to the environment variables.
        </p>
      </div>
    );
  }

  return (
    <BaseClerkProvider
      publishableKey={clerkPubKey}
      appearance={{
        baseTheme: isDarkMode ? dark : undefined,
        layout: {
          socialButtonsVariant: 'blockButton',
          socialButtonsPlacement: 'bottom',
        },
        elements: {
          formButtonPrimary:
            'bg-primary text-primary-foreground hover:bg-primary/90',
          card: 'bg-card shadow-md rounded-lg border border-border',
          headerTitle: 'text-xl text-foreground',
          headerSubtitle: 'text-sm text-muted-foreground',
          socialButtons: 'grid grid-cols-1 gap-2',
          dividerLine: 'bg-border',
          dividerText: 'text-muted-foreground text-xs',
          formField: 'space-y-1',
          formFieldLabel: 'text-sm text-foreground',
          formFieldInput:
            'h-10 bg-input border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md w-full',
          footerActionText: 'text-xs text-muted-foreground',
          footerActionLink: 'text-xs text-primary hover:text-primary hover:underline',
          alertText: 'text-xs text-destructive',
        },
      }}
    >
      {children}
    </BaseClerkProvider>
  );
}