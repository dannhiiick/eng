import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { SLIDES, resetRise, type SceneKey, type SlideCtx } from './slides'
import type { Metric } from './three/scenes/CompareScene'
import CompareScene from './three/scenes/CompareScene'
import { OtherCanalsScene, TitleScene } from './three/scenes/GlobeScenes'
import ShortcutScene from './three/scenes/ShortcutScene'
import PanamaScene from './three/scenes/PanamaScene'
import SuezScene from './three/scenes/SuezScene'
import GrandCanalScene from './three/scenes/GrandCanalScene'
import JobsScene from './three/scenes/JobsScene'
import FinaleScene from './three/scenes/FinaleScene'

const FADE_MS = 420

function Scene({ name, metric }: { name: SceneKey; metric: Metric }) {
  switch (name) {
    case 'title':
      return <TitleScene />
    case 'shortcut':
      return <ShortcutScene />
    case 'panama':
      return <PanamaScene />
    case 'suez':
      return <SuezScene />
    case 'grand':
      return <GrandCanalScene />
    case 'compare':
      return <CompareScene metric={metric} />
    case 'jobs':
      return <JobsScene />
    case 'others':
      return <OtherCanalsScene />
    case 'finale':
      return <FinaleScene />
  }
}

function IconButton({ label, onClick, disabled, children, primary }: {
  label: string
  onClick: () => void
  disabled?: boolean
  primary?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-all disabled:pointer-events-none disabled:opacity-30 ${
        primary
          ? 'border-[#ff8a4a] bg-[#ff6a1a] text-white shadow-[0_8px_30px_-6px_rgba(255,106,26,0.7)] hover:bg-[#ff7d36]'
          : 'border-white/15 bg-[#0b1220]/60 text-white backdrop-blur hover:border-white/40'
      }`}
    >
      {children}
    </button>
  )
}

const Arrow = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {dir === 'right' ? <path d="M5 12h14M13 6l6 6-6 6" /> : <path d="M19 12H5M11 6l-6 6 6 6" />}
  </svg>
)

export default function App() {
  const [index, setIndex] = useState(0)
  const [shown, setShown] = useState(0)
  const [fading, setFading] = useState(false)
  const [metric, setMetric] = useState<Metric>('length')
  const [name, setNameState] = useState(() => localStorage.getItem('presenter-name') ?? '')
  const timer = useRef<number | undefined>(undefined)

  const setName = useCallback((n: string) => {
    setNameState(n)
    localStorage.setItem('presenter-name', n)
  }, [])

  const go = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(SLIDES.length - 1, i))
      if (next === index) return
      setIndex(next)
      setFading(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => {
        setShown(next)
        setFading(false)
      }, FADE_MS)
    },
    [index],
  )

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen?.()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault()
        go(index + 1)
      } else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) {
        e.preventDefault()
        go(index - 1)
      } else if (e.key === 'Home') go(0)
      else if (e.key === 'End') go(SLIDES.length - 1)
      else if (e.key.toLowerCase() === 'f') toggleFullscreen()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, index, toggleFullscreen])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const slide = SLIDES[shown]
  const ctx: SlideCtx = { metric, setMetric, name, setName }
  resetRise()
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#070b14] font-sans text-white antialiased">
      <div className="absolute inset-0">
        <Canvas shadows dpr={[1, 2]} camera={{ fov: 45, near: 0.1, far: 400, position: [0, 4, 14] }}>
          <Scene key={shown} name={slide.scene} metric={metric} />
        </Canvas>
      </div>

      {/* legibility washes */}
      <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(7,11,20,0.94)_0%,rgba(7,11,20,0.78)_28%,rgba(7,11,20,0.15)_52%,rgba(7,11,20,0)_62%)] lg:block" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(7,11,20,0.97)_0%,rgba(7,11,20,0.85)_48%,rgba(7,11,20,0)_68%)] lg:hidden" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#070b14]/70 to-transparent" />

      <div
        className="pointer-events-none absolute inset-0 z-40 bg-[#070b14] transition-opacity ease-out"
        style={{ opacity: fading ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
      />

      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 pt-5 lg:px-14 lg:pt-8">
        <button type="button" onClick={() => go(0)} className="flex items-center gap-2.5 text-left">
          <span className="font-display text-2xl font-semibold leading-none">3.2</span>
          <svg width="16" height="22" viewBox="0 0 16 22" aria-hidden>
            <path d="M0 0h7l9 11-9 11H0l9-11z" fill="#ff6a1a" />
          </svg>
          <span className="text-sm font-semibold text-white/85">Large-scale projects</span>
        </button>
        <div className="flex items-center gap-4">
          <span className="font-display text-sm tabular-nums">
            <span className="text-white">{pad(index + 1)}</span>
            <span className="text-white/35"> / {pad(SLIDES.length)}</span>
          </span>
          <IconButton label="Fullscreen (F)" onClick={toggleFullscreen}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
            </svg>
          </IconButton>
        </div>
      </header>

      <main className="pointer-events-none absolute inset-x-0 bottom-24 z-20 px-6 lg:inset-y-0 lg:bottom-0 lg:right-auto lg:flex lg:w-[min(600px,48vw)] lg:items-center lg:pl-14 lg:pr-4">
        <div
          key={shown}
          className="pointer-events-auto max-h-[52dvh] overflow-y-auto pb-2 lg:max-h-[calc(100dvh-220px)] [scrollbar-width:none]"
        >
          {slide.render(ctx)}
        </div>
      </main>

      <div className="pointer-events-none absolute bottom-28 right-14 z-20 hidden items-center gap-2 rounded-full border border-white/10 bg-[#0b1220]/55 px-4 py-2 text-xs text-white/70 backdrop-blur lg:flex">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff6a1a] opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff6a1a]" />
        </span>
        {slide.caption}
        <span className="text-white/35">· drag to rotate</span>
      </div>

      <footer className="absolute inset-x-0 bottom-0 z-30 flex items-center gap-4 px-6 pb-6 lg:gap-6 lg:px-14 lg:pb-8">
        <IconButton label="Previous slide" onClick={() => go(index - 1)} disabled={index === 0}>
          <Arrow dir="left" />
        </IconButton>
        <nav className="flex flex-1 gap-1.5" aria-label="Slides">
          {SLIDES.map((s, i) => (
            <button
              key={s.nav}
              type="button"
              onClick={() => go(i)}
              aria-current={i === index ? 'step' : undefined}
              className="group flex flex-1 flex-col gap-2 py-2 text-left"
              title={s.nav}
            >
              <span className="relative h-[3px] w-full overflow-hidden rounded-full bg-white/15">
                <span
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                    i < index ? 'w-full bg-white/60' : i === index ? 'w-full bg-[#ff6a1a]' : 'w-0'
                  } group-hover:bg-white`}
                />
              </span>
              <span
                className={`hidden truncate text-[10px] font-bold uppercase tracking-[0.14em] transition-colors xl:block ${
                  i === index ? 'text-white' : 'text-white/35 group-hover:text-white/70'
                }`}
              >
                {s.nav}
              </span>
            </button>
          ))}
        </nav>
        <IconButton label="Next slide" onClick={() => go(index + 1)} disabled={index === SLIDES.length - 1} primary>
          <Arrow dir="right" />
        </IconButton>
      </footer>
    </div>
  )
}
