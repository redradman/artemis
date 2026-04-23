import { useContext, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Wire } from '../geometry/Wire'
import {
  ActiveIdContext,
  ToneContext,
  resolveSubTone,
  useToneMaterials,
} from '../materials'

type WindowProps = {
  angle: number
  edges: THREE.EdgesGeometry
}

function PortholeWindow({ angle, edges }: WindowProps) {
  const ref = useRef<THREE.Group>(null)
  const mats = useToneMaterials()
  useEffect(() => {
    ref.current?.lookAt(Math.cos(angle) * 10, 53.8, Math.sin(angle) * 10)
  }, [angle])
  return (
    <group
      ref={ref}
      position={[Math.cos(angle) * 1.85, 53.8, Math.sin(angle) * 1.85]}
    >
      <lineSegments geometry={edges} material={mats.accent} />
    </group>
  )
}

export function CrewModule() {
  const activeId = useContext(ActiveIdContext)

  // Split the capsule lathe into two pieces so the heat shield (the
  // ablative disk at the base) can tone separately from the crew-
  // compartment body. Points 0–3 form the bottom rim / heat-shield
  // cross-section (y=0 → y=0.55); the remainder is the capsule body
  // tapering up to the docking tunnel.
  const heatShieldGeo = useMemo(() => {
    const pts: THREE.Vector2[] = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.8, 0.05),
      new THREE.Vector2(2.3, 0.3),
      new THREE.Vector2(2.3, 0.55),
    ]
    return new THREE.LatheGeometry(pts, 28)
  }, [])

  const capsuleBodyGeo = useMemo(() => {
    const pts: THREE.Vector2[] = [new THREE.Vector2(2.3, 0.55)]
    for (let i = 1; i <= 12; i++) {
      const t = i / 12
      const y = 0.55 + t * 3.3
      const r = 2.3 - t * 1.45
      pts.push(new THREE.Vector2(r, y))
    }
    pts.push(new THREE.Vector2(0.85, 3.9))
    pts.push(new THREE.Vector2(0.85, 4.2))
    return new THREE.LatheGeometry(pts, 28)
  }, [])

  const windowEdges = useMemo(() => {
    const plane = new THREE.PlaneGeometry(0.35, 0.45)
    const edges = new THREE.EdgesGeometry(plane)
    plane.dispose()
    return edges
  }, [])

  const capsuleTone = resolveSubTone(activeId, 'crew-module')
  const heatShieldTone = resolveSubTone(activeId, 'heat-shield')

  return (
    <group>
      <group position={[0, 52, 0]}>
        <ToneContext.Provider value={heatShieldTone}>
          <Wire geometry={heatShieldGeo} />
        </ToneContext.Provider>
        <ToneContext.Provider value={capsuleTone}>
          <Wire geometry={capsuleBodyGeo} />
        </ToneContext.Provider>
      </group>
      <ToneContext.Provider value={capsuleTone}>
        {[0, 1, 2, 3].map((i) => {
          const angle = (i / 4) * Math.PI * 2 + Math.PI / 4
          return <PortholeWindow key={i} angle={angle} edges={windowEdges} />
        })}
      </ToneContext.Provider>
    </group>
  )
}
