import type { RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { create } from 'zustand'

export type Projection = {
  x: number
  y: number
  onScreen: boolean
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
}

type ProjectorProps = {
  targets: ProjectionTarget[]
  parentRef?: RefObject<THREE.Object3D | null>
}

const worldVec = new THREE.Vector3()
const projectedVec = new THREE.Vector3()

export function Projector({ targets, parentRef }: ProjectorProps) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const setFrame = useProjectionStore((s) => s.setFrame)

  useFrame(() => {
    const parent = parentRef?.current
    const out: Record<string, Projection> = {}
    for (const t of targets) {
      worldVec.copy(t.point)
      if (parent) worldVec.applyMatrix4(parent.matrixWorld)
      projectedVec.copy(worldVec).project(camera)
      const onScreen = projectedVec.z <= 1 && projectedVec.z >= -1
      out[t.id] = {
        x: (projectedVec.x * 0.5 + 0.5) * size.width,
        y: (-projectedVec.y * 0.5 + 0.5) * size.height,
        onScreen,
      }
    }
    setFrame(out, { width: size.width, height: size.height })
  })

  return null
}
