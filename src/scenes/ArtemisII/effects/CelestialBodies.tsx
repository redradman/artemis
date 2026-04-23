import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMissionStore } from '../../../store/missionStore'

// Distant Moon + Earth discs rendered in world space (outside the Rocket
// group, so banking doesn't drag them around). Opacity ramps in and out
// based on the mission-time scrubber so they only appear during the
// trans-lunar and return-coast windows.
//
// Geometrically simple — a grey phong sphere for the Moon, a blue-white
// sphere with subtle cloud-tinted shading for Earth. No textures, no
// shaders. The spheres are parked far enough that the fixed amber key
// light still models them, reading as celestial bodies rather than props.

type CelestialBodiesProps = {
  cinematic?: boolean
}

// Moon: off to one side, behind and above the ship. Artemis II passes
// the Moon on flight day 5 so the rocket is already a long way along its
// trajectory.
const MOON_POSITION: [number, number, number] = [180, 70, -240]
const MOON_RADIUS = 22

// Earth: on the opposite side, further out. Visible during early
// trans-lunar coast and again during return.
const EARTH_POSITION: [number, number, number] = [-220, -40, -320]
const EARTH_RADIUS = 36

function moonVisibility(t: number): number {
  if (t < 0.6 || t > 0.9) return 0
  if (t < 0.72) return (t - 0.6) / 0.12
  if (t > 0.84) return (0.9 - t) / 0.06
  return 1
}

function earthVisibility(t: number): number {
  // Visible in early-TLI coast AND during return approach, dimmer between.
  if (t < 0.55) return 0
  if (t < 0.65) return (t - 0.55) / 0.1
  if (t < 0.82) return 1 - (t - 0.65) / 0.34 // dims as ship moves toward Moon
  if (t < 0.88) return 0.5 + ((t - 0.82) / 0.06) * 0.5 // recovers on return
  if (t < 0.97) return 1
  return Math.max(0, 1 - (t - 0.97) / 0.03) // fades out when capsule is re-entering
}

export function CelestialBodies({ cinematic = false }: CelestialBodiesProps) {
  const moonGeo = useMemo(() => new THREE.SphereGeometry(MOON_RADIUS, 32, 24), [])
  const earthGeo = useMemo(() => new THREE.SphereGeometry(EARTH_RADIUS, 36, 28), [])

  const moonMat = useMemo(
    () =>
      new THREE.MeshPhongMaterial({
        color: 0xb0b4b8,
        shininess: 2,
        specular: 0x111111,
        emissive: 0x0a0a0d,
        transparent: true,
        opacity: 0,
        fog: false,
      }),
    [],
  )

  const earthMat = useMemo(
    () =>
      new THREE.MeshPhongMaterial({
        color: 0x4a6e94,
        shininess: 18,
        specular: 0x1a2a3a,
        emissive: 0x0a1322,
        transparent: true,
        opacity: 0,
        fog: false,
      }),
    [],
  )

  const moonRef = useRef<THREE.Mesh>(null)
  const earthRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    return () => {
      moonGeo.dispose()
      earthGeo.dispose()
    }
  }, [moonGeo, earthGeo])

  /* eslint-disable react-hooks/immutability */
  useFrame(() => {
    const t = useMissionStore.getState().currentT
    const moonO = moonVisibility(t) * (cinematic ? 0.95 : 0.55)
    const earthO = earthVisibility(t) * (cinematic ? 0.9 : 0.55)
    moonMat.opacity = moonO
    earthMat.opacity = earthO
    if (moonRef.current) moonRef.current.visible = moonO > 0.01
    if (earthRef.current) earthRef.current.visible = earthO > 0.01
    // Slow rotation so the bodies don't feel frozen on long coasts.
    if (moonRef.current) moonRef.current.rotation.y += 0.0006
    if (earthRef.current) earthRef.current.rotation.y += 0.0004
  })
  /* eslint-enable react-hooks/immutability */

  return (
    <>
      <mesh ref={moonRef} geometry={moonGeo} material={moonMat} position={MOON_POSITION} />
      <mesh ref={earthRef} geometry={earthGeo} material={earthMat} position={EARTH_POSITION} />
    </>
  )
}
