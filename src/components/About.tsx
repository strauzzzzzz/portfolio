import { useLanguage } from '../i18n/LanguageContext'
import {
  Sticker,
  HeartGlyph,
  SparkGlyph,
  SmileyGlyph,
  MusicGlyph,
} from './Stickers'
import MiniScene from './MiniScene'

export default function About() {
  const { t } = useLanguage()

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-concrete-gray py-24 md:py-32"
    >
      <MiniScene className="right-4 top-6 h-72 w-72" />

      <Sticker
        color="#55db9c"
        size={64}
        rotate={-12}
        className="right-[12%] top-[16%]"
      >
        <HeartGlyph />
      </Sticker>
      <Sticker
        color="#ffd731"
        size={52}
        rotate={14}
        className="left-[10%] bottom-[14%]"
      >
        <SparkGlyph />
      </Sticker>
      <Sticker
        color="#e9ccff"
        size={48}
        rotate={-8}
        className="right-[24%] bottom-[22%]"
      >
        <SmileyGlyph />
      </Sticker>
      <Sticker
        color="#4da2ff"
        size={50}
        rotate={10}
        className="left-[20%] top-[12%]"
      >
        <MusicGlyph color="#fff" />
      </Sticker>

      <div className="relative z-10 mx-auto max-w-[1440px] px-6">
        <div className="text-center">
          <span className="outline reveal inline-block rounded-full bg-paper-white px-4 py-2 font-aeonik-pro text-xs font-bold uppercase tracking-[0.032em]">
            {t.about.eyebrow}
          </span>
          <h2
            className="display reveal-text mt-4"
            style={{
              fontSize: 'clamp(40px, 8vw, 120px)',
              letterSpacing: '0.05em',
            }}
          >
            {t.about.title}
          </h2>
        </div>

        <div className="reveal-drop liquid-glass mt-10 p-8 font-aeonik-pro text-lg font-medium leading-relaxed text-carbon/90 md:p-10">
          <p>{t.about.p1}</p>
          <p className="mt-5">{t.about.p2}</p>
          <p className="mt-5">{t.about.p3}</p>
        </div>
      </div>
    </section>
  )
}
