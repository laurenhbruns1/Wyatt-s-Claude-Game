import players from '../data/players.json'
import { CHAPTERS, REGIONS } from '../data/constants'
import { mulberry32, pickWith, seedFromString, shuffleWith, todayKey } from './random'

/** A spin result: region + chapter, drawn randomly (or seeded). */
export function spinCombo(rng = Math.random) {
  const roll = (arr) => arr[Math.floor(rng() * arr.length)]
  return {
    region: roll(REGIONS),
    chapter: roll(CHAPTERS),
  }
}

export function todaysSeed() {
  return seedFromString(todayKey())
}

/** Each draft slot re-spins, so Daily Challenge needs a distinct but
 * reproducible seed per slot — everyone gets the same 4 spins that day. */
export function spinComboForDaily(slotIndex = 0) {
  const rng = mulberry32(todaysSeed() + slotIndex * 2)
  return spinCombo(rng)
}

/** Players eligible for a given region/chapter combo. */
export function poolFor({ region, chapter, ultimate = false }) {
  return ultimate ? dedupeByPlayerId(players) : players.filter((p) => p.region === region && p.chapter === chapter)
}

/** Ultimate mode pools every region together — collapse a player who's
 * eligible in multiple regions (same player_id) down to one card. */
function dedupeByPlayerId(pool) {
  const seen = new Set()
  const out = []
  for (const p of pool) {
    const key = p.player_id ?? p.id
    if (seen.has(key)) continue
    seen.add(key)
    out.push(p)
  }
  return out
}

/** Daily Challenge: same combo + same trimmed pool (down to ~14) for everyone that day. */
export function dailyPool(combo, slotIndex = 0) {
  const rng = mulberry32(todaysSeed() + slotIndex * 2 + 1)
  const full = poolFor(combo)
  const shuffled = shuffleWith(full, rng)
  return shuffled.slice(0, Math.min(14, shuffled.length))
}

export function pickRandomPlayer(pool, rng = Math.random) {
  return pickWith(pool, rng)
}

/** Keeps a player from showing up twice across re-rolled slots. */
export function excludeDrafted(pool, squad) {
  const draftedIds = new Set(Object.values(squad).filter(Boolean).map((p) => p.player_id))
  return pool.filter((p) => !draftedIds.has(p.player_id))
}
