
import { Heart } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-serif text-slate-800">SoulSpeak</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6 text-sm text-slate-600">
            <a href="#" className="hover:text-slate-800 transition-colors">Express</a>
            <a href="#" className="hover:text-slate-800 transition-colors">Explore</a>
            <a href="#" className="hover:text-slate-800 transition-colors">About</a>
          </nav>
        </div>
      </div>
    </header>
  );
};
