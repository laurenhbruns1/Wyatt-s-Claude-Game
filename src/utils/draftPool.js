import players from '../data/players.json'
import { CHAPTERS, FORMATS, REGIONS } from '../data/constants'
import { mulberry32, pickWith, seedFromString, shuffleWith, todayKey } from './random'

/** A spin result: region + chapter + format, drawn randomly (or seeded). */
export function spinCombo(rng = Math.random) {
  const roll = (arr) => arr[Math.floor(rng() * arr.length)]
  return {
    region: roll(REGIONS),
    chapter: roll(CHAPTERS),
    format: roll(FORMATS).id,
  }
}

export function todaysSeed() {
  return seedFromString(todayKey())
}

export function spinComboForDaily() {
  const rng = mulberry32(todaysSeed())
  return spinCombo(rng)
}

/** Players eligible for a given region/chapter/format combo. */
export function poolFor({ region, chapter, format, ultimate = false }) {
  let pool = ultimate ? dedupeByPlayerId(players) : players.filter((p) => p.region === region && p.chapter === chapter)
  return pool.map((p) => ({ ...p, _format: format }))
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
export function dailyPool(combo) {
  const rng = mulberry32(todaysSeed() + 1)
  const full = poolFor(combo)
  const shuffled = shuffleWith(full, rng)
  return shuffled.slice(0, Math.min(14, shuffled.length))
}

export function pickRandomPlayer(pool, rng = Math.random) {
  return pickWith(pool, rng)
}
