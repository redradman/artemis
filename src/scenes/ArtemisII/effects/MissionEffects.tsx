import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ParticleJet } from './ParticleJet'
import { SepMotorPuffs, type Quill } from './SepMotorPuffs'
import { RcsPuffs } from './RcsPuffs'
import { EntryPlasma } from './EntryPlasma'
import { Parachutes } from './Parachutes'
import { BloomHalo } from './BloomHalo'
import { wireActive } from '../materials'
import type { MissionStageState } from '../lib/stateAt'

type MissionEffectsProps = {
  state: MissionStageState
  cinematic: boolean
  blueprint: boolean
  isPlaying: boolean
}

// Emitter sits just below the cinematic engine-bell bottom (bell bottom
// ≈ y=-6.4 at shell scale 1.005) so particles emerge cleanly below the
// nozzle exit rather than clipping inside the bell.
const RS25_POSITIONS: Array<[number, number, number]> = [
  [1.15, -7.1, 1.15],
  [-1.15, -7.1, 1.15],
  [1.15, -7.1, -1.15],
  [-1.15, -7.1, -1.15],
]

// 8 BSMs per booster: 4 forward at skirt y=+42, 4 aft at skirt y=+1.
// Each quill extends along its local +X; rotation orients that outward in
// the XZ plane. The quill's inner end sits just outside the booster body.
const BSM_QUILLS_PER_BOOSTER: Quill[] = (() => {
  const quills: Quill[] = []
  const skirtYs = [42, 1]
  for (const y of skirtYs) {
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2
      const r = 2.1
      quills.push({
        position: [Math.cos(angle) * r, y, Math.sin(angle) * r],
        rotation: [0, -angle, 0],
      })
    }
  }
  return quills
})()

// 4 CM/SM pusher puffs arranged around the SM top ring, firing upward.
// Quill is along +X by default → rotate Z=+π/2 to point along +Y.
const CMSM_QUILLS: Quill[] = (() => {
  const quills: Quill[] = []
  const ringY = 52.4
  const r = 2.0
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4
    quills.push({
      position: [Math.cos(angle) * r, ringY, Math.sin(angle) * r],
      rotation: [0, 0, Math.PI / 2],
    })
  }
  return quills
})()

const SOLAR_ANGLES = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75]

function SolarArmAccent({ deploy }: { deploy: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const material = useMemo(() => wireActive.clone(), [])
  const lineGeom = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 3),
    ])
  }, [])

  /* Per-frame material mutation is the intended R3F pattern; the material
     is a per-instance clone so there's no cross-component stomp. */
  /* eslint-disable react-hooks/immutability */
  useFrame(({ clock }) => {
    const g = groupRef.current
    if (!g) return
    const activity = deploy > 0 && deploy < 1 ? Math.sin(Math.PI * deploy) : 0
    if (activity < 0.02) {
      g.visible = false
      return
    }
    g.visible = true
    const pulse = 0.5 + Math.sin(clock.elapsedTime * 6) * 0.4
    material.opacity = activity * pulse
  })
  /* eslint-enable react-hooks/immutability */

  const scaleZ = 0.2 + deploy * 0.8

  return (
    <group ref={groupRef}>
      {SOLAR_ANGLES.map((angle, i) => (
        <group key={i} position={[0, 50.3, 0]} rotation={[0, angle, 0]}>
          <group scale={[1, 1, scaleZ]}>
            <lineSegments geometry={lineGeom} material={material} />
          </group>
        </group>
      ))}
    </group>
  )
}

// Viewport-aware particle tuning. Small screens pay a real cost for
// thousands of per-frame particle updates, so we halve the pool when the
// window width is below a mobile-ish threshold.
const SMALL_VIEWPORT_QUERY = '(max-width: 768px)'
function isSmallViewport(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(SMALL_VIEWPORT_QUERY).matches
}

export function MissionEffects({ state, cinematic, blueprint, isPlaying }: MissionEffectsProps) {
  const { stages, solarDeploy, effects } = state

  // Engine ignition (plumes + bloom halos) is suppressed while the
  // timeline is paused — a stationary rocket with a burning engine reads
  // as "broken." Non-thrust effects (separation motors, parachutes,
  // re-entry plasma, RCS) are left alone because they're tied to discrete
  // mission events the user may want to inspect while scrubbed.
  const engineGate = isPlaying ? 1 : 0
  const rs25On = (stages.core.visible ? effects.rs25 : 0) * engineGate
  const srbOnL = (stages.srbL.visible ? effects.srb : 0) * engineGate
  const srbOnR = (stages.srbR.visible ? effects.srb : 0) * engineGate
  const rl10On =
    (stages.icps.visible ? Math.max(effects.rl10Prm, effects.rl10Arb) : 0) * engineGate
  const esmOn = (stages.sm.visible ? effects.esmMain : 0) * engineGate
  const lasJettOn = (stages.las.visible ? effects.lasJett : 0) * engineGate
  const cmsmSepOn = stages.sm.visible ? effects.cmsmSep : 0
  const rcsActiveOn = stages.sm.visible ? effects.rcsBurst : 0

  // RS-25 / SRB particle tuning. Cinematic mode scales up counts + trail
  // sizes; hybrid stays leaner. Mobile-sized viewports get a ~0.55× budget
  // so low-end GPUs don't stutter on ignition.
  const small = isSmallViewport()
  const mobileScale = small ? 0.55 : 1
  const rs25Count = Math.round((cinematic ? 180 : 110) * mobileScale)
  const srbCount = Math.round((cinematic ? 260 : 170) * mobileScale)
  const rl10Count = Math.round((cinematic ? 160 : 100) * mobileScale)
  const esmCount = Math.round((cinematic ? 150 : 95) * mobileScale)
  const lasJettCount = Math.round(80 * mobileScale)

  return (
    <>
      {/* Core RS-25 × 4 — rides core offset group. Four streaking-spark
          plumes, each with its own soft trail cone behind. */}
      <group
        position={[stages.core.offsetX, stages.core.offsetY, stages.core.offsetZ]}
        visible={stages.core.visible}
      >
        {RS25_POSITIONS.map((pos, i) => (
          <group key={i}>
            <ParticleJet
              position={pos}
              intensity={rs25On}
              speed={18}
              spread={0.12}
              lifetime={0.55}
              trailRadius={0.9}
              trailLength={4.0}
              count={rs25Count}
              cinematic={cinematic}
              blueprint={blueprint}
            />
            <BloomHalo
              position={pos}
              intensity={rs25On}
              baseSize={cinematic ? 4.5 : 2.8}
              phase={i * 0.7}
              cinematic={cinematic}
              blueprint={blueprint}
            />
          </group>
        ))}
      </group>

      {/* Left SRB — wider, hotter, rougher than RS-25. */}
      <group
        position={[-6 + stages.srbL.offsetX, stages.srbL.offsetY, stages.srbL.offsetZ]}
      >
        <group visible={stages.srbL.visible}>
          <ParticleJet
            position={[0, -2.8, 0]}
            intensity={srbOnL}
            speed={22}
            spread={0.18}
            lifetime={0.7}
            trailRadius={1.6}
            trailLength={6}
            count={srbCount}
            cinematic={cinematic}
            blueprint={blueprint}
          />
          <BloomHalo
            position={[0, -2.8, 0]}
            intensity={srbOnL}
            baseSize={cinematic ? 6 : 3.6}
            phase={0.3}
            cinematic={cinematic}
            blueprint={blueprint}
          />
        </group>
        <SepMotorPuffs quills={BSM_QUILLS_PER_BOOSTER} intensity={effects.srbSep} />
      </group>

      {/* Right SRB. */}
      <group
        position={[6 + stages.srbR.offsetX, stages.srbR.offsetY, stages.srbR.offsetZ]}
      >
        <group visible={stages.srbR.visible}>
          <ParticleJet
            position={[0, -2.8, 0]}
            intensity={srbOnR}
            speed={22}
            spread={0.18}
            lifetime={0.7}
            trailRadius={1.6}
            trailLength={6}
            count={srbCount}
            cinematic={cinematic}
            blueprint={blueprint}
          />
          <BloomHalo
            position={[0, -2.8, 0]}
            intensity={srbOnR}
            baseSize={cinematic ? 6 : 3.6}
            phase={1.4}
            cinematic={cinematic}
            blueprint={blueprint}
          />
        </group>
        <SepMotorPuffs quills={BSM_QUILLS_PER_BOOSTER} intensity={effects.srbSep} />
      </group>

      {/* LAS jettison motor — small particle puff that rides the tower. */}
      <group
        position={[stages.las.offsetX, stages.las.offsetY, stages.las.offsetZ]}
        visible={stages.las.visible}
      >
        <ParticleJet
          position={[0, 57.5, 0]}
          direction={[0, -1, 0]}
          intensity={lasJettOn}
          speed={12}
          spread={0.25}
          lifetime={0.4}
          trailRadius={0.5}
          trailLength={2.5}
          count={lasJettCount}
          cinematic={cinematic}
          blueprint={blueprint}
        />
        <BloomHalo
          position={[0, 57.5, 0]}
          intensity={lasJettOn}
          baseSize={cinematic ? 1.8 : 1.2}
          cinematic={cinematic}
          blueprint={blueprint}
        />
      </group>

      {/* ICPS RL10. */}
      <group
        position={[stages.icps.offsetX, stages.icps.offsetY, stages.icps.offsetZ]}
        visible={stages.icps.visible}
      >
        <ParticleJet
          position={[0, 42, 0]}
          intensity={rl10On}
          speed={16}
          spread={0.1}
          lifetime={0.65}
          trailRadius={0.85}
          trailLength={5}
          count={rl10Count}
          cinematic={cinematic}
          blueprint={blueprint}
        />
        <BloomHalo
          position={[0, 42, 0]}
          intensity={rl10On}
          baseSize={cinematic ? 3.2 : 2}
          pulseFreq={8}
          cinematic={cinematic}
          blueprint={blueprint}
        />
      </group>

      {/* ESM main engine (TLI) — on the service module. */}
      <group position={[stages.sm.offsetX, stages.sm.offsetY, stages.sm.offsetZ]}>
        <group visible={stages.sm.visible}>
          <ParticleJet
            position={[0, 47.3, 0]}
            intensity={esmOn}
            speed={14}
            spread={0.1}
            lifetime={0.6}
            trailRadius={0.7}
            trailLength={4.2}
            count={esmCount}
            cinematic={cinematic}
            blueprint={blueprint}
          />
          <BloomHalo
            position={[0, 47.3, 0]}
            intensity={esmOn}
            baseSize={cinematic ? 2.8 : 1.7}
            pulseFreq={8}
            cinematic={cinematic}
            blueprint={blueprint}
          />
        </group>
        <SepMotorPuffs
          quills={CMSM_QUILLS}
          intensity={cmsmSepOn}
          length={1.8}
          flickerFreq={24}
        />
        <RcsPuffs intensity={rcsActiveOn} cinematic={cinematic} />
      </group>

      {/* Entry plasma + parachutes on the crew module. */}
      <EntryPlasma
        intensity={effects.plasma}
        shieldPosition={[0, 52, 0]}
        cinematic={cinematic}
        blueprint={blueprint}
      />
      <Parachutes
        intensity={effects.parachutes}
        capsuleTop={[0, 56.2, 0]}
        cinematic={cinematic}
        blueprint={blueprint}
      />

      <SolarArmAccent deploy={solarDeploy} />
    </>
  )
}
