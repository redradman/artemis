import { useEffect, useLayoutEffect, useMemo } from 'react'
import styles from './App.module.css'
import { Chrome } from './components/Chrome/Chrome'
import { MobileNotice } from './components/Chrome/MobileNotice'
import { Timeline } from './components/Timeline/Timeline'
import { Labels } from './components/Labels/Labels'
import { InfoPanel } from './components/InfoPanel/InfoPanel'
import { ArtemisIIScene } from './scenes/ArtemisII'
import { useMissionState } from './hooks/useMissionState'
import { useMissionStore } from './store/missionStore'
import { useMissionPlayback } from './hooks/useMissionPlayback'
import { useProjectionStore } from './hooks/useProjectedPoints'
import { components } from './scenes/ArtemisII/data/components'
import { phases } from './scenes/ArtemisII/data/phases'
import { findActivePhaseIndex } from './hooks/useMissionState'
import { applyWirePalette } from './scenes/ArtemisII/materials'

const SCALE_METERS = [0, 25, 50, 75, 100]

// Starfield layout. Rather than a uniform pseudo-random spread (which
// reads as a structured grid), seed a handful of "constellations" — small
// clusters of 3–7 stars with a bright anchor and a few dimmer neighbours —
// and fill the gaps with scattered background stars. Not real
// constellations, just the flavour of them: clustered, uneven, punctuated.
const HYBRID_STAR_COUNT = 110
const CINEMATIC_STAR_COUNT = 380

type Star = {
  id: number
  cx: number
  cy: number
  r: number
  o: number
  tone: 'neutral' | 'warm' | 'cool'
  // ~8% of stars get a slow, randomly-phased twinkle so the cosmos reads
  // as alive without looking disco. `delay` is a per-star animation-delay
  // in seconds, staggered so neighbours don't pulse in unison.
  twinkle?: boolean
  delay?: number
}

function makeRand(seed: number): () => number {
  // Tiny LCG — deterministic, good enough for static star layouts.
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

function pickTone(rand: () => number): Star['tone'] {
  const r = rand()
  if (r < 0.2) return 'warm'
  if (r < 0.38) return 'cool'
  return 'neutral'
}

function generateStars(count: number, seed: number): Star[] {
  const rand = makeRand(seed)
  const stars: Star[] = []
  // Cluster density scales with total — one cluster per ~18 stars.
  const clusterCount = Math.max(7, Math.floor(count / 18))
  type Cluster = { x: number; y: number; spread: number }
  const clusters: Cluster[] = []
  // Distribute cluster centres with a rough blue-noise rejection so two
  // clusters don't land on top of each other.
  let attempts = 0
  while (clusters.length < clusterCount && attempts < clusterCount * 8) {
    attempts++
    const candidate = { x: rand() * 100, y: rand() * 100, spread: 4 + rand() * 5 }
    const tooClose = clusters.some(
      (c) => Math.hypot(c.x - candidate.x, c.y - candidate.y) < 14,
    )
    if (!tooClose) clusters.push(candidate)
  }

  // Anchor star at each cluster — the bright one that gives the cluster
  // its shape. Add 2–6 dimmer companions within `spread` radius.
  for (const c of clusters) {
    const anchorSize = 1.3 + rand() * 0.4
    stars.push({
      id: stars.length,
      cx: c.x,
      cy: c.y,
      r: anchorSize,
      o: 0.75 + rand() * 0.2,
      tone: pickTone(rand),
    })
    const companions = 2 + Math.floor(rand() * 5)
    for (let k = 0; k < companions; k++) {
      const angle = rand() * Math.PI * 2
      const dist = rand() * c.spread
      stars.push({
        id: stars.length,
        cx: Math.max(0, Math.min(100, c.x + Math.cos(angle) * dist)),
        cy: Math.max(0, Math.min(100, c.y + Math.sin(angle) * dist)),
        r: 0.4 + rand() * 0.4,
        o: 0.35 + rand() * 0.45,
        tone: pickTone(rand),
      })
    }
  }

  // Scatter the remainder as isolated background dust stars so the sky
  // isn't only clusters.
  while (stars.length < count) {
    stars.push({
      id: stars.length,
      cx: rand() * 100,
      cy: rand() * 100,
      r: rand() < 0.08 ? 0.9 : 0.4,
      o: 0.18 + rand() * 0.3,
      tone: pickTone(rand),
    })
  }
  // Post-pass: mark ~8% of stars as twinklers with staggered delays so
  // no two pulse in sync. Using the same seeded rand keeps the layout
  // fully deterministic — twinkle positions don't shuffle across reloads.
  for (const s of stars) {
    if (rand() < 0.08) {
      s.twinkle = true
      s.delay = rand() * 6 // seconds, spread across a 6s window
    }
  }
  return stars
}

// Two different seeds so the hybrid and cinematic layouts differ subtly,
// reinforcing the mode change without either feeling empty.
const HYBRID_STARS = generateStars(HYBRID_STAR_COUNT, 0x2026_0a11)
const CINEMATIC_STARS = generateStars(CINEMATIC_STAR_COUNT, 0x5a_11_1d_e5)

function ScaleReference() {
  const projections = useProjectionStore((s) => s.projections)
  const viewport = useProjectionStore((s) => s.viewport)

  if (viewport.width === 0 || viewport.width < 768) return null

  // Pull each metre tick's screen y from the projector. Filter to ticks that
  // are on-screen so close zooms don't render floating labels.
  const ticks = SCALE_METERS.map((m) => {
    const p = projections[`scale:${m}`]
    if (!p || !p.onScreen) return null
    if (p.y < 20 || p.y > viewport.height - 20) return null
    return { m, y: p.y }
  }).filter((t): t is { m: number; y: number } => t !== null)

  if (ticks.length < 2) return null

  const topY = Math.min(...ticks.map((t) => t.y))
  const bottomY = Math.max(...ticks.map((t) => t.y))
  // Column anchor — matches --edge-inset clamp(12, 2vw, 28) in tokens.css.
  const columnX = Math.min(28, Math.max(12, viewport.width * 0.02))

  return (
    <svg
      className={styles.scaleRef}
      aria-hidden="true"
      viewBox={`0 0 ${viewport.width} ${viewport.height}`}
      width={viewport.width}
      height={viewport.height}
    >
      <line
        className={styles.scaleRefLine}
        x1={columnX}
        x2={columnX}
        y1={topY}
        y2={bottomY}
      />
      {ticks.map(({ m, y }) => (
        <g key={m} transform={`translate(${columnX} ${Math.round(y)})`}>
          <line className={styles.scaleRefDash} x1={0} x2={12} y1={0} y2={0} />
          <text className={styles.scaleRefLabel} x={18} y={4}>
            {m.toString().padStart(2, '0')}m
          </text>
        </g>
      ))}
    </svg>
  )
}

function App() {
  useMissionPlayback()

  const { state } = useMissionState()
  const showLabels = useMissionStore((s) => s.showLabels)
  const activeComponent = useMissionStore((s) => s.activeComponent)
  const setActiveComponent = useMissionStore((s) => s.setActiveComponent)
  const setAutoRotate = useMissionStore((s) => s.setAutoRotate)
  const renderMode = useMissionStore((s) => s.renderMode)
  const cinematic = renderMode === 'cinematic'
  const blueprint = renderMode === 'blueprint'
  const stars = cinematic ? CINEMATIC_STARS : HYBRID_STARS

  const visibility = useMemo(() => {
    const map: Record<string, boolean> = {}
    for (const c of components) {
      map[c.id] = state.stages[c.stage].visible
    }
    return map
  }, [state])

  useEffect(() => {
    if (activeComponent) setAutoRotate(false)
  }, [activeComponent, setAutoRotate])

  // Retune shared wire materials when the theme changes. useLayoutEffect
  // so the colour mutation lands before the browser paints the frame.
  useLayoutEffect(() => {
    applyWirePalette(renderMode)
    // Mirror the theme onto <html> so theme-scoped CSS vars (especially
    // --scene-bg) cascade to html/body, which in turn paints iOS Safari's
    // overscroll zone and the strip behind the overlaid address bar.
    document.documentElement.dataset.theme = renderMode
  }, [renderMode])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      if (isTyping) return

      if (e.key === 'Escape') {
        setActiveComponent(null)
        return
      }
      if (e.key === ' ') {
        e.preventDefault()
        useMissionStore.getState().togglePlay()
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault()
        const { currentT, setTime } = useMissionStore.getState()
        const idx = findActivePhaseIndex(currentT)
        const next = e.key === 'ArrowRight' ? idx + 1 : idx - 1
        const target = phases[Math.max(0, Math.min(phases.length - 1, next))]
        setTime(target.t)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setActiveComponent])

  return (
    <main className={styles.root} data-theme={renderMode}>
      <div
        className={`${styles.scene}${blueprint ? ` ${styles.sceneBlueprint}` : ''}`}
        role="img"
        aria-label="Interactive 3D wireframe of the Artemis II launch vehicle: a Space Launch System core stage flanked by twin solid rocket boosters, topped by the Interim Cryogenic Propulsion Stage, the Orion service module with solar arrays, the crew module, and the launch abort system."
      >
        <ArtemisIIScene />
      </div>

      <div className={styles.vignette} />
      {cinematic && <div className={styles.nebula} aria-hidden="true" />}
      {!blueprint && (
      <svg
        className={`${styles.starfield}${cinematic ? ` ${styles.starfieldCinematic}` : ''}`}
        aria-hidden="true"
      >
        {stars.map((s) => {
          const toneClass =
            s.tone === 'warm'
              ? styles.starWarm
              : s.tone === 'cool'
                ? styles.starCool
                : styles.star
          const className = s.twinkle
            ? `${toneClass} ${styles.starTwinkle}`
            : toneClass
          return (
            <circle
              key={s.id}
              cx={`${s.cx}%`}
              cy={`${s.cy}%`}
              r={s.r}
              opacity={s.o}
              className={className}
              style={
                s.twinkle
                  ? { animationDelay: `${s.delay ?? 0}s` }
                  : undefined
              }
            />
          )
        })}
      </svg>
      )}

      <div className={styles.horizon} aria-hidden="true" />

      <ScaleReference />

      <Labels
        visible={showLabels}
        visibility={visibility}
        activeId={activeComponent}
        onLabelClick={setActiveComponent}
      />

      <InfoPanel />

      <Chrome />

      <MobileNotice />

      <Timeline />
    </main>
  )
}

export default App
