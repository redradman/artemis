import { useMemo } from 'react'
import * as THREE from 'three'
import { Wire } from '../geometry/Wire'

const STRINGER_COUNT = 20
const ENGINES: Array<readonly [number, number]> = [
  [1.15, 1.15],
  [-1.15, 1.15],
  [1.15, -1.15],
  [-1.15, -1.15],
]

export function CoreStage() {
  const geoms = useMemo(
    () => ({
      body: new THREE.CylinderGeometry(2.7, 2.7, 42, 40, 20, false),
      stringer: new THREE.BoxGeometry(0.12, 4.5, 0.12),
      boatTail: new THREE.CylinderGeometry(2.7, 3.1, 3.5, 32, 3, true),
      bell: new THREE.CylinderGeometry(0.55, 0.95, 2.8, 20, 5, true),
      head: new THREE.CylinderGeometry(0.45, 0.55, 1.4, 16, 3, false),
      plumb: new THREE.BoxGeometry(0.35, 0.8, 0.35),
    }),
    [],
  )

  return (
    <group>
      <group position={[0, 21, 0]}>
        <Wire geometry={geoms.body} />
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
    </group>
  )
}
