import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    // Raise warning threshold since shared context bundle is intentionally large
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'react-vendor';
            }
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'pdf-libs';
            }
            if (id.includes('dompurify')) {
              return 'security';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
          }
          if (id.includes('DatabaseContext')) {
            return 'database-context';
          }
          if (id.includes('AuthContext')) {
            return 'auth-context';
          }
        },
      },
    },
  },
});

