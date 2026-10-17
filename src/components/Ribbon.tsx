import { useEffect, useMemo, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
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
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#4da2ff',
        roughness: 0.3,
        metalness: 0.06,
        bumpMap: grain,
        bumpScale: 0.14,
        roughnessMap: grain,
      }),
    [grain],
  )

  useEffect(
    () => () => {
      material.dispose()
      grain.dispose()
    },
    [material, grain],
  )

  const smooth = useRef({ x: 0, y: 0, scroll: 0 })
  const invalidate = useThree((s) => s.invalidate)

  // Redraw the still frame (reduced motion / paused loop) when the page scrolls.
  useEffect(() => {
    const onScroll = () => invalidate()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [invalidate])

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    const k = 1 - Math.exp(-delta * 4)
    const sm = smooth.current
    sm.x += (state.pointer.x - sm.x) * k
    sm.y += (state.pointer.y - sm.y) * k
    sm.scroll += (scrollRef.current - sm.scroll) * Math.min(1, k * 2)
    const s = sm.scroll

    g.rotation.y = Math.sin(t * 0.25) * 0.14 + s * 1.1 + sm.x * 0.22
    g.rotation.z = Math.cos(t * 0.2) * 0.07 - s * 0.3
    g.rotation.x = s * -0.35 - sm.y * 0.12
    g.position.y = Math.sin(t * 0.5) * 0.18 + s * 0.8
    g.position.x = sm.x * 0.25
    g.position.z = s * -1.2
  })

  return (
    <group ref={group}>
      <mesh>
        <tubeGeometry args={[curve, 220, 0.5, 24, false]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={END_A}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={END_B}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  )
}
