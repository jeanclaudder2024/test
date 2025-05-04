import { 
  UserButton as ClerkUserButton,
  SignedIn,
  SignedOut,
  useUser
} from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useLocation } from 'wouter';

export function UserButton() {
  const { user, isLoaded } = useUser();
  const [, setLocation] = useLocation();

  return (
    <div className="flex items-center gap-2">
      <SignedIn>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium hidden md:inline-block">
            {isLoaded && user ? user.firstName || user.emailAddresses[0].emailAddress : 'User'}
          </span>
          <ClerkUserButton 
            appearance={{
              elements: {
                userButtonAvatarBox: 'w-9 h-9',
              }
            }}
          />
        </div>
      </SignedIn>
      
      <SignedOut>
        <Button 
          size="sm" 
          onClick={() => setLocation('/login')}
          className="gap-2"
        >
          <LogIn className="h-4 w-4" />
          <span>Sign In</span>
        </Button>
      </SignedOut>
    </div>
  );
}