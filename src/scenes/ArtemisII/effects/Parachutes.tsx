import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Three main canopies deployed above the capsule at splashdown.
// Each canopy is a hemisphere mesh (upper half of a sphere) with a
// translucent amber fabric material, meridian seam lines, and a fan of
// risers dropping to the capsule. Fresh deployed state only — the
// drogues/pilots/forward-bay have already released by this point in
// the mission, so only the mains are visible.
//
// Motion is subtle:
//  - Per-canopy cloth billow: low-frequency radial vertex wobble via
//    a scale pulse (cheap approximation, no vertex shader).
//  - Shared pendulum sway: a small sin-driven rotation on the whole
//    cluster so the canopies appear to swing as the capsule beneath
//    them pendulums. The Rocket tree applies the matching sway to the
//    capsule itself (see PendulumGroup in Rocket.tsx).

export type ParachutesProps = {
  intensity: number
  /** Position of the capsule top (riser attach point) in rocket-local space. */
  capsuleTop: [number, number, number]
  /** When true, canopies use a richer, slightly larger style. */
  cinematic?: boolean
  /** Blueprint mode — swap the amber fabric for a cyan tint so the
   * splashdown canopies belong to the cyanotype palette. */
  blueprint?: boolean
}

type CanopySpec = {
  /** Centre of the canopy above the capsule. */
  center: [number, number, number]
  radius: number
}

const CANOPIES: CanopySpec[] = [
  { center: [-3.5, 12, 0], radius: 3.0 },
  { center: [3.5, 12, 0], radius: 3.0 },
  { center: [0, 13, 3.2], radius: 3.0 },
]

const RISERS_PER_CANOPY = 8
const BILLOW_FREQ = 1.8

// Amber fabric base — cooler in hybrid, warmer + brighter in cinematic.
const FABRIC_HYBRID = new THREE.Color('#e8a23b')
const FABRIC_CINEMATIC = new THREE.Color('#f4b95c')
// Blueprint fabric — paper-cyan to match the cyanotype palette. Used in
// place of the amber fabric colour when the blueprint theme is active.
const FABRIC_BLUEPRINT = new THREE.Color('#8fd2ff')

function buildHemisphereGeometry(radius: number): THREE.BufferGeometry {
  // thetaStart=0, thetaLength=π/2 gives upper hemisphere. Plenty of
  // meridians/parallels for a smooth silhouette at viewport scale.
  const g = new THREE.SphereGeometry(radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)
  return g
}

function buildSeamLines(radius: number, meridians: number): THREE.BufferGeometry {
  // Draw meridian arcs from the apex down to the equator on the hemisphere.
  // Each meridian is a polyline of N points.
  const points: THREE.Vector3[] = []
  const pointsPerMeridian = 12
  for (let m = 0; m < meridians; m++) {
    const phi = (m / meridians) * Math.PI * 2
    for (let i = 0; i < pointsPerMeridian - 1; i++) {
      const t1 = i / (pointsPerMeridian - 1)
      const t2 = (i + 1) / (pointsPerMeridian - 1)
      const theta1 = t1 * (Math.PI / 2)
      const theta2 = t2 * (Math.PI / 2)
      points.push(
        new THREE.Vector3(
          Math.sin(theta1) * Math.cos(phi) * radius,
          Math.cos(theta1) * radius,
          Math.sin(theta1) * Math.sin(phi) * radius,
        ),
      )
      points.push(
        new THREE.Vector3(
          Math.sin(theta2) * Math.cos(phi) * radius,
          Math.cos(theta2) * radius,
          Math.sin(theta2) * Math.sin(phi) * radius,
        ),
      )
    }
  }
  return new THREE.BufferGeometry().setFromPoints(points)
}

function buildRiserGeometry(
  radius: number,
  center: [number, number, number],
  capsuleTop: [number, number, number],
  count: number,
): THREE.BufferGeometry {
  const points: THREE.Vector3[] = []
  for (let i = 0; i < count; i++) {
    const phi = (i / count) * Math.PI * 2
    // Riser starts at the equator of the canopy (y=0 in canopy-local, so
    // y=center[1] in rocket-local).
    const startX = center[0] + Math.cos(phi) * radius
    const startZ = center[2] + Math.sin(phi) * radius
    points.push(new THREE.Vector3(startX, center[1], startZ))
    points.push(new THREE.Vector3(capsuleTop[0], capsuleTop[1], capsuleTop[2]))
  }
  return new THREE.BufferGeometry().setFromPoints(points)
}

type CanopyProps = {
  spec: CanopySpec
  capsuleTop: [number, number, number]
  fabricMat: THREE.MeshBasicMaterial
  seamMat: THREE.LineBasicMaterial
  riserMat: THREE.LineBasicMaterial
  billowPhase: number
}

function Canopy({
  spec,
  capsuleTop,
  fabricMat,
  seamMat,
  riserMat,
  billowPhase,
}: CanopyProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const seamRef = useRef<THREE.LineSegments>(null)

  const hemisphereGeo = useMemo(
    () => buildHemisphereGeometry(spec.radius),
    [spec.radius],
  )
  const seamGeo = useMemo(() => buildSeamLines(spec.radius, 12), [spec.radius])
  const riserGeo = useMemo(
    () => buildRiserGeometry(spec.radius, spec.center, capsuleTop, RISERS_PER_CANOPY),
    [spec.radius, spec.center, capsuleTop],
  )

  useEffect(() => {
    return () => {
      hemisphereGeo.dispose()
      seamGeo.dispose()
      riserGeo.dispose()
    }
  }, [hemisphereGeo, seamGeo, riserGeo])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    // Radial billow: scale the mesh's x/z slightly, keeping height steady.
    const billow = 1 + Math.sin(t * BILLOW_FREQ + billowPhase) * 0.03
    if (meshRef.current) {
      meshRef.current.scale.set(billow, 1 + Math.sin(t * BILLOW_FREQ * 0.7 + billowPhase) * 0.015, billow)
    }
    if (seamRef.current) {
      seamRef.current.scale.set(billow, 1 + Math.sin(t * BILLOW_FREQ * 0.7 + billowPhase) * 0.015, billow)
    }
  })

  return (
    <>
      <mesh ref={meshRef} geometry={hemisphereGeo} material={fabricMat} position={spec.center} />
      <lineSegments ref={seamRef} geometry={seamGeo} material={seamMat} position={spec.center} />
      <lineSegments geometry={riserGeo} material={riserMat} />
    </>
  )
}

export function Parachutes({
  intensity,
  capsuleTop,
  cinematic = false,
  blueprint = false,
}: ParachutesProps) {
  const groupRef = useRef<THREE.Group>(null)

  const fabricMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: blueprint
        ? FABRIC_BLUEPRINT
        : cinematic
          ? FABRIC_CINEMATIC
          : FABRIC_HYBRID,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  }, [cinematic, blueprint])

  const seamMat = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: 0xf0ebe0,
      transparent: true,
      opacity: 0,
    })
  }, [])

  const riserMat = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: 0xf0ebe0,
      transparent: true,
      opacity: 0,
    })
  }, [])

  /* eslint-disable react-hooks/immutability */
  useFrame(({ clock }) => {
    const g = groupRef.current
    if (!g) return
    if (intensity <= 0.01) {
      g.visible = false
      return
    }
    g.visible = true

    // Ease-in opacity driven by the deployment intensity scalar.
    const fabricTarget = cinematic ? 0.52 : 0.38
    fabricMat.opacity = fabricTarget * intensity
    seamMat.opacity = 0.75 * intensity
    riserMat.opacity = 0.85 * intensity

    // Shared pendulum sway: a small sin-driven yaw + roll oscillation.
    // The matching Rocket-level PendulumGroup applies the same motion
    // to the capsule so chutes and capsule swing in sync.
    const swayAmt = intensity * 0.05
    g.rotation.z = Math.sin(clock.elapsedTime * 0.8) * swayAmt
    g.rotation.x = Math.sin(clock.elapsedTime * 0.65 + 1.2) * swayAmt * 0.7
  })
  /* eslint-enable react-hooks/immutability */

  return (
    <group ref={groupRef} position={capsuleTop}>
      {CANOPIES.map((spec, i) => (
        // spec.center is already expressed in canopy-cluster-local space
        // (relative to capsuleTop), and capsuleTop={[0,0,0]} tells the
        // Canopy's risers to terminate at the cluster origin — which IS
        // the capsuleTop in world space after the outer group translation.
        <Canopy
          key={i}
          spec={spec}
          capsuleTop={[0, 0, 0]}
          fabricMat={fabricMat}
          seamMat={seamMat}
          riserMat={riserMat}
          billowPhase={i * 1.1}
        />
      ))}
    </group>
  )
}
