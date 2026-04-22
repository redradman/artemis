import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { buildWire, type BuildWireOptions } from './buildWire'
import { wireAccent, wireMain, wireMesh } from '../materials'

type WireProps = BuildWireOptions & {
  geometry: THREE.BufferGeometry
  accent?: boolean
}

export function Wire({ geometry, angle, dense = true, accent = false }: WireProps) {
  const { edges, wireframe } = useMemo(
    () => buildWire(geometry, { angle, dense }),
    [geometry, angle, dense],
  )

  useEffect(
    () => () => {
      edges.dispose()
      wireframe?.dispose()
    },
    [edges, wireframe],
  )

  return (
    <>
      <lineSegments geometry={edges} material={accent ? wireAccent : wireMain} />
      {wireframe && <lineSegments geometry={wireframe} material={wireMesh} />}
    </>
  )
}
