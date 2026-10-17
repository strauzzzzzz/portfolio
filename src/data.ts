export const profile = {
  name: 'SERGEY',
  fullName: 'Sergey',
  email: 'strauzzcode@gmail.com',
  telegram: 'https://t.me/mtiwork',
}

export type ProjectText = {
  title: string
  category: string
  description: string
  tags: string[]
}

export type WorkItem = {
  id?: string
  featured?: boolean
  en: string
  ru: string
  desc?: { en: string; ru: string }
  video?: string[]
  audio?: string[]
  images?: string[]
}

export type Project = {
  id?: string
  slug: string
  image: string
  color: string
  en: ProjectText
  ru: ProjectText
  items: WorkItem[]
}

export type Skill = { en: string; ru: string; slug: string }

export const skills: Skill[] = [
  { en: 'FL Studio', ru: 'FL Studio', slug: 'beat-tape' },
  { en: 'Music Production', ru: 'Музыкальное продюсирование', slug: 'single-demo' },
  { en: 'Beat Making', ru: 'Создание битов', slug: 'beat-tape' },
  { en: 'After Effects', ru: 'After Effects', slug: 'video-motion' },
  { en: 'Premiere Pro', ru: 'Premiere Pro', slug: 'video-motion' },
  { en: 'Motion Design', ru: 'Моушн-дизайн', slug: 'video-motion' },
  { en: 'Blender', ru: 'Blender', slug: 'brand-identity' },
  { en: '3D Modeling', ru: '3D-моделирование', slug: 'brand-identity' },
  { en: 'Figma', ru: 'Figma', slug: 'brand-identity' },
  { en: 'Graphic & Brand Design', ru: 'Графика и айдентика', slug: 'social-media-kit' },
  { en: 'HTML / CSS', ru: 'HTML / CSS', slug: 'product-landing' },
  { en: 'JavaScript', ru: 'JavaScript', slug: 'product-landing' },
  { en: 'React Basics', ru: 'React (основы)', slug: 'product-landing' },
  { en: 'Tailwind CSS', ru: 'Tailwind CSS', slug: 'product-landing' },
]
