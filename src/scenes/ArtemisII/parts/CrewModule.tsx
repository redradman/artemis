import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Wire } from '../geometry/Wire'
import { wireAccent } from '../materials'

type WindowProps = {
  angle: number
  edges: THREE.EdgesGeometry
}

function PortholeWindow({ angle, edges }: WindowProps) {
  const ref = useRef<THREE.Group>(null)
  useEffect(() => {
    ref.current?.lookAt(Math.cos(angle) * 10, 53.8, Math.sin(angle) * 10)
  }, [angle])
  return (
    <group
      ref={ref}
      position={[Math.cos(angle) * 1.85, 53.8, Math.sin(angle) * 1.85]}
    >
      <lineSegments geometry={edges} material={wireAccent} />
    </group>
  )
}

export function CrewModule() {
  const capsuleGeo = useMemo(() => {
    const pts: THREE.Vector2[] = []
    pts.push(new THREE.Vector2(0, 0))
    pts.push(new THREE.Vector2(0.8, 0.05))
    pts.push(new THREE.Vector2(2.3, 0.3))
    pts.push(new THREE.Vector2(2.3, 0.55))
    for (let i = 0; i <= 12; i++) {
      const t = i / 12
      const y = 0.55 + t * 3.3
      const r = 2.3 - t * 1.45
      pts.push(new THREE.Vector2(r, y))
    }
    pts.push(new THREE.Vector2(0.85, 3.9))
    pts.push(new THREE.Vector2(0.85, 4.2))
    return new THREE.LatheGeometry(pts, 28)
  }, [])

  const windowEdges = useMemo(() => {
    const plane = new THREE.PlaneGeometry(0.35, 0.45)
    const edges = new THREE.EdgesGeometry(plane)
    plane.dispose()
    return edges
  }, [])

  return (
    <group>
      <group position={[0, 52, 0]}>
        <Wire geometry={capsuleGeo} />
      </group>
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4
        return <PortholeWindow key={i} angle={angle} edges={windowEdges} />
      })}
    </group>
  )
}
