import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './Timeline.module.css'
import { phases } from '../../scenes/ArtemisII/data/phases'
import type { Phase } from '../../scenes/ArtemisII/data/phases'
import { useMissionStore } from '../../store/missionStore'
import { useMissionState } from '../../hooks/useMissionState'
import type { PlaybackSpeed } from '../../store/missionStore'
import { ZoomControls } from '../Chrome/ZoomControls'

const SPEEDS: readonly PlaybackSpeed[] = [1, 2, 3, 5] as const

type LabelAnchor = 'left' | 'center' | 'right'
type LabelSide = 'above' | 'below'

// Minimum fraction-of-track gap between two same-side labels at the same
// row. Below this the second label flips to the other side, then to a
// stagger row if both sides are occupied.
const MIN_GAP = 0.075
// Boundary anchors (LIFTOFF at t=0 left-anchored, SPLASHDOWN at t=1 right-
// anchored) visually extend past their tick rather than centering on it,
// so the collision math shifts their effective position inward.
const BOUNDARY_OFFSET = 0.04

type LabelLayout = {
  anchor: LabelAnchor
  side: LabelSide
  row: number
}

function computeLabelLayouts(phases: readonly Phase[]): LabelLayout[] {
  // occupied[row] = lastT of the most recent label placed in that row on
  // that side. Index 0 is the row nearest the baseline; higher indices are
  // outer stagger rows.
  const above: number[] = []
  const below: number[] = []
  const lastIdx = phases.length - 1
  let prevSide: LabelSide | null = null

  return phases.map((p, i) => {
    const anchor: LabelAnchor =
      i === 0 ? 'left' : i === lastIdx ? 'right' : 'center'

    const effectiveT =
      anchor === 'left'
        ? p.t + BOUNDARY_OFFSET
        : anchor === 'right'
          ? p.t - BOUNDARY_OFFSET
          : p.t

    // Inner row of each side (row 0): does the new label fit?
    const aboveInnerOk = above.length === 0 || effectiveT - above[0] >= MIN_GAP
    const belowInnerOk = below.length === 0 || effectiveT - below[0] >= MIN_GAP

    let side: LabelSide
    let row: number

    if (aboveInnerOk && belowInnerOk) {
      // Both inner rows free: alternate sides for the zigzag rhythm so the
      // eye reads the timeline as paired ticks rather than a wall of names.
      side = prevSide === 'below' ? 'above' : 'below'
      row = 0
    } else if (aboveInnerOk) {
      side = 'above'
      row = 0
    } else if (belowInnerOk) {
      side = 'below'
      row = 0
    } else {
      // Both inner rows are too close — fall back to whichever outer row
      // has the larger gap. Outer rows are rare (only the tightest LIFTOFF/
      // SRB-SEP and ENTRY/SPLASHDOWN pairs trigger this branch).
      const aboveOuterGap =
        above.length < 2 ? Number.POSITIVE_INFINITY : effectiveT - above[1]
      const belowOuterGap =
        below.length < 2 ? Number.POSITIVE_INFINITY : effectiveT - below[1]
      side = belowOuterGap >= aboveOuterGap ? 'below' : 'above'
      row = 1
    }

    const target = side === 'above' ? above : below
    while (target.length <= row) target.push(Number.NEGATIVE_INFINITY)
    target[row] = effectiveT
    prevSide = side

    return { anchor, side, row }
  })
}

export function Timeline() {
  const currentT = useMissionStore((s) => s.currentT)
  const isPlaying = useMissionStore((s) => s.isPlaying)
  const playbackSpeed = useMissionStore((s) => s.playbackSpeed)
  const setTime = useMissionStore((s) => s.setTime)
  const togglePlay = useMissionStore((s) => s.togglePlay)
  const setSpeed = useMissionStore((s) => s.setSpeed)

  const { activePhase, activePhaseIndex, tplus } = useMissionState()
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
      <ZoomControls />
      <div className={styles.head}>
        <div className={styles.status}>
          MISSION TIMELINE · <span className={styles.statusValue}>T+ {tplus}</span>
        </div>
        <div className={styles.controls}>
          <button type="button" className={styles.playBtn} onClick={togglePlay}>
            {isPlaying ? '❚❚ PAUSE' : '▶ PLAY'}
          </button>
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
        </div>
        <div className={styles.statusPhase}>
          <span>{activePhase.label}</span>
          <button
            type="button"
            className={`${styles.infoIcon} ${styles.infoIconMajor}`}
            aria-label={`${activePhase.label} details`}
            aria-expanded={openPhaseId === activePhase.id}
            onClick={(e) => {
              e.stopPropagation()
              setOpenPhaseId((prev) =>
                prev === activePhase.id ? null : activePhase.id,
              )
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            i
          </button>
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
          const layout = labelLayouts[i]

          const tickClasses = [
            styles.tick,
            layout.side === 'above' ? styles.tickAbove : styles.tickBelow,
            layout.row === 1 && styles.tickStaggered,
            isPast && !isCurrent && styles.tickPast,
            isCurrent && styles.tickCurrent,
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
            layout.anchor === 'left'
              ? styles.labelGroupAnchorLeft
              : layout.anchor === 'right'
                ? styles.labelGroupAnchorRight
                : ''

          const sideRowClass =
            layout.side === 'above'
              ? layout.row === 0
                ? styles.labelAboveRow0
                : styles.labelAboveRow1
              : layout.row === 0
                ? styles.labelBelowRow0
                : styles.labelBelowRow1

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

              <div className={`${styles.labelGroup} ${sideRowClass} ${anchorClass}`}>
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

        <div
          className={
            isPlaying ? `${styles.playhead} ${styles.playheadPlaying}` : styles.playhead
          }
          style={{ left: `${currentT * 100}%` }}
        />
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
