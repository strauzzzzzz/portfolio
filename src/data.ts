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
  en: string
  ru: string
  desc?: { en: string; ru: string }
  video?: string[]
  audio?: string[]
  images?: string[]
}

export type Project = {
  slug: string
  image: string
  color: string
  en: ProjectText
  ru: ProjectText
  items: WorkItem[]
}

export type Skill = { en: string; ru: string }

export const skills: Skill[] = [
  { en: 'FL Studio', ru: 'FL Studio' },
  { en: 'Music Production', ru: 'Музыкальное продюсирование' },
  { en: 'Beat Making', ru: 'Создание битов' },
  { en: 'After Effects', ru: 'After Effects' },
  { en: 'Premiere Pro', ru: 'Premiere Pro' },
  { en: 'Motion Design', ru: 'Моушн-дизайн' },
  { en: 'Figma', ru: 'Figma' },
  { en: 'Graphic & Brand Design', ru: 'Графика и айдентика' },
  { en: 'HTML / CSS', ru: 'HTML / CSS' },
  { en: 'JavaScript', ru: 'JavaScript' },
  { en: 'React Basics', ru: 'React (основы)' },
  { en: 'Tailwind CSS', ru: 'Tailwind CSS' },
]
