import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'

type State = 'idle' | 'link' | 'label'

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, summary'

/**
 * A trailing ring that swells over links and turns into a labelled pill over
 * anything marked with data-cursor="Label". Mouse only; the native cursor stays.
 */
export default function Cursor() {
  const root = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const { pathname } = useLocation()
  const hidden = pathname.startsWith('/admin')

  useEffect(() => {
    const el = root.current
    const dotEl = dot.current
    const text = label.current
    if (!el || !dotEl || !text || hidden) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) return

    // Our cursor replaces the system one entirely.
    document.documentElement.classList.add('custom-cursor')

    gsap.set(el, { x: -100, y: -100 })
    const setDotX = gsap.quickSetter(dotEl, 'x', 'px')
    const setDotY = gsap.quickSetter(dotEl, 'y', 'px')
    const moveX = gsap.quickTo(el, 'x', { duration: 0.3, ease: 'power3.out' })
    const moveY = gsap.quickTo(el, 'y', { duration: 0.3, ease: 'power3.out' })

    const setState = (state: State, name = '') => {
      if (el.dataset.state !== state) {
        el.dataset.state = state
        dotEl.dataset.state = state
      }
      if (text.textContent !== name) text.textContent = name
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      el.dataset.visible = '1'
      dotEl.dataset.visible = '1'
      setDotX(e.clientX)
      setDotY(e.clientY)
      moveX(e.clientX)
      moveY(e.clientY)
    }

    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const target = e.target as Element | null
      const tagged = target?.closest<HTMLElement>('[data-cursor]')
      if (tagged) setState('label', tagged.dataset.cursor)
      else if (target?.closest(INTERACTIVE)) setState('link')
      else setState('idle')
    }

    const onDown = () => (el.dataset.pressed = '1')
    const onUp = () => delete el.dataset.pressed
    const onLeaveWindow = () => {
      delete el.dataset.visible
      delete dotEl.dataset.visible
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.documentElement.addEventListener('pointerleave', onLeaveWindow)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('pointerleave', onLeaveWindow)
      gsap.killTweensOf(el)
      document.documentElement.classList.remove('custom-cursor')
    }
  }, [hidden])

  if (hidden) return null

  return (
    <>
      <div ref={root} className="cursor" data-state="idle" aria-hidden>
        <div className="cursor__ring">
          <span ref={label} className="cursor__label" />
        </div>
      </div>
      <div ref={dot} className="cursor-dot" data-state="idle" aria-hidden />
    </>
  )
}
