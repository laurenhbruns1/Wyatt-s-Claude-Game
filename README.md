# Undefeated — Fortnite Roster Builder

Spin a region + chapter, draft a four-slot competitive Fortnite squad from
everyone eligible, and simulate a season to see if it runs the table.

Inspired by the "82-0" NBA roster-builder concept, reskinned for competitive
Fortnite (regions, chapters/eras).

## Data

Players in `src/data/players.json` are **real competitive Fortnite players**,
supplied chapter-by-chapter (currently just Chapter 1) with real stats for
five categories: Fighting, Aim, Mechanics, Smarts, Clutch.

A few things about this data that are worth knowing:

- **Region names are normalized** to the game's 7-region list (`NA Central`,
  `NA West`, `Europe`, `Oceania`, `Brazil`, `Middle East`, `Asia`) — e.g. the
  source data's `NAE/NAC` becomes `NA Central`.
- **Org/team affiliation isn't included** in the source data, so `org` is
  blank for every player — the org-synergy bonus simply won't trigger until
  orgs are added.
- **Each player is locked to exactly one slot**, whichever of their 5 stats
  is highest: Fighting or Clutch → Fragger, Aim → Rotator, Mechanics →
  Builder/Editor, Smarts → IGL (see `computeNaturalRole` in
  `src/utils/fit.js`). This is a hard lock, not a soft preference.
- A player can be **eligible in more than one region** under the same
  `player_id` (e.g. a player who competed in both NA Central and Europe) —
  Ultimate mode de-dupes these down to one card.
- **The squad has no Coach slot** — just Fragger, IGL, Builder/Editor,
  Rotator. There's no Build/Zero Build split either — one stat profile per
  player.

**Drafting works two different ways depending on mode.** In Classic, Blind,
Daily, and Ultimate: one spin covers the whole draft, and everyone eligible
is shown at once — click anyone and they lock into whichever slot their
best stat fits; picking one crosses them off (and greys out anyone else who
locked to that now-filled slot), and the draft ends once all 4 slots are
filled, regardless of pick order. **Rotation mode works differently on
purpose**: it walks the 4 slots in a fixed order, re-spinning before each
one, and keeps the older flexible fit system (any player, any slot, but a
natural-fit pick is locked out and an off-role pick takes a stat penalty)
since its whole premise is drafting off-role — the hard lock elsewhere
would make that impossible.

**The spin only offers chapters that actually have players loaded** (see
`AVAILABLE_CHAPTERS` in `src/utils/draftPool.js`) — right now that's just
Chapter 1, so every spin lands there. This opens up automatically as more
chapters are imported; no need to toggle anything by hand.

To add another chapter's players, save a CSV with columns
`Player ID,Player,Chapter,Region,Fighting,Aim,Mechanics,Smarts,Clutch` and run:

```
node scripts/import-real-players.mjs path/to/chapterN.csv
```

It's additive and safe to re-run — existing player IDs are left untouched,
only new rows get appended.

## Modes

- **Classic** — full stats visible while drafting
- **Blind Draft** — only names shown, no stats
- **Rotation** — every slot must be filled by an off-role player
- **Daily Challenge** — same seeded spin/pool (or 4 seeded spins, in Rotation) for everyone that day
- **Ultimate/All-Time** — draft across every region and chapter

## Tech

React + Tailwind CSS (v4, via `@tailwindcss/vite`), Vite, client-side only
(localStorage for best-record + Daily Challenge history — no backend).

## Development

```
npm install
npm run dev      # start dev server
npm run build    # production build
npm run lint     # oxlint
```
