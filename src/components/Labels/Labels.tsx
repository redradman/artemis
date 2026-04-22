import { useMemo } from 'react'
import { useProjectionStore } from '../../hooks/useProjectedPoints'
import { components } from '../../scenes/ArtemisII/data/components'
import type { RocketComponent } from '../../scenes/ArtemisII/data/components'
import styles from './Labels.module.css'

const MARGIN_X = 170
const MARGIN_TOP = 70
const MARGIN_BOTTOM = 220
const ROW_HEIGHT = 22
const TICK_HALF = 4
const TEXT_OFFSET = 10
const HIT_PADDING_X = 14
const APPROX_CHAR_WIDTH = 7.5

type PlacedLabel = {
  id: string
  label: string
  anchor: { x: number; y: number }
  side: 'left' | 'right'
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

  const placed = useMemo(
    () => layoutLabels(components, projections, visibility, viewport),
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
    >
      {placed.map((p) => {
        const isRight = p.side === 'right'
        const tickX = isRight ? viewport.width - MARGIN_X : MARGIN_X
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
              x1={tickX}
              y1={p.y}
              x2={p.anchor.x}
              y2={p.anchor.y}
            />
            <line
              className={styles.tick}
              x1={tickX}
              y1={p.y - TICK_HALF}
              x2={tickX}
              y2={p.y + TICK_HALF}
            />
            <line
              className={styles.leader}
              x1={tickX}
              y1={p.y}
              x2={isRight ? tickX + TEXT_OFFSET - 2 : tickX - TEXT_OFFSET + 2}
              y2={p.y}
            />
            <circle
              className={styles.dot}
              cx={p.anchor.x}
              cy={p.anchor.y}
              r={1.8}
            />
            <text
              className={styles.text}
              x={textX}
              y={p.y + 3.5}
              textAnchor={textAnchor}
            >
              {p.label}
            </text>
            <line
              className={styles.leaderHit}
              x1={tickX}
              y1={p.y}
              x2={p.anchor.x}
              y2={p.anchor.y}
            />
            <circle
              className={styles.dotHit}
              cx={p.anchor.x}
              cy={p.anchor.y}
              r={9}
            />
            <rect
              className={styles.hit}
              x={hitX}
              y={p.y - 10}
              width={hitW}
              height={20}
            />
          </g>
        )
      })}
    </svg>
  )
}

function layoutLabels(
  items: RocketComponent[],
  projections: Record<string, { x: number; y: number; onScreen: boolean }>,
  visibility: Record<string, boolean> | undefined,
  viewport: { width: number; height: number },
): PlacedLabel[] {
  if (viewport.width === 0 || viewport.height === 0) return []

  const placed: PlacedLabel[] = []
  for (const c of items) {
    const proj = projections[c.id]
    if (!proj || !proj.onScreen) continue

    const desiredY = clamp(
      proj.y + c.offset.y,
      MARGIN_TOP,
      viewport.height - MARGIN_BOTTOM,
    )
    placed.push({
      id: c.id,
      label: c.label,
      anchor: { x: proj.x, y: proj.y },
      side: c.side,
      desiredY,
      y: desiredY,
      visible: visibility ? (visibility[c.id] ?? true) : true,
    })
  }

  resolveColumn(
    placed.filter((p) => p.side === 'left'),
    viewport.height,
  )
  resolveColumn(
    placed.filter((p) => p.side === 'right'),
    viewport.height,
  )

  return placed
}

function resolveColumn(column: PlacedLabel[], height: number) {
  column.sort((a, b) => a.desiredY - b.desiredY)
  for (let i = 1; i < column.length; i++) {
    const prev = column[i - 1]
    const curr = column[i]
    if (curr.y - prev.y < ROW_HEIGHT) curr.y = prev.y + ROW_HEIGHT
  }
  const last = column[column.length - 1]
  if (last && last.y > height - MARGIN_BOTTOM) {
    const shift = last.y - (height - MARGIN_BOTTOM)
    for (const item of column) item.y -= shift
  }
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}
