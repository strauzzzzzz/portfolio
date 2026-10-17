import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'

const BARS = 72
const peaksCache = new Map<string, number[]>()
let sharedCtx: AudioContext | null = null

function fmt(sec: number) {
  if (!Number.isFinite(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Decode the file once and boil it down to a handful of bar heights. */
async function loadPeaks(src: string): Promise<number[]> {
  const cached = peaksCache.get(src)
  if (cached) return cached

  const res = await fetch(src)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.arrayBuffer()
  sharedCtx ??= new AudioContext()
  const buffer = await sharedCtx.decodeAudioData(data)

  const channel = buffer.getChannelData(0)
  const size = Math.floor(channel.length / BARS)
  const peaks: number[] = []
  for (let i = 0; i < BARS; i++) {
    let sum = 0
    const start = i * size
    // Sample the bucket instead of walking every frame — plenty for 72 bars.
    const step = Math.max(1, Math.floor(size / 400))
    let n = 0
    for (let j = 0; j < size; j += step) {
      const v = channel[start + j]
      sum += v * v
      n++
    }
    peaks.push(Math.sqrt(sum / Math.max(n, 1)))
  }
  const max = Math.max(...peaks, 0.0001)
  const out = peaks.map((p) => Math.max(0.08, Math.pow(p / max, 0.8)))
  peaksCache.set(src, out)
  return out
}

export default function AudioPlayer({
  src,
  index,
  onError,
}: {
  src: string
  index: number
  onError?: () => void
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const audio = useRef<HTMLAudioElement>(null)
  const bars = useRef<HTMLDivElement>(null)
  const raf = useRef(0)
  const [peaks, setPeaks] = useState<number[] | null>(peaksCache.get(src) ?? null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  // Decode the waveform only when the player scrolls into view.
  useEffect(() => {
    const el = wrap.current
    if (!el || peaks) return
    let cancelled = false
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        loadPeaks(src)
          .then((p) => !cancelled && setPeaks(p))
          .catch(() => !cancelled && setPeaks(Array.from({ length: BARS }, (_, i) => 0.3 + 0.25 * Math.sin(i / 3))))
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => {
      cancelled = true
      io.disconnect()
    }
  }, [src, peaks])

  // One track at a time.
  useEffect(() => {
    const onOther = (e: Event) => {
      if ((e as CustomEvent).detail !== audio.current) audio.current?.pause()
    }
    window.addEventListener('portfolio-audio-play', onOther)
    return () => window.removeEventListener('portfolio-audio-play', onOther)
  }, [])

  const tick = useCallback(() => {
    const a = audio.current
    if (a && a.duration) setProgress(a.currentTime / a.duration)
    raf.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  function toggle() {
    const a = audio.current
    if (!a) return
    if (a.paused) void a.play().catch(() => {})
    else a.pause()
  }

  function seekFromPointer(e: PointerEvent<HTMLDivElement>) {
    const a = audio.current
    const el = bars.current
    if (!a || !el || !a.duration) return
    const rect = el.getBoundingClientRect()
    const f = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
    a.currentTime = f * a.duration
    setProgress(f)
  }

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const a = audio.current
    if (!a) return
    if (e.key === 'ArrowRight') a.currentTime = Math.min(a.currentTime + 5, a.duration || 0)
    else if (e.key === 'ArrowLeft') a.currentTime = Math.max(a.currentTime - 5, 0)
    else return
    e.preventDefault()
    setProgress(a.duration ? a.currentTime / a.duration : 0)
  }

  const list = peaks ?? Array.from({ length: BARS }, () => 0.1)

  return (
    <div
      ref={wrap}
      className="outline flex items-center gap-4 rounded-[24px] bg-paper-white/70 p-4 sm:gap-5 sm:p-5"
    >
      <audio
        ref={audio}
        src={src}
        preload="metadata"
        onError={onError}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => {
          window.dispatchEvent(new CustomEvent('portfolio-audio-play', { detail: audio.current }))
          setPlaying(true)
          cancelAnimationFrame(raf.current)
          raf.current = requestAnimationFrame(tick)
        }}
        onPause={() => {
          setPlaying(false)
          cancelAnimationFrame(raf.current)
        }}
        onEnded={() => {
          setPlaying(false)
          setProgress(0)
          cancelAnimationFrame(raf.current)
        }}
      />

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause' : 'Play'}
        className="player-btn flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-carbon text-paper-white"
      >
        {playing ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <rect x="5" y="4" width="5" height="16" rx="1.5" />
            <rect x="14" y="4" width="5" height="16" rx="1.5" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z" />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div
          ref={bars}
          role="slider"
          tabIndex={0}
          aria-label={`Track ${index + 1}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          onKeyDown={onKey}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            seekFromPointer(e)
          }}
          onPointerMove={(e) => {
            if (e.buttons === 1) seekFromPointer(e)
          }}
          className="flex h-14 cursor-pointer touch-none items-center gap-[2px]"
        >
          {list.map((p, i) => (
            <span
              key={i}
              className={`wave-bar ${peaks ? 'wave-bar--in' : ''} ${i / BARS < progress ? 'wave-bar--played' : ''}`}
              style={{
                height: `${Math.round(p * 100)}%`,
                animationDelay: `${i * 7}ms`,
              }}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between font-aeonik-pro text-xs font-bold tabular-nums text-carbon/60">
          <span>{fmt(progress * duration)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>
    </div>
  )
}
