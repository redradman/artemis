import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getGlowTexture } from './bloomTexture'

// A camera-facing additive glow sprite. Sits behind (or around) a hot
// element — engine core, plasma ring, active seam — to give the sense
// of emissive spill without running a postprocessing bloom pass. Scales
// + opacity both modulate with `intensity` so fading in/out is smooth.

export type BloomHaloProps = {
  position: [number, number, number]
  intensity: number
  /** World-space radius of the halo at intensity 1. */
  baseSize: number
  /** Sprite tint — multiplies the gradient texture. */
  color?: number
  /** Flicker frequency (rad/s). */
  pulseFreq?: number
  /** Phase offset so nearby halos don't pulse in lockstep. */
  phase?: number
  /** Cinematic mode increases opacity — halos read as more emissive. */
  cinematic?: boolean
  /** Blueprint mode forces the halo tint toward paper-cyan so no warm
   * orange bleeds into the cyanotype palette. Overrides `color`. */
  blueprint?: boolean
}

// Paper-cyan halo tint used when the blueprint theme is active.
const BP_HALO = 0xc8e6ff

export function BloomHalo({
  position,
  intensity,
  baseSize,
  color = 0xfff5d6,
  pulseFreq = 14,
  phase = 0,
  cinematic = false,
  blueprint = false,
}: BloomHaloProps) {
  const effectiveColor = blueprint ? BP_HALO : color
  const spriteRef = useRef<THREE.Sprite>(null)
  const tex = useMemo(() => getGlowTexture(), [])
  const mat = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: tex,
        color: effectiveColor,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0,
      }),
    [tex, effectiveColor],
  )

  /* Per-frame sprite mutation is the intended R3F pattern; the material
     is an instance clone. */
  /* eslint-disable react-hooks/immutability */
  useFrame(({ clock }) => {
    const s = spriteRef.current
    if (!s) return
    if (intensity <= 0.01) {
      s.visible = false
      return
    }
    s.visible = true
    const t = clock.elapsedTime
    const pulse = 0.9 + Math.sin(t * pulseFreq + phase) * 0.12
    const size = baseSize * intensity * pulse
    s.scale.set(size, size, 1)
    const baseOpacity = cinematic ? 1.1 : 0.55
    mat.opacity = Math.min(1, baseOpacity * intensity * pulse)
  })
  /* eslint-enable react-hooks/immutability */

  return <sprite ref={spriteRef} position={position} material={mat} />
}
