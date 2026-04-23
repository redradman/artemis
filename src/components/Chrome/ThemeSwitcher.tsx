import styles from './ThemeSwitcher.module.css'
import { useMissionStore } from '../../store/missionStore'
import type { RenderMode } from '../../store/missionStore'

const THEMES: ReadonlyArray<{ id: RenderMode; label: string; swatch: string }> = [
  { id: 'blueprint', label: 'BLUEPRINT', swatch: '#8fd2ff' },
  { id: 'space', label: 'SPACE', swatch: '#f0ebe0' },
  { id: 'cinematic', label: 'CINEMATIC', swatch: '#e8a23b' },
]

export function ThemeSwitcher() {
  const renderMode = useMissionStore((s) => s.renderMode)
  const setRenderMode = useMissionStore((s) => s.setRenderMode)

  return (
    <div className={styles.wrap}>
      <div className={styles.kicker} aria-hidden="true">
        VIEW
      </div>
      <div
        className={styles.group}
        role="radiogroup"
        aria-label="Visual theme"
      >
        {THEMES.map((t) => {
          const active = renderMode === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={active}
              className={active ? `${styles.pill} ${styles.pillActive}` : styles.pill}
              onClick={() => setRenderMode(t.id)}
            >
              <span
                className={styles.swatch}
                style={{ backgroundColor: t.swatch }}
                aria-hidden="true"
              />
              <span className={styles.label}>{t.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
