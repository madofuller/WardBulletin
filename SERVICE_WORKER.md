# Service Worker Documentation

## Overview
The app uses a service worker (via vite-plugin-pwa) for offline support and caching. This improves repeat visit performance and allows the last-viewed bulletin to work offline.

## Safety Guarantees

### 1. **New Deploys Activate Promptly**
- **Strategy**: `skipWaiting: true` + `clientsClaim: true`
- New service worker versions activate immediately
- Users get updates on next page load (no need to close all tabs)
- **Test**: Deploy build A, visit, deploy build B, refresh → should get B

### 2. **Editor & Auth Never Cached**
- Editor routes (`/`, `/profile/*`, etc.) serve index.html - always network-first
- Auth endpoints (`/auth/*`) use `NetworkOnly` handler - NEVER cached
- No auth tokens or private data stored in service worker cache
- **Protected endpoints**:
  - `/api/*` - denied from navigation fallback
  - `https://*.supabase.co/auth/*` - NetworkOnly, never cached

### 3. **Bulletin Updates Show Quickly**
- Public bulletin data uses `NetworkFirst` strategy
- Cache only used as offline fallback or when network is very slow (>10s)
- Short TTL: 3 minutes (down from initial 5min)
- Max 30 cached entries
- **Behavior**:
  - Online: Always fetches fresh data
  - Slow connection (>10s): Falls back to cache
  - Offline: Serves last-viewed bulletin from cache

### 4. **Printing Not Affected**
- Print routes (`/print/*`) excluded from navigation fallback
- Browser print dialog (`window.print()`) uses live DOM, not cached
- PR #171's PDF export unaffected

### 5. **Kill Switch Available**
If the service worker causes issues in production:

**Option 1: Emergency disable**
```bash
# Replace registerSW.js with unregister-sw.js content
cp public/unregister-sw.js dist/registerSW.js
# Deploy
```

**Option 2: Temporary disable**
1. Comment out `VitePWA` plugin in `vite.config.ts`
2. Rebuild and deploy
3. Service worker will remain but won't be registered for new visitors

**Option 3: Force unregister**
1. Serve `/unregister-sw.js` at the root
2. Add to index.html: `<script src="/unregister-sw.js"></script>`
3. Deploy - all users will unregister on next visit

## Cache Strategy Summary

| Resource Type | Strategy | TTL | Rationale |
|--------------|----------|-----|-----------|
| App shell (HTML/JS/CSS) | CacheFirst with auto-update | Long | Hashed assets, immutable |
| Public bulletin data | NetworkFirst | 3 minutes | Fresh data priority, offline fallback |
| Auth endpoints | NetworkOnly | Never cached | Security - no auth data cached |
| API routes | Excluded | N/A | Always dynamic |
| Print routes | Excluded | N/A | Don't interfere with printing |

## Testing Update Scenarios

### Test 1: New deployment activates
```bash
# Build A
npm run build
npm run preview
# Visit http://localhost:4173/test-ward
# Note service worker version in DevTools

# Build B (make a visible change)
# Edit src/public.ts - change "Ward Bulletin" to "Ward Bulletin v2"
npm run build
npm run preview
# Refresh page → should see "Ward Bulletin v2"
# Check DevTools → new service worker should be active
```

### Test 2: Offline support works
```bash
npm run preview
# Visit http://localhost:4173/test-ward
# Wait for content to load
# Open DevTools → Network → Set to "Offline"
# Refresh page → should still show bulletin (from cache)
```

### Test 3: Auth never cached
```bash
# Check in DevTools → Application → Cache Storage
# Look in all caches
# Should NOT see any URLs containing "/auth/"
```

### Test 4: Bulletin updates appear
```bash
# Simulate updated bulletin data
# Change bulletin content in Supabase
# Refresh public page → should see new data (network-first)
```

## Monitoring & Debugging

### Check Service Worker Status
1. Open DevTools → Application → Service Workers
2. See registration status, version, and scope
3. Can manually unregister for testing

### View Cached Data
1. Open DevTools → Application → Cache Storage
2. Expand cache names to see cached resources
3. Can manually delete caches for testing

### Console Logs
Service worker lifecycle events are logged:
- Registration
- Update available
- Activation
- Cache operations (in dev mode)

## Known Limitations

1. **Very old browsers**: Service workers not supported in IE11, older Safari
2. **Cache size**: Limited by browser storage quotas (typically 50MB-500MB)
3. **Update delay**: Users see updates on next visit (not real-time push)
4. **HTTP localhost**: Service workers only work on HTTPS (or localhost)

## References

- [vite-plugin-pwa docs](https://vite-pwa-org.netlify.app/)
- [Workbox strategies](https://developer.chrome.com/docs/workbox/modules/workbox-strategies/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
