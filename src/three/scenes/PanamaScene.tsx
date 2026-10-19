import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { Label, Lights, Rig, SkyGradient, Water, keys, rng, type Vec3 } from '../common'
import { CargoShip, Palm, Tree } from '../models'

const PERIOD = 22
const WATER = '#2c8cb8'
const CONCRETE = '#c9c3b6'

// Timeline of one passage through the three lock chambers (seconds → value).
const T = {
  gates: [
    [[0, 0], [0.6, 1], [3.6, 1], [4.2, 0]],
    [[6.2, 0], [6.8, 1], [8.8, 1], [9.4, 0]],
    [[11.4, 0], [12, 1], [14, 1], [14.6, 0]],
    [[16.6, 0], [17.2, 1], [21.2, 1], [21.8, 0]],
  ] as [number, number][][],
  chambers: [
    [[4.2, 0], [6.2, 1], [9.4, 1], [11.4, 0]],
    [[9.4, 1], [11.4, 2], [14.6, 2], [16.6, 1]],
    [[0, 3], [2, 2], [14.6, 2], [16.6, 3]],
  ] as [number, number][][],
  shipX: [[0.6, -14], [3.6, -6], [6.8, -6], [8.8, -2], [12, -2], [14, 2], [17.2, 2], [21.2, 16]] as [number, number][],
  shipY: [[4.2, 0], [6.2, 1], [9.4, 1], [11.4, 2], [14.6, 2], [16.6, 3]] as [number, number][],
}

const GATE_X = [-8, -4, 0, 4]
const GATE_TOP = [1.4, 2.4, 3.4, 3.6]
const SEG = [
  { x: -6, top: 1.6 },
  { x: -2, top: 2.6 },
  { x: 2, top: 3.6 },
]

function Gate({ index }: { index: number }) {
  const a = useRef<THREE.Group>(null)
  const b = useRef<THREE.Group>(null)
  const h = GATE_TOP[index] + 1
  useFrame(({ clock }) => {
    const open = keys(clock.elapsedTime % PERIOD, T.gates[index]) * (Math.PI / 2) * 0.92
    if (a.current) a.current.rotation.y = open
    if (b.current) b.current.rotation.y = -open
  })
  const leaf = (
    <meshStandardMaterial color="#59616b" metalness={0.3} roughness={0.6} flatShading />
  )
  return (
    <group position={[GATE_X[index], 0, 0]}>
      <group ref={a} position={[0, 0, 1.2]}>
        <mesh position={[0, h / 2 - 1, -0.6]} castShadow>
          <boxGeometry args={[0.16, h, 1.2]} />
          {leaf}
        </mesh>
      </group>
      <group ref={b} position={[0, 0, -1.2]}>
        <mesh position={[0, h / 2 - 1, 0.6]} castShadow>
          <boxGeometry args={[0.16, h, 1.2]} />
          {leaf}
        </mesh>
      </group>
    </group>
  )
}

function Chamber({ index }: { index: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const level = keys(clock.elapsedTime % PERIOD, T.chambers[index])
    if (ref.current) {
      ref.current.scale.y = level + 1
      ref.current.position.y = (level - 1) / 2
    }
  })
  return (
    <mesh ref={ref} position={[SEG[index].x, 0, 0]}>
      <boxGeometry args={[3.84, 1, 2.4]} />
      <meshStandardMaterial color={WATER} transparent opacity={0.88} roughness={0.2} />
    </mesh>
  )
}

function Ship() {
  const ref = useRef<THREE.Group>(null)
  const text = useRef<HTMLSpanElement>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime % PERIOD
    const y = keys(t, T.shipY)
    if (ref.current) {
      ref.current.position.set(keys(t, T.shipX), y + Math.sin(clock.elapsedTime * 2) * 0.015, 0)
      const s = Math.min(1, t / 0.5, (PERIOD - t) / 0.5)
      ref.current.scale.setScalar(0.72 * Math.max(0.001, s))
    }
    if (text.current) text.current.textContent = `+${Math.round((y / 3) * 26)} m above sea level`
  })
  return (
    <group ref={ref}>
      <CargoShip seed={7} />
      <Html position={[0, 2.1, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <span
          ref={text}
          className="whitespace-nowrap rounded-full border border-[#ff8a4a] bg-[#ff6a1a] px-3 py-1 text-[11px] font-semibold text-white shadow-lg tabular-nums"
        />
      </Html>
    </group>
  )
}

function Terrain() {
  const trees = useMemo(() => {
    const r = rng(21)
    const list: { p: Vec3; s: number; palm: boolean }[] = []
    for (let i = 0; i < 70; i++) {
      const seg = SEG[Math.floor(r() * 3)]
      const side = r() > 0.5 ? 1 : -1
      list.push({
        p: [seg.x + (r() - 0.5) * 3.6, seg.top, side * (2.2 + r() * 10)],
        s: 0.7 + r() * 0.7,
        palm: r() > 0.75,
      })
    }
    return list
  }, [])
  const islands = useMemo(() => {
    const r = rng(5)
    return Array.from({ length: 7 }).map(() => ({
      p: [8 + r() * 18, 2.75, (r() > 0.5 ? 1 : -1) * (3 + r() * 9)] as Vec3,
      s: 1 + r() * 1.6,
    }))
  }, [])
  return (
    <group>
      {/* sea floor + lake bed */}
      <mesh position={[-23, -1.6, 0]} receiveShadow>
        <boxGeometry args={[30, 0.2, 40]} />
        <meshStandardMaterial color="#1c5a76" />
      </mesh>
      <mesh position={[22, 0.55, 0]} receiveShadow>
        <boxGeometry args={[36, 4.1, 40]} />
        <meshStandardMaterial color="#5c8f4f" flatShading />
      </mesh>
      {/* lock floor */}
      <mesh position={[-2, -1.25, 0]} receiveShadow>
        <boxGeometry args={[12, 0.5, 2.4]} />
        <meshStandardMaterial color="#8c877d" />
      </mesh>
      {SEG.map((s, i) => (
        <group key={i}>
          {[1, -1].map((side) => (
            <group key={side}>
              <mesh position={[s.x, (s.top - 1.5) / 2, side * 1.35]} castShadow receiveShadow>
                <boxGeometry args={[4, s.top + 1.5, 0.3]} />
                <meshStandardMaterial color={CONCRETE} flatShading />
              </mesh>
              <mesh position={[s.x, (s.top - 1.5) / 2 - 0.02, side * 10.75]} castShadow receiveShadow>
                <boxGeometry args={[4, s.top + 1.5, 18.5]} />
                <meshStandardMaterial color={i === 2 ? '#5f9a52' : i === 1 ? '#679f57' : '#70a65d'} flatShading />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      {trees.map((t, i) =>
        t.palm ? (
          <Palm key={i} position={t.p} scale={t.s * 0.8} rotation={[0, i, 0]} />
        ) : (
          <Tree key={i} position={t.p} scale={t.s} color={i % 3 ? '#2f7d3f' : '#3c9450'} />
        ),
      )}
      {islands.map((isl, i) => (
        <group key={i} position={isl.p}>
          <mesh scale={[isl.s, 0.35, isl.s]} castShadow receiveShadow>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial color="#4f8a45" flatShading />
          </mesh>
          <Tree position={[0, 0.25, 0]} scale={0.9} color="#2f7d3f" />
          <Tree position={[isl.s * 0.4, 0.2, 0.3]} scale={0.7} color="#3c9450" />
        </group>
      ))}
    </group>
  )
}

export default function PanamaScene() {
  return (
    <>
      <SkyGradient top="#5aa0dc" bottom="#eaf4f2" />
      <fog attach="fog" args={['#dcebee', 30, 70]} />
      <Lights sun={[-8, 20, 10]} size={24} />
      <Terrain />
      <Water size={[30, 40]} position={[-23, 0, 0]} color={WATER} />
      <Water size={[36, 40]} position={[22, 3, 0]} color="#2f97b5" amplitude={0.03} />
      {[0, 1, 2].map((i) => (
        <Chamber key={i} index={i} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Gate key={i} index={i} />
      ))}
      <Ship />
      <Label position={[-15, 0.8, 5]} tone="light">ATLANTIC OCEAN · 0 m</Label>
      <Label position={[12, 4, 5]} tone="light">GATUN LAKE · 26 m</Label>
      <Label position={[-2, 4.6, -3]}>3 lock chambers</Label>
      <Rig position={[-15, 10, 13]} target={[-1, 1.5, 0]} minDistance={8} maxDistance={40} shift={0.16} />
    </>
  )
}
