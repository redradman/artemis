# Changelog

## 1.0.0 — 2026-04-21

First public release of the Artemis II interactive wireframe.

### Scene

- Full Space Launch System and Orion spacecraft modelled as wireframe: twin solid rocket boosters, core stage, ICPS, service module with deployable solar arrays, crew module, and launch abort system.
- Mission timeline from liftoff through Pacific splashdown, with stage jettison and configuration changes interpolated against `currentT`.
- Click-to-focus on each module with a fly-to camera; info panel shows the module's name, purpose, specs, and notes.

### UI

- Label overlay with collision-avoiding two-column layout and horizontal leaders.
- Timeline strip with scrubber, playhead, phase ticks, and speed controls.
- Chrome HUD with mission stats (height, mass, thrust, crew) that react to the active stage.

### Accessibility

- Scene has a descriptive `aria-label`.
- Keyboard: Tab focuses labels, Enter/Space activates; Space toggles playback; Arrow keys step mission phases; Escape closes the info panel.
- `prefers-reduced-motion` disables auto-rotate and skips fly-to animation in favour of instant camera transitions.
- All interactive controls show a focus-visible amber outline.

### Responsive

- Below 768 px: labels collapse, the info panel goes full-screen, the timeline simplifies to scrubber + active-phase pill, and the chrome HUD stacks vertically.

### Performance

- Shared `EdgesGeometry` for SRB rings so both boosters reuse one buffer.
- Manual chunk splitting: `three` (three.js + @react-three), `vendor` (React, zustand), app code separate.
- Main bundle: ~36 KB app, ~56 KB vendor (gzip), ~226 KB three (gzip).

### Deploy

- Railway via `railway.json` (NIXPACKS, `pnpm build`, `pnpm start`).
- OG image (1200×630), Twitter summary card, SVG favicon, PWA manifest.
- Target domain: [artemis.radman.dev](https://artemis.radman.dev).
