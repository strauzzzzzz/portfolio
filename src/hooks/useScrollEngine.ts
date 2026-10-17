import { useEffect } from 'react'
import type { MutableRefObject } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import { SplitText } from 'gsap/SplitText'
import { setLenis } from '../lib/lenis'

gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText)
CustomEase.create('slush', '0.65, 0.05, 0, 1')

export function useScrollEngine(
  progressRef: MutableRefObject<number>,
  ready = true,
) {
  useEffect(() => {
    if (!ready) return

    const trackProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      progressRef.current = max > 0 ? window.scrollY / max : 0
    }

    // Reduced motion: no smooth-scroll hijacking, no reveal choreography — just show everything.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(
        '.reveal, .reveal-card, .reveal-drop, .reveal-text, .reveal-pop',
        { opacity: 1 },
      )
      document
        .querySelectorAll('.reveal-pop')
        .forEach((p) => p.classList.add('hoverable'))
      trackProgress()
      window.addEventListener('scroll', trackProgress, { passive: true })
      return () => window.removeEventListener('scroll', trackProgress)
    }

    const lenis = new Lenis({
      lerp: 0.12,
      wheelMultiplier: 1,
    })
    setLenis(lenis)

    lenis.on('scroll', trackProgress)
    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const splits: SplitText[] = []

    const ctx = gsap.context(() => {
      // Generic blocks — bouncy rise + slight scale
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 50, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.85,
            ease: 'back.out(1.2)',
            clearProps: 'transform',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          },
        )
      })

      // Drop-in blocks (glass panels, etc.)
      gsap.utils.toArray<HTMLElement>('.reveal-drop').forEach((el) => {
        gsap.fromTo(
          el,
          { y: -120, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.1,
            ease: 'bounce.out',
            clearProps: 'transform',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          },
        )
      })

      // Cards — revealed in batches so a row of cards cascades instead of popping together
      ScrollTrigger.batch('.reveal-card', {
        start: 'top 90%',
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { y: 70, scale: 0.88, opacity: 0 },
            {
              y: 0,
              scale: 1,
              opacity: 1,
              duration: 0.9,
              ease: 'back.out(1.3)',
              stagger: 0.12,
              overwrite: true,
              clearProps: 'transform',
            },
          ),
      })

      // Headings — smooth char rise + fade (no 3D)
      gsap.utils.toArray<HTMLElement>('.reveal-text').forEach((el) => {
        const split = new SplitText(el, {
          type: 'words,chars',
          wordsClass: 'reveal-word',
          charsClass: 'reveal-char',
        })
        splits.push(split)
        gsap.set(el, { opacity: 1 })
        gsap.from(split.chars, {
          x: -60,
          opacity: 0,
          filter: 'blur(7px)',
          stagger: 0.04,
          duration: 0.7,
          ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })

      // Pills / tags — elastic pop, staggered
      gsap.utils.toArray<HTMLElement>('.reveal-pop-group').forEach((group) => {
        const pills = Array.from(group.querySelectorAll('.reveal-pop'))
        gsap.fromTo(
          pills,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: 'back.out(2)',
            stagger: 0.05,
            clearProps: 'transform',
            onComplete: () => pills.forEach((p) => p.classList.add('hoverable')),
            scrollTrigger: { trigger: group, start: 'top 88%', once: true },
          },
        )
      })

      // Stickers — subtle parallax
      gsap.utils.toArray<HTMLElement>('.sticker-float').forEach((el) => {
        gsap.fromTo(
          el,
          { y: -22 },
          {
            y: 22,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          },
        )
      })

      // Generic parallax
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        const speed = Number(el.dataset.parallax || 30)
        gsap.fromTo(
          el,
          { y: -speed },
          {
            y: speed,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          },
        )
      })
    })

    requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      ctx.revert()
      splits.forEach((s) => s.revert())
      gsap.ticker.remove(tick)
      setLenis(null)
      lenis.destroy()
    }
  }, [progressRef, ready])
}
