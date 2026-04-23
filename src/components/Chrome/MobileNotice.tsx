import { useState } from 'react'
import styles from './MobileNotice.module.css'

const STORAGE_KEY = 'artemis:mobile-notice-dismissed'

// Small, sub-aesthetic advisory that only appears on mobile viewports.
// The diagram is information-dense — labels, timeline, component panels,
// camera controls — and genuinely works best on a larger screen. This
// nudges the user toward desktop without gating access. Dismissal is
// persisted so repeat visits aren't noisy.
export function MobileNotice() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return window.localStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })

  if (dismissed) return null

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* storage unavailable (private browsing, etc.) — session-only dismiss */
    }
    setDismissed(true)
  }

  return (
    <div className={styles.wrap} role="note" aria-label="Mobile viewing notice">
      <span className={styles.eyebrow}>MOBILE VIEW</span>
      <span className={styles.dot} aria-hidden="true">·</span>
      <span className={styles.text}>
        Best experienced on desktop
      </span>
      <button
        type="button"
        className={styles.close}
        onClick={dismiss}
        aria-label="Dismiss notice"
      >
        ×
      </button>
    </div>
  )
}
