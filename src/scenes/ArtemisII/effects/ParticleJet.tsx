import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// A GPU-friendly streaking-spark exhaust jet.
//
// Geometry is a pre-allocated `BufferGeometry` with position + color
// attributes for N line segments (= 2N vertices). Each particle is a
// short amber line from its current position to a tail point trailing
// the velocity vector — classic "streak" look.
//
// A secondary translucent cone sits behind the streaks for the "soft
// trail" glow effect. In cinematic mode both elements scale up: more
// particles, longer streaks, wider trail, white-hot core.
//
// No shaders or postprocessing — everything runs through additive
// LineBasicMaterial / MeshBasicMaterial. This keeps the component
// compatible with the existing three@0.160 pipeline.

export type ParticleJetProps = {
  /** Emitter origin in the host group's local space. */
  position: [number, number, number]
  /** Direction the exhaust flows. Normalised internally. Default: -Y. */
  direction?: [number, number, number]
  /** 0..1 — overall activity level; drives opacity, emission rate, trail size. */
  intensity: number
  /** Half-angle of the exhaust cone in radians. Wider = more spread. */
  spread?: number
  /** Mean particle speed (world units / second). */
  speed?: number
  /** Particle lifetime in seconds. Longer = longer trails. */
  lifetime?: number
  /** Trail cone base radius + length (world units). */
  trailRadius?: number
  trailLength?: number
  /** Number of particles in the pool. Kept low for sepmotor puffs. */
  count?: number
  /** Render mode — cinematic doubles the pool, brightens the core. */
  cinematic?: boolean
  /** Blueprint mode — recolour the plume to cyan so no orange bleeds into
   * the cyanotype palette. Overrides the default amber streak. */
  blueprint?: boolean
}

// Amber #e8a23b as normalised RGB.
const AMBER = new THREE.Color('#e8a23b')
// White-hot blow-out colour for cinematic mode core.
const HOT = new THREE.Color('#fff5d6')
// Blueprint palette — sky cyan matches --color-accent in blueprint theme
// and the cyan retint applied to wire* materials by applyWirePalette.
const BP_HEAD = new THREE.Color('#c8e6ff')
const BP_TAIL = new THREE.Color('#6fb8e8')

export function ParticleJet({
  position,
  direction = [0, -1, 0],
  intensity,
  spread = 0.22,
  speed = 14,
  lifetime = 0.9,
  trailRadius = 1.1,
  trailLength = 4.5,
  count = 220,
  cinematic = false,
  blueprint = false,
}: ParticleJetProps) {
  const realCount = cinematic ? Math.round(count * 1.7) : count
  const groupRef = useRef<THREE.Group>(null)
  const linesRef = useRef<THREE.LineSegments>(null)
  const trailRef = useRef<THREE.Mesh>(null)

  const dirVec = useMemo(() => {
    return new THREE.Vector3(...direction).normalize()
  }, [direction])

  // Build an orthonormal basis (u, v, dirVec) so we can generate spread
  // jitter perpendicular to the flow direction.
  const basis = useMemo(() => {
    const helper = Math.abs(dirVec.y) < 0.9
      ? new THREE.Vector3(0, 1, 0)
      : new THREE.Vector3(1, 0, 0)
    const u = new THREE.Vector3().crossVectors(dirVec, helper).normalize()
    const v = new THREE.Vector3().crossVectors(dirVec, u).normalize()
    return { u, v }
  }, [dirVec])

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const positions = new Float32Array(realCount * 6)
    const colors = new Float32Array(realCount * 6)
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage))
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage))
    g.setDrawRange(0, realCount * 2)
    return g
  }, [realCount])

  useEffect(() => () => geometry.dispose(), [geometry])

  const streakMat = useMemo(() => {
    return new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      linewidth: 1, // WebGL caps linewidth at 1 on most GPUs; streak count carries the look.
    })
  }, [])

  const trailMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: blueprint ? 0x6fb8e8 : cinematic ? 0xfff5d6 : 0xe8a23b,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  }, [cinematic, blueprint])

  // Particle state lives outside React. These arrays are mutated in-place
  // by useFrame — no per-frame allocations. The random-age initialisation
  // is a one-time warm-up; `react-hooks/purity` flags Math.random() in a
  // useMemo conservatively, but this runs only on mount / when the pool
  // size changes, both of which are effectively never.
  /* eslint-disable react-hooks/purity */
  const state = useMemo(() => {
    const pos: Float32Array = new Float32Array(realCount * 3)
    const vel: Float32Array = new Float32Array(realCount * 3)
    const age: Float32Array = new Float32Array(realCount)
    const maxAge: Float32Array = new Float32Array(realCount)
    for (let i = 0; i < realCount; i++) {
      age[i] = Math.random() * lifetime
      maxAge[i] = lifetime * (0.75 + Math.random() * 0.5)
    }
    return { pos, vel, age, maxAge }
  }, [realCount, lifetime])
  /* eslint-enable react-hooks/purity */

  /* eslint-disable react-hooks/immutability */
  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 30) // clamp so tab-swap doesn't fling particles
    const g = groupRef.current
    if (!g) return

    // Fade material opacities toward target based on intensity. Lets a
    // mid-burn engine ramp up/down smoothly rather than popping.
    const targetStreak = intensity * (cinematic ? 1.0 : 0.9)
    const targetTrail = intensity * (cinematic ? 0.5 : 0.25)
    const fadeRate = dt * 6
    streakMat.opacity += Math.sign(targetStreak - streakMat.opacity) * Math.min(Math.abs(targetStreak - streakMat.opacity), fadeRate)
    trailMat.opacity += Math.sign(targetTrail - trailMat.opacity) * Math.min(Math.abs(targetTrail - trailMat.opacity), fadeRate)

    // If fully off, skip the expensive per-particle loop.
    if (streakMat.opacity < 0.005 && trailMat.opacity < 0.005) {
      g.visible = false
      return
    }
    g.visible = true

    // Scale the trail cone with intensity so it grows as the burn ramps in.
    if (trailRef.current) {
      const scale = 0.3 + intensity * 0.9
      trailRef.current.scale.set(scale, 1, scale)
    }

    const positions = geometry.attributes.position.array as Float32Array
    const colors = geometry.attributes.color.array as Float32Array
    const { pos, vel, age, maxAge } = state
    const streakScale = cinematic ? 0.35 : 0.28

    for (let i = 0; i < realCount; i++) {
      age[i] += dt
      if (age[i] >= maxAge[i] && intensity > 0.05) {
        // Respawn with a direction sampled inside the spread cone.
        const twist = Math.random() * Math.PI * 2
        const offAxis = Math.tan(spread) * Math.random()
        const speedJit = speed * (0.75 + Math.random() * 0.5)
        const vx = dirVec.x + (basis.u.x * Math.cos(twist) + basis.v.x * Math.sin(twist)) * offAxis
        const vy = dirVec.y + (basis.u.y * Math.cos(twist) + basis.v.y * Math.sin(twist)) * offAxis
        const vz = dirVec.z + (basis.u.z * Math.cos(twist) + basis.v.z * Math.sin(twist)) * offAxis
        const len = Math.hypot(vx, vy, vz) || 1
        vel[i * 3] = (vx / len) * speedJit
        vel[i * 3 + 1] = (vy / len) * speedJit
        vel[i * 3 + 2] = (vz / len) * speedJit
        // Tiny random initial offset within the nozzle throat so streaks
        // don't all originate from a single pixel.
        pos[i * 3] = (Math.random() - 0.5) * 0.15
        pos[i * 3 + 1] = (Math.random() - 0.5) * 0.15
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.15
        age[i] = 0
        maxAge[i] = lifetime * (0.75 + Math.random() * 0.5)
      } else {
        pos[i * 3] += vel[i * 3] * dt
        pos[i * 3 + 1] += vel[i * 3 + 1] * dt
        pos[i * 3 + 2] += vel[i * 3 + 2] * dt
      }

      const ageRatio = Math.min(1, age[i] / maxAge[i])
      const fade = 1 - ageRatio
      // Cinematic mode: young particles near-white, ageing to amber.
      // Blueprint: young paper-cyan, ageing to sky cyan — keeps the
      // "hot→cool" falloff but stays inside the cyanotype palette.
      // Space (default): straight amber head-to-tail.
      const head = blueprint ? BP_HEAD : cinematic ? HOT : AMBER
      const tail = blueprint ? BP_TAIL : AMBER
      const mix = cinematic || blueprint ? 1 - ageRatio * 0.6 : 1
      const headR = head.r * mix + tail.r * (1 - mix)
      const headG = head.g * mix + tail.g * (1 - mix)
      const headB = head.b * mix + tail.b * (1 - mix)

      const hIdx = i * 6
      positions[hIdx] = pos[i * 3]
      positions[hIdx + 1] = pos[i * 3 + 1]
      positions[hIdx + 2] = pos[i * 3 + 2]
      positions[hIdx + 3] = pos[i * 3] - vel[i * 3] * streakScale
      positions[hIdx + 4] = pos[i * 3 + 1] - vel[i * 3 + 1] * streakScale
      positions[hIdx + 5] = pos[i * 3 + 2] - vel[i * 3 + 2] * streakScale

      colors[hIdx] = headR * fade
      colors[hIdx + 1] = headG * fade
      colors[hIdx + 2] = headB * fade
      colors[hIdx + 3] = tail.r * fade * 0.25
      colors[hIdx + 4] = tail.g * fade * 0.25
      colors[hIdx + 5] = tail.b * fade * 0.25
    }

    geometry.attributes.position.needsUpdate = true
    geometry.attributes.color.needsUpdate = true
  })
  /* eslint-enable react-hooks/immutability */

  // Build a pre-translated cone whose apex sits at the local origin and
  // whose base trails along -Y. The wrapper group then rotates so -Y
  // aligns with `direction`, putting the apex at the emitter and the
  // base downstream.
  const trailGeometry = useMemo(() => {
    const g = new THREE.ConeGeometry(trailRadius, trailLength, 18, 4, true)
    g.translate(0, -trailLength / 2, 0)
    return g
  }, [trailRadius, trailLength])

  useEffect(() => () => trailGeometry.dispose(), [trailGeometry])

  const trailRotation = useMemo(() => {
    const q = new THREE.Quaternion()
    q.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dirVec)
    const e = new THREE.Euler().setFromQuaternion(q)
    return [e.x, e.y, e.z] as [number, number, number]
  }, [dirVec])

  return (
    <group ref={groupRef} position={position}>
      <lineSegments ref={linesRef} geometry={geometry} material={streakMat} />
      <mesh ref={trailRef} geometry={trailGeometry} material={trailMat} rotation={trailRotation} />
    </group>
  )
}
