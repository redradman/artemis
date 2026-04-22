import styles from './Labels.module.css'

export type LabelAnchor = {
  id: string
  name: string
  x: number
  y: number
  side: 'left' | 'right'
  active?: boolean
}

type LabelsProps = {
  anchors?: LabelAnchor[]
  width?: number
  visible?: boolean
}

export function Labels({ anchors = [], width = 0, visible = true }: LabelsProps) {
  if (!visible || anchors.length === 0) return <svg className={styles.overlay} aria-hidden="true" />

  return (
    <svg className={styles.overlay} aria-hidden="true">
      {anchors.map((a) => {
        const isRight = a.side === 'right'
        const terminalX = isRight ? width - 175 : 175
        const leaderX = isRight ? width - 160 : 160
        return (
          <g key={a.id}>
            <line
              x1={a.x}
              y1={a.y}
              x2={terminalX}
              y2={a.y}
              className={a.active ? `${styles.leader} ${styles.leaderActive}` : styles.leader}
            />
            <circle cx={a.x} cy={a.y} r={1.8} className={styles.dot} />
            <line
              x1={terminalX}
              y1={a.y - 4}
              x2={terminalX}
              y2={a.y + 4}
              className={a.active ? `${styles.leader} ${styles.leaderActive}` : styles.leader}
            />
            <text
              x={leaderX + (isRight ? 6 : -6)}
              y={a.y + 3}
              textAnchor={isRight ? 'start' : 'end'}
              className={a.active ? `${styles.text} ${styles.textActive}` : styles.text}
            >
              {a.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
