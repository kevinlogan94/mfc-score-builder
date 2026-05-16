/**
 * Harvest Strength Level public standards into data/strengthlevel/*.json
 * Run: node scripts/harvest-strengthlevel.mjs
 */
import fs from 'fs'
import path from 'path'
import { load } from 'cheerio'

const SLUGS = /** @type {const} */ (['chin-ups', 'dips', 'pull-ups'])
const BASE = 'https://strengthlevel.com/strength-standards'

const TIER_KEYS = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite']
const LEGEND_PERCENTILES = {
  Beginner: 5,
  Novice: 20,
  Intermediate: 50,
  Advanced: 80,
  Elite: 95
}

/** @type {Record<string, { male: RegExp; female: RegExp }>} */
const HEADINGS = {
  'chin-ups': { male: /Male Chin Ups Standards/i, female: /Female Chin Ups Standards/i },
  'dips': { male: /Male Dips Standards/i, female: /Female Dips Standards/i },
  'pull-ups': { male: /Male Pull Ups Standards/i, female: /Female Pull Ups Standards/i }
}

function parseRepCell(text) {
  const t = text.trim()
  if (/^<\s*1\b/i.test(t)) return 0
  const n = Number.parseFloat(t.replace(/[^0-9.-]/g, ''))
  return Number.isFinite(n) ? n : null
}

function isRepBodyweightTable($, table) {
  const row = $(table).find('tbody tr').first()
  if (!row.length) return false
  const second = $(row).find('td').eq(1).text()
  return second.length > 0 && !/kg/i.test(second)
}

function parseBWTable($, table) {
  const hdr = $(table).find('thead th, tr').first().find('th,td').first().text().trim()
  if (hdr.toUpperCase() !== 'BW') return null
  const rows = []
  $(table)
    .find('tbody tr')
    .each((_, tr) => {
      const cells = $(tr)
        .find('td')
        .map((_, td) => $(td).text().trim())
        .get()
      if (cells.length < 6) return
      const w = Number.parseFloat(cells[0])
      if (!Number.isFinite(w)) return
      /** @type {Record<string, number>} */
      const tiers = {}
      for (let i = 0; i < 5; i++) {
        const p = parseRepCell(cells[i + 1])
        if (p === null) return
        tiers[TIER_KEYS[i]] = p
      }
      rows.push({ bodyweightLb: w, tiers })
    })
  return rows.length ? rows : null
}

function parseAgeTable($, table) {
  const hdr = $(table).find('thead th, tr').first().find('th,td').first().text().trim()
  if (hdr.toUpperCase() !== 'AGE') return null
  const rows = []
  $(table)
    .find('tbody tr')
    .each((_, tr) => {
      const cells = $(tr)
        .find('td')
        .map((_, td) => $(td).text().trim())
        .get()
      if (cells.length < 6) return
      const age = Number.parseInt(cells[0], 10)
      if (!Number.isFinite(age)) return
      /** @type {Record<string, number>} */
      const tiers = {}
      for (let i = 0; i < 5; i++) {
        const p = parseRepCell(cells[i + 1])
        if (p === null) return
        tiers[TIER_KEYS[i]] = p
      }
      rows.push({ ageYears: age, tiers })
    })
  return rows.length ? rows : null
}

/**
 * @param {import('cheerio').CheerioAPI} $
 * @param {import('cheerio').Cheerio} chunk
 */
function extractPair($, chunk) {
  const tables = chunk.find('table').toArray()
  for (let i = 0; i < tables.length - 1; i++) {
    const a = tables[i]
    const b = tables[i + 1]
    if (!isRepBodyweightTable($, a)) continue
    const bw = parseBWTable($, a)
    const age = parseAgeTable($, b)
    if (bw && age) return { byBodyweightLb: bw, byAgeYears: age }
  }
  return null
}

/**
 * @param {import('cheerio').CheerioAPI} $
 * @param {RegExp} rx
 */
function sectionAfterHeading($, rx) {
  const h = $('h2').filter((_, e) => rx.test($(e).text())).first()
  if (!h.length) return null
  const nexth2 = h.nextAll('h2').first()
  return nexth2.length ? h.nextUntil(nexth2) : h.nextAll()
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'score-builder-harvest/1.0 (offline scoring; +author)' }
  })
  if (!res.ok) throw new Error(`${url} -> ${res.status}`)
  return res.text()
}

async function main() {
  const root = path.join(import.meta.dirname, '..')
  const outDir = path.join(root, 'data/strengthlevel')
  fs.mkdirSync(outDir, { recursive: true })

  for (const slug of SLUGS) {
    const url = `${BASE}/${slug}`
    const html = await fetchHtml(url)
    const $ = load(html)
    const hx = HEADINGS[slug]

    const maleChunk = sectionAfterHeading($, hx.male)
    const femaleChunk = sectionAfterHeading($, hx.female)

    const male = maleChunk ? extractPair($, maleChunk) : null
    const female = femaleChunk ? extractPair($, femaleChunk) : null

    const doc = {
      slug,
      sourceUrl: url,
      fetchedAt: new Date().toISOString(),
      unit: 'lb',
      legendPercentilesApprox: LEGEND_PERCENTILES,
      mergeRuleMvp:
        'Stricter percentile: min(percentile_from_bodyweight_table, percentile_from_age_table). Missing dimension: use the other table only.',
      male,
      female,
      pageTitle: $('title').first().text().trim()
    }

    if (!male?.byBodyweightLb?.length)
      console.warn(`WARN ${slug}: male tables missing`)
    if (!female?.byBodyweightLb?.length)
      console.warn(`WARN ${slug}: female tables missing`)

    const outfile = path.join(outDir, `${slug}.json`)
    fs.writeFileSync(outfile, JSON.stringify(doc, null, 2) + '\n')
    console.warn('wrote', path.relative(root, outfile))
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
