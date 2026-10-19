import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { Lights, Rig, SkyGradient, Water } from '../common'
import { CargoShip } from '../models'

function Lighthouse(props: { position: [number, number, number] }) {
  const beam = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (beam.current) beam.current.rotation.y = clock.elapsedTime * 0.8
  })
  return (
    <group {...props}>
      <mesh position={[0, 0.3, 0]} scale={[2.6, 1, 2.2]} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#5b5550" flatShading />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 1.4 + i * 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.42 - i * 0.05, 0.47 - i * 0.05, 0.7, 12]} />
          <meshStandardMaterial color={i % 2 ? '#d6452b' : '#f3f1ec'} flatShading />
        </mesh>
      ))}
      <mesh position={[0, 4.15, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.4, 12]} />
        <meshStandardMaterial color="#fff3c4" emissive="#ffd27a" emissiveIntensity={3} />
      </mesh>
      <mesh position={[0, 4.55, 0]} castShadow>
        <coneGeometry args={[0.38, 0.45, 12]} />
        <meshStandardMaterial color="#2b2f36" />
      </mesh>
      <group ref={beam} position={[0, 4.15, 0]}>
        <mesh position={[3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.6, 6, 16, 1, true]} />
          <meshBasicMaterial color="#ffe3a3" transparent opacity={0.18} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <pointLight position={[0, 4.2, 0]} intensity={8} distance={10} color="#ffd27a" />
    </group>
  )
}

function Bobbing() {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (!ref.current) return
    ref.current.position.set(Math.sin(t * 0.15) * 1.5, Math.sin(t * 1.2) * 0.08, 0)
    ref.current.rotation.set(Math.sin(t * 1.1) * 0.04, -0.5, Math.cos(t * 0.9) * 0.03)
  })
  return (
    <group ref={ref}>
      <CargoShip scale={1.1} seed={23} />
    </group>
  )
}

export default function FinaleScene() {
  return (
    <>
      <SkyGradient top="#2b3a67" bottom="#ff9b62" offset={-0.02} />
      <fog attach="fog" args={['#f59a6b', 18, 60]} />
      <Lights sun={[-10, 6, -20]} intensity={2.4} color="#ffb27a" sky="#ffc8a0" ground="#2b3a67" hemi={0.8} size={20} />
      <mesh position={[-6, 3.5, -45]}>
        <circleGeometry args={[5, 48]} />
        <meshBasicMaterial color="#ffd7a1" toneMapped={false} fog={false} />
      </mesh>
      <Water size={[90, 90]} position={[0, 0, 0]} color="#3c5f8f" amplitude={0.14} segments={70} opacity={1} />
      <Bobbing />
      <Lighthouse position={[7, 0, -6]} />
      <Sparkles count={50} scale={[20, 6, 20]} position={[0, 3, 0]} size={2} speed={0.2} color="#ffe2c2" opacity={0.7} />
      <Rig position={[6, 3.5, 10]} target={[0, 1, 0]} minDistance={5} maxDistance={30} autoRotate shift={0.16} />
    </>
  )
}
