import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Plugin to inject build timestamp and cache version meta tags into HTML
const buildMetaPlugin = (): Plugin => ({
  name: 'build-meta-plugin',
  transformIndexHtml(html: string) {
    const buildTimestamp = new Date().toISOString();
    return html.replace(
      '</head>',
      `  <meta name="build-timestamp" content="${buildTimestamp}" />\n    <meta name="sw-version" content="asfjk-v4" />\n  </head>`
    );
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), buildMetaPlugin()],
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
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'pdf-libs';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('otpauth') || id.includes('pbkdf2') || id.includes('hash.js') || id.includes('dompurify')) {
              return 'crypto-vendor';
            }
            if (id.includes('xlsx')) {
              return 'excel-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
          }
        },
      },
    },
  },
});

