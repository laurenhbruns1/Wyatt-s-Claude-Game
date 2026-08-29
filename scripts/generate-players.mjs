// Generates src/data/players.json — a pool of FICTIONAL competitive Fortnite
// players (no real players/orgs are represented). Deterministically seeded so
// the roster pool is stable across regenerations.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// --- deterministic PRNG (mulberry32) -------------------------------------
function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(82008)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const int = (min, max) => Math.floor(rand() * (max - min + 1)) + min
const clamp = (n, lo = 1, hi = 99) => Math.max(lo, Math.min(hi, Math.round(n)))
const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const REGIONS = [
  'NA East', 'NA West', 'NA Central', 'Europe', 'Oceania', 'Brazil', 'Middle East', 'Asia',
]
const CHAPTERS = ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5', 'Chapter 6', 'Chapter 7']
const ROLES = ['fragger', 'igl', 'builder', 'rotator', 'coach']

// --- name generation -------------------------------------------------------
const TAG_PREFIX = [
  'Vex', 'Kryo', 'Nyx', 'Zeph', 'Rook', 'Fable', 'Ember', 'Glitch', 'Drift', 'Vale',
  'Onyx', 'Snap', 'Ashen', 'Nova', 'Quill', 'Static', 'Rune', 'Grim', 'Lull', 'Pyre',
  'Wisp', 'Cobalt', 'Thorne', 'Marrow', 'Ivory', 'Sable', 'Fenn', 'Halo', 'Crux', 'Sol',
  'Mirth', 'Reef', 'Talon', 'Vesper', 'Wraith', 'Ozone', 'Brisk', 'Cinder', 'Dune', 'Echo',
  'Flare', 'Grove', 'Hollow', 'Iris', 'Jolt', 'Knell', 'Lark', 'Moth', 'Nimbus', 'Opal',
]
const TAG_SUFFIX = [
  'zy', 'ix', 'ux', 'o', 'ee', 'ash', 'ra', 'on', 'is', 'ov',
  'ith', 'yn', 'ez', 'aa', 'ku', 'ev', 'to', 'la', 'im', 'ez',
]
const TAG_STANDALONE = [
  'Ruin', 'Habit', 'Marble', 'Ghost', 'Static', 'Nomad', 'Relic', 'Fixture', 'Voltage', 'Halcyon',
  'Ledger', 'Compass', 'Ember', 'Northlight', 'Fable', 'Rift', 'Undertow', 'Beacon', 'Faultline', 'Meridian',
]

const usedNames = new Set()
function genName() {
  let name
  let guard = 0
  do {
    if (rand() < 0.25 && guard < 50) {
      name = pick(TAG_STANDALONE)
    } else {
      name = pick(TAG_PREFIX) + pick(TAG_SUFFIX)
    }
    guard++
  } while (usedNames.has(name) && guard < 200)
  usedNames.add(name + guard)
  usedNames.add(name)
  return name
}

// --- orgs -------------------------------------------------------------------
const ORG_NAMES = [
  'Voidbound', 'Ironclad Union', 'Nightfall Six', 'Solstice Prime', 'Rustline', 'Aurelia Rift',
  'Kingsmark', 'Driftwood Collective', 'Paragon Circuit', 'Lowtide Esports', 'Vantage Point',
  'Redline Society', 'Glasswing', 'Fault Line Gaming', 'Harbor & Co', 'Zenith Row',
  'Static Age', 'Coastal Order', 'Bramblewood', 'Longshadow', 'Meridian Six', 'Frostgate',
]
const ORGS = ORG_NAMES.map((name, i) => ({
  name,
  homeRegion: REGIONS[i % REGIONS.length],
}))
function pickOrg(region) {
  if (rand() < 0.7) {
    const homeOrgs = ORGS.filter((o) => o.homeRegion === region)
    if (homeOrgs.length) return pick(homeOrgs).name
  }
  return pick(ORGS).name
}

// --- flavor text ------------------------------------------------------------
const FLAVOR_BY_ROLE = {
  fragger: [
    '{name} lives for the third-party — always first into the fight.',
    'Known across {region} for closing out box fights nobody else survives.',
    '{name} treats every endgame like a highlight reel audition.',
  ],
  igl: [
    '{name} calls rotations before the storm circle even shows.',
    'The quiet voice in comms that somehow always calls the right push.',
    '{name} would rather win ugly than lose pretty.',
  ],
  builder: [
    '{name} can 90 to a box before you finish reading this sentence.',
    'Editing so fast the replay cam can barely keep up.',
    '{name} turns spare mats into free kills.',
  ],
  rotator: [
    '{name} has never once been caught in a bad storm cycle.',
    'Survives on rotations most teams would call cowardice — until the placement points land.',
    '{name} treats zone knowledge like a competitive advantage nobody else studied.',
  ],
  coach: [
    '{name} calls the macro from outside the game and somehow is always right.',
    'Keeps the team composed when a scrim lead turns into a live-bracket deficit.',
    '{name} has a scouting notebook thicker than the rulebook.',
  ],
}
function flavorFor(name, role, region) {
  const template = pick(FLAVOR_BY_ROLE[role])
  return template.replace('{name}', name).replace('{region}', region)
}

// --- stat generation ---------------------------------------------------------
const ROLE_BASE = {
  fragger: { fights: [70, 96], placement: [45, 70], consistency: [45, 72], clutch: [65, 95], mechanics: [55, 80] },
  igl: { fights: [45, 70], placement: [70, 95], consistency: [72, 96], clutch: [55, 82], mechanics: [50, 75] },
  builder: { fights: [50, 75], placement: [50, 75], consistency: [65, 88], clutch: [55, 80], mechanics: [78, 99] },
  rotator: { fights: [35, 60], placement: [75, 98], consistency: [70, 92], clutch: [50, 75], mechanics: [55, 78] },
  coach: { fights: [30, 55], placement: [40, 65], consistency: [60, 90], clutch: [55, 85], mechanics: [35, 60] },
}

function genBaseStats(role) {
  const range = ROLE_BASE[role]
  const out = {}
  for (const k of Object.keys(range)) {
    out[k] = int(range[k][0], range[k][1])
  }
  return out
}

// Each player skews toward build or zero-build. lean in [-1, 1]:
// +1 = strong build specialist, -1 = strong zero-build specialist.
function formatSplit(base, lean) {
  const buildBoost = lean * 12
  const zbBoost = -lean * 12
  return {
    build: {
      fights: clamp(base.fights + buildBoost * 0.4),
      placement: clamp(base.placement + buildBoost * 0.3),
      consistency: clamp(base.consistency + buildBoost * 0.5),
      clutch: clamp(base.clutch + buildBoost * 0.3),
      mechanics: clamp(base.mechanics + buildBoost * 0.9),
    },
    zero_build: {
      fights: clamp(base.fights + zbBoost * 0.7),
      placement: clamp(base.placement + zbBoost * 0.3),
      consistency: clamp(base.consistency + zbBoost * 0.4),
      clutch: clamp(base.clutch + zbBoost * 0.6),
      mechanics: clamp(base.mechanics + zbBoost * 0.2),
    },
  }
}

function avgStats(a, b) {
  const out = {}
  for (const k of Object.keys(a)) out[k] = clamp((a[k] + b[k]) / 2)
  return out
}

// role tags: a primary role plus ~35% chance of a plausible secondary
const SECONDARY_COMPAT = {
  fragger: ['builder', 'igl'],
  igl: ['rotator', 'coach'],
  builder: ['fragger', 'rotator'],
  rotator: ['igl', 'builder'],
  coach: ['igl'],
}

function chapterSpan(startIdx) {
  // active for this chapter and (usually) the next one too
  const span = [CHAPTERS[startIdx]]
  if (startIdx + 1 < CHAPTERS.length && rand() < 0.75) span.push(CHAPTERS[startIdx + 1])
  return span
}

const players = []
let idCounter = 1

for (const region of REGIONS) {
  for (let ci = 0; ci < CHAPTERS.length; ci++) {
    const chapter = CHAPTERS[ci]
    const roleBatch = shuffle(ROLES)
    // one of each role, plus extras so each combo has real draft depth
    const debutRoles = [...roleBatch, 'fragger', 'builder', 'rotator', 'igl']
    for (const role of debutRoles) {
      const name = genName()
      const roleTags = [role]
      if (rand() < 0.35) {
        const secondary = pick(SECONDARY_COMPAT[role])
        if (!roleTags.includes(secondary)) roleTags.push(secondary)
      }
      const base = genBaseStats(role)
      const lean = +(rand() * 2 - 1).toFixed(2)
      const format_stats = formatSplit(base, lean)
      const stats = avgStats(format_stats.build, format_stats.zero_build)
      const org = pickOrg(region)

      players.push({
        id: `p${idCounter++}`,
        name,
        region,
        chapter,
        active_chapters: chapterSpan(ci),
        org,
        role_tags: roleTags,
        format_lean: lean,
        format_stats,
        stats,
        flavor_text: flavorFor(name, role, region),
      })
    }
  }
}

const outPath = path.join(__dirname, '..', 'src', 'data', 'players.json')
writeFileSync(outPath, JSON.stringify(players, null, 2))
console.log(`Generated ${players.length} players -> ${outPath}`)

// sanity check: pool size per region+chapter combo
const REGIONS_SET = REGIONS
const pools = {}
for (const region of REGIONS_SET) {
  for (const chapter of CHAPTERS) {
    const pool = players.filter((p) => p.region === region && p.active_chapters.includes(chapter))
    pools[`${region} / ${chapter}`] = pool.length
  }
}
const sizes = Object.values(pools)
console.log('min pool size', Math.min(...sizes), 'max pool size', Math.max(...sizes))
