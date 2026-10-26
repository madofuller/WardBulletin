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
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        globIgnores: [
          '**/editor-*.js',
          '**/EditorApp-*.js',
          '**/pdf-*.js',
          '**/stats.html',
          '**/BaptismEditor-*.js',
        ],
        navigateFallbackDenylist: [
          /^\/api\//,  // Never cache API routes
          /^\/print/,  // Don't interfere with printing
        ],
        runtimeCaching: [
          {
            urlPattern: /\/assets\/.*\.(?:js|css)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'hashed-assets',
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 365 * 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/rpc\/get_public_bulletin_by_slug/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-public-rpc',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 3 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            // Public bulletins - network first, cache fallback
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/(users|bulletins|tokens)/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-public-data',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 3 * 60, // 3 minutes - short TTL for fresh data
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 10, // Fallback to cache after 10s
            },
          },
          {
            // Auth endpoints - NEVER cache
            urlPattern: /^https:\/\/.*\.supabase\.co\/auth\/.*$/i,
            handler: 'NetworkOnly',
          },
        ],
      },
      manifest: false, // Use existing dynamic manifest
      injectManifest: {
        injectionPoint: undefined,
      },
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
    {
      name: 'hashed-asset-cache-headers',
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && /\/assets\/[^?]+\.(js|css)$/.test(req.url)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
          next();
        });
      },
    },
  ],
  test: {
    exclude: ['node_modules', '.claude', 'dist', 'e2e/**'],
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      input: '/index.html',
      output: {
        manualChunks(id) {
          // Do not pin editor/pdf/supabase into named chunks. Vite parks
          // its preload helper in a shared named chunk, which previously
          // forced those libraries onto the public /:slug graph.
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'react-vendor';
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
          if (id.includes('/data/hymns.ts') || id.includes('/data/childrensSongbook.ts')) {
            return 'hymns-en';
          }
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
