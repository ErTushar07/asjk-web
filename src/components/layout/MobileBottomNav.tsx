import React from 'react';
import { Home, FolderOpen, Heart, HeartHandshake, User } from 'lucide-react';

interface MobileBottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenDonateModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentRoute,
  onNavigate,
  onOpenDonateModal,
}) => {
  const isHome = currentRoute === '/' || currentRoute === '';
  const isProjects = currentRoute.startsWith('/projects') || currentRoute.startsWith('/campaigns');
  const isVolunteer = currentRoute === '/volunteer';
  const isDashboard = currentRoute.startsWith('/dashboard') || currentRoute.startsWith('/login') || currentRoute.startsWith('/profile');

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-content-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Home */}
        <button
          onClick={() => onNavigate('/')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            isHome ? 'text-brand-purple font-bold' : 'text-content-muted hover:text-content-secondary'
          }`}
          aria-label="Navigate to Home"
        >
          <Home className={`w-5 h-5 ${isHome ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Home</span>
        </button>

        {/* Projects */}
        <button
          onClick={() => onNavigate('/projects')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            isProjects ? 'text-brand-purple font-bold' : 'text-content-muted hover:text-content-secondary'
          }`}
          aria-label="Navigate to Projects"
        >
          <FolderOpen className={`w-5 h-5 ${isProjects ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Projects</span>
        </button>

        {/* Donate (Prominent Center) */}
        <button
          onClick={onOpenDonateModal}
          className="flex flex-col items-center justify-center -mt-4 py-1 px-3 rounded-2xl bg-gradient-to-tr from-brand-pink to-rose-500 text-white shadow-pink-glow active:scale-95 transition-all"
          aria-label="Open Donation Window"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <span className="text-[10px] font-black tracking-tight mt-0.5">Donate</span>
        </button>

        {/* Volunteer */}
        <button
          onClick={() => onNavigate('/volunteer')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            isVolunteer ? 'text-brand-purple font-bold' : 'text-content-muted hover:text-content-secondary'
          }`}
          aria-label="Navigate to Volunteer Application"
        >
          <HeartHandshake className={`w-5 h-5 ${isVolunteer ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Volunteer</span>
        </button>

        {/* Account / Dashboard */}
        <button
          onClick={() => onNavigate('/dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            isDashboard ? 'text-brand-purple font-bold' : 'text-content-muted hover:text-content-secondary'
          }`}
          aria-label="Navigate to Donor Dashboard"
        >
          <User className={`w-5 h-5 ${isDashboard ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Account</span>
        </button>
      </div>
    </nav>
  );
};
