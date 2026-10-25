import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // For print-test build, stub out Supabase
  const isTest = process.env.VITE_PRINT_TEST === 'true';
  const stubPath = path.resolve(__dirname, 'src/lib/supabase.test-stub.ts');

  const stubSupabasePlugin = {
    name: 'print-test-stub-supabase',
    enforce: 'pre' as const,
    resolveId(source: string) {
      if (!isTest) return null;
      if (source.includes('supabase.test-stub')) return null;
      if (source === '@supabase/supabase-js') return null;
      if (
        source === '@/lib/supabase' ||
        source === './supabase' ||
        source === '../lib/supabase' ||
        source === './lib/supabase' ||
        source.endsWith('/lib/supabase') ||
        source.endsWith('/lib/supabase.ts')
      ) {
        return stubPath;
      }
      return null;
    },
  };
  
  return {
    plugins: [react(), stubSupabasePlugin],
    test: {
      exclude: ['node_modules', '.claude', 'dist', 'e2e/**'],
    },
    resolve: {
      alias: isTest ? {
        // Stub Supabase for print tests
        // Match the import paths used in the codebase
        '@/lib/supabase': stubPath,
        './supabase': stubPath,
        './lib/supabase': stubPath,
        '../lib/supabase': stubPath,
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
    server: isTest
      ? {
          hmr: false,
        }
      : {
          hmr: {
            clientPort: 5173,
          },
        },
  };
});
