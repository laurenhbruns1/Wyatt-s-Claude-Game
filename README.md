# Undefeated — Fortnite Roster Builder

Spin a random region + chapter + format, draft a five-slot competitive
Fortnite squad, and simulate a season to see if it runs the table.

Inspired by the "82-0" NBA roster-builder concept, reskinned for competitive
Fortnite (Build vs. Zero Build, regions, chapters/eras).

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
- **Role tags (Fragger/IGL/Builder/Rotator) are inferred from the stat
  profile itself** — e.g. high Fighting+Aim → Fragger — not from verified
  real-world positions, since that wasn't supplied either. No player is ever
  auto-tagged "Coach" (none of these are documented coaches), so every real
  player takes an off-fit penalty if drafted into that slot.
- A player can be **eligible in more than one region** under the same
  `player_id` (e.g. a player who competed in both NA Central and Europe) —
  Ultimate mode de-dupes these down to one card.

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
- **Daily Challenge** — same seeded region/chapter/format/pool for everyone that day
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
