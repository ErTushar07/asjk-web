import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useToast } from './ToastContext';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const toast = useToast();

  const [theme, setThemeState] = useState<Theme>(() => {
    // 1. Check local storage
    const saved = localStorage.getItem('asfjk_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    // 2. Check system preference
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const isDark = theme === 'dark';

  // Apply or remove 'dark' class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('asfjk_theme', theme);
  }, [theme, isDark]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const nextTheme = prev === 'light' ? 'dark' : 'light';
      toast.info(
        nextTheme === 'dark' ? 'Switched to Dark Mode 🌙' : 'Switched to Light Mode ☀️',
        'Theme Changed [Ctrl+Shift+D]'
      );
      return nextTheme;
    });
  }, [toast]);

  // Global Keyboard Shortcuts: Ctrl+Shift+D or Alt+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut when typing in input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Check Ctrl+Shift+D / Cmd+Shift+D or Alt+D
      const isCtrlShiftD = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd');
      const isAltD = e.altKey && (e.key === 'D' || e.key === 'd');

      if (isCtrlShiftD || isAltD) {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
