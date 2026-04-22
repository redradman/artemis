import { useState } from 'react'
import styles from './InfoPanel.module.css'
import { useMissionStore } from '../../store/missionStore'
import {
  components,
  type RocketComponent,
} from '../../scenes/ArtemisII/data/components'

export function InfoPanel() {
  const activeId = useMissionStore((s) => s.activeComponent)
  const clear = useMissionStore((s) => s.setActiveComponent)

  const current = activeId ? components.find((c) => c.id === activeId) : null
  const [lastDisplayed, setLastDisplayed] = useState<RocketComponent | null>(
    null,
  )
  if (current && current !== lastDisplayed) {
    setLastDisplayed(current)
  }

  const displayed = current ?? lastDisplayed
  const isOpen = activeId !== null

  const specs = displayed
    ? (Object.entries(displayed.info).filter(
        ([k, v]) => k !== 'purpose' && k !== 'notes' && v !== undefined,
      ) as Array<[string, string]>)
    : []

  return (
    <aside
      className={isOpen ? `${styles.panel} ${styles.open}` : styles.panel}
      aria-hidden={!isOpen}
    >
      {displayed && (
        <>
          <div className={styles.header}>
            <div className={styles.short}>
              {displayed.kicker} · {displayed.short}
            </div>
            <button
              type="button"
              className={styles.close}
              aria-label="Close panel"
              onClick={() => clear(null)}
            >
              ×
            </button>
          </div>
          <div className={styles.name}>{displayed.label}</div>
          <div className={styles.purpose}>{displayed.info.purpose}</div>
          {specs.length > 0 && (
            <div className={styles.rows}>
              {specs.map(([k, v]) => (
                <div key={k} className={styles.row}>
                  <span className={styles.rowKey}>{k}</span>
                  <span className={styles.rowValue}>{v}</span>
                </div>
              ))}
            </div>
          )}
          {displayed.info.notes && (
            <div className={styles.notes}>{displayed.info.notes}</div>
          )}
        </>
      )}
    </aside>
  )
}
