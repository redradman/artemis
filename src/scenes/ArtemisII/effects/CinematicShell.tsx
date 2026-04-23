import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { MissionStageState } from '../lib/stateAt'
import { resolveSubTone, type Tone } from '../materials'

// Solid-panel ship body used only in cinematic mode. Mirrors the wireframe
// geometry of each stage with opaque MeshPhongMaterial so the ship reads
// three-dimensional under a proper key/fill light rig.
//
// Every sub-region is tagged with the same component id used by the
// hybrid parts and resolved via resolveSubTone so a click on
// "abort-motor" highlights just the motor in cinematic too, not the
// whole tower.

type CinematicShellProps = {
  state: MissionStageState
  activeId: string | null
}

const SOLAR_WING_ANGLES = [
  Math.PI * 0.25,
  Math.PI * 0.75,
  Math.PI * 1.25,
  Math.PI * 1.75,
]

const SCALE = 1.005
const AMBER = 0xe8a23b

// --- Base materials (unchanged look) -------------------------------
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
const seamActiveMat = new THREE.MeshBasicMaterial({ color: AMBER })

// --- Active + dimmed variants --------------------------------------
function cloneAsActive(
  base: THREE.MeshPhongMaterial,
  intensity: number,
) {
  const m = base.clone()
  m.emissive = new THREE.Color(AMBER)
  m.emissiveIntensity = intensity
  return m
}
function cloneAsDim(base: THREE.MeshPhongMaterial) {
  const m = base.clone()
  m.transparent = true
  m.opacity = 0.22
  return m
}

const hullMatActive = cloneAsActive(hullMat, 0.55)
const hullDarkMatActive = cloneAsActive(hullDarkMat, 0.65)
const nozzleMatActive = cloneAsActive(nozzleMat, 0.5)
const detailMatActive = cloneAsActive(detailMat, 0.55)

const hullMatDim = cloneAsDim(hullMat)
const hullDarkMatDim = cloneAsDim(hullDarkMat)
const nozzleMatDim = cloneAsDim(nozzleMat)
const detailMatDim = cloneAsDim(detailMat)

const seamBaseMatDim = (() => {
  const m = seamBaseMat.clone()
  m.transparent = true
  m.opacity = 0.25
  return m
})()

type MatSet = {
  hull: THREE.MeshPhongMaterial
  hullDark: THREE.MeshPhongMaterial
  nozzle: THREE.MeshPhongMaterial
  detail: THREE.MeshPhongMaterial
  seamBase: THREE.MeshBasicMaterial
}

function matSetFor(tone: Tone): MatSet {
  if (tone === 'active') {
    return {
      hull: hullMatActive,
      hullDark: hullDarkMatActive,
      nozzle: nozzleMatActive,
      detail: detailMatActive,
      seamBase: seamActiveMat,
    }
  }
  if (tone === 'dimmed') {
    return {
      hull: hullMatDim,
      hullDark: hullDarkMatDim,
      nozzle: nozzleMatDim,
      detail: detailMatDim,
      seamBase: seamBaseMatDim,
    }
  }
  return {
    hull: hullMat,
    hullDark: hullDarkMat,
    nozzle: nozzleMat,
    detail: detailMat,
    seamBase: seamBaseMat,
  }
}

// --- Geometry cache -------------------------------------------------
// Core body is split into three regions that mirror CoreStage.tsx so
// LH2 / intertank / LOX+fwd can tone independently.
const coreBodyLh2 = new THREE.CylinderGeometry(2.71, 2.71, 22, 40, 1, false)
const coreBodyIntertank = new THREE.CylinderGeometry(2.71, 2.71, 5, 40, 1, false)
const coreBodyLoxFwd = new THREE.CylinderGeometry(2.71, 2.71, 15, 40, 1, false)
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
// Top and bottom seam rings on the service module body — used twice
// per SmShell render, so a single shared geometry instance prevents
// per-frame torus allocations.
const smSeamRing = new THREE.TorusGeometry(2.32, 0.05, 8, 40)
const rcsQuad = new THREE.BoxGeometry(0.35, 0.45, 0.35)

const solarArm = new THREE.BoxGeometry(0.2, 0.2, 3)
const solarPanel = new THREE.BoxGeometry(3.8, 0.09, 1.9)
// Thin strip running along the top edge of each solar panel. Shared
// across all four wings × three panels (12 instances per frame) — a
// single module-scope geometry avoids allocating on every render.
const solarPanelEdge = new THREE.BoxGeometry(3.82, 0.04, 0.1)
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
const solarPanelMatActive = cloneAsActive(solarPanelMat, 0.55)
const solarPanelEdgeMatActive = cloneAsActive(solarPanelEdgeMat, 0.55)
const solarPanelMatDim = cloneAsDim(solarPanelMat)
const solarPanelEdgeMatDim = cloneAsDim(solarPanelEdgeMat)

function solarMatsFor(tone: Tone) {
  if (tone === 'active')
    return { panel: solarPanelMatActive, edge: solarPanelEdgeMatActive }
  if (tone === 'dimmed')
    return { panel: solarPanelMatDim, edge: solarPanelEdgeMatDim }
  return { panel: solarPanelMat, edge: solarPanelEdgeMat }
}

const lasBpc = new THREE.CylinderGeometry(0.91, 0.91, 1.3, 18, 1, false)
const lasAbortMotor = new THREE.CylinderGeometry(0.56, 0.56, 3.8, 18, 1, false)
const lasTower = new THREE.ConeGeometry(0.56, 3.2, 18, 2)
const lasSpike = new THREE.CylinderGeometry(0.04, 0.11, 2.2, 8, 1, false)

// Capsule split into heat-shield (the bottom ablative disk/rim) vs the
// crew-compartment body, mirroring the hybrid lathe split.
const heatShieldGeo = (() => {
  const pts: THREE.Vector2[] = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.8, 0.05),
    new THREE.Vector2(2.3, 0.3),
    new THREE.Vector2(2.3, 0.55),
  ]
  return new THREE.LatheGeometry(pts, 28)
})()

const capsuleBodyGeo = (() => {
  const pts: THREE.Vector2[] = [new THREE.Vector2(2.3, 0.55)]
  for (let i = 1; i <= 12; i++) {
    const t = i / 12
    const y = 0.55 + t * 3.3
    const r = 2.3 - t * 1.45
    pts.push(new THREE.Vector2(r, y))
  }
  pts.push(new THREE.Vector2(0.85, 3.9))
  pts.push(new THREE.Vector2(0.85, 4.2))
  return new THREE.LatheGeometry(pts, 28)
})()

function makeSeamRing(radius: number): THREE.TorusGeometry {
  return new THREE.TorusGeometry(radius, 0.06, 8, 48)
}

const seamCore = makeSeamRing(2.73)
const seamSrb = makeSeamRing(1.88)
const seamIcps = makeSeamRing(2.58)

const rivetSphere = new THREE.SphereGeometry(0.06, 6, 4)

const coreExternalPipe = new THREE.CylinderGeometry(0.09, 0.09, 28, 8, 1, false)

function RivetRow({
  radius,
  y,
  count = 24,
  material,
}: {
  radius: number
  y: number
  count?: number
  material: THREE.Material
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
        <mesh key={i} geometry={rivetSphere} position={p} material={material} />
      ))}
    </>
  )
}

function CoreShell({
  rs25On,
  activeId,
}: {
  rs25On: number
  activeId: string | null
}) {
  const lh2M = matSetFor(resolveSubTone(activeId, 'lh2-tank'))
  const interM = matSetFor(resolveSubTone(activeId, 'intertank'))
  const loxM = matSetFor(resolveSubTone(activeId, 'core-stage'))
  const rs25M = matSetFor(resolveSubTone(activeId, 'rs-25'))

  const engines: Array<readonly [number, number]> = [
    [1.15, 1.15],
    [-1.15, 1.15],
    [1.15, -1.15],
    [-1.15, -1.15],
  ]
  return (
    <group scale={SCALE}>
      {/* LH2 tank (lower body, y=0..22) */}
      <mesh geometry={coreBodyLh2} position={[0, 11, 0]} material={lh2M.hull} />

      {/* Intertank (middle band, y=22..27) + its rivet rows */}
      <mesh
        geometry={coreBodyIntertank}
        position={[0, 24.5, 0]}
        material={interM.hull}
      />
      <RivetRow radius={2.75} y={22.5} count={24} material={interM.detail} />
      <RivetRow radius={2.75} y={26.5} count={24} material={interM.detail} />

      {/* LOX tank + forward skirt (upper body, y=27..42) */}
      <mesh
        geometry={coreBodyLoxFwd}
        position={[0, 34.5, 0]}
        material={loxM.hull}
      />

      {/* Engine section (boat tail + 4 RS-25) */}
      <mesh geometry={coreBoatTail} position={[0, -1.75, 0]} material={rs25M.hullDark} />
      {engines.map(([x, z], i) => (
        <group key={i}>
          <mesh geometry={engineBell} position={[x, -5.0, z]} material={rs25M.nozzle} />
          <mesh geometry={engineHead} position={[x, -3.0, z]} material={rs25M.hullDark} />
          <mesh
            geometry={engineNozzleBox}
            position={[x * 1.3, -2.3, z * 1.3]}
            material={rs25M.detail}
          />
        </group>
      ))}

      {/* Stage-boundary seam rings — each adopts its home region's
          seam material, and flips to amber during the actual engine
          burn so the ignition still reads. */}
      <mesh
        geometry={seamCore}
        position={[0, 5, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={rs25On > 0.2 ? seamActiveMat : lh2M.seamBase}
      />
      <mesh
        geometry={seamCore}
        position={[0, 22, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={rs25On > 0.2 ? seamActiveMat : interM.seamBase}
      />
      <mesh
        geometry={seamCore}
        position={[0, 38, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={rs25On > 0.2 ? seamActiveMat : loxM.seamBase}
      />

      {/* Exterior pipes run mostly through the LH2 tank region. */}
      <mesh geometry={coreExternalPipe} position={[2.75, 14, 0]} material={lh2M.detail} />
      <mesh geometry={coreExternalPipe} position={[-2.75, 14, 0]} material={lh2M.detail} />
    </group>
  )
}

function SrbShell({
  active,
  activeId,
}: {
  active: number
  activeId: string | null
}) {
  const bodyM = matSetFor(resolveSubTone(activeId, 'solid-booster'))
  const aftM = matSetFor(resolveSubTone(activeId, 'aft-skirt'))
  const jointM = matSetFor(resolveSubTone(activeId, 'segment-joint'))

  return (
    <group scale={SCALE}>
      <mesh geometry={srbBody} position={[0, 22, 0]} material={bodyM.hull} />
      <mesh geometry={srbNose} position={[0, 44.25, 0]} material={bodyM.hull} />
      <mesh geometry={srbFwdSkirt} position={[0, 42.75, 0]} material={bodyM.hullDark} />
      <mesh geometry={srbAftSkirt} position={[0, 0.5, 0]} material={aftM.hullDark} />
      <mesh geometry={srbNozzle} position={[0, -1.6, 0]} material={aftM.nozzle} />

      {/* Four segment-joint rings between the five propellant segments. */}
      {[8, 16, 24, 32].map((y) => (
        <mesh
          key={y}
          geometry={seamSrb}
          position={[0, y, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          material={active > 0.2 ? seamActiveMat : jointM.seamBase}
        />
      ))}
      {/* Top band sits at the forward-skirt / nose junction (body tone). */}
      <mesh
        geometry={seamSrb}
        position={[0, 40, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={active > 0.2 ? seamActiveMat : bodyM.seamBase}
      />
    </group>
  )
}

function IcpsShell({
  active,
  activeId,
}: {
  active: number
  activeId: string | null
}) {
  const m = matSetFor(resolveSubTone(activeId, 'icps'))
  const seamMat = active > 0.2 ? seamActiveMat : m.seamBase
  return (
    <group scale={SCALE}>
      <mesh geometry={icpsBody} position={[0, 44.25, 0]} material={m.hull} />
      <mesh geometry={icpsLvsa} position={[0, 40.6, 0]} material={m.hullDark} />
      <mesh geometry={icpsOsa} position={[0, 47.4, 0]} material={m.hull} />
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

function SmShell({
  active,
  activeId,
}: {
  active: number
  activeId: string | null
}) {
  const m = matSetFor(resolveSubTone(activeId, 'service-module'))
  const seamMat = active > 0.2 ? seamActiveMat : m.seamBase
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
      <mesh geometry={smBody} position={[0, 50.3, 0]} material={m.hull} />
      <mesh geometry={smEngine} position={[0, 47.8, 0]} material={m.nozzle} />
      <mesh
        geometry={smSeamRing}
        position={[0, 48.3, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={seamMat}
      />
      <mesh
        geometry={smSeamRing}
        position={[0, 52.3, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={seamMat}
      />
      {rcsPositions.map((p, i) => (
        <mesh key={i} geometry={rcsQuad} position={p} material={m.detail} />
      ))}
    </group>
  )
}

function SolarArrays({
  deploy,
  activeId,
}: {
  deploy: number
  activeId: string | null
}) {
  const sm = solarMatsFor(resolveSubTone(activeId, 'solar-array'))
  // Arm runs off the SM body but visually belongs to the wing — tone
  // it with the solar-array selection so the whole deployable assembly
  // lights up together.
  const solarBaseM = matSetFor(resolveSubTone(activeId, 'solar-array'))
  const scaleZ = 0.2 + deploy * 0.8
  return (
    <group>
      {SOLAR_WING_ANGLES.map((angle, i) => (
        <group key={i} position={[0, 50.3, 0]} rotation={[0, angle, 0]}>
          <group scale={[1, 1, scaleZ]}>
            <mesh
              geometry={solarArm}
              position={[0, 0, 1.5]}
              material={solarBaseM.hullDark}
            />
            {[0, 1, 2].map((j) => (
              <group key={j} position={[0, 0, 0.9 + j * 2]}>
                <mesh geometry={solarPanel} material={sm.panel} />
                <mesh
                  geometry={solarPanelEdge}
                  position={[0, 0.07, 0]}
                  material={sm.edge}
                />
              </group>
            ))}
          </group>
        </group>
      ))}
    </group>
  )
}

const heatShieldCold = new THREE.Color(0xc6bba4)
const heatShieldHot = new THREE.Color(0xff9432)
const heatShieldAmber = new THREE.Color(AMBER)

function CapsuleShell({
  plasma,
  activeId,
}: {
  plasma: number
  activeId: string | null
}) {
  const capsuleTone = resolveSubTone(activeId, 'crew-module')
  const hsTone = resolveSubTone(activeId, 'heat-shield')
  const capsuleM = matSetFor(capsuleTone)

  // Per-instance heat-shield material: colour lerps with plasma for
  // re-entry glow, and shifts toward amber when the component is
  // actively selected.
  const hsMat = useMemo(
    () =>
      new THREE.MeshPhongMaterial({
        color: heatShieldCold.clone(),
        emissive: 0x000000,
        shininess: 12,
      }),
    [],
  )
  const hsSideMat = useMemo(
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
    for (const m of [hsMat, hsSideMat]) {
      m.color.lerpColors(heatShieldCold, heatShieldHot, Math.min(1, plasma))
      if (hsTone === 'active') {
        m.color.lerp(heatShieldAmber, 0.65)
      }
      const plasmaE = Math.min(1, plasma) * 0.6
      const toneE = hsTone === 'active' ? 0.55 : 0
      const e = Math.max(plasmaE, toneE)
      m.emissive.setRGB(e * 1.0, e * 0.58, e * 0.2)
      m.transparent = hsTone === 'dimmed'
      m.opacity = hsTone === 'dimmed' ? 0.22 : 1
      m.needsUpdate = true
    }
  }, [plasma, hsTone, hsMat, hsSideMat])

  return (
    <group scale={SCALE} position={[0, 52, 0]}>
      {/* Heat-shield rim lathe (bottom cross-section) + the flat disk
          that sits on the underside. */}
      <mesh geometry={heatShieldGeo} material={hsSideMat} />
      <mesh
        geometry={hsGeo}
        position={[0, 0.01, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={hsMat}
      />
      {/* Crew compartment lathe above. */}
      <mesh geometry={capsuleBodyGeo} material={capsuleM.hull} />
    </group>
  )
}

function LasShell({ activeId }: { activeId: string | null }) {
  const lasM = matSetFor(resolveSubTone(activeId, 'launch-abort'))
  const motorM = matSetFor(resolveSubTone(activeId, 'abort-motor'))
  return (
    <group scale={SCALE}>
      <mesh geometry={lasBpc} position={[0, 56.75, 0]} material={lasM.hullDark} />
      <mesh
        geometry={lasAbortMotor}
        position={[0, 59.3, 0]}
        material={motorM.hull}
      />
      <mesh geometry={lasTower} position={[0, 62.8, 0]} material={lasM.hull} />
      <mesh geometry={lasSpike} position={[0, 65.5, 0]} material={lasM.detail} />
    </group>
  )
}

export function CinematicShell({ state, activeId }: CinematicShellProps) {
  const { stages, effects, solarDeploy } = state
  return (
    <>
      <group
        position={[-6 + stages.srbL.offsetX, stages.srbL.offsetY, stages.srbL.offsetZ]}
        visible={stages.srbL.visible}
      >
        <SrbShell active={effects.srb} activeId={activeId} />
      </group>

      <group
        position={[6 + stages.srbR.offsetX, stages.srbR.offsetY, stages.srbR.offsetZ]}
        visible={stages.srbR.visible}
      >
        <SrbShell active={effects.srb} activeId={activeId} />
      </group>

      <group
        position={[stages.core.offsetX, stages.core.offsetY, stages.core.offsetZ]}
        visible={stages.core.visible}
      >
        <CoreShell rs25On={effects.rs25} activeId={activeId} />
      </group>

      <group
        position={[stages.icps.offsetX, stages.icps.offsetY, stages.icps.offsetZ]}
        visible={stages.icps.visible}
      >
        <IcpsShell active={Math.max(effects.rl10Prm, effects.rl10Arb)} activeId={activeId} />
      </group>

      <group
        position={[stages.sm.offsetX, stages.sm.offsetY, stages.sm.offsetZ]}
        visible={stages.sm.visible}
      >
        <SmShell active={effects.esmMain} activeId={activeId} />
        <SolarArrays deploy={solarDeploy} activeId={activeId} />
      </group>

      <CapsuleShell plasma={effects.plasma} activeId={activeId} />

      <group
        position={[stages.las.offsetX, stages.las.offsetY, stages.las.offsetZ]}
        visible={stages.las.visible}
      >
        <LasShell activeId={activeId} />
      </group>
    </>
  )
}
