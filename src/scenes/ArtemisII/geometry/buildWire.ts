import * as THREE from 'three'

export type BuildWireOptions = {
  angle?: number
  dense?: boolean
}

export type BuildWireResult = {
  edges: THREE.EdgesGeometry
  wireframe: THREE.WireframeGeometry | null
}

export function buildWire(
  geometry: THREE.BufferGeometry,
  options: BuildWireOptions = {},
): BuildWireResult {
  const { angle = 15, dense = true } = options
  const edges = new THREE.EdgesGeometry(geometry, angle)
  const wireframe = dense ? new THREE.WireframeGeometry(geometry) : null
  return { edges, wireframe }
}
