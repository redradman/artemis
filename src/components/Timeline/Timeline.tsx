import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './Timeline.module.css'
import { phases } from '../../scenes/ArtemisII/data/phases'
import type { Phase } from '../../scenes/ArtemisII/data/phases'
import { useMissionStore } from '../../store/missionStore'
import { useMissionState } from '../../hooks/useMissionState'
import type { PlaybackSpeed } from '../../store/missionStore'

const SPEEDS: readonly PlaybackSpeed[] = [1, 2, 5] as const

// Adjacent labels closer than this fraction of the track width get anchored
// to opposite edges of their tick column to avoid horizontal overlap.
const PROXIMITY_THRESHOLD = 0.05

type LabelAnchor = 'left' | 'center' | 'right'

type LabelLayout = { anchor: LabelAnchor; stackUp: boolean; hideSub: boolean }

// Ticks within this gap of the first/last tick get paired with the boundary
// even if they're above PROXIMITY_THRESHOLD; the boundary label has to hug
// its edge, so near neighbours need to stack to avoid horizontal collisions.
const BOUNDARY_PAIR_GAP = 0.1

function computeLabelLayouts(
  phases: readonly { t: number; tier: 'major' | 'minor' }[],
  threshold = PROXIMITY_THRESHOLD,
): LabelLayout[] {
  const layouts: LabelLayout[] = phases.map(() => ({
    anchor: 'center',
    stackUp: false,
    hideSub: false,
  }))

  // General adjacent-pair resolution for same-tier collisions away from the
  // track boundaries. Predecessor keeps the normal row; successor stacks up,
  // both anchor-right (since this pattern fires on the far-right ENTRY /
  // SPLASHDOWN cluster).
  for (let i = 1; i < phases.length; i++) {
    const gap = phases[i].t - phases[i - 1].t
    if (gap >= threshold) continue
    if (phases[i].tier !== phases[i - 1].tier) continue
    layouts[i - 1].anchor = 'right'
    layouts[i - 1].hideSub = true
    layouts[i].anchor = 'right'
    layouts[i].stackUp = true
    layouts[i].hideSub = true
  }

  // Boundary handling. The first tick sits at t=0 and the last at t=1, so a
  // centred label group would spill outside the wrap. Anchor the boundary
  // labels inward and — if the closest same-tier follower (skipping over
  // mixed-tier neighbours that render on the opposite row) would collide —
  // stack it up. Runs after the general pass so these rules win.
  if (phases.length >= 1) {
    layouts[0].anchor = 'left'

    let firstFollower = -1
    for (let i = 1; i < phases.length; i++) {
      if (phases[i].tier === phases[0].tier) {
        firstFollower = i
        break
      }
    }
    if (
      firstFollower > 0 &&
      phases[firstFollower].t - phases[0].t < BOUNDARY_PAIR_GAP
    ) {
      layouts[0].hideSub = true
      layouts[firstFollower].anchor = 'left'
      layouts[firstFollower].stackUp = true
      layouts[firstFollower].hideSub = true
    }

    const last = phases.length - 1
    if (last > 0 && layouts[last].anchor === 'center') {
      layouts[last].anchor = 'right'
    }
  }

  return layouts
}

export function Timeline() {
  const currentT = useMissionStore((s) => s.currentT)
  const isPlaying = useMissionStore((s) => s.isPlaying)
  const playbackSpeed = useMissionStore((s) => s.playbackSpeed)
  const setTime = useMissionStore((s) => s.setTime)
  const togglePlay = useMissionStore((s) => s.togglePlay)
  const setSpeed = useMissionStore((s) => s.setSpeed)

  const { activePhase, activePhaseIndex, tplus } = useMissionState()
  const next = phases[activePhaseIndex + 1]
  const labelLayouts = computeLabelLayouts(phases)

  const trackRef = useRef<HTMLDivElement>(null)
  const scrubbingRef = useRef(false)
  const [openPhaseId, setOpenPhaseId] = useState<string | null>(null)
  const popoverRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const iconRefs = useRef<Record<string, HTMLButtonElement | null>>({})

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

  // Close popover on outside click or Escape
  useEffect(() => {
    if (!openPhaseId) return
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null
      if (!target) return
      const popover = popoverRefs.current[openPhaseId]
      const icon = iconRefs.current[openPhaseId]
      if (popover && popover.contains(target)) return
      if (icon && icon.contains(target)) return
      setOpenPhaseId(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenPhaseId(null)
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [openPhaseId])

  const popoverAnchorClass = (t: number) => {
    if (t < 0.1) return styles.popoverAnchorLeft
    if (t > 0.9) return styles.popoverAnchorRight
    return ''
  }

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
          <span className={styles.divider} aria-hidden="true" />
          <div className={styles.speedGroup}>
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
          </div>
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
          const layout = labelLayouts[i]
          const anchor = layout.anchor

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

          const anchorClass =
            anchor === 'left'
              ? styles.labelGroupAnchorLeft
              : anchor === 'right'
                ? styles.labelGroupAnchorRight
                : ''

          const labelGroupClasses = [
            styles.labelGroup,
            above ? styles.labelGroupAbove : styles.labelGroupBelow,
            anchorClass,
            layout.stackUp && above ? styles.labelGroupStackUp : null,
          ]
            .filter(Boolean)
            .join(' ')

          const isOpen = openPhaseId === p.id
          const popoverId = `phase-popover-${p.id}`
          const popoverTitleId = `phase-popover-title-${p.id}`

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
              <div className={labelGroupClasses}>
                <div className={styles.labelRow}>
                  <div className={labelClasses}>{p.label}</div>
                  <button
                    ref={(el) => {
                      iconRefs.current[p.id] = el
                    }}
                    type="button"
                    className={`${styles.infoIcon} ${isMajor ? styles.infoIconMajor : styles.infoIconMinor}`}
                    aria-label={`${p.label} details`}
                    aria-expanded={isOpen}
                    aria-controls={popoverId}
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenPhaseId((prev) => (prev === p.id ? null : p.id))
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    i
                  </button>
                </div>
                {isMajor && !layout.hideSub && (
                  <div
                    className={
                      isCurrent ? `${styles.labelSub} ${styles.labelSubCurrent}` : styles.labelSub
                    }
                  >
                    T+ {p.tplus}
                  </div>
                )}
              </div>
              {isOpen && (
                <PhaseInfoPopover
                  id={popoverId}
                  titleId={popoverTitleId}
                  phase={p}
                  anchorClass={popoverAnchorClass(p.t)}
                  popoverRef={(el) => {
                    popoverRefs.current[p.id] = el
                  }}
                  onClose={() => setOpenPhaseId(null)}
                />
              )}
            </div>
          )
        })}

        <div className={styles.playhead} style={{ left: `${currentT * 100}%` }} />
      </div>
    </div>
  )
}

type PhaseInfoPopoverProps = {
  id: string
  titleId: string
  phase: Phase
  anchorClass: string
  popoverRef: (el: HTMLDivElement | null) => void
  onClose: () => void
}

function PhaseInfoPopover({
  id,
  titleId,
  phase,
  anchorClass,
  popoverRef,
  onClose,
}: PhaseInfoPopoverProps) {
  return (
    <div
      ref={popoverRef}
      id={id}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className={`${styles.popover} ${anchorClass}`}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className={styles.popoverHead}>
        <div>
          <div className={styles.popoverKicker}>
            T+ {phase.tplus} <span className={styles.popoverMetaDot}>·</span>{' '}
            {phase.tier.toUpperCase()}
          </div>
          <h2 className={styles.popoverTitle} id={titleId}>
            {phase.label}
          </h2>
        </div>
        <button
          type="button"
          className={styles.popoverClose}
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <blockquote className={styles.popoverLede}>
        {phase.significance}
      </blockquote>
      <p className={styles.popoverBody}>{phase.desc}</p>
      <div className={styles.popoverSourcesHead}>SOURCES</div>
      <ul className={styles.popoverSources}>
        {phase.sources.map((s, i) => (
          <li key={i} className={styles.popoverSource}>
            {s}
          </li>
        ))}
      </ul>
    </div>
  )
}
