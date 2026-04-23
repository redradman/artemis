export type StageId = 'srbL' | 'srbR' | 'core' | 'icps' | 'sm' | 'crew' | 'las'

export type StageState = {
  visible: boolean
  offsetX: number
  offsetY: number
  offsetZ: number
}

export type MissionEffects = {
  rs25: number
  srb: number
  srbSep: number
  lasJett: number
  rl10Prm: number
  rl10Arb: number
  rcsBurst: number
  esmMain: number
  cmsmSep: number
  plasma: number
  parachutes: number
}

export type Orientation = {
  pitch: number
  yaw: number
  roll: number
}

export type MissionStageState = {
  stages: Record<StageId, StageState>
  solarDeploy: number
  effects: MissionEffects
  orientation: Orientation
}

// Keyed banking poses. Each entry is the ship's attitude at that phase,
// expressed as Euler angles in radians. Interpolation between entries
// drives the "on a trajectory" illusion: the rocket rotates in place
// while staying centred in the viewport, and the plumes swing with it.
const ORIENTATION_KEYS: Array<{ t: number } & Orientation> = [
  { t: 0.0, pitch: 0, yaw: 0, roll: 0 }, // LIFTOFF — vertical
  { t: 0.03, pitch: -0.08, yaw: 0.05, roll: 0 }, // MAX-Q — pitchover begins
  { t: 0.075, pitch: -0.18, yaw: 0.12, roll: 0 }, // pre-SRB SEP
  { t: 0.08, pitch: -0.22, yaw: 0.15, roll: 0.28 }, // SRB SEP — roll kick
  { t: 0.1, pitch: -0.28, yaw: 0.18, roll: 0.08 }, // post-SRB SEP settle
  { t: 0.14, pitch: -0.4, yaw: 0.25, roll: -0.15 }, // LAS JETT
  { t: 0.18, pitch: -0.55, yaw: 0.3, roll: 0 },
  { t: 0.22, pitch: -0.75, yaw: 0.38, roll: 0 }, // MECO — near horizontal
  { t: 0.24, pitch: -0.88, yaw: 0.45, roll: 0.05 }, // ICPS SEP
  { t: 0.3, pitch: -0.95, yaw: 0.7, roll: -0.1 }, // ICPS PRM
  { t: 0.36, pitch: -0.95, yaw: 0.95, roll: -0.2 }, // ICPS ARB
  { t: 0.42, pitch: -0.7, yaw: 1.35, roll: 0.4 }, // PROX OPS — maneuver
  { t: 0.52, pitch: -0.3, yaw: 1.8, roll: -0.2 }, // TLI — new heading
  { t: 0.65, pitch: -0.05, yaw: 2.3, roll: 0.15 }, // trans-lunar coast
  { t: 0.78, pitch: 0.1, yaw: 2.9, roll: 0.3 }, // LUNAR FLYBY
  { t: 0.88, pitch: 0.25, yaw: 3.3, roll: 0 }, // return coast
  { t: 0.92, pitch: 0.35, yaw: 3.5, roll: 0.15 }, // CM/SM SEP — small kick
  { t: 0.94, pitch: 0.45, yaw: 3.55, roll: 0 },
  { t: 0.96, pitch: 0.7, yaw: 3.6, roll: 0 }, // ENTRY — heat shield into flow
  { t: 0.99, pitch: 0.35, yaw: 3.6, roll: 0 }, // deceleration
  { t: 1.0, pitch: 0, yaw: 3.6, roll: 0 }, // SPLASHDOWN — vertical under chutes
]

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

function orientationAt(t: number): Orientation {
  if (t <= ORIENTATION_KEYS[0].t) return ORIENTATION_KEYS[0]
  if (t >= ORIENTATION_KEYS[ORIENTATION_KEYS.length - 1].t) {
    const last = ORIENTATION_KEYS[ORIENTATION_KEYS.length - 1]
    return { pitch: last.pitch, yaw: last.yaw, roll: last.roll }
  }
  let nextIdx = 1
  for (let i = 1; i < ORIENTATION_KEYS.length; i++) {
    if (ORIENTATION_KEYS[i].t >= t) {
      nextIdx = i
      break
    }
  }
  const prev = ORIENTATION_KEYS[nextIdx - 1]
  const next = ORIENTATION_KEYS[nextIdx]
  const span = next.t - prev.t || 1
  const k = easeInOutCubic((t - prev.t) / span)
  return {
    pitch: prev.pitch + (next.pitch - prev.pitch) * k,
    yaw: prev.yaw + (next.yaw - prev.yaw) * k,
    roll: prev.roll + (next.roll - prev.roll) * k,
  }
}

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3)
}

function triangle(t: number, start: number, peak: number, end: number): number {
  if (t <= start || t >= end) return 0
  if (t < peak) return (t - start) / (peak - start)
  return (end - t) / (end - peak)
}

function plateau(t: number, start: number, end: number, ramp: number): number {
  if (t <= start || t >= end) return 0
  if (t < start + ramp) return (t - start) / ramp
  if (t > end - ramp) return (end - t) / ramp
  return 1
}

const STAGE_IDS: StageId[] = ['srbL', 'srbR', 'core', 'icps', 'sm', 'crew', 'las']

export function stateAt(t: number): MissionStageState {
  const stages = STAGE_IDS.reduce((acc, id) => {
    acc[id] = { visible: true, offsetX: 0, offsetY: 0, offsetZ: 0 }
    return acc
  }, {} as Record<StageId, StageState>)

  // SRB separation aligned with phases.ts SRB SEP at t=0.08.
  if (t > 0.08) {
    const sep = Math.min(1, (t - 0.08) / 0.05)
    const eased = easeOutCubic(sep)
    stages.srbL.offsetX = -eased * 25
    stages.srbR.offsetX = eased * 25
    stages.srbL.offsetY = -eased * 10
    stages.srbR.offsetY = -eased * 10
    if (t > 0.13) {
      stages.srbL.visible = false
      stages.srbR.visible = false
    }
  }

  // LAS jettison aligned with phases.ts LAS JETT at t=0.14.
  if (t > 0.14) {
    const sep = Math.min(1, (t - 0.14) / 0.04)
    const eased = easeOutCubic(sep)
    stages.las.offsetY = eased * 20
    stages.las.offsetX = eased * 8
    if (t > 0.18) stages.las.visible = false
  }

  // Core stage drops from ICPS/Orion at phases.ts ICPS SEP t=0.24.
  if (t > 0.24) {
    const sep = Math.min(1, (t - 0.24) / 0.05)
    const eased = easeOutCubic(sep)
    stages.core.offsetY = -eased * 25
    if (t > 0.29) stages.core.visible = false
  }

  // Orion separates from ICPS at phases.ts PROX OPS t=0.42.
  if (t > 0.42) {
    const sep = Math.min(1, (t - 0.42) / 0.05)
    const eased = easeOutCubic(sep)
    stages.icps.offsetY = -eased * 18
    if (t > 0.48) stages.icps.visible = false
  }

  // Solar arrays deploy shortly after Orion/ICPS separation so the
  // spacecraft can begin generating its own power.
  let solarDeploy = 0
  if (t > 0.44) {
    solarDeploy = Math.min(1, (t - 0.44) / 0.08)
  }

  // Service module jettisoned at CM/SM SEP t=0.92, gone before entry t=0.96.
  if (t > 0.92) {
    const sep = Math.min(1, (t - 0.92) / 0.03)
    const eased = easeOutCubic(sep)
    stages.sm.offsetY = -eased * 15
    if (t > 0.95) stages.sm.visible = false
  }

  // Per-system activity envelopes. Intensities are in [0,1]; per-frame
  // jitter and pulse live in the effects components (not here). Event
  // timings follow phases.ts — the authoritative source.
  let rs25 = 0
  if (t < 0.22) {
    if (t < 0.025) rs25 = 1
    else if (t < 0.03) rs25 = 1 - ((t - 0.025) / 0.005) * 0.35
    else if (t < 0.04) rs25 = 0.65 + ((t - 0.03) / 0.01) * 0.35
    else rs25 = 1
  }

  const srb = t < 0.08 ? 1 : 0
  // Separation and burn envelopes are shaped so their peak sits AT the
  // phase marker time — scrubbing phase-by-phase lands on the active frame.
  const srbSep = triangle(t, 0.06, 0.08, 0.12)
  const lasJett = triangle(t, 0.12, 0.14, 0.18)
  const rl10Prm = plateau(t, 0.29, 0.325, 0.005)
  const rl10Arb = plateau(t, 0.35, 0.385, 0.005)
  const esmMain = plateau(t, 0.5, 0.57, 0.01)
  const cmsmSep = triangle(t, 0.9, 0.92, 0.95)

  // RCS attitude-control bursts. Three discrete event windows — PROX OPS
  // maneuvering, the instant before the TLI burn commits, and a pair of
  // pre-entry attitude checks. Blended via Math.max so any overlap is
  // handled cleanly (in practice the windows are disjoint).
  const rcsProxOps = plateau(t, 0.41, 0.46, 0.01)
  const rcsTliStart = triangle(t, 0.515, 0.52, 0.535)
  const rcsPreEntry = triangle(t, 0.925, 0.935, 0.95)
  const rcsBurst = Math.max(rcsProxOps * 0.7, rcsTliStart, rcsPreEntry)

  // Plasma peaks at ENTRY (t=0.96) and fades as the capsule slows past
  // terminal velocity; parachutes ramp in during the last moment before
  // SPLASHDOWN at t=1.0.
  let plasma = 0
  if (t > 0.95 && t <= 1) {
    if (t < 0.96) plasma = (t - 0.95) / 0.01
    else if (t < 0.99) plasma = 1
    else plasma = Math.max(0, 1 - (t - 0.99) / 0.01)
  }

  let parachutes = 0
  if (t > 0.985) {
    parachutes = easeOutCubic(Math.min(1, (t - 0.985) / 0.015))
  }

  const effects: MissionEffects = {
    rs25,
    srb,
    srbSep,
    lasJett,
    rl10Prm,
    rl10Arb,
    rcsBurst,
    esmMain,
    cmsmSep,
    plasma,
    parachutes,
  }

  const orientation = orientationAt(t)

  return { stages, solarDeploy, effects, orientation }
}
