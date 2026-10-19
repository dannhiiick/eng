import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Label, Lights, Rig, SkyGradient, Water, rng, type Vec3 } from '../common'
import { CargoShip, Palm, Pyramid } from '../models'

const smooth = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

function dune(x: number, z: number) {
  const base =
    0.9 +
    0.55 * Math.sin(x * 0.22 + z * 0.15) +
    0.35 * Math.sin(z * 0.42 - x * 0.1) +
    0.2 * Math.sin(x * 0.7) * Math.cos(z * 0.6)
  const d = Math.abs(z)
  return THREE.MathUtils.lerp(-0.7, base * (0.35 + smooth(3, 12, d) * 0.9), smooth(1.7, 3, d))
}

function Desert() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(90, 60, 150, 100)
    g.rotateX(-Math.PI / 2)
    const pos = g.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) pos.setY(i, dune(pos.getX(i), pos.getZ(i)))
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <mesh geometry={geo} receiveShadow castShadow>
      <meshStandardMaterial color="#e2bf86" flatShading roughness={1} />
    </mesh>
  )
}

const CONVOY = [
  { offset: 0, seed: 2, hull: '#1d2b45' },
  { offset: 9, seed: 13, hull: '#2d3a2f' },
  { offset: 18, seed: 31, hull: '#3b2430' },
  { offset: 27, seed: 8, hull: '#1d2b45' },
  { offset: 36, seed: 19, hull: '#24324a' },
]

function Convoy() {
  const refs = useRef<(THREE.Group | null)[]>([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    CONVOY.forEach((c, i) => {
      const g = refs.current[i]
      if (!g) return
      const x = ((t * 1.3 + c.offset) % 45) - 22.5
      g.position.set(x, Math.sin(t * 1.8 + i) * 0.02, 0)
      const edge = Math.min(1, (22.5 - Math.abs(x)) / 2)
      g.scale.setScalar(0.62 * Math.max(0.001, edge))
    })
  })
  return (
    <>
      {CONVOY.map((c, i) => (
        <CargoShip key={i} ref={(el) => void (refs.current[i] = el)} seed={c.seed} hull={c.hull} />
      ))}
    </>
  )
}

export default function SuezScene() {
  const palms = useMemo(() => {
    const r = rng(17)
    const list: { p: Vec3; s: number }[] = []
    for (let i = 0; i < 26; i++) {
      const x = -20 + r() * 40
      const z = (r() > 0.5 ? 1 : -1) * (3.3 + r() * 2.5)
      list.push({ p: [x, dune(x, z) - 0.05, z], s: 0.8 + r() * 0.5 })
    }
    return list
  }, [])
  return (
    <>
      <SkyGradient top="#6fa6d6" bottom="#f6dcb0" offset={0.05} />
      <fog attach="fog" args={['#f1d9b0', 24, 62]} />
      <Lights sun={[-14, 16, -6]} intensity={2.6} color="#ffe2b8" sky="#ffeedd" ground="#c08a4b" size={26} />
      <mesh position={[-18, 14, -50]}>
        <sphereGeometry args={[3.2, 24, 16]} />
        <meshBasicMaterial color="#fff1cf" toneMapped={false} fog={false} />
      </mesh>
      <Desert />
      <Water size={[90, 4]} position={[0, 0, 0]} color="#1f7fa6" amplitude={0.025} segments={90} />
      <Convoy />
      <Pyramid size={5} position={[-8, dune(-8, -16) - 0.4, -16]} />
      <Pyramid size={3.6} position={[-2, dune(-2, -19) - 0.4, -19]} />
      <Pyramid size={2.4} position={[-12.5, dune(-12.5, -12) - 0.3, -12]} />
      {palms.map((p, i) => (
        <Palm key={i} position={p.p} scale={p.s} rotation={[0, i * 1.7, 0]} />
      ))}
      <Label position={[-19, 1.5, 0]} tone="light">MEDITERRANEAN SEA ←</Label>
      <Label position={[19, 1.5, 0]} tone="light">→ RED SEA</Label>
      <Label position={[2, 2.2, 1]}>No locks · sea level</Label>
      <Rig position={[-13, 7.5, 12]} target={[0, 0.5, 0]} minDistance={7} maxDistance={40} shift={0.16} />
    </>
  )
}
