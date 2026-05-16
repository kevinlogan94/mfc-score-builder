/** Sit & reach (inches) — workbook anchor points; linear between knots; flat below / ramp above */
export const SIT_REACH_KNOTS_IN: { x: number, y: number }[] = [
  { x: -7.5, y: 0 },
  { x: -3.5, y: 1.66 },
  { x: -0.5, y: 3.32 },
  { x: 2.0, y: 4.98 },
  { x: 6.0, y: 6.64 },
  { x: 10.5, y: 8.3 }
]

/** Seconds; elite threshold from Exercise rules sheet */
export const DEAD_HANG_ELITE_SEC = 306

/** Men (inches): categories from workbook — 0 for very poor, 10 excellent, linear inside segment */
export const BROAD_JUMP_MEN_IN = {
  categories: [
    { label: 'very poor', maxIn: 191, score: 0 },
    { label: 'poor', minIn: 191, maxIn: 210, scoreLo: 0, scoreHi: 2.5 },
    { label: 'below avg', minIn: 211, maxIn: 220, scoreLo: 2.5, scoreHi: 4 },
    { label: 'avg', minIn: 221, maxIn: 230, scoreLo: 4, scoreHi: 6 },
    { label: 'above avg', minIn: 231, maxIn: 240, scoreLo: 6, scoreHi: 8 },
    { label: 'very good', minIn: 241, maxIn: 250, scoreLo: 8, scoreHi: 9 },
    { label: 'excellent', minIn: 251, score: 10 }
  ]
}

/** Women (inches): Womens data sheet */
export const BROAD_JUMP_WOMEN_IN = {
  categories: [
    { label: 'very poor', maxIn: 141, score: 0 },
    { label: 'poor', minIn: 141, maxIn: 160, scoreLo: 0, scoreHi: 2.5 },
    { label: 'below avg', minIn: 161, maxIn: 170, scoreLo: 2.5, scoreHi: 4 },
    { label: 'avg', minIn: 171, maxIn: 180, scoreLo: 4, scoreHi: 6 },
    { label: 'above avg', minIn: 181, maxIn: 190, scoreLo: 6, scoreHi: 8 },
    { label: 'very good', minIn: 191, maxIn: 200, scoreLo: 8, scoreHi: 9 },
    { label: 'excellent', minIn: 201, score: 10 }
  ]
}

/**
 * Navy plank MVP (workbook defers to Navy link; sheet body was empty).
 * Linear: 45s -> 0 pts, 240s (4:00) -> 10 pts, clamped.
 */
export const PLANK_SCORE_LINEAR = { minSec: 45, maxSec: 240 }

/**
 * US Army APFT push-up (17–21 male) simplified: reps 0–77 mapped to 0–100 then /10.
 * Anchor points (reps -> out of 100) from FM 7-22 chart (approximate).
 */
export const PUSHUP_REPS_SCORE100_ANCHORS: [number, number][] = [
  [0, 0],
  [10, 32],
  [20, 47],
  [30, 62],
  [40, 75],
  [50, 85],
  [60, 92],
  [70, 97],
  [77, 100]
]
