import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Home, Search, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (route: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center mx-auto text-brand-purple">
          <Search className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-black text-brand-pink tracking-tight block">404</span>
          <h1 className="text-2xl font-extrabold text-content-primary">Page Not Found</h1>
          <p className="text-xs text-content-secondary max-w-sm mx-auto leading-relaxed">
            The page you are looking for does not exist, has been removed, or is not accessible.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('/')}
            className="btn-primary w-full sm:w-auto !py-2.5 !px-5 text-xs font-bold flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </button>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl border border-content-border text-content-secondary hover:text-content-primary font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};
