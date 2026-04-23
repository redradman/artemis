import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useThree, useFrame as useFrameHook } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei/core/OrbitControls.js'
import { Rocket } from './Rocket'
import { Projector } from '../../hooks/useProjectedPoints'
import { useCameraFlyTo } from '../../hooks/useCameraFlyTo'
import { components } from './data/components'
import { useMissionState } from '../../hooks/useMissionState'
import { useMissionStore } from '../../store/missionStore'
import { CelestialBodies } from './effects/CelestialBodies'

// Cinematic mode swaps the flat ambient fill for a low-ambient + key +
// warm rim rig so the solid MeshPhong panels read three-dimensional. The
// wire materials ignore lights, so this rig is transparent to hybrid.
function CinematicLights() {
  return (
    <>
      <ambientLight intensity={0.3} color={0xfff4dc} />
      {/* Warm key light, upper-right front */}
      <directionalLight position={[80, 120, 140]} intensity={1.05} color={0xfff0d4} />
      {/* Cool fill, lower-left back — fills shadows and softens the scene */}
      <directionalLight position={[-100, -40, -80]} intensity={0.3} color={0x99b8d8} />
      {/* Amber underlight — Earth-glow / engine wash on the underside */}
      <directionalLight position={[0, -90, 30]} intensity={0.35} color={0xe8a23b} />
      {/* Rear amber rim — sits behind the ship relative to the default
          camera (camera near (+x, +z)), so it catches the far silhouette
          in warm trim. */}
      <directionalLight position={[-160, 40, -220]} intensity={0.65} color={0xf4a33a} />
      {/* Cool top-back kicker — gives the nose a faint cold specular
          against the warm key. */}
      <directionalLight position={[40, 180, -120]} intensity={0.35} color={0x9cb6d6} />
    </>
  )
}

const DEFAULT_TARGET = new THREE.Vector3(0, 1.5, 0)
// 250u puts the 73-unit-tall rocket at ~58% of viewport height so the
// bottom timeline wrap never crops the RS-25 skirt on first load.
const DEFAULT_RADIUS = 250
// The exact camera pose used on page load. RESET flies back to this
// absolute position so the ship returns to its original orientation
// rather than just its original distance along whatever angle the
// user last rotated to.
const INITIAL_CAMERA_POSITION = new THREE.Vector3(146.95, 1.5, 202.25)

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
      // Pull the camera back by ~1.8× the per-component focusRadius so
      // the selected part is framed with surrounding context instead
      // of filling the viewport edge-to-edge. With the new silhouette
      // highlight the whole outlined stage needs to be visible.
      if (c)
        return {
          target: c.focus.clone(),
          radius: c.focusRadius * 1.8,
          local: true,
          fixedPos: undefined as THREE.Vector3 | undefined,
        }
    }
    // Clone DEFAULT_TARGET so each memo pass produces a new reference. That
    // way `cameraResetNonce` participating in the deps is enough to make
    // useCameraFlyTo re-trigger on RESET even though the logical goal is
    // identical to what it was before the user rotated. fixedPos pins the
    // destination to the exact page-load camera pose so RESET restores the
    // original orientation, not just the original distance.
    return {
      target: DEFAULT_TARGET.clone(),
      radius: DEFAULT_RADIUS,
      local: false,
      fixedPos: INITIAL_CAMERA_POSITION.clone() as THREE.Vector3 | undefined,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeComponent, cameraResetNonce])

  useCameraFlyTo(
    controlsRef,
    goal.target,
    goal.radius,
    goal.local ? rocketRef : undefined,
    goal.fixedPos,
  )
  return null
}

// Tiny dolly wobble applied during playback around a handful of marquee
// phase events — SRB SEP, MECO, TLI, ENTRY. Gives the camera a whisper
// of editorial push without overriding the user's orbit. Suspends
// whenever a component focus or fly-to animation is active so it
// doesn't fight `useCameraFlyTo`.
const DRAMA_EVENTS: Array<{ t: number; push: number; half: number }> = [
  { t: 0.08, push: -0.06, half: 0.022 }, // SRB SEP: slight push-in
  { t: 0.22, push: 0.05, half: 0.022 }, // MECO: gentle pull-back
  { t: 0.52, push: -0.05, half: 0.03 }, // TLI burn
  { t: 0.96, push: 0.08, half: 0.022 }, // ENTRY: pull back for the plasma show
]

function dramaOffset(t: number): number {
  let total = 0
  for (const ev of DRAMA_EVENTS) {
    const dist = Math.abs(t - ev.t)
    if (dist >= ev.half) continue
    const u = 1 - dist / ev.half
    // Smooth bell: u^2 * (3 - 2u) — easeInOut hump centred on the event.
    total += ev.push * (u * u * (3 - 2 * u))
  }
  return total
}

function CameraDrama({
  controlsRef,
}: {
  controlsRef: React.RefObject<OrbitControlsRef | null>
}) {
  const camera = useThree((s) => s.camera)
  const lastAppliedRef = useRef(0)
  const isPlaying = useMissionStore((s) => s.isPlaying)
  const activeComponent = useMissionStore((s) => s.activeComponent)

  useFrameHook(() => {
    const controls = controlsRef.current
    if (!controls) return
    if (!isPlaying || activeComponent) {
      // Dissolve any residual drama so the camera returns cleanly to the
      // baseline distance the user last held.
      if (Math.abs(lastAppliedRef.current) > 0.0005) {
        const undo = -lastAppliedRef.current * 0.15
        const offset = camera.position.clone().sub(controls.target)
        offset.multiplyScalar(1 + undo)
        camera.position.copy(controls.target).add(offset)
        lastAppliedRef.current += undo
        controls.update()
      }
      return
    }
    const t = useMissionStore.getState().currentT
    const target = dramaOffset(t)
    const delta = target - lastAppliedRef.current
    if (Math.abs(delta) < 0.0003) return
    const offset = camera.position.clone().sub(controls.target)
    offset.multiplyScalar(1 + delta)
    camera.position.copy(controls.target).add(offset)
    lastAppliedRef.current = target
    controls.update()
  })

  return null
}

// Listens for window "artemis:zoom" events (dispatched by the HUD zoom
// buttons) and dollies the camera toward/away from the orbit target. A
// window event is the cleanest bridge across the Canvas reconciler
// boundary without threading a global ref through React.
function ZoomListener({
  controlsRef,
}: {
  controlsRef: React.RefObject<OrbitControlsRef | null>
}) {
  const camera = useThree((s) => s.camera)

  useEffect(() => {
    const onZoom = (e: Event) => {
      const direction = (e as CustomEvent<{ direction: 'in' | 'out' }>).detail
        ?.direction
      const controls = controlsRef.current
      if (!direction || !controls) return
      const factor = direction === 'in' ? 0.78 : 1.28
      const target = controls.target
      const offset = camera.position.clone().sub(target)
      const newLen = Math.max(18, Math.min(380, offset.length() * factor))
      offset.setLength(newLen)
      camera.position.copy(target).add(offset)
      controls.update()
    }
    window.addEventListener('artemis:zoom', onZoom as EventListener)
    return () => window.removeEventListener('artemis:zoom', onZoom as EventListener)
  }, [camera, controlsRef])

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
      // Cap device-pixel ratio at 1.5×. A full 2× on a retina display
      // quadruples pixel-shading cost for a modest quality gain; the
      // particle systems and bloom sprites already carry the visual
      // load, so the extra resolution just burns GPU time.
      dpr={[1, 1.5]}
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
      <CelestialBodies cinematic={cinematic} />
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
      <ZoomListener controlsRef={controlsRef} />
      <CameraDrama controlsRef={controlsRef} />
    </Canvas>
  )
}
