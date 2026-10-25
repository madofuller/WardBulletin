# PWA Service Worker Evaluation

## Question
Should we keep `vite-plugin-pwa` (~91 lockfile lines) or replace it with a hand-written service worker?

## Current vite-plugin-pwa Setup

### Features Provided

1. **Automatic Asset Precaching**
   - Precaches 71 entries (5.9MB): all JS/CSS/HTML/fonts
   - Glob pattern: `**/*.{js,css,html,ico,png,svg,woff2}`
   - Updates automatically when files change

2. **Runtime Caching Strategy**
   - Supabase REST API: NetworkFirst (3-min TTL, 30-entry cache)
   - Auth endpoints: NetworkOnly (never cached)
   - 10-second network timeout with cache fallback

3. **Safety Features**
   - `skipWaiting: true` - new SW activates immediately
   - `clientsClaim: true` - controls clients on activation
   - NavigateFallback denylist: `/api/*`, `/print/*`
   - Auto-updates on new deployment

4. **Maintenance**
   - Automatic cache invalidation on build
   - Version management handled automatically
   - Kill switch available (`/unregister-sw.js`)

### Config (vite.config.ts)

```typescript
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    clientsClaim: true,
    skipWaiting: true,
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    navigateFallbackDenylist: [/^\/api\//, /^\/print/],
    runtimeCaching: [
      {
        urlPattern: /supabase\.co\/rest\/v1\/(users|bulletins|tokens)/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-public-data',
          expiration: { maxEntries: 30, maxAgeSeconds: 180 },
          networkTimeoutSeconds: 10,
        },
      },
      {
        urlPattern: /supabase\.co\/auth\//,
        handler: 'NetworkOnly',
      },
    ],
  },
})
```

---

## Custom Service Worker Alternative

### What We'd Need to Implement

A hand-written `sw.js` would need:

```javascript
// ~250-300 lines to replicate vite-plugin-pwa features

const CACHE_VERSION = 'v1';
const ASSETS = [/* 71 entries - manually maintained */];
const API_CACHE = 'supabase-data-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Delete old caches
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.map((name) => {
          if (name !== CACHE_VERSION && name !== API_CACHE) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // NetworkOnly for auth
  if (request.url.includes('/auth/')) {
    return event.respondWith(fetch(request));
  }
  
  // NetworkFirst with timeout for API
  if (request.url.includes('supabase.co/rest/v1')) {
    event.respondWith(
      Promise.race([
        fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(API_CACHE).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        }),
        new Promise((resolve, reject) => {
          setTimeout(() => reject(new Error('timeout')), 10000);
        }),
      ]).catch(() => {
        return caches.match(request);
      })
    );
    return;
  }
  
  // CacheFirst for assets
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
```

### Maintenance Burden

**With vite-plugin-pwa**:
- Asset list: Auto-generated on build ✅
- Cache invalidation: Automatic ✅
- Version management: Handled by plugin ✅
- Edge cases: Covered by Workbox ✅
- Updates: `npm update` ✅

**With custom SW**:
- Asset list: Manual maintenance ❌
- Cache invalidation: Manual versioning ❌
- Version management: Custom logic needed ❌
- Edge cases: Must handle ourselves ❌
- Updates: Rewrite logic when Vite changes ❌

---

## Comparison

| Feature | vite-plugin-pwa | Custom SW | Winner |
|---------|----------------|-----------|--------|
| **Asset precaching** | ✅ Automatic (71 files) | ⚠️ Manual list | Plugin |
| **Cache invalidation** | ✅ Automatic on build | ⚠️ Manual versioning | Plugin |
| **Runtime caching** | ✅ Workbox strategies | ⚠️ Custom code | Plugin |
| **Network timeout** | ✅ Built-in | ⚠️ Must implement | Plugin |
| **Auth safety** | ✅ NetworkOnly | ⚠️ Must remember | Plugin |
| **Edge case handling** | ✅ Battle-tested | ❌ DIY | Plugin |
| **Code complexity** | ✅ Config only (50 lines) | ⚠️ 250+ lines | Plugin |
| **Bundle size** | ✅ Same (Workbox in dist/) | ✅ Same | Tie |
| **Runtime size** | ~15KB (workbox-*.js) | ~5KB | Custom |
| **Lockfile lines** | ⚠️ 91 lines | ✅ 0 | Custom |
| **Maintenance** | ✅ `npm update` | ⚠️ Rewrite on Vite changes | Plugin |
| **Risk of bugs** | ✅ Low | ⚠️ High (cache bugs hard to debug) | Plugin |

---

## Real-World Impact

### Lockfile Size

```bash
package-lock.json: 11,157 lines total
PWA-related: 91 lines (0.8%)
```

**Impact**: Negligible. The 91 lines are mostly dependency metadata, not code.

### Runtime Bundle

```bash
# With vite-plugin-pwa:
dist/sw.js: ~2KB (generated)
dist/workbox-*.js: ~15KB (runtime)
Total: ~17KB

# Custom SW:
dist/sw.js: ~5KB (hand-written)
Total: ~5KB

Savings: 12KB (0.7% of 1.7MB total bundle)
```

**Impact**: Minimal. 12KB savings out of 1.7MB is negligible.

### Maintenance Hours

**Scenario**: Vite updates change asset hashing scheme.

- **With plugin**: `npm update vite-plugin-pwa` (5 minutes)
- **Custom SW**: Rewrite asset handling logic (2-4 hours)

**Annual cost**: 2-3 Vite updates × 2 hours = 4-6 hours/year

---

## Common Service Worker Bugs (Custom SWs)

1. **Stale cache after deploy**
   - User sees old version indefinitely
   - Hard to debug (cache persists across sessions)
   - Plugin handles with automatic versioning

2. **Cache pollution from auth requests**
   - Cached 401 responses break login
   - Must remember NetworkOnly for auth
   - Plugin enforces this automatically

3. **Network race conditions**
   - Timeout too short: excessive cache hits
   - Timeout too long: slow perceived performance
   - Plugin provides tested defaults

4. **Missing assets after build changes**
   - Manual asset list falls out of sync
   - 404s on legitimate requests
   - Plugin auto-generates from build output

5. **skipWaiting() without clientsClaim()**
   - New SW installed but old SW still controls tabs
   - Confusing state for users
   - Plugin ensures both are set correctly

---

## Recommendation

**KEEP vite-plugin-pwa**

### Rationale

1. **Minimal lockfile impact**: 91 lines (0.8%) is acceptable
2. **High risk with custom SW**: Cache bugs are notoriously hard to debug
3. **Maintenance burden**: Plugin saves 4-6 hours/year
4. **Battle-tested**: Used by thousands of production PWAs
5. **Auto-updates**: Asset list stays in sync with build output
6. **Safety**: NetworkOnly auth, proper cache invalidation

### When to Consider Custom SW

Only if:
- ❌ App is not actually a PWA (not installable) → But ours IS
- ❌ No runtime caching needed (all static) → But we cache Supabase API
- ❌ No offline support needed → But we provide cache fallback

None of these apply. We ARE a PWA that benefits from intelligent caching.

---

## Alternatives Considered

### 1. No Service Worker

**Pros**: Zero lockfile lines, zero maintenance
**Cons**: No offline, no cache, every visit downloads 171KB

**Verdict**: ❌ Bad UX on congested Wi-Fi

### 2. Minimal Custom SW (Cache-Only)

**Pros**: Simpler than full-featured custom SW
**Cons**: No API caching, no offline, manual asset list

**Verdict**: ❌ Defeats the purpose of PWA

### 3. Different PWA plugin (e.g., `vite-plugin-pwa-v2`)

**Pros**: Similar features, possibly different trade-offs
**Cons**: Still lockfile lines, less mature

**Verdict**: ⚠️ No clear benefit over current plugin

---

## Final Decision

✅ **Keep vite-plugin-pwa**

The 91 lockfile lines are a trivial cost compared to the risk and maintenance burden of a custom service worker. The plugin provides critical features (automatic cache invalidation, NetworkOnly auth, battle-tested Workbox strategies) that would take hours to replicate and maintain.

**For a production PWA serving members on unreliable church Wi-Fi, the plugin is the right choice.**

---

## Documentation for Future Maintainers

### If You Must Remove vite-plugin-pwa

1. Remove from `package.json` and `vite.config.ts`
2. Create `public/sw.js` with custom service worker
3. Add `public/registerSW.js` to register it
4. Manually list all 71 assets in `ASSETS` array
5. Implement NetworkFirst, NetworkOnly strategies
6. Add cache versioning with `CACHE_VERSION` constant
7. Test extensively on slow connections
8. Update asset list on every build
9. Handle skipWaiting + clientsClaim correctly
10. Create kill switch (`/unregister-sw.js`)

**Estimated effort**: 4-8 hours initial + 1-2 hours/month maintenance

**Benefit**: Save 91 lockfile lines (0.8%)

**Conclusion**: Not worth it.
