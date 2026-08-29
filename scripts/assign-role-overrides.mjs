// Manually reassigns specific players' locked role, overriding the
// stat-derived pick from computeNaturalRole. Used to patch region/chapter
// combos that are missing a role entirely (no player's highest stat
// happens to land there) — pick a real player already in that region,
// usually a lower/mid-stat one so it doesn't hand them an unearned edge,
// and assign them into the missing role by hand.
//
// Usage: edit OVERRIDES below (id -> new role), then run:
//   node scripts/assign-role-overrides.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_PATH = path.join(__dirname, '..', 'src', 'data', 'players.json')

// player id -> role to force them into (overrides their stat-derived role)
const OVERRIDES = {
  kiryache_001: 'igl', // Europe had no IGL
  thegeneral_001_NAW: 'rotator', // NA West had no Rotator
  sexyboy_001: 'builder', // Asia had no Builder
  cat_001: 'builder', // Oceania had no Builder
  speedynd_001: 'rotator', // Oceania had no Rotator
  gustavo_001: 'igl', // Brazil had no IGL
  sheco_001: 'builder', // Brazil had no Builder
  p5ek_001: 'igl', // Middle East had no IGL
  rapit_001: 'builder', // Middle East had no Builder
}

const players = JSON.parse(readFileSync(DATA_PATH, 'utf8'))
let applied = 0

for (const p of players) {
  const role = OVERRIDES[p.player_id]
  if (!role) continue
  p.role_tags = [role]
  p.role_assigned = true
  applied++
}

writeFileSync(DATA_PATH, JSON.stringify(players, null, 2))
console.log(`Applied ${applied} of ${Object.keys(OVERRIDES).length} overrides.`)
