import { Sparkles, Stars } from '@react-three/drei'
import { Globe, type GlobeMarker } from '../Globe'
import { Rig } from '../common'

const MAIN: GlobeMarker[] = [
  { lat: 9.1, lon: -79.7, label: 'The Panama Canal' },
  { lat: 30.5, lon: 32.4, label: 'The Suez Canal' },
  { lat: 34.5, lon: 118.5, label: 'The Grand Canal' },
]

const OTHERS: GlobeMarker[] = [
  { lat: 54.2, lon: 9.7, label: 'Kiel Canal', tag: 'A' },
  { lat: 37.9, lon: 23, label: 'Corinth Canal', tag: 'B' },
  { lat: 48.6, lon: 44, label: 'Volga–Don Canal', tag: 'C' },
  { lat: 63.5, lon: 34.6, label: 'White Sea–Baltic Canal', tag: 'D' },
  { lat: 43, lon: -76, label: 'Erie Canal', tag: 'E' },
]

function Space() {
  return (
    <>
      <color attach="background" args={['#060a13']} />
      <Stars radius={70} depth={40} count={4000} factor={3.2} saturation={0} fade speed={0.6} />
      <Sparkles count={60} scale={12} size={2} speed={0.25} color="#ff9a5c" opacity={0.5} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[-6, 4, 6]} intensity={2} color="#cfe0ff" />
      <pointLight position={[6, -2, 4]} intensity={30} color="#ff6a1a" />
    </>
  )
}

export function TitleScene() {
  return (
    <>
      <Space />
      <Globe markers={MAIN} spin={0.08} />
      <Rig position={[0, 0.6, 7.4]} minDistance={4.5} maxDistance={14} maxPolar={Math.PI} shift={0.2} />
    </>
  )
}

export function OtherCanalsScene() {
  return (
    <>
      <Space />
      <Globe markers={OTHERS} focus={{ lat: 42, lon: -8 }} />
      <Rig position={[0, 0.3, 6.6]} minDistance={4.5} maxDistance={14} maxPolar={Math.PI} shift={0.2} />
    </>
  )
}
