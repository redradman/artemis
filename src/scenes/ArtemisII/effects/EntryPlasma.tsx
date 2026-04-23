import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { wireActive } from '../materials'
import { getTorusEdges } from './geometries'

export type EntryPlasmaProps = {
  intensity: number
  /** World-local position of the capsule base (where the heat shield sits). */
  shieldPosition: [number, number, number]
}

// Single schematic bow-shock hoop centred below the capsule. The hoop widens
// as plasma intensity rises. Rendered in amber line-art — no glow, no bloom.
export function EntryPlasma({ intensity, shieldPosition }: EntryPlasmaProps) {
  const hoopRef = useRef<THREE.LineSegments>(null)
  const hoopGroupRef = useRef<THREE.Group>(null)
  const material = useMemo(() => wireActive.clone(), [])
  const hoopEdges = useMemo(() => getTorusEdges(1, 0.04, 6, 64), [])

  /* Per-frame material mutation is the intended R3F pattern here; the
     material is a per-instance clone. */
  /* eslint-disable react-hooks/immutability */
  useFrame(({ clock }) => {
    const hoop = hoopGroupRef.current
    if (!hoop) return
    if (intensity <= 0.01) {
      hoop.visible = false
      return
    }
    hoop.visible = true
    const time = clock.elapsedTime
    const radius = 2.5 + intensity * 1.2
    hoop.scale.set(radius, 1, radius)
    material.opacity = intensity * (0.6 + Math.sin(time * 18) * 0.25)
  })
  /* eslint-enable react-hooks/immutability */

  return (
    <group position={shieldPosition}>
      <group ref={hoopGroupRef} position={[0, -2.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <lineSegments ref={hoopRef} geometry={hoopEdges} material={material} />
      </group>
    </group>
  )
}
