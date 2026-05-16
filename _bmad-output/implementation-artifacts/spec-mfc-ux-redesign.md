---
title: 'Redesign UX for May Fitness Challenge — Non-Technical Users'
type: 'feature'
created: '2026-05-15'
status: 'done'
context: []
baseline_commit: '2d273a10677401db86cbd521000e72fecff1e320'
specLoopIteration: 1
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The current app looks like a generic Nuxt template, assumes developer familiarity, and lacks clear guidance for non-technical users (fitness enthusiasts from strengthlevel.com). Users don't understand what the tool does, how to prepare their CSV, or how scoring works.

**Approach:** Redesign landing page + upload flow with May Fitness Challenge branding (blue + white + black palette from the event poster), guide users through CSV preparation with a live preview of the template, explain scoring in accessible language, and polish the results view for confidence and clarity.

## Boundaries & Constraints

**Always:**
- Use May Fitness Challenge brand colors (primary blue: use Nuxt UI's blue palette, accent black/white)
- Make CSV template visible and downloadable within the upload flow
- Assume zero technical knowledge — no jargon, no code blocks in user-facing text
- Show scoring methodology inline (e.g., "Per-event points are calculated using Strength Level data" with a link to learn more, not technical jargon)
- Keep the core logic (parsing, scoring, export) unchanged — only UI/UX changes

**Ask First:**
- Should we add a "How It Works" help section or inline explanations only?
- Do you want the Strength Level scoring explanation visible on the landing page or only after upload?

**Never:**
- Don't change scoring logic or data flows
- Don't break CSV upload/export functionality
- Don't add unnecessary animations or reduce performance
- Don't require any new backend logic or API calls

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| **Happy path: new visitor** | User lands on homepage | Sees branded hero section with MFC branding, clear "Upload CSV" CTA, visible template preview | N/A |
| **Upload valid CSV** | User selects valid CSV file | File parses; results table shows ranked participants with per-event scores; export buttons appear | Error message shows parsing issue with guidance |
| **User needs template** | User clicks on template preview | Downloads sample CSV or previews structure inline | N/A |
| **Scoring explanation** | User views results | Sees clear labels for each event; optional tooltip explaining "Strength Level" merge for e1/e5/e6 | N/A |

</frozen-after-approval>

## Code Map

- `app/app.vue` -- Header/footer/layout; replace generic template references with MFC branding
- `app/pages/index.vue` -- Landing page + upload flow; primary UX redesign target
- `app/components/AppLogo.vue` -- Custom MFC logo or text brand (replace Nuxt template logo)
- `app/components/TemplateMenu.vue` -- Simplify or remove template nav; keep only essential links
- `app/app.config.ts` -- Set primary color to blue; update color scheme to match MFC branding
- `public/sample-mfc-2026.csv` -- Already exists; ensure it's easy to download/view

## Tasks & Acceptance

**Execution:**

- [x] `app/app.config.ts` -- Update primary color to blue (Nuxt UI blue palette) and set neutral to slate for consistency with MFC branding
- [x] `app/components/AppLogo.vue` -- Replace with simple MFC text/logo badge (e.g., "MFC 2026 Score Builder" with blue accent)
- [x] `app/components/TemplateMenu.vue` -- Remove developer-focused links; keep minimal or remove entirely
- [x] `app/pages/index.vue` -- Redesign hero section to show MFC branding, event list, and clear CTA; restructure upload flow with inline template preview; add scoring explanation; polish results view and export buttons
- [x] `app/app.vue` -- Clean up header/footer; replace GitHub links with MFC-focused content or remove
- [x] Verify all functionality works: upload, parse, export (CSV + JSON)

**Acceptance Criteria:**

- Given a non-technical user visits the homepage, when they see the page, then they immediately understand it's for the May Fitness Challenge, know they can upload CSV scores, and see an example of what the CSV should look like
- Given the user has uploaded a CSV, when they view results, then they see ranked participants, per-event scores, and clear export options with no technical jargon
- Given the user needs to understand scoring, when they hover over/expand scoring details, then they see plain-English explanations (e.g., "Strength Level athletes are scored using body weight and age tables")
- Given the upload fails, when the user sees an error, then they receive specific guidance (e.g., "Column 'e1_pullups' is missing — download the template to see the required format")

## Design Notes

The redesign focuses on three layers:

1. **Branding & Identity** (landing hero): MFC poster-style blue + white + black, event icons/names, challenge tagline ("Stronger Together. Better Together."), clear CTA.
2. **Onboarding Flow** (upload step): CSV template is visible/downloadable inline, not buried in README. Simple file picker with minimal friction. Error messages are specific and actionable.
3. **Results Clarity** (post-upload): Scored table is clean; per-event labels are descriptive (not just "E1"); export buttons are prominent; optional scoring explainer for Strength Level events.

Example color usage (from MFC poster):
- Primary blue: Used for buttons, links, highlights (Nuxt UI `blue` or similar)
- Black: Headers, strong text
- White/light: Backgrounds
- Gray: Secondary text, borders

</frozen-after-approval>

## Spec Change Log

<!-- Append-only. Populated during review loops. -->

## Verification

**Commands:**
- `pnpm dev` -- Expected: App runs without errors; homepage displays MFC branding; file upload works; export functions work
- `pnpm lint` -- Expected: No new linting errors introduced
- `pnpm typecheck` -- Expected: TypeScript checks pass

**Manual checks:**
- Open the app in a browser and visually verify MFC branding is prominent
- Upload the sample CSV and verify results table shows all 12 events and rankings
- Test export (CSV and JSON) to ensure files download correctly
- Verify mobile responsiveness (hero, upload, results table)

## Suggested Review Order

**Branding & Color Scheme**

- Set primary color to blue across app UI
  [`app/app.config.ts:4`](../../app/app.config.ts#L4)
- Simple text-based MFC logo badge replaces generic Nuxt SVG
  [`app/components/AppLogo.vue:1-8`](../../app/components/AppLogo.vue#L1)

**Landing & Hero Section**

- Hero section with MFC branding, event grid, and clear CTA; shows non-technical users what the tool does
  [`app/pages/index.vue:108-156`](../../app/pages/index.vue#L108)

**CSV Upload Guidance**

- Inline CSV template preview with column headers, example row, and column details; allows users to understand format without leaving app
  [`app/pages/index.vue:161-237`](../../app/pages/index.vue#L161)
- Template download button generates CSV file directly (not a link)
  [`app/pages/index.vue:76-83`](../../app/pages/index.vue#L76)

**Results Display & Scoring Explanation**

- Polished results table with rank badges (🥇🥈🥉), total score in blue, abbreviated labels on mobile
  [`app/pages/index.vue:306-374`](../../app/pages/index.vue#L306)
- Plain-English scoring explanation visible pre-upload to set expectations
  [`app/pages/index.vue:252-288`](../../app/pages/index.vue#L252)

**Header & Footer Cleanup**

- Removed developer template menu and GitHub links; updated footer with MFC branding
  [`app/app.vue:1-52`](../../app/app.vue#L1)
- TemplateMenu component neutralized (empty div kept for Vue validation)
  [`app/components/TemplateMenu.vue:1-3`](../../app/components/TemplateMenu.vue#L1)
