---
title: 'Redesign MFC Score Builder page layout for breathing room and clarity'
type: 'feature'
created: '2026-05-15'
status: 'done'
context: []
baseline_commit: '2d273a10677401db86cbd521000e72fecff1e320'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The current page layout compresses too much content into a single card hierarchy, making the CSV preparation section feel cramped and cut off. The biceps emoji in the hero event grid doesn't clearly represent the events. Buttons lack cursor styling, and the overall flow feels rushed rather than inviting.

**Approach:** Restructure `app/pages/index.vue` to use a multi-section, breathing-room layout: separate hero, expandable CSV guidance section with full column details, prominent upload area, and polished results view. Replace generic emoji with meaningful icons, add cursor styling to all interactive elements, and preserve all data flow and functionality.

## Boundaries & Constraints

**Always:**
- Preserve all CSV parsing, scoring, and export logic — only UI/UX changes
- Keep MFC blue branding in hero section; use blue and neutral colors outside hero
- Maintain mobile responsiveness (mobile-first design patterns)
- All buttons and clickable elements must have `cursor-pointer` class
- No animations or performance degradation
- Expand CSV prep section with full table preview and column descriptions visible by default (not hidden)

**Ask First:**
- None — scope is UI layout and polish only

**Never:**
- Don't change scoring, parsing, or export logic
- Don't modify branding colors or logo treatment (defer logo changes to separate task)
- Don't add new dependencies or change component structure
- Don't require backend changes or new API calls

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| **Hero section displays** | User lands on homepage | Hero with headline, tagline, event grid (simplified icons), clear CTA button | N/A |
| **CSV prep expanded** | User scrolls past hero | CSV section shows full table with all columns visible, column descriptions list, download + view buttons | N/A |
| **Upload area prominent** | User sees main content | Upload card is large, centered, with file picker button and error zone | Parse error shows as alert |
| **Results display** | User uploads valid CSV | Results table shows rank, name, total (blue), event columns with scores; export buttons have cursor styling | N/A |

</frozen-after-approval>

## Code Map

- `app/pages/index.vue` -- Main page; primary redesign target
- `app/utils/mfc/csv.ts` -- CSV parsing (unchanged)
- `app/utils/mfc/score.ts` -- Scoring logic (unchanged)

## Tasks & Acceptance

**Execution:**

- [ ] `app/pages/index.vue` -- Restructure hero section to remove overcrowded event grid; use simpler event names with meaningful icons (e.g., `i-lucide-move-vertical` for pull-ups, not 💪)
- [ ] `app/pages/index.vue` -- Expand CSV preparation section: show full table with all 17 columns, display all column descriptions inline (not in a separate list), add breathing room between sections
- [ ] `app/pages/index.vue` -- Add `cursor-pointer` class to all `UButton` elements (hero CTA, download, upload, export buttons)
- [ ] `app/pages/index.vue` -- Simplify upload area: larger card with centered file picker, clear error messaging
- [ ] `app/pages/index.vue` -- Polish results view: maintain table layout, ensure proper spacing, verify export buttons are clickable

**Acceptance Criteria:**

- Given a non-technical user visits the homepage, when they view the page, then they see a clear hero section with event names, a prominent "Upload CSV" CTA, and breathing room for scanning
- Given the user scrolls to the CSV prep section, when they see it, then they view a full column table without truncation, complete column descriptions inline, and buttons with visible cursor styling
- Given the user uploads a CSV and views results, when they interact with export buttons, then they see cursor change to pointer and can download their data
- Given the page is mobile, when viewed on small screens, then all sections stack vertically with proper spacing and text remains readable
- Given an upload fails, when the user sees an error, then the error alert is clear and buttons remain interactive

## Design Notes

**Layout philosophy:** Multi-section page with vertical breathing room. Each section (hero, CSV prep, upload, results) is visually separated and self-contained.

**Hero changes:**
- Keep headline, tagline, and CTA button prominent
- Replace compressed event grid with event names only (no emoji grid); alternatively, use a 2-row list of event names

**CSV section:** Expand from card to full-width content with visible table and descriptions. No "View Sample" toggle — show everything by default.

**Upload section:** Large, centered card with file picker button and error zone.

**Cursor styling:** Add `cursor-pointer` to all `<UButton>` components.

**Icon strategy:** Use Lucide icons for visual meaning (e.g., `i-lucide-move-vertical` for upper-body moves, `i-lucide-timer` for timed events).

## Spec Change Log

**2026-05-16 — Dark mode fix applied**
- Added dark mode gradient variants to hero banner (`dark:from-blue-900 dark:via-blue-800 dark:to-blue-900`)
- Updated CTA button with dark mode colors and hover states
- Verified color switching works correctly between light and dark modes (moon/sun toggle)

## Verification

**Commands:**
- `pnpm dev` -- Expected: App runs; homepage displays multi-section layout with breathing room
- `pnpm lint` -- Expected: No new linting errors

**Manual checks:**
- Open homepage and verify hero, CSV section, upload area, and results section are visually separated with breathing room
- Hover over any button and verify cursor changes to pointer
- Upload a valid CSV and verify results display; test export buttons
- Test on mobile (small screen) and verify sections stack and remain readable
