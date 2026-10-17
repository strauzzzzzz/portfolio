import { Suspense, lazy, useEffect, useState } from 'react'

const MiniGl = lazy(() => import('./MiniGl'))

export default function MiniScene({
  className = '',
}: {
  className?: string
}) {
  // Decorative only: skip the extra WebGL contexts entirely on phones.
  const [wide, setWide] = useState(
    () => window.matchMedia('(min-width: 768px)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = () => setWide(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  if (!wide) return null

  return (
    <Suspense fallback={null}>
      <MiniGl className={className} />
    </Suspense>
  )
}
