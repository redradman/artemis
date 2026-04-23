import styles from './ZoomControls.module.css'

// Zoom buttons that dispatch window events; ArtemisIIScene listens and
// dollies the OrbitControls camera. Window events avoid threading a ref
// up through React — the scene lives inside a Canvas (its own reconciler)
// so sharing a ref across that boundary is awkward.

function dispatch(direction: 'in' | 'out') {
  window.dispatchEvent(new CustomEvent('artemis:zoom', { detail: { direction } }))
}

export function ZoomControls() {
  return (
    <div className={styles.wrap} aria-label="Zoom controls">
      <button
        type="button"
        className={styles.btn}
        onClick={() => dispatch('in')}
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        type="button"
        className={styles.btn}
        onClick={() => dispatch('out')}
        aria-label="Zoom out"
      >
        −
      </button>
    </div>
  )
}
