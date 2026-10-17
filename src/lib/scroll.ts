import { useCallback } from 'react'
import type { MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getLenis } from './lenis'

const OFFSET = 80

export function scrollToSection(id: string, immediate = false) {
  const el = id === 'top' ? null : document.getElementById(id)
  if (id !== 'top' && !el) return
  const lenis = getLenis()
  if (lenis) {
    lenis.scrollTo(el ?? 0, { offset: el ? -OFFSET : 0, duration: 1.2, immediate })
  } else {
    const top = el ? el.getBoundingClientRect().top + window.scrollY - OFFSET : 0
    window.scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' })
  }
}

/**
 * In-page navigation without touching the URL: scrolls when already on the home page,
 * otherwise goes home and lets ScrollManager scroll once the page has mounted.
 */
export function useSectionNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return useCallback(
    (id: string, e?: MouseEvent) => {
      if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)) return
      e?.preventDefault()
      if (pathname === '/') scrollToSection(id)
      else navigate('/', { state: { section: id } })
    },
    [pathname, navigate],
  )
}
