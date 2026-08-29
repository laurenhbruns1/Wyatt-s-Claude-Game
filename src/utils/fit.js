import { FIT_LEVELS, ROLE_ADJACENCY } from '../data/constants'

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
