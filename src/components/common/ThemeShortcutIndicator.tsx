import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun, Command } from 'lucide-react';

export const ThemeShortcutIndicator: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 z-40 print:hidden select-none">
      <div className="relative">
        {/* Tooltip on hover */}
        {showTooltip && (
          <div
            role="tooltip"
            className="absolute bottom-full left-0 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl border border-slate-700 whitespace-nowrap flex items-center gap-1.5 animate-fadeIn pointer-events-none"
          >
            <span>Toggle Theme</span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-[10px] font-mono font-bold text-brand-pink">
              Ctrl+Shift+D
            </kbd>
          </div>
        )}

        {/* Floating Button */}
        <button
          onClick={toggleTheme}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode (Shortcut: Ctrl+Shift+D)`}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl shadow-lg border backdrop-blur-md transition-all duration-200 active:scale-95 group ${
            isDark
              ? 'bg-slate-900/90 border-slate-700 text-amber-300 hover:border-amber-400/60 hover:bg-slate-800'
              : 'bg-white/90 border-content-border text-slate-700 hover:border-brand-purple/50 hover:bg-white'
          }`}
        >
          {isDark ? (
            <Moon className="w-4 h-4 text-amber-300 fill-amber-300/30 transition-transform group-hover:rotate-12" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 fill-amber-500/30 transition-transform group-hover:rotate-45" />
          )}
          <span className="text-[10px] font-extrabold uppercase tracking-wider hidden sm:inline">
            {isDark ? 'Dark' : 'Light'}
          </span>
          <span className="text-[9px] font-mono font-bold text-brand-purple bg-brand-purple/10 px-1.5 py-0.5 rounded-lg border border-brand-purple/20 hidden md:inline">
            ⌘+⇧+D
          </span>
        </button>
      </div>
    </div>
  );
};
