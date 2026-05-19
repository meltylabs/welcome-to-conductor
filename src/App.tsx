import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'

type Direction = 'ltr' | 'rtl'

type Train = {
  id: number
  emoji: string
  lane: number
  direction: Direction
  durationMs: number
  startedAt: number
}

type Puff = {
  id: number
  x: number
  y: number
  char: string
}

const TRAIN_EMOJIS = ['🚂', '🚃', '🚅', '🚋', '🚄']
const PUFF_CHARS = ['·', '°', '・', '∘']
const LANE_COUNT = 5
const DISPATCH_THROTTLE_MS = 120
const PUFF_COUNT = 4
const MIN_DURATION_MS = 4500
const MAX_DURATION_MS = 7500
const STARS = [
  { left: 8, top: 12, size: 'sm', delay: 0 },
  { left: 18, top: 28, size: 'md', delay: 0.6 },
  { left: 31, top: 9, size: 'sm', delay: 1.1 },
  { left: 46, top: 22, size: 'lg', delay: 0.2 },
  { left: 61, top: 13, size: 'sm', delay: 1.5 },
  { left: 73, top: 31, size: 'md', delay: 0.8 },
  { left: 86, top: 16, size: 'sm', delay: 1.9 },
  { left: 94, top: 36, size: 'lg', delay: 0.4 },
] as const

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function readSetting(key: string) {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function writeSetting(key: string, value: boolean) {
  try {
    localStorage.setItem(key, value ? '1' : '0')
  } catch {
    // Storage can be blocked in embedded previews; the in-memory toggle should still work.
  }
}

function App() {
  const [trains, setTrains] = useState<Train[]>([])
  const [puffs, setPuffs] = useState<Puff[]>([])
  const [count, setCount] = useState(0)
  const [muted, setMuted] = useState<boolean>(() => readSetting('wtc:muted'))
  const [nightMode, setNightMode] = useState<boolean>(() => readSetting('wtc:night'))
  const [hasDispatched, setHasDispatched] = useState(false)

  const nextIdRef = useRef(1)
  const lastDispatchRef = useRef(0)
  const lastLaneRef = useRef(-1)
  const lastDirRef = useRef<Direction>('rtl')
  const chooRef = useRef<HTMLAudioElement | null>(null)
  const mutedRef = useRef(muted)

  useEffect(() => {
    mutedRef.current = muted
    writeSetting('wtc:muted', muted)
  }, [muted])

  useEffect(() => {
    writeSetting('wtc:night', nightMode)
  }, [nightMode])

  useEffect(() => {
    if (chooRef.current) return
    const choo = new Audio('/choo-choo.mp3')
    choo.preload = 'auto'
    chooRef.current = choo
  }, [])

  useEffect(() => {
    document.title =
      count === 0
        ? 'welcome to conductor'
        : `welcome to conductor (${count})`
  }, [count])

  const playChoo = useCallback(() => {
    if (mutedRef.current) return
    const choo = chooRef.current
    if (!choo) return
    const node = choo.cloneNode(true) as HTMLAudioElement
    node.volume = 0.28
    node.play().catch(() => {})
  }, [])

  const removeTrain = useCallback((id: number) => {
    setTrains((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const removePuff = useCallback((id: number) => {
    setPuffs((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const dispatch = useCallback(() => {
    const now = performance.now()
    if (now - lastDispatchRef.current < DISPATCH_THROTTLE_MS) return
    lastDispatchRef.current = now

    let lane = Math.floor(Math.random() * LANE_COUNT)
    if (lane === lastLaneRef.current) lane = (lane + 1) % LANE_COUNT
    lastLaneRef.current = lane

    const direction: Direction = lastDirRef.current === 'ltr' ? 'rtl' : 'ltr'
    lastDirRef.current = direction

    const durationMs = MIN_DURATION_MS + Math.random() * (MAX_DURATION_MS - MIN_DURATION_MS)
    const train: Train = {
      id: nextIdRef.current++,
      emoji: pick(TRAIN_EMOJIS),
      lane,
      direction,
      durationMs,
      startedAt: now,
    }

    setTrains((prev) => [...prev, train])
    setCount((c) => c + 1)
    setHasDispatched(true)
    playChoo()

    const y = 10 + train.lane * 16
    for (let i = 0; i < PUFF_COUNT; i++) {
      const t = (train.durationMs / (PUFF_COUNT + 1)) * (i + 1)
      setTimeout(() => {
        const elapsed = performance.now() - train.startedAt
        const progress = Math.min(elapsed / train.durationMs, 1)
        const x =
          train.direction === 'ltr' ? -15 + 130 * progress : 115 - 130 * progress
        setPuffs((prev) => [
          ...prev,
          { id: nextIdRef.current++, x, y, char: pick(PUFF_CHARS) },
        ])
      }, t)
    }
  }, [playChoo])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        dispatch()
      } else if (e.key === 'm' || e.key === 'M') {
        setMuted((m) => !m)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dispatch])

  return (
    <main
      className={nightMode ? 'night' : undefined}
      onClick={dispatch}
    >
      <div className="night-sky" aria-hidden="true">
        <div className="moon" />
        {STARS.map((star, index) => (
          <span
            key={index}
            className={`star ${star.size}`}
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
        <div className="sleeping-city">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className={`hero${hasDispatched ? ' dispatched' : ''}`} aria-hidden={hasDispatched}>
        <span className="train-emoji" role="img" aria-label="train">🚂</span>
        <span className="tagline">click anywhere to dispatch a train</span>
      </div>

      {trains.map((t) => (
        <span
          key={t.id}
          className={`train ${t.direction}`}
          style={{
            top: `${10 + t.lane * 16}vh`,
            animationDuration: `${t.durationMs}ms`,
          }}
          onAnimationEnd={() => removeTrain(t.id)}
        >
          {t.emoji}
        </span>
      ))}

      {puffs.map((p) => (
        <span
          key={p.id}
          className="steam"
          style={{ left: `${p.x}vw`, top: `${p.y}vh` }}
          onAnimationEnd={() => removePuff(p.id)}
        >
          {p.char}
        </span>
      ))}

      <div className="controls">
        <button
          className="icon-toggle"
          onClick={(e) => {
            e.stopPropagation()
            setNightMode((n) => !n)
          }}
          aria-label={nightMode ? 'Switch to day mode' : 'Switch to night mode'}
          aria-pressed={nightMode}
        >
          {nightMode ? '☀️' : '🌙'}
        </button>

        <button
          className="icon-toggle"
          onClick={(e) => {
            e.stopPropagation()
            setMuted((m) => !m)
          }}
          aria-label={muted ? 'Unmute' : 'Mute'}
          aria-pressed={muted}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      <div className="counter" aria-live="polite">
        {count} {count === 1 ? 'train' : 'trains'} dispatched
      </div>
    </main>
  )
}

export default App
