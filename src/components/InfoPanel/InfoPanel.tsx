import { useState } from 'react'
import styles from './InfoPanel.module.css'
import { useMissionStore } from '../../store/missionStore'
import {
  components,
  type RocketComponent,
} from '../../scenes/ArtemisII/data/components'

/**
 * Split the first sentence off a purpose paragraph so we can render it as an
 * accent pull-quote above the body prose. Falls back to the whole string as
 * the lede when no sentence break is found.
 */
function splitPurpose(text: string): { lede: string; body: string | null } {
  const match = text.match(/^(.+?[.!?])(\s+)(.+)$/s)
  if (match) {
    return { lede: match[1], body: match[3] }
  }
  return { lede: text, body: null }
}

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

  const purpose = displayed ? splitPurpose(displayed.info.purpose) : null

  return (
    <aside
      className={isOpen ? `${styles.panel} ${styles.open}` : styles.panel}
      aria-hidden={!isOpen}
      aria-labelledby={displayed ? `info-panel-${displayed.id}` : undefined}
    >
      {displayed && (
        <>
          <div className={styles.header}>
            <div className={styles.kicker}>{displayed.kicker}</div>
            <button
              type="button"
              className={styles.close}
              aria-label="Close panel"
              onClick={() => clear(null)}
            >
              ×
            </button>
          </div>
          <h2 id={`info-panel-${displayed.id}`} className={styles.name}>
            {displayed.label}
          </h2>
          {purpose && (
            <blockquote className={styles.lede}>{purpose.lede}</blockquote>
          )}
          {purpose?.body && <p className={styles.body}>{purpose.body}</p>}
          {specs.length > 0 && (
            <dl className={styles.rows}>
              {specs.map(([k, v]) => (
                <div key={k} className={styles.row}>
                  <dt className={styles.rowKey}>{k}</dt>
                  <dd className={styles.rowValue}>{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {displayed.info.notes && (
            <p className={styles.notes}>{displayed.info.notes}</p>
          )}
        </>
      )}
    </aside>
  )
}
