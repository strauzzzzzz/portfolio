import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import type { Lang } from '../i18n/translations'
import Button from './Button'
import Magnetic from './Magnetic'
import { profile } from '../data'

export default function Nav() {
  const { lang, setLang, t } = useLanguage()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { to: '/#work', label: t.nav.work },
    { to: '/#about', label: t.nav.about },
    { to: '/#skills', label: t.nav.skills },
    { to: '/#contact', label: t.nav.contact },
  ]

  return (
    <header className={`sticky top-0 z-50 ${scrolled ? 'nav-hidden' : ''}`}>
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link to="/" className="flex items-center">
          <span className="outline flex h-10 w-10 items-center justify-center rounded-full bg-paper-white font-aeonik-pro text-base font-bold">
            {profile.name[0]}
          </span>
        </Link>

        <nav className="nav-pill outline hidden items-center gap-1 rounded-full bg-paper-white p-1 md:flex">
          {links.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              className="nav-item rounded-full px-4 py-2 font-aeonik-pro text-[13px] font-bold tracking-[0.032em] hover:bg-sky-wash"
              style={{ transitionDelay: `${0.04 + i * 0.04}s` }}
            >
              {link.label}
            </Link>
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

          <Magnetic>
            <Button to="/#contact" accent="#fb4903">
              {t.nav.hire}
            </Button>
          </Magnetic>
        </div>
      </div>
    </header>
  )
}
