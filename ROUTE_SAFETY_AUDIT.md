# Route Safety Audit

## Purpose
Verify that the `/:slug` rewrite in `vercel.json` cannot capture real app routes, ensuring all application routes reach their correct entry points.

## Rewrite Order Analysis

The vercel.json rewrites are processed in order. The critical line is:
```json
{ "source": "/([a-z0-9_-]{1,50})", "destination": "/public.html" }
```

This matches single-segment paths (ward slugs) but must not capture app routes.

## All Application Routes

### From src/App.tsx

| Route Pattern | Description | Vercel Rewrite | Status |
|---------------|-------------|----------------|--------|
| `/` | Editor/home | Catch-all `/(.*) → /index.html` | ✅ Safe (root) |
| `/profile/:slug` | User profile editor | `/profile/:path* → /index.html` (line 49) | ✅ Protected BEFORE slug matcher |
| `/about` | About page | `/about → /index.html` (line 44) | ✅ Protected BEFORE slug matcher |
| `/how-to-use` | How to use guide | `/how-to-use → /index.html` (line 45) | ✅ Protected BEFORE slug matcher |
| `/contact` | Contact page | `/contact → /index.html` (line 46) | ✅ Protected BEFORE slug matcher |
| `/guide/create-ward-bulletin` | Guide page | `/guide/:path* → /index.html` (line 50) | ✅ Protected BEFORE slug matcher |
| `/guide/bulletin-templates` | Templates guide | `/guide/:path* → /index.html` (line 50) | ✅ Protected BEFORE slug matcher |
| `/guide/sacrament-meeting-program` | Program guide | `/guide/:path* → /index.html` (line 50) | ✅ Protected BEFORE slug matcher |
| `/baptism` | Baptism editor root | `/baptism → /index.html` (line 47) | ✅ Protected BEFORE slug matcher |
| `/baptism/:slug` | Baptism program view | `/baptism/:path* → /index.html` (line 48) | ✅ Protected BEFORE slug matcher |
| `/invite/:token` | Profile invitation | `/invite/:path* → /index.html` (line 51) | ✅ Protected BEFORE slug matcher |
| `/reset-password` | Password reset | `/reset-password → /index.html` (line 49) | ✅ Protected BEFORE slug matcher |
| `/submit/:slug` | Announcement submission | `/submit/:path* → /index.html` (line 52) | ✅ Protected BEFORE slug matcher |
| `/:slug` | **Public bulletin view** | `/([a-z0-9_-]{1,50}) → /public.html` (line 53) | ⚠️ **THIS IS THE SLUG MATCHER** |

### Static Files & APIs

| Route Pattern | Description | Vercel Rewrite | Status |
|---------------|-------------|----------------|--------|
| `/api/*` | API endpoints | `/api/(.*) → /api/$1` (line 38) | ✅ Protected BEFORE slug matcher |
| `/sitemap.xml` | Sitemap | `/sitemap.xml → /sitemap.xml` (line 39) | ✅ Protected BEFORE slug matcher |
| `/robots.txt` | Robots.txt | `/robots.txt → /robots.txt` (line 40) | ✅ Protected BEFORE slug matcher |
| `/site.webmanifest` | Web app manifest | `/site.webmanifest → /site.webmanifest` (line 41) | ✅ Protected BEFORE slug matcher |
| `/llms.txt` | AI/LLM info | `/llms.txt → /llms.txt` (line 42) | ✅ Protected BEFORE slug matcher |
| `/assets/*` | Build assets | Static file serving | ✅ Served before rewrites |
| `/sw.js` | Service worker | Static file serving | ✅ Served before rewrites |
| `/workbox-*.js` | Workbox SW | Static file serving | ✅ Served before rewrites |
| `/registerSW.js` | SW registration | Static file serving | ✅ Served before rewrites |
| `/unregister-sw.js` | SW kill switch | Static file serving | ✅ Served before rewrites |
| `/favicon.ico` | Favicon | Static file serving | ✅ Served before rewrites |
| `/favicon.svg` | SVG favicon | Static file serving | ✅ Served before rewrites |
| `/favicon-16x16.png` | 16px favicon | Static file serving | ✅ Served before rewrites |
| `/favicon-32x32.png` | 32px favicon | Static file serving | ✅ Served before rewrites |
| `/og-image.png` | OpenGraph image | Static file serving | ✅ Served before rewrites |

## Slug Pattern Constraints

The slug matcher uses regex: `/([a-z0-9_-]{1,50})`

### What it matches:
- ✅ `/my-ward` (typical ward slug)
- ✅ `/1st-ward` (with numbers)
- ✅ `/first_ward` (with underscore)
- ✅ `/123` (numeric only)
- ✅ `/a` (minimum length 1)

### What it DOES NOT match (and thus won't hijack):
- ❌ `/About` (uppercase - becomes 404 or catch-all)
- ❌ `/my-ward/extra` (multi-segment - catch-all)
- ❌ `/profile/user` (multi-segment with protected prefix)
- ❌ `/` (root - no segment)
- ❌ `/api/something` (protected earlier)
- ❌ `/.well-known/` (dot - not in charset)
- ❌ Paths with special chars not in `[a-z0-9_-]`

## Reserved Words Check

The following words are explicitly reserved and protected BEFORE the slug matcher:
- `about`
- `how-to-use` 
- `contact`
- `baptism`
- `reset-password`
- `profile` (as prefix)
- `guide` (as prefix)
- `invite` (as prefix)
- `submit` (as prefix)
- `api` (as prefix)

## Summary

| Category | Total Routes | Protected | Vulnerable | Status |
|----------|--------------|-----------|------------|--------|
| **App Routes** | 13 | 13 | 0 | ✅ All safe |
| **Static Files/APIs** | 15 | 15 | 0 | ✅ All safe |
| **TOTAL** | **28** | **28** | **0** | ✅ **100% SAFE** |

## Conclusion

✅ **ROUTE CONFIGURATION IS SAFE**

All application routes and static resources are properly protected. The `/:slug` matcher only captures single-segment lowercase alphanumeric paths that don't match any reserved words or protected prefixes.

### How it works:
1. Vercel processes rewrites **in order**
2. All reserved routes are matched BEFORE the slug matcher
3. The slug pattern is restrictive (lowercase, 1-50 chars, limited charset)
4. Any path not matching earlier rules falls through to catch-all → /index.html

### Testing recommendations:
- ✅ Try accessing `/about` → should show About page (React app)
- ✅ Try accessing `/test-ward` → should show public bulletin (public.html entry)
- ✅ Try accessing `/api/manifest` → should return API response
- ✅ Try accessing `/assets/main-abc123.js` → should serve asset
- ✅ Try accessing `/About` (uppercase) → should hit catch-all (may 404 or show editor)

### Edge cases:
- Users cannot create profiles with reserved slugs (validated client-side)
- Uppercase slugs don't match the pattern (case-sensitive regex)
- Multi-segment paths are handled by catch-all
- Special characters not in `[a-z0-9_-]` don't match

**No route conflicts detected. QR code URLs remain stable.**
