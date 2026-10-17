# Portfolio

Личное портфолио Сергея — сайт-портфолио с работами (сайты, дизайн, моушн, музыка).

## Стек

- Vite + React + TypeScript
- Three.js (React Three Fiber) — 3D-ленты и фигуры
- GSAP + Lenis — скролл-анимации
- Tailwind CSS v4
- Supabase — контент и медиа

## Локально

```bash
npm install
npm run dev   # http://localhost:8080
```

## Контент

Контент хранится в Supabase (таблицы `projects` и `items`, хранилище `media`). Редактировать можно в админке `/admin` (логин + пароль).

### Админка

1. В Supabase: Authentication → Users → Add user. Email — `<логин>@admin.example.com` (на сайте вводится просто логин), пароль свой, отметить Auto Confirm User.
2. Authentication → Sign In / Providers → выключить «Allow new users to sign up».
3. Выполнить `supabase/admin-setup.sql` в SQL Editor — права на запись только для вошедшего пользователя.

Миграция контента: `node scripts/seed.mjs` (нужен `SUPABASE_SERVICE_ROLE_KEY`).
