# Artemis II — Design Guide

**Read this file before making any visual or structural changes to the codebase.**

Canonical target: [`docs/design/v1-desktop.png`](./design/v1-desktop.png).

## Visual direction

Dark wireframe schematic in the style of a NASA technical drawing — ethereal,
minimal, instrument-panel quiet. The stack reads as a diagram, not a render.
Amber is the single accent colour, used sparingly to mark live data or the
focused element.

## Typography

JetBrains Mono is the only typeface. Weights in use: **300** (hero title,
rarely), **400** (body / specs / most labels), **500** (active states, current
phase, hud emphasis).

Tracking (letter-spacing) follows the scale in `src/styles/tokens.css`:

| Token           | Usage                                    |
| --------------- | ---------------------------------------- |
| `--tracking-07` | Mission title (`ARTEMIS II`)             |
| `--tracking-05` | HUD buttons, major timeline labels       |
| `--tracking-04` | Subtitles, spec rows, status line        |
| `--tracking-03` | Info-panel name, minor timeline sub-text |
| `--tracking-02` | Minor timeline labels                    |
| `--tracking-01` | Leader-line text, speed buttons          |

## Casing

- **ALL CAPS** — labels, nav/button text, stat keys and values, timeline phase
  names and T+ timestamps, component names on the rocket.
- **Sentence case** — info-panel body copy (purpose / notes).

## Colour usage

Every colour comes from `src/styles/tokens.css` via `var(--…)`. Never hardcode
hex or rgba in components.

- `--color-bg` — scene + panel backgrounds.
- `--color-fg`, `--color-fg-muted`, `--color-fg-dim`, `--color-fg-faint` —
  parchment-white foreground at four opacities for hierarchy.
- `--color-wire`, `--color-wire-dim`, `--color-wire-faint` — 3D line material.
- `--color-accent` — amber (`#e8a23b`). Reserved for **active and
  interactive states only**: current timeline phase, focused component,
  hovered leader label, live telemetry (ALT / VEL), play state.

## Layout

- Rocket is **centered** in the viewport, framed by the chrome.
- **Two-column leader labels** run down either side of the rocket, connecting
  to components with short horizontal leader lines terminated by a vertical
  tick.
- **Two-row timeline** pinned to the bottom: control row (status + PLAY +
  speeds + current-phase pill) above, track row with tiered ticks
  (majors above the line, minors below) and a diamond playhead.
- Top HUD is three columns: mission title (left), toggle buttons (centre),
  spec rows (right). All fixed, do not shift with scene.

## Forbidden

- Gradients — except the subtle depth-fog vignette already in tokens.
- Drop shadows on UI chrome.
- Glow or neon effects — the amber playhead's soft box-shadow is the one
  allowed exception.
- Rounded corners `> 0` anywhere except the info panel and keyed UI
  affordances that already use them.
- Emoji.
- Any font or colour that is not in `tokens.css`.
