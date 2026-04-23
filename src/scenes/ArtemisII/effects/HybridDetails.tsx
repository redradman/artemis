import { useMemo } from 'react'
import * as THREE from 'three'
import { wireActive, wireActiveDashed } from '../materials'
import type { MissionStageState } from '../lib/stateAt'

// Schematic callout linework layered onto hybrid mode:
//  - thin dashed amber stage-boundary rings at the major stage joins
//  - a subtle full-height centre axis running up through the stack
//  - short horizontal tick marks along the core stage at round-number
//    metre intervals (like a construction drawing)
//
// Everything is wireframe-only, no solids, sticking to the blueprint
// vocabulary the design doc is built around.

type HybridDetailsProps = {
  state: MissionStageState
}

// Build a ring geometry on the XZ plane (y=0). Vertices are stored as a
// closed polyline with a cumulative `lineDistance` attribute so
// LineDashedMaterial renders an even dash pattern around the circle.
function buildRingGeometry(radius: number, segments = 96): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry()
  const positions = new Float32Array((segments + 1) * 3)
  const distances = new Float32Array(segments + 1)
  let total = 0
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    positions[i * 3] = Math.cos(a) * radius
    positions[i * 3 + 1] = 0
    positions[i * 3 + 2] = Math.sin(a) * radius
    if (i > 0) {
      const prevA = ((i - 1) / segments) * Math.PI * 2
      total += Math.hypot(
        Math.cos(a) * radius - Math.cos(prevA) * radius,
        0,
        Math.sin(a) * radius - Math.sin(prevA) * radius,
      )
    }
    distances[i] = total
  }
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  g.setAttribute('lineDistance', new THREE.BufferAttribute(distances, 1))
  return g
}

// R3F's `<line>` JSX resolves to the SVG element at the type level, so
// mounting a THREE.Line goes via `<primitive>` with a freshly constructed
// instance. One Line per render site keeps per-instance transforms.
type DashedRingProps = {
  geometry: THREE.BufferGeometry
  material: THREE.Material
  position: [number, number, number]
}
function DashedRing({ geometry, material, position }: DashedRingProps) {
  const line = useMemo(
    () => new THREE.Line(geometry, material),
    [geometry, material],
  )
  return <primitive object={line} position={position} />
}

type AxisLineProps = {
  material: THREE.Material
  from: [number, number, number]
  to: [number, number, number]
}
function AxisLine({ material, from, to }: AxisLineProps) {
  const obj = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...from),
      new THREE.Vector3(...to),
    ])
    return new THREE.Line(g, material)
  }, [material, from, to])
  return <primitive object={obj} />
}

export function HybridDetails({ state }: HybridDetailsProps) {
  const { stages } = state

  const ringGeos = useMemo(
    () => ({
      core: buildRingGeometry(2.78),
      srb: buildRingGeometry(1.92),
      icps: buildRingGeometry(2.62),
      sm: buildRingGeometry(2.34),
    }),
    [],
  )

  const axisMat = useMemo(() => {
    const m = wireActive.clone()
    m.opacity = 0.18
    return m
  }, [])

  const ringMat = useMemo(() => {
    const m = wireActiveDashed.clone()
    m.opacity = 0.55
    m.dashSize = 0.6
    m.gapSize = 0.35
    return m
  }, [])

  const tickMat = useMemo(() => {
    const m = wireActive.clone()
    m.opacity = 0.32
    return m
  }, [])

  // Side construction ticks along the +X face of the core at every 10
  // rocket-units — reads as a construction-drawing tick scale.
  const coreTicks: Array<[number, number, number]> = [
    [2.75, 5, 0],
    [2.75, 15, 0],
    [2.75, 25, 0],
    [2.75, 35, 0],
  ]

  return (
    <>
      {/* Centre reference axis. */}
      <AxisLine material={axisMat} from={[0, -7, 0]} to={[0, 66.5, 0]} />

      {/* Core stage boundary rings — LH2 top, intertank band, LOX base. */}
      {stages.core.visible && (
        <group
          position={[stages.core.offsetX, stages.core.offsetY, stages.core.offsetZ]}
        >
          {[5, 22, 38].map((y) => (
            <DashedRing
              key={y}
              geometry={ringGeos.core}
              material={ringMat}
              position={[0, y, 0]}
            />
          ))}
          {coreTicks.map((p, i) => (
            <AxisLine
              key={i}
              material={tickMat}
              from={[p[0], p[1], p[2]]}
              to={[p[0] + 0.9, p[1], p[2]]}
            />
          ))}
        </group>
      )}

      {/* Left SRB segment rings. */}
      {stages.srbL.visible && (
        <group
          position={[-6 + stages.srbL.offsetX, stages.srbL.offsetY, stages.srbL.offsetZ]}
        >
          {[8, 16, 24, 32, 40].map((y) => (
            <DashedRing
              key={y}
              geometry={ringGeos.srb}
              material={ringMat}
              position={[0, y, 0]}
            />
          ))}
        </group>
      )}

      {/* Right SRB segment rings. */}
      {stages.srbR.visible && (
        <group
          position={[6 + stages.srbR.offsetX, stages.srbR.offsetY, stages.srbR.offsetZ]}
        >
          {[8, 16, 24, 32, 40].map((y) => (
            <DashedRing
              key={y}
              geometry={ringGeos.srb}
              material={ringMat}
              position={[0, y, 0]}
            />
          ))}
        </group>
      )}

      {/* ICPS boundary rings. */}
      {stages.icps.visible && (
        <group
          position={[stages.icps.offsetX, stages.icps.offsetY, stages.icps.offsetZ]}
        >
          {[42, 46.5].map((y) => (
            <DashedRing
              key={y}
              geometry={ringGeos.icps}
              material={ringMat}
              position={[0, y, 0]}
            />
          ))}
        </group>
      )}

      {/* Service module top + bottom rings. */}
      {stages.sm.visible && (
        <group
          position={[stages.sm.offsetX, stages.sm.offsetY, stages.sm.offsetZ]}
        >
          {[48.3, 52.3].map((y) => (
            <DashedRing
              key={y}
              geometry={ringGeos.sm}
              material={ringMat}
              position={[0, y, 0]}
            />
          ))}
        </group>
      )}
    </>
  )
}
