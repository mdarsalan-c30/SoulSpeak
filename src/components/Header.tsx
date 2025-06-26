
import { Heart, LogOut, User, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

export const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleProfileUpdate = () => {
    // Force a page refresh when navigating to profile to ensure fresh data
    if (location.pathname === '/profile') {
      window.location.reload();
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-serif text-slate-800">SoulSpeak</span>
          </Link>
          
          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-6 text-sm text-slate-600">
                  <Link to="/" className="hover:text-slate-800 transition-colors">Express</Link>
                  <Link to="/notes" className="hover:text-slate-800 transition-colors">Notes</Link>
                  <Link to="/profile" className="hover:text-slate-800 transition-colors" onClick={handleProfileUpdate}>Profile</Link>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" asChild className="md:hidden">
                    <Link to="/notes">
                      <BookOpen className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/profile" onClick={handleProfileUpdate}>
                      <User className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
