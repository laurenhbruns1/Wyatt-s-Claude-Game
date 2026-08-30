// One-off migration: recomputes role_tags for every player whose role came
// from their own stats (role_assigned is NOT set) using the current
// STAT_TO_ROLE rule. Players with a manual override (role_assigned: true)
// are left untouched — those were deliberately hand-picked and don't
// follow the stat-derived rule anyway.
//
// Usage: node scripts/recompute-natural-roles.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_PATH = path.join(__dirname, '..', 'src', 'data', 'players.json')

// Must match src/utils/fit.js's computeNaturalRole exactly.
const STAT_TO_ROLE = [
  ['fighting', 'fragger'],
  ['aim', 'rotator'],
  ['mechanics', 'builder'],
  ['smarts', 'igl'],
]

function computeNaturalRole(stats) {
  let bestRole = STAT_TO_ROLE[0][1]
  let bestVal = -Infinity
  for (const [key, role] of STAT_TO_ROLE) {
    if (stats[key] > bestVal) {
      bestVal = stats[key]
      bestRole = role
    }
  }
  return bestRole
}

const players = JSON.parse(readFileSync(DATA_PATH, 'utf8'))
let changed = 0

for (const p of players) {
  if (p.role_assigned) continue
  const nextRole = computeNaturalRole(p.stats)
  if (p.role_tags[0] !== nextRole) {
    p.role_tags = [nextRole]
    changed++
  }
}

writeFileSync(DATA_PATH, JSON.stringify(players, null, 2))
console.log(`Recomputed roles for ${players.length} players, ${changed} changed.`)
