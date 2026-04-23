import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei/core/OrbitControls.js'
import { Rocket } from './Rocket'
import { Projector } from '../../hooks/useProjectedPoints'
import { useCameraFlyTo } from '../../hooks/useCameraFlyTo'
import { components } from './data/components'
import { useMissionState } from '../../hooks/useMissionState'
import { useMissionStore } from '../../store/missionStore'

// Cinematic mode swaps the flat ambient fill for a low-ambient + key +
// warm rim rig so the solid MeshPhong panels read three-dimensional. The
// wire materials ignore lights, so this rig is transparent to hybrid.
function CinematicLights() {
  return (
    <>
      <ambientLight intensity={0.32} color={0xfff4dc} />
      {/* Warm key light, upper-right front */}
      <directionalLight position={[80, 120, 140]} intensity={1.1} color={0xfff0d4} />
      {/* Cool fill, lower-left back — fills shadows and gives a subtle rim */}
      <directionalLight position={[-100, -40, -80]} intensity={0.35} color={0x99b8d8} />
      {/* Amber underlight — hints at Earth-glow / engine wash on the underside */}
      <directionalLight position={[0, -90, 30]} intensity={0.4} color={0xe8a23b} />
    </>
  )
}

const DEFAULT_TARGET = new THREE.Vector3(0, 1.5, 0)
// 250u puts the 73-unit-tall rocket at ~58% of viewport height so the
// bottom timeline wrap never crops the RS-25 skirt on first load.
const DEFAULT_RADIUS = 250

// World-space centre of the rocket after the group's -28y translation.
// Matches OrbitControls target; the Projector uses this for the facing test.
const MODEL_CENTER = new THREE.Vector3(0, 1.5, 0)

// Scale-reference targets. The rocket geometry spans world y -7 → 66 (73 units)
// representing 0 → 98.1 m. Scale = 73/98.1 = 0.744 units per metre. These
// are anchored in WORLD space (skipParent) so that keyed banking, which
// rotates the rocket group about the camera target, doesn't drag the scale
// ticks along with it. The scale stays vertical regardless of ship attitude.
const SCALE_HEIGHTS_M = [0, 25, 50, 75, 100]
const SCALE_UNITS_PER_M = 73 / 98.1
const SCALE_Y_BASE_WORLD = -35 // original rocket-local -7 + group translation -28
const SCALE_TARGETS = SCALE_HEIGHTS_M.map((m) => ({
  id: `scale:${m}`,
  point: new THREE.Vector3(0, SCALE_Y_BASE_WORLD + m * SCALE_UNITS_PER_M, 0),
  skipFacing: true,
  skipParent: true,
}))

type OrbitControlsRef = React.ComponentRef<typeof OrbitControls>

function CameraRig({
  controlsRef,
  rocketRef,
}: {
  controlsRef: React.RefObject<OrbitControlsRef | null>
  rocketRef: React.RefObject<THREE.Group | null>
}) {
  const activeComponent = useMissionStore((s) => s.activeComponent)
  const cameraResetNonce = useMissionStore((s) => s.cameraResetNonce)

  const goal = useMemo(() => {
    if (activeComponent) {
      const c = components.find((x) => x.id === activeComponent)
      if (c) return { target: c.focus.clone(), radius: c.focusRadius, local: true }
    }
    // Clone DEFAULT_TARGET so each memo pass produces a new reference. That
    // way `cameraResetNonce` participating in the deps is enough to make
    // useCameraFlyTo re-trigger on RESET even though the logical goal is
    // identical to what it was before the user rotated.
    return {
      target: DEFAULT_TARGET.clone(),
      radius: DEFAULT_RADIUS,
      local: false,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeComponent, cameraResetNonce])

  useCameraFlyTo(
    controlsRef,
    goal.target,
    goal.radius,
    goal.local ? rocketRef : undefined,
  )
  return null
}

export function ArtemisIIScene() {
  const rocketRef = useRef<THREE.Group>(null)
  const controlsRef = useRef<OrbitControlsRef>(null)
  const { state } = useMissionState()
  const autoRotate = useMissionStore((s) => s.autoRotate)
  const activeComponent = useMissionStore((s) => s.activeComponent)
  const renderMode = useMissionStore((s) => s.renderMode)
  const cinematic = renderMode === 'cinematic'

  const targets = useMemo(() => {
    const componentTargets = components.map((c) => {
      const stageOffset = state.stages[c.stage]
      const point = c.anchor
        .clone()
        .add(new THREE.Vector3(stageOffset.offsetX, stageOffset.offsetY, stageOffset.offsetZ))
      return { id: c.id, point }
    })
    return [...componentTargets, ...SCALE_TARGETS]
  }, [state])

  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      camera={{
        fov: 28,
        near: 0.1,
        far: 2000,
        position: [146.95, 1.5, 202.25],
      }}
    >
      {/* Fog near plane pushed past OrbitControls maxDistance (400) so the
          rocket stays at full opacity across the entire zoom range. Kept as
          a very distant backstop rather than removed outright. */}
      <fog attach="fog" args={[0x000000, 500, 900]} />
      {cinematic ? <CinematicLights /> : <ambientLight intensity={1} />}
      <Rocket ref={rocketRef} />
      <Projector
        targets={targets}
        parentRef={rocketRef}
        modelCenter={MODEL_CENTER}
        modelRadius={8}
      />
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.08}
        minDistance={15}
        maxDistance={400}
        target={[0, 1.5, 0]}
        autoRotate={autoRotate && !activeComponent}
        autoRotateSpeed={0.6}
      />
      <CameraRig controlsRef={controlsRef} rocketRef={rocketRef} />
    </Canvas>
  )
}
