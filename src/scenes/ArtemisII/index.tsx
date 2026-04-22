import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Rocket } from './Rocket'
import { Projector } from '../../hooks/useProjectedPoints'
import { components } from './data/components'
import { useMissionState } from '../../hooks/useMissionState'
import { useMissionStore } from '../../store/missionStore'

export function ArtemisIIScene() {
  const rocketRef = useRef<THREE.Group>(null)
  const { state } = useMissionState()
  const autoRotate = useMissionStore((s) => s.autoRotate)

  const targets = useMemo(() => {
    return components.map((c) => {
      const stageOffset = state.stages[c.stage]
      const point = c.anchor
        .clone()
        .add(new THREE.Vector3(stageOffset.offsetX, stageOffset.offsetY, stageOffset.offsetZ))
      return { id: c.id, point }
    })
  }, [state])

  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      camera={{
        fov: 28,
        near: 0.1,
        far: 2000,
        position: [117.56, 1.5, 161.8],
      }}
    >
      <fog attach="fog" args={[0x000000, 80, 260]} />
      <ambientLight intensity={1} />
      <Rocket ref={rocketRef} />
      <Projector targets={targets} parentRef={rocketRef} />
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={15}
        maxDistance={400}
        target={[0, 1.5, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.6}
      />
    </Canvas>
  )
}
