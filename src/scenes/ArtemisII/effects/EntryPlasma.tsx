import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { wireActive } from '../materials'
import { getTorusEdges } from './geometries'
import { BloomHalo } from './BloomHalo'

export type EntryPlasmaProps = {
  intensity: number
  /** World-local position of the capsule base (where the heat shield sits). */
  shieldPosition: [number, number, number]
  cinematic?: boolean
  blueprint?: boolean
}

// Three nested shock hoops plus a soft additive halo. The hoops ride
// phase-offset sine pulses so the rings breathe at slightly different
// rhythms, reading as layered compression waves at hypersonic entry.
// The halo provides the "heat bloom" around the heat shield without
// needing a postprocessing pass.
export function EntryPlasma({
  intensity,
  shieldPosition,
  cinematic = false,
  blueprint = false,
}: EntryPlasmaProps) {
  const hoopGroupRef = useRef<THREE.Group>(null)
  const materials = useMemo(
    () => [wireActive.clone(), wireActive.clone(), wireActive.clone()],
    [],
  )
  const hoopEdges = useMemo(() => getTorusEdges(1, 0.04, 6, 64), [])
  const hoopRefs = useRef<Array<THREE.Group | null>>([null, null, null])

  /* eslint-disable react-hooks/immutability */
  useFrame(({ clock }) => {
    const g = hoopGroupRef.current
    if (!g) return
    if (intensity <= 0.01) {
      g.visible = false
      return
    }
    g.visible = true
    const t = clock.elapsedTime
    // Three rings spaced radially; inner sharp + bright, outer soft.
    const ringParams = [
      { base: 2.1, amp: 1.0, freq: 18, phase: 0, opacityBase: 0.8 },
      { base: 3.0, amp: 1.3, freq: 14, phase: 1.1, opacityBase: 0.55 },
      { base: 3.9, amp: 1.6, freq: 10, phase: 2.3, opacityBase: 0.35 },
    ]
    for (let i = 0; i < 3; i++) {
      const ref = hoopRefs.current[i]
      const mat = materials[i]
      const p = ringParams[i]
      if (!ref) continue
      const pulse = 0.5 + Math.sin(t * p.freq + p.phase) * 0.5
      const radius = p.base + intensity * p.amp * (0.85 + pulse * 0.3)
      ref.scale.set(radius, 1, radius)
      mat.opacity = intensity * p.opacityBase * (0.7 + pulse * 0.3)
    }
  })
  /* eslint-enable react-hooks/immutability */

  return (
    <group position={shieldPosition}>
      <group ref={hoopGroupRef} position={[0, -2.8, 0]}>
        {[0, 1, 2].map((i) => (
          <group
            key={i}
            ref={(el) => {
              hoopRefs.current[i] = el
            }}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <lineSegments geometry={hoopEdges} material={materials[i]} />
          </group>
        ))}
        <BloomHalo
          position={[0, 0, 0]}
          intensity={intensity}
          baseSize={cinematic ? 9 : 6}
          color={0xff9e50}
          pulseFreq={10}
          cinematic={cinematic}
          blueprint={blueprint}
        />
      </group>
    </group>
  )
}
