import { useMemo, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function makeGrainTexture(size = 256) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(size, size)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = (Math.random() * 255) | 0
    img.data[i] = v
    img.data[i + 1] = v
    img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(6, 3)
  tex.needsUpdate = true
  return tex
}

const END_A = new THREE.Vector3(-7, 0.6, -1)
const END_B = new THREE.Vector3(7, 1.2, 0.4)

export default function Ribbon({
  scrollRef,
}: {
  scrollRef: MutableRefObject<number>
}) {
  const group = useRef<THREE.Group>(null)

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      [
        END_A,
        new THREE.Vector3(-4.5, 1.8, 0.6),
        new THREE.Vector3(-1.5, 0.2, -0.4),
        new THREE.Vector3(1.5, 1.7, 0.8),
        new THREE.Vector3(4.5, 0.3, -0.6),
        END_B,
      ],
      false,
      'catmullrom',
      0.5,
    )
  }, [])

  const grain = useMemo(() => makeGrainTexture(), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const s = scrollRef.current
    if (!group.current) return
    group.current.rotation.y = Math.sin(t * 0.25) * 0.14 + s * 1.1
    group.current.rotation.z = Math.cos(t * 0.2) * 0.07 - s * 0.3
    group.current.rotation.x = s * -0.35
    group.current.position.y = Math.sin(t * 0.5) * 0.18 + s * 0.8
    group.current.position.z = s * -1.2
  })

  return (
    <group ref={group}>
      <mesh>
        <tubeGeometry args={[curve, 220, 0.5, 24, false]} />
        <meshStandardMaterial
          color="#4da2ff"
          roughness={0.3}
          metalness={0.06}
          bumpMap={grain}
          bumpScale={0.14}
          roughnessMap={grain}
        />
      </mesh>
      <mesh position={END_A}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial
          color="#4da2ff"
          roughness={0.3}
          metalness={0.06}
          bumpMap={grain}
          bumpScale={0.14}
        />
      </mesh>
      <mesh position={END_B}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial
          color="#4da2ff"
          roughness={0.3}
          metalness={0.06}
          bumpMap={grain}
          bumpScale={0.14}
        />
      </mesh>
    </group>
  )
}
