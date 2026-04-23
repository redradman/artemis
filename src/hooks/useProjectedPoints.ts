import type { RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { create } from 'zustand'

export type Projection = {
  x: number
  y: number
  /** NDC z clipped to the near/far frustum. */
  onScreen: boolean
  /**
   * True when the anchor is on the side of the model facing the camera —
   * used as a cheap occlusion proxy so labels hide when they'd otherwise
   * point at the far side of the rocket.
   */
  facing: boolean
  /** Depth in view space (world units from camera). */
  depth: number
}

export type Viewport = {
  width: number
  height: number
}

type ProjectionState = {
  projections: Record<string, Projection>
  viewport: Viewport
  setFrame: (projections: Record<string, Projection>, viewport: Viewport) => void
}

export const useProjectionStore = create<ProjectionState>((set) => ({
  projections: {},
  viewport: { width: 0, height: 0 },
  setFrame: (projections, viewport) => set({ projections, viewport }),
}))

export type ProjectionTarget = {
  id: string
  point: THREE.Vector3
  /**
   * Optional hint for the occlusion test. Targets set `skipFacing` when they
   * represent abstract rigging (scale reference ticks) rather than points on
   * the model surface.
   */
  skipFacing?: boolean
  /**
   * When true, the target's `point` is interpreted in world space and the
   * parentRef's matrix is not applied. Used by fixed scene rigging like
   * the altitude scale ticks, which should stay vertical even when the
   * rocket group itself is rotated for keyed banking.
   */
  skipParent?: boolean
}

type ProjectorProps = {
  targets: ProjectionTarget[]
  parentRef?: RefObject<THREE.Object3D | null>
  /** World-space centre of the rocket — used by the facing test. */
  modelCenter?: THREE.Vector3
  /**
   * World-space radius around modelCenter. A target within this radius is
   * considered "close to the model surface"; the facing test only fires on
   * these so free-floating targets (scale reference) stay visible.
   */
  modelRadius?: number
}

const worldVec = new THREE.Vector3()
const projectedVec = new THREE.Vector3()
const camPos = new THREE.Vector3()
const toAnchor = new THREE.Vector3()
const toCamera = new THREE.Vector3()
const viewVec = new THREE.Vector3()

export function Projector({
  targets,
  parentRef,
  modelCenter,
  modelRadius = 8,
}: ProjectorProps) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const setFrame = useProjectionStore((s) => s.setFrame)

  useFrame(() => {
    const parent = parentRef?.current
    camera.getWorldPosition(camPos)

    const out: Record<string, Projection> = {}
    for (const t of targets) {
      worldVec.copy(t.point)
      if (parent && !t.skipParent) worldVec.applyMatrix4(parent.matrixWorld)
      projectedVec.copy(worldVec).project(camera)
      const onScreen = projectedVec.z <= 1 && projectedVec.z >= -1

      let facing = true
      if (!t.skipFacing && modelCenter) {
        // Facing test in the XZ plane (horizontal) only — the rocket is
        // essentially cylindrical, so an anchor's vertical offset shouldn't
        // decide visibility. A negative dot product means the anchor is
        // behind the model from the camera's point of view; we only hide
        // when it's *clearly* behind (cos(θ) < -0.35 ≈ > 110° off-axis) so
        // grazing-angle anchors (booster side faces, off-centre panels)
        // stay labelled even at default orbit.
        toAnchor.set(worldVec.x - modelCenter.x, 0, worldVec.z - modelCenter.z)
        toCamera.set(camPos.x - modelCenter.x, 0, camPos.z - modelCenter.z)
        const anchorDist = toAnchor.length()
        if (anchorDist <= modelRadius) {
          facing = true
        } else {
          const cameraDist = toCamera.length() || 1
          const cos = toAnchor.dot(toCamera) / (anchorDist * cameraDist)
          facing = cos > -0.35
        }
      }

      viewVec.subVectors(worldVec, camPos)
      const depth = viewVec.length()

      out[t.id] = {
        x: (projectedVec.x * 0.5 + 0.5) * size.width,
        y: (-projectedVec.y * 0.5 + 0.5) * size.height,
        onScreen,
        facing,
        depth,
      }
    }
    setFrame(out, { width: size.width, height: size.height })
  })

  return null
}
