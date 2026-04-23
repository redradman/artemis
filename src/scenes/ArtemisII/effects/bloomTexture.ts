import * as THREE from 'three'

// Procedural radial-gradient texture used as the glow sprite for hot
// elements (engine cores, plasma, active seams). Drawn once into an
// offscreen canvas and cached at module scope — no external assets, no
// postprocessing pass required.

let cached: THREE.CanvasTexture | null = null

export function getGlowTexture(): THREE.CanvasTexture {
  if (cached) return cached
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('BloomHalo: no 2D canvas context')
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  // White-hot core fading through amber to transparent — the sprite
  // material multiplies by its colour prop so this base gradient can be
  // tinted per instance.
  grad.addColorStop(0, 'rgba(255, 250, 230, 1)')
  grad.addColorStop(0.18, 'rgba(250, 210, 140, 0.85)')
  grad.addColorStop(0.45, 'rgba(232, 162, 59, 0.35)')
  grad.addColorStop(0.8, 'rgba(232, 162, 59, 0.08)')
  grad.addColorStop(1, 'rgba(232, 162, 59, 0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  cached = new THREE.CanvasTexture(canvas)
  return cached
}
