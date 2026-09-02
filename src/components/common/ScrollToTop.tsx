import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min(1, Math.max(0, scrollY / docHeight)));
      }

      if (scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const circumference = 113.1;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed bottom-24 md:bottom-8 left-4 sm:left-6 z-50 w-11 h-11 rounded-full bg-white dark:bg-slate-900 border border-content-border dark:border-slate-800 text-brand-purple dark:text-purple-300 shadow-xl flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-purple hover:scale-105 active:scale-95 ${
        visible
          ? 'opacity-100 scale-100 pointer-events-auto shadow-brand-md'
          : 'opacity-0 scale-90 pointer-events-none'
      }`}
    >
      {/* Circular Progress SVG */}
      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r="18"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-surface-soft dark:text-slate-800"
          fill="none"
        />
        <circle
          cx="22"
          cy="22"
          r="18"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-brand-pink transition-all duration-150"
          fill="none"
        />
      </svg>
      <ChevronUp className="w-5 h-5 relative z-10" />
    </button>
  );
};

