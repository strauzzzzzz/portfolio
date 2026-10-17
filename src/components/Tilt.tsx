import { useRef } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import gsap from 'gsap'

export default function Tilt({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    gsap.to(el, {
      rotateY: x * 12,
      rotateX: -y * 12,
      scale: 1.03,
      transformPerspective: 800,
      duration: 0.45,
      ease: 'power2.out',
    })
  }

  const onLeave = () => {
    gsap.to(ref.current, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.7,
      ease: 'elastic.out(1, 0.35)',
    })
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
    >
      {children}
    </div>
  )
}
