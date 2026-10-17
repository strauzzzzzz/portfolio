import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { skills } from '../data'
import { Sticker, StarGlyph, CoinGlyph, HeartGlyph } from './Stickers'
import MiniScene from './MiniScene'

const stickerColors = [
  '#4da2ff',
  '#55db9c',
  '#e9ccff',
  '#fb4903',
  '#ffd731',
  '#5c4ade',
]

export default function Skills() {
  const { lang, t } = useLanguage()

  return (
    <section
      id="skills"
      className="relative overflow-hidden bg-sky-wash py-24 md:py-32"
    >
      <MiniScene className="left-4 bottom-6 h-72 w-72" />

      <Sticker
        color="#ffd731"
        size={56}
        rotate={12}
        className="left-[7%] top-[14%]"
      >
        <StarGlyph />
      </Sticker>
      <Sticker
        color="#55db9c"
        size={52}
        rotate={-12}
        radius={32}
        className="right-[9%] top-[20%]"
      >
        <CoinGlyph />
      </Sticker>
      <Sticker
        color="#e9ccff"
        size={48}
        rotate={10}
        className="right-[18%] bottom-[16%]"
      >
        <HeartGlyph />
      </Sticker>

      <div className="relative z-10 mx-auto max-w-[1440px] px-6">
        <div className="mb-14">
          <span className="outline reveal inline-block rounded-full bg-paper-white px-4 py-2 font-aeonik-pro text-xs font-bold uppercase tracking-[0.032em]">
            {t.skills.eyebrow}
          </span>
          <h2
            className="display reveal-text mt-4"
            style={{ fontSize: 'clamp(48px, 10vw, 150px)' }}
          >
            {t.skills.title}
          </h2>
        </div>

        <div className="reveal-pop-group flex flex-wrap gap-3">
          {skills.map((skill, i) => (
            <Link
              key={skill.en}
              to={`/work/${skill.slug}`}
              className="reveal-pop skill-pill outline rounded-full px-6 py-3 font-aeonik-pro text-base font-bold"
              style={{ background: stickerColors[i % stickerColors.length] }}
            >
              {skill[lang]}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
