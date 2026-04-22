import type { ReactNode } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { useMissionStore } from '../../store/missionStore'

type Collider = { radius: number; height: number; y: number }

type Vec3 = [number, number, number]

type ClickableModuleProps = {
  id: string
  collider: Collider
  children: ReactNode
  position?: Vec3
  visible?: boolean
}

export function ClickableModule({
  id,
  collider,
  children,
  position,
  visible,
}: ClickableModuleProps) {
  const setActive = useMissionStore((s) => s.setActiveComponent)

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    setActive(id)
  }

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
  }

  const handleOut = () => {
    document.body.style.cursor = 'auto'
  }

  return (
    <group position={position} visible={visible}>
      {children}
      <mesh
        position={[0, collider.y, 0]}
        onClick={handleClick}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
      >
        <cylinderGeometry
          args={[collider.radius, collider.radius, collider.height, 16]}
        />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}
