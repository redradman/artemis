import * as THREE from 'three'

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
