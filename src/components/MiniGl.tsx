import GlCanvas from './GlCanvas'
import { FloatShape } from './FloatingShapes'
import type { Shape } from './FloatingShapes'

const MINI_SHAPES: Shape[] = [
  { position: [-1, 0.5, 0], color: '#5c4ade', type: 'icosa', scale: 1 },
  { position: [1.2, -0.4, 0], color: '#ffd731', type: 'torus', scale: 0.8 },
  { position: [0, 1, -0.5], color: '#fb4903', type: 'sphere', scale: 0.7 },
]

export default function MiniGl({ className = '' }: { className?: string }) {
  return (
    <GlCanvas
      className={`pointer-events-none absolute gl-in ${className}`}
      camera={{ position: [0, 0, 6], fov: 45 }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 4, 6]} intensity={1.5} />
      {MINI_SHAPES.map((shape, i) => (
        <FloatShape key={i} shape={shape} index={i} />
      ))}
    </GlCanvas>
  )
}
