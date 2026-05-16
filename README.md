# May Fitness Challenge 2026 — Score Builder

Nuxt 4 + [Nuxt UI](https://ui.nuxt.com) web app: upload a participant CSV, compute per-event points (10 per event max), overall total and rank, then download **CSV** or **JSON** results. Designed for **Vercel** (static / Nitro edge).

## Rules & data

- Primary rules live in `docs/MFC 2026 Scorecard & Rules - All Participants.xlsx`. Numeric tables for 100m, male mile, etc. are extracted to `data/mfc/` via `pnpm run extract:mfc`.
- **Strength Level** (chin-ups, dips, men’s pull-ups) uses **checked-in JSON** under `data/strengthlevel/` produced by `pnpm run harvest:strengthlevel` (Cheerio parse of public pages). The app does **not** call strengthlevel.com at runtime.
- **MVP merge rule (Strength Level):** take the **stricter** of the two implied percentiles: `min(percentile_from_bodyweight_table, percentile_from_age_table)`. If age or weight is missing, only the available table is used (with a warning in scoring). This is an **approximation** versus Strength Level’s on-site calculator; the merge is isolated in `app/utils/mfc/strengthLevel.ts` if organizers want to swap it later.

## CSV template

**All weights in pounds.** Header row must match exactly (see `public/sample-mfc-2026.csv`):

`id,name,sex,age,bodyweight_lb,e1_pullups,e2_box_squat_reps,e3_pushups,e4_sit_reach_inches,e5_chinups,e6_dips,e7_plank_sec,e8_deadhang_sec,e9_broad_jump_inches,e10_100m_sec,e11_mile_sec,e12_burpees`

| Column | Meaning |
|--------|--------|
| `sex` | `male` or `female` (or `m`/`f`) |
| `e1_pullups` | **Men:** max pull-up reps. **Women:** static hold time **seconds** (per workbook — cohort pro-rated vs best hold in the file). |
| `e2` … `e12` | Box squat avg reps; push-ups (2 min); sit & reach **inches**; chin-ups; dips; plank **seconds**; dead hang **seconds**; broad jump **inches**; 100m **seconds**; 1 mile **seconds** (e.g. 420 = 7:00); burpees in 3 min |

## Scripts

```bash
pnpm install
pnpm dev
pnpm run extract:mfc           # refresh data/mfc/*.json from xlsx
pnpm run harvest:strengthlevel  # refresh data/strengthlevel/*.json (network)
pnpm run test
pnpm run build
```

## Deploy (Netlify)

- Connect the repo to Netlify (or use the `netlify.toml` in the root for configuration).
- **Build settings:** Framework preset auto-detects as Nuxt; build command (`pnpm run build`) and publish directory (`.output/public`) are configured in `netlify.toml`. Node 22 and pnpm 10.33.4 are pinned for consistency with the CI environment.
- **No secrets or env vars** required for scoring (all data is in-repo). Optional: set `NUXT_PUBLIC_*` later if you add analytics.
- Deploy triggers on every push to your connected branch. SPA routing (catch-all redirect to `/index.html`) enables client-side navigation for all routes except `/` (which is prerendered).

## Gaps / MVP notes (see code comments)

- **100m:** male table is used for everyone until a women’s curve is added to the workbook.
- **Plank:** workbook table was empty; linear MVP mapping in `app/utils/mfc/thresholds.ts`.
- **Push-ups:** anchor curve approximates APFT-style scaling to /10; refine from official table when available.

## Development

```bash
pnpm dev
```

Typecheck: `pnpm run typecheck`. Lint: `pnpm run lint`.
