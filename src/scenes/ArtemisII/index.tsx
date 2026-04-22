import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Rocket } from './Rocket'

export function ArtemisIIScene() {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      camera={{
        fov: 28,
        near: 0.1,
        far: 2000,
        position: [117.56, 1.5, 161.8],
      }}
    >
      <fog attach="fog" args={[0x000000, 80, 260]} />
      <ambientLight intensity={1} />
      <Rocket />
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={15}
        maxDistance={400}
        target={[0, 1.5, 0]}
      />
    </Canvas>
  )
}
