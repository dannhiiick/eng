import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { buildLandDots, latLonToVec3 } from './geo'

export type GlobeMarker = { lat: number; lon: number; label: string; tag?: string }

let cachedDots: THREE.Vector3[] | null = null

function Dots({ radius }: { radius: number }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const dots = useMemo(() => (cachedDots ??= buildLandDots(18000)), [])
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const o = new THREE.Object3D()
    const color = new THREE.Color()
    dots.forEach((p, i) => {
      o.position.copy(p).multiplyScalar(radius * 1.002)
      o.lookAt(p.clone().multiplyScalar(radius * 2))
      o.updateMatrix()
      mesh.setMatrixAt(i, o.matrix)
      // Subtle warm/cool variation by latitude
      color.set('#c9d6ea').lerp(new THREE.Color('#ffffff'), Math.abs(p.y) * 0.6)
      mesh.setColorAt(i, color)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [dots, radius])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, dots.length]}>
      <circleGeometry args={[radius * 0.0075, 6]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}

function Marker({ m, radius, index }: { m: GlobeMarker; radius: number; index: number }) {
  const group = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)
  const label = useRef<HTMLDivElement>(null)
  const camera = useThree((s) => s.camera)
  const { position, quaternion } = useMemo(() => {
    const p = latLonToVec3(m.lat, m.lon, radius)
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), p.clone().normalize())
    return { position: p, quaternion: q }
  }, [m.lat, m.lon, radius])
  const world = useMemo(() => new THREE.Vector3(), [])
  const toCam = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime + index * 0.7
    if (ring.current) {
      const s = 1 + ((t * 0.8) % 1) * 2.2
      ring.current.scale.setScalar(s)
      ;(ring.current.material as THREE.MeshBasicMaterial).opacity = 1 - ((t * 0.8) % 1)
    }
    if (group.current && label.current) {
      group.current.getWorldPosition(world)
      toCam.copy(camera.position).sub(world).normalize()
      const facing = world.clone().normalize().dot(toCam)
      label.current.style.opacity = String(THREE.MathUtils.clamp((facing - 0.05) * 4, 0, 1))
    }
  })

  return (
    <group ref={group} position={position} quaternion={quaternion}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <ringGeometry args={[radius * 0.018, radius * 0.026, 24]} />
        <meshBasicMaterial color="#ff6a1a" transparent toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, radius * 0.06, 0]}>
        <cylinderGeometry args={[radius * 0.003, radius * 0.003, radius * 0.12, 6]} />
        <meshBasicMaterial color="#ffb38a" toneMapped={false} />
      </mesh>
      <mesh position={[0, radius * 0.125, 0]}>
        <sphereGeometry args={[radius * 0.018, 12, 8]} />
        <meshBasicMaterial color="#ff6a1a" toneMapped={false} />
      </mesh>
      <Html position={[0, radius * 0.16, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <div
          ref={label}
          className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-[#0b1220]/85 py-1 pl-1 pr-3 text-[11px] font-semibold text-white shadow-xl backdrop-blur transition-opacity"
          style={{ transform: 'translateY(-14px)' }}
        >
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#ff6a1a] px-1 text-[10px] font-bold">
            {m.tag ?? index + 1}
          </span>
          {m.label}
        </div>
      </Html>
    </group>
  )
}

export function Globe({
  markers,
  focus,
  radius = 2.2,
  spin = 0.06,
}: {
  markers: GlobeMarker[]
  focus?: { lat: number; lon: number }
  radius?: number
  spin?: number
}) {
  const outer = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)
  const target = useMemo(() => {
    if (!focus) return null
    const p = latLonToVec3(focus.lat, focus.lon)
    return { y: -Math.atan2(p.x, p.z), x: THREE.MathUtils.degToRad(focus.lat) * 0.85 }
  }, [focus])

  useFrame(({ clock }, dt) => {
    if (!inner.current || !outer.current) return
    if (target) {
      const sway = Math.sin(clock.elapsedTime * 0.25) * 0.18
      inner.current.rotation.y = THREE.MathUtils.damp(inner.current.rotation.y, target.y + sway, 2, dt)
      outer.current.rotation.x = THREE.MathUtils.damp(outer.current.rotation.x, target.x, 2, dt)
    } else {
      inner.current.rotation.y += dt * spin
      outer.current.rotation.x = THREE.MathUtils.damp(outer.current.rotation.x, 0.35, 2, dt)
    }
  })

  const glow = useMemo(
    () => ({
      uniforms: { color: { value: new THREE.Color('#4f8cff') } },
      vertexShader: `varying vec3 vN; varying vec3 vV;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 color; varying vec3 vN; varying vec3 vV;
        void main(){ float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.6); gl_FragColor = vec4(color, f * 0.9); }`,
    }),
    [],
  )

  return (
    <group ref={outer}>
      <group ref={inner} rotation={[0, target ? target.y : 1.2, 0]}>
        <mesh>
          <sphereGeometry args={[radius, 64, 48]} />
          <meshStandardMaterial color="#12203a" roughness={0.7} metalness={0.1} />
        </mesh>
        <Dots radius={radius} />
        {markers.map((m, i) => (
          <Marker key={m.label} m={m} radius={radius} index={i} />
        ))}
      </group>
      <mesh scale={1.025}>
        <sphereGeometry args={[radius, 64, 48]} />
        <shaderMaterial args={[glow]} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh scale={1.18}>
        <sphereGeometry args={[radius, 48, 32]} />
        <meshBasicMaterial color="#2d5bd1" transparent opacity={0.05} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  )
}
