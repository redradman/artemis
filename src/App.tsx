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
import { components } from './scenes/ArtemisII/data/components'
import { phases } from './scenes/ArtemisII/data/phases'
import { findActivePhaseIndex } from './hooks/useMissionState'

const STAR_COUNT = 80
const STARS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  id: i,
  cx: (i * 73) % 100,
  cy: (i * 131) % 100,
  r: i % 7 === 0 ? 1.2 : 0.6,
  o: i % 5 === 0 ? 0.7 : 0.3,
}))

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

      <Labels
        visible={showLabels}
        visibility={visibility}
        activeId={activeComponent}
        onLabelClick={setActiveComponent}
      />

      <InfoPanel />

      <Chrome />
      <Timeline />

      <div className={styles.help}>
        DRAG · ORBIT SCROLL · ZOOM CLICK · DETAILS SPACE · PLAY ← → · STEP
      </div>
      <div className={styles.attribution}>
        DATA · NASA ARTEMIS II REFERENCE GUIDE · PUBLIC DOMAIN
      </div>
    </main>
  )
}

export default App
