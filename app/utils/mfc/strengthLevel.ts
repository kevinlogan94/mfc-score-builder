import chinUps from '../../../data/strengthlevel/chin-ups.json'
import dips from '../../../data/strengthlevel/dips.json'
import pullUps from '../../../data/strengthlevel/pull-ups.json'

export type StrengthSlug = 'chin-ups' | 'dips' | 'pull-ups'

type Dataset = (typeof chinUps) & { slug?: string }

const DATA: Record<StrengthSlug, Dataset> = {
  'chin-ups': chinUps,
  dips,
  'pull-ups': pullUps
}

const TIER_ORDER = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'] as const
const TIER_PERCENTILES: Record<(typeof TIER_ORDER)[number], number> = {
  Beginner: 5,
  Novice: 20,
  Intermediate: 50,
  Advanced: 80,
  Elite: 95
}

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n))
}

/** Interpolate tier thresholds for a bodyweight between two anchor rows */
function interpolateTiersForWeight(
  weightLb: number,
  rows: { bodyweightLb: number, tiers: Record<string, number> }[]
) {
  const sorted = [...rows].sort((a, b) => a.bodyweightLb - b.bodyweightLb)
  if (!sorted.length) return null
  if (weightLb <= sorted[0]!.bodyweightLb) return sorted[0]!.tiers
  if (weightLb >= sorted[sorted.length - 1]!.bodyweightLb)
    return sorted[sorted.length - 1]!.tiers
  let i = 0
  while (i < sorted.length - 1 && sorted[i + 1]!.bodyweightLb < weightLb) i++
  const lo = sorted[i]!
  const hi = sorted[i + 1]!
  const t = (weightLb - lo.bodyweightLb) / (hi.bodyweightLb - lo.bodyweightLb)
  const out: Record<string, number> = {}
  for (const k of TIER_ORDER) {
    out[k] = (lo.tiers[k] ?? 0) + t * ((hi.tiers[k] ?? 0) - (lo.tiers[k] ?? 0))
  }
  return out
}

function interpolateTiersForAge(
  age: number,
  rows: { ageYears: number, tiers: Record<string, number> }[]
) {
  const sorted = [...rows].sort((a, b) => a.ageYears - b.ageYears)
  if (!sorted.length) return null
  if (age <= sorted[0]!.ageYears) return sorted[0]!.tiers
  if (age >= sorted[sorted.length - 1]!.ageYears)
    return sorted[sorted.length - 1]!.tiers
  let i = 0
  while (i < sorted.length - 1 && sorted[i + 1]!.ageYears < age) i++
  const lo = sorted[i]!
  const hi = sorted[i + 1]!
  const t = (age - lo.ageYears) / (hi.ageYears - lo.ageYears)
  const out: Record<string, number> = {}
  for (const k of TIER_ORDER) {
    out[k] = (lo.tiers[k] ?? 0) + t * ((hi.tiers[k] ?? 0) - (lo.tiers[k] ?? 0))
  }
  return out
}

/**
 * Map reps to approximate percentile using tier rep thresholds (monotone increasing).
 */
export function repsToPercentile(
  reps: number,
  tiers: Record<string, number> | null
): number | null {
  if (!tiers) return null
  const pts = TIER_ORDER.map(k => ({
    label: k,
    reps: tiers[k] ?? 0,
    p: TIER_PERCENTILES[k]
  }))
  const p0 = pts[0]!
  if (reps <= p0.reps) {
    const b = p0
    const p1 = pts[1]!
    if (b.reps <= 0) return reps <= 0 ? b.p : Math.min(99, b.p + (reps / 1) * (p1.p - b.p) * 0.2)
    return (reps / b.reps) * b.p
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!
    const b = pts[i + 1]!
    if (reps <= b.reps) {
      const u = (reps - a.reps) / Math.max(1e-6, b.reps - a.reps)
      return a.p + u * (b.p - a.p)
    }
  }
  const top = pts[pts.length - 1]!
  const extra = Math.min(4, Math.max(0, reps - top.reps) * 0.15)
  return Math.min(99, top.p + extra)
}

export function strengthLevelPoints(
  slug: StrengthSlug,
  sex: 'male' | 'female',
  reps: number,
  weightLb: number | null,
  age: number | null
): { points: number, percentile: number | null, warnings: string[] } {
  const data = DATA[slug]
  const block = sex === 'male' ? data.male : data.female
  const warnings: string[] = []
  if (!block?.byBodyweightLb?.length || !block?.byAgeYears?.length) {
    warnings.push(`Strength Level data missing for ${slug} (${sex}).`)
    return { points: 0, percentile: null, warnings }
  }

  let pBw: number | null = null
  let pAge: number | null = null

  if (weightLb != null && Number.isFinite(weightLb)) {
    const tiers = interpolateTiersForWeight(weightLb, block.byBodyweightLb)
    pBw = repsToPercentile(reps, tiers)
  } else warnings.push('Missing body weight — using age-only Strength Level path.')

  if (age != null && Number.isFinite(age)) {
    const tiersA = interpolateTiersForAge(age, block.byAgeYears)
    pAge = repsToPercentile(reps, tiersA)
  } else warnings.push('Missing age — using bodyweight-only Strength Level path.')

  let p: number | null = null
  if (pBw != null && pAge != null) p = Math.min(pBw, pAge)
  else p = pBw ?? pAge ?? null

  if (p == null) {
    warnings.push('Could not derive Strength Level percentile.')
    return { points: 0, percentile: null, warnings }
  }

  const points = clamp(p / 10, 0, 10)
  return { points, percentile: p, warnings }
}
