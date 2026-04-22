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
      if (e.key === 'Escape') setActiveComponent(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setActiveComponent])

  return (
    <main className={styles.root}>
      <div className={styles.scene}>
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
    </main>
  )
}

export default App
