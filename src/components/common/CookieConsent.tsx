import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Cookie, ShieldCheck, X } from 'lucide-react';

export const CookieConsent: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('asfjk_cookie_consent');
      if (!consent) {
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch (e) {}
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('asfjk_cookie_consent', 'accepted');
    } catch (e) {}
    setIsVisible(false);
  };

  const handleReject = () => {
    try {
      localStorage.setItem('asfjk_cookie_consent', 'rejected');
    } catch (e) {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie Consent Banner"
      className="fixed bottom-16 md:bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 rounded-2xl border border-content-border dark:border-slate-800 shadow-2xl space-y-3.5 animate-fadeIn"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-purple/10 dark:bg-purple-950/60 flex items-center justify-center text-brand-purple dark:text-purple-300 flex-shrink-0">
          <Cookie className="w-5 h-5 text-brand-pink" />
        </div>
        <div className="space-y-1 flex-1">
          <h4 className="text-xs font-bold text-content-primary">
            {t('common.cookie_title', 'Cookie Preferences & Privacy')}
          </h4>
          <p className="text-[11px] text-content-secondary leading-relaxed">
            {t(
              'common.cookie_consent_text',
              'We use essential cookies to maintain secure sessions, remember preferences, and process transactions. By using our platform, you agree to our Cookie Policy.'
            )}
          </p>
          <button
            onClick={() => onNavigate('/cookie-policy')}
            className="text-[10px] font-semibold text-brand-purple dark:text-purple-400 hover:underline inline-block pt-0.5"
          >
            {t('common.read_cookie_policy', 'Read Cookie Policy ›')}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-content-border/60 dark:border-slate-800">
        <button
          onClick={handleAccept}
          className="btn-primary flex-1 !py-1.5 text-xs font-bold shadow-brand-sm"
        >
          {t('common.accept_all', 'Accept All')}
        </button>
        <button
          onClick={handleReject}
          className="btn-outline flex-1 !py-1.5 text-xs font-semibold"
        >
          {t('common.reject_non_essential', 'Reject Non-Essential')}
        </button>
      </div>
    </aside>
  );
};
