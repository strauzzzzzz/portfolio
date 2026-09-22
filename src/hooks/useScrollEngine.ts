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

    const lenis = new Lenis({
      lerp: 0.12,
      wheelMultiplier: 1,
      anchors: { offset: -80, duration: 1.2 },
    })
    setLenis(lenis)

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      progressRef.current = max > 0 ? window.scrollY / max : 0
    }

    lenis.on('scroll', onScroll)
    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const splits: SplitText[] = []

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 48, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'slush',
            clearProps: 'transform',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          },
        )
      })

      gsap.utils.toArray<HTMLElement>('.reveal-card').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 90, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            ease: 'none',
            clearProps: 'transform',
            onComplete: () => el.classList.add('hoverable'),
            scrollTrigger: {
              trigger: el,
              start: 'top 95%',
              end: 'top 42%',
              scrub: 0.6,
              once: true,
            },
          },
        )
      })

      gsap.utils.toArray<HTMLElement>('.reveal-text').forEach((el) => {
        const split = new SplitText(el, {
          type: 'chars',
          charsClass: 'reveal-char',
        })
        splits.push(split)
        gsap.set(el, { opacity: 1 })
        gsap.from(split.chars, {
          y: '0.35em',
          opacity: 0,
          stagger: 0.02,
          duration: 0.55,
          ease: 'slush',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })

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
