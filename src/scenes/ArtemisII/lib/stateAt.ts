export type StageId = 'srbL' | 'srbR' | 'core' | 'icps' | 'sm' | 'crew' | 'las'

export type StageState = {
  visible: boolean
  offsetX: number
  offsetY: number
  offsetZ: number
}

export type MissionStageState = {
  stages: Record<StageId, StageState>
  solarDeploy: number
  engineGlow: number
}

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3)
}

const STAGE_IDS: StageId[] = ['srbL', 'srbR', 'core', 'icps', 'sm', 'crew', 'las']

export function stateAt(t: number): MissionStageState {
  const stages = STAGE_IDS.reduce((acc, id) => {
    acc[id] = { visible: true, offsetX: 0, offsetY: 0, offsetZ: 0 }
    return acc
  }, {} as Record<StageId, StageState>)

  let engineGlow = 0
  if (t < 0.36) engineGlow = 1
  else if (t < 0.56) engineGlow = 0
  else if (t < 0.72) engineGlow = 0.6

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

  return { stages, solarDeploy, engineGlow }
}
