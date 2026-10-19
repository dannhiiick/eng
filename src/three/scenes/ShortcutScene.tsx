import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { Label, Lights, Rig, SkyGradient, Water, rng } from '../common'
import { CargoShip, Tree } from '../models'

type XZ = [number, number]

const NORTH: XZ[] = [
  [-1, -0.45], [-0.6, -2], [-2, -4], [-3, -7], [-2.5, -10], [0, -12], [3, -11], [4, -8],
  [2.5, -5], [1.2, -2.5], [0.8, -0.45],
]
const SOUTH: XZ[] = [
  [-0.8, 0.45], [0.9, 0.45], [1.5, 2], [3, 4], [3.2, 7], [1.5, 10], [0.3, 11.5], [-0.6, 9],
  [-1.5, 6], [-2.2, 3], [-1.4, 1.5],
]

function inside(p: XZ, poly: XZ[]) {
  let c = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i]
    const [xj, zj] = poly[j]
    if (zi > p[1] !== zj > p[1] && p[0] < ((xj - xi) * (p[1] - zi)) / (zj - zi) + xi) c = !c
  }
  return c
}

function Land({ poly, seed }: { poly: XZ[]; seed: number }) {
  const { geo, trees } = useMemo(() => {
    const s = new THREE.Shape()
    poly.forEach(([x, z], i) => (i ? s.lineTo(x, -z) : s.moveTo(x, -z)))
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.7, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.1, bevelSegments: 1 })
    g.rotateX(-Math.PI / 2)
    g.translate(0, -0.3, 0)
    const r = rng(seed)
    const xs = poly.map((p) => p[0])
    const zs = poly.map((p) => p[1])
    const list: { p: [number, number, number]; s: number }[] = []
    let guard = 0
    while (list.length < 34 && guard++ < 2000) {
      const p: XZ = [
        Math.min(...xs) + r() * (Math.max(...xs) - Math.min(...xs)),
        Math.min(...zs) + r() * (Math.max(...zs) - Math.min(...zs)),
      ]
      if (inside(p, poly) && Math.abs(p[1]) > 0.9) list.push({ p: [p[0], 0.5, p[1]], s: 0.45 + r() * 0.35 })
    }
    return { geo: g, trees: list }
  }, [poly, seed])
  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color="#6aa35d" flatShading roughness={0.9} />
      </mesh>
      {trees.map((t, i) => (
        <Tree key={i} position={t.p} scale={t.s} color={i % 3 ? '#3f8f4f' : '#2f7a43'} />
      ))}
    </group>
  )
}

const ROUTE_CANAL = new THREE.CatmullRomCurve3([new THREE.Vector3(8, 0, 0), new THREE.Vector3(-8, 0, 0)])
const ROUTE_AROUND = new THREE.CatmullRomCurve3(
  [
    [8, 0, 0], [5.5, 0, 4], [4.4, 0, 9], [1.5, 0, 13.6], [-2, 0, 13.2], [-4.6, 0, 8], [-6, 0, 3], [-8, 0, 0],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
)

function Voyager({
  curve,
  speedRef,
  label,
  done,
  seed,
  tone,
}: {
  curve: THREE.CatmullRomCurve3
  speedRef: { period: number; longest: number }
  label: string
  done: string
  seed: number
  tone: 'accent' | 'dark'
}) {
  const ship = useRef<THREE.Group>(null)
  const text = useRef<HTMLSpanElement>(null)
  const len = useMemo(() => curve.getLength(), [curve])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime % speedRef.period
    const travelled = (t / (speedRef.period - 1.5)) * speedRef.longest
    const u = Math.min(1, travelled / len)
    const p = curve.getPointAt(u)
    const tan = curve.getTangentAt(u)
    if (ship.current) {
      ship.current.position.set(p.x, Math.sin(clock.elapsedTime * 2 + seed) * 0.02, p.z)
      ship.current.rotation.y = Math.atan2(-tan.z, tan.x)
    }
    if (text.current) text.current.textContent = u >= 1 ? done : label
  })
  const cls =
    tone === 'accent' ? 'bg-[#ff6a1a] text-white border-[#ff8a4a]' : 'bg-[#0b1220]/85 text-white border-white/15'
  return (
    <group ref={ship}>
      <CargoShip scale={0.24} seed={seed} />
      <Html position={[0, 0.9, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <span
          ref={text}
          className={`whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-semibold shadow-lg ${cls}`}
        />
      </Html>
    </group>
  )
}

export default function ShortcutScene() {
  const around = useMemo(() => ROUTE_AROUND.getLength(), [])
  const timing = useMemo(() => ({ period: 16, longest: around }), [around])
  const canalPts = useMemo(() => ROUTE_CANAL.getPoints(2).map((p) => p.clone().setY(0.12)), [])
  const aroundPts = useMemo(() => ROUTE_AROUND.getPoints(120).map((p) => p.clone().setY(0.12)), [])
  return (
    <>
      <SkyGradient top="#7fb4e6" bottom="#e9f3f7" />
      <fog attach="fog" args={['#dbeaf2', 28, 60]} />
      <Lights sun={[10, 20, 6]} size={18} />
      <Water size={[60, 60]} position={[0, 0, 1]} color="#2f8fc4" amplitude={0.04} segments={60} />
      <Land poly={NORTH} seed={4} />
      <Land poly={SOUTH} seed={9} />
      <Line points={canalPts} color="#ff6a1a" lineWidth={3} dashed dashSize={0.35} gapSize={0.2} />
      <Line points={aroundPts} color="#ffffff" lineWidth={2} dashed dashSize={0.35} gapSize={0.25} opacity={0.8} transparent />
      <Voyager curve={ROUTE_CANAL} speedRef={timing} label="Through the canal" done="Arrived! Shorter & cheaper" seed={5} tone="accent" />
      <Voyager curve={ROUTE_AROUND} speedRef={timing} label="Around the continent" done="Arrived" seed={11} tone="dark" />
      <Label position={[7.5, 0.6, -6]} tone="light">ATLANTIC OCEAN</Label>
      <Label position={[-7.5, 0.6, -6]} tone="light">PACIFIC OCEAN</Label>
      <Rig position={[0, 15, 15]} target={[0, 0, 2]} minDistance={8} maxDistance={40} shift={0.17} />
    </>
  )
}
