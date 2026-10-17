export type Lang = 'en' | 'ru'

export type Translations = {
  nav: { work: string; about: string; skills: string; contact: string; hire: string }
  hero: {
    eyebrow: string
    role: string
    tagline: string
    viewWork: string
    getInTouch: string
  }
  work: {
    eyebrow: string
    title: string
    intro: string
    viewCase: string
    back: string
    related: string
    media: string
    tracks: string
    gallery: string
    order: string
    openFull: string
    featured: string
  }
  about: { eyebrow: string; title: string; p1: string; p2: string; p3: string; hint: string }
  skills: { eyebrow: string; title: string }
  contact: { title: string; text: string; backToTop: string; builtWith: string }
}

export const ui: Record<Lang, Translations> = {
  en: {
    nav: {
      work: 'Work',
      about: 'About',
      skills: 'Skills',
      contact: 'Contact',
      hire: 'Hire me',
    },
    hero: {
      eyebrow: 'Music · Design · Motion · Web',
      role: 'Multidisciplinary Creative',
      tagline:
        'Music, design, motion and web — I make whatever a project needs.',
      viewWork: 'View work',
      getInTouch: 'Get in touch',
    },
    work: {
      eyebrow: 'Selected work',
      title: 'Work',
      intro:
        'A handful of projects I’ve made by hand — from music to design and motion. Tap through to see them come alive.',
      viewCase: 'View case',
      back: 'Back to work',
      related: 'More in this category',
      media: 'Photos, audio and video of this work will appear here.',
      tracks: 'Tracks',
      gallery: 'Gallery',
      order: 'Order something similar',
      openFull: 'Open fullscreen',
      featured: 'Best in my opinion',
    },
    about: {
      eyebrow: 'About me',
      title: 'About',
      p1: 'Hi, I’m Sergey. I make music, design logos and graphics, cut videos and code websites. I never managed to pick just one of these, so I do all of them.',
      p2: 'Music came first. I make beats and tracks in FL Studio, mostly hip-hop and electronic, sometimes something calmer. I do the arrangement and the mixing myself.',
      p3: 'The rest grew out of that. I do branding and social media graphics in Figma, motion and editing in After Effects and Premiere, and a bit of 3D in Blender. I write sites by hand in HTML, CSS and JS, and I’m still learning React. If you need any of this, write to me.',
      hint: 'Hover to expand',
    },
    skills: {
      eyebrow: 'Toolbox',
      title: 'Skills',
    },
    contact: {
      title: 'Let’s talk',
      text: 'Have an idea, an opportunity, or just want to say hi? My inbox is always open.',
      backToTop: 'Back to top',
      builtWith: 'Built with React · Three.js · GSAP · Tailwind',
    },
  },
  ru: {
    nav: {
      work: 'Работы',
      about: 'Обо мне',
      skills: 'Навыки',
      contact: 'Контакты',
      hire: 'Нанять',
    },
    hero: {
      eyebrow: 'Музыка · Дизайн · Моушн · Веб',
      role: 'Мультидисциплинарный креатив',
      tagline:
        'Музыка, дизайн, моушн и веб — делаю то, что нужно проекту.',
      viewWork: 'Смотреть работы',
      getInTouch: 'Связаться',
    },
    work: {
      eyebrow: 'Избранные работы',
      title: 'Работы',
      intro:
        'Несколько проектов, сделанных вручную — от музыки до дизайна и моушна. Загляни и посмотри, как они оживают.',
      viewCase: 'Смотреть кейс',
      back: 'Назад к работам',
      related: 'Ещё в этой категории',
      media: 'Здесь появятся фото, аудио и видео этой работы.',
      tracks: 'Треки',
      gallery: 'Галерея',
      order: 'Заказать похожее',
      openFull: 'Открыть полностью',
      featured: 'Лучшее по моему мнению',
    },
    about: {
      eyebrow: 'Обо мне',
      title: 'Обо мне',
      p1: 'Привет, я Сергей. Делаю музыку, рисую логотипы и графику, монтирую видео и верстаю сайты. Выбрать что-то одно у меня не получилось, поэтому занимаюсь всем сразу.',
      p2: 'Началось всё с музыки. Пишу биты и треки в FL Studio, в основном хип-хоп и электронику, иногда что-то поспокойнее. Аранжировку и сведение делаю сам.',
      p3: 'Остальное выросло уже из этого. Айдентику и графику для соцсетей делаю в Figma, моушн и монтаж — в After Effects и Premiere, немного моделирую в Blender. Сайты верстаю руками на HTML, CSS и JS, React пока учу. Если нужно что-то из этого — пишите.',
      hint: 'Наведи, чтобы раскрыть',
    },
    skills: {
      eyebrow: 'Инструменты',
      title: 'Навыки',
    },
    contact: {
      title: 'Поговорим?',
      text: 'Есть идея или просто хочешь поздороваться? Пиши — я на связи.',
      backToTop: 'Наверх',
      builtWith: 'Сделано на React · Three.js · GSAP · Tailwind',
    },
  },
}
