import { useMemo, useRef } from 'react'
import { useProjectionStore } from '../../hooks/useProjectedPoints'
import type { Projection } from '../../hooks/useProjectedPoints'
import { components } from '../../scenes/ArtemisII/data/components'
import type { RocketComponent } from '../../scenes/ArtemisII/data/components'
import styles from './Labels.module.css'

const MARGIN_TOP = 70
const MARGIN_BOTTOM_RATIO = 0.28
const MARGIN_BOTTOM_MIN = 140
const ROW_HEIGHT = 28
const TEXT_OFFSET = 12
const HIT_PADDING_X = 16
const APPROX_CHAR_WIDTH = 8.6
const EDGE_PAD = 18 // keep label text at least this far from the viewport edge

// Proximity-based leader length. Labels whose anchor projects near the model
// silhouette (far from the viewport horizontal centre) get a longer leader so
// they read cleanly in their column; anchors deep inside the model (close to
// centre) sit with a short leader right next to the geometry. Breaks the old
// "every label wedged into one column" look.
const MIN_LEADER = 70
const MAX_LEADER = 240
const SILHOUETTE_REACH_RATIO = 0.26 // how much of viewport width counts as "deep"

// Small dead-zone around viewport centre: inside this band a label keeps its
// last side; outside it the side snaps to the projected anchor's half of the
// screen. Narrow band so labels stay tightly glued to their anchors and flip
// early as the model orbits, rather than hanging on the wrong side.
const SIDE_DEADZONE_LEFT = 0.48
const SIDE_DEADZONE_RIGHT = 0.52

// If the anchor projects further off-screen vertically than this fraction of
// viewport height, skip the label entirely — clamping its y to the nearest
// margin would leave the leader pointing at empty space, which is exactly the
// failure mode the audit called out.
const Y_OFFSCREEN_TOLERANCE = 0.1

// Exclusion zones to keep labels clear of Chrome content.
// Top-left: mission title (single ARTEMIS II line — no subtitle).
// Top-right: specs row (HEIGHT / MASS / THRUST / CREW) + HUD button row.
// The bottom is handled by MARGIN_BOTTOM.
const TOP_LEFT_EXCLUSION = { height: 90, width: 360 }
const TOP_RIGHT_EXCLUSION = { height: 130, width: 320 }
const EXCLUSION_PAD = 14

type PlacedLabel = {
  id: string
  label: string
  anchor: { x: number; y: number }
  side: 'left' | 'right'
  /** Horizontal position of the leader terminal (dot). Varies per-label based
   *  on anchor depth so labels don't all stack to the same column. */
  tickX: number
  desiredY: number
  y: number
  visible: boolean
}

export type LabelsProps = {
  visible?: boolean
  visibility?: Record<string, boolean>
  activeId?: string | null
  onLabelClick?: (id: string) => void
  onLabelHover?: (id: string | null) => void
}

export function Labels({
  visible = true,
  visibility,
  activeId,
  onLabelClick,
  onLabelHover,
}: LabelsProps) {
  const projections = useProjectionStore((s) => s.projections)
  const viewport = useProjectionStore((s) => s.viewport)

  // Persist the last assigned side per label id so hysteresis survives frames.
  const lastSidesRef = useRef<Record<string, 'left' | 'right'>>({})

  const placed = useMemo(
    () =>
      layoutLabels(components, projections, visibility, viewport, lastSidesRef.current),
    [projections, visibility, viewport],
  )

  if (!visible || viewport.width === 0) {
    return <svg className={styles.overlay} aria-hidden="true" />
  }

  return (
    <svg
      className={styles.overlay}
      viewBox={`0 0 ${viewport.width} ${viewport.height}`}
      width={viewport.width}
      height={viewport.height}
      shapeRendering="geometricPrecision"
    >
      {placed.map((p) => {
        const isRight = p.side === 'right'
        const tickX = p.tickX
        const textX = isRight ? tickX + TEXT_OFFSET : tickX - TEXT_OFFSET
        const textAnchor = isRight ? 'start' : 'end'
        const textWidth = p.label.length * APPROX_CHAR_WIDTH
        const hitX = isRight ? tickX - 4 : tickX - textWidth - HIT_PADDING_X
        const hitW = textWidth + HIT_PADDING_X + 8
        const isActive = p.id === activeId
        const classes = [styles.group]
        if (!p.visible) classes.push(styles.groupHidden)
        if (isActive) classes.push(styles.active)
        const groupClassName = classes.join(' ')

        const dotCx = Math.round(tickX)
        const dotCy = Math.round(p.y)

        return (
          <g
            key={p.id}
            className={groupClassName}
            role="button"
            tabIndex={p.visible ? 0 : -1}
            aria-label={p.label}
            aria-pressed={isActive}
            onClick={() => onLabelClick?.(p.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onLabelClick?.(p.id)
              }
            }}
            onPointerEnter={() => onLabelHover?.(p.id)}
            onPointerLeave={() => onLabelHover?.(null)}
          >
            <line
              className={styles.leader}
              x1={p.anchor.x}
              y1={p.anchor.y}
              x2={dotCx}
              y2={dotCy}
            />
            <circle className={styles.dot} cx={dotCx} cy={dotCy} r={1.5} />
            <text
              className={styles.text}
              x={textX}
              y={p.y + 4}
              textAnchor={textAnchor}
            >
              {p.label}
            </text>
            <line
              className={styles.leaderHit}
              x1={p.anchor.x}
              y1={p.anchor.y}
              x2={dotCx}
              y2={dotCy}
            />
            <rect
              className={styles.hit}
              x={hitX}
              y={p.y - 12}
              width={hitW}
              height={24}
            />
          </g>
        )
      })}
    </svg>
  )
}

function computeMarginBottom(height: number): number {
  if (height === 0) return MARGIN_BOTTOM_MIN
  return Math.max(MARGIN_BOTTOM_MIN, height * MARGIN_BOTTOM_RATIO)
}

/**
 * Per-label leader length based on how close the projected anchor is to the
 * viewport horizontal centre. Anchors near centre (deep inside the rocket) get
 * a short leader; anchors near the side edges (on the silhouette) push out to
 * a longer leader. Result is clamped so the label text always fits on-screen.
 */
function computeTickX(
  anchorX: number,
  side: 'left' | 'right',
  label: string,
  width: number,
): number {
  const center = width / 2
  const distFromCenter = Math.abs(anchorX - center)
  const silhouetteFactor = Math.min(
    1,
    distFromCenter / (width * SILHOUETTE_REACH_RATIO),
  )
  const leader = MIN_LEADER + silhouetteFactor * (MAX_LEADER - MIN_LEADER)

  const textWidth = label.length * APPROX_CHAR_WIDTH
  if (side === 'left') {
    const minTickX = textWidth + TEXT_OFFSET + EDGE_PAD
    return Math.max(minTickX, anchorX - leader)
  }
  const maxTickX = width - textWidth - TEXT_OFFSET - EDGE_PAD
  return Math.min(maxTickX, anchorX + leader)
}

function chooseSide(
  projX: number,
  width: number,
  prev: 'left' | 'right' | undefined,
  fallback: 'left' | 'right',
): 'left' | 'right' {
  const ratio = projX / width
  if (ratio < SIDE_DEADZONE_LEFT) return 'left'
  if (ratio > SIDE_DEADZONE_RIGHT) return 'right'
  return prev ?? fallback
}

function layoutLabels(
  items: RocketComponent[],
  projections: Record<string, Projection>,
  visibility: Record<string, boolean> | undefined,
  viewport: { width: number; height: number },
  lastSides: Record<string, 'left' | 'right'>,
): PlacedLabel[] {
  if (viewport.width === 0 || viewport.height === 0) return []

  const marginBottom = computeMarginBottom(viewport.height)
  const yTolerance = viewport.height * Y_OFFSCREEN_TOLERANCE

  const placed: PlacedLabel[] = []
  for (const c of items) {
    const proj = projections[c.id]
    if (!proj || !proj.onScreen) continue
    // Skip anchors on the far side of the model — they'd project behind the
    // visible geometry and produce leaders pointing at empty space.
    if (!proj.facing) continue
    // Skip anchors that projected far outside the viewport on either axis.
    // Clamping these would sever the leader from its anchor visually.
    if (proj.x < -40 || proj.x > viewport.width + 40) continue
    if (proj.y < -yTolerance || proj.y > viewport.height + yTolerance) continue

    const side = chooseSide(proj.x, viewport.width, lastSides[c.id], c.side)
    lastSides[c.id] = side

    const tickX = computeTickX(proj.x, side, c.label, viewport.width)

    const desiredY = clamp(
      proj.y + c.offset.y,
      MARGIN_TOP,
      viewport.height - marginBottom,
    )
    placed.push({
      id: c.id,
      label: c.label,
      anchor: { x: proj.x, y: proj.y },
      side,
      tickX,
      desiredY,
      y: desiredY,
      visible: visibility ? (visibility[c.id] ?? true) : true,
    })
  }

  // Apply chrome exclusion zones: title top-left, specs top-right.
  for (const p of placed) {
    if (p.side === 'right' && p.desiredY < TOP_RIGHT_EXCLUSION.height) {
      p.desiredY = TOP_RIGHT_EXCLUSION.height + EXCLUSION_PAD
      p.y = p.desiredY
    } else if (p.side === 'left' && p.desiredY < TOP_LEFT_EXCLUSION.height) {
      p.desiredY = TOP_LEFT_EXCLUSION.height + EXCLUSION_PAD
      p.y = p.desiredY
    }
  }

  resolveColumn(
    placed.filter((p) => p.side === 'left'),
    TOP_LEFT_EXCLUSION.height + EXCLUSION_PAD,
    viewport.height - marginBottom,
  )
  resolveColumn(
    placed.filter((p) => p.side === 'right'),
    TOP_RIGHT_EXCLUSION.height + EXCLUSION_PAD,
    viewport.height - marginBottom,
  )

  return placed
}

function resolveColumn(
  column: PlacedLabel[],
  columnTop: number,
  columnBottom: number,
) {
  column.sort((a, b) => a.desiredY - b.desiredY)
  for (let i = 1; i < column.length; i++) {
    const prev = column[i - 1]
    const curr = column[i]
    if (curr.y - prev.y < ROW_HEIGHT) curr.y = prev.y + ROW_HEIGHT
  }
  const last = column[column.length - 1]
  if (last && last.y > columnBottom) {
    const shift = last.y - columnBottom
    for (const item of column) {
      item.y = Math.max(columnTop, item.y - shift)
    }
    // Re-sweep downward so rows don't collapse into each other after the shift
    // clamped some of them at the top.
    for (let i = 1; i < column.length; i++) {
      const prev = column[i - 1]
      const curr = column[i]
      if (curr.y - prev.y < ROW_HEIGHT) curr.y = prev.y + ROW_HEIGHT
    }
  }
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}
