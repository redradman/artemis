import { useContext, useMemo } from 'react'
import * as THREE from 'three'
import { Wire } from '../geometry/Wire'
import { ActiveIdContext, ToneContext, resolveSubTone } from '../materials'

export function LaunchAbortSystem() {
  const activeId = useContext(ActiveIdContext)

  const geoms = useMemo(
    () => ({
      bpc: new THREE.CylinderGeometry(0.9, 0.9, 1.3, 18, 2, false),
      abortMotor: new THREE.CylinderGeometry(0.55, 0.55, 3.8, 18, 5, false),
      nozzle: new THREE.CylinderGeometry(0.12, 0.2, 0.4, 10, 1, true),
      tower: new THREE.ConeGeometry(0.55, 3.2, 18, 5),
      spike: new THREE.CylinderGeometry(0.03, 0.1, 2.2, 8, 2),
    }),
    [],
  )

  // Reference Guide pp.97–98: abort-motor is the solid motor + its
  // four manifold nozzles. The BPC (boost protective cover), tower,
  // and spike are separate structural elements of "launch-abort" —
  // keep them decoupled so selecting the motor doesn't highlight the
  // whole tower.
  const motorTone = resolveSubTone(activeId, 'abort-motor')
  const lasTone = resolveSubTone(activeId, 'launch-abort')

  return (
    <group>
      <ToneContext.Provider value={lasTone}>
        <group position={[0, 56.75, 0]}>
          <Wire geometry={geoms.bpc} />
        </group>
        <group position={[0, 62.8, 0]}>
          <Wire geometry={geoms.tower} />
        </group>
        <group position={[0, 65.5, 0]}>
          <Wire geometry={geoms.spike} dense={false} />
        </group>
      </ToneContext.Provider>

      <ToneContext.Provider value={motorTone}>
        <group position={[0, 59.3, 0]}>
          <Wire geometry={geoms.abortMotor} />
        </group>
        {[0, 1, 2, 3].map((i) => {
          const angle = (i / 4) * Math.PI * 2
          return (
            <group
              key={i}
              position={[Math.cos(angle) * 0.6, 57.5, Math.sin(angle) * 0.6]}
              rotation={[Math.sin(angle) * -0.5, 0, Math.cos(angle) * 0.5]}
            >
              <Wire geometry={geoms.nozzle} dense={false} />
            </group>
          )
        })}
      </ToneContext.Provider>
    </group>
  )
}
