import type { MfcRow, Sex } from './score'

/** Canonical template — all required; see README for units */
export const MFC_CSV_HEADERS = [
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
  'e12_burpees'
] as const

function parseLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let q = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"'
        i++
      } else q = !q
    } else if (c === ',' && !q) {
      out.push(cur.trim())
      cur = ''
    } else cur += c
  }
  out.push(cur.trim())
  return out
}

function num(s: string, col: string) {
  const n = Number.parseFloat(s)
  if (!Number.isFinite(n)) throw new Error(`Column "${col}" expected number, got "${s}"`)
  return n
}

function sexVal(s: string): Sex {
  const x = s.trim().toLowerCase()
  if (x === 'male' || x === 'm') return 'male'
  if (x === 'female' || x === 'f') return 'female'
  throw new Error(`sex must be male or female, got "${s}"`)
}

function req(cells: string[], i: number, name: string): string {
  const v = cells[i]
  if (v === undefined) throw new Error(`Missing column "${name}"`)
  return v
}

export function parseMfcCsv(text: string): { rows: MfcRow[], errors: string[] } {
  const errors: string[] = []
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0)

  if (!lines.length) return { rows: [], errors: ['Empty file.'] }

  const firstLine = lines[0]!
  const header = parseLine(firstLine).map(h => h.trim().toLowerCase())
  for (let i = 0; i < MFC_CSV_HEADERS.length; i++) {
    const exp = MFC_CSV_HEADERS[i]
    const got = header[i] ?? ''
    if (got !== exp) {
      errors.push(`Header column ${i + 1}: expected "${exp}", got "${got || '(missing)'}"`)
    }
  }
  if (errors.length) return { rows: [], errors }

  const rows: MfcRow[] = []
  for (let li = 1; li < lines.length; li++) {
    const line = lines[li]!
    const rowNum = li + 1
    try {
      const cells = parseLine(line)
      if (cells.length < MFC_CSV_HEADERS.length)
        throw new Error(`Expected ${MFC_CSV_HEADERS.length} columns, got ${cells.length}`)
      const row: MfcRow = {
        id: req(cells, 0, 'id'),
        name: req(cells, 1, 'name'),
        sex: sexVal(req(cells, 2, 'sex')),
        age: num(req(cells, 3, 'age'), 'age'),
        bodyweight_lb: num(req(cells, 4, 'bodyweight_lb'), 'bodyweight_lb'),
        e1_pullups: num(req(cells, 5, 'e1_pullups'), 'e1_pullups'),
        e2_box_squat_reps: num(req(cells, 6, 'e2_box_squat_reps'), 'e2_box_squat_reps'),
        e3_pushups: num(req(cells, 7, 'e3_pushups'), 'e3_pushups'),
        e4_sit_reach_inches: num(req(cells, 8, 'e4_sit_reach_inches'), 'e4_sit_reach_inches'),
        e5_chinups: num(req(cells, 9, 'e5_chinups'), 'e5_chinups'),
        e6_dips: num(req(cells, 10, 'e6_dips'), 'e6_dips'),
        e7_plank_sec: num(req(cells, 11, 'e7_plank_sec'), 'e7_plank_sec'),
        e8_deadhang_sec: num(req(cells, 12, 'e8_deadhang_sec'), 'e8_deadhang_sec'),
        e9_broad_jump_inches: num(req(cells, 13, 'e9_broad_jump_inches'), 'e9_broad_jump_inches'),
        e10_100m_sec: num(req(cells, 14, 'e10_100m_sec'), 'e10_100m_sec'),
        e11_mile_sec: num(req(cells, 15, 'e11_mile_sec'), 'e11_mile_sec'),
        e12_burpees: num(req(cells, 16, 'e12_burpees'), 'e12_burpees')
      }
      rows.push(row)
    } catch (e) {
      errors.push(`Row ${rowNum}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return { rows, errors }
}
