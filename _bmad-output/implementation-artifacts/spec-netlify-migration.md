---
title: 'Migrate deployment configuration from Vercel to Netlify'
type: 'chore'
created: '2026-05-16'
status: 'done'
baseline_commit: '0793a392c72a72acb7edbfd64087f1a31c7479ca'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The project is currently documented as Vercel-only, but the Nuxt + Nitro setup works equally well on Netlify. Developers who prefer or need Netlify are blocked by incomplete guidance.

**Approach:** Add `netlify.toml` configuration file with appropriate build and deployment settings, and update the README to remove Vercel-specific language and provide Netlify-specific instructions.

## Boundaries & Constraints

**Always:**
- Keep the build pipeline (`pnpm install && pnpm run build`) unchanged — Netlify uses standard Nuxt build output
- Preserve README sections on rules, data, CSV template, scripts, gaps, and development — only modify the Deploy section
- Ensure the static prerendering (currently in nuxt.config.ts) is honored by Netlify build settings

**Ask First:**
- If you want to support *both* platforms with branching deploy instructions in the README (e.g., "Deploy to Vercel" tab + "Deploy to Netlify" tab), let me know — I'll restructure accordingly

**Never:**
- Do not add Vercel-specific config back (e.g., `vercel.json`)
- Do not require environment variables or secrets for deployment — the app has none
- Do not modify Nuxt config or build scripts

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| New Netlify user | README + netlify.toml present | User can follow README to connect repo, select Nuxt preset, deploy successfully | N/A |
| Build step | Netlify runs `pnpm build` | Outputs `.output/` dir with `public/` and `.nitro/` ready for static hosting | N/A |

</frozen-after-approval>

## Code Map

- `README.md` — Update Deploy section with Netlify instructions
- `netlify.toml` — New file with Netlify build and deployment config

## Tasks & Acceptance

**Execution:**
- [x] `netlify.toml` -- Create with build command, publish directory, Node version pinning, pnpm version pinning, and explicit static asset redirects before catch-all -- Prevents build failures (pnpm mismatch) and hydration issues (misrouted assets)
- [x] `README.md` -- Update the "Deploy (Vercel)" section to "Deploy (Netlify)" with connection and configuration steps -- Guides users to deploy via Netlify instead of Vercel

**Acceptance Criteria:**
- Given README updated with Netlify instructions, when a user connects the repo to Netlify and follows the steps, then the app builds and deploys successfully
- Given `netlify.toml` is present, when Netlify builds the project, then build command runs, output is published to the correct directory, and Node version matches package.json

## Spec Change Log

**2026-05-16 Loop 1:** Edge case hunter identified three `bad_spec` issues in netlify.toml:
1. Missing `PNPM_VERSION = "10.33.4"` in `[build.environment]` — lockfile version mismatch will cause build failures on Netlify
2. Missing explicit `/_nuxt/*` redirect rules before catch-all — could cause static asset serving failures and hydration breaks
3. Missing documentation comment explaining SPA-only limitation and redirect purpose

**Amended:** Added pnpm version to netlify.toml environment, added explicit redirect rules for `/_nuxt/*` and other static paths, added inline comment documenting SPA redirect intent.

**Known-bad state avoided:** Build failures from pnpm lockfile version mismatch; hydration failures from misrouted static assets.

**KEEP:** All other netlify.toml settings (Node 22, build command, publish dir) are correct and well-reasoned.

## Design Notes

**Netlify SPA Configuration:**

The catch-all redirect pattern `/* → /index.html` (status 200) is standard for single-page apps but requires care:
- Only the root `/` is prerendered in `nuxt.config.ts`, so all other routes rely on client-side hydration
- Static assets (CSS, JS, images) at `/_nuxt/*`, `/assets/*`, etc. must NOT be caught by the wildcard — they bypass the SPA bootstrap and serve directly
- Explicit redirect rules for static paths must come BEFORE the catch-all in `netlify.toml` to prevent hydration failures

**pnpm Version Pinning:**

The `package.json` specifies `pnpm@10.33.4` but `netlify.toml` only pins `NODE_VERSION`. Netlify's build environment may have an older pnpm pre-installed. The `PNPM_VERSION` environment variable ensures lockfile integrity during install. Without it, `pnpm-lock.yaml` generated locally with v10.33.4 may fail validation on Netlify if the environment has v10.32.x.

**Node 22 Rationale:**

Matches the CI workflow (Node 22) and package.json declaration. Netlify will use this version for both build and post-build commands.

## Verification

**Commands:**
- `pnpm run build` -- expected: builds successfully, outputs `.output/public/` and `.output/.nitro/`
- Manual check: `netlify.toml` syntax is valid TOML and references correct directories
- Manual check: README Deploy section mentions Netlify and provides clear setup steps

## Suggested Review Order

**Netlify Build Configuration**

- Set up pnpm version pinning to match package.json and prevent lockfile integrity failures on Netlify
  [`netlify.toml:11`](../../../netlify.toml#L11)

- Configure Node 22 to align with CI environment (GitHub Actions workflow)
  [`netlify.toml:10`](../../../netlify.toml#L10)

- Specify static publish directory (`.output/public/`) to match Nuxt Nitro output structure
  [`netlify.toml:7`](../../../netlify.toml#L7)

- Configure build command to match package.json script
  [`netlify.toml:6`](../../../netlify.toml#L6)

**Static Asset Routing (Critical for SPA)**

- Explicit pass-through rule for `/_nuxt/*` static assets before catch-all (prevents hydration failures)
  [`netlify.toml:15-17`](../../../netlify.toml#L15)

- Explicit pass-through rule for `/assets/*` static directory before catch-all
  [`netlify.toml:20-22`](../../../netlify.toml#L20)

- SPA catch-all redirect to `/index.html` for client-side routing (must come after explicit rules)
  [`netlify.toml:27-29`](../../../netlify.toml#L27)

**User Documentation**

- Updated README deployment section with Netlify-specific connection and configuration guidance
  [`README.md:34-39`](../../../README.md#L34)
