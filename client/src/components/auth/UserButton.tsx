import { 
  UserButton as ClerkUserButton,
  SignedIn,
  SignedOut
} from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useLocation } from 'wouter';

export function UserButton() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex items-center gap-2">
      <SignedIn>
        <ClerkUserButton />
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