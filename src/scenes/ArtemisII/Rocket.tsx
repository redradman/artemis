import type { Ref } from 'react'
import type * as THREE from 'three'
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
  return (
    <group ref={ref} position={[0, -28, 0]}>
      <SolidRocketBooster x={-6} />
      <SolidRocketBooster x={6} />
      <CoreStage />
      <ICPS />
      <ServiceModule />
      <CrewModule />
      <LaunchAbortSystem />
    </group>
  )
}
