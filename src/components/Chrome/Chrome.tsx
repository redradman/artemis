import styles from './Chrome.module.css'
import { mission } from '../../scenes/ArtemisII/data/mission'
import { useMissionState } from '../../hooks/useMissionState'
import { useMissionStore } from '../../store/missionStore'

type SpecProps = {
  label: string
  value: string
}

function Spec({ label, value }: SpecProps) {
  return (
    <span className={styles.spec}>
      <span className={styles.specKey}>{label}</span>
      <span className={styles.specValue}>{value}</span>
    </span>
  )
}

function formatMass(tonnes: number): string {
  if (tonnes >= 100) return `${Math.round(tonnes).toLocaleString()}t`
  return `${tonnes.toFixed(1)}t`
}

function formatHeight(display: string): string {
  // "98.1 m" → "98m" for compactness in the dense single-line layout.
  const n = parseFloat(display)
  if (Number.isFinite(n)) return `${Math.round(n)}m`
  return display
}

function formatThrust(display: string): string {
  // "39.1 MN" → "39MN"
  return display.replace(/\s+/g, '').replace('MN', 'MN')
}

export function Chrome() {
  const { stats } = useMissionState()
  const autoRotate = useMissionStore((s) => s.autoRotate)
  const showLabels = useMissionStore((s) => s.showLabels)
  const renderMode = useMissionStore((s) => s.renderMode)
  const toggleAutoRotate = useMissionStore((s) => s.toggleAutoRotate)
  const toggleLabels = useMissionStore((s) => s.toggleLabels)
  const toggleRenderMode = useMissionStore((s) => s.toggleRenderMode)
  const reset = useMissionStore((s) => s.reset)
  const cinematic = renderMode === 'cinematic'

  return (
    <div className={styles.top}>
      <div className={styles.brand}>
        <div className={styles.name}>
          {mission.name}
          <span className={styles.nameRule} aria-hidden="true" />
        </div>
        <div className={styles.credit}>
          <span className={styles.creditSource}>
            SOURCE MATERIAL <span className={styles.creditNasa}>NASA</span>
          </span>
          <span className={styles.creditDot} aria-hidden="true">·</span>
          <a
            className={styles.creditLink}
            href="https://radman.dev"
            target="_blank"
            rel="noreferrer noopener"
          >
            DESIGNED BY <span className={styles.creditName}>RADMAN</span>
          </a>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.specs}>
          <Spec label="HEIGHT" value={formatHeight(stats.heightDisplay)} />
          <Spec label="MASS" value={formatMass(stats.massTonnes)} />
          <Spec label="THRUST" value={formatThrust(stats.thrustDisplay)} />
          <Spec label="CREW" value="4" />
        </div>

        <div className={styles.hud}>
          <button
            type="button"
            onClick={toggleAutoRotate}
            className={
              autoRotate ? `${styles.hudBtn} ${styles.hudBtnActive}` : styles.hudBtn
            }
            aria-pressed={autoRotate}
          >
            AUTO-ROTATE
          </button>
          <button
            type="button"
            onClick={toggleLabels}
            className={
              showLabels ? `${styles.hudBtn} ${styles.hudBtnActive}` : styles.hudBtn
            }
            aria-pressed={showLabels}
          >
            LABELS
          </button>
          <button
            type="button"
            onClick={toggleRenderMode}
            className={
              cinematic ? `${styles.hudBtn} ${styles.hudBtnActive}` : styles.hudBtn
            }
            aria-pressed={cinematic}
            title="Toggle between schematic-hybrid and cinematic VFX modes"
          >
            {cinematic ? 'CINEMATIC' : 'HYBRID'}
          </button>
          <button type="button" onClick={reset} className={styles.hudBtn}>
            RESET
          </button>
        </div>
      </div>
    </div>
  )
}
