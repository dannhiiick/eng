import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

export type Vec3 = [number, number, number]

/** Deterministic pseudo-random generator so scenes look the same every time. */
export function rng(seed = 1) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

const ease = (x: number) => x * x * (3 - 2 * x)

/** Piecewise keyframe interpolation with smooth easing between keys. */
export function keys(t: number, frames: [number, number][]) {
  if (t <= frames[0][0]) return frames[0][1]
  for (let i = 1; i < frames.length; i++) {
    const [t1, v1] = frames[i]
    if (t <= t1) {
      const [t0, v0] = frames[i - 1]
      return v0 + (v1 - v0) * ease((t - t0) / (t1 - t0))
    }
  }
  return frames[frames.length - 1][1]
}

/** Orbit camera with a cinematic fly-in whenever a scene mounts.
 *  `shift` moves the framing so the scene sits beside (desktop) or above (mobile) the text panel. */
export function Rig({
  position,
  target = [0, 0, 0],
  minDistance = 4,
  maxDistance = 45,
  autoRotate = false,
  maxPolar = Math.PI * 0.47,
  shift = 0.2,
}: {
  position: Vec3
  target?: Vec3
  minDistance?: number
  maxDistance?: number
  autoRotate?: boolean
  maxPolar?: number
  shift?: number
}) {
  const camera = useThree((s) => s.camera)
  const width = useThree((s) => s.size.width)
  const wide = width >= 1024
  const { goal, tgt } = useMemo(() => {
    const p = new THREE.Vector3(...position)
    const t = new THREE.Vector3(...target)
    const dist = p.distanceTo(t)
    const dir = t.clone().sub(p).normalize()
    const right = dir.clone().cross(new THREE.Vector3(0, 1, 0)).normalize()
    const up = right.clone().cross(dir).normalize()
    const off = wide ? right.multiplyScalar(-shift * dist) : up.multiplyScalar(-0.2 * dist)
    return { goal: p.add(off), tgt: t.add(off) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...position, ...target, wide, shift])
  const intro = useRef(true)

  useLayoutEffect(() => {
    const start = goal.clone().sub(tgt).multiplyScalar(1.6).add(tgt).add(new THREE.Vector3(0, 3, 0))
    camera.position.copy(start)
    camera.lookAt(tgt)
    intro.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame((_, dt) => {
    if (!intro.current) return
    camera.position.lerp(goal, 1 - Math.exp(-dt * 2.2))
    if (camera.position.distanceTo(goal) < 0.02) intro.current = false
  })

  return (
    <OrbitControls
      makeDefault
      target={[tgt.x, tgt.y, tgt.z]}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={minDistance}
      maxDistance={maxDistance}
      maxPolarAngle={maxPolar}
      autoRotate={autoRotate}
      autoRotateSpeed={0.35}
      onStart={() => (intro.current = false)}
    />
  )
}

export function Lights({
  sun = [12, 18, 8],
  intensity = 2.2,
  sky = '#dfefff',
  ground = '#5b4a3a',
  hemi = 0.9,
  color = '#fff4e0',
  size = 22,
}: {
  sun?: Vec3
  intensity?: number
  sky?: string
  ground?: string
  hemi?: number
  color?: string
  size?: number
}) {
  return (
    <>
      <hemisphereLight args={[sky, ground, hemi]} />
      <directionalLight
        position={sun}
        intensity={intensity}
        color={color}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-size}
        shadow-camera-right={size}
        shadow-camera-top={size}
        shadow-camera-bottom={-size}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
      />
    </>
  )
}

/** Large inverted sphere with a vertical colour gradient. */
export function SkyGradient({ top, bottom, offset = 0 }: { top: string; bottom: string; offset?: number }) {
  const uniforms = useMemo(
    () => ({
      top: { value: new THREE.Color(top) },
      bottom: { value: new THREE.Color(bottom) },
      offset: { value: offset },
    }),
    [top, bottom, offset],
  )
  return (
    <mesh scale={150} renderOrder={-1}>
      <sphereGeometry args={[1, 32, 16]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
        fragmentShader={`uniform vec3 top; uniform vec3 bottom; uniform float offset; varying vec3 vP;
          void main(){ float h = clamp(normalize(vP).y * 1.6 + offset, 0.0, 1.0); gl_FragColor = vec4(mix(bottom, top, pow(h, 0.8)), 1.0); }`}
      />
    </mesh>
  )
}

/** Animated low-poly water surface. */
export function Water({
  size = [40, 40],
  position = [0, 0, 0],
  color = '#2a86b8',
  amplitude = 0.06,
  segments = 48,
  opacity = 0.92,
}: {
  size?: [number, number]
  position?: Vec3
  color?: string
  amplitude?: number
  segments?: number
  opacity?: number
}) {
  const [w, d] = size
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(w, d, segments, Math.max(2, Math.round((segments * d) / w)))
    g.rotateX(-Math.PI / 2)
    return g
  }, [w, d, segments])
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo])

  useFrame(({ clock }) => {
    if (amplitude === 0) return
    const t = clock.elapsedTime
    const pos = geo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3] + position[0]
      const z = base[i * 3 + 2] + position[2]
      pos.setY(i, Math.sin(x * 0.6 + t * 1.2) * amplitude + Math.cos(z * 0.8 + t * 0.9) * amplitude * 0.8)
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
  })

  return (
    <mesh geometry={geo} position={position} receiveShadow>
      <meshStandardMaterial color={color} roughness={0.25} metalness={0.1} flatShading transparent opacity={opacity} />
    </mesh>
  )
}

/** HTML label pinned in 3D space. */
export function Label({
  position,
  children,
  tone = 'dark',
}: {
  position: Vec3
  children: ReactNode
  tone?: 'dark' | 'light' | 'accent'
}) {
  const cls =
    tone === 'accent'
      ? 'bg-[#ff6a1a] text-white border-[#ff8a4a]'
      : tone === 'light'
        ? 'bg-white/90 text-[#0b1220] border-white'
        : 'bg-[#0b1220]/80 text-white border-white/15'
  return (
    <Html position={position} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
      <div
        className={`whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide shadow-lg backdrop-blur ${cls}`}
      >
        {children}
      </div>
    </Html>
  )
}
