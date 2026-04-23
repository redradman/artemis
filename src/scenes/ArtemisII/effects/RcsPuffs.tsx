import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { wireActiveDashed } from '../materials'
import { getQuillGeometry } from './geometries'

export type RcsPuffsProps = {
  intensity: number
  cinematic?: boolean
}

// 4 RCS clusters around the top of the ESM, sitting at the NE/SE/SW/NW
// quadrants (matching CinematicShell.SmShell's rcsPositions). Each cluster
// fires 4 short puffs along different axes: radially outward, tangential,
// upward (+Y), downward (-Y) — approximating the multi-axis layout of the
// real European Service Module thrusters.
type Puff = {
  position: [number, number, number]
  rotation: [number, number, number]
}

const RING_Y = 51.5
const R = 2.35
const PUFF_LEN = 1.2

const RCS_PUFFS: Puff[] = (() => {
  const out: Puff[] = []
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    const cx = Math.cos(a) * R
    const cz = Math.sin(a) * R
    // 1) Radially outward — quill +X rotated to match angle `a` in XZ.
    out.push({
      position: [cx, RING_Y, cz],
      rotation: [0, -a, 0],
    })
    // 2) Tangential — 90° around Y from radial.
    out.push({
      position: [cx, RING_Y, cz],
      rotation: [0, -a + Math.PI / 2, 0],
    })
    // 3) Upward — quill +X rotated toward +Y.
    out.push({
      position: [cx, RING_Y, cz],
      rotation: [0, 0, Math.PI / 2],
    })
    // 4) Downward — quill +X rotated toward -Y.
    out.push({
      position: [cx, RING_Y, cz],
      rotation: [0, 0, -Math.PI / 2],
    })
  }
  return out
})()

export function RcsPuffs({ intensity, cinematic = false }: RcsPuffsProps) {
  const groupRef = useRef<THREE.Group>(null)
  const material = useMemo(() => wireActiveDashed.clone(), [])
  const geometry = useMemo(() => getQuillGeometry(PUFF_LEN), [])

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
    // Snappy flicker — RCS jets are brief, staccato bursts rather than the
    // slower pulse of separation motors.
    const flicker = 0.65 + Math.sin(clock.elapsedTime * 50) * 0.35
    const base = cinematic ? 0.9 : 0.8
    material.opacity = base * intensity * flicker
  })
  /* eslint-enable react-hooks/immutability */

  return (
    <group ref={groupRef}>
      {RCS_PUFFS.map((p, idx) => (
        <group key={idx} position={p.position} rotation={p.rotation}>
          <lineSegments geometry={geometry} material={material} />
        </group>
      ))}
    </group>
  )
}
