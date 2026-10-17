import { Component, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import type { CanvasProps } from '@react-three/fiber'

/** Keeps a WebGL failure from taking the whole page down — the section just loses its decoration. */
class GlBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.warn('WebGL scene disabled', error)
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

/**
 * Decorative WebGL canvas: renders only while on screen and the tab is visible,
 * caps the pixel ratio, renders a single still frame for reduced motion,
 * and recovers from context loss.
 */
export default function GlCanvas({
  className = '',
  children,
  ...props
}: Omit<CanvasProps, 'frameloop' | 'dpr'> & { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(true)
  const [tabVisible, setTabVisible] = useState(!document.hidden)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '120px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const onVis = () => setTabVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  const running = inView && tabVisible && !reduced

  return (
    <div ref={wrap} className={className}>
      <GlBoundary>
        <Canvas
          dpr={[1, 1.5]}
          frameloop={running ? 'always' : 'demand'}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          onCreated={({ gl, invalidate }) => {
            const canvas = gl.domElement
            canvas.addEventListener('webglcontextlost', (e) => e.preventDefault())
            canvas.addEventListener('webglcontextrestored', () => invalidate())
          }}
          {...props}
        >
          {children}
        </Canvas>
      </GlBoundary>
    </div>
  )
}
