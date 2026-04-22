import styles from './InfoPanel.module.css'
import type { RocketComponent } from '../../scenes/ArtemisII/data/components'

type InfoPanelProps = {
  part: RocketComponent
}

export function InfoPanel({ part }: InfoPanelProps) {
  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.short}>COMPONENT · {part.id.toUpperCase()}</div>
        <button type="button" className={styles.close} aria-label="Close panel">
          ×
        </button>
      </div>
      <div className={styles.name}>{part.label}</div>
    </aside>
  )
}
