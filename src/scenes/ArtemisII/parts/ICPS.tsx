import { useContext, useMemo } from 'react'
import * as THREE from 'three'
import { Wire } from '../geometry/Wire'
import { ActiveIdContext, ToneContext, resolveSubTone } from '../materials'

export function ICPS() {
  const activeId = useContext(ActiveIdContext)
  const tone = resolveSubTone(activeId, 'icps')

  const geoms = useMemo(
    () => ({
      body: new THREE.CylinderGeometry(2.55, 2.55, 4.5, 28, 4, false),
      lvsa: new THREE.CylinderGeometry(2.55, 2.7, 2.8, 28, 2, true),
      osa: new THREE.CylinderGeometry(2.3, 2.55, 1.8, 24, 2, true),
    }),
    [],
  )

  return (
    <ToneContext.Provider value={tone}>
      <group>
        <group position={[0, 44.25, 0]}>
          <Wire geometry={geoms.body} />
        </group>
        <group position={[0, 40.6, 0]}>
          <Wire geometry={geoms.lvsa} />
        </group>
        <group position={[0, 47.4, 0]}>
          <Wire geometry={geoms.osa} />
        </group>
      </group>
    </ToneContext.Provider>
  )
}
