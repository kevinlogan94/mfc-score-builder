import XLSX from 'xlsx'
import path from 'path'

const file = path.join(
  process.cwd(),
  'docs/MFC 2026 Scorecard & Rules - All Participants.xlsx'
)
const wb = XLSX.readFile(file, { cellDates: true, raw: false })
console.log('Sheets:', wb.SheetNames)
for (const name of wb.SheetNames) {
  const ws = wb.Sheets[name]
  const ref = ws['!ref']
  console.log('\n===', name, '===', ref)
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
  const preview = rows.slice(0, 80)
  console.log(JSON.stringify(preview, null, 0).slice(0, 12000))
}
