import { useEffect, useMemo } from 'react'
import styles from './App.module.css'
import { Chrome } from './components/Chrome/Chrome'
import { Timeline } from './components/Timeline/Timeline'
import { Labels } from './components/Labels/Labels'
import { InfoPanel } from './components/InfoPanel/InfoPanel'
import { ArtemisIIScene } from './scenes/ArtemisII'
import { useMissionState } from './hooks/useMissionState'
import { useMissionStore } from './store/missionStore'
import { useMissionPlayback } from './hooks/useMissionPlayback'
import { useProjectionStore } from './hooks/useProjectedPoints'
import { components } from './scenes/ArtemisII/data/components'
import { phases } from './scenes/ArtemisII/data/phases'
import { findActivePhaseIndex } from './hooks/useMissionState'

const SCALE_METERS = [0, 25, 50, 75, 100]

const STAR_COUNT = 80
const STARS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  id: i,
  cx: (i * 73) % 100,
  cy: (i * 131) % 100,
  r: i % 7 === 0 ? 1.2 : 0.6,
  o: i % 5 === 0 ? 0.7 : 0.3,
}))

function ScaleReference() {
  const projections = useProjectionStore((s) => s.projections)
  const viewport = useProjectionStore((s) => s.viewport)

  if (viewport.width === 0 || viewport.width < 768) return null

  // Pull each metre tick's screen y from the projector. Filter to ticks that
  // are on-screen so close zooms don't render floating labels.
  const ticks = SCALE_METERS.map((m) => {
    const p = projections[`scale:${m}`]
    if (!p || !p.onScreen) return null
    if (p.y < 20 || p.y > viewport.height - 20) return null
    return { m, y: p.y }
  }).filter((t): t is { m: number; y: number } => t !== null)

  if (ticks.length < 2) return null

  const topY = Math.min(...ticks.map((t) => t.y))
  const bottomY = Math.max(...ticks.map((t) => t.y))
  // Column anchor — matches --edge-inset clamp(12, 2vw, 28) in tokens.css.
  const columnX = Math.min(28, Math.max(12, viewport.width * 0.02))

  return (
    <svg
      className={styles.scaleRef}
      aria-hidden="true"
      viewBox={`0 0 ${viewport.width} ${viewport.height}`}
      width={viewport.width}
      height={viewport.height}
    >
      <line
        className={styles.scaleRefLine}
        x1={columnX}
        x2={columnX}
        y1={topY}
        y2={bottomY}
      />
      {ticks.map(({ m, y }) => (
        <g key={m} transform={`translate(${columnX} ${Math.round(y)})`}>
          <line className={styles.scaleRefDash} x1={0} x2={12} y1={0} y2={0} />
          <text className={styles.scaleRefLabel} x={18} y={4}>
            {m.toString().padStart(2, '0')}m
          </text>
        </g>
      ))}
    </svg>
  )
}

function App() {
  useMissionPlayback()

  const { state } = useMissionState()
  const showLabels = useMissionStore((s) => s.showLabels)
  const activeComponent = useMissionStore((s) => s.activeComponent)
  const setActiveComponent = useMissionStore((s) => s.setActiveComponent)
  const setAutoRotate = useMissionStore((s) => s.setAutoRotate)

  const visibility = useMemo(() => {
    const map: Record<string, boolean> = {}
    for (const c of components) {
      map[c.id] = state.stages[c.stage].visible
    }
    return map
  }, [state])

  useEffect(() => {
    if (activeComponent) setAutoRotate(false)
  }, [activeComponent, setAutoRotate])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      if (isTyping) return

      if (e.key === 'Escape') {
        setActiveComponent(null)
        return
      }
      if (e.key === ' ') {
        e.preventDefault()
        useMissionStore.getState().togglePlay()
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault()
        const { currentT, setTime } = useMissionStore.getState()
        const idx = findActivePhaseIndex(currentT)
        const next = e.key === 'ArrowRight' ? idx + 1 : idx - 1
        const target = phases[Math.max(0, Math.min(phases.length - 1, next))]
        setTime(target.t)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setActiveComponent])

  return (
    <main className={styles.root}>
      <div
        className={styles.scene}
        role="img"
        aria-label="Interactive 3D wireframe of the Artemis II launch vehicle: a Space Launch System core stage flanked by twin solid rocket boosters, topped by the Interim Cryogenic Propulsion Stage, the Orion service module with solar arrays, the crew module, and the launch abort system."
      >
        <ArtemisIIScene />
      </div>

      <div className={styles.vignette} />
      <svg className={styles.starfield} aria-hidden="true">
        {STARS.map((s) => (
          <circle
            key={s.id}
            cx={`${s.cx}%`}
            cy={`${s.cy}%`}
            r={s.r}
            opacity={s.o}
            className={styles.star}
          />
        ))}
      </svg>

      <div className={styles.horizon} aria-hidden="true" />

      <ScaleReference />

      <Labels
        visible={showLabels}
        visibility={visibility}
        activeId={activeComponent}
        onLabelClick={setActiveComponent}
      />

      <InfoPanel />

      <Chrome />

      <Timeline />

      <a
        className={styles.credit}
        href="https://radman.dev"
        target="_blank"
        rel="noreferrer noopener"
      >
        MADE BY <span className={styles.creditName}>RADMAN</span>
      </a>
    </main>
  )
}

export default App
