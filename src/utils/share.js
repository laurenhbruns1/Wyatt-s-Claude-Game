import { BADGE_DEFS } from './badges'
import { ROLE_LABELS, SLOTS } from '../data/constants'

export function buildShareText({ squad, result, badges, mode }) {
  const lines = []
  lines.push('UNDEFEATED — Season Result')
  lines.push(`Record: ${result.record.wins}-${result.record.losses}`)
  lines.push('')
  lines.push('Roster:')
  for (const slot of SLOTS) {
    const p = squad[slot.id]
    if (p) {
      const region = p.region || 'All-Time'
      lines.push(`  ${ROLE_LABELS[slot.id]}: ${p.name}${p.org ? ` (${p.org})` : ''} — ${region}`)
    }
  }
  lines.push('')
  lines.push(`MVP: ${result.mvp.name}`)
  if (result.firstLoss) {
    lines.push(`Fell apart at ${result.firstLoss.tourneyName}: ${result.firstLoss.note}`)
  } else {
    lines.push('Ran the table — perfect season.')
  }
  if (badges.length) {
    lines.push('')
    lines.push(`Badges: ${badges.map((b) => BADGE_DEFS[b].label).join(', ')}`)
  }
  lines.push('')
  lines.push(`Mode: ${mode}`)
  return lines.join('\n')
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
