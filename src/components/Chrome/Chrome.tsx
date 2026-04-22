import type { ReactNode } from 'react'
import styles from './Chrome.module.css'
import { mission } from '../../scenes/ArtemisII/data/mission'
import { useMissionState } from '../../hooks/useMissionState'
import { useMissionStore } from '../../store/missionStore'

type SpecRowProps = {
  label: string
  value: string
  accent?: boolean
}

function SpecRow({ label, value, accent }: SpecRowProps) {
  return (
    <div className={styles.specRow}>
      <span className={styles.specKey}>{label}</span>
      <span className={accent ? `${styles.specValue} ${styles.specValueAccent}` : styles.specValue}>
        {value}
      </span>
    </div>
  )
}

type HudButtonProps = {
  children: ReactNode
  active?: boolean
  onClick?: () => void
}

function HudButton({ children, active, onClick }: HudButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? `${styles.btn} ${styles.btnActive}` : styles.btn}
    >
      {children}
    </button>
  )
}

function formatMass(tonnes: number): string {
  if (tonnes >= 100) return `${Math.round(tonnes).toLocaleString()} t`
  return `${tonnes.toFixed(1)} t`
}

export function Chrome() {
  const { stats } = useMissionState()
  const autoRotate = useMissionStore((s) => s.autoRotate)
  const showLabels = useMissionStore((s) => s.showLabels)
  const toggleAutoRotate = useMissionStore((s) => s.toggleAutoRotate)
  const toggleLabels = useMissionStore((s) => s.toggleLabels)
  const reset = useMissionStore((s) => s.reset)

  return (
    <div className={styles.top}>
      <div className={styles.title}>
        <div className={styles.name}>{mission.name}</div>
        <div className={styles.subtitle}>{mission.subtitle}</div>
        <div className={styles.subtitle}>{mission.subtitle2}</div>
      </div>

      <div className={styles.buttons}>
        <HudButton active={autoRotate} onClick={toggleAutoRotate}>
          AUTO-ROTATE
        </HudButton>
        <HudButton active={showLabels} onClick={toggleLabels}>
          LABELS
        </HudButton>
        <HudButton onClick={reset}>RESET</HudButton>
      </div>

      <div className={styles.specs}>
        <SpecRow label="HEIGHT" value={mission.height} />
        <SpecRow label="MASS" value={formatMass(stats.massTonnes)} />
        <SpecRow label="THRUST" value={stats.thrustDisplay} />
        <SpecRow label="CREW" value="4 ABOARD" />
      </div>
    </div>
  )
}
