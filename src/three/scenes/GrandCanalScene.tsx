import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Label, Lights, Rig, SkyGradient, Water, rng, type Vec3 } from '../common'
import { ArchBridge, ChineseHouse, Pagoda, Sampan, Tree } from '../models'

const BANK = 0.6
const BRIDGES = [-7, 7]

const BOATS = [
  { z: 0.6, dir: 1, offset: 0, canopy: '#3a2a1e' },
  { z: -0.6, dir: -1, offset: 14, canopy: '#6b2e22' },
  { z: 0.55, dir: 1, offset: 26, canopy: '#2e3b2c' },
  { z: -0.55, dir: -1, offset: 36, canopy: '#3a2a1e' },
]

function Boats() {
  const refs = useRef<(THREE.Group | null)[]>([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    BOATS.forEach((b, i) => {
      const g = refs.current[i]
      if (!g) return
      const x = (((t * 0.9 + b.offset) % 48) - 24) * b.dir
      g.position.set(x, Math.sin(t * 2 + i) * 0.02, b.z)
      g.rotation.set(Math.sin(t * 1.5 + i) * 0.03, b.dir > 0 ? 0 : Math.PI, 0)
      g.scale.setScalar(0.55 * Math.max(0.001, Math.min(1, (24 - Math.abs(x)) / 2)))
    })
  })
  return (
    <>
      {BOATS.map((b, i) => (
        <Sampan key={i} ref={(el) => void (refs.current[i] = el)} canopy={b.canopy} />
      ))}
    </>
  )
}

function Lantern({ position, phase }: { position: Vec3; phase: number }) {
  const ref = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.emissiveIntensity = 1.4 + Math.sin(clock.elapsedTime * 2 + phase) * 0.4
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.9, 5]} />
        <meshStandardMaterial color="#3b2b22" />
      </mesh>
      <mesh position={[0, 0.95, 0]} scale={[1, 1.25, 1]}>
        <sphereGeometry args={[0.13, 10, 8]} />
        <meshStandardMaterial ref={ref} color="#e0402b" emissive="#ff4a2a" emissiveIntensity={1.4} />
      </mesh>
    </group>
  )
}

export default function GrandCanalScene() {
  const { houses, trees, lanterns } = useMemo(() => {
    const r = rng(42)
    const h: { p: Vec3; w: number; d: number; h: number; ry: number }[] = []
    for (const side of [1, -1]) {
      for (let row = 0; row < 3; row++) {
        let x = -22 + r() * 1.5
        while (x < 22) {
          const w = 1.4 + r() * 1.2
          const nearBridge = BRIDGES.some((b) => Math.abs(x + w / 2 - b) < 1.8)
          if (!(row === 0 && nearBridge)) {
            h.push({
              p: [x + w / 2, BANK, side * (2.8 + row * 2.4 + r() * 0.3)],
              w,
              d: 1.3 + r() * 0.3,
              h: 0.9 + r() * (row === 0 ? 0.7 : 1.1),
              ry: side > 0 ? Math.PI : 0,
            })
          }
          x += w + 0.25 + r() * 0.5
        }
      }
    }
    const t: { p: Vec3; s: number }[] = []
    for (let i = 0; i < 26; i++) {
      const side = r() > 0.5 ? 1 : -1
      t.push({ p: [-22 + r() * 44, BANK, side * (9.8 + r() * 4)], s: 0.9 + r() * 0.8 })
    }
    const l: { p: Vec3; phase: number }[] = []
    for (let x = -20; x <= 20; x += 3.2) {
      if (BRIDGES.some((b) => Math.abs(x - b) < 1.5)) continue
      l.push({ p: [x, BANK, 1.85], phase: x })
      l.push({ p: [x + 1.6, BANK, -1.85], phase: x + 2 })
    }
    return { houses: h, trees: t, lanterns: l }
  }, [])

  return (
    <>
      <SkyGradient top="#8db7c9" bottom="#f0e9dc" />
      <fog attach="fog" args={['#e7e4da', 20, 55]} />
      <Lights sun={[10, 16, 12]} intensity={2} sky="#f4f1e8" ground="#6a6a5a" size={24} />
      {/* embankments */}
      {[1, -1].map((side) => (
        <group key={side}>
          <mesh position={[0, BANK / 2 - 0.5, side * 8.6]} receiveShadow>
            <boxGeometry args={[60, BANK + 1, 14]} />
            <meshStandardMaterial color="#9aa58a" flatShading />
          </mesh>
          <mesh position={[0, BANK / 2 - 0.5, side * 1.8]} castShadow receiveShadow>
            <boxGeometry args={[60, BANK + 1.02, 0.4]} />
            <meshStandardMaterial color="#8f8a80" flatShading />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -0.9, 0]}>
        <boxGeometry args={[60, 0.2, 3.6]} />
        <meshStandardMaterial color="#284a4a" />
      </mesh>
      <Water size={[60, 3.6]} position={[0, 0, 0]} color="#3f8a86" amplitude={0.02} segments={80} />
      {houses.map((h, i) => (
        <ChineseHouse key={i} position={h.p} w={h.w} d={h.d} h={h.h} rotation={[0, h.ry, 0]} />
      ))}
      {trees.map((t, i) => (
        <Tree key={i} position={t.p} scale={t.s} color={i % 2 ? '#7ea65a' : '#5e8f4a'} />
      ))}
      {lanterns.map((l, i) => (
        <Lantern key={i} position={l.p} phase={l.phase} />
      ))}
      {BRIDGES.map((x) => (
        <ArchBridge key={x} position={[x, 0, 0]} />
      ))}
      <Pagoda position={[3, BANK, -12]} />
      {[-30, -12, 8, 26].map((x, i) => (
        <mesh key={x} position={[x, 3, -32 - i * 2]}>
          <coneGeometry args={[9 + i, 8 + (i % 2) * 3, 6]} />
          <meshStandardMaterial color="#8fa79a" flatShading />
        </mesh>
      ))}
      <Boats />
      <Label position={[-18, 1.6, 0]} tone="light">BEIJING ↑ NORTH</Label>
      <Label position={[18, 1.6, 0]} tone="light">SOUTH ↓ HANGZHOU</Label>
      <Label position={[3, 6, -12]}>2,500+ years of history</Label>
      <Rig position={[-12, 8, 11]} target={[0, 0.8, 0]} minDistance={6} maxDistance={40} shift={0.16} />
    </>
  )
}
