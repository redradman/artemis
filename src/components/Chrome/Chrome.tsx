import type { ReactNode } from 'react'
import styles from './Chrome.module.css'
import { mission } from '../../scenes/ArtemisII/data/mission'

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
}

function HudButton({ children, active }: HudButtonProps) {
  return (
    <button type="button" className={active ? `${styles.btn} ${styles.btnActive}` : styles.btn}>
      {children}
    </button>
  )
}

export function Chrome() {
  return (
    <div className={styles.top}>
      <div className={styles.title}>
        <div className={styles.name}>{mission.name}</div>
        <div className={styles.subtitle}>{mission.subtitle}</div>
        <div className={styles.subtitle}>{mission.subtitle2}</div>
      </div>

      <div className={styles.buttons}>
        <HudButton>AUTO-ROTATE</HudButton>
        <HudButton active>LABELS</HudButton>
        <HudButton>RESET</HudButton>
      </div>

      <div className={styles.specs}>
        <SpecRow label="HEIGHT" value={mission.height} />
        <SpecRow label="MASS" value={mission.mass} />
        <SpecRow label="THRUST" value={mission.thrust} />
        <SpecRow label="ALT" value="NaNk km" accent />
        <SpecRow label="VEL" value="NaN km/s" accent />
        <SpecRow label="CREW" value="4 ABOARD" />
      </div>
    </div>
  )
}
