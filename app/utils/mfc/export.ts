import type { ScoredParticipant } from './score'
import { EVENT_LABELS } from './score'

const EVENT_KEYS = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'e10', 'e11', 'e12'] as const

function esc(s: string) {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function buildResultsCsv(rows: ScoredParticipant[]): string {
  const head = [
    'rank',
    'id',
    'name',
    'sex',
    'age',
    'bodyweight_lb',
    'e1_pullups',
    'e2_box_squat_reps',
    'e3_pushups',
    'e4_sit_reach_inches',
    'e5_chinups',
    'e6_dips',
    'e7_plank_sec',
    'e8_deadhang_sec',
    'e9_broad_jump_inches',
    'e10_100m_sec',
    'e11_mile_sec',
    'e12_burpees',
    ...EVENT_KEYS.map(k => `pts_${k}`),
    'total',
    'warnings'
  ]
  const lines = [head.join(',')]
  for (const r of rows) {
    const w = r.warnings.join('; ')
    const cells: string[] = [
      String(r.rank),
      r.id,
      r.name,
      r.sex,
      String(r.age),
      String(r.bodyweight_lb),
      String(r.e1_pullups),
      String(r.e2_box_squat_reps),
      String(r.e3_pushups),
      String(r.e4_sit_reach_inches),
      String(r.e5_chinups),
      String(r.e6_dips),
      String(r.e7_plank_sec),
      String(r.e8_deadhang_sec),
      String(r.e9_broad_jump_inches),
      String(r.e10_100m_sec),
      String(r.e11_mile_sec),
      String(r.e12_burpees),
      ...EVENT_KEYS.map(k => String(r.events[k] ?? '')),
      String(r.total),
      esc(w)
    ]
    lines.push(cells.join(','))
  }
  return lines.join('\n')
}

export function buildResultsJson(rows: ScoredParticipant[]) {
  return rows.map(r => ({
    rank: r.rank,
    id: r.id,
    name: r.name,
    sex: r.sex,
    age: r.age,
    bodyweight_lb: r.bodyweight_lb,
    raw: {
      e1_pullups: r.e1_pullups,
      e2_box_squat_reps: r.e2_box_squat_reps,
      e3_pushups: r.e3_pushups,
      e4_sit_reach_inches: r.e4_sit_reach_inches,
      e5_chinups: r.e5_chinups,
      e6_dips: r.e6_dips,
      e7_plank_sec: r.e7_plank_sec,
      e8_deadhang_sec: r.e8_deadhang_sec,
      e9_broad_jump_inches: r.e9_broad_jump_inches,
      e10_100m_sec: r.e10_100m_sec,
      e11_mile_sec: r.e11_mile_sec,
      e12_burpees: r.e12_burpees
    },
    pointsByEvent: EVENT_KEYS.reduce(
      (acc, k) => {
        acc[k] = { label: EVENT_LABELS[k] ?? k, points: r.events[k] ?? 0 }
        return acc
      },
      {} as Record<string, { label: string, points: number }>
    ),
    total: r.total,
    detail: r.eventDetails,
    warnings: r.warnings
  }))
}
