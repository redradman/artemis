import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { wireActiveDashed } from '../materials'
import { getQuillGeometry } from './geometries'

export type Quill = {
  /** Position of the inner end of the quill. */
  position: [number, number, number]
  /** Euler rotation applied to the quill group. Quill extends along +X. */
  rotation: [number, number, number]
}

export type SepMotorPuffsProps = {
  quills: Quill[]
  intensity: number
  length?: number
  flickerFreq?: number
}

export function SepMotorPuffs({
  quills,
  intensity,
  length = 2.5,
  flickerFreq = 28,
}: SepMotorPuffsProps) {
  const groupRef = useRef<THREE.Group>(null)
  const material = useMemo(() => wireActiveDashed.clone(), [])
  const geometry = useMemo(() => getQuillGeometry(length), [length])

  /* Per-frame material mutation is the intended R3F pattern here; the
     material is a per-instance clone, so the immutability lint flag is a
     false positive. */
  /* eslint-disable react-hooks/immutability */
  useFrame(({ clock }) => {
    const g = groupRef.current
    if (!g) return
    if (intensity <= 0.01) {
      g.visible = false
      return
    }
    g.visible = true
    const flicker = 0.7 + Math.sin(clock.elapsedTime * flickerFreq) * 0.3
    material.opacity = 0.85 * intensity * flicker
  })
  /* eslint-enable react-hooks/immutability */

  return (
    <group ref={groupRef}>
      {quills.map((q, idx) => (
        <group key={idx} position={q.position} rotation={q.rotation}>
          <lineSegments geometry={geometry} material={material} />
        </group>
      ))}
    </group>
  )
}
