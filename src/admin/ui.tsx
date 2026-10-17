import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

export const ghostBtn =
  'outline inline-flex items-center justify-center gap-2 rounded-full bg-paper-white px-5 py-2.5 font-aeonik-pro text-sm font-bold transition-[background-color,transform] duration-200 hover:bg-sky-wash active:scale-95 disabled:pointer-events-none disabled:opacity-50'
export const solidBtn =
  'inline-flex items-center justify-center gap-2 rounded-full bg-carbon px-6 py-3 font-aeonik-pro text-sm font-bold text-paper-white transition-[background-color,transform] duration-200 hover:bg-voltage-violet active:scale-95 disabled:pointer-events-none disabled:opacity-50'
export const dangerBtn =
  'outline inline-flex items-center justify-center gap-2 rounded-full bg-paper-white px-5 py-2.5 font-aeonik-pro text-sm font-bold text-ember transition-[background-color,color,transform] duration-200 hover:bg-ember hover:text-paper-white active:scale-95 disabled:pointer-events-none disabled:opacity-50'
export const inputCls =
  'outline admin-input mt-1.5 w-full rounded-[16px] bg-paper-white px-4 py-2.5 font-aeonik-pro text-sm font-medium'
export const labelCls =
  'font-aeonik-pro text-xs font-bold uppercase tracking-[0.032em]'

/* ------------------------------ toast ------------------------------ */

type ToastState = { kind: 'ok' | 'error'; text: string } | null

export function useToast() {
  const [toast, setToast] = useState<ToastState>(null)
  const timer = useRef<number | undefined>(undefined)

  const show = useCallback((kind: 'ok' | 'error', text: string) => {
    window.clearTimeout(timer.current)
    setToast({ kind, text })
    timer.current = window.setTimeout(
      () => setToast(null),
      kind === 'ok' ? 2600 : 6500,
    )
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const node = toast ? (
    <div
      role="status"
      aria-live="polite"
      className={`admin-toast outline fixed bottom-6 left-1/2 z-[300] max-w-[min(92vw,520px)] rounded-full px-6 py-3 text-center font-aeonik-pro text-sm font-bold ${
        toast.kind === 'ok'
          ? 'bg-mint-pop text-carbon'
          : 'bg-ember text-paper-white'
      }`}
    >
      {toast.text}
    </div>
  ) : null

  return { show, node }
}

/* ------------------------------ fields ------------------------------ */

export function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  hint,
  autoFocus,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  disabled?: boolean
  hint?: string
  autoFocus?: boolean
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} disabled:cursor-not-allowed disabled:opacity-60`}
      />
      {hint && (
        <span className="mt-1 block font-aeonik-pro text-xs text-carbon/60">
          {hint}
        </span>
      )}
    </label>
  )
}

export function Area({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} resize-y`}
      />
    </label>
  )
}

/* ------------------------------ modal ------------------------------ */

export function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div
      className="admin-fade fixed inset-0 z-[200] flex items-end justify-center bg-carbon/60 sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="admin-sheet outline flex max-h-[94svh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[28px] bg-sky-wash sm:max-h-[90svh] sm:rounded-[28px]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-carbon/10 px-5 py-4 sm:px-7">
          <h2 className="font-aeonik-pro text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="outline flex h-9 w-9 items-center justify-center rounded-full bg-paper-white text-lg font-bold transition-colors hover:bg-ember hover:text-paper-white"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-carbon/10 bg-paper-white/70 px-5 py-3 sm:px-7">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
