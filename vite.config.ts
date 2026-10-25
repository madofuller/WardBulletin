import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: false, // Use existing dynamic manifest
      devOptions: {
        enabled: false,
      },
    }),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  test: {
    exclude: ['node_modules', '.claude', 'dist', 'e2e/**'],
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      input: {
        main: '/index.html',
        public: '/public.html',
      },
      output: {
        manualChunks(id) {
          // Editor and PDF - these should ONLY load for editor routes
          // Check before react to avoid circular dependencies
          if (id.includes('react-quill') || id.includes('quill')) {
            return 'editor';
          }
          
          if (id.includes('html2canvas') || id.includes('jspdf')) {
            return 'pdf';
          }
          
          // React and router - core dependencies
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/scheduler')) {
            return 'react-vendor';
          }
          
          // Supabase client
          if (id.includes('@supabase/supabase-js')) {
            return 'supabase';
          }
          
          // i18n core
          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'i18n-core';
          }
          
          // i18n locale files - split per locale
          if (id.includes('/locales/') && id.endsWith('.json')) {
            const match = id.match(/locales\/([^/]+)\.json/);
            if (match) {
              return `i18n-${match[1]}`;
            }
          }
          
          // Hymn data files
          if (id.includes('/data/hymns-')) {
            const match = id.match(/hymns-([^.]+)\.ts/);
            if (match) {
              return `hymns-${match[1]}`;
            }
          }
          
          // Children's songbook data files
          if (id.includes('/data/childrensSongbook-')) {
            const match = id.match(/childrensSongbook-([^.]+)\.ts/);
            if (match) {
              return `songs-${match[1]}`;
            }
          }
          
          // UI vendor libraries
          if (id.includes('react-helmet') || 
              id.includes('react-toastify') || 
              id.includes('@tanstack/react-query')) {
            return 'ui-vendor';
          }
          
          // Lucide icons
          if (id.includes('lucide-react')) {
            return 'icons';
          }
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
