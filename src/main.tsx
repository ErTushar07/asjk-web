import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <DatabaseProvider>
            <ToastProvider>
              <ThemeProvider>
                <App />
              </ThemeProvider>
            </ToastProvider>
          </DatabaseProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>
);

// Register service worker for offline support & PWA caching
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.debug('Service Worker registration skipped:', err);
    });
  });
}

