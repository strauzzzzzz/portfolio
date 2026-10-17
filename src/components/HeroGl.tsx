import { useThree } from '@react-three/fiber'
import type { MutableRefObject, ReactNode } from 'react'
import GlCanvas from './GlCanvas'
import Ribbon from './Ribbon'
import FloatingShapes from './FloatingShapes'

/** Scales the scene down on narrow screens so the ribbon stays in frame. */
function FitToViewport({ children }: { children: ReactNode }) {
  const width = useThree((s) => s.viewport.width)
  const scale = Math.min(1, Math.max(0.5, width / 11))
  return <group scale={scale}>{children}</group>
}

/** The hero's WebGL layer — kept in its own module so three.js loads as a separate chunk. */
export default function HeroGl({
  scrollRef,
}: {
  scrollRef: MutableRefObject<number>
}) {
  return (
    <GlCanvas
      className="ribbon-layer gl-in"
      camera={{ position: [0, 0, 8], fov: 45 }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 6, 6]} intensity={1.6} />
      <directionalLight position={[-6, -2, -3]} intensity={0.5} color="#55db9c" />
      <FitToViewport>
        <Ribbon scrollRef={scrollRef} />
        <FloatingShapes />
      </FitToViewport>
    </GlCanvas>
  )
}
