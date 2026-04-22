import { useMemo } from 'react'
import { useMissionStore } from '../store/missionStore'
import { stateAt } from '../scenes/ArtemisII/lib/stateAt'
import type { MissionStageState } from '../scenes/ArtemisII/lib/stateAt'
import { phases } from '../scenes/ArtemisII/data/phases'
import type { Phase } from '../scenes/ArtemisII/data/phases'

export type MissionStats = {
  massTonnes: number
  thrustDisplay: string
}

export type MissionState = {
  currentT: number
  state: MissionStageState
  activePhase: Phase
  activePhaseIndex: number
  stats: MissionStats
  tplus: string
}

export function useMissionState(): MissionState {
  const currentT = useMissionStore((s) => s.currentT)

  return useMemo(() => {
    const state = stateAt(currentT)
    const activePhaseIndex = findActivePhaseIndex(currentT)
    const activePhase = phases[activePhaseIndex]
    const stats = computeStats(currentT, state)
    const tplus = interpolateTplus(currentT)
    return { currentT, state, activePhase, activePhaseIndex, stats, tplus }
  }, [currentT])
}

export function findActivePhaseIndex(t: number): number {
  let idx = 0
  for (let i = 0; i < phases.length; i++) {
    if (phases[i].t <= t) idx = i
  }
  return idx
}

export function interpolateTplus(t: number): string {
  for (let i = 0; i < phases.length - 1; i++) {
    const a = phases[i]
    const b = phases[i + 1]
    if (t >= a.t && t <= b.t) {
      const localT = b.t === a.t ? 0 : (t - a.t) / (b.t - a.t)
      const secs = parseTplus(a.tplus) + (parseTplus(b.tplus) - parseTplus(a.tplus)) * localT
      return formatTplus(secs)
    }
  }
  return phases[phases.length - 1].tplus
}

function parseTplus(s: string): number {
  const [h, m, ss] = s.split(':').map(Number)
  return h * 3600 + m * 60 + ss
}

function formatTplus(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = Math.floor(secs % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function computeStats(t: number, state: MissionStageState): MissionStats {
  let mass = 0
  if (state.stages.srbL.visible) mass += 728
  if (state.stages.srbR.visible) mass += 728
  if (state.stages.core.visible) mass += 1000
  if (state.stages.icps.visible) mass += 32
  if (state.stages.sm.visible) mass += 15.5
  mass += 10.4 // crew module
  if (state.stages.las.visible) mass += 6.4

  let thrust = 0
  if (t < 0.14) thrust = 39.1
  else if (t < 0.2) thrust = 39.1 - ((t - 0.14) / 0.06) * 31
  else if (t < 0.36) thrust = 8.0
  else if (t > 0.56 && t < 0.72) thrust = 0.11

  const thrustDisplay =
    thrust > 1
      ? `${thrust.toFixed(1)} MN`
      : thrust > 0
        ? `${(thrust * 1000).toFixed(0)} kN`
        : '—'

  return { massTonnes: mass, thrustDisplay }
}
