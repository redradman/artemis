import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'

type ControlsLike = {
  target: THREE.Vector3
  enabled: boolean
  enableDamping: boolean
  update: () => boolean | void
}

type Animation = {
  start: number
  fromTarget: THREE.Vector3
  toTarget: THREE.Vector3
  // Camera pose is interpolated in spherical space rather than as a straight
  // chord between fromPos/toPos: the orbit direction is slerped, the distance
  // is interpolated geometrically, and the look-at target is lerped. Composed
  // back as `target + dir * dist` each frame.
  fromDir: THREE.Vector3
  dirDelta: THREE.Quaternion
  fromDist: number
  toDist: number
}

const DURATION_MS = 800
const SKIP_THRESHOLD = 0.01
const IDENTITY_QUAT = new THREE.Quaternion()

// Symmetric ease with no overshoot. The previous easeOutBackSoft overshot the
// parameter to ~1.05, which — because position was a straight lerp across the
// full travel chord — drove the camera a large fraction of a tight part's
// framing radius *past* the target before snapping back. A monotonic
// ease-in-out keeps the dolly weighted at both ends without ever passing the
// destination.
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  )
}

export function useCameraFlyTo(
  controlsRef: RefObject<ControlsLike | null>,
  target: THREE.Vector3,
  radius: number,
  parentRef?: RefObject<THREE.Object3D | null>,
  fixedPos?: THREE.Vector3,
) {
  const camera = useThree((s) => s.camera)
  const animRef = useRef<Animation | null>(null)

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    const worldTarget = target.clone()
    const parent = parentRef?.current
    if (parent) {
      parent.updateMatrixWorld()
      worldTarget.applyMatrix4(parent.matrixWorld)
    }

    const fromPos = camera.position.clone()
    const fromTarget = controls.target.clone()

    // When fixedPos is supplied the caller wants an absolute destination
    // (e.g. RESET restoring the page-load camera angle, not just its
    // distance). Otherwise preserve the current viewing direction and
    // just re-radius along it.
    let toPos: THREE.Vector3
    if (fixedPos) {
      toPos = fixedPos.clone()
    } else {
      const offset = fromPos.clone().sub(fromTarget)
      const dist = offset.length()
      const dir =
        dist > 1e-4 ? offset.divideScalar(dist) : new THREE.Vector3(0, 0, 1)
      toPos = worldTarget.clone().add(dir.multiplyScalar(radius))
    }

    if (
      fromPos.distanceTo(toPos) < SKIP_THRESHOLD &&
      fromTarget.distanceTo(worldTarget) < SKIP_THRESHOLD
    ) {
      return
    }

    if (prefersReducedMotion()) {
      camera.position.copy(toPos)
      controls.target.copy(worldTarget)
      controls.update()
      animRef.current = null
      return
    }

    // Decompose both poses into orbit-relative (direction, distance) so the
    // camera arcs around the model at a controlled distance instead of
    // travelling a straight line through it.
    const fromOffset = fromPos.clone().sub(fromTarget)
    const toOffset = toPos.clone().sub(worldTarget)
    const fromDist = Math.max(fromOffset.length(), 1e-4)
    const toDist = Math.max(toOffset.length(), 1e-4)
    const fromDir = fromOffset.divideScalar(fromDist)
    const toDir = toOffset.divideScalar(toDist)

    animRef.current = {
      start: performance.now(),
      fromTarget,
      toTarget: worldTarget,
      fromDir,
      dirDelta: new THREE.Quaternion().setFromUnitVectors(fromDir, toDir),
      fromDist,
      toDist,
    }
    // Suspend user input and damping for the duration of the scripted move so
    // OrbitControls' residual sphericalDelta can't fight the per-frame pose we
    // write. Both are restored on completion (enableDamping is statically on).
    controls.enabled = false
    controls.enableDamping = false
  }, [target, radius, camera, controlsRef, parentRef, fixedPos])

  const dirQuat = useRef(new THREE.Quaternion())
  const dir = useRef(new THREE.Vector3())

  useFrame(() => {
    const anim = animRef.current
    if (!anim) return
    const controls = controlsRef.current
    if (!controls) return

    const elapsed = performance.now() - anim.start
    const t = Math.min(1, elapsed / DURATION_MS)
    const k = easeInOutCubic(t)

    // Direction: slerp the orbit vector from start to end.
    dirQuat.current.copy(IDENTITY_QUAT).slerp(anim.dirDelta, k)
    dir.current.copy(anim.fromDir).applyQuaternion(dirQuat.current)
    // Distance: geometric interpolation keeps the perceived zoom rate uniform
    // (apparent size ≈ 1/distance), so a 250→36 dive no longer rushes the end.
    const dist = anim.fromDist * Math.pow(anim.toDist / anim.fromDist, k)
    // Target: linear is fine — it's a short slide compared to the dolly.
    controls.target.lerpVectors(anim.fromTarget, anim.toTarget, k)
    camera.position.copy(controls.target).addScaledVector(dir.current, dist)
    controls.update()

    if (t >= 1) {
      animRef.current = null
      controls.enabled = true
      controls.enableDamping = true
    }
  })
}
