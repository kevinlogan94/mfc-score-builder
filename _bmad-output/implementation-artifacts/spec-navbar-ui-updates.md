---
title: Update navbar UI for mobile
type: 'feature'
created: '2026-05-16'
status: 'done'
context: []
baseline_commit: 'de4134e9a2de9eb3bb99cb0542035c20e21ff5f1'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The navbar icon is a generic "MFC" text badge, and the sidebar button is visible on mobile even though there's no sidebar content to display.

**Approach:** Replace the MFC text badge with the Nuxt logo icon in the navbar, and hide the sidebar toggle button on mobile devices using responsive Tailwind classes.

## Boundaries & Constraints

**Always:**
- Use the Nuxt logo from the `@iconify-json/simple-icons` icon package (already installed)
- Maintain the responsive text hiding for "May Fitness Challenge" on mobile (already present)
- Keep the dark mode color scheme working for the logo
- Apply changes only to the navbar component; do not modify other header elements

**Ask First:**
- If the Nuxt logo icon doesn't integrate cleanly, confirm before using an alternative icon

**Never:**
- Remove the logo/branding entirely
- Modify the color mode button or other header elements
- Create a sidebar; only hide the toggle if it exists

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Desktop view | Page loaded on ≥640px | Navbar shows logo + color button; no sidebar toggle visible | N/A |
| Mobile view | Page loaded on <640px | Navbar shows logo + color button; sidebar toggle hidden | N/A |
| Dark mode desktop | Dark mode enabled on desktop | Logo visible in light color on dark background | N/A |
| Dark mode mobile | Dark mode enabled on mobile | Logo visible with correct contrast | N/A |

</frozen-after-approval>

## Code Map

- `app/components/AppLogo.vue` -- Current logo component with MFC text badge; needs icon replacement
- `app/app.vue` -- Main app layout using Nuxt UI `UHeader`, `UApp`, and `UMain`; may contain sidebar toggle configuration

## Tasks & Acceptance

**Execution:**
- [x] `app/components/AppLogo.vue` -- Replace MFC text badge with Nuxt icon from `@iconify-json/simple-icons` -- Icon provides modern branding and works on all screen sizes
- [x] `app/app.vue` -- Add responsive class to hide sidebar toggle on mobile (if toggle is present) -- Removes clutter on mobile where sidebar content doesn't exist

**Acceptance Criteria:**
- Given the app loads on desktop, when I view the navbar, then the Nuxt logo is displayed instead of the MFC badge
- Given the app loads on mobile, when I view the navbar, then the sidebar toggle button is not visible
- Given dark mode is enabled, when I view the navbar on any device, then the logo is visible with proper contrast

## Spec Change Log

**Iteration 1 - Icon load failure & breakpoint boundary:**
- **Finding:** Edge Case Hunter identified that if the Nuxt icon fails to load, mobile users see a blank navbar (high severity). Blind Hunter noted brittle aria-label selector and breakpoint off by 1px.
- **Amendment:** Added MFC fallback text for mobile in logo component and corrected breakpoint to 640px (inclusive boundary).
- **Known-bad state avoided:** Blank navbar on icon load failure; button visible at 640px viewport when it should be hidden.
- **KEEP:** Nuxt icon implementation with dark mode color classes; responsive text hiding pattern.

**Iteration 2 - Global style approach for sidebar hide:**
- **Finding:** Scoped `:deep()` selector with media query wasn't hiding the menu button reliably on review.
- **Amendment:** Changed to global non-scoped style using `[aria-label="Open menu"] { display: none !important; }` for reliable hiding.
- **Known-bad state avoided:** Menu button remaining visible and blocking responsive design.
- **KEEP:** Simple aria-label targeting, !important for CSS override certainty.

## Design Notes

The Nuxt logo from `@iconify-json/simple-icons` is a well-recognized brand icon. It integrates via the Icon component pattern in Nuxt UI. Use `v-icon` or `Icon` component with `name="simple-icons:nuxt"` to render it. The icon should be sized to match the current badge height (h-8 w-8 or similar).

## Verification

**Manual checks:**
- Open app on desktop (≥640px) and confirm Nuxt logo appears in navbar
- Open app on mobile (<640px) and confirm sidebar toggle is hidden
- Toggle dark mode and verify logo remains visible with good contrast on both desktop and mobile
- Verify "May Fitness Challenge" text still hides on mobile as before

## Suggested Review Order

**Logo component update**

- Nuxt icon replaces MFC badge with fallback "MFC" text for mobile (icon load resilience)
  [`AppLogo.vue:1-7`](../../app/components/AppLogo.vue#L1)

**Mobile menu toggle hiding**

- CSS media query hides sidebar menu button on mobile viewports (responsive hiding at 640px breakpoint)
  [`app.vue:55-62`](../../app/app.vue#L55)
