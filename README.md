# Portfolio

Личное портфолио Сергея — сайт-портфолио с работами (сайты, дизайн, моушн, музыка).

## Стек

- Vite + React + TypeScript
- Three.js (React Three Fiber) — 3D-ленты и фигуры
- GSAP + Lenis — скролл-анимации
- Tailwind CSS v4
- Supabase — контент и медиа (админка на `/admin`)

## Локально

```bash
npm install
npm run dev   # http://localhost:8080
```

## Контент

Контент хранится в Supabase (таблицы `projects` и `items`, хранилище `media`). Редактировать можно через админку `/admin` (вход по email + паролю).

Миграция контента: `node scripts/seed.mjs` (нужен `SUPABASE_SERVICE_ROLE_KEY`).
