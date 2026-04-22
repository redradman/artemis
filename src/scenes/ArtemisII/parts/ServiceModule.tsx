import { useMemo } from 'react'
import * as THREE from 'three'
import { Wire } from '../geometry/Wire'
import { wireMesh } from '../materials'

const WING_ANGLES = [
  Math.PI * 0.25,
  Math.PI * 0.75,
  Math.PI * 1.25,
  Math.PI * 1.75,
]

type SolarWingProps = {
  angle: number
  deploy: number
}

function SolarWing({ angle, deploy }: SolarWingProps) {
  const geoms = useMemo(() => {
    const decorationPoints: THREE.Vector3[] = []
    for (let j = 0; j < 5; j++) {
      const xv = -1.9 + j * 0.95
      decorationPoints.push(new THREE.Vector3(xv, 0.05, -0.95))
      decorationPoints.push(new THREE.Vector3(xv, 0.05, 0.95))
    }
    for (let j = 0; j < 3; j++) {
      const zv = -0.95 + j * 0.95
      decorationPoints.push(new THREE.Vector3(-1.9, 0.05, zv))
      decorationPoints.push(new THREE.Vector3(1.9, 0.05, zv))
    }
    return {
      arm: new THREE.BoxGeometry(0.18, 0.18, 3),
      panel: new THREE.BoxGeometry(3.8, 0.08, 1.9),
      decoration: new THREE.BufferGeometry().setFromPoints(decorationPoints),
    }
  }, [])

  const scaleZ = 0.2 + deploy * 0.8

  return (
    <group position={[0, 50.3, 0]} rotation={[0, angle, 0]}>
      <group scale={[1, 1, scaleZ]}>
        <group position={[0, 0, 1.5]}>
          <Wire geometry={geoms.arm} dense={false} />
        </group>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[0, 0, 0.9 + i * 2]}>
            <Wire geometry={geoms.panel} />
            <lineSegments geometry={geoms.decoration} material={wireMesh} />
          </group>
        ))}
      </group>
    </group>
  )
}

type ServiceModuleProps = {
  solarDeploy?: number
}

export function ServiceModule({ solarDeploy = 0 }: ServiceModuleProps) {
  const geoms = useMemo(
    () => ({
      body: new THREE.CylinderGeometry(2.3, 2.3, 4, 24, 4, false),
      engine: new THREE.CylinderGeometry(0.25, 0.6, 1, 14, 2, true),
    }),
    [],
  )

  return (
    <group>
      <group position={[0, 50.3, 0]}>
        <Wire geometry={geoms.body} />
      </group>
      <group position={[0, 47.8, 0]}>
        <Wire geometry={geoms.engine} />
      </group>
      {WING_ANGLES.map((angle, i) => (
        <SolarWing key={i} angle={angle} deploy={solarDeploy} />
      ))}
    </group>
  )
}
