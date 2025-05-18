
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Camera, LogOut, TestTubes } from 'lucide-react';

const Header = () => {
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/ed011188-d039-470c-8a6e-53f000bd6f8d.png" 
            alt="tracksense logo" 
            className="h-10" 
          />
        </Link>
        
        {user ? (
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-1">
              <Link to="/record" className="flex items-center gap-1 px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md">
                <Camera className="h-4 w-4" />
                Record
              </Link>
              <Link to="/model-test" className="flex items-center gap-1 px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md">
                <TestTubes className="h-4 w-4" />
                Model Test
              </Link>
            </nav>
            
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-block text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
