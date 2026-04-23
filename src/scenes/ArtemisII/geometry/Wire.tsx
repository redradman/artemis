import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { buildWire, type BuildWireOptions } from './buildWire'
import { useToneMaterials } from '../materials'

type WireProps = BuildWireOptions & {
  geometry: THREE.BufferGeometry
  accent?: boolean
}

export function Wire({ geometry, angle, dense = true, accent = false }: WireProps) {
  const { edges, wireframe } = useMemo(
    () => buildWire(geometry, { angle, dense }),
    [geometry, angle, dense],
  )

  const mats = useToneMaterials()

  useEffect(
    () => () => {
      edges.dispose()
      wireframe?.dispose()
    },
    [edges, wireframe],
  )

  return (
    <>
      <lineSegments geometry={edges} material={accent ? mats.accent : mats.main} />
      {wireframe && <lineSegments geometry={wireframe} material={mats.mesh} />}
    </>
  )
}
