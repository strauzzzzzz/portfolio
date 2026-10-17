import { useCallback } from 'react'
import type { MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'

const EASE = 'cubic-bezier(0.77, 0, 0.175, 1)'

let running = false

function runWipe(color: string, x: number, y: number, go: () => void) {
  if (running) return
  running = true

  const el = document.createElement('div')
  el.setAttribute('aria-hidden', 'true')
  Object.assign(el.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '150',
    background: color,
    clipPath: `circle(0px at ${x}px ${y}px)`,
  })
  document.body.appendChild(el)

  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  )

  const grow = el.animate(
    [
      { clipPath: `circle(0px at ${x}px ${y}px)` },
      { clipPath: `circle(${radius}px at ${x}px ${y}px)` },
    ],
    { duration: 560, easing: EASE, fill: 'forwards' },
  )

  grow.finished
    .then(() => {
      // The new page is the same colour as the cover, so skip its own entry fade.
      document.documentElement.dataset.wiped = '1'
      go()
      // Let the route mount and paint before uncovering it.
      window.setTimeout(() => {
        const out = el.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 380,
          easing: 'ease',
          fill: 'forwards',
        })
        out.finished.finally(() => {
          el.remove()
          delete document.documentElement.dataset.wiped
          running = false
        })
      }, 160)
    })
    .catch(() => {
      el.remove()
      running = false
    })
}

/** Navigate with a colour wipe that expands from the click point. */
export function useWipeNavigate() {
  const navigate = useNavigate()

  return useCallback(
    (e: MouseEvent, color: string, to: string) => {
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      e.preventDefault()
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        navigate(to)
        return
      }
      runWipe(color, e.clientX, e.clientY, () => navigate(to))
    },
    [navigate],
  )
}
