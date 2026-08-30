// Manually reassigns specific players' locked role, overriding the
// stat-derived pick from computeNaturalRole. Used to patch region/chapter
// combos that are missing a role entirely (no player's highest stat
// happens to land there) — pick a real player already in that region,
// usually a lower/mid-stat one so it doesn't hand them an unearned edge,
// and assign them into the missing role by hand.
//
// Keyed by the full player `id` (player_id + region + chapter), NOT just
// player_id — a player can reappear in a later chapter under the same
// player_id (e.g. TheGeneral in both Chapter 1 and Chapter 2 NA West), and
// each chapter's row needs its own independent role, not whatever an
// earlier chapter's override happened to be.
//
// Usage: add entries to OVERRIDES below (full id -> new role), then run:
//   node scripts/assign-role-overrides.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_PATH = path.join(__dirname, '..', 'src', 'data', 'players.json')

// full player id -> role to force them into (overrides their stat-derived role)
const OVERRIDES = {
  // Chapter 1
  'kiryache_001__europe__chapter_1': 'igl', // Europe had no IGL
  'thegeneral_001_NAW__na_west__chapter_1': 'rotator', // NA West had no Rotator
  'sexyboy_001__asia__chapter_1': 'builder', // Asia had no Builder
  'cat_001__oceania__chapter_1': 'builder', // Oceania had no Builder
  'speedynd_001__oceania__chapter_1': 'rotator', // Oceania had no Rotator
  'gustavo_001__brazil__chapter_1': 'igl', // Brazil had no IGL
  'sheco_001__brazil__chapter_1': 'builder', // Brazil had no Builder
  'p5ek_001__middle_east__chapter_1': 'igl', // Middle East had no IGL
  'rapit_001__middle_east__chapter_1': 'builder', // Middle East had no Builder

  // Chapter 2
  'stormyrite_001__europe__chapter_2': 'builder', // Europe had no Builder
  'painful_001_NAW__na_west__chapter_2': 'igl', // NA West had no IGL
  'speedy_001__oceania__chapter_2': 'igl', // Oceania had no IGL
  'gsx_001__brazil__chapter_2': 'igl', // Brazil had no IGL
  'opai_001__brazil__chapter_2': 'builder', // Brazil had no Builder
  'allen_001__asia__chapter_2': 'builder', // Asia had no Builder
  'hellonsteam_001__middle_east__chapter_2': 'igl', // Middle East had no IGL
  'abufal7_001__middle_east__chapter_2': 'builder', // Middle East had no Builder
}

const players = JSON.parse(readFileSync(DATA_PATH, 'utf8'))
let applied = 0

for (const p of players) {
  const role = OVERRIDES[p.id]
  if (!role) continue
  p.role_tags = [role]
  p.role_assigned = true
  applied++
}

writeFileSync(DATA_PATH, JSON.stringify(players, null, 2))
console.log(`Applied ${applied} of ${Object.keys(OVERRIDES).length} overrides.`)
