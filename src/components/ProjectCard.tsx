import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Project } from '../data'
import type { Lang } from '../i18n/translations'
import { storageUrl } from '../lib/supabase'
import { useWipeNavigate } from '../lib/wipe'
import ProjectImage from './ProjectImage'

type Clip = { type: 'image' | 'video'; src: string } | { type: 'eq' }

type CardStyle = {
  align: string
  tags: string
  hint: string
  corner: string
  rotate: string
  size: string
}

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)'
const HIDDEN = 'circle(0px at 50% 50%)'

function mediaSrc(file: string) {
  return encodeURI(storageUrl(file))
}

/** Every photo and video of the project, to pick a random one from on hover. */
function buildPool(project: Project): Clip[] {
  const pool: Clip[] = []
  for (const item of project.items) {
    for (const src of item.images ?? []) pool.push({ type: 'image', src: mediaSrc(src) })
    for (const src of item.video ?? []) pool.push({ type: 'video', src: mediaSrc(src) })
  }
  return pool
}

function Equalizer() {
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-2" aria-hidden>
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className="card-eq-bar"
          style={{ animationDelay: `${i * -0.17}s`, animationDuration: `${0.9 + (i % 4) * 0.18}s` }}
        />
      ))}
    </div>
  )
}

export default function ProjectCard({
  project,
  lang,
  style: s,
  viewLabel,
}: {
  project: Project
  lang: Lang
  style: CardStyle
  viewLabel: string
}) {
  const text = project[lang]
  const wipe = useWipeNavigate()
  const pool = useMemo(() => buildPool(project), [project])

  const cardRef = useRef<HTMLAnchorElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const lastPick = useRef(-1)
  const token = useRef(0)
  const [clip, setClip] = useState<Clip | null>(null)
  const [on, setOn] = useState(false)

  // Warm the cache for the stills so the flood never starts on an empty frame.
  useEffect(() => {
    const el = cardRef.current
    if (!el || !pool.length) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        for (const c of pool) {
          if (c.type === 'image') new Image().src = c.src
        }
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [pool])

  function pick(): Clip {
    if (!pool.length) return { type: 'eq' }
    let i = Math.floor(Math.random() * pool.length)
    if (pool.length > 1 && i === lastPick.current) i = (i + 1) % pool.length
    lastPick.current = i
    return pool[i]
  }

  function point(e: PointerEvent) {
    const rect = cardRef.current!.getBoundingClientRect()
    return {
      x: Math.min(Math.max(e.clientX - rect.left, 0), rect.width),
      y: Math.min(Math.max(e.clientY - rect.top, 0), rect.height),
      w: rect.width,
      h: rect.height,
    }
  }

  function animate(
    keyframes: Keyframe[],
    duration: number,
  ): Promise<unknown> {
    const layer = layerRef.current!
    const previous = layer.getAnimations()
    const anim = layer.animate(keyframes, {
      duration,
      easing: EASE_OUT,
      fill: 'forwards',
    })
    previous.forEach((a) => a.cancel())
    return anim.finished.catch(() => {})
  }

  function onEnter(e: PointerEvent) {
    if (e.pointerType !== 'mouse' || !layerRef.current) return
    const { x, y, w, h } = point(e)
    const radius = Math.hypot(Math.max(x, w - x), Math.max(y, h - y))
    token.current++

    setClip(pick())
    setOn(true)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      layerRef.current.style.clipPath = 'none'
      void animate([{ opacity: 0 }, { opacity: 1 }], 200)
      return
    }

    // Start from wherever the layer currently is, so a quick re-enter never jumps.
    const from = getComputedStyle(layerRef.current).clipPath
    void animate(
      [
        { clipPath: from && from !== 'none' ? from : `circle(0px at ${x}px ${y}px)` },
        { clipPath: `circle(${radius}px at ${x}px ${y}px)` },
      ],
      560,
    )
  }

  function onLeave(e: PointerEvent) {
    if (e.pointerType !== 'mouse' || !layerRef.current) return
    const { x, y } = point(e)
    const t = ++token.current
    setOn(false)

    const done = () => {
      if (t === token.current) setClip(null)
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      void animate([{ opacity: 1 }, { opacity: 0 }], 160).then(done)
      return
    }

    const from = getComputedStyle(layerRef.current).clipPath
    void animate(
      [
        { clipPath: from && from !== 'none' ? from : HIDDEN },
        { clipPath: `circle(0px at ${x}px ${y}px)` },
      ],
      420,
    ).then(done)
  }

  return (
    <Link
      ref={cardRef}
      to={`/work/${project.slug}`}
      onClick={(e) => wipe(e, project.color, `/work/${project.slug}`)}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      data-cursor={viewLabel}
      className={`reveal-card group relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-[20px] p-6 outline ${on ? 'card-on' : ''}`}
      style={{ background: project.color }}
    >
      {/* flood layer */}
      <div
        ref={layerRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-carbon"
        style={{ clipPath: HIDDEN }}
      >
        {clip?.type === 'image' && (
          <img
            key={clip.src}
            src={clip.src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {clip?.type === 'video' && (
          <video
            key={clip.src}
            src={clip.src}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {clip?.type === 'eq' && <Equalizer />}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.58) 55%, rgba(0,0,0,0.62))',
          }}
        />
      </div>

      <div className={`card-fg relative z-10 flex max-w-[72%] flex-col ${s.align}`}>
        <h3 className="font-aeonik-pro text-2xl font-bold leading-tight">{text.title}</h3>
        <p className="mt-1 font-aeonik-pro text-sm font-bold uppercase tracking-[0.032em] text-carbon/60">
          {text.category}
        </p>
        <p className="mt-3 font-aeonik-pro text-base font-medium leading-relaxed text-carbon/80">
          {text.description}
        </p>
      </div>

      <div className={`relative z-10 mt-auto flex flex-wrap gap-2 pt-4 ${s.tags}`}>
        {text.tags.map((tag) => (
          <span
            key={tag}
            className="outline rounded-full bg-paper-white/70 px-3 py-1 font-aeonik-pro text-xs font-bold"
          >
            {tag}
          </span>
        ))}
      </div>

      <span
        className={`card-fg relative z-10 mt-4 inline-flex items-center gap-2 font-aeonik-pro text-sm font-bold opacity-0 transition-opacity group-hover:opacity-100 ${s.hint}`}
      >
        {viewLabel} <span aria-hidden>→</span>
      </span>

      <div
        className={`card-sticker pointer-events-none absolute z-[2] ${s.corner}`}
        style={{ transform: `rotate(${s.rotate})` }}
      >
        <ProjectImage
          name={project.image}
          alt={text.title}
          className={`${s.size} sticker-img object-contain`}
        />
      </div>
    </Link>
  )
}
