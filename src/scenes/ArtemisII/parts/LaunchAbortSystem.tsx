import { useMemo } from 'react'
import * as THREE from 'three'
import { Wire } from '../geometry/Wire'

export function LaunchAbortSystem() {
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

  return (
    <group>
      <group position={[0, 56.75, 0]}>
        <Wire geometry={geoms.bpc} />
      </group>
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
      <group position={[0, 62.8, 0]}>
        <Wire geometry={geoms.tower} />
      </group>
      <group position={[0, 65.5, 0]}>
        <Wire geometry={geoms.spike} dense={false} />
      </group>
    </group>
  )
}
