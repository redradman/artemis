import * as THREE from 'three'

// Module-scope caches for effect geometries. Mirrors the pattern used by
// SolidRocketBooster's ringEdges — build once, reference many times.

// Single dashed line along +X (0..length). Caller rotates/positions.
const quillCache = new Map<number, THREE.BufferGeometry>()
export function getQuillGeometry(length: number): THREE.BufferGeometry {
  const cached = quillCache.get(length)
  if (cached) return cached
  const g = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(length, 0, 0),
  ])
  // LineDashedMaterial requires line distances.
  const pos = g.getAttribute('position') as THREE.BufferAttribute
  const distances = new Float32Array(pos.count)
  distances[0] = 0
  distances[1] = length
  g.setAttribute('lineDistance', new THREE.BufferAttribute(distances, 1))
  quillCache.set(length, g)
  return g
}

// Torus edges for shock rings + parachute hoops.
const torusCache = new Map<string, THREE.EdgesGeometry>()
export function getTorusEdges(
  radius: number,
  tube: number,
  radialSegments: number,
  tubularSegments: number,
): THREE.EdgesGeometry {
  const key = `${radius}|${tube}|${radialSegments}|${tubularSegments}`
  const cached = torusCache.get(key)
  if (cached) return cached
  const torus = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments)
  const edges = new THREE.EdgesGeometry(torus, 1)
  torus.dispose()
  torusCache.set(key, edges)
  return edges
}
