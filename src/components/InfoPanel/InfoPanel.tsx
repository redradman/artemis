import styles from './InfoPanel.module.css'
import type { RocketComponent } from '../../scenes/ArtemisII/data/components'

type InfoPanelProps = {
  part: RocketComponent
}

export function InfoPanel({ part }: InfoPanelProps) {
  const entries = Object.entries(part.info).filter(
    ([k, v]) => k !== 'purpose' && k !== 'notes' && v !== undefined,
  ) as Array<[string, string]>

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.short}>COMPONENT · {part.short}</div>
        <button type="button" className={styles.close} aria-label="Close panel">×</button>
      </div>
      <div className={styles.name}>{part.name}</div>
      <p className={styles.purpose}>{part.info.purpose}</p>
      <div className={styles.rows}>
        {entries.map(([k, v]) => (
          <div key={k} className={styles.row}>
            <span className={styles.rowKey}>{k}</span>
            <span className={styles.rowValue}>{v}</span>
          </div>
        ))}
      </div>
      {part.info.notes && <div className={styles.notes}>{part.info.notes}</div>}
    </aside>
  )
}
