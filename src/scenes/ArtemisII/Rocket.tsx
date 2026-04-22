import type { Ref } from 'react'
import type * as THREE from 'three'
import { useMissionState } from '../../hooks/useMissionState'
import { CoreStage } from './parts/CoreStage'
import { CrewModule } from './parts/CrewModule'
import { ICPS } from './parts/ICPS'
import { LaunchAbortSystem } from './parts/LaunchAbortSystem'
import { ServiceModule } from './parts/ServiceModule'
import { SolidRocketBooster } from './parts/SolidRocketBooster'

type RocketProps = {
  ref?: Ref<THREE.Group>
}

export function Rocket({ ref }: RocketProps) {
  const { state } = useMissionState()
  const { stages, solarDeploy } = state

  return (
    <group ref={ref} position={[0, -28, 0]}>
      <group
        position={[-6 + stages.srbL.offsetX, stages.srbL.offsetY, stages.srbL.offsetZ]}
        visible={stages.srbL.visible}
      >
        <SolidRocketBooster x={0} />
      </group>
      <group
        position={[6 + stages.srbR.offsetX, stages.srbR.offsetY, stages.srbR.offsetZ]}
        visible={stages.srbR.visible}
      >
        <SolidRocketBooster x={0} />
      </group>
      <group
        position={[stages.core.offsetX, stages.core.offsetY, stages.core.offsetZ]}
        visible={stages.core.visible}
      >
        <CoreStage />
      </group>
      <group
        position={[stages.icps.offsetX, stages.icps.offsetY, stages.icps.offsetZ]}
        visible={stages.icps.visible}
      >
        <ICPS />
      </group>
      <group
        position={[stages.sm.offsetX, stages.sm.offsetY, stages.sm.offsetZ]}
        visible={stages.sm.visible}
      >
        <ServiceModule solarDeploy={solarDeploy} />
      </group>
      <group
        position={[stages.crew.offsetX, stages.crew.offsetY, stages.crew.offsetZ]}
      >
        <CrewModule />
      </group>
      <group
        position={[stages.las.offsetX, stages.las.offsetY, stages.las.offsetZ]}
        visible={stages.las.visible}
      >
        <LaunchAbortSystem />
      </group>
    </group>
  )
}
