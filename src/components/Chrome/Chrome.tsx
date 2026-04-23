import styles from './Chrome.module.css'
import { mission } from '../../scenes/ArtemisII/data/mission'
import { useMissionState } from '../../hooks/useMissionState'
import { useMissionStore } from '../../store/missionStore'
import { useTweenedNumber } from '../../hooks/useTweenedNumber'
import { ThemeSwitcher } from './ThemeSwitcher'

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

function formatHeight(meters: number): string {
  // Compact: always rounded whole metres for the dense single-line layout.
  if (!Number.isFinite(meters)) return '—'
  return `${Math.round(meters)}m`
}

function formatThrust(mn: number): string {
  // Mirror the display logic from computeStats but tweenable against a
  // numeric source: MN when ≥1, kN when below, em-dash when zero.
  if (!Number.isFinite(mn) || mn <= 0) return '—'
  if (mn >= 1) return `${mn.toFixed(1)}MN`
  return `${Math.round(mn * 1000)}kN`
}

// Parse the numeric MN value from the thrust display so we can tween it
// even though useMissionState only surfaces the pre-formatted string.
// "39.1 MN" → 39.1, "110 kN" → 0.11, "—" → 0.
function parseThrustMN(display: string): number {
  const n = parseFloat(display)
  if (!Number.isFinite(n)) return 0
  if (/kN/i.test(display)) return n / 1000
  return n
}

export function Chrome() {
  const { stats } = useMissionState()
  const autoRotate = useMissionStore((s) => s.autoRotate)
  const showLabels = useMissionStore((s) => s.showLabels)
  const toggleAutoRotate = useMissionStore((s) => s.toggleAutoRotate)
  const toggleLabels = useMissionStore((s) => s.toggleLabels)
  const reset = useMissionStore((s) => s.reset)

  // Tween the spec numbers so step-changes (SRB SEP / MECO / ICPS SEP / CM-SM
  // SEP) read as a visible count-down rather than a jump cut. HEIGHT rarely
  // changes but follows the same path for consistency; CREW is static.
  const tweenedHeight = useTweenedNumber(stats.heightMeters)
  const tweenedMass = useTweenedNumber(stats.massTonnes)
  const tweenedThrust = useTweenedNumber(parseThrustMN(stats.thrustDisplay))

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
        <ThemeSwitcher />
      </div>

      <div className={styles.right}>
        <div className={styles.specs}>
          <Spec label="HEIGHT" value={formatHeight(tweenedHeight)} />
          <Spec label="MASS" value={formatMass(tweenedMass)} />
          <Spec label="THRUST" value={formatThrust(tweenedThrust)} />
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
          <button type="button" onClick={reset} className={styles.hudBtn}>
            RESET
          </button>
        </div>
      </div>
    </div>
  )
}
