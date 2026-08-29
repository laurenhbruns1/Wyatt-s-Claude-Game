import { applyFit } from './fit'
import {
  REGION_STRENGTH,
  RIVAL_ORG_PAIRS,
  SLOTS,
  TOURNAMENT_NAMES,
  TOURNAMENTS_PER_SEASON,
} from '../data/constants'

const FIELD_SLOTS = SLOTS.filter((s) => !s.isCoach)
const COACH_SLOT = SLOTS.find((s) => s.isCoach)

function weightedScore(stats, weights) {
  let num = 0
  let den = 0
  for (const key of Object.keys(stats)) {
    const w = weights[key] ?? 1
    num += stats[key] * w
    den += w
  }
  return num / den
}

function gaussian(rng) {
  // Box-Muller
  const u = Math.max(rng(), 1e-9)
  const v = Math.max(rng(), 1e-9)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

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

/** Builds per-slot effective (fit + format adjusted) profiles for a squad. */
export function buildEffectiveSquad(squad, format) {
  const effective = {}
  for (const slot of SLOTS) {
    const player = squad[slot.id]
    if (!player) continue
    const statBlock = player.format_stats[format] || player.stats
    const { adjusted, level, penalty } = applyFit(statBlock, slot, player)
    effective[slot.id] = { player, slot, stats: adjusted, fitLevel: level, fitPenalty: penalty }
  }
  return effective
}

function countSynergy(squad) {
  const players = Object.values(squad).filter(Boolean)
  let bonus = 0
  const notes = []
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      if (players[i].org && players[i].org === players[j].org) {
        bonus += 2
        notes.push(`${players[i].name} & ${players[j].name} have scrimmed together at ${players[i].org}.`)
      }
    }
  }
  return { bonus, notes }
}

function countRivalry(squad) {
  const players = Object.values(squad).filter(Boolean)
  let penalty = 0
  const notes = []
  for (const [a, b] of RIVAL_ORG_PAIRS) {
    const hasA = players.some((p) => p.org === a)
    const hasB = players.some((p) => p.org === b)
    if (hasA && hasB) {
      penalty += 3
      notes.push(`Bad blood between ${a} and ${b} signees is causing friction.`)
    }
  }
  return { penalty, notes }
}

const FALLAPART_FLAVOR = {
  fragger: [
    '{name} whiffs the winning fight and gets third-partied off spawn.',
    '{name} pushes a fight with no mats to fall back on and pays for it.',
  ],
  igl: [
    'A late rotation call from {name} leaves the squad split across the map.',
    '{name} calls the wrong zone push and the storm closes in behind them.',
  ],
  builder: [
    '{name} whiffs an edit under pressure and eats a shotgun through the wall.',
    'A piece-control error from {name} loses the high ground at the worst time.',
  ],
  rotator: [
    '{name} gets caught in the open storm surge with nowhere to rotate to.',
    '{name} takes the wrong lane back and gets collapsed on by three teams.',
  ],
  coach: [
    'A communication breakdown mid-match leaves the team without a plan.',
    '{name} clocks a no-show right before the bracket reset — the squad plays a player down.',
  ],
}

function fallApartMoment(effectiveSquad, rng) {
  let worst = null
  for (const slotId of Object.keys(effectiveSquad)) {
    const entry = effectiveSquad[slotId]
    const score = Object.values(entry.stats).reduce((a, b) => a + b, 0) / 5
    const roll = score - gaussian(rng) * 8
    if (!worst || roll < worst.roll) worst = { slotId, roll, entry }
  }
  const pool = FALLAPART_FLAVOR[worst.slotId]
  const template = pool[Math.floor(rng() * pool.length)]
  return template.replace('{name}', worst.entry.player.name)
}

const CLUTCH_FLAVOR = [
  '{name} clutches a 1v3 to steal the win at the death.',
  'A last-second edit-peek from {name} turns the game around.',
  '{name} reads the final zone perfectly and closes it out.',
]

/**
 * Simulates a full season. `seed` makes it reproducible (used for Daily
 * Challenge); omit for a fresh random run each time.
 */
export function simulateSeason({ squad, format, playstyle, region, mode, seed }) {
  const rng = mulberry32(seed ?? Math.floor(Math.random() * 2 ** 31))
  const effectiveSquad = buildEffectiveSquad(squad, format)

  const fieldScores = FIELD_SLOTS.map((slot) => {
    const entry = effectiveSquad[slot.id]
    return { slot, entry, score: weightedScore(entry.stats, playstyle.weights) }
  })
  const squadScore = fieldScores.reduce((a, f) => a + f.score, 0) / fieldScores.length

  const coachEntry = effectiveSquad[COACH_SLOT.id]
  const coachBoost = coachEntry
    ? ((coachEntry.stats.smarts + coachEntry.stats.clutch) / 2 / 100) * coachEntry.fitPenalty
    : 0

  const { bonus: synergyBonus, notes: synergyNotes } = countSynergy(squad)
  const { penalty: rivalryPenalty, notes: rivalryNotes } = countRivalry(squad)

  const regionMod = REGION_STRENGTH[region] ?? 0.5
  const opponentBaseline = 50 + regionMod * 14
  const smartsAvg =
    fieldScores.reduce((a, f) => a + f.entry.stats.smarts, 0) / fieldScores.length
  const clutchAvg = fieldScores.reduce((a, f) => a + f.entry.stats.clutch, 0) / fieldScores.length
  const spread = 14 * (1 - smartsAvg / 140)

  const events = []
  let wins = 0
  let losses = 0
  let firstLoss = null
  const usedNames = new Set()

  for (let i = 0; i < TOURNAMENTS_PER_SEASON; i++) {
    let tourneyName = TOURNAMENT_NAMES[i % TOURNAMENT_NAMES.length]
    if (usedNames.has(tourneyName)) tourneyName = `${tourneyName} II`
    usedNames.add(tourneyName)

    const performance =
      squadScore + synergyBonus - rivalryPenalty + coachBoost * 10 + gaussian(rng) * spread
    const opponentRoll = opponentBaseline + gaussian(rng) * 10
    let margin = performance - opponentRoll
    let win = margin > 0
    let clutchSave = false

    // Close loss can be rescued by clutch factor.
    if (!win && margin > -6 && rng() < clutchAvg / 140) {
      win = true
      clutchSave = true
      margin = Math.abs(margin) + 0.5
    }

    let note = null
    if (clutchSave) {
      const clutchEntry = fieldScores.reduce((best, f) =>
        f.entry.stats.clutch > best.entry.stats.clutch ? f : best,
      )
      note = CLUTCH_FLAVOR[Math.floor(rng() * CLUTCH_FLAVOR.length)].replace(
        '{name}',
        clutchEntry.entry.player.name,
      )
    } else if (!win) {
      note = fallApartMoment(effectiveSquad, rng)
    }

    const hype = win
      ? Math.min(100, 55 + Math.abs(margin) * 2 + (clutchSave ? 25 : 0))
      : Math.max(5, 35 - Math.abs(margin) * 1.5)

    if (win) wins++
    else {
      losses++
      if (!firstLoss) {
        firstLoss = { eventIndex: i, tourneyName, note, margin }
      }
    }

    events.push({
      index: i,
      name: tourneyName,
      win,
      clutchSave,
      margin: Math.round(margin * 10) / 10,
      hype: Math.round(hype),
      note,
    })
  }

  const mvpEntry = fieldScores.reduce((best, f) => (f.score > best.score ? f : best))
  const mvp = mvpEntry.entry.player

  const closestLoss = events
    .filter((e) => !e.win)
    .reduce((closest, e) => (!closest || Math.abs(e.margin) < Math.abs(closest.margin) ? e : closest), null)

  return {
    events,
    record: { wins, losses },
    squadScore: Math.round(squadScore * 10) / 10,
    coachBoost: Math.round(coachBoost * 100),
    synergyNotes,
    rivalryNotes,
    mvp,
    firstLoss,
    closestLoss,
    effectiveSquad,
    mode,
    format,
    region,
    seed,
  }
}
