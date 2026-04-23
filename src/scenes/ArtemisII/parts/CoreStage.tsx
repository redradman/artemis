import { useContext, useMemo } from 'react'
import * as THREE from 'three'
import { Wire } from '../geometry/Wire'
import { ActiveIdContext, ToneContext, resolveSubTone } from '../materials'

const STRINGER_COUNT = 20
const ENGINES: Array<readonly [number, number]> = [
  [1.15, 1.15],
  [-1.15, 1.15],
  [1.15, -1.15],
  [-1.15, -1.15],
]

// Core-body subdivisions. Proportions chosen from the SLS reference
// guide (Block 1 by the Numbers p.9 + Core Stage overview):
//   LH2 tank        ~130 ft of a 212 ft stage → lower 2/3
//   Intertank       ~22 ft, centred on the existing strake rods
//   LOX tank + fwd  remainder up top
// In our 42-unit tank cylinder (y=0..42) that works out to:
//   y=0..22   LH2 tank
//   y=22..27  Intertank (contains the 4.5-unit stringer strakes at y=24)
//   y=27..42  LOX tank + forward skirt (no dedicated component id —
//             this region is what "core-stage" on the label points at)
const LH2_HEIGHT = 22
const INTERTANK_HEIGHT = 5
const LOX_HEIGHT = 15
const LH2_Y = LH2_HEIGHT / 2
const INTERTANK_Y = LH2_HEIGHT + INTERTANK_HEIGHT / 2
const LOX_Y = LH2_HEIGHT + INTERTANK_HEIGHT + LOX_HEIGHT / 2

export function CoreStage() {
  const activeId = useContext(ActiveIdContext)

  const geoms = useMemo(
    () => ({
      lh2: new THREE.CylinderGeometry(2.7, 2.7, LH2_HEIGHT, 40, 10, false),
      intertank: new THREE.CylinderGeometry(2.7, 2.7, INTERTANK_HEIGHT, 40, 3, false),
      loxAndFwd: new THREE.CylinderGeometry(2.7, 2.7, LOX_HEIGHT, 40, 7, false),
      stringer: new THREE.BoxGeometry(0.12, 4.5, 0.12),
      boatTail: new THREE.CylinderGeometry(2.7, 3.1, 3.5, 32, 3, true),
      bell: new THREE.CylinderGeometry(0.55, 0.95, 2.8, 20, 5, true),
      head: new THREE.CylinderGeometry(0.45, 0.55, 1.4, 16, 3, false),
      plumb: new THREE.BoxGeometry(0.35, 0.8, 0.35),
    }),
    [],
  )

  const lh2Tone = resolveSubTone(activeId, 'lh2-tank')
  const intertankTone = resolveSubTone(activeId, 'intertank')
  const coreTone = resolveSubTone(activeId, 'core-stage')
  const rs25Tone = resolveSubTone(activeId, 'rs-25')

  return (
    <group>
      <ToneContext.Provider value={lh2Tone}>
        <group position={[0, LH2_Y, 0]}>
          <Wire geometry={geoms.lh2} />
        </group>
      </ToneContext.Provider>

      <ToneContext.Provider value={intertankTone}>
        <group position={[0, INTERTANK_Y, 0]}>
          <Wire geometry={geoms.intertank} />
        </group>
        {Array.from({ length: STRINGER_COUNT }, (_, i) => {
          const angle = (i / STRINGER_COUNT) * Math.PI * 2
          return (
            <group
              key={i}
              position={[Math.cos(angle) * 2.73, 24, Math.sin(angle) * 2.73]}
            >
              <Wire geometry={geoms.stringer} dense={false} />
            </group>
          )
        })}
      </ToneContext.Provider>

      <ToneContext.Provider value={coreTone}>
        <group position={[0, LOX_Y, 0]}>
          <Wire geometry={geoms.loxAndFwd} />
        </group>
      </ToneContext.Provider>

      <ToneContext.Provider value={rs25Tone}>
        <group position={[0, -1.75, 0]}>
          <Wire geometry={geoms.boatTail} />
        </group>
        {ENGINES.map(([x, z], i) => (
          <group key={i}>
            <group position={[x, -5.0, z]}>
              <Wire geometry={geoms.bell} />
            </group>
            <group position={[x, -3.0, z]}>
              <Wire geometry={geoms.head} />
            </group>
            <group position={[x * 1.3, -2.3, z * 1.3]}>
              <Wire geometry={geoms.plumb} />
            </group>
          </group>
        ))}
      </ToneContext.Provider>
    </group>
  )
}
