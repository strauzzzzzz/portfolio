import { useLanguage } from '../i18n/LanguageContext'
import Button from './Button'
import { profile } from '../data'
import { useSectionNav } from '../lib/scroll'
import { Sticker, RocketGlyph, MusicGlyph } from './Stickers'
import MiniScene from './MiniScene'

const socials = [{ label: 'Telegram', href: 'https://t.me/mtiwork' }]

export default function Contact() {
  const { t } = useLanguage()
  const goTo = useSectionNav()

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-paper-white py-24 md:py-32"
    >
      <MiniScene className="right-4 top-6 h-72 w-72" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-6">
        <div className="hover-lift outline reveal-card relative overflow-hidden rounded-[40px] bg-voltage-violet px-8 py-16 text-paper-white md:px-16 md:py-20">
          <Sticker
            color="#fb4903"
            size={80}
            rotate={10}
            className="right-[8%] top-[12%]"
          >
            <RocketGlyph color="#fff" />
          </Sticker>
          <Sticker
            color="#55db9c"
            size={54}
            rotate={-12}
            className="left-[7%] bottom-[18%]"
          >
            <MusicGlyph />
          </Sticker>

          <h2
            className="display"
            style={{ fontSize: 'clamp(40px, 8vw, 120px)' }}
          >
            {t.contact.title}
          </h2>
          <p className="mt-4 max-w-md font-aeonik-pro text-lg font-medium text-paper-white/90">
            {t.contact.text}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button href={`mailto:${profile.email}`} accent="#ffd731">
              {profile.email}
            </Button>
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="outline rounded-full px-6 py-3.5 font-aeonik-pro text-sm font-bold tracking-[0.032em] transition-colors duration-200 hover:bg-paper-white hover:text-carbon"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>

        <footer className="mt-24 flex flex-col items-center justify-between gap-6 border-t border-carbon/15 pt-8 md:flex-row">
          <span className="font-aeonik-pro text-sm font-bold tracking-[0.032em]">
            {profile.name} · {new Date().getFullYear()}
          </span>
          <span className="font-aeonik-pro text-sm font-medium text-carbon/60">
            {t.contact.builtWith}
          </span>
          <a
            href="/"
            onClick={(e) => goTo('top', e)}
            className="outline rounded-full bg-paper-white px-5 py-2.5 font-aeonik-pro text-sm font-bold transition-colors duration-200 hover:bg-sky-wash"
          >
            {t.contact.backToTop} ↑
          </a>
        </footer>
      </div>
    </section>
  )
}
