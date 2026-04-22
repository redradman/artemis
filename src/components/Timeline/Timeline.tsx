import { useCallback, useEffect, useRef } from 'react'
import styles from './Timeline.module.css'
import { phases } from '../../scenes/ArtemisII/data/phases'
import { useMissionStore } from '../../store/missionStore'
import { useMissionState } from '../../hooks/useMissionState'
import type { PlaybackSpeed } from '../../store/missionStore'

const SPEEDS: readonly PlaybackSpeed[] = [1, 2, 5] as const

export function Timeline() {
  const currentT = useMissionStore((s) => s.currentT)
  const isPlaying = useMissionStore((s) => s.isPlaying)
  const playbackSpeed = useMissionStore((s) => s.playbackSpeed)
  const setTime = useMissionStore((s) => s.setTime)
  const togglePlay = useMissionStore((s) => s.togglePlay)
  const setSpeed = useMissionStore((s) => s.setSpeed)

  const { activePhase, activePhaseIndex, tplus } = useMissionState()
  const next = phases[activePhaseIndex + 1]

  const trackRef = useRef<HTMLDivElement>(null)
  const scrubbingRef = useRef(false)

  const scrubFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current
      if (!track) return
      const rect = track.getBoundingClientRect()
      const t = (clientX - rect.left) / rect.width
      setTime(t)
    },
    [setTime],
  )

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (scrubbingRef.current) scrubFromClientX(e.clientX)
    }
    const onUp = () => {
      scrubbingRef.current = false
    }
    const onTouchMove = (e: TouchEvent) => {
      if (scrubbingRef.current && e.touches[0]) {
        scrubFromClientX(e.touches[0].clientX)
        e.preventDefault()
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [scrubFromClientX])

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div className={styles.status}>
          MISSION TIMELINE · <span className={styles.statusValue}>T+ {tplus}</span>
          {next && (
            <span className={styles.statusNext}>
              NEXT · <span className={styles.statusNextValue}>{next.label}</span> · T+{' '}
              {next.tplus}
            </span>
          )}
        </div>
        <div className={styles.controls}>
          <button type="button" className={styles.playBtn} onClick={togglePlay}>
            {isPlaying ? '❚❚ PAUSE' : '▶ PLAY'}
          </button>
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={
                s === playbackSpeed
                  ? `${styles.speedBtn} ${styles.speedBtnActive}`
                  : styles.speedBtn
              }
            >
              {s}×
            </button>
          ))}
          <div className={styles.phasePill}>▸ {activePhase.label}</div>
        </div>
      </div>

      <div
        ref={trackRef}
        className={styles.track}
        onMouseDown={(e) => {
          scrubbingRef.current = true
          scrubFromClientX(e.clientX)
          e.preventDefault()
        }}
        onTouchStart={(e) => {
          if (e.touches[0]) {
            scrubbingRef.current = true
            scrubFromClientX(e.touches[0].clientX)
          }
        }}
      >
        <div className={styles.baseline} />
        <div className={styles.progress} style={{ width: `${currentT * 100}%` }} />

        {phases.map((p, i) => {
          const isPast = currentT >= p.t - 0.001
          const isCurrent = i === activePhaseIndex
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
            <div
              key={p.id}
              className={styles.tickCol}
              style={{ left: `${p.t * 100}%` }}
              onClick={(e) => {
                e.stopPropagation()
                setTime(p.t)
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
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
                    T+ {p.tplus}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        <div className={styles.playhead} style={{ left: `${currentT * 100}%` }} />
      </div>
    </div>
  )
}
