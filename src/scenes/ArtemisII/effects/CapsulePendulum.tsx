import type { ReactNode } from 'react'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Wraps the crew module with a small sin-driven roll/pitch so the capsule
// appears to pendulum beneath the parachutes during descent. The sway
// frequency/amplitude matches Parachutes.tsx so both swing in sync.

type CapsulePendulumProps = {
  /** Parachute deployment 0..1 — drives sway amplitude. */
  intensity: number
  /** World-local Y at which the pivot sits (top of capsule, riser attach). */
  pivotY: number
  children: ReactNode
}

export function CapsulePendulum({ intensity, pivotY, children }: CapsulePendulumProps) {
  const outerRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const g = outerRef.current
    if (!g) return
    if (intensity <= 0.01) {
      g.rotation.x = 0
      g.rotation.z = 0
      return
    }
    // Match Parachutes.tsx frequencies so cluster and capsule swing together.
    const swayAmt = intensity * 0.05
    g.rotation.z = Math.sin(clock.elapsedTime * 0.8) * swayAmt
    g.rotation.x = Math.sin(clock.elapsedTime * 0.65 + 1.2) * swayAmt * 0.7
  })

  return (
    <group position={[0, pivotY, 0]} ref={outerRef}>
      <group position={[0, -pivotY, 0]}>{children}</group>
    </group>
  )
}
