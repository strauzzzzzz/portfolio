import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { useData } from '../context/DataContext'
import ProjectCard from './ProjectCard'
import FeaturedMarquee from './FeaturedMarquee'
import { useWipeNavigate } from '../lib/wipe'
import Tilt from './Tilt'

const cardStyles = [
  {
    align: 'self-start items-start text-left',
    tags: 'justify-start',
    hint: 'self-start',
    corner: 'bottom-4 right-4',
    rotate: '-8deg',
    size: 'h-28 w-28',
  },
  {
    align: 'self-end items-end text-right',
    tags: 'justify-end',
    hint: 'self-end',
    corner: 'bottom-5 left-5',
    rotate: '6deg',
    size: 'h-24 w-24',
  },
  {
    align: 'self-start items-start text-left',
    tags: 'justify-start',
    hint: 'self-start',
    corner: 'top-5 right-5',
    rotate: '10deg',
    size: 'h-28 w-28',
  },
  {
    align: 'self-end items-end text-right',
    tags: 'justify-end',
    hint: 'self-end',
    corner: 'top-4 left-4',
    rotate: '-5deg',
    size: 'h-24 w-24',
  },
  {
    align: 'self-start items-start text-left',
    tags: 'justify-start',
    hint: 'self-start',
    corner: 'bottom-4 right-5',
    rotate: '-10deg',
    size: 'h-28 w-28',
  },
  {
    align: 'self-end items-end text-right',
    tags: 'justify-end',
    hint: 'self-end',
    corner: 'bottom-6 left-6',
    rotate: '4deg',
    size: 'h-24 w-24',
  },
]

export default function Projects() {
  const { lang, t } = useLanguage()
  const wipe = useWipeNavigate()
  const { projects, featured, loading, error, refresh } = useData()

  const featuredItems = featured.flatMap((ref) => {
    const project = projects.find((p) => p.slug === ref.project)
    const item = project?.items[ref.item]
    return project && item ? [{ project, item, index: ref.item }] : []
  })

  // Repeat the list until one half of the marquee is wider than any screen,
  // otherwise a short list leaves a visible gap when the track loops.
  const copies = featuredItems.length
    ? Math.max(1, Math.ceil(10 / featuredItems.length))
    : 0
  const half = Array.from({ length: copies }, () => featuredItems).flat()

  return (
    <section
      id="work"
      className="relative overflow-hidden bg-paper-white py-24 md:py-32"
    >

      <div className="relative z-10 mx-auto max-w-[1440px] px-6">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="outline reveal inline-block rounded-full bg-lavender px-4 py-2 font-aeonik-pro text-xs font-bold uppercase tracking-[0.032em]">
              {t.work.eyebrow}
            </span>
            <h2
              className="display reveal-text mt-4"
              style={{ fontSize: 'clamp(48px, 10vw, 150px)' }}
            >
              {t.work.title}
            </h2>
          </div>
          <p className="reveal max-w-sm font-aeonik-pro text-base font-medium leading-relaxed text-carbon/70">
            {t.work.intro}
          </p>
        </div>

        {featuredItems.length > 0 && (
        <div
          className="mb-16 overflow-hidden rounded-[40px] bg-carbon p-6 text-paper-white outline md:p-10"
          data-parallax="30"
        >
          <h3 className="reveal-text font-lateral text-2xl font-extrabold uppercase leading-none md:text-4xl">
            {t.work.featured}
          </h3>
          <div className="mt-8">
            <FeaturedMarquee>
              {half.map(({ project, item, index }, i) => (
                <Link
                  key={`${project.slug}-${index}-${i}`}
                  to={`/work/${project.slug}?item=${index}`}
                  onClick={(e) => wipe(e, project.color, `/work/${project.slug}?item=${index}`)}
                  data-cursor={t.work.viewCase}
                  draggable={false}
                  className="group flex w-[240px] shrink-0 flex-col justify-between rounded-[20px] border border-paper-white/25 bg-paper-white/5 p-4 transition-[transform,background-color,color] duration-200 hover:-translate-y-1 hover:bg-paper-white hover:text-carbon"
                >
                  <span className="font-aeonik-pro text-[11px] font-bold uppercase tracking-[0.032em] text-paper-white/60 transition-colors group-hover:text-carbon/60">
                    {project[lang].category}
                  </span>
                  <span className="font-aeonik-pro text-base font-bold leading-tight">
                    {item[lang]}
                  </span>
                </Link>
              ))}
            </FeaturedMarquee>
          </div>
        </div>
        )}

        {!loading && error && projects.length === 0 && (
          <div className="outline rounded-[24px] bg-paper-white p-8 text-center font-aeonik-pro font-bold">
            <p>Couldn’t load the projects.</p>
            <button
              type="button"
              onClick={() => void refresh()}
              className="outline mt-4 rounded-full px-5 py-2.5 text-sm transition-colors hover:bg-sky-wash"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <Tilt key={project.slug} className="h-full">
              <ProjectCard
                project={project}
                lang={lang}
                style={cardStyles[i % cardStyles.length]}
                viewLabel={t.work.viewCase}
              />
            </Tilt>
          ))}
        </div>
      </div>
    </section>
  )
}
