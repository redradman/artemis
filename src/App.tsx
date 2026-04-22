import styles from './App.module.css'
import { Chrome } from './components/Chrome/Chrome'
import { Timeline } from './components/Timeline/Timeline'
import { InfoPanel } from './components/InfoPanel/InfoPanel'
import { Labels } from './components/Labels/Labels'
import { components } from './scenes/ArtemisII/data/components'
import { ArtemisIIScene } from './scenes/ArtemisII'

const STAR_COUNT = 80
const STARS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  id: i,
  cx: (i * 73) % 100,
  cy: (i * 131) % 100,
  r: i % 7 === 0 ? 1.2 : 0.6,
  o: i % 5 === 0 ? 0.7 : 0.3,
}))

function App() {
  const focusedPart = components.find((c) => c.id === 'core-lox')

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

      <Labels visible={!focusedPart} />

      <Chrome />
      {focusedPart && <InfoPanel part={focusedPart} />}
      <Timeline />

      <div className={styles.help}>
        DRAG · ORBIT SCROLL · ZOOM CLICK · DETAILS SPACE · PLAY ← → · STEP
      </div>
    </main>
  )
}

export default App
