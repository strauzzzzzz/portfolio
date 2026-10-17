import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

const BASE_SPEED = 48 // px/s, leftwards
const DRAG_THRESHOLD = 6 // px before a press counts as a drag, not a click

/**
 * A looping marquee driven by requestAnimationFrame so it can ease to a stop
 * under the cursor, ease back up to speed, and be dragged with inertia.
 * `children` is rendered twice to make the loop seamless.
 */
export default function FeaturedMarquee({ children }: { children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = wrap.current
    const el = track.current
    if (!root || !el) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let x = 0
    let v = reduced ? 0 : -BASE_SPEED
    let loopWidth = 0
    let hover = false
    let dragging = false
    let pressed = false
    let moved = 0
    let lastX = 0
    let lastT = 0
    let suppressClick = false
    let inView = true
    let raf = 0
    let prev = performance.now()

    const measure = () => {
      loopWidth = el.scrollWidth / 2
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min((now - prev) / 1000, 0.05)
      prev = now
      if (!inView) return

      if (!dragging) {
        // Ease toward the resting speed: 0 while hovered, cruising otherwise.
        // Slowing down is quicker than speeding back up, so it feels responsive on entry
        // and relaxed on exit.
        const target = hover || reduced ? 0 : -BASE_SPEED
        const rate = hover ? 5 : 1.6
        v += (target - v) * (1 - Math.exp(-dt * rate))
        x += v * dt
      }

      if (loopWidth > 0) {
        x %= loopWidth
        if (x > 0) x -= loopWidth
      }
      el.style.transform = `translate3d(${x}px,0,0)`
    }
    raf = requestAnimationFrame(frame)

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      prev = performance.now()
    })
    io.observe(root)

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') hover = true
    }
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') hover = false
    }

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      pressed = true
      dragging = false
      moved = 0
      lastX = e.clientX
      lastT = performance.now()
    }

    const onMove = (e: PointerEvent) => {
      if (!pressed) return
      const now = performance.now()
      const dx = e.clientX - lastX
      moved += Math.abs(dx)

      if (!dragging && moved > DRAG_THRESHOLD) {
        dragging = true
        // Only capture once it is a real drag, so plain clicks still reach the links.
        root.setPointerCapture(e.pointerId)
        root.dataset.dragging = '1'
      }
      if (dragging) {
        x += dx
        const dtMs = Math.max(now - lastT, 1)
        // Smoothed release velocity (px/s) for the throw.
        v = v * 0.7 + ((dx / dtMs) * 1000) * 0.3
      }
      lastX = e.clientX
      lastT = now
    }

    const end = (e: PointerEvent) => {
      if (!pressed) return
      pressed = false
      if (dragging) {
        dragging = false
        suppressClick = true
        window.setTimeout(() => (suppressClick = false), 0)
        delete root.dataset.dragging
        if (root.hasPointerCapture(e.pointerId)) root.releasePointerCapture(e.pointerId)
        // A stale flick shouldn't launch the strip: stop the velocity if the pointer paused.
        if (performance.now() - lastT > 120) v = 0
        v = Math.max(Math.min(v, 2400), -2400)
      }
    }

    const onClickCapture = (e: MouseEvent) => {
      if (suppressClick) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    const onDragStart = (e: Event) => e.preventDefault()

    root.addEventListener('pointerenter', onEnter)
    root.addEventListener('pointerleave', onLeave)
    root.addEventListener('pointerdown', onDown)
    root.addEventListener('pointermove', onMove)
    root.addEventListener('pointerup', end)
    root.addEventListener('pointercancel', end)
    root.addEventListener('click', onClickCapture, true)
    root.addEventListener('dragstart', onDragStart)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      root.removeEventListener('pointerenter', onEnter)
      root.removeEventListener('pointerleave', onLeave)
      root.removeEventListener('pointerdown', onDown)
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerup', end)
      root.removeEventListener('pointercancel', end)
      root.removeEventListener('click', onClickCapture, true)
      root.removeEventListener('dragstart', onDragStart)
    }
  }, [])

  return (
    <div ref={wrap} className="featured-marquee">
      <div ref={track} className="featured-track">
        {children}
        {children}
      </div>
    </div>
  )
}
