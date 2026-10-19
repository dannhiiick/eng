import { useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, RoundedBox, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { Label, Rig } from '../common'
import { CargoShip, Pagoda, Pyramid } from '../models'

export type Metric = 'length' | 'age'

const YEAR = new Date().getFullYear()

export const CANALS = [
  { name: 'Panama', length: 82, opened: 1914, color: '#3fa9f5' },
  { name: 'Suez', length: 193, opened: 1869, color: '#f2b134' },
  { name: 'Grand Canal', length: 1776, opened: -486, color: '#ff6a1a' },
] as const

export const valueOf = (c: (typeof CANALS)[number], m: Metric) => (m === 'length' ? c.length : YEAR - c.opened)

function Bar({
  x,
  value,
  max,
  color,
  unit,
  children,
}: {
  x: number
  value: number
  max: number
  color: string
  unit: string
  children: ReactNode
}) {
  const bar = useRef<THREE.Group>(null)
  const top = useRef<THREE.Group>(null)
  const height = 0.3 + (value / max) * 5.6
  useFrame((_, dt) => {
    if (!bar.current || !top.current) return
    const h = THREE.MathUtils.damp(bar.current.scale.y, height, 3, dt)
    bar.current.scale.y = h
    top.current.position.y = h + 0.15
  })
  return (
    <group position={[x, 0.15, 0]}>
      <group ref={bar} scale={[1, 0.01, 1]}>
        <RoundedBox args={[1.5, 1, 1.5]} radius={0.06} position={[0, 0.5, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.15} />
        </RoundedBox>
      </group>
      <group ref={top}>
        {children}
        <Html position={[0, 1.6, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap text-center font-display text-lg font-bold text-white drop-shadow">
            {value.toLocaleString('en-US')}
            <span className="ml-1 text-xs font-semibold text-white/60">{unit}</span>
          </div>
        </Html>
      </group>
    </group>
  )
}

export default function CompareScene({ metric }: { metric: Metric }) {
  const values = CANALS.map((c) => valueOf(c, metric))
  const max = Math.max(...values)
  const unit = metric === 'length' ? 'km' : 'years'
  const xs = [-3.3, 0, 3.3]
  return (
    <>
      <color attach="background" args={['#0a1020']} />
      <fog attach="fog" args={['#0a1020', 18, 40]} />
      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#9fb8ff', '#1a1020', 0.6]} />
      <directionalLight position={[6, 12, 8]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-6, 4, 4]} intensity={40} color="#ff6a1a" />
      <Sparkles count={80} scale={[16, 8, 10]} position={[0, 4, 0]} size={2.5} speed={0.3} color="#ffb38a" opacity={0.6} />
      <mesh position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[7.5, 7.8, 0.3, 64]} />
        <meshStandardMaterial color="#121b30" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7.2, 7.35, 96]} />
        <meshBasicMaterial color="#ff6a1a" toneMapped={false} />
      </mesh>
      <Bar x={xs[0]} value={values[0]} max={max} color={CANALS[0].color} unit={unit}>
        <CargoShip scale={0.32} rotation={[0, 0.5, 0]} position={[0, 0.1, 0]} />
      </Bar>
      <Bar x={xs[1]} value={values[1]} max={max} color={CANALS[1].color} unit={unit}>
        <Pyramid size={1.1} />
      </Bar>
      <Bar x={xs[2]} value={values[2]} max={max} color={CANALS[2].color} unit={unit}>
        <Pagoda scale={0.32} />
      </Bar>
      {CANALS.map((c, i) => (
        <Label key={c.name} position={[xs[i], -0.25, 1.6]} tone={i === 2 ? 'accent' : 'dark'}>
          {c.name}
        </Label>
      ))}
      <Rig position={[2, 5.5, 13]} target={[0, 2.6, 0]} minDistance={7} maxDistance={26} shift={0.15} />
    </>
  )
}
