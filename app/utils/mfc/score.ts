import male100m from '../../../data/mfc/male-100m.json'
import maleMile from '../../../data/mfc/male-mile-by-age.json'
import womenMile from '../../../data/mfc/women-mile-tiers-by-age.json'
import {
  BROAD_JUMP_MEN_IN,
  BROAD_JUMP_WOMEN_IN,
  DEAD_HANG_ELITE_SEC,
  PLANK_SCORE_LINEAR,
  PUSHUP_REPS_SCORE100_ANCHORS,
  SIT_REACH_KNOTS_IN
} from './thresholds'
import { strengthLevelPoints } from './strengthLevel'

export type Sex = 'male' | 'female'

export interface MfcRow {
  id: string
  name: string
  sex: Sex
  age: number
  bodyweight_lb: number
  e1_pullups: number
  e2_box_squat_reps: number
  e3_pushups: number
  e4_sit_reach_inches: number
  e5_chinups: number
  e6_dips: number
  e7_plank_sec: number
  e8_deadhang_sec: number
  e9_broad_jump_inches: number
  e10_100m_sec: number
  e11_mile_sec: number
  e12_burpees: number
}

export interface EventScore {
  key: string
  label: string
  points: number
  detail?: string
}

export interface ScoredParticipant extends MfcRow {
  events: Record<string, number>
  eventDetails: Record<string, string | undefined>
  total: number
  rank: number
  warnings: string[]
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}

function interpolateAnchors(x: number, anchors: [number, number][]): number {
  const first = anchors[0]!
  if (x <= first[0]) return first[1]
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i]!
    const b = anchors[i + 1]!
    if (x <= b[0]) {
      const t = (x - a[0]) / (b[0] - a[0])
      return a[1] + t * (b[1] - a[1])
    }
  }
  return anchors[anchors.length - 1]![1]
}

function scoreSitReach(inches: number): number {
  const k = SIT_REACH_KNOTS_IN
  const k0 = k[0]!
  if (inches <= k0.x) return 0
  const kLast = k[k.length - 1]!
  if (inches > kLast.x) return clamp(9.96 + (inches - kLast.x) * 0.04, 0, 10)
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i]!
    const b = k[i + 1]!
    if (inches <= b.x) {
      const t = (inches - a.x) / (b.x - a.x)
      return a.y + t * (b.y - a.y)
    }
  }
  return kLast.y
}

function scoreDeadHang(sec: number): number {
  const e = DEAD_HANG_ELITE_SEC
  return clamp((sec / e) * 10, 0, 10)
}

function scoreBroadJump(inches: number, sex: Sex): number {
  const cfg = sex === 'female' ? BROAD_JUMP_WOMEN_IN : BROAD_JUMP_MEN_IN
  for (const cat of cfg.categories) {
    if ('maxIn' in cat && cat.score !== undefined && inches < (cat.maxIn as number))
      return cat.score
    if (
      'minIn' in cat
      && 'maxIn' in cat
      && 'scoreLo' in cat
      && inches >= (cat.minIn as number)
      && inches <= (cat.maxIn as number)
    ) {
      const u
        = (inches - (cat.minIn as number))
          / ((cat.maxIn as number) - (cat.minIn as number))
      return (cat.scoreLo as number) + u * ((cat.scoreHi as number) - (cat.scoreLo as number))
    }
    if ('minIn' in cat && cat.score !== undefined && inches >= (cat.minIn as number))
      return cat.score as number
  }
  return 0
}

function scorePlank(sec: number): number {
  const { minSec, maxSec } = PLANK_SCORE_LINEAR
  return clamp(((sec - minSec) / (maxSec - minSec)) * 10, 0, 10)
}

function scorePushups(reps: number): number {
  const y = interpolateAnchors(reps, PUSHUP_REPS_SCORE100_ANCHORS)
  return (y / 100) * 10
}

/** Male sheet: time ascending with score descending — interpolate */
function score100m(sec: number): number {
  const rows = male100m.rows
    .filter(r => typeof r.sec === 'number')
    .sort((a, b) => a.sec - b.sec)
  if (!rows.length) return 0
  const r0 = rows[0]!
  const rN = rows[rows.length - 1]!
  if (sec <= r0.sec) return r0.score
  if (sec >= rN.sec) return rN.score
  for (let i = 0; i < rows.length - 1; i++) {
    const a = rows[i]!
    const b = rows[i + 1]!
    if (sec >= a.sec && sec <= b.sec) {
      const t = (sec - a.sec) / (b.sec - a.sec)
      return a.score + t * (b.score - a.score)
    }
  }
  return 0
}

function nearestMaleMileAge(age: number): { band: number, warning?: string } {
  const ks = Object.keys(maleMile.byAge).map(Number).sort((a, b) => a - b)
  if (!ks.length) return { band: age }
  const nearest = ks.reduce(
    (best, k) => (Math.abs(k - age) < Math.abs(best - age) ? k : best),
    ks[0]!
  )
  if (!ks.includes(age))
    return {
      band: nearest,
      warning: `Male mile table uses discrete ages; scored using age ${nearest} (closest to ${age}).`
    }
  return { band: age }
}

function scoreMaleMile(sec: number, age: number): { points: number, warning?: string } {
  const { band, warning } = nearestMaleMileAge(age)
  const key = String(band) as keyof typeof maleMile.byAge
  const rows = maleMile.byAge[key]
  if (!rows?.length) return { points: 0, warning: 'No male mile table.' }
  const r0 = rows[0]!
  const rN = rows[rows.length - 1]!
  if (sec <= r0.sec) return { points: r0.score, warning }
  if (sec >= rN.sec) return { points: rN.score, warning }
  for (let i = 0; i < rows.length - 1; i++) {
    const a = rows[i]!
    const b = rows[i + 1]!
    if (sec >= a.sec && sec <= b.sec) {
      const t = (sec - a.sec) / (b.sec - a.sec)
      return { points: a.score + t * (b.score - a.score), warning }
    }
  }
  return { points: 0, warning }
}

function womenMileTierTimesForAge(age: number): Record<string, number> {
  const ages = Object.keys(womenMile.byAge).map(Number).sort((a, b) => a - b)
  const pick = (key: number) =>
    womenMile.byAge[String(key) as keyof typeof womenMile.byAge] as Record<string, number>
  if (!ages.length) return {}
  if (age <= ages[0]!) return { ...pick(ages[0]!) }
  if (age >= ages[ages.length - 1]!) {
    const o = { ...pick(ages[ages.length - 1]!) }
    if (o.Elite == null && ages.includes(35)) {
      const elite = pick(35).Elite
      if (typeof elite === 'number') o.Elite = elite
    }
    return o
  }
  let i = 0
  while (i < ages.length - 1 && ages[i + 1]! < age) i++
  const a0 = ages[i]!
  const a1 = ages[i + 1]!
  const t = (age - a0) / (a1 - a0)
  const t0 = pick(a0)
  const t1 = pick(a1)
  const out: Record<string, number> = {}
  for (const key of new Set([...Object.keys(t0), ...Object.keys(t1)])) {
    const v0 = t0[key]
    const v1 = t1[key]
    if (typeof v0 === 'number' && typeof v1 === 'number')
      out[key] = v0 + t * (v1 - v0)
  }
  if (out.Elite == null && typeof out.Advanced === 'number')
    out.Elite = (typeof pick(35).Elite === 'number' ? pick(35).Elite : null) ?? Math.round(out.Advanced * 0.9)
  return out
}

/** Faster time = better. Between Beginner (slow) and Elite (fast) map 0–10 */
function scoreFemaleMile(sec: number, age: number): number {
  const tiers = womenMileTierTimesForAge(age)
  const beg = tiers.Beginner
  const eli = tiers.Elite
  if (eli == null || beg == null) return 0
  if (sec <= eli) return 10
  if (sec >= beg) return 0
  return 10 * ((beg - sec) / (beg - eli))
}

function proRate10(value: number, max: number): number {
  if (max <= 0) return value > 0 ? 10 : 0
  return clamp((value / max) * 10, 0, 10)
}

export const EVENT_LABELS: Record<string, string> = {
  e1: 'Max pull-ups / women hold',
  e2: 'Single-leg box squats',
  e3: 'Push-ups',
  e4: 'Sit & reach',
  e5: 'Chin-ups',
  e6: 'Dips',
  e7: 'Plank',
  e8: 'Dead hang',
  e9: 'Broad jump',
  e10: '100m',
  e11: '1 mile',
  e12: 'Burpees'
}

export function scoreParticipants(rows: MfcRow[]): ScoredParticipant[] {
  const warningsAll: string[][] = rows.map(() => [])

  const maxSquat = Math.max(...rows.map(r => r.e2_box_squat_reps), 0)
  const maxBurpee = Math.max(...rows.map(r => r.e12_burpees), 0)
  const maxWomenHold = Math.max(
    ...rows.filter(r => r.sex === 'female').map(r => r.e1_pullups),
    0
  )
  const maxPullRepsMale = Math.max(
    ...rows.filter(r => r.sex === 'male').map(r => r.e1_pullups),
    0
  )

  const scored: ScoredParticipant[] = rows.map((r, idx) => {
    const w = warningsAll[idx]!
    const ev: Record<string, number> = {}
    const det: Record<string, string | undefined> = {}

    // e1 pull-ups
    if (r.sex === 'female') {
      const pts = proRate10(r.e1_pullups, maxWomenHold)
      ev.e1 = pts
      det.e1
        = maxWomenHold > 0
          ? 'Women: static hold — cohort pro-rate vs best hold (seconds) in upload.'
          : 'No positive hold times in cohort.'
    } else {
      const sl = strengthLevelPoints('pull-ups', 'male', r.e1_pullups, r.bodyweight_lb, r.age)
      w.push(...sl.warnings)
      if (sl.percentile != null) {
        ev.e1 = sl.points
        det.e1 = 'Men: Strength Level pull-ups — merged percentile ÷ 10 (see data/strengthlevel).'
      } else {
        const pts = proRate10(r.e1_pullups, maxPullRepsMale)
        ev.e1 = pts
        det.e1
          = 'Men: cohort pro-rate on reps (Strength Level percentile unavailable — add age & weight when possible).'
        if (maxPullRepsMale === 0) det.e1 += ' No positive reps in cohort.'
      }
    }

    ev.e2 = proRate10(r.e2_box_squat_reps, maxSquat)
    det.e2
      = maxSquat > 0 ? 'Winner-take cohort pro-rate (average rep count).' : 'No reps in cohort.'

    ev.e3 = scorePushups(r.e3_pushups)
    det.e3 = 'Push-ups: Army-style anchor curve scaled to /10 (MVP; see thresholds.ts).'

    ev.e4 = scoreSitReach(r.e4_sit_reach_inches)
    det.e4 = 'Sit & reach: piecewise bands from the workbook.'

    const ch = strengthLevelPoints('chin-ups', r.sex, r.e5_chinups, r.bodyweight_lb, r.age)
    w.push(...ch.warnings)
    ev.e5 = ch.points
    det.e5 = 'Chin-ups: Strength Level merged percentile ÷ 10.'

    const dp = strengthLevelPoints('dips', r.sex, r.e6_dips, r.bodyweight_lb, r.age)
    w.push(...dp.warnings)
    ev.e6 = dp.points
    det.e6 = 'Dips: Strength Level merged percentile ÷ 10.'

    ev.e7 = scorePlank(r.e7_plank_sec)
    det.e7
      = 'Plank: MVP linear Navy-style mapping (see thresholds.ts; sheet table was empty).'

    ev.e8 = scoreDeadHang(r.e8_deadhang_sec)
    det.e8 = 'Dead hang: 0–306s → 0–10 linear (workbook).'

    ev.e9 = scoreBroadJump(r.e9_broad_jump_inches, r.sex)
    det.e9 = 'Broad jump: category interpolation (separate M/F tables).'

    ev.e10 = score100m(r.e10_100m_sec)
    det.e10 = '100m: Male timing sheet applied to all (MVP) — see README gap.'

    if (r.sex === 'male') {
      const m = scoreMaleMile(r.e11_mile_sec, r.age)
      ev.e11 = m.points
      if (m.warning) w.push(m.warning)
      det.e11 = '1 mile (male): interpolated age band from workbook.'
    } else {
      ev.e11 = scoreFemaleMile(r.e11_mile_sec, r.age)
      det.e11 = '1 mile (female): Beginner→Elite time span from Womens data sheet.'
    }

    ev.e12 = proRate10(r.e12_burpees, maxBurpee)
    det.e12
      = maxBurpee > 0 ? 'Burpees: cohort pro-rate.' : 'No burpees counted in cohort.'

    const total = Object.values(ev).reduce((s, v) => s + v, 0)

    return {
      ...r,
      events: ev,
      eventDetails: det,
      total,
      rank: 0,
      warnings: w
    }
  })

  scored.sort((a, b) => b.total - a.total)
  scored.forEach((p, i) => {
    p.rank = i + 1
  })

  return scored
}
