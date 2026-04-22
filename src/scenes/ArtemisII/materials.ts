import * as THREE from 'three'

// Opacity values mirror tokens.css --color-wire / --color-wire-faint where a
// token exists, and the prototype's 0.95 accent otherwise. Three.js materials
// can't read CSS variables at paint time, so these are hardcoded by design.
export const wireMain = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.78,
  fog: true,
})

export const wireMesh = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.18,
  fog: true,
})

export const wireAccent = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.95,
  fog: true,
})
