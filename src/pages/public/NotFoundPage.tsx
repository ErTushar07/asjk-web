import React from 'react';
import { Home, FolderOpen, Heart, Mail, ArrowRight, Compass } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (route: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-2xl w-full text-center space-y-8 animate-fadeIn">
        {/* Foundation Branding Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-soft border border-content-border text-brand-purple text-xs font-bold shadow-sm mx-auto">
          <Compass className="w-4 h-4 text-brand-pink" />
          <span>Al Shujaiat Foundation · Jammu & Kashmir</span>
        </div>

        {/* 404 Large Display */}
        <div className="space-y-2">
          <h1 className="text-7xl sm:text-9xl font-black text-gradient-purple-pink tracking-tight select-none">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-content-primary">
            Page Not Found
          </h2>
          <p className="text-content-secondary text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            The humanitarian resource, project dossier, or portal route you requested could not be located or may have moved.
          </p>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left">
          <button
            onClick={() => onNavigate('/')}
            className="p-4 rounded-2xl bg-white border border-content-border hover:border-brand-purple hover:shadow-brand-sm transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center group-hover:bg-brand-purple group-hover:text-white transition-colors">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-content-primary">Foundation Homepage</h4>
                <p className="text-[11px] text-content-muted">Return to main page</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-content-muted group-hover:text-brand-purple group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            onClick={() => onNavigate('/projects')}
            className="p-4 rounded-2xl bg-white border border-content-border hover:border-brand-purple hover:shadow-brand-sm transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-content-primary">Browse Projects</h4>
                <p className="text-[11px] text-content-muted">Water, schools, clinics</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-content-muted group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            onClick={() => onNavigate('/donate')}
            className="p-4 rounded-2xl bg-white border border-content-border hover:border-brand-pink hover:shadow-brand-sm transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-pink/10 text-brand-pink flex items-center justify-center group-hover:bg-brand-pink group-hover:text-white transition-colors">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-content-primary">Donate Securely</h4>
                <p className="text-[11px] text-content-muted">80G tax deductible gifts</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-content-muted group-hover:text-brand-pink group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            onClick={() => onNavigate('/contact')}
            className="p-4 rounded-2xl bg-white border border-content-border hover:border-brand-purple hover:shadow-brand-sm transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-brand-purple group-hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-content-primary">Support Desk</h4>
                <p className="text-[11px] text-content-muted">Direct helpline & office</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-content-muted group-hover:text-brand-purple group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>
    </div>
  );
};
