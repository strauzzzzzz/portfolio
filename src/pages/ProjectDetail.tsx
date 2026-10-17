import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { useLanguage } from '../i18n/LanguageContext'
import { profile } from '../data'
import type { WorkItem } from '../data'
import type { Lang, Translations } from '../i18n/translations'
import { useData } from '../context/DataContext'
import { storageUrl } from '../lib/supabase'
import Button from '../components/Button'
import Magnetic from '../components/Magnetic'
import ProjectImage from '../components/ProjectImage'
import { Sticker, SparkGlyph } from '../components/Stickers'

function mediaSrc(file: string) {
  return encodeURI(storageUrl(file))
}

function TelegramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

function VideoPreview({ src, openLabel }: { src: string; openLabel: string }) {
  const [open, setOpen] = useState(false)
  const [failed, setFailed] = useState(false)
  if (failed) return null

  return (
    <>
      <div className="group relative overflow-hidden rounded-[24px] outline">
        <video
          src={src}
          autoPlay
          muted
          loop
          playsInline
          onError={() => setFailed(true)}
          className="max-h-[440px] w-full bg-black/10 object-cover"
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute inset-0 flex items-center justify-center bg-carbon/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <span className="outline rounded-full bg-paper-white px-5 py-2.5 font-aeonik-pro text-sm font-bold text-carbon">
            ⛶ {openLabel}
          </span>
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={src}
              autoPlay
              controls
              className="max-h-[90vh] w-full rounded-[16px] object-contain"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="outline absolute -right-3 -top-3 flex h-11 w-11 items-center justify-center rounded-full bg-paper-white text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function ImagePreview({
  src,
  alt,
  openLabel,
  className = 'max-h-[440px] w-full object-cover',
}: {
  src: string
  alt: string
  openLabel: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [failed, setFailed] = useState(false)
  if (failed) return null

  return (
    <>
      <div className="group relative overflow-hidden rounded-[24px] outline">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={className}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute inset-0 flex items-center justify-center bg-carbon/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <span className="outline rounded-full bg-paper-white px-5 py-2.5 font-aeonik-pro text-sm font-bold text-carbon">
            ⛶ {openLabel}
          </span>
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              className="max-h-[90vh] w-auto max-w-full rounded-[16px] object-contain"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="outline absolute -right-3 -top-3 flex h-11 w-11 items-center justify-center rounded-full bg-paper-white text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function AudioItem({ src }: { src: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    <div className="outline rounded-[20px] bg-paper-white/40 p-4">
      <audio
        src={src}
        controls
        onError={() => setFailed(true)}
        className="w-full"
      />
    </div>
  )
}

function ItemMedia({
  item,
  label,
  lang,
  t,
}: {
  item: WorkItem
  label: string
  lang: Lang
  t: Translations
}) {
  const video = item.video ?? []
  const audio = item.audio ?? []
  const images = item.images ?? []
  const desc = item.desc ? item.desc[lang] : null

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
      <div className="space-y-4">
        {video.map((v) => (
          <VideoPreview key={v} src={mediaSrc(v)} openLabel={t.work.openFull} />
        ))}
        {audio.length > 0 && (
          <div className="space-y-4">
            {audio.map((a) => (
              <AudioItem key={a} src={mediaSrc(a)} />
            ))}
          </div>
        )}
        {images.length === 1 && (
          <ImagePreview
            src={mediaSrc(images[0])}
            alt={label}
            openLabel={t.work.openFull}
          />
        )}
        {images.length > 1 && (
          <div className="grid grid-cols-2 gap-4">
            {images.map((img) => (
              <ImagePreview
                key={img}
                src={mediaSrc(img)}
                alt={label}
                openLabel={t.work.openFull}
                className="aspect-[4/3] w-full object-cover"
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="font-aeonik-pro text-2xl font-bold">{label}</h2>
        {desc && (
          <p className="font-aeonik-pro text-lg font-medium leading-relaxed text-carbon/90">
            {desc}
          </p>
        )}
        <Magnetic>
          <Button href={profile.telegram} external accent="#ffd731">
            <TelegramIcon /> {t.work.order}
          </Button>
        </Magnetic>
      </div>
    </div>
  )
}

export default function ProjectDetail() {
  const { slug } = useParams()
  const { lang, t } = useLanguage()
  const { projects } = useData()
  const project = projects.find((p) => p.slug === slug)
  const [searchParams] = useSearchParams()
  const itemParam = searchParams.get('item')
  const titleRef = useRef<HTMLHeadingElement>(null)

  // ?item= can only be resolved once the data has loaded, so derive it during render;
  // a manual pick wins until the route or query changes.
  const routeKey = `${slug}|${itemParam}`
  const [picked, setPicked] = useState<{ key: string; index: number } | null>(null)
  const maxIndex = project ? Math.max(project.items.length - 1, 0) : 0
  const paramIndex = Number(itemParam)
  const fromParam =
    itemParam !== null && Number.isFinite(paramIndex)
      ? Math.min(Math.max(paramIndex, 0), maxIndex)
      : 0
  const active = picked && picked.key === routeKey ? picked.index : fromParam
  const setActive = (index: number) => setPicked({ key: routeKey, index })

  useEffect(() => {
    const title = titleRef.current
    if (!title) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(title, { opacity: 1 })
      return
    }
    const split = new SplitText(title, {
      type: 'words,chars',
      wordsClass: 'detail-word',
      charsClass: 'detail-char',
    })
    gsap.set(title, { opacity: 1 })
    gsap.from(split.chars, {
      x: -50,
      opacity: 0,
      filter: 'blur(7px)',
      stagger: 0.035,
      duration: 0.7,
      ease: 'power4.out',
    })
    return () => split.revert()
  }, [project])

  if (!project) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center bg-sky-wash px-6 text-center">
        <h1 className="display" style={{ fontSize: 'clamp(64px, 15vw, 240px)' }}>
          404
        </h1>
        <Button to="/" variant="ghost" accent="#ffd731" className="mt-6">
          ← {t.work.back}
        </Button>
      </section>
    )
  }

  const text = project[lang]
  const related = projects.filter(
    (p) => p.en.category === project.en.category && p.slug !== project.slug,
  )
  const current = project.items[Math.min(active, project.items.length - 1)]

  return (
    <section
      className="relative min-h-screen overflow-hidden"
      style={{ background: project.color }}
    >
      <Sticker
        color="#ffd731"
        size={72}
        rotate={12}
        className="right-[8%] top-[10%]"
      >
        <SparkGlyph />
      </Sticker>

      <div className="mx-auto max-w-[1440px] px-6 py-16 md:py-20">
        <Button section="work" variant="ghost" accent="#e9ccff">
          ← {t.work.back}
        </Button>

        <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="outline inline-block rounded-full bg-paper-white px-4 py-2 font-aeonik-pro text-xs font-bold uppercase tracking-[0.032em]">
              {text.category}
            </span>
            <h1
              ref={titleRef}
              className="detail-title display mt-5"
              style={{ fontSize: 'clamp(30px, 8vw, 130px)' }}
            >
              {text.title}
            </h1>
          </div>

          <div className="max-w-md space-y-4">
            <div className="flex flex-wrap gap-2">
              {text.tags.map((tag) => (
                <span
                  key={tag}
                  className="outline rounded-full bg-paper-white/70 px-3 py-1 font-aeonik-pro text-xs font-bold"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {project.items.length > 1 && (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project.items.map((item, i) => (
              <button
                key={`${item.en}-${i}`}
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                className={`outline rounded-[20px] p-5 text-left transition-transform duration-200 hover:-translate-y-1 ${
                  i === active
                    ? 'bg-carbon text-paper-white'
                    : 'bg-paper-white/60 text-carbon'
                }`}
              >
                <span className="flex items-center gap-2">
                  {!!item.video?.length && (
                    <span aria-hidden className="text-lg">
                      ▶
                    </span>
                  )}
                  {!!item.audio?.length && (
                    <span aria-hidden className="text-lg">
                      ♪
                    </span>
                  )}
                  {!!item.images?.length && (
                    <span aria-hidden className="text-lg">
                      ▦
                    </span>
                  )}
                  <span className="font-aeonik-pro text-lg font-bold">
                    {item[lang]}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}

        {current && (
          <div className="mt-12 item-in" key={`${project.slug}-${active}`}>
            <ItemMedia
              item={current}
              label={current[lang]}
              lang={lang}
              t={t}
            />
          </div>
        )}

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-aeonik-pro text-2xl font-bold">
              {t.work.related}
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => {
                const pt = p[lang]
                return (
                  <Link
                    key={p.slug}
                    to={`/work/${p.slug}`}
                    className="outline group flex flex-col rounded-[20px] p-6"
                    style={{ background: p.color }}
                  >
                    <ProjectImage
                      name={p.image}
                      alt={pt.title}
                      className="h-14 w-14 object-contain"
                    />
                    <h3 className="mt-4 font-aeonik-pro text-xl font-bold">
                      {pt.title}
                    </h3>
                    <p className="mt-1 font-aeonik-pro text-sm font-bold uppercase tracking-[0.032em] text-carbon/60">
                      {pt.category}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
