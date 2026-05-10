import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    exclude: ['node_modules', '.claude', 'dist'],
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'editor': ['react-quill-new'],
          'pdf': ['html2canvas', 'jspdf'],
          'i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          'ui-vendor': ['react-helmet-async', 'react-toastify', '@tanstack/react-query'],
        },
      },
    },
  },
  server: {
    hmr: {
      clientPort: 5173,
    },
  },
});
