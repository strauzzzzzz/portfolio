import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dwuokdmajingzakhrksb.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_KEY) {
  console.error('Укажи SUPABASE_SERVICE_ROLE_KEY (service_role ключ) в переменной окружения')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const projects = [
  {
    slug: 'product-landing',
    image: 'Лендинг продукта.png',
    color: '#4da2ff',
    en: {
      title: 'Product Landing',
      category: 'Website',
      description: 'A hand-made landing page for a product, built with clean code and a simple, readable layout.',
      tags: ['HTML', 'CSS', 'JavaScript'],
    },
    ru: {
      title: 'Лендинг продукта',
      category: 'Сайт',
      description: 'Свёрстанный вручную лендинг продукта с чистым кодом и простым, аккуратным макетом.',
      tags: ['HTML', 'CSS', 'JavaScript'],
    },
    items: [
      {
        en: 'Sign-up Page',
        ru: 'Страница регистрации',
        desc: {
          en: 'A clean sign-up page made for marketers. The layout leads the eye straight to the form — no clutter, only the fields that matter. Fast to scan, easy to fill, and built to convert.',
          ru: 'Чистая страница регистрации, созданная для маркетологов. Вёрстка сразу ведёт взгляд к форме — ничего лишнего, только нужные поля. Быстро сканируется, легко заполняется и работает на конверсию.',
        },
        images: ['1.png'],
      },
      {
        en: 'Exam Tutoring',
        ru: 'Репетиторы ЕГЭ',
        desc: {
          en: 'A landing page presenting tutoring services for ЕГЭ exam prep. One clear «Register» button, prices and benefits in sight — a student gets the whole picture in seconds.',
          ru: 'Лендинг с услугами репетиторов для подготовки к ЕГЭ. Одна заметная кнопка «Зарегистрироваться», цены и преимущества на виду — ученик понимает всё за пару секунд.',
        },
        images: ['2.png'],
      },
      {
        en: 'Gym Landing',
        ru: 'Лендинг спортзала',
        desc: {
          en: 'A landing page for a gym. Deliberately simple, with a clean visual rhythm and one single focus — the membership button. Nothing pulls attention away from the action.',
          ru: 'Лендинг для спортзала. Нарочито простой, с аккуратным визуальным ритмом и одним акцентом — кнопкой покупки абонемента. Ничего не отвлекает от действия.',
        },
        images: ['3.png'],
      },
    ],
  },
  {
    slug: 'video-motion',
    image: 'Видео моушн.png',
    color: '#e9ccff',
    en: {
      title: 'Video Motion',
      category: 'Motion',
      description: 'Motion graphics videos for ads and other projects, edited by hand in After Effects.',
      tags: ['After Effects', 'Motion'],
    },
    ru: {
      title: 'Видео моушн',
      category: 'Моушн',
      description: 'Моушн-ролики для рекламы и других видео, собранные вручную в After Effects.',
      tags: ['After Effects', 'Моушн'],
    },
    items: [
      {
        en: 'Telegram Bot',
        ru: 'Телеграм Бот',
        desc: {
          en: 'A promo motion video for my own bot, aimed at Russian users who hold crypto. Local exchanges are scarce, so the service lets you pay in rubles by QR and top up via USDT — the video walks through the whole flow in a few punchy, easy-to-follow scenes.',
          ru: 'Рекламный моушн-ролик моего личного бота для российских пользователей, у которых есть крипта. В России мало удобных обменников, поэтому сервис даёт платить рублями по QR и пополнять счёт через USDT. Ролик объясняет весь процесс за несколько ёмких, понятных сцен.',
        },
        video: ['telegram-bot.mp4'],
      },
      {
        en: 'Website Ad',
        ru: 'Реклама сайта',
        desc: {
          en: 'A commissioned motion video that walks through the Master Panel interface — a polished minute-long piece. I paid close attention to pacing and detail. A couple of voiceover spots dip slightly, since ElevenLabs is blocked in Russia and a clean voiceover is hard to record here.',
          ru: 'Заказной моушн-ролик с разбором интерфейса Master Panel — аккуратное минутное видео. Уделял внимание темпу и деталям. Кое-где проседает озвучка: из-за блокировки ElevenLabs в России чистую озвучку записать непросто.',
        },
        video: ['site-ad.mp4'],
      },
      {
        en: 'Animation',
        ru: 'Анимация',
        desc: {
          en: 'A green banner animation — short, clean and to the point. One idea, no noise, everything reads in a couple of seconds. Built as a quick promo that explains itself without a single word.',
          ru: 'Баннер-анимация в зелёных тонах. Коротко и ясно, ничего лишнего. Одна мысль, без шума — всё считывается за пару секунд. Сделан как быстрый промо-блок, понятный без слов.',
        },
        video: ['animation.mp4'],
      },
    ],
  },
  {
    slug: 'brand-identity',
    image: 'Айдентика бренда.png',
    color: '#ffd731',
    en: {
      title: 'Brand Identity',
      category: 'Design',
      description: 'A full identity for a small brand: logo, color palette, typography and brand guidelines.',
      tags: ['Figma', 'Branding', 'Logo'],
    },
    ru: {
      title: 'Айдентика бренда',
      category: 'Дизайн',
      description: 'Полная айдентика небольшого бренда: логотип, палитра, типографика и гайдлайн.',
      tags: ['Figma', 'Брендинг', 'Логотип'],
    },
    items: [
      {
        en: 'Animated Banner — AI',
        ru: 'Анимированный баннер — ИИ',
        desc: {
          en: 'A commissioned animated banner in yellow tones. Smooth and straightforward — nothing flashy, just a clean result. Made with the help of AI.',
          ru: 'Анимированный баннер по заказу в жёлтых тонах. Обычная плавность, ничего лишнего — просто аккуратный результат. Сделан с использованием ИИ.',
        },
        video: ['1.mp4'],
      },
      {
        en: 'Animated Banner — for a Designer',
        ru: 'Анимированный баннер — для дизайнера',
        desc: {
          en: 'A custom animated banner, made for a designer. It came out so well that even I liked it — funny how a designer orders for themselves from another designer.',
          ru: 'Анимированный баннер на заказ, создан для дизайнера. Вышло так хорошо, что понравилось даже мне — забавно, когда дизайнер заказывает для себя у дизайнера.',
        },
        video: ['2.mp4'],
      },
      {
        en: 'Animated Banner — 3D',
        ru: 'Анимированный баннер — 3D',
        desc: {
          en: 'A custom animated banner that simply informs about a service. The 3D model inside was built by hand.',
          ru: 'Анимированный баннер на заказ — простое информирование об услуге. 3D-модель внутри сделана вручную.',
        },
        video: ['3.mp4'],
      },
      {
        en: 'Static Banner — SALE',
        ru: 'Статичный баннер — SALE',
        desc: {
          en: 'A static banner in black and white. Nothing to invent here — people are looking for a SALE manager. Let them find one.',
          ru: 'Статичный баннер в чёрно-белых тонах. Ничего придумывать не нужно — люди ищут SALE-менеджера. Пусть ищут.',
        },
        images: ['4.png'],
      },
      {
        en: 'YouTube Channel Design',
        ru: 'Оформление YouTube-канала',
        desc: {
          en: 'YouTube channel branding — avatar and channel banner. Made for a trader, so the style is strict and businesslike. Looks good, right?',
          ru: 'Оформление для YouTube-канала — аватар и баннер. Выполнено для трейдера, поэтому стилистика строгая и деловая. Красиво же!',
        },
        images: ['5.png'],
      },
      {
        en: 'Daveus Design Logo',
        ru: 'Логотип Daveus Design',
        desc: {
          en: 'Two variants of a solid logo for Daveus Design — DD. Built and planned by hand. Stylish, strict, in black and white.',
          ru: 'Два варианта неплохого логотипа для Daveus Design — DD. Выстроены и спланированы вручную. Стильно, строго и в чёрно-белом.',
        },
        images: ['6.png', '6_1.png'],
      },
    ],
  },
  {
    slug: 'social-media-kit',
    image: 'Оформление соцсетей.png',
    color: '#55db9c',
    en: {
      title: 'Social Media Kit',
      category: 'Design',
      description: 'A set of graphic designs and templates for social media posts, stories and covers.',
      tags: ['Figma', 'Graphics'],
    },
    ru: {
      title: 'Оформление соцсетей',
      category: 'Дизайн',
      description: 'Комплект графики и шаблонов для постов, сторис и обложек в социальных сетях.',
      tags: ['Figma', 'Графика'],
    },
    items: [
      {
        en: 'RedWallet Channel Posts',
        ru: 'Посты для канала RedWallet',
        desc: {
          en: 'Posts for the RedWallet Telegram channel. In short, a full style for the channel, built with 3D models.',
          ru: 'Посты для Телеграм-канала RedWallet. По сути — создание целого стиля для канала с использованием 3D-моделей.',
        },
        images: ['1.png', '1_1.png', '1_2.png'],
      },
      {
        en: 'YouTube Tutorial Post',
        ru: 'Пост для YouTube-канала',
        desc: {
          en: 'A post for a YouTube channel — a tutorial, styled to match the software being explained in the video.',
          ru: 'Пост для канала на YouTube — вроде туториала, выдержан в стиле программы, которую разбирали в видео.',
        },
        images: ['2.png'],
      },
      {
        en: 'Bot Welcome Message',
        ru: 'Приветственное сообщение бота',
        desc: {
          en: 'A welcome message for a bot, done in the Telegram Stars style — because the bot sells exactly those products.',
          ru: 'Приветственное сообщение для бота, сделанное в стиле Telegram Stars — ведь в боте как раз такие товары.',
        },
        images: ['3.png'],
      },
    ],
  },
  {
    slug: 'beat-tape',
    image: 'Биттейп Vol. 1.png',
    color: '#5c4ade',
    en: {
      title: 'Beats',
      category: 'Music',
      description: 'Original beats made in FL Studio — from Detroit to Digicore and Angelcore.',
      tags: ['FL Studio', 'Beats'],
    },
    ru: {
      title: 'Биты',
      category: 'Музыка',
      description: 'Авторские биты, сделанные в FL Studio, — от Detroit до Digicore и Angelcore.',
      tags: ['FL Studio', 'Биты'],
    },
    items: [
      {
        en: 'JEALOUS (Remake)',
        ru: 'Ремейк JEALOUS',
        desc: { en: 'A remake of the track JEALOUS.', ru: 'Ремейк трека JEALOUS.' },
        audio: ['1.mp3'],
      },
      {
        en: 'Detroit',
        ru: 'Detroit',
        desc: { en: 'Regular Detroit with a touch of Gang.', ru: 'Обычный Detroit с ноткой Gang.' },
        audio: ['2.mp3'],
      },
      {
        en: 'Digicore',
        ru: 'Digicore',
        desc: { en: 'Digicore — high key, beautiful FX and incredible synths.', ru: 'Digicore — высокая тональность, красивые FX и невероятные синты.' },
        audio: ['3.mp3'],
      },
      {
        en: 'Digicore × Angelcore',
        ru: 'Digicore × Angelcore',
        desc: {
          en: 'Something between Digicore and Angelcore, with a bit of Trap. Multi-layered but still beautiful — the drop opens as Digicore, then shifts into Angelcore.',
          ru: 'Что-то между Digicore и Angelcore, но всё же с Trap. Слегка многослойный, но звучит так же красиво — дроп начинается как Digicore, после первого дропа переходит в Angelcore.',
        },
        audio: ['4.mp3'],
      },
      {
        en: 'Angelcore',
        ru: 'Angelcore',
        desc: {
          en: 'Pure Angelcore, no complaints. Not fast, not slow — textures, hats, beauty. My personal top 1 among the beats.',
          ru: 'Полностью без нареканий — Angelcore. Не быстро и не медленно. Текстуры, хэты, красота. Мой личный топ-1 среди битов.',
        },
        audio: ['5.mp3'],
      },
    ],
  },
  {
    slug: 'single-demo',
    image: 'Трек Демо.png',
    color: '#fb4903',
    en: {
      title: 'Melodies',
      category: 'Music',
      description: 'Original melodies — from cinematic space themes to classical-inspired pieces.',
      tags: ['FL Studio', 'Melodies'],
    },
    ru: {
      title: 'Мелодии',
      category: 'Музыка',
      description: 'Авторские мелодии — от кинематографичных космических тем до композиций в духе классики.',
      tags: ['FL Studio', 'Мелодии'],
    },
    items: [
      {
        en: 'Space',
        ru: 'Космос',
        desc: {
          en: 'An almost cosmic, breathtaking melody. I started it for my game — a space storyline where you get stranded on a planet and your friend dies… the music plays while you kneel beside the one who left you alone for the next five hours. I lost interest in the story, so the game never happened.',
          ru: 'Около космическая, захватывающая дух мелодия. Изначально делал её для своей игры — сюжет про космос, вы застреваете на планете, а друг умирает… Музыка играет, пока ты стоишь на коленях рядом с тем, кто подарил тебе одиночество на следующие 5 часов прохождения. Но сюжет мне наскучил, и игру я так и не сделал.',
        },
        audio: ['1.mp3'],
      },
      {
        en: 'F1 (Trailer)',
        ru: 'F1 (трейлер)',
        desc: {
          en: 'Inspired by the film F1. The film’s theme is a great track — more trap, whose name I can’t recall — but mine leans trailer-like. It sounds solemn and shows the greatness of the victory at the end. I loved the film; I’ve followed Formula 1 for a long time.',
          ru: 'Вдохновлён фильмом F1. Тема самого фильма — очень крутой трек, названия не вспомню, но он более треповый, а моё сделано под трейлерный. Звучит торжественно и передаёт величие победы в конце. Фильм очень понравился — давно увлекаюсь Формулой.',
        },
        audio: ['2.mp3'],
      },
      {
        en: 'Classic',
        ru: 'Классика',
        desc: {
          en: 'Inspired by the classics. Calm and drama live here — violin, bass, piano, and somehow a synth slipped in too, laying down the perfect harmony. I won’t argue — if someone doesn’t like it, they just didn’t feel it.',
          ru: 'Вдохновлён классикой. Спокойствие и драма — здесь. Скрипка, бас, пианино, и даже синт как-то влез, в итоге выложив идеальную гармонию мелодии. Не хочу спорить, но кому такое не нравится — просто не прочувствовал.',
        },
        audio: ['3.mp3'],
      },
    ],
  },
]

const featured = [
  { project: 'video-motion', item: 1 },
  { project: 'brand-identity', item: 2 },
  { project: 'social-media-kit', item: 0 },
  { project: 'beat-tape', item: 4 },
  { project: 'single-demo', item: 1 },
  { project: 'single-demo', item: 2 },
]

async function seed() {
  await supabase.from('items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  for (const [pi, p] of projects.entries()) {
    const { data: proj, error: pErr } = await supabase
      .from('projects')
      .insert({
        slug: p.slug,
        color: p.color,
        image: `/projects/${p.image}`,
        title_en: p.en.title,
        title_ru: p.ru.title,
        category_en: p.en.category,
        category_ru: p.ru.category,
        description_en: p.en.description,
        description_ru: p.ru.description,
        tags_en: p.en.tags,
        tags_ru: p.ru.tags,
        sort_order: pi,
      })
      .select('id')
      .single()

    if (pErr) {
      console.error('❌ project', p.slug, pErr.message)
      continue
    }

    for (const [ii, item] of p.items.entries()) {
      const featIdx = featured.findIndex((f) => f.project === p.slug && f.item === ii)
      const media = {}
      if (item.video) media.video = item.video.map((f) => `/projects/${p.slug}/${f}`)
      if (item.audio) media.audio = item.audio.map((f) => `/projects/${p.slug}/${f}`)
      if (item.images) media.images = item.images.map((f) => `/projects/${p.slug}/${f}`)

      const { error: iErr } = await supabase.from('items').insert({
        project_id: proj.id,
        title_en: item.en,
        title_ru: item.ru,
        desc_en: item.desc?.en ?? null,
        desc_ru: item.desc?.ru ?? null,
        media,
        featured: featIdx !== -1,
        featured_order: featIdx !== -1 ? featIdx : null,
        sort_order: ii,
      })
      if (iErr) console.error('❌ item', p.slug, item.en, iErr.message)
    }
    console.log('✓', p.slug)
  }
  console.log('Готово: проектов —', projects.length)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
