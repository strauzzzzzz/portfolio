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
  about: { eyebrow: string; title: string; p1: string; p2: string; p3: string }
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
      p1: 'I’m Sergey — a multidisciplinary creative. I work in whatever direction a project needs: from sound and visuals to building the site itself. I take a task from the first idea to the finished result.',
      p2: 'Music is my foundation. I write tracks and beats in FL Studio — from lo-fi and hip-hop to electronic — building arrangements from live and synthesized instruments, then mixing them into a finished sound.',
      p3: 'Beyond sound, I do design: brand identity, logos, social media graphics. Motion graphics and video editing in After Effects. And web — landing pages I code by hand.',
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
      p1: 'Я Сергей — мультидисциплинарный креатив. Работаю в том направлении, которое нужно проекту: от звука и картинки до вёрстки сайта. Беру задачу целиком — от идеи до готового результата.',
      p2: 'Музыка — моя база. Пишу треки и биты в FL Studio: от lo-fi и хип-хопа до электроники. Собираю аранжировки из живых и синтезированных инструментов, свожу и довожу до финального звучания.',
      p3: 'Помимо звука — дизайн: айдентика, логотипы, оформление соцсетей. Моушн-графика и монтаж роликов в After Effects. И веб — лендинги, которые верстаю вручную.',
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
