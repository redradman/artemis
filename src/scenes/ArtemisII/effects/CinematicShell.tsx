import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { MissionStageState } from '../lib/stateAt'

// Solid-panel ship body used only in cinematic mode. Mirrors the wireframe
// geometry of each stage with opaque MeshPhongMaterial so the ship reads
// three-dimensional under a proper key/fill light rig. The cinematic
// lights are mounted by ArtemisIIScene; this component just supplies
// geometry + materials.
//
// Shells are scaled up a hair (1.005) so the wireframe beneath is
// occluded from silhouette angles without any noticeable increase in
// perceived size.
//
// Emissive seam rings glow amber when the stage is actively burning /
// deploying; the glow pulls intensity from the mission effects scalars.

type CinematicShellProps = {
  state: MissionStageState
}

const SOLAR_WING_ANGLES = [
  Math.PI * 0.25,
  Math.PI * 0.75,
  Math.PI * 1.25,
  Math.PI * 1.75,
]

function SolarArrays({ deploy }: { deploy: number }) {
  // Matches ServiceModule's scaleZ ramp so the wings unfold from packed
  // (0.2 scale) to fully extended (1.0 scale). Per-panel thin edge strip
  // gives a visible seam on the arm side.
  const scaleZ = 0.2 + deploy * 0.8
  return (
    <group>
      {SOLAR_WING_ANGLES.map((angle, i) => (
        <group key={i} position={[0, 50.3, 0]} rotation={[0, angle, 0]}>
          <group scale={[1, 1, scaleZ]}>
            <mesh geometry={solarArm} position={[0, 0, 1.5]} material={hullDarkMat} />
            {[0, 1, 2].map((j) => (
              <group key={j} position={[0, 0, 0.9 + j * 2]}>
                <mesh geometry={solarPanel} material={solarPanelMat} />
                <mesh
                  geometry={new THREE.BoxGeometry(3.82, 0.04, 0.1)}
                  position={[0, 0.07, 0]}
                  material={solarPanelEdgeMat}
                />
              </group>
            ))}
          </group>
        </group>
      ))}
    </group>
  )
}

const SCALE = 1.005

// Shared materials — cloned where a per-instance opacity mutation is
// required, otherwise reused.
const hullMat = new THREE.MeshPhongMaterial({
  color: 0xf1ead9,
  shininess: 18,
  specular: 0x2a2620,
})
const hullDarkMat = new THREE.MeshPhongMaterial({
  color: 0xc6bba4,
  shininess: 10,
  specular: 0x201d18,
})
const nozzleMat = new THREE.MeshPhongMaterial({
  color: 0x887d6b,
  shininess: 32,
  specular: 0x3a342a,
})
const detailMat = new THREE.MeshPhongMaterial({
  color: 0x7a7160,
  shininess: 8,
})
const seamBaseMat = new THREE.MeshBasicMaterial({ color: 0x8a7a5a })
const seamActiveMat = new THREE.MeshBasicMaterial({ color: 0xe8a23b })

// Module-scope geometry cache — nothing here is instance-specific.
const coreBody = new THREE.CylinderGeometry(2.71, 2.71, 42, 40, 1, false)
const coreBoatTail = new THREE.CylinderGeometry(2.71, 3.11, 3.5, 32, 2, false)
const engineBell = new THREE.CylinderGeometry(0.55, 0.95, 2.8, 20, 2, false)
const engineHead = new THREE.CylinderGeometry(0.45, 0.55, 1.4, 16, 2, false)
const engineNozzleBox = new THREE.BoxGeometry(0.35, 0.8, 0.35)

const srbBody = new THREE.CylinderGeometry(1.86, 1.86, 40, 36, 1, false)
const srbNose = new THREE.ConeGeometry(1.86, 4.5, 32, 2)
const srbFwdSkirt = new THREE.CylinderGeometry(2.01, 1.86, 1.5, 32, 1, false)
const srbAftSkirt = new THREE.CylinderGeometry(1.86, 2.21, 3, 32, 1, false)
const srbNozzle = new THREE.CylinderGeometry(1.6, 1.1, 2.2, 24, 2, false)

const icpsBody = new THREE.CylinderGeometry(2.56, 2.56, 4.5, 28, 1, false)
const icpsLvsa = new THREE.CylinderGeometry(2.56, 2.71, 2.8, 28, 1, false)
const icpsOsa = new THREE.CylinderGeometry(2.31, 2.56, 1.8, 24, 1, false)

const smBody = new THREE.CylinderGeometry(2.31, 2.31, 4, 24, 1, false)
const smEngine = new THREE.CylinderGeometry(0.26, 0.61, 1, 14, 2, false)
const rcsQuad = new THREE.BoxGeometry(0.35, 0.45, 0.35)

// Solar wing geometry — arm beam + three rectangular panels. Dimensions
// mirror ServiceModule.tsx so the two modes read as the same vehicle.
const solarArm = new THREE.BoxGeometry(0.2, 0.2, 3)
const solarPanel = new THREE.BoxGeometry(3.8, 0.09, 1.9)
const solarPanelMat = new THREE.MeshPhongMaterial({
  color: 0x1d3b6b,
  shininess: 45,
  specular: 0x3a5a90,
  side: THREE.DoubleSide,
})
const solarPanelEdgeMat = new THREE.MeshPhongMaterial({
  color: 0xb0a58c,
  shininess: 8,
})

const lasBpc = new THREE.CylinderGeometry(0.91, 0.91, 1.3, 18, 1, false)
const lasAbortMotor = new THREE.CylinderGeometry(0.56, 0.56, 3.8, 18, 1, false)
const lasTower = new THREE.ConeGeometry(0.56, 3.2, 18, 2)
const lasSpike = new THREE.CylinderGeometry(0.04, 0.11, 2.2, 8, 1, false)

// Capsule lathe mirrored from CrewModule.tsx so the cinematic capsule
// shares its silhouette exactly. Scaled slightly in the group transform.
const capsuleGeo = (() => {
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
})()

// Thin torus rings used as stage-boundary seams.
function makeSeamRing(radius: number): THREE.TorusGeometry {
  return new THREE.TorusGeometry(radius, 0.06, 8, 48)
}

const seamCore = makeSeamRing(2.73)
const seamSrb = makeSeamRing(1.88)
const seamIcps = makeSeamRing(2.58)

// Small spheres for rivets.
const rivetSphere = new THREE.SphereGeometry(0.06, 6, 4)

// Pipe running along the core exterior.
const coreExternalPipe = new THREE.CylinderGeometry(0.09, 0.09, 28, 8, 1, false)

function RivetRow({
  radius,
  y,
  count = 24,
}: {
  radius: number
  y: number
  count?: number
}) {
  const rivets: Array<[number, number, number]> = useMemo(() => {
    const out: Array<[number, number, number]> = []
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      out.push([Math.cos(a) * radius, y, Math.sin(a) * radius])
    }
    return out
  }, [radius, y, count])
  return (
    <>
      {rivets.map((p, i) => (
        <mesh key={i} geometry={rivetSphere} position={p} material={detailMat} />
      ))}
    </>
  )
}

function CoreShell({ rs25On }: { rs25On: number }) {
  const engines: Array<readonly [number, number]> = [
    [1.15, 1.15],
    [-1.15, 1.15],
    [1.15, -1.15],
    [-1.15, -1.15],
  ]
  // Seam material blends base→amber with rs25 intensity by selecting
  // the active material when the engines are lit. Cheap approximation
  // of an emissive glow without shader work.
  const seamMat = rs25On > 0.2 ? seamActiveMat : seamBaseMat
  return (
    <group scale={SCALE}>
      {/* Hull */}
      <mesh geometry={coreBody} position={[0, 21, 0]} material={hullMat} />
      <mesh geometry={coreBoatTail} position={[0, -1.75, 0]} material={hullDarkMat} />

      {/* Four RS-25 engines */}
      {engines.map(([x, z], i) => (
        <group key={i}>
          <mesh geometry={engineBell} position={[x, -5.0, z]} material={nozzleMat} />
          <mesh geometry={engineHead} position={[x, -3.0, z]} material={hullDarkMat} />
          <mesh geometry={engineNozzleBox} position={[x * 1.3, -2.3, z * 1.3]} material={detailMat} />
        </group>
      ))}

      {/* Stage seams — LH2 top, intertank band, LOX base */}
      {[5, 22, 38].map((y) => (
        <mesh
          key={y}
          geometry={seamCore}
          position={[0, y, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          material={seamMat}
        />
      ))}

      {/* Two long exterior pipes (representative — not exact to the real
          systems tunnel). Positioned on opposite sides of the core. */}
      <mesh geometry={coreExternalPipe} position={[2.75, 14, 0]} material={detailMat} />
      <mesh geometry={coreExternalPipe} position={[-2.75, 14, 0]} material={detailMat} />

      {/* Rivet rows at the intertank band. */}
      <RivetRow radius={2.75} y={20.5} count={24} />
      <RivetRow radius={2.75} y={23.5} count={24} />
    </group>
  )
}

function SrbShell({ active }: { active: number }) {
  const seamMat = active > 0.2 ? seamActiveMat : seamBaseMat
  return (
    <group scale={SCALE}>
      <mesh geometry={srbBody} position={[0, 22, 0]} material={hullMat} />
      <mesh geometry={srbNose} position={[0, 44.25, 0]} material={hullMat} />
      <mesh geometry={srbFwdSkirt} position={[0, 42.75, 0]} material={hullDarkMat} />
      <mesh geometry={srbAftSkirt} position={[0, 0.5, 0]} material={hullDarkMat} />
      <mesh geometry={srbNozzle} position={[0, -1.6, 0]} material={nozzleMat} />

      {/* Five segment-joint rings at shuttle-heritage spacing. */}
      {[8, 16, 24, 32, 40].map((y) => (
        <mesh
          key={y}
          geometry={seamSrb}
          position={[0, y, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          material={seamMat}
        />
      ))}
    </group>
  )
}

function IcpsShell({ active }: { active: number }) {
  const seamMat = active > 0.2 ? seamActiveMat : seamBaseMat
  return (
    <group scale={SCALE}>
      <mesh geometry={icpsBody} position={[0, 44.25, 0]} material={hullMat} />
      <mesh geometry={icpsLvsa} position={[0, 40.6, 0]} material={hullDarkMat} />
      <mesh geometry={icpsOsa} position={[0, 47.4, 0]} material={hullMat} />
      <mesh
        geometry={seamIcps}
        position={[0, 42, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={seamMat}
      />
      <mesh
        geometry={seamIcps}
        position={[0, 46.5, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={seamMat}
      />
    </group>
  )
}

function SmShell({ active }: { active: number }) {
  const seamMat = active > 0.2 ? seamActiveMat : seamBaseMat
  // RCS quads — 4 around the top of the SM, a schematic nod to the
  // reaction-control clusters on the real European Service Module.
  const rcsPositions: Array<[number, number, number]> = useMemo(() => {
    const out: Array<[number, number, number]> = []
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4
      out.push([Math.cos(a) * 2.35, 51.8, Math.sin(a) * 2.35])
    }
    return out
  }, [])
  return (
    <group scale={SCALE}>
      <mesh geometry={smBody} position={[0, 50.3, 0]} material={hullMat} />
      <mesh geometry={smEngine} position={[0, 47.8, 0]} material={nozzleMat} />
      {/* Top + bottom seams */}
      <mesh
        geometry={new THREE.TorusGeometry(2.32, 0.05, 8, 40)}
        position={[0, 48.3, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={seamMat}
      />
      <mesh
        geometry={new THREE.TorusGeometry(2.32, 0.05, 8, 40)}
        position={[0, 52.3, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={seamMat}
      />
      {/* RCS quads */}
      {rcsPositions.map((p, i) => (
        <mesh key={i} geometry={rcsQuad} position={p} material={detailMat} />
      ))}
    </group>
  )
}

// Dedicated heat-shield material so we can smoothly lerp its colour
// between neutral-tan and amber without swapping materials mid-frame.
const heatShieldCold = new THREE.Color(0xc6bba4)
const heatShieldHot = new THREE.Color(0xff9432)

function CapsuleShell({ plasma }: { plasma: number }) {
  // Per-instance material; colour is interpolated with the plasma
  // intensity so the heat shield transitions smoothly from charred tan
  // to glowing amber as the capsule hits the atmosphere.
  const hsMat = useMemo(
    () =>
      new THREE.MeshPhongMaterial({
        color: heatShieldCold.clone(),
        emissive: 0x000000,
        shininess: 12,
      }),
    [],
  )
  const hsGeo = useMemo(() => new THREE.CircleGeometry(2.31, 28), [])

  useEffect(() => {
    hsMat.color.lerpColors(heatShieldCold, heatShieldHot, Math.min(1, plasma))
    // As plasma climbs, emissive amber adds a self-lit quality so the
    // shield doesn't need directional fill to read hot.
    const e = Math.min(1, plasma) * 0.6
    hsMat.emissive.setRGB(e * 1.0, e * 0.58, e * 0.2)
  }, [plasma, hsMat])

  return (
    <group scale={SCALE} position={[0, 52, 0]}>
      <mesh geometry={capsuleGeo} material={hullMat} />
      <mesh
        geometry={hsGeo}
        position={[0, 0.01, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={hsMat}
      />
    </group>
  )
}

function LasShell() {
  return (
    <group scale={SCALE}>
      <mesh geometry={lasBpc} position={[0, 56.75, 0]} material={hullDarkMat} />
      <mesh geometry={lasAbortMotor} position={[0, 59.3, 0]} material={hullMat} />
      <mesh geometry={lasTower} position={[0, 62.8, 0]} material={hullMat} />
      <mesh geometry={lasSpike} position={[0, 65.5, 0]} material={detailMat} />
    </group>
  )
}

export function CinematicShell({ state }: CinematicShellProps) {
  const { stages, effects, solarDeploy } = state
  return (
    <>
      {/* Left SRB */}
      <group
        position={[-6 + stages.srbL.offsetX, stages.srbL.offsetY, stages.srbL.offsetZ]}
        visible={stages.srbL.visible}
      >
        <SrbShell active={effects.srb} />
      </group>

      {/* Right SRB */}
      <group
        position={[6 + stages.srbR.offsetX, stages.srbR.offsetY, stages.srbR.offsetZ]}
        visible={stages.srbR.visible}
      >
        <SrbShell active={effects.srb} />
      </group>

      {/* Core */}
      <group
        position={[stages.core.offsetX, stages.core.offsetY, stages.core.offsetZ]}
        visible={stages.core.visible}
      >
        <CoreShell rs25On={effects.rs25} />
      </group>

      {/* ICPS */}
      <group
        position={[stages.icps.offsetX, stages.icps.offsetY, stages.icps.offsetZ]}
        visible={stages.icps.visible}
      >
        <IcpsShell active={Math.max(effects.rl10Prm, effects.rl10Arb)} />
      </group>

      {/* SM + solar arrays. Wings deploy via the existing solarDeploy
          scalar so they unfold after Orion separates from the ICPS. */}
      <group
        position={[stages.sm.offsetX, stages.sm.offsetY, stages.sm.offsetZ]}
        visible={stages.sm.visible}
      >
        <SmShell active={effects.esmMain} />
        <SolarArrays deploy={solarDeploy} />
      </group>

      {/* Capsule — always visible */}
      <CapsuleShell plasma={effects.plasma} />

      {/* LAS */}
      <group
        position={[stages.las.offsetX, stages.las.offsetY, stages.las.offsetZ]}
        visible={stages.las.visible}
      >
        <LasShell />
      </group>
    </>
  )
}
