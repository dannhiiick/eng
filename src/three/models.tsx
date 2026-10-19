import { forwardRef, useMemo, useRef } from 'react'
import { useFrame, type ThreeElements } from '@react-three/fiber'
import * as THREE from 'three'
import { rng } from './common'

type GroupProps = ThreeElements['group']

const CONTAINER_COLORS = ['#ff6a1a', '#1f6feb', '#d63b3b', '#17a589', '#f2c14e', '#e9e4da', '#7b5ea7']

function hullGeometry(length: number, width: number, depth: number, bow = 0.8) {
  const half = length / 2
  const s = new THREE.Shape()
  s.moveTo(-half, -width / 2)
  s.lineTo(half - bow, -width / 2)
  s.quadraticCurveTo(half - bow * 0.15, -width * 0.35, half, 0)
  s.quadraticCurveTo(half - bow * 0.15, width * 0.35, half - bow, width / 2)
  s.lineTo(-half, width / 2)
  s.closePath()
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 6 })
  g.rotateX(-Math.PI / 2)
  return g
}

/** Low-poly container ship, bow points to +X. Length ~4.3 at scale 1. */
export const CargoShip = forwardRef<THREE.Group, GroupProps & { seed?: number; hull?: string }>(
  function CargoShip({ seed = 3, hull = '#1d2b45', ...props }, ref) {
    const { upper, lower, containers } = useMemo(() => {
      const r = rng(seed)
      const list: { p: [number, number, number]; c: string }[] = []
      for (let x = -1.05; x < 1.5; x += 0.44) {
        for (const z of [-0.29, 0, 0.29]) {
          const stack = 1 + Math.floor(r() * 3)
          for (let y = 0; y < stack; y++) {
            list.push({ p: [x, 0.42 + y * 0.22, z], c: CONTAINER_COLORS[Math.floor(r() * CONTAINER_COLORS.length)] })
          }
        }
      }
      const up = hullGeometry(4.3, 1, 0.42)
      up.translate(0, -0.12, 0)
      const low = hullGeometry(4.34, 1.02, 0.2)
      low.translate(0, -0.3, 0)
      return { upper: up, lower: low, containers: list }
    }, [seed])
    const box = useMemo(() => new THREE.BoxGeometry(0.42, 0.21, 0.27), [])

    return (
      <group ref={ref} {...props}>
        <mesh geometry={upper} castShadow receiveShadow>
          <meshStandardMaterial color={hull} flatShading roughness={0.6} />
        </mesh>
        <mesh geometry={lower} castShadow>
          <meshStandardMaterial color="#b8352c" flatShading roughness={0.7} />
        </mesh>
        {/* deck */}
        <mesh position={[0, 0.305, 0]} receiveShadow>
          <boxGeometry args={[3.9, 0.02, 0.92]} />
          <meshStandardMaterial color="#5d6b78" />
        </mesh>
        {containers.map((c, i) => (
          <mesh key={i} geometry={box} position={c.p} castShadow>
            <meshStandardMaterial color={c.c} roughness={0.8} flatShading />
          </mesh>
        ))}
        {/* bridge */}
        <mesh position={[-1.62, 0.62, 0]} castShadow>
          <boxGeometry args={[0.46, 0.62, 0.86]} />
          <meshStandardMaterial color="#f3f1ec" flatShading />
        </mesh>
        <mesh position={[-1.55, 0.86, 0]}>
          <boxGeometry args={[0.38, 0.09, 0.88]} />
          <meshStandardMaterial color="#14202f" roughness={0.2} metalness={0.4} />
        </mesh>
        <mesh position={[-1.62, 0.95, 0]} castShadow>
          <boxGeometry args={[0.56, 0.05, 1.02]} />
          <meshStandardMaterial color="#f3f1ec" />
        </mesh>
        <mesh position={[-1.9, 0.82, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.11, 0.45, 8]} />
          <meshStandardMaterial color="#ff6a1a" />
        </mesh>
      </group>
    )
  },
)

/** Small wooden Chinese canal boat (sampan), bow to +X. */
export const Sampan = forwardRef<THREE.Group, GroupProps & { canopy?: string }>(function Sampan(
  { canopy = '#3a2a1e', ...props },
  ref,
) {
  const hull = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-1, 0)
    s.quadraticCurveTo(-0.8, -0.3, 0, -0.32)
    s.quadraticCurveTo(0.8, -0.3, 1.1, 0)
    s.quadraticCurveTo(0.8, 0.3, 0, 0.32)
    s.quadraticCurveTo(-0.8, 0.3, -1, 0)
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.28, bevelEnabled: false, curveSegments: 6 })
    g.rotateX(-Math.PI / 2)
    g.translate(0, -0.12, 0)
    return g
  }, [])
  return (
    <group ref={ref} {...props}>
      <mesh geometry={hull} castShadow>
        <meshStandardMaterial color="#8a5a35" flatShading />
      </mesh>
      <mesh position={[-0.1, 0.16, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.9, 10, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color={canopy} side={THREE.DoubleSide} flatShading />
      </mesh>
      <mesh position={[-0.95, 0.35, 0]} rotation={[0, 0, -0.6]}>
        <cylinderGeometry args={[0.02, 0.02, 0.9, 5]} />
        <meshStandardMaterial color="#5a3d26" />
      </mesh>
    </group>
  )
})

export function Tree({ scale = 1, color = '#3f8f4f', ...props }: GroupProps & { scale?: number; color?: string }) {
  return (
    <group scale={scale} {...props}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.09, 0.6, 5]} />
        <meshStandardMaterial color="#6b4a2f" flatShading />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <icosahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    </group>
  )
}

export function Palm({ scale = 1, ...props }: GroupProps & { scale?: number }) {
  const leaves = [0, 1, 2, 3, 4, 5]
  return (
    <group scale={scale} {...props}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[i * 0.04, 0.2 + i * 0.38, 0]} rotation={[0, 0, -0.05 * i]} castShadow>
          <cylinderGeometry args={[0.07 - i * 0.008, 0.09 - i * 0.008, 0.4, 6]} />
          <meshStandardMaterial color={i % 2 ? '#8b6a43' : '#7a5b37'} flatShading />
        </mesh>
      ))}
      <group position={[0.16, 1.6, 0]}>
        {leaves.map((i) => (
          <group key={i} rotation={[0, (i / leaves.length) * Math.PI * 2, 0]}>
            <mesh position={[0.42, -0.1, 0]} rotation={[0, 0, -0.45]} castShadow>
              <boxGeometry args={[0.9, 0.03, 0.22]} />
              <meshStandardMaterial color="#3e8a3a" flatShading />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

export function Pyramid({ size = 4, ...props }: GroupProps & { size?: number }) {
  return (
    <group {...props}>
      <mesh position={[0, size * 0.32, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <coneGeometry args={[size * 0.71, size * 0.64, 4, 1]} />
        <meshStandardMaterial color="#d9b47a" flatShading roughness={0.95} />
      </mesh>
    </group>
  )
}

function prismGeometry(width: number, height: number, length: number) {
  const s = new THREE.Shape()
  s.moveTo(-width / 2, 0)
  s.lineTo(width / 2, 0)
  s.lineTo(0, height)
  s.closePath()
  const g = new THREE.ExtrudeGeometry(s, { depth: length, bevelEnabled: false })
  g.translate(0, 0, -length / 2)
  return g
}

/** Whitewashed house with dark tiled roof (Jiangnan water-town style). */
export function ChineseHouse({
  w = 1.6,
  d = 1.2,
  h = 1,
  ...props
}: GroupProps & { w?: number; d?: number; h?: number }) {
  const roof = useMemo(() => prismGeometry(d * 1.3, 0.55, w * 1.12), [w, d])
  return (
    <group {...props}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#f1ede4" flatShading />
      </mesh>
      <mesh geometry={roof} position={[0, h, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <meshStandardMaterial color="#3b3f46" flatShading />
      </mesh>
      <mesh position={[0, h * 0.42, d / 2 + 0.01]}>
        <planeGeometry args={[w * 0.22, h * 0.55]} />
        <meshStandardMaterial color="#6e3b26" />
      </mesh>
      <mesh position={[w * 0.28, h * 0.6, d / 2 + 0.01]}>
        <planeGeometry args={[w * 0.18, h * 0.22]} />
        <meshStandardMaterial color="#2b2f36" />
      </mesh>
    </group>
  )
}

export function Pagoda({ tiers = 5, ...props }: GroupProps & { tiers?: number }) {
  return (
    <group {...props}>
      {Array.from({ length: tiers }).map((_, i) => {
        const s = 1.6 - i * 0.22
        const y = i * 0.8
        return (
          <group key={i} position={[0, y, 0]}>
            <mesh position={[0, 0.3, 0]} castShadow>
              <boxGeometry args={[s, 0.6, s]} />
              <meshStandardMaterial color={i % 2 ? '#c8452f' : '#b33a27'} flatShading />
            </mesh>
            <mesh position={[0, 0.74, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <coneGeometry args={[s * 0.95, 0.32, 4]} />
              <meshStandardMaterial color="#2f3640" flatShading />
            </mesh>
          </group>
        )
      })}
      <mesh position={[0, tiers * 0.8 + 0.25, 0]}>
        <coneGeometry args={[0.08, 0.7, 6]} />
        <meshStandardMaterial color="#d4a73b" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
}

/** Stone hump bridge. Spans along Z. */
export function ArchBridge(props: GroupProps) {
  const geo = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-2.9, -0.6)
    s.lineTo(-2.9, 0.75)
    s.quadraticCurveTo(0, 2.25, 2.9, 0.75)
    s.lineTo(2.9, -0.6)
    s.lineTo(1.75, -0.6)
    s.absarc(0, -0.6, 1.75, 0, Math.PI, false)
    s.lineTo(-2.9, -0.6)
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.1, bevelEnabled: false, curveSegments: 14 })
    g.translate(0, 0, -0.55)
    g.rotateY(Math.PI / 2)
    return g
  }, [])
  return (
    <group {...props}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color="#a9a196" flatShading roughness={0.9} />
      </mesh>
    </group>
  )
}

export const Worker = forwardRef<THREE.Group, GroupProps & { vest?: string }>(function Worker(
  { vest = '#ff6a1a', ...props },
  ref,
) {
  return (
    <group ref={ref} {...props}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.22, 0.44, 0.16]} />
        <meshStandardMaterial color="#26364f" flatShading />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.3, 0.36, 0.2]} />
        <meshStandardMaterial color={vest} flatShading />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.11, 8, 6]} />
        <meshStandardMaterial color="#e2b48c" flatShading />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <sphereGeometry args={[0.13, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f7c531" flatShading />
      </mesh>
    </group>
  )
})

const YELLOW = '#f2b134'

export function TowerCrane(props: GroupProps) {
  const top = useRef<THREE.Group>(null)
  const trolley = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (top.current) top.current.rotation.y = Math.sin(t * 0.25) * 1.2
    if (trolley.current) {
      trolley.current.position.x = 3.4 + Math.sin(t * 0.5) * 1.6
      trolley.current.rotation.x = Math.sin(t * 1.3) * 0.04
    }
  })
  const segments = Array.from({ length: 9 })
  return (
    <group {...props}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.4, 1.4]} />
        <meshStandardMaterial color="#8d8f93" flatShading />
      </mesh>
      {segments.map((_, i) => (
        <group key={i} position={[0, 0.4 + i * 0.9 + 0.45, 0]}>
          {[
            [-0.25, -0.25],
            [0.25, -0.25],
            [-0.25, 0.25],
            [0.25, 0.25],
          ].map(([x, z], j) => (
            <mesh key={j} position={[x, 0, z]} castShadow>
              <boxGeometry args={[0.07, 0.9, 0.07]} />
              <meshStandardMaterial color={YELLOW} />
            </mesh>
          ))}
          <mesh rotation={[0, 0, 0.9]}>
            <boxGeometry args={[0.04, 0.75, 0.52]} />
            <meshStandardMaterial color={YELLOW} wireframe />
          </mesh>
        </group>
      ))}
      <group ref={top} position={[0, 8.6, 0]}>
        <mesh position={[0.2, 0.25, 0.45]} castShadow>
          <boxGeometry args={[0.6, 0.5, 0.5]} />
          <meshStandardMaterial color="#f3f1ec" flatShading />
        </mesh>
        <mesh position={[2.6, 0.6, 0]} castShadow>
          <boxGeometry args={[6.4, 0.3, 0.4]} />
          <meshStandardMaterial color={YELLOW} flatShading />
        </mesh>
        <mesh position={[-1.6, 0.6, 0]} castShadow>
          <boxGeometry args={[2.6, 0.3, 0.45]} />
          <meshStandardMaterial color={YELLOW} flatShading />
        </mesh>
        <mesh position={[-2.5, 0.25, 0]} castShadow>
          <boxGeometry args={[0.8, 0.7, 0.7]} />
          <meshStandardMaterial color="#8d8f93" flatShading />
        </mesh>
        <mesh position={[0, 1.4, 0]} castShadow>
          <coneGeometry args={[0.3, 1.4, 4]} />
          <meshStandardMaterial color={YELLOW} flatShading />
        </mesh>
        <group ref={trolley} position={[3.4, 0.45, 0]}>
          <mesh position={[0, -1.6, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 3.2, 4]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <mesh position={[0, -3.45, 0]} castShadow>
            <boxGeometry args={[1.3, 0.5, 0.6]} />
            <meshStandardMaterial color="#1f6feb" flatShading />
          </mesh>
        </group>
      </group>
    </group>
  )
}

export function Excavator(props: GroupProps) {
  const upper = useRef<THREE.Group>(null)
  const boom = useRef<THREE.Group>(null)
  const stick = useRef<THREE.Group>(null)
  const bucket = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.9
    if (upper.current) upper.current.rotation.y = Math.sin(t * 0.5) * 0.7
    if (boom.current) boom.current.rotation.z = 0.25 + Math.sin(t) * 0.3
    if (stick.current) stick.current.rotation.z = 0.1 + Math.sin(t + 1.2) * 0.45
    if (bucket.current) bucket.current.rotation.z = -0.3 + Math.sin(t + 2) * 0.6
  })
  return (
    <group {...props}>
      {[-0.55, 0.55].map((z) => (
        <mesh key={z} position={[0, 0.22, z]} castShadow>
          <boxGeometry args={[2, 0.44, 0.38]} />
          <meshStandardMaterial color="#2a2d33" flatShading />
        </mesh>
      ))}
      <group ref={upper} position={[0, 0.5, 0]}>
        <mesh position={[-0.3, 0.3, 0]} castShadow>
          <boxGeometry args={[1.7, 0.55, 1.3]} />
          <meshStandardMaterial color={YELLOW} flatShading />
        </mesh>
        <mesh position={[0.15, 0.85, 0.32]} castShadow>
          <boxGeometry args={[0.7, 0.65, 0.6]} />
          <meshStandardMaterial color={YELLOW} flatShading />
        </mesh>
        <mesh position={[0.36, 0.9, 0.32]}>
          <boxGeometry args={[0.3, 0.45, 0.62]} />
          <meshStandardMaterial color="#1b2633" roughness={0.2} metalness={0.5} />
        </mesh>
        <group ref={boom} position={[0.5, 0.55, -0.15]}>
          <mesh position={[1.1, 0, 0]} castShadow>
            <boxGeometry args={[2.3, 0.26, 0.28]} />
            <meshStandardMaterial color={YELLOW} flatShading />
          </mesh>
          <group ref={stick} position={[2.2, 0, 0]}>
            <mesh position={[0, -0.75, 0]} castShadow>
              <boxGeometry args={[0.2, 1.5, 0.24]} />
              <meshStandardMaterial color={YELLOW} flatShading />
            </mesh>
            <group ref={bucket} position={[0, -1.5, 0]}>
              <mesh position={[0.18, -0.12, 0]} castShadow>
                <boxGeometry args={[0.5, 0.36, 0.5]} />
                <meshStandardMaterial color="#3a3d44" flatShading />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

export const DumpTruck = forwardRef<THREE.Group, GroupProps>(function DumpTruck(props, ref) {
  return (
    <group ref={ref} {...props}>
      <mesh position={[0.95, 0.65, 0]} castShadow>
        <boxGeometry args={[0.7, 0.75, 1]} />
        <meshStandardMaterial color="#d6452b" flatShading />
      </mesh>
      <mesh position={[1.12, 0.78, 0]}>
        <boxGeometry args={[0.38, 0.32, 1.02]} />
        <meshStandardMaterial color="#1b2633" roughness={0.2} metalness={0.5} />
      </mesh>
      <mesh position={[-0.25, 0.75, 0]} castShadow>
        <boxGeometry args={[1.6, 0.6, 1.1]} />
        <meshStandardMaterial color={YELLOW} flatShading />
      </mesh>
      <mesh position={[-0.25, 1.1, 0]} castShadow>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#8a6a48" flatShading />
      </mesh>
      {[
        [0.9, 0.5],
        [0.9, -0.5],
        [-0.6, 0.5],
        [-0.6, -0.5],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.24, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.24, 0.2, 10]} />
          <meshStandardMaterial color="#1c1d21" flatShading />
        </mesh>
      ))}
    </group>
  )
})
