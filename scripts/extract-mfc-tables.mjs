/**
 * One-off: reads official MFC xlsx and writes JSON under data/mfc/.
 * Run: node scripts/extract-mfc-tables.mjs
 */
import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'

const root = path.join(import.meta.dirname, '..')
const xlsxPath = path.join(
  root,
  'docs/MFC 2026 Scorecard & Rules - All Participants.xlsx'
)

/**
 * Mile / time cells in the workbook are Excel "time of day" fractions; use the
 * rendered `w` string (e.g. "05:14", "10:40") as MM:SS duration for running.
 */
function cellDurationSeconds(cell) {
  if (!cell) return null
  const w = cell.w
  if (typeof w === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(w.trim())) {
    const parts = w.trim().split(':').map(Number)
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    if (parts.length === 3)
      return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  if (typeof cell.v === 'number')
    return Math.min(Math.round(cell.v * 86400), 86400 * 2 - 1)
  return null
}

function write(name, obj) {
  const dir = path.join(root, 'data/mfc')
  fs.mkdirSync(dir, { recursive: true })
  const p = path.join(dir, name)
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n')
  console.warn('wrote', p)
}

const wb = XLSX.readFile(xlsxPath, { raw: true })

// Male 100m
const w100 = wb.Sheets['Male 100m Times']
const r100 = XLSX.utils.sheet_to_json(w100, { header: 1, defval: null })
const male100m = []
for (let i = 1; i < r100.length; i++) {
  const row = r100[i]
  if (row[0] == null || row[0] === '') continue
  if (typeof row[0] !== 'number') continue
  male100m.push({ sec: row[0], score: row[1] })
}
write('male-100m.json', {
  source: 'docs/MFC 2026 Scorecard & Rules - All Participants.xlsx',
  sheet: 'Male 100m Times',
  unit: 'seconds',
  rows: male100m
})

// Male mile by age
const wsMile = wb.Sheets['Male Mile Times ']
const maleMileByAge = {}
const mileRange = wsMile['!ref'] ? XLSX.utils.decode_range(wsMile['!ref']) : { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }
for (let i = Math.max(1, mileRange.s.r + 1); i <= mileRange.e.r; i++) {
  const addrAge = XLSX.utils.encode_cell({ r: i, c: 0 })
  const addrTime = XLSX.utils.encode_cell({ r: i, c: 1 })
  const addrScore = XLSX.utils.encode_cell({ r: i, c: 2 })
  const cAge = wsMile[addrAge]
  const cTime = wsMile[addrTime]
  const cScore = wsMile[addrScore]
  const age = cAge?.v
  const sec = cellDurationSeconds(cTime)
  const sc = cScore?.v
  if (typeof age !== 'number' || sec == null || typeof sc !== 'number') continue
  if (!maleMileByAge[age]) maleMileByAge[age] = []
  maleMileByAge[age].push({ sec, score: sc })
}
for (const k of Object.keys(maleMileByAge)) {
  maleMileByAge[k].sort((a, b) => a.sec - b.sec)
}
write('male-mile-by-age.json', {
  source: 'docs/MFC 2026 Scorecard & Rules - All Participants.xlsx',
  sheet: 'Male Mile Times ',
  unit: 'seconds_for_duration',
  note: 'Scores assume participant age matches a listed band; see scoring.ts for clamping.',
  byAge: maleMileByAge
})

// Womens mile: sheet "Womens data" — tier times by age
const ww = wb.Sheets['Womens data']
/** @type {Record<number, Record<string, number>>} */
const womenMileByAge = {}
const tiers = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite']
for (let r = 0; r < 100; r++) {
  const cAge = ww[XLSX.utils.encode_cell({ r, c: 12 })]
  const age = cAge?.v
  if (typeof age !== 'number') continue
  const vals = {}
  for (let i = 0; i < 5; i++) {
    const c = ww[XLSX.utils.encode_cell({ r, c: 13 + i })]
    const sec = cellDurationSeconds(c)
    if (sec != null) vals[tiers[i]] = sec
  }
  if (Object.keys(vals).length) womenMileByAge[age] = vals
}
write('women-mile-tiers-by-age.json', {
  source: 'docs/MFC 2026 Scorecard & Rules - All Participants.xlsx',
  sheet: 'Womens data',
  unit: 'seconds',
  tiers: ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'],
  tierPercentilesApprox: { Beginner: 5, Novice: 20, Intermediate: 50, Advanced: 80, Elite: 95 },
  byAge: womenMileByAge
})

write('meta.json', {
  extractedAt: new Date().toISOString(),
  xlsx: 'docs/MFC 2026 Scorecard & Rules - All Participants.xlsx'
})
