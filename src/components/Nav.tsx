import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import type { Lang } from '../i18n/translations'
import Button from './Button'
import Magnetic from './Magnetic'
import { profile } from '../data'
import { useSectionNav } from '../lib/scroll'

export default function Nav() {
  const { lang, setLang, t } = useLanguage()
  const goTo = useSectionNav()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Hide the pill while scrolling down, bring it back as soon as the user scrolls up.
  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (y < 60) setScrolled(false)
      else if (y > last + 4) setScrolled(true)
      else if (y < last - 4) setScrolled(false)
      last = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const links = [
    { id: 'work', label: t.nav.work },
    { id: 'about', label: t.nav.about },
    { id: 'skills', label: t.nav.skills },
    { id: 'contact', label: t.nav.contact },
  ]

  return (
    <header
      className={`sticky top-0 z-50 ${scrolled && !menuOpen ? 'nav-hidden' : ''}`}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link to="/" className="flex items-center">
          <span className="outline flex h-10 w-10 items-center justify-center rounded-full bg-paper-white font-aeonik-pro text-base font-bold">
            {profile.name[0]}
          </span>
        </Link>

        <nav className="nav-pill outline hidden items-center gap-1 rounded-full bg-paper-white p-1 md:flex">
          {links.map((link, i) => (
            <a
              key={link.id}
              href="/"
              onClick={(e) => goTo(link.id, e)}
              className="nav-item rounded-full px-4 py-2 font-aeonik-pro text-[13px] font-bold tracking-[0.032em] hover:bg-sky-wash"
              style={{ transitionDelay: `${0.04 + i * 0.04}s` }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="outline flex items-center rounded-full bg-paper-white p-1">
            {(['en', 'ru'] as Lang[]).map((code) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`rounded-full px-3 py-1.5 font-aeonik-pro text-xs font-bold uppercase tracking-[0.032em] transition-colors duration-200 ${
                  lang === code
                    ? 'bg-carbon text-paper-white'
                    : 'text-carbon hover:bg-soft-mist'
                }`}
                aria-pressed={lang === code}
              >
                {code}
              </button>
            ))}
          </div>

          <div className="hidden sm:block">
            <Magnetic>
              <Button section="contact" accent="#fb4903">
                {t.nav.hire}
              </Button>
            </Magnetic>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label="Menu"
            className="outline flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full bg-paper-white md:hidden"
          >
            <span
              className={`h-[2px] w-4 bg-carbon transition-transform duration-300 ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`}
            />
            <span
              className={`h-[2px] w-4 bg-carbon transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`}
            />
            <span
              className={`h-[2px] w-4 bg-carbon transition-transform duration-300 ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`}
            />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="nav-menu outline mx-4 rounded-[24px] bg-paper-white p-2 md:hidden">
          {links.map((link) => (
            <a
              key={link.id}
              href="/"
              onClick={(e) => {
                setMenuOpen(false)
                goTo(link.id, e)
              }}
              className="block rounded-full px-5 py-3 font-aeonik-pro text-base font-bold transition-colors hover:bg-sky-wash"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
