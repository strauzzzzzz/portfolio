import { useState } from 'react'
import { storageUrl } from '../lib/supabase'

type ProjectImageProps = {
  name: string
  alt: string
  className?: string
}

export default function ProjectImage({
  name,
  alt,
  className = '',
}: ProjectImageProps) {
  const [failed, setFailed] = useState(false)
  const src = encodeURI(storageUrl(name))

  if (failed) return null

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
