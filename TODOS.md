# TODOS

## P2 — /baptism Program Page

**What:** Create a separate baptism program editor at `/baptism` route with its own form, preview, and print layout tailored to baptismal services.

**Why:** The current "Baptism" template reuses the sacrament meeting structure, which doesn't accurately represent a baptism program. A real baptism program has no sacrament ordinance, has baptism/confirmation steps, different music slots, and different prayer labels.

**Context:** User wants this as a separate page (not a mode within EditorApp) to avoid interfering with the existing sacrament meeting workflow. Most users login and the editor defaults to their current bulletin — a separate `/baptism` route keeps these concerns isolated.

**Shared components:** Header, Footer (via StaticPageLayout), themes, hymn search, i18n infrastructure, image selection, PDF export pipeline.

**New components needed:**
- `BaptismForm.tsx` — Form fields: candidate name, date, presiding authority, who performs baptism, who confirms, talks/speakers, musical numbers, prayers
- `BaptismPreview.tsx` — Web preview for baptism program
- `BaptismPrintLayout.tsx` — Print-optimized layout
- New `AgendaItem` types: `'baptism_ordinance'`, `'confirmation'`
- New `meetingType: 'baptism'` handling in shared code

**Effort:** L (human: ~1 week / CC: ~1-2 hours)
**Depends on:** StaticPageLayout component (ships in current PR)

---

## P3 — Split Monolithic supabase.ts

**What:** Split the 2,517-line `src/lib/supabase.ts` into separate service modules: `tokenService.ts`, `userService.ts`, `bulletinService.ts`, `imageService.ts`, plus a shared `supabaseClient.ts`.

**Why:** Single file managing all database operations makes it hard to navigate, review, and maintain. New contributors have to understand the entire file to modify any service.

**Context:** The file currently exports 5 service objects (tokenService, userService, bulletinService, imageService, profileSharingService is already separate). Each can be cleanly extracted since they have minimal cross-dependencies. The `robustService` and `retryOperation` helpers can go in a shared utility.

**Effort:** M (human: ~3 days / CC: ~30 min)
**Depends on:** Nothing — can be done anytime
**Risk:** Low — pure refactor, no behavior changes. Test coverage (added in current PR) provides safety net.
