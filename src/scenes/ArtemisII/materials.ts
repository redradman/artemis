import { createContext, useContext } from 'react'
import * as THREE from 'three'

// Three distinct "tones" drive wireframe colouring across the rocket:
//  - default: the baseline cream look, used whenever no component is
//    selected.
//  - active:  this sub-region matches the selected component. Lines
//    turn amber at high opacity so the part reads as "picked" from
//    across the screen.
//  - dimmed:  some other component is selected. Lines drop to low
//    opacity so the selected sub-region stays unambiguously focal.
//
// Tone is threaded through React context so individual rocket parts
// don't have to accept a new prop everywhere — <ToneContext> wraps
// each sub-region and Wire consumes it.
export type Tone = 'active' | 'dimmed' | 'default'
export const ToneContext = createContext<Tone>('default')

// The currently-selected component id, propagated down so each part
// can resolve its own sub-region tones without prop-drilling through
// ClickableModule / CapsulePendulum wrappers.
export const ActiveIdContext = createContext<string | null>(null)

/**
 * Each sub-region of the rocket is tagged with its own component id
 * (e.g. 'intertank', 'abort-motor', 'heat-shield'). This helper
 * answers "what tone should THIS sub-region render with, given the
 * currently-selected component?":
 *   - nothing selected → default
 *   - this sub-region IS the selection → active
 *   - something else selected → dimmed
 * Pass `myId = null` for regions that don't correspond to any
 * component in the data file (e.g. structural filler); those always
 * resolve to default or dimmed but never active.
 */
export function resolveSubTone(
  activeId: string | null,
  myId: string | null,
): Tone {
  if (activeId === null) return 'default'
  if (myId !== null && activeId === myId) return 'active'
  return 'dimmed'
}

// Opacity values mirror tokens.css --color-wire / --color-wire-faint where a
// token exists, and the prototype's 0.95 accent otherwise. Three.js materials
// can't read CSS variables at paint time, so these are hardcoded by design.
export const wireMain = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.85,
  fog: true,
})

export const wireMesh = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.25,
  fog: true,
})

export const wireAccent = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.95,
  fog: true,
})

// Active (amber) — the selected stage's wireframe colour.
export const wireMainActive = new THREE.LineBasicMaterial({
  color: 0xe8a23b,
  transparent: true,
  opacity: 1.0,
  fog: true,
})

export const wireMeshActive = new THREE.LineBasicMaterial({
  color: 0xe8a23b,
  transparent: true,
  opacity: 0.45,
  fog: true,
})

export const wireAccentActive = new THREE.LineBasicMaterial({
  color: 0xe8a23b,
  transparent: true,
  opacity: 1.0,
  fog: true,
})

// Dimmed — non-selected stages fade out so the selection is obvious.
export const wireMainDim = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.14,
  fog: true,
})

export const wireMeshDim = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.04,
  fog: true,
})

export const wireAccentDim = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.18,
  fog: true,
})

// Amber (--color-accent #e8a23b). Reserved for active-state visualisation:
// thrust plumes, separation motors, entry plasma, deploying solar arrays.
// Each logical effect clones the material so per-frame opacity writes don't
// stomp other effects that share the same base colour.
export const wireActive = new THREE.LineBasicMaterial({
  color: 0xe8a23b,
  transparent: true,
  opacity: 0.9,
  fog: true,
})

export const wireActiveDim = new THREE.LineBasicMaterial({
  color: 0xe8a23b,
  transparent: true,
  opacity: 0.4,
  fog: true,
})

export const wireActiveDashed = new THREE.LineDashedMaterial({
  color: 0xe8a23b,
  transparent: true,
  opacity: 0.85,
  dashSize: 0.3,
  gapSize: 0.15,
  fog: true,
})

// Per-theme wire palette. The shared LineBasicMaterials above are mutated
// in place when the theme changes — no re-allocation, every part using the
// material sees the new colour on the next frame. Keeping space and
// cinematic on the original white+amber pair preserves the existing feel;
// blueprint shifts to paper-cyan lines with a sky-cyan active accent so
// the wireframe reads as a cyanotype drawing rather than raw white geometry.
type WirePalette = {
  line: number
  active: number
}

const PALETTES: Record<'space' | 'cinematic' | 'blueprint', WirePalette> = {
  space: { line: 0xffffff, active: 0xe8a23b },
  cinematic: { line: 0xffffff, active: 0xe8a23b },
  blueprint: { line: 0xdceafe, active: 0x8fd2ff },
}

export function applyWirePalette(
  mode: 'space' | 'cinematic' | 'blueprint',
): void {
  const p = PALETTES[mode]
  wireMain.color.setHex(p.line)
  wireMesh.color.setHex(p.line)
  wireAccent.color.setHex(p.line)
  wireMainDim.color.setHex(p.line)
  wireMeshDim.color.setHex(p.line)
  wireAccentDim.color.setHex(p.line)
  wireMainActive.color.setHex(p.active)
  wireMeshActive.color.setHex(p.active)
  wireAccentActive.color.setHex(p.active)
  wireActive.color.setHex(p.active)
  wireActiveDim.color.setHex(p.active)
  wireActiveDashed.color.setHex(p.active)
}

export type ToneMaterials = {
  main: THREE.LineBasicMaterial
  mesh: THREE.LineBasicMaterial
  accent: THREE.LineBasicMaterial
}

// Hook used by Wire and by any part that draws lineSegments directly.
// Resolves the tone from context and returns the trio of materials that
// should be used this render. Shared materials by reference (no clones)
// so non-active stages pay no allocation cost.
export function useToneMaterials(): ToneMaterials {
  const tone = useContext(ToneContext)
  if (tone === 'active') {
    return { main: wireMainActive, mesh: wireMeshActive, accent: wireAccentActive }
  }
  if (tone === 'dimmed') {
    return { main: wireMainDim, mesh: wireMeshDim, accent: wireAccentDim }
  }
  return { main: wireMain, mesh: wireMesh, accent: wireAccent }
}
