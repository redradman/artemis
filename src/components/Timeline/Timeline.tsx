import styles from './Timeline.module.css'
import { phases } from '../../scenes/ArtemisII/data/phases'

const SPEEDS = [1, 2, 5, 10] as const

export function Timeline() {
  const phaseT = 0
  const current = phases[0]
  const next = phases[1]
  const activeSpeed = 1

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div className={styles.status}>
          MISSION TIMELINE · <span className={styles.statusValue}>{current.tplus}</span>
          {next && (
            <span className={styles.statusNext}>
              NEXT · <span className={styles.statusNextValue}>{next.label}</span> · {next.tplus}
            </span>
          )}
        </div>
        <div className={styles.controls}>
          <button type="button" className={styles.playBtn}>
            ▶ PLAY
          </button>
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              className={
                s === activeSpeed ? `${styles.speedBtn} ${styles.speedBtnActive}` : styles.speedBtn
              }
            >
              {s}×
            </button>
          ))}
          <div className={styles.phasePill}>▸ {current.label}</div>
        </div>
      </div>

      <div className={styles.track}>
        <div className={styles.baseline} />
        <div className={styles.progress} style={{ width: `${phaseT * 100}%` }} />

        {phases.map((p) => {
          const isPast = phaseT >= p.t - 0.001
          const isCurrent = current.id === p.id
          const isMajor = p.tier === 'major'
          const above = isMajor

          const tickClasses = [
            styles.tick,
            isMajor && styles.tickMajor,
            isPast && !isCurrent && styles.tickPast,
            isCurrent && styles.tickCurrent,
            above ? styles.tickAbove : styles.tickBelow,
          ]
            .filter(Boolean)
            .join(' ')

          const labelClasses = [
            styles.label,
            isMajor ? styles.labelMajor : styles.labelMinor,
            isPast && (isMajor ? styles.labelMajorPast : styles.labelMinorPast),
            isCurrent && styles.labelCurrent,
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <div key={p.id} className={styles.tickCol} style={{ left: `${p.t * 100}%` }}>
              <div className={tickClasses} />
              <div
                className={
                  above
                    ? `${styles.labelGroup} ${styles.labelGroupAbove}`
                    : `${styles.labelGroup} ${styles.labelGroupBelow}`
                }
              >
                <div className={labelClasses}>{p.label}</div>
                {isMajor && (
                  <div
                    className={
                      isCurrent ? `${styles.labelSub} ${styles.labelSubCurrent}` : styles.labelSub
                    }
                  >
                    {p.tplus}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        <div className={styles.playhead} style={{ left: `${phaseT * 100}%` }} />
      </div>
    </div>
  )
}
