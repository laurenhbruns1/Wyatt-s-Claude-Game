// Imports a CSV of real competitive Fortnite players (as supplied by the
// user) into src/data/players.json. Re-runnable: existing entries (by id)
// are left untouched, new rows are appended.
//
// Usage: node scripts/import-real-players.mjs path/to/chapter.csv
//
// Expected CSV columns (header row required):
//   Player ID,Player,Chapter,Region,Fighting,Aim,Mechanics,Smarts,Clutch
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_PATH = path.join(__dirname, '..', 'src', 'data', 'players.json')

const csvPath = process.argv[2]
if (!csvPath) {
  console.error('Usage: node scripts/import-real-players.mjs path/to/chapter.csv')
  process.exit(1)
}

// User-facing region label -> canonical region name used by the game.
const REGION_MAP = {
  'NAE/NAC': 'NA Central',
  NAE: 'NA Central',
  NAC: 'NA Central',
  'NA CENTRAL': 'NA Central',
  EU: 'Europe',
  EUROPE: 'Europe',
  NAW: 'NA West',
  'NA WEST': 'NA West',
  ASIA: 'Asia',
  'MIDDLE EAST': 'Middle East',
  BRASIL: 'Brazil',
  BRAZIL: 'Brazil',
  OCE: 'Oceania',
  OCEANIA: 'Oceania',
}

function normalizeRegion(raw) {
  const key = raw.trim().toUpperCase()
  const mapped = REGION_MAP[key]
  if (!mapped) throw new Error(`Unrecognized region "${raw}" — add it to REGION_MAP in this script.`)
  return mapped
}

function normalizeChapter(raw) {
  const match = raw.trim().match(/(\d+)/)
  if (!match) throw new Error(`Unrecognized chapter "${raw}"`)
  return `Chapter ${match[1]}`
}

function slug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

// Parses simple comma-separated rows (no quoted-field support needed — the
// source data doesn't contain embedded commas).
function parseCsv(text) {
  const lines = text.trim().split('\n').filter((l) => l.trim().length)
  const header = lines[0].split(',').map((h) => h.trim())
  return lines.slice(1).map((line) => {
    const cells = line.split(',').map((c) => c.trim())
    const row = {}
    header.forEach((h, i) => (row[h] = cells[i]))
    return row
  })
}

// A player is locked to exactly one slot, whichever of their stats (Clutch
// excluded — that's sim-only, not a role driver) is highest: Fighting ->
// Fragger, Aim -> Rotator, Mechanics -> Builder, Smarts -> IGL. Ties go to
// the first entry below tied for the max.
const STAT_TO_ROLE = [
  ['fighting', 'fragger'],
  ['aim', 'rotator'],
  ['mechanics', 'builder'],
  ['smarts', 'igl'],
]

function inferRoleTags(stats) {
  let bestRole = STAT_TO_ROLE[0][1]
  let bestVal = -Infinity
  for (const [key, role] of STAT_TO_ROLE) {
    if (stats[key] > bestVal) {
      bestVal = stats[key]
      bestRole = role
    }
  }
  return [bestRole]
}

const rows = parseCsv(readFileSync(csvPath, 'utf8'))

let existing = []
if (existsSync(OUT_PATH)) {
  existing = JSON.parse(readFileSync(OUT_PATH, 'utf8'))
}
const existingIds = new Set(existing.map((p) => p.id))

let added = 0
let skipped = 0

for (const row of rows) {
  const region = normalizeRegion(row.Region)
  const chapter = normalizeChapter(row.Chapter)
  const playerId = row['Player ID']
  const id = `${playerId}__${slug(region)}__${slug(chapter)}`

  if (existingIds.has(id)) {
    skipped++
    continue
  }

  const stats = {
    fighting: Number(row.Fighting),
    aim: Number(row.Aim),
    mechanics: Number(row.Mechanics),
    smarts: Number(row.Smarts),
    clutch: Number(row.Clutch),
  }
  for (const [k, v] of Object.entries(stats)) {
    if (Number.isNaN(v)) throw new Error(`Bad ${k} value for row: ${JSON.stringify(row)}`)
  }

  const roleTags = inferRoleTags(stats)

  existing.push({
    id,
    player_id: playerId,
    name: row.Player,
    region,
    chapter,
    org: '',
    role_tags: roleTags,
    stats,
    flavor_text: `${row.Player} competed for ${region} in ${chapter}.`,
    real: true,
  })
  existingIds.add(id)
  added++
}

writeFileSync(OUT_PATH, JSON.stringify(existing, null, 2))
console.log(`Added ${added} players, skipped ${skipped} already-present ids. Total now: ${existing.length}`)
