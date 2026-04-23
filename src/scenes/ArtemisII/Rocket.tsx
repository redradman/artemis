import type { Ref } from 'react'
import type * as THREE from 'three'
import { useMissionState } from '../../hooks/useMissionState'
import { useMissionStore } from '../../store/missionStore'
import { ClickableModule } from './ClickableModule'
import { CoreStage } from './parts/CoreStage'
import { CrewModule } from './parts/CrewModule'
import { ICPS } from './parts/ICPS'
import { LaunchAbortSystem } from './parts/LaunchAbortSystem'
import { ServiceModule } from './parts/ServiceModule'
import { SolidRocketBooster } from './parts/SolidRocketBooster'
import { MissionEffects } from './effects/MissionEffects'
import { CapsulePendulum } from './effects/CapsulePendulum'
import { CinematicShell } from './effects/CinematicShell'
import { HybridDetails } from './effects/HybridDetails'
import { ActiveIdContext } from './materials'

type RocketProps = {
  ref?: Ref<THREE.Group>
}

const COLLIDERS = {
  srb: { radius: 2.2, height: 50, y: 22 },
  core: { radius: 3.2, height: 50, y: 17 },
  icps: { radius: 2.7, height: 9.5, y: 44 },
  sm: { radius: 2.4, height: 5.5, y: 50 },
  crew: { radius: 2.4, height: 4.5, y: 54 },
  las: { radius: 1.0, height: 11, y: 61 },
} as const

// Outer pivot sits at the camera target (0, 1.5, 0) so banking rotates
// the rocket around its own geometric midpoint — "rotate in place" — and
// the inner group carries the historical -28y translation that lifts the
// aft skirt to world y=0.
const PIVOT_Y = 1.5
const INNER_Y = -28 - PIVOT_Y

export function Rocket({ ref }: RocketProps) {
  const { state } = useMissionState()
  const { stages, solarDeploy, orientation } = state
  const renderMode = useMissionStore((s) => s.renderMode)
  const activeComponent = useMissionStore((s) => s.activeComponent)
  const isPlaying = useMissionStore((s) => s.isPlaying)
  const cinematic = renderMode === 'cinematic'
  const blueprint = renderMode === 'blueprint'

  return (
    <ActiveIdContext.Provider value={activeComponent}>
      <group
        position={[0, PIVOT_Y, 0]}
        rotation={[orientation.pitch, orientation.yaw, orientation.roll]}
      >
        <group ref={ref} position={[0, INNER_Y, 0]}>
          <ClickableModule
            id="solid-booster"
            collider={COLLIDERS.srb}
            position={[-6 + stages.srbL.offsetX, stages.srbL.offsetY, stages.srbL.offsetZ]}
            visible={stages.srbL.visible}
          >
            {!cinematic && <SolidRocketBooster x={0} />}
          </ClickableModule>
          <ClickableModule
            id="solid-booster"
            collider={COLLIDERS.srb}
            position={[6 + stages.srbR.offsetX, stages.srbR.offsetY, stages.srbR.offsetZ]}
            visible={stages.srbR.visible}
          >
            {!cinematic && <SolidRocketBooster x={0} />}
          </ClickableModule>
          <ClickableModule
            id="core-stage"
            collider={COLLIDERS.core}
            position={[stages.core.offsetX, stages.core.offsetY, stages.core.offsetZ]}
            visible={stages.core.visible}
          >
            {!cinematic && <CoreStage />}
          </ClickableModule>
          <ClickableModule
            id="icps"
            collider={COLLIDERS.icps}
            position={[stages.icps.offsetX, stages.icps.offsetY, stages.icps.offsetZ]}
            visible={stages.icps.visible}
          >
            {!cinematic && <ICPS />}
          </ClickableModule>
          <ClickableModule
            id="service-module"
            collider={COLLIDERS.sm}
            position={[stages.sm.offsetX, stages.sm.offsetY, stages.sm.offsetZ]}
            visible={stages.sm.visible}
          >
            {!cinematic && <ServiceModule solarDeploy={solarDeploy} />}
          </ClickableModule>
          <CapsulePendulum intensity={state.effects.parachutes} pivotY={56.2}>
            <ClickableModule
              id="crew-module"
              collider={COLLIDERS.crew}
              position={[stages.crew.offsetX, stages.crew.offsetY, stages.crew.offsetZ]}
            >
              {!cinematic && <CrewModule />}
            </ClickableModule>
          </CapsulePendulum>
          <ClickableModule
            id="launch-abort"
            collider={COLLIDERS.las}
            position={[stages.las.offsetX, stages.las.offsetY, stages.las.offsetZ]}
            visible={stages.las.visible}
          >
            {!cinematic && <LaunchAbortSystem />}
          </ClickableModule>
          {cinematic && <CinematicShell state={state} activeId={activeComponent} />}
          {!cinematic && <HybridDetails state={state} />}
          <MissionEffects
            state={state}
            cinematic={cinematic}
            blueprint={blueprint}
            isPlaying={isPlaying}
          />
        </group>
      </group>
    </ActiveIdContext.Provider>
  )
}
