import type { CSSProperties, ReactNode } from 'react'

type StickerProps = {
  color: string
  size?: number
  rotate?: number
  radius?: number
  float?: boolean
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

export function Sticker({
  color,
  size = 56,
  rotate = 0,
  radius = 20,
  float = true,
  className = '',
  style,
  children,
}: StickerProps) {
  return (
    <div
      className={`sticker-float pointer-events-none absolute flex items-center justify-center outline ${className}`}
      style={{
        width: size,
        height: size,
        background: color,
        borderRadius: radius,
        ['--rot' as string]: `${rotate}deg`,
        ...style,
      }}
      data-float={float ? 'true' : 'false'}
    >
      {children}
    </div>
  )
}

type GlyphProps = { size?: number; color?: string }

export function RocketGlyph({ size = 26, color = '#000' }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2c3 3.5 4.5 6.8 4.5 10a4.5 4.5 0 0 1-9 0C7.5 8.8 9 5.5 12 2Z" fill={color} />
      <circle cx="12" cy="11" r="1.7" fill="#fff" />
      <path d="M9.5 15.5c-.4 2-1.4 4-3 5.5l2.3 1c.5-1.8.8-3.6 1-5.2" fill={color} />
      <path d="M14.5 15.5c.4 2 1.4 4 3 5.5l-2.3 1c-.5-1.8-.8-3.6-1-5.2" fill={color} />
    </svg>
  )
}

export function CoinGlyph({ size = 26, color = '#000' }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <path d="M9.5 13.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0-5 0Z" fill={color} />
    </svg>
  )
}

export function CheckGlyph({ size = 26, color = '#000' }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 13l4 4L19 7"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SparkGlyph({ size = 26, color = '#000' }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M12 2c.6 5.6 2.4 7.4 8 8-5.6.6-7.4 2.4-8 8-.6-5.6-2.4-7.4-8-8 5.6-.6 7.4-2.4 8-8Z" />
    </svg>
  )
}

export function BoltGlyph({ size = 26, color = '#000' }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  )
}

export function HeartGlyph({ size = 26, color = '#000' }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M12 20s-7-4.6-9.2-8.4C1.2 8.6 3 5 6.3 5c2 0 3.5 1.2 4.2 2.6h3c.7-1.4 2.2-2.6 4.2-2.6C21 5 22.8 8.6 21.2 11.6 19 15.4 12 20 12 20Z" />
    </svg>
  )
}

export function MusicGlyph({ size = 26, color = '#000' }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 18V6l10-2v12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6.5" cy="18" r="2.5" fill={color} />
      <circle cx="16.5" cy="16" r="2.5" fill={color} />
    </svg>
  )
}

export function SmileyGlyph({ size = 26, color = '#000' }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <circle cx="9" cy="10" r="1.2" fill={color} />
      <circle cx="15" cy="10" r="1.2" fill={color} />
      <path
        d="M8 14c1.2 1.6 2.4 2.2 4 2.2s2.8-.6 4-2.2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function StarGlyph({ size = 26, color = '#000' }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M12 2l2.7 6.3 6.8.6-5.2 4.4 1.6 6.7L12 16.6 6.1 20l1.6-6.7L2.5 8.9l6.8-.6L12 2z" />
    </svg>
  )
}
