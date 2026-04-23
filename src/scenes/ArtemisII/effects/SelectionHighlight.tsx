import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BloomHalo } from './BloomHalo'
import { wireActive } from '../materials'
import { components } from '../data/components'
import type { MissionStageState } from '../lib/stateAt'

// Subtle amber halo + pulsing outline ring that highlights the currently
// focused component (from missionStore.activeComponent). Reads the
// component's focus point and focusRadius from data/components.ts,
// offsets by the part's active stage offset so it rides along when the
// stage is jettisoning, and overlays two amber cues: a wide soft glow
// halo to draw the eye, and a line ring at focusRadius to call the
// bounds out.

type SelectionHighlightProps = {
  state: MissionStageState
  activeId: string | null
  cinematic?: boolean
}

function buildCircle(radius: number, segments = 96): THREE.BufferGeometry {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius))
  }
  return new THREE.BufferGeometry().setFromPoints(pts)
}

export function SelectionHighlight({
  state,
  activeId,
  cinematic = false,
}: SelectionHighlightProps) {
  const component = useMemo(
    () => (activeId ? components.find((c) => c.id === activeId) ?? null : null),
    [activeId],
  )

  // All hooks must be called unconditionally — the circle radius falls
  // back to 1 when no component is focused so useMemo signatures stay
  // stable across renders.
  const radius = component ? component.focusRadius * 0.58 : 1
  const circleGeo = useMemo(() => buildCircle(radius), [radius])

  const ringMat = useMemo(() => {
    const m = wireActive.clone()
    m.opacity = 0
    m.transparent = true
    return m
  }, [])

  const ringObj = useMemo(
    () => new THREE.Line(circleGeo, ringMat),
    [circleGeo, ringMat],
  )

  const ringGroupRef = useRef<THREE.Group>(null)
  const groupRef = useRef<THREE.Group>(null)

  /* eslint-disable react-hooks/immutability */
  useFrame(({ clock }) => {
    const g = groupRef.current
    const rg = ringGroupRef.current
    if (!g || !rg) return
    if (!component) {
      g.visible = false
      return
    }
    g.visible = true
    const t = clock.elapsedTime
    const pulse = 0.55 + Math.sin(t * 3.2) * 0.25
    ringMat.opacity = pulse
    rg.rotation.y = t * 0.25
    const breath = 1 + Math.sin(t * 2.1) * 0.03
    rg.scale.set(breath, 1, breath)
  })
  /* eslint-enable react-hooks/immutability */

  if (!component) return null

  const stageOffset = state.stages[component.stage]
  const position: [number, number, number] = [
    component.focus.x + stageOffset.offsetX,
    component.focus.y + stageOffset.offsetY,
    component.focus.z + stageOffset.offsetZ,
  ]

  return (
    <group ref={groupRef} position={position}>
      <BloomHalo
        position={[0, 0, 0]}
        intensity={1}
        baseSize={component.focusRadius * 1.1}
        pulseFreq={2.6}
        cinematic={cinematic}
      />
      <group ref={ringGroupRef}>
        <primitive object={ringObj} rotation={[Math.PI / 2, 0, 0]} />
      </group>
    </group>
  )
}
