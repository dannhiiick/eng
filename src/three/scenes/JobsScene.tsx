import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Label, Lights, Rig, SkyGradient, Water, rng, type Vec3 } from '../common'
import { DumpTruck, Excavator, TowerCrane, Tree, Worker } from '../models'

const DIRT = '#b98a5a'

function Truck({ center, a, b, speed, phase }: { center: Vec3; a: number; b: number; speed: number; phase: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const th = clock.elapsedTime * speed + phase
    const dx = -a * Math.sin(th)
    const dz = b * Math.cos(th)
    if (ref.current) {
      ref.current.position.set(center[0] + a * Math.cos(th), center[1], center[2] + b * Math.sin(th))
      ref.current.rotation.y = Math.atan2(-dz, dx)
    }
  })
  return <DumpTruck ref={ref} scale={0.9} />
}

const WORKERS: { p: Vec3; vest: string; walk?: number }[] = [
  { p: [-1, 0, 3.2], vest: '#ff6a1a' },
  { p: [0.2, 0, 4.4], vest: '#c6e33a', walk: 1.5 },
  { p: [-6.5, -1.2, 0.6], vest: '#ff6a1a' },
  { p: [-5.6, -1.2, -0.8], vest: '#c6e33a', walk: 1 },
  { p: [-3, 0, -3.6], vest: '#ff6a1a', walk: 2 },
  { p: [5.5, 0, -3.5], vest: '#ffffff' },
  { p: [8, 0, 3.4], vest: '#c6e33a' },
]

function Workers() {
  const refs = useRef<(THREE.Group | null)[]>([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    WORKERS.forEach((w, i) => {
      const g = refs.current[i]
      if (!g) return
      const walk = w.walk ?? 0
      const x = w.p[0] + Math.sin(t * 0.5 + i) * walk
      g.position.set(x, w.p[1] + Math.abs(Math.sin(t * (walk ? 5 : 2) + i)) * 0.05, w.p[2])
      g.rotation.y = walk ? (Math.cos(t * 0.5 + i) > 0 ? 0 : Math.PI) + Math.PI / 2 : i
    })
  })
  return (
    <>
      {WORKERS.map((w, i) => (
        <Worker key={i} ref={(el) => void (refs.current[i] = el)} vest={w.vest} scale={0.9} />
      ))}
    </>
  )
}

export default function JobsScene() {
  const props = useMemo(() => {
    const r = rng(77)
    const cones: Vec3[] = []
    for (let x = -1; x <= 10; x += 1.6) cones.push([x, 0, 2.3 + (r() - 0.5) * 0.1])
    const trees: { p: Vec3; s: number }[] = []
    for (let i = 0; i < 24; i++) trees.push({ p: [-16 + r() * 32, 0, -9 - r() * 8], s: 0.9 + r() * 0.8 })
    return { cones, trees }
  }, [])

  return (
    <>
      <SkyGradient top="#7fb0dc" bottom="#f3e6cf" />
      <fog attach="fog" args={['#efe2cb', 26, 60]} />
      <Lights sun={[10, 18, 10]} size={22} />
      {/* ground on both sides of the trench */}
      {[1, -1].map((side) => (
        <mesh key={side} position={[0, -0.75, side * 11]} receiveShadow>
          <boxGeometry args={[50, 1.5, 18]} />
          <meshStandardMaterial color={side > 0 ? '#c9a46e' : '#a9b37a'} flatShading />
        </mesh>
      ))}
      <mesh position={[18, -0.75, 0]} receiveShadow>
        <boxGeometry args={[14, 1.5, 4]} />
        <meshStandardMaterial color="#c9a46e" flatShading />
      </mesh>
      {/* trench */}
      <mesh position={[-4, -1.35, 0]} receiveShadow>
        <boxGeometry args={[42, 0.3, 4]} />
        <meshStandardMaterial color={DIRT} flatShading />
      </mesh>
      <Water size={[20, 4]} position={[-15, -0.75, 0]} color="#3d8fb0" amplitude={0.02} />
      <mesh position={[-5, -0.95, 0]} rotation={[0, 0, 0.25]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.6, 3.9]} />
        <meshStandardMaterial color="#a77b4e" flatShading />
      </mesh>
      {/* dirt piles */}
      {[
        [6, 0, 9.6, 1.4],
        [9.8, 0, 9, 1],
        [2.8, 0, 9.2, 0.8],
      ].map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y + s * 0.45, z]} castShadow receiveShadow>
          <coneGeometry args={[s * 1.4, s * 0.9, 7]} />
          <meshStandardMaterial color={DIRT} flatShading />
        </mesh>
      ))}
      {/* site cabins */}
      {[
        [-9, '#2f6fd6'],
        [-6.6, '#f3f1ec'],
      ].map(([x, c], i) => (
        <group key={i} position={[x as number, 0, 6]}>
          <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.2, 1.1, 1.3]} />
            <meshStandardMaterial color={c as string} flatShading />
          </mesh>
          <mesh position={[0, 0.65, 0.66]}>
            <planeGeometry args={[1.2, 0.35]} />
            <meshStandardMaterial color="#1b2633" />
          </mesh>
        </group>
      ))}
      {props.cones.map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <coneGeometry args={[0.13, 0.4, 8]} />
            <meshStandardMaterial color="#ff6a1a" />
          </mesh>
        </group>
      ))}
      {props.trees.map((t, i) => (
        <Tree key={i} position={t.p} scale={t.s} />
      ))}
      <Excavator position={[2.5, 0, 3.4]} rotation={[0, Math.PI / 2, 0]} />
      <TowerCrane position={[-3, 0, -4.5]} />
      <Truck center={[6, 0, 5.2]} a={3.6} b={1.6} speed={0.35} phase={0} />
      <Truck center={[6, 0, 5.2]} a={3.6} b={1.6} speed={0.35} phase={Math.PI} />
      <Workers />
      <Label position={[-3, 10.2, -4.5]}>Crane operator</Label>
      <Label position={[2.5, 3.2, 3.4]}>Machine operator</Label>
      <Label position={[-6, 0.6, 0]}>Construction workers</Label>
      <Label position={[-7.8, 1.8, 6]}>Engineers' office</Label>
      <Rig position={[13, 9, 14]} target={[0, 1.5, 0]} minDistance={8} maxDistance={40} shift={0.16} />
    </>
  )
}
