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

  // Chapter 3
  'rexzi_001__na_west__chapter_3': 'fragger', // NA West had no Fragger
  'yumi_001__na_west__chapter_3': 'igl', // NA West had no IGL
  'basil_001__oceania__chapter_3': 'igl', // Oceania had no IGL
  'jace_001__oceania__chapter_3': 'builder', // Oceania had no Builder
  'retake_001__brazil__chapter_3': 'igl', // Brazil had no IGL
  'nutifps_001__brazil__chapter_3': 'builder', // Brazil had no Builder
  'albedo_001__asia__chapter_3': 'fragger', // Asia had no Fragger
  'merem_001__asia__chapter_3': 'builder', // Asia had no Builder
  'tacky_001__middle_east__chapter_3': 'igl', // Middle East had no IGL
  'nachiiri_001__middle_east__chapter_3': 'builder', // Middle East had no Builder

  // Chapter 4
  'paper_001__na_west__chapter_4': 'fragger', // NA West had no Fragger
  'kewl_001__na_west__chapter_4': 'igl', // NA West had no IGL
  'sorif_001__oceania__chapter_4': 'igl', // Oceania had no IGL
  'suns_001__oceania__chapter_4': 'builder', // Oceania had no Builder
  'scarpa_001__brazil__chapter_4': 'igl', // Brazil had no IGL
  'nutifps_001__brazil__chapter_4': 'builder', // Brazil had no Builder
  'larkpex_001__asia__chapter_4': 'fragger', // Asia had no Fragger
  'bobi_001__asia__chapter_4': 'builder', // Asia had no Builder
  'hellonsteam_001__middle_east__chapter_4': 'igl', // Middle East had no IGL
  'phantom_001__middle_east__chapter_4': 'builder', // Middle East had no Builder

  // Chapter 5
  'czb_001__europe__chapter_5': 'fragger', // Europe had no Fragger
  'skyboy_001__europe__chapter_5': 'builder', // Europe had no Builder
  'deymo_001__oceania__chapter_5': 'igl', // Oceania had no IGL
  'aspect_001__oceania__chapter_5': 'builder', // Oceania had no Builder
  'seeyun_001__brazil__chapter_5': 'igl', // Brazil had no IGL
  'stryker_001__brazil__chapter_5': 'builder', // Brazil had no Builder
  'xmipoli_001__asia__chapter_5': 'fragger', // Asia had no Fragger
  'job_001__asia__chapter_5': 'builder', // Asia had no Builder
  'hellonsteam_001__middle_east__chapter_5': 'igl', // Middle East had no IGL
  'rv_001__middle_east__chapter_5': 'builder', // Middle East had no Builder

  // Chapter 6
  'pixx_001__europe__chapter_6': 'igl', // Europe had no IGL
  'fredoxie_001__europe__chapter_6': 'builder', // Europe had no Builder
  'ryderjohnson_001__na_west__chapter_6': 'fragger', // NA West had no Fragger
  'sxhool_001__na_west__chapter_6': 'igl', // NA West had no IGL
  'anon_001__oceania__chapter_6': 'igl', // Oceania had no IGL
  'skits_001__oceania__chapter_6': 'builder', // Oceania had no Builder
  'seeyun_001__brazil__chapter_6': 'igl', // Brazil had no IGL
  'stryker_001__brazil__chapter_6': 'builder', // Brazil had no Builder
  'kimkana_001__asia__chapter_6': 'fragger', // Asia had no Fragger
  'osama_001__middle_east__chapter_6': 'fragger', // Middle East had no Fragger
  'battal_001__middle_east__chapter_6': 'igl', // Middle East had no IGL
  'rew_001__middle_east__chapter_6': 'builder', // Middle East had no Builder

  // Chapter 7
  'shur4_001__europe__chapter_7': 'fragger', // Europe had no Fragger
  'joshbot_001__europe__chapter_7': 'igl', // Europe had no IGL
  'repairs_001__europe__chapter_7': 'builder', // Europe had no Builder
  'oatley_001__oceania__chapter_7': 'fragger', // Oceania had no Fragger
  'star_001__oceania__chapter_7': 'igl', // Oceania had no IGL
  'mxnty_001__oceania__chapter_7': 'builder', // Oceania had no Builder
  'axadasz_001__brazil__chapter_7': 'fragger', // Brazil had no Fragger
  'edson_001__brazil__chapter_7': 'igl', // Brazil had no IGL
  'night_001__brazil__chapter_7': 'builder', // Brazil had no Builder
  'noelcap_001__asia__chapter_7': 'fragger', // Asia had no Fragger
  'vix_001__middle_east__chapter_7': 'fragger', // Middle East had no Fragger
  'cubix_001__middle_east__chapter_7': 'igl', // Middle East had no IGL
  'saad_001__middle_east__chapter_7': 'builder', // Middle East had no Builder

  // Clutch stopped counting toward Fragger (Fighting is now the only route
  // in) — these regions' only Fragger had gotten there via a Clutch-highest
  // stat line, so they lost their sole Fragger once that stopped applying.
  'gordinn_001__brazil__chapter_1': 'fragger', // Brazil had no Fragger after Clutch stopped counting
  'jahq_001__na_central__chapter_2': 'fragger', // NA Central had no Fragger after Clutch stopped counting
  'looter_001__oceania__chapter_2': 'fragger', // Oceania had no Fragger after Clutch stopped counting
  'seeyun_001__brazil__chapter_2': 'fragger', // Brazil had no Fragger after Clutch stopped counting
  'wildhawk_001__asia__chapter_2': 'fragger', // Asia had no Fragger after Clutch stopped counting
  'kai_001__middle_east__chapter_2': 'fragger', // Middle East had no Fragger after Clutch stopped counting
  'sunz_001__oceania__chapter_3': 'fragger', // Oceania had no Fragger after Clutch stopped counting
  'barroso_001__brazil__chapter_3': 'fragger', // Brazil had no Fragger after Clutch stopped counting
  'balor_001__middle_east__chapter_3': 'fragger', // Middle East had no Fragger after Clutch stopped counting
  'oreo_001__oceania__chapter_4': 'fragger', // Oceania had no Fragger after Clutch stopped counting
  'kitoz_001__brazil__chapter_4': 'fragger', // Brazil had no Fragger after Clutch stopped counting
  'nachiiri_001__middle_east__chapter_4': 'fragger', // Middle East had no Fragger after Clutch stopped counting
  'threats_001__na_central__chapter_5': 'fragger', // NA Central had no Fragger after Clutch stopped counting
  'cazi_001__oceania__chapter_5': 'fragger', // Oceania had no Fragger after Clutch stopped counting
  'diguera_001__brazil__chapter_5': 'fragger', // Brazil had no Fragger after Clutch stopped counting
  'salva_001__middle_east__chapter_5': 'fragger', // Middle East had no Fragger after Clutch stopped counting
  'mariuscow_001__europe__chapter_6': 'fragger', // Europe had no Fragger after Clutch stopped counting
  'mace_001__oceania__chapter_6': 'fragger', // Oceania had no Fragger after Clutch stopped counting
  'diguera_001__brazil__chapter_6': 'fragger', // Brazil had no Fragger after Clutch stopped counting

  // Requested overrides (not gap-fills — the region already had this role
  // covered by someone else; this is just a deliberate reassignment)
  'bugha_001__na_central__chapter_3': 'igl', // was fragger by stats (clutch highest)
  'malibuca_001__europe__chapter_7': 'igl', // was fragger by stats (elite-overall tier)
  't3eny_001__europe__chapter_7': 'igl', // was fragger by stats (elite-overall tier)
  'kami_001__europe__chapter_7': 'igl', // was rotator by stats (aim highest)
  'sky_001__europe__chapter_7': 'igl', // was rotator by stats (aim highest)
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
