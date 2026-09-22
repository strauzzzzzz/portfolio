import { useRef } from 'react'
import type { Group } from 'three'
import { useFrame } from '@react-three/fiber'

export type Shape = {
  position: [number, number, number]
  color: string
  type: 'icosa' | 'torus' | 'sphere'
  scale?: number
}

const HERO_SHAPES: Shape[] = [
  { position: [-4.5, 2.2, -2], color: '#ffd731', type: 'icosa', scale: 0.7 },
  { position: [4.5, 2.5, -1.5], color: '#fb4903', type: 'torus', scale: 0.55 },
  { position: [3, -1.8, -2], color: '#55db9c', type: 'icosa', scale: 0.5 },
  { position: [-3.2, -2.2, -1.5], color: '#5c4ade', type: 'sphere', scale: 0.6 },
  { position: [-6, 0.4, -1], color: '#e9ccff', type: 'sphere', scale: 0.45 },
  { position: [5.8, -0.2, -1.5], color: '#ffd731', type: 'torus', scale: 0.4 },
]

export function FloatShape({
  shape,
  index,
}: {
  shape: Shape
  index: number
}) {
  const ref = useRef<Group>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime + index * 1.7
    const g = ref.current
    if (!g) return
    g.position.y = shape.position[1] + Math.sin(t * 0.9) * 0.35
    g.rotation.x = t * 0.4
    g.rotation.y = t * 0.55
  })

  return (
    <group ref={ref} position={shape.position} scale={shape.scale}>
      {shape.type === 'icosa' ? (
        <mesh>
          <icosahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial
            color={shape.color}
            roughness={0.35}
            metalness={0.1}
            flatShading
          />
        </mesh>
      ) : shape.type === 'torus' ? (
        <mesh>
          <torusGeometry args={[0.5, 0.2, 16, 32]} />
          <meshStandardMaterial
            color={shape.color}
            roughness={0.35}
            metalness={0.1}
          />
        </mesh>
      ) : (
        <mesh>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial
            color={shape.color}
            roughness={0.35}
            metalness={0.1}
          />
        </mesh>
      )}
    </group>
  )
}

export default function FloatingShapes() {
  return (
    <>
      {HERO_SHAPES.map((shape, i) => (
        <FloatShape key={i} shape={shape} index={i} />
      ))}
    </>
  )
}
