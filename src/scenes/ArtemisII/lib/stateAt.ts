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

  // SRB separation at t=0.14, fully gone by t=0.2
  if (t > 0.14) {
    const sep = Math.min(1, (t - 0.14) / 0.05)
    const eased = easeOutCubic(sep)
    stages.srbL.offsetX = -eased * 25
    stages.srbR.offsetX = eased * 25
    stages.srbL.offsetY = -eased * 10
    stages.srbR.offsetY = -eased * 10
    if (t > 0.2) {
      stages.srbL.visible = false
      stages.srbR.visible = false
    }
  }

  // LAS jettison at t=0.21
  if (t > 0.21) {
    const sep = Math.min(1, (t - 0.21) / 0.04)
    const eased = easeOutCubic(sep)
    stages.las.offsetY = eased * 20
    stages.las.offsetX = eased * 8
    if (t > 0.26) stages.las.visible = false
  }

  // Core stage separation at t=0.36
  if (t > 0.36) {
    const sep = Math.min(1, (t - 0.36) / 0.06)
    const eased = easeOutCubic(sep)
    stages.core.offsetY = -eased * 25
    if (t > 0.44) stages.core.visible = false
  }

  // ICPS separation at t=0.72
  if (t > 0.72) {
    const sep = Math.min(1, (t - 0.72) / 0.05)
    const eased = easeOutCubic(sep)
    stages.icps.offsetY = -eased * 18
    if (t > 0.79) stages.icps.visible = false
  }

  // Solar arrays deploy at t=0.72
  let solarDeploy = 0
  if (t > 0.72) {
    solarDeploy = Math.min(1, (t - 0.72) / 0.08)
  }

  // Service module jettisoned at reentry t=0.97
  if (t > 0.97) {
    const sep = Math.min(1, (t - 0.97) / 0.03)
    const eased = easeOutCubic(sep)
    stages.sm.offsetY = -eased * 15
    if (t > 0.99) stages.sm.visible = false
  }

  return { stages, solarDeploy, engineGlow }
}
