import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // For print-test build, stub out Supabase
  const isTest = process.env.VITE_PRINT_TEST === 'true';
  
  return {
    plugins: [react()],
    test: {
      exclude: ['node_modules', '.claude', 'dist', 'e2e/**'],
    },
    resolve: {
      alias: isTest ? {
        // Stub Supabase for print tests
        './lib/supabase': path.resolve(__dirname, 'src/lib/supabase.test-stub.ts'),
        '../lib/supabase': path.resolve(__dirname, 'src/lib/supabase.test-stub.ts'),
      } : {},
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    build: {
      rollupOptions: {
        input: {
          main: 'index.html',
          printTest: 'print-test.html',
        },
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
  };
});
