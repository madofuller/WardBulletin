import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(() => {
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
    plugins: [
      react(),
      stubSupabasePlugin,
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
            /^\/api\//,
            /^\/print/,
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
              urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/(users|bulletins|tokens)/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-public-data',
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
              urlPattern: /^https:\/\/.*\.supabase\.co\/auth\/.*$/i,
              handler: 'NetworkOnly',
            },
          ],
        },
        manifest: false,
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
    resolve: {
      alias: isTest
        ? {
            '@/lib/supabase': stubPath,
            './supabase': stubPath,
            './lib/supabase': stubPath,
            '../lib/supabase': stubPath,
          }
        : {},
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          printTest: path.resolve(__dirname, 'print-test.html'),
        },
        output: {
          manualChunks(id: string) {
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/scheduler/')
            ) {
              return 'react-vendor';
            }
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n-core';
            }
            if (id.includes('/locales/') && id.endsWith('.json')) {
              const match = id.match(/locales\/([^/]+)\.json/);
              if (match) return `i18n-${match[1]}`;
            }
            if (id.includes('/data/hymns.ts') || id.includes('/data/childrensSongbook.ts')) {
              return 'hymns-en';
            }
            if (id.includes('/data/hymns-')) {
              const match = id.match(/hymns-([^.]+)\.ts/);
              if (match) return `hymns-${match[1]}`;
            }
            if (id.includes('/data/childrensSongbook-')) {
              const match = id.match(/childrensSongbook-([^.]+)\.ts/);
              if (match) return `songs-${match[1]}`;
            }
            if (
              id.includes('react-helmet') ||
              id.includes('react-toastify') ||
              id.includes('@tanstack/react-query')
            ) {
              return 'ui-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
          },
        },
      },
    },
    server: isTest
      ? { hmr: false }
      : {
          hmr: {
            clientPort: 5173,
          },
        },
  };
});
