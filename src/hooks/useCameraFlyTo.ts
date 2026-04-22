import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'

type ControlsLike = {
  target: THREE.Vector3
  enabled: boolean
  update: () => boolean | void
}

type Animation = {
  start: number
  fromPos: THREE.Vector3
  fromTarget: THREE.Vector3
  toPos: THREE.Vector3
  toTarget: THREE.Vector3
}

const DURATION_MS = 800
const SKIP_THRESHOLD = 0.01

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
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

    const offset = fromPos.clone().sub(fromTarget)
    const dist = offset.length()
    const dir =
      dist > 1e-4 ? offset.divideScalar(dist) : new THREE.Vector3(0, 0, 1)

    const toPos = worldTarget.clone().add(dir.multiplyScalar(radius))

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

    animRef.current = {
      start: performance.now(),
      fromPos,
      fromTarget,
      toPos,
      toTarget: worldTarget,
    }
    controls.enabled = false
  }, [target, radius, camera, controlsRef, parentRef])

  useFrame(() => {
    const anim = animRef.current
    if (!anim) return
    const controls = controlsRef.current
    if (!controls) return

    const elapsed = performance.now() - anim.start
    const t = Math.min(1, elapsed / DURATION_MS)
    const k = easeOutCubic(t)

    camera.position.lerpVectors(anim.fromPos, anim.toPos, k)
    controls.target.lerpVectors(anim.fromTarget, anim.toTarget, k)
    controls.update()

    if (t >= 1) {
      animRef.current = null
      controls.enabled = true
    }
  })
}
