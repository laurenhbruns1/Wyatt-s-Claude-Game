import { FIT_LEVELS, ROLE_ADJACENCY } from '../data/constants'

// Which stat, if it's a player's single highest, locks them to which slot.
// Ties go to the first entry here that's tied for the max (Fragger, then
// Rotator, then Builder, then IGL). Clutch does NOT lock anyone to Fragger —
// it's purely a tournament-sim stat (comeback mechanic), not a role driver;
// Fighting is the only route into Fragger.
const STAT_TO_ROLE = [
  ['fighting', 'fragger'],
  ['aim', 'rotator'],
  ['mechanics', 'builder'],
  ['smarts', 'igl'],
]

// A rare "elite overall" tier overrides the normal highest-stat lock: a
// player this stacked across the board (Fighting/Aim/Mechanics/Smarts, not
// just one specialty) plays like a Fragger regardless of which single stat
// happens to edge out the others — e.g. Chapter 1 Bugha (94/91/87/96), whose
// Smarts barely edges Fighting but who's clearly an elite fight-winner.
const ELITE_AVG_THRESHOLD = 86.5

function eliteAverage(stats) {
  return (stats.fighting + stats.aim + stats.mechanics + stats.smarts) / 4
}

/** The one slot a player's stat profile locks them into — whichever of
 * Fighting/Aim/Mechanics/Smarts is their single highest stat (Clutch is
 * excluded — it only matters in the season sim, not role assignment) —
 * unless they clear the elite-overall bar, which locks them to Fragger
 * outright. */
export function computeNaturalRole(stats) {
  if (eliteAverage(stats) >= ELITE_AVG_THRESHOLD) return 'fragger'
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

/** green = natural role, yellow = adjacent role, red = unrelated role. */
export function getFitLevel(player, slotId) {
  if (!player) return 'red'
  if (player.role_tags.includes(slotId)) return 'green'
  const adjacent = ROLE_ADJACENCY[slotId] || []
  if (player.role_tags.some((tag) => adjacent.includes(tag))) return 'yellow'
  return 'red'
}

export function getFitPenalty(level) {
  return FIT_LEVELS[level]?.penalty ?? 0.6
}

export function getFitLabel(level) {
  return FIT_LEVELS[level]?.label ?? 'Poor Fit'
}

/**
 * Returns a fit-adjusted copy of a player's stat block for the given slot.
 * Only the slot's `primaryStats` take the penalty — matching how a center
 * playing point guard still dribbles fine, they just can't shoot/handle at
 * the level the slot demands.
 */
export function applyFit(statBlock, slot, player) {
  const level = getFitLevel(player, slot.id)
  const penalty = getFitPenalty(level)
  const adjusted = { ...statBlock }
  for (const key of slot.primaryStats) {
    adjusted[key] = Math.round(statBlock[key] * penalty)
  }
  return { adjusted, level, penalty }
}
