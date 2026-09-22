import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'

function hexToRgb(hex: string) {
  const value = hex.replace('#', '')
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value
  const num = Number.parseInt(full, 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

function contrastText(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#000000' : '#ffffff'
}

type ButtonProps = {
  href?: string
  to?: string
  accent?: string
  variant?: 'solid' | 'ghost' | 'fill'
  external?: boolean
  className?: string
  children: ReactNode
}

export default function Button({
  href,
  to,
  accent = '#ffd731',
  variant = 'solid',
  external = false,
  className = '',
  children,
}: ButtonProps) {
  const isFill = variant === 'fill'
  const isGhost = variant === 'ghost'

  const bg = isGhost ? '#ffffff' : isFill ? 'transparent' : '#000000'
  const fg = isGhost || isFill ? '#000000' : '#ffffff'

  const style = {
    '--btn-accent': accent,
    '--btn-text': contrastText(accent),
    '--btn-fg': fg,
    '--btn-bg': bg,
  } as CSSProperties

  const inner = (
    <>
      {isFill && <span className="btn__fill" />}
      <span className="btn__label">{children}</span>
    </>
  )

  const cls = `btn ${isFill ? 'btn--fill' : ''} ${className}`.trim()

  if (to) {
    return (
      <Link to={to} className={cls} style={style}>
        {inner}
      </Link>
    )
  }

  return (
    <a
      href={href ?? '#'}
      className={cls}
      style={style}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
    >
      {inner}
    </a>
  )
}
