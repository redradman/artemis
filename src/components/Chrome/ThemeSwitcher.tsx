import styles from './ThemeSwitcher.module.css'
import { useMissionStore } from '../../store/missionStore'
import type { RenderMode } from '../../store/missionStore'

const THEMES: ReadonlyArray<{ id: RenderMode; label: string }> = [
  { id: 'blueprint', label: 'BLUEPRINT' },
  { id: 'space', label: 'SPACE' },
  { id: 'cinematic', label: 'CINEMATIC' },
]

export function ThemeSwitcher() {
  const renderMode = useMissionStore((s) => s.renderMode)
  const setRenderMode = useMissionStore((s) => s.setRenderMode)

  return (
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
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
