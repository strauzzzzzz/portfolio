import { Suspense, lazy, useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import Button from './Button'
import Magnetic from './Magnetic'
import {
  Sticker,
  RocketGlyph,
  CoinGlyph,
  SparkGlyph,
  BoltGlyph,
  CheckGlyph,
  StarGlyph,
} from './Stickers'
import { useLanguage } from '../i18n/LanguageContext'
import { profile } from '../data'
import { isIntroDone } from '../lib/intro'

const HeroGl = lazy(() => import('./HeroGl'))

export default function Hero({
  scrollRef,
}: {
  scrollRef: MutableRefObject<number>
}) {
  const { t } = useLanguage()
  const nameRef = useRef<HTMLHeadingElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const name = nameRef.current
    const content = contentRef.current
    if (!name || !content) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(name, { opacity: 1 })
      gsap.set(content.querySelectorAll('.hero-in'), { opacity: 1 })
      return
    }

    const split = new SplitText(name, {
      type: 'chars',
      charsClass: 'hero-char',
    })
    if (!split.chars || !split.chars.length) return
    const chars = split.chars

    chars.forEach((char) => {
      gsap.set(char, {
        y: 130,
        opacity: 0,
        rotation: gsap.utils.random(-28, 28),
        scale: 0.4,
        filter: 'blur(8px)',
      })
    })
    gsap.set(name, { opacity: 1 })

    const tl = gsap.timeline({ paused: true })
    tl.to(
      chars,
      {
        y: 0,
        opacity: 1,
        rotation: 0,
        scale: 1,
        filter: 'blur(0px)',
        stagger: 0.07,
        duration: 1.1,
        ease: 'back.out(1.7)',
      },
      0,
    )
    tl.fromTo(
      content.querySelectorAll('.hero-in'),
      { y: 26, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power3.out',
      },
      '-=0.4',
    )

    const play = () => tl.play()
    if (isIntroDone()) play()
    else window.addEventListener('intro-done', play)

    return () => {
      window.removeEventListener('intro-done', play)
      split.revert()
      tl.kill()
    }
  }, [])

  return (
    <section
      id="top"
      className="relative min-h-[100svh] overflow-hidden bg-sky-wash"
    >
      <Suspense fallback={null}>
        <HeroGl scrollRef={scrollRef} />
      </Suspense>

      <div
        ref={contentRef}
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1440px] flex-col items-center justify-center px-6 py-24 text-center"
      >
        <span className="hero-in outline mb-8 rounded-full bg-paper-white px-4 py-2 font-aeonik-pro text-xs font-bold uppercase tracking-[0.032em]">
          <span className="text-ember">✦</span> {t.hero.eyebrow}
        </span>

        <h1
          ref={nameRef}
          className="hero-name display select-none"
          style={{ fontSize: 'clamp(48px, 15vw, 300px)' }}
        >
          {profile.name}
        </h1>

        <p className="hero-in mt-4 max-w-xl font-aeonik-pro text-xl font-medium leading-snug text-carbon/80 md:text-2xl">
          {t.hero.tagline}
        </p>

        <div className="hero-in mt-10 flex flex-wrap items-center justify-center gap-3">
          <Magnetic>
            <Button section="work" variant="fill" accent="#ffd731">
              {t.hero.viewWork}
            </Button>
          </Magnetic>
          <Magnetic>
            <Button section="contact" variant="fill" accent="#55db9c">
              {t.hero.getInTouch}
            </Button>
          </Magnetic>
        </div>
      </div>

      <Sticker
        color="#fb4903"
        size={72}
        rotate={12}
        className="left-[8%] top-[22%]"
      >
        <RocketGlyph color="#fff" />
      </Sticker>
      <Sticker
        color="#ffd731"
        size={64}
        rotate={-10}
        radius={32}
        className="right-[10%] top-[30%] max-sm:hidden"
      >
        <CoinGlyph />
      </Sticker>
      <Sticker
        color="#55db9c"
        size={58}
        rotate={8}
        className="left-[16%] bottom-[18%]"
      >
        <CheckGlyph />
      </Sticker>
      <Sticker
        color="#5c4ade"
        size={60}
        rotate={-14}
        radius={16}
        className="right-[16%] bottom-[24%]"
      >
        <SparkGlyph color="#fff" />
      </Sticker>
      <Sticker
        color="#e9ccff"
        size={52}
        rotate={18}
        className="left-[42%] top-[12%] max-sm:hidden"
      >
        <BoltGlyph />
      </Sticker>
      <Sticker
        color="#ffd731"
        size={48}
        rotate={-8}
        radius={14}
        className="right-[30%] top-[10%]"
      >
        <StarGlyph />
      </Sticker>
    </section>
  )
}
