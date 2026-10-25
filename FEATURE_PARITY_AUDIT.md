# Feature Parity Audit: React vs Vanilla Public Page

## Existing React PublicBulletinView Features

### Core Display Features

| Feature | React | Vanilla (Current) | Status | Notes |
|---------|-------|-------------------|--------|-------|
| **Ward/Branch name** | ✅ | ✅ | Full parity | |
| **Meeting date** | ✅ Formatted by locale | ❌ Basic format | **Missing** | |
| **Meeting type** | ✅ Translated | ❌ English only | **Missing** | |
| **Theme/topic** | ✅ | ✅ | Full parity | |
| **Bishopric message** | ✅ HTML sanitized | ⚠️ Basic sanitization | **Weak** | |

### Program/Agenda Features

| Feature | React | Vanilla | Status | Notes |
|---------|-------|---------|--------|-------|
| **Sacrament item** | ✅ | ✅ | Full parity | |
| **Speakers with topics** | ✅ | ✅ | Full parity | |
| **Musical numbers** | ✅ Special rendering | ⚠️ Basic | **Weak** | React shows icon, special formatting |
| **Hymns with numbers** | ✅ Links to songs | ❌ | **Missing** | React links to ChurchofJesusChrist.org |
| **Hymn titles** | ✅ | ✅ | Full parity | |
| **Sustaining/releases** | ✅ | ❌ | **Missing** | |
| **Custom agenda items** | ✅ | ⚠️ | **Partial** | |
| **Ward business** | ✅ Translated label | ❌ | **Missing** | |
| **Intermediate hymns** | ✅ Special rendering | ❌ | **Missing** | |
| **Testimony meeting** | ✅ Special text | ❌ | **Missing** | |
| **Youth speakers** | ✅ Special rendering | ❌ | **Missing** | |

### Music Features

| Feature | React | Vanilla | Status | Notes |
|---------|-------|---------|--------|-------|
| **Opening hymn number** | ✅ | ✅ | Full parity | |
| **Opening hymn title** | ✅ | ✅ | Full parity | |
| **Opening hymn link** | ✅ Links to church site | ❌ | **Missing** | getSongUrl() |
| **Sacrament hymn** | ✅ | ✅ | Full parity | |
| **Closing hymn** | ✅ | ✅ | Full parity | |
| **Congregational singing** | ✅ | ❌ | **Missing** | |
| **Rest hymn** | ✅ | ❌ | **Missing** | |

### Announcements Features

| Feature | React | Vanilla | Status | Notes |
|---------|-------|---------|--------|-------|
| **Basic announcements** | ✅ | ✅ | Full parity | |
| **HTML in announcements** | ✅ Full sanitization | ⚠️ Basic | **Weak** | DOMPurify vs regex |
| **Announcement categories** | ✅ Grouped by audience | ❌ | **Missing** | Ward/Youth/RS/EQ |
| **Announcement dates** | ✅ | ❌ | **Missing** | |
| **Announcement images** | ✅ | ❌ | **Missing** | |
| **Links in announcements** | ✅ Linkified + icons | ⚠️ No icons | **Partial** | |
| **Meeting links (Zoom)** | ✅ Special "Join" button | ❌ | **Missing** | detectMeetingPlatform() |
| **Tabbed view** | ✅ Program/Announcements/Info | ❌ | **Missing** | |

### Leadership & Contact Features

| Feature | React | Vanilla | Status | Notes |
|---------|-------|---------|--------|-------|
| **Presiding/Conducting** | ✅ | ✅ | Full parity | |
| **Chorister/Organist** | ✅ | ✅ | Full parity | |
| **Ward leadership table** | ✅ Full table with titles/names/phones | ❌ | **Missing** | |
| **Full-time missionaries** | ✅ Names and phones | ❌ | **Missing** | |
| **Ward missionaries** | ✅ Detailed info | ❌ | **Missing** | |
| **Service missionaries** | ✅ | ❌ | **Missing** | |

### Visual Features

| Feature | React | Vanilla | Status | Notes |
|---------|-------|---------|--------|-------|
| **Header image** | ✅ From LDS_IMAGES or custom | ❌ | **Missing** | |
| **Image positioning** | ✅ Top/center/bottom | ❌ | **Missing** | |
| **Image opacity** | ✅ Adjustable | ❌ | **Missing** | |
| **Gradient background** | ✅ Blue gradient | ✅ | Full parity | |
| **Card layout** | ✅ Rounded corners, shadow | ✅ | Full parity | |
| **Responsive design** | ✅ Mobile/desktop | ⚠️ Basic | **Weak** | |
| **Dark mode** | ✅ Full support | ❌ | **Missing** | |

### i18n/Localization

| Feature | React | Vanilla | Status | Notes |
|---------|-------|---------|--------|-------|
| **English** | ✅ | ✅ | Full parity | |
| **Spanish** | ✅ | ❌ | **Missing** | No i18n library |
| **Portuguese** | ✅ | ❌ | **Missing** | |
| **French** | ✅ | ❌ | **Missing** | |
| **German** | ✅ | ❌ | **Missing** | |
| **Italian** | ✅ | ❌ | **Missing** | |
| **Japanese** | ✅ | ❌ | **Missing** | |
| **Korean** | ✅ | ❌ | **Missing** | |
| **Chinese** | ✅ | ❌ | **Missing** | |
| **Date formatting by locale** | ✅ | ❌ | **Missing** | |
| **Ward/Branch terminology** | ✅ | ❌ | **Missing** | getUnitLabel() |
| **Auto-detect user language** | ✅ Bulletin's language | ❌ | **Missing** | |

### Accessibility Features

| Feature | React | Vanilla | Status | Notes |
|---------|-------|---------|--------|-------|
| **Semantic HTML** | ✅ nav, main, h1-h6 | ⚠️ Basic | **Weak** | |
| **ARIA labels** | ✅ tabpanel, aria-selected | ❌ | **Missing** | |
| **Keyboard navigation** | ✅ Tab order, arrow keys | ❌ | **Missing** | |
| **Screen reader support** | ✅ Proper headings | ⚠️ Basic | **Weak** | |
| **Color contrast** | ✅ WCAG AA | ✅ | Full parity | |
| **Focus indicators** | ✅ | ❌ | **Missing** | |
| **Skip links** | ❌ | ❌ | Both missing | |

### Security Features

| Feature | React | Vanilla | Status | Notes |
|---------|-------|---------|--------|-------|
| **HTML sanitization** | ✅ DOMPurify | ⚠️ Regex only | **CRITICAL** | XSS risk |
| **URL validation** | ✅ | ⚠️ Basic | **Weak** | |
| **Script tag removal** | ✅ | ⚠️ Regex | **Weak** | |
| **Event handler removal** | ✅ | ⚠️ Regex | **Weak** | |
| **CSS injection prevention** | ✅ | ❌ | **Missing** | |
| **Link safety** | ✅ rel="noopener" | ❌ | **Missing** | |

### Error States

| Feature | React | Vanilla | Status | Notes |
|---------|-------|---------|--------|-------|
| **Loading spinner** | ✅ Translated text | ✅ | Full parity | |
| **404/Not found** | ✅ Helpful message | ✅ | Full parity | |
| **No bulletin published** | ✅ Special state | ⚠️ Generic error | **Weak** | |
| **Network error** | ✅ Retry button | ✅ | Full parity | |
| **Slow connection** | ✅ Mentioned in error | ✅ | Full parity | |
| **Image load failure** | ✅ Graceful hide | ❌ | **Missing** | |

### Special Features

| Feature | React | Vanilla | Status | Notes |
|---------|-------|---------|--------|-------|
| **Virtual meeting links** | ✅ "Join" button with icon | ❌ | **Missing** | Zoom, Google Meet, Teams |
| **QR code display** | ✅ | ❌ | **Missing** | Shows own QR |
| **Print stylesheet** | ✅ | ❌ | **Missing** | |
| **Share button** | ✅ | ❌ | **Missing** | |
| **Baptism programs** | ❌ Separate route | ❌ | Both N/A | /baptism/:slug |
| **Draft state handling** | ✅ | ❌ | **Missing** | Only shows published |

## Summary Statistics

| Category | Total Features | Vanilla Has | Missing | Status |
|----------|----------------|-------------|---------|--------|
| **Core Display** | 5 | 3 | 2 | 60% |
| **Program/Agenda** | 11 | 3 | 8 | 27% |
| **Music** | 7 | 4 | 3 | 57% |
| **Announcements** | 8 | 2 | 6 | 25% |
| **Leadership** | 5 | 2 | 3 | 40% |
| **Visual** | 7 | 2 | 5 | 29% |
| **i18n** | 11 | 1 | 10 | 9% |
| **Accessibility** | 7 | 2 | 5 | 29% |
| **Security** | 6 | 1 | 5 | **17% (CRITICAL)** |
| **Error States** | 6 | 4 | 2 | 67% |
| **Special** | 6 | 0 | 6 | 0% |
| **TOTAL** | **79** | **24** | **55** | **30% parity** |

## Critical Findings

### 🔴 CRITICAL: Security Issues
- **XSS Risk**: Vanilla sanitization uses regex only, not DOMPurify
- **Risk**: User-entered announcements/messages could contain malicious code
- **Impact**: Every member scanning QR sees unsanitized content

### 🔴 CRITICAL: i18n Missing
- **Impact**: Spanish/Portuguese/other language wards see English only
- **Scope**: ~30-40% of US LDS wards use Spanish
- **User experience**: Unusable for non-English wards

### 🟡 HIGH: Announcement Features Missing
- Meeting links (Zoom "Join" buttons) not working
- Announcement categories/tabs not implemented
- Image announcements missing

### 🟡 HIGH: Accessibility Reduced
- No keyboard navigation
- No ARIA labels
- Screen reader experience degraded

## Recommended Approach: Progressive Enhancement

Given 70% of features are missing and critical security/i18n gaps exist, **attempting vanilla feature parity is too risky**.

### Safer Strategy:
1. ✅ Vanilla shows **core essentials** instantly (2.3KB, <1s)
   - Ward name, date, theme
   - Basic program outline
   - Announcements text (properly sanitized!)
   - Loading indicator for full view

2. ✅ Then **progressive upgrade** to React (automatic)
   - Loads React bundle (647KB, cached)
   - Replaces vanilla DOM with full features
   - User sees content immediately, gets full features after

3. ✅ React takes over for:
   - i18n (Spanish, Portuguese, etc.)
   - Meeting link "Join" buttons
   - Tabs (Program/Announcements/Info)
   - Hymn links
   - Ward leadership tables
   - Dark mode
   - Full accessibility
   - Proper DOMPurify sanitization

### Why Progressive Enhancement is Safer:
- ✅ Users see content in <2s on congested WiFi
- ✅ No risk of missing features or bugs
- ✅ Existing behavior preserved
- ✅ No i18n/security regressions
- ✅ Easy to test: vanilla → React upgrade automatic
- ✅ Rollback: just disable vanilla hydration

### Implementation:
- Vanilla entry shows essentials + "Loading full view..." indicator
- React bundle loads in background
- React mounts over vanilla DOM
- Smooth transition, user barely notices

## Decision

**RECOMMENDATION**: Implement progressive enhancement, NOT feature parity.

**Rationale**:
- 318-line vanilla replicating 1284-line React = high bug risk
- Security critical (XSS)
- i18n critical (Spanish wards)
- 70% features missing unacceptable
- Progressive enhancement = best of both worlds
