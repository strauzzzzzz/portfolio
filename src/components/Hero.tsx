import type { MutableRefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import Ribbon from './Ribbon'
import FloatingShapes from './FloatingShapes'
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

export default function Hero({
  scrollRef,
}: {
  scrollRef: MutableRefObject<number>
}) {
  const { t } = useLanguage()

  return (
    <section
      id="top"
      className="relative min-h-screen overflow-hidden bg-sky-wash"
    >
      <div className="ribbon-layer">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.75} />
          <directionalLight position={[5, 6, 6]} intensity={1.6} />
          <directionalLight
            position={[-6, -2, -3]}
            intensity={0.5}
            color="#55db9c"
          />
          <Ribbon scrollRef={scrollRef} />
          <FloatingShapes />
        </Canvas>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1440px] flex-col items-center justify-center px-6 py-24 text-center">
        <span className="outline reveal mb-8 rounded-full bg-paper-white px-4 py-2 font-aeonik-pro text-xs font-bold uppercase tracking-[0.032em]">
          <span className="text-ember">✦</span> {t.hero.eyebrow}
        </span>

        <h1
          className="display reveal-text select-none"
          style={{ fontSize: 'clamp(48px, 15vw, 300px)' }}
        >
          {profile.name}
        </h1>

        <p className="reveal mt-4 max-w-xl font-aeonik-pro text-xl font-medium leading-snug text-carbon/80 md:text-2xl">
          {t.hero.tagline}
        </p>

        <div className="reveal mt-10 flex flex-wrap items-center justify-center gap-3">
          <Magnetic>
            <Button href="#work" variant="fill" accent="#ffd731">
              {t.hero.viewWork}
            </Button>
          </Magnetic>
          <Magnetic>
            <Button href="#contact" variant="fill" accent="#55db9c">
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
        className="right-[10%] top-[30%]"
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
        className="left-[42%] top-[12%]"
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
