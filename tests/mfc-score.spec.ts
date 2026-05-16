import { describe, expect, it } from 'vitest'
import { scoreParticipants } from '../app/utils/mfc/score'

describe('scoreParticipants', () => {
  it('ranks by total and assigns 12 event keys', () => {
    const rows = [
      {
        id: '1',
        name: 'A',
        sex: 'male' as const,
        age: 36,
        bodyweight_lb: 180,
        e1_pullups: 10,
        e2_box_squat_reps: 40,
        e3_pushups: 50,
        e4_sit_reach_inches: 2,
        e5_chinups: 8,
        e6_dips: 12,
        e7_plank_sec: 90,
        e8_deadhang_sec: 120,
        e9_broad_jump_inches: 220,
        e10_100m_sec: 14,
        e11_mile_sec: 480,
        e12_burpees: 30
      },
      {
        id: '2',
        name: 'B',
        sex: 'male' as const,
        age: 36,
        bodyweight_lb: 200,
        e1_pullups: 5,
        e2_box_squat_reps: 20,
        e3_pushups: 25,
        e4_sit_reach_inches: 0,
        e5_chinups: 4,
        e6_dips: 6,
        e7_plank_sec: 60,
        e8_deadhang_sec: 60,
        e9_broad_jump_inches: 200,
        e10_100m_sec: 15,
        e11_mile_sec: 600,
        e12_burpees: 15
      }
    ]
    const s = scoreParticipants(rows)
    expect(s).toHaveLength(2)
    expect(s[0]!.rank).toBe(1)
    expect(s[1]!.rank).toBe(2)
    expect(s[0]!.total).toBeGreaterThanOrEqual(s[1]!.total)
    expect(Object.keys(s[0]!.events)).toEqual([
      'e1',
      'e2',
      'e3',
      'e4',
      'e5',
      'e6',
      'e7',
      'e8',
      'e9',
      'e10',
      'e11',
      'e12'
    ])
  })
})
