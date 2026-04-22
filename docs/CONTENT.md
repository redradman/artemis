# Artemis II — Content Guide

Editorial reference for mission data flowing through the visualization. Pair
with `docs/DESIGN.md` for the visual rules.

## Sources of truth

Three PDFs under `docs/sources/` are the only citable origin for numbers, names,
and event timing:

- `artemis-ii-reference-guide.pdf` — full vehicle and mission overview; the
  program-level NASA guide covering crew, Orion, SLS, and the mission arc.
- `artemis-ii-timeline.pdf` — bookmarked milestones with T+ timestamps; a
  mission event cue-card across Flight Days FD01–FD10.
- `sls-reference-guide.pdf` — rocket-specific deep dive; hardware spec sheet
  for core stage, SRBs, RS-25, and ICPS.

## Data files

Mission content lives in `src/scenes/ArtemisII/data/`. Three sibling modules:
`phases.ts` (timeline events), `components.ts` (rocket parts + info-panel
copy), and `mission.ts` (top-level mission metadata — crew, duration, mission
title — consumed by the HUD).

```ts
// phases.ts
export type PhaseTier = 'major' | 'minor'
export type Phase = {
  id: string // slug, e.g. 'max-q'
  label: string // ALL-CAPS display text, e.g. 'MAX-Q'
  tier: PhaseTier // drives timeline visual weight
  tplus: string // 'T+HH:MM:SS', for status line
  t: number // 0..1 normalized position on the scrubber
}

// components.ts
export type ComponentInfo = {
  purpose: string // one-sentence, sentence case
  notes?: string // optional caveat/aside
  [key: string]: string | undefined // freeform spec rows (key -> value)
}
export type RocketComponent = {
  id: string // slug, e.g. 'core-lox'
  short: string // code shown in panel header, e.g. 'LOX'
  name: string // ALL-CAPS panel title, e.g. 'CORE · LOX TANK'
  info: ComponentInfo
}
```

`purpose` feeds the info-panel body paragraph. Other `info` keys render as
key/value spec rows, uppercased at render time (so author them in whatever case
reads best in source). `notes` renders italicized at the bottom of the panel.

## Writing guidelines

- Info-panel body copy (`purpose`): **30–50 words**, sentence case, one thought
  per panel. No marketing language.
- Spec keys: short codes, max 10 characters (`THRUST`, `BURN`, `PROP`).
  Values: always include units (`512 klb vac`, `126 s`, `–297 °F`).
- Every fact must be citable to one of the three PDFs in `docs/sources/`.
  Include the source filename and page in a code comment above the entry, or
  in a separate `notes` field if the provenance is ambiguous.
- Prefer NASA's numbers verbatim. When the two reference guides conflict,
  favour `sls-reference-guide.pdf` for hardware numbers and
  `artemis-ii-reference-guide.pdf` for mission-level numbers.

## How to add a new component

1. Build geometry in `src/scenes/ArtemisII/geometry/buildWire.ts` (and/or a
   file under `src/scenes/ArtemisII/parts/`).
2. Register the entry in `src/scenes/ArtemisII/data/components.ts` with `id`,
   `short`, `name`, `info.purpose`, and spec rows.
3. Add the part to `src/scenes/ArtemisII/Rocket.tsx` so it renders in the
   assembly.
4. Write info-panel content per the guidelines above — 30–50 words, sentence
   case, every number citable.
5. Verify label placement: the anchor position projects cleanly to screen and
   the leader label does not collide with neighbours.

## How to add a new mission phase

1. Register the event in `src/scenes/ArtemisII/data/phases.ts` with `id`,
   `label`, `tier`, `tplus`, and `t`.
2. Define the state change at that `t` value — jettison a part, fire engines,
   switch camera — in the relevant scene logic.
3. Add a timeline marker. The Timeline component already renders from the
   `phases` array, so this is automatic once data is added; verify that tick
   tier, spacing, and labels do not collide with neighbours.

## Attribution

NASA source documents are U.S. government works and are in the public domain
under 17 U.S.C. § 105. No licence is required to reuse their content.

Even so, include a credits line in the app footer or about section, for
example: "Data from NASA's Artemis II Reference Guide, Artemis II Mission
Timeline, and SLS Reference Guide (public domain)."
