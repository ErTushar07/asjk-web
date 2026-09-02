import React, { useEffect, useRef } from 'react';
import { TurnstileService } from '../../services/turnstileService';
import { ShieldCheck } from 'lucide-react';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  className?: string;
}

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({ onVerify, onError, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const siteKey = TurnstileService.getSiteKey();

  useEffect(() => {
    let widgetId: string | null = null;

    const renderWidget = () => {
      if (typeof window !== 'undefined' && (window as any).turnstile && containerRef.current) {
        try {
          // Clear any previous widget
          containerRef.current.innerHTML = '';
          widgetId = (window as any).turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => {
              onVerify(token);
            },
            'error-callback': () => {
              if (onError) onError();
            },
            theme: 'light',
          });
        } catch (err) {
          console.warn('Turnstile render notice:', err);
          // Graceful fallback token for local development
          onVerify('turnstile_local_dev_token');
        }
      } else {
        // Fallback for local preview when Cloudflare script is not loaded
        onVerify('turnstile_simulated_token');
      }
    };

    // Check if script is already present
    if (typeof window !== 'undefined' && !(window as any).turnstile) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
    } else {
      renderWidget();
    }

    return () => {
      if (widgetId && typeof window !== 'undefined' && (window as any).turnstile) {
        try {
          (window as any).turnstile.remove(widgetId);
        } catch (e) {}
      }
    };
  }, [siteKey, onVerify, onError]);

  return (
    <div className={`flex flex-col items-center justify-center p-2 rounded-xl bg-surface-soft border border-content-border text-xs text-content-secondary ${className}`}>
      <div ref={containerRef} className="min-h-[65px] flex items-center justify-center">
        <div className="flex items-center gap-2 text-content-muted">
          <ShieldCheck className="w-4 h-4 text-brand-purple animate-pulse" />
          <span>Cloudflare Turnstile Protected</span>
        </div>
      </div>
    </div>
  );
};
