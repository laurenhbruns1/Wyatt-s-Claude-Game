export function shuffleWith(arr, rng) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pickWith(arr, rng) {
  return arr[Math.floor(rng() * arr.length)]
}

/** Picks one item from `items`, with each one's odds proportional to
 * `weightFn(item)` instead of every item having equal odds. Falls back to
 * a plain uniform pick if every weight comes back 0 (e.g. every option is
 * genuinely empty), rather than dividing by zero. */
export function weightedPickWith(items, weightFn, rng) {
  const weights = items.map(weightFn)
  const total = weights.reduce((sum, w) => sum + w, 0)
  if (total <= 0) return pickWith(items, rng)
  let roll = rng() * total
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i]
    if (roll < 0) return items[i]
  }
  return items[items.length - 1]
}
