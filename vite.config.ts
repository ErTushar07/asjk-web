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
        manualChunks: {
          // Core React runtime — cached aggressively
          'react-vendor': ['react', 'react-dom'],
          // Heavy PDF & canvas libs — loaded only when needed
          'pdf-libs': ['jspdf', 'html2canvas'],
          // DOMPurify security lib
          'security': ['dompurify'],
          // Lucide icons (large icon tree)
          'icons': ['lucide-react'],
        },
      },
    },
  },
});

