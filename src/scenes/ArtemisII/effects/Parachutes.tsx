import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { wireActive } from '../materials'
import { getTorusEdges } from './geometries'

export type ParachutesProps = {
  intensity: number
  /** Position of the capsule top (where risers attach). */
  capsuleTop: [number, number, number]
}

// Eleven schematic canopy hoops arranged above the capsule to represent the
// Orion parachute sequence: 3 forward-bay, 2 drogues, 3 pilots, 3 mains.
// Hoops are unfilled torus-edge rings; each one has a single straight riser
// back to the capsule. No jitter — chutes are structural, not combusting.

type HoopSpec = {
  radius: number
  position: [number, number, number]
}

const HOOPS: HoopSpec[] = [
  // Forward-bay covers jettison — three tiny parachutes separate the cover.
  { radius: 0.3, position: [-0.6, 6.5, 0] },
  { radius: 0.3, position: [0, 7, 0.5] },
  { radius: 0.3, position: [0.6, 6.5, 0] },
  // Drogues.
  { radius: 0.5, position: [-0.4, 8.5, 0.2] },
  { radius: 0.5, position: [0.4, 8.5, -0.2] },
  // Pilots.
  { radius: 0.6, position: [-0.6, 10.5, 0] },
  { radius: 0.6, position: [0.6, 10.5, 0] },
  { radius: 0.6, position: [0, 10.8, 0.6] },
  // Mains — arrange in a triangle above the pack, large canopies.
  { radius: 2.6, position: [-1.8, 14, 0] },
  { radius: 2.6, position: [1.8, 14, 0] },
  { radius: 2.6, position: [0, 14.5, 1.8] },
]

export function Parachutes({ intensity, capsuleTop }: ParachutesProps) {
  const groupRef = useRef<THREE.Group>(null)
  const material = useMemo(() => wireActive.clone(), [])

  // One edges geometry per hoop, cached by the radius/tube combo.
  const hoopEdges = useMemo(
    () =>
      HOOPS.map((h) => ({
        edges: getTorusEdges(h.radius, Math.min(0.05, h.radius * 0.05), 6, 48),
        position: h.position,
      })),
    [],
  )

  const risers = useMemo(() => {
    return HOOPS.map((h) => {
      return new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(h.position[0], h.position[1], h.position[2]),
      ])
    })
  }, [])

  /* Per-frame material mutation is the intended R3F pattern; material is
     a per-instance clone. */
  /* eslint-disable react-hooks/immutability */
  useFrame(() => {
    const g = groupRef.current
    if (!g) return
    if (intensity <= 0.01) {
      g.visible = false
      return
    }
    g.visible = true
    g.scale.set(intensity, intensity, intensity)
    material.opacity = 0.9 * intensity
  })
  /* eslint-enable react-hooks/immutability */

  return (
    <group ref={groupRef} position={capsuleTop}>
      {hoopEdges.map((h, idx) => (
        <group key={`hoop-${idx}`} position={h.position} rotation={[Math.PI / 2, 0, 0]}>
          <lineSegments geometry={h.edges} material={material} />
        </group>
      ))}
      {risers.map((r, idx) => (
        <lineSegments key={`riser-${idx}`} geometry={r} material={material} />
      ))}
    </group>
  )
}
