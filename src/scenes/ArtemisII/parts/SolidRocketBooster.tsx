import { useContext } from 'react'
import * as THREE from 'three'
import { Wire } from '../geometry/Wire'
import {
  ActiveIdContext,
  ToneContext,
  resolveSubTone,
  useToneMaterials,
} from '../materials'

type SolidRocketBoosterProps = {
  x: number
}

const ringTorus = new THREE.TorusGeometry(1.92, 0.12, 8, 36)
const geoms = {
  body: new THREE.CylinderGeometry(1.85, 1.85, 40, 36, 16, false),
  nose: new THREE.ConeGeometry(1.85, 4.5, 32, 6),
  fwdSkirt: new THREE.CylinderGeometry(2.0, 1.85, 1.5, 32, 2, true),
  aftSkirt: new THREE.CylinderGeometry(1.85, 2.2, 3, 32, 3, true),
  nozzle: new THREE.CylinderGeometry(1.6, 1.1, 2.2, 24, 3, true),
  ringEdges: new THREE.EdgesGeometry(ringTorus),
}
ringTorus.dispose()

// SRB major assemblies, per SLS Reference Guide p.44 (Solid Rocket
// Boosters → Major Assemblies):
//   Forward assembly (nose + forward skirt) — carries the avionics
//   Motor assembly (five propellant segments joined at four rings)
//   Aft assembly (aft skirt + nozzle, with the TVC system)
// We decouple three component ids along those lines:
//   solid-booster → body tube + nose + forward skirt (the motor
//                   assembly's visible case + forward assembly)
//   segment-joint → the four ring-joint toruses between segments
//   aft-skirt     → aft skirt + nozzle
export function SolidRocketBooster({ x }: SolidRocketBoosterProps) {
  const activeId = useContext(ActiveIdContext)
  const bodyTone = resolveSubTone(activeId, 'solid-booster')
  const jointTone = resolveSubTone(activeId, 'segment-joint')
  const aftTone = resolveSubTone(activeId, 'aft-skirt')

  return (
    <group position={[x, 0, 0]}>
      <ToneContext.Provider value={bodyTone}>
        <group position={[0, 22, 0]}>
          <Wire geometry={geoms.body} />
        </group>
        <group position={[0, 44.25, 0]}>
          <Wire geometry={geoms.nose} />
        </group>
        <group position={[0, 42.75, 0]}>
          <Wire geometry={geoms.fwdSkirt} />
        </group>
      </ToneContext.Provider>

      <ToneContext.Provider value={aftTone}>
        <group position={[0, 0.5, 0]}>
          <Wire geometry={geoms.aftSkirt} />
        </group>
        <group position={[0, -1.6, 0]}>
          <Wire geometry={geoms.nozzle} />
        </group>
      </ToneContext.Provider>

      <ToneContext.Provider value={jointTone}>
        <SegmentJointRings />
      </ToneContext.Provider>
    </group>
  )
}

function SegmentJointRings() {
  const mats = useToneMaterials()
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <group
          key={i}
          position={[0, 4 + i * 8, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <lineSegments geometry={geoms.ringEdges} material={mats.accent} />
        </group>
      ))}
    </>
  )
}
