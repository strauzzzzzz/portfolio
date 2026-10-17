import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DragEvent, FormEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { storageUrl, supabase } from '../lib/supabase'
import { useData } from '../context/DataContext'

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

type MediaKind = 'video' | 'audio' | 'images'

const VIDEO_EXT = ['mp4', 'webm', 'mov', 'm4v']
const AUDIO_EXT = ['mp3', 'wav', 'ogg', 'm4a']
const MAX_FILE_MB = 50

function extOf(name: string) {
  return name.split('.').pop()?.toLowerCase() ?? ''
}

function mediaType(file: File): MediaKind {
  const ext = extOf(file.name)
  if (VIDEO_EXT.includes(ext)) return 'video'
  if (AUDIO_EXT.includes(ext)) return 'audio'
  return 'images'
}

async function uploadMedia(file: File): Promise<string> {
  const ext = extOf(file.name)
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
  const { error } = await supabase.storage.from('media').upload(name, file, {
    cacheControl: '31536000',
    contentType: file.type || undefined,
  })
  if (error) throw error
  return name
}

function mediaUrl(path: string) {
  return encodeURI(storageUrl(path))
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function errMsg(e: unknown) {
  if (e instanceof Error) return e.message
  if (e && typeof e === 'object' && 'message' in e) {
    return String((e as { message: unknown }).message)
  }
  return String(e)
}

function authErrorRu(message: string) {
  const m = message.toLowerCase()
  if (m.includes('invalid login')) return 'Неверный email или пароль'
  if (m.includes('email not confirmed')) return 'Email не подтверждён'
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Слишком много попыток — попробуй чуть позже'
  }
  if (m.includes('failed to fetch') || m.includes('network')) {
    return 'Нет соединения с сервером'
  }
  return message
}

/* ------------------------------------------------------------------ */
/* shared ui                                                           */
/* ------------------------------------------------------------------ */

const ghostBtn =
  'outline inline-flex items-center justify-center gap-2 rounded-full bg-paper-white px-5 py-2.5 font-aeonik-pro text-sm font-bold transition-[background-color,transform] duration-200 hover:bg-sky-wash active:scale-95 disabled:pointer-events-none disabled:opacity-50'
const solidBtn =
  'inline-flex items-center justify-center gap-2 rounded-full bg-carbon px-6 py-3 font-aeonik-pro text-sm font-bold text-paper-white transition-[background-color,transform] duration-200 hover:bg-voltage-violet active:scale-95 disabled:pointer-events-none disabled:opacity-50'
const dangerBtn =
  'outline inline-flex items-center justify-center gap-2 rounded-full bg-paper-white px-5 py-2.5 font-aeonik-pro text-sm font-bold text-ember transition-[background-color,color,transform] duration-200 hover:bg-ember hover:text-paper-white active:scale-95 disabled:pointer-events-none disabled:opacity-50'
const inputCls =
  'outline admin-input mt-1.5 w-full rounded-[16px] bg-paper-white px-4 py-2.5 font-aeonik-pro text-sm font-medium'

type ToastState = { kind: 'ok' | 'error'; text: string } | null

function useToast() {
  const [toast, setToast] = useState<ToastState>(null)
  const timer = useRef<number | undefined>(undefined)

  const show = useCallback((kind: 'ok' | 'error', text: string) => {
    window.clearTimeout(timer.current)
    setToast({ kind, text })
    timer.current = window.setTimeout(() => setToast(null), kind === 'ok' ? 2800 : 6000)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const node = toast ? (
    <div
      role="status"
      aria-live="polite"
      className={`admin-toast outline fixed bottom-6 left-1/2 z-[120] max-w-[min(92vw,520px)] -translate-x-1/2 rounded-full px-6 py-3 font-aeonik-pro text-sm font-bold ${
        toast.kind === 'ok'
          ? 'bg-mint-pop text-carbon'
          : 'bg-ember text-paper-white'
      }`}
    >
      {toast.text}
    </div>
  ) : null

  return { show, node }
}

function Shell({
  title,
  actions,
  children,
}: {
  title: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="min-h-screen bg-sky-wash">
      <div className="mx-auto max-w-4xl px-4 pb-32 pt-8 sm:px-6 md:pt-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1
            className="display"
            style={{ fontSize: 'clamp(36px, 7vw, 72px)', lineHeight: 0.9 }}
          >
            {title}
          </h1>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
        {children}
      </div>
    </section>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  disabled?: boolean
  hint?: string
}) {
  return (
    <label className="block">
      <span className="font-aeonik-pro text-xs font-bold uppercase tracking-[0.032em]">
        {label}
      </span>
      <input
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} disabled:cursor-not-allowed disabled:opacity-60`}
      />
      {hint && (
        <span className="mt-1 block font-aeonik-pro text-xs text-carbon/60">{hint}</span>
      )}
    </label>
  )
}

function Area({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <label className="block">
      <span className="font-aeonik-pro text-xs font-bold uppercase tracking-[0.032em]">
        {label}
      </span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} resize-y`}
      />
    </label>
  )
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`outline rounded-[24px] bg-paper-white/80 p-5 md:p-6 ${className}`}>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* auth                                                                */
/* ------------------------------------------------------------------ */

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const prev = document.title
    document.title = 'Админка · SERGEY'
    return () => {
      document.title = prev
    }
  }, [])

  useEffect(() => {
    let active = true
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return
        setSession(data.session)
      })
      .catch(() => {})
      .finally(() => {
        if (active) setAuthLoading(false)
      })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  if (authLoading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-sky-wash font-aeonik-pro font-bold">
        Загрузка…
      </section>
    )
  }

  if (!session) return <Login />
  return <Dashboard email={session.user.email ?? ''} />
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function signIn(e: FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      setError('Введи email и пароль')
      return
    }
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setBusy(false)
    if (error) setError(authErrorRu(error.message))
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-sky-wash px-4 py-16">
      <form
        onSubmit={signIn}
        className="outline admin-pop w-full max-w-md rounded-[32px] bg-paper-white p-8 md:p-10"
      >
        <span className="outline inline-block rounded-full bg-lavender px-4 py-1.5 font-aeonik-pro text-xs font-bold uppercase tracking-[0.032em]">
          Админка
        </span>
        <h1 className="display mt-4" style={{ fontSize: 56, lineHeight: 0.9 }}>
          Вход
        </h1>

        <div className="mt-8 space-y-4">
          <label className="block">
            <span className="font-aeonik-pro text-xs font-bold uppercase tracking-[0.032em]">
              Email
            </span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              autoFocus
            />
          </label>
          <label className="block">
            <span className="font-aeonik-pro text-xs font-bold uppercase tracking-[0.032em]">
              Пароль
            </span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
          </label>

          {error && (
            <p role="alert" className="font-aeonik-pro text-sm font-bold text-ember">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className={`${solidBtn} w-full`}>
            {busy ? 'Входим…' : 'Войти'}
          </button>
        </div>

        <Link
          to="/"
          className="mt-6 inline-block font-aeonik-pro text-sm font-bold text-carbon/60 transition-colors hover:text-carbon"
        >
          ← На сайт
        </Link>
      </form>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* dashboard                                                           */
/* ------------------------------------------------------------------ */

function Dashboard({ email }: { email: string }) {
  const { projects, loading, error, refresh } = useData()
  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [busySlug, setBusySlug] = useState<string | null>(null)
  const { show, node: toastNode } = useToast()

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function removeProject(slug: string) {
    setBusySlug(slug)
    try {
      const { data: row, error: findErr } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', slug)
        .single()
      if (findErr) throw findErr
      const { error: itemsErr } = await supabase
        .from('items')
        .delete()
        .eq('project_id', row.id)
      if (itemsErr) throw itemsErr
      const { error: projErr } = await supabase.from('projects').delete().eq('id', row.id)
      if (projErr) throw projErr
      await refresh()
      setPendingDelete(null)
      show('ok', 'Проект удалён')
    } catch (e) {
      show('error', 'Не удалось удалить: ' + errMsg(e))
    } finally {
      setBusySlug(null)
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= projects.length) return
    const order = projects.map((p) => p.slug)
    ;[order[index], order[target]] = [order[target], order[index]]
    setBusySlug(order[target])
    try {
      const results = await Promise.all(
        order.map((slug, i) =>
          supabase.from('projects').update({ sort_order: i }).eq('slug', slug),
        ),
      )
      const failed = results.find((r) => r.error)
      if (failed?.error) throw failed.error
      await refresh()
    } catch (e) {
      show('error', 'Не удалось изменить порядок: ' + errMsg(e))
    } finally {
      setBusySlug(null)
    }
  }

  if (editing !== null) {
    return (
      <ProjectForm
        slug={editing === 'new' ? null : editing}
        onBack={() => setEditing(null)}
        onSaved={() => setEditing(null)}
      />
    )
  }

  return (
    <Shell
      title="Админка"
      actions={
        <>
          <Link to="/" className={ghostBtn}>
            Открыть сайт ↗
          </Link>
          <button onClick={signOut} className={ghostBtn} title={email}>
            Выйти
          </button>
        </>
      }
    >
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="font-aeonik-pro text-sm font-bold text-carbon/60">
          Проектов: {projects.length}
        </p>
        <button onClick={() => setEditing('new')} className={solidBtn}>
          + Добавить проект
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {loading && (
          <Card>
            <p className="font-aeonik-pro text-sm font-bold text-carbon/60">Загрузка…</p>
          </Card>
        )}
        {!loading && error && (
          <Card>
            <p className="font-aeonik-pro text-sm font-bold text-ember">
              Не удалось загрузить проекты.
            </p>
            <button onClick={() => void refresh()} className={`${ghostBtn} mt-3`}>
              Повторить
            </button>
          </Card>
        )}
        {!loading && !error && projects.length === 0 && (
          <Card>
            <p className="font-aeonik-pro text-sm font-bold text-carbon/60">
              Пока нет ни одного проекта.
            </p>
          </Card>
        )}

        {projects.map((p, i) => {
          const confirming = pendingDelete === p.slug
          const busy = busySlug === p.slug
          return (
            <Card key={p.slug} className="admin-pop">
              <div className="flex flex-wrap items-center gap-4">
                <span
                  className="outline h-12 w-12 shrink-0 rounded-[14px]"
                  style={{ background: p.color }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-aeonik-pro text-lg font-bold leading-tight">
                    {p.en.title}
                  </p>
                  <p className="truncate font-aeonik-pro text-sm text-carbon/60">
                    {p.ru.title} · /{p.slug} · работ: {p.items.length}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0 || busySlug !== null}
                    className={`${ghostBtn} !px-3`}
                    aria-label="Выше"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === projects.length - 1 || busySlug !== null}
                    className={`${ghostBtn} !px-3`}
                    aria-label="Ниже"
                  >
                    ↓
                  </button>
                  <Link to={`/work/${p.slug}`} className={ghostBtn}>
                    Смотреть
                  </Link>
                  <button onClick={() => setEditing(p.slug)} className={ghostBtn}>
                    Изменить
                  </button>
                  {confirming ? (
                    <>
                      <button
                        onClick={() => removeProject(p.slug)}
                        disabled={busy}
                        className={`${dangerBtn} !bg-ember !text-paper-white`}
                      >
                        {busy ? 'Удаляю…' : 'Точно удалить'}
                      </button>
                      <button
                        onClick={() => setPendingDelete(null)}
                        disabled={busy}
                        className={ghostBtn}
                      >
                        Отмена
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setPendingDelete(p.slug)} className={dangerBtn}>
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
      {toastNode}
    </Shell>
  )
}

/* ------------------------------------------------------------------ */
/* project form                                                        */
/* ------------------------------------------------------------------ */

type FormItem = {
  uid: string
  titleEn: string
  titleRu: string
  descEn: string
  descRu: string
  featured: boolean
  video: string[]
  audio: string[]
  images: string[]
}

type FormState = {
  slug: string
  color: string
  image: string
  titleEn: string
  titleRu: string
  catEn: string
  catRu: string
  descEn: string
  descRu: string
  tagsEn: string
  tagsRu: string
  items: FormItem[]
}

function emptyItem(): FormItem {
  return {
    uid: uid(),
    titleEn: '',
    titleRu: '',
    descEn: '',
    descRu: '',
    featured: false,
    video: [],
    audio: [],
    images: [],
  }
}

const COLORS = ['#4da2ff', '#55db9c', '#e9ccff', '#fb4903', '#ffd731', '#5c4ade', '#cccccc']

function ProjectForm({
  slug,
  onBack,
  onSaved,
}: {
  slug: string | null
  onBack: () => void
  onSaved: () => void
}) {
  const { projects, featured, refresh } = useData()
  const existing = useMemo(
    () => (slug ? projects.find((p) => p.slug === slug) ?? null : null),
    [slug, projects],
  )

  const [form, setForm] = useState<FormState>(() => ({
    slug: existing?.slug ?? '',
    color: existing?.color ?? '#4da2ff',
    image: existing?.image ?? '',
    titleEn: existing?.en.title ?? '',
    titleRu: existing?.ru.title ?? '',
    catEn: existing?.en.category ?? '',
    catRu: existing?.ru.category ?? '',
    descEn: existing?.en.description ?? '',
    descRu: existing?.ru.description ?? '',
    tagsEn: existing?.en.tags.join(', ') ?? '',
    tagsRu: existing?.ru.tags.join(', ') ?? '',
    items: existing
      ? existing.items.map((it, idx) => ({
          uid: uid(),
          titleEn: it.en,
          titleRu: it.ru,
          descEn: it.desc?.en ?? '',
          descRu: it.desc?.ru ?? '',
          featured: featured.some((f) => f.project === existing.slug && f.item === idx),
          video: it.video ?? [],
          audio: it.audio ?? [],
          images: it.images ?? [],
        }))
      : [emptyItem()],
  }))

  const [baseline, setBaseline] = useState(() => JSON.stringify(form))
  const dirty = JSON.stringify(form) !== baseline

  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(0)
  const [slugTouched, setSlugTouched] = useState(Boolean(existing))
  const { show, node: toastNode } = useToast()

  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function setTitleEn(v: string) {
    setForm((f) => ({
      ...f,
      titleEn: v,
      slug: slugTouched || existing ? f.slug : slugify(v),
    }))
  }

  function patchItem(id: string, patch: Partial<FormItem>) {
    setForm((f) => ({
      ...f,
      items: f.items.map((it) => (it.uid === id ? { ...it, ...patch } : it)),
    }))
  }

  function removeItem(id: string) {
    setForm((f) => ({ ...f, items: f.items.filter((it) => it.uid !== id) }))
  }

  function moveItem(id: string, dir: -1 | 1) {
    setForm((f) => {
      const i = f.items.findIndex((it) => it.uid === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= f.items.length) return f
      const items = [...f.items]
      ;[items[i], items[j]] = [items[j], items[i]]
      return { ...f, items }
    })
  }

  function duplicateItem(id: string) {
    setForm((f) => {
      const i = f.items.findIndex((it) => it.uid === id)
      if (i < 0) return f
      const copy = { ...f.items[i], uid: uid(), featured: false }
      const items = [...f.items]
      items.splice(i + 1, 0, copy)
      return { ...f, items }
    })
  }

  async function uploadFiles(id: string, files: File[]) {
    if (!files.length) return
    setUploading((n) => n + files.length)
    for (const file of files) {
      try {
        if (file.size > MAX_FILE_MB * 1024 * 1024) {
          throw new Error(`${file.name}: больше ${MAX_FILE_MB} МБ`)
        }
        const path = await uploadMedia(file)
        const kind = mediaType(file)
        setForm((f) => ({
          ...f,
          items: f.items.map((it) =>
            it.uid === id ? { ...it, [kind]: [...it[kind], path] } : it,
          ),
        }))
      } catch (e) {
        show('error', 'Ошибка загрузки: ' + errMsg(e))
      } finally {
        setUploading((n) => n - 1)
      }
    }
  }

  async function uploadCover(files: File[]) {
    const file = files[0]
    if (!file) return
    setUploading((n) => n + 1)
    try {
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        throw new Error(`больше ${MAX_FILE_MB} МБ`)
      }
      const path = await uploadMedia(file)
      set('image', path)
    } catch (e) {
      show('error', 'Ошибка загрузки: ' + errMsg(e))
    } finally {
      setUploading((n) => n - 1)
    }
  }

  async function save() {
    const finalSlug = slugify(form.slug)
    if (!finalSlug) return show('error', 'Заполни slug (латиницей)')
    if (!form.titleEn.trim() || !form.titleRu.trim()) {
      return show('error', 'Заполни названия проекта (EN и RU)')
    }
    if (!existing && projects.some((p) => p.slug === finalSlug)) {
      return show('error', 'Проект с таким slug уже есть')
    }
    if (uploading > 0) return show('error', 'Дождись окончания загрузки файлов')

    setBusy(true)
    try {
      const projectRow = {
        slug: finalSlug,
        color: form.color,
        image: form.image || null,
        title_en: form.titleEn.trim(),
        title_ru: form.titleRu.trim(),
        category_en: form.catEn.trim(),
        category_ru: form.catRu.trim(),
        description_en: form.descEn.trim(),
        description_ru: form.descRu.trim(),
        tags_en: form.tagsEn.split(',').map((s) => s.trim()).filter(Boolean),
        tags_ru: form.tagsRu.split(',').map((s) => s.trim()).filter(Boolean),
      }

      let projectId: string
      if (existing) {
        const { data, error } = await supabase
          .from('projects')
          .update(projectRow)
          .eq('slug', existing.slug)
          .select('id')
          .single()
        if (error) throw error
        projectId = data.id
      } else {
        const { data, error } = await supabase
          .from('projects')
          .insert({ ...projectRow, sort_order: projects.length })
          .select('id')
          .single()
        if (error) throw error
        projectId = data.id
      }

      // Insert the new rows first and only then drop the old ones, so a failed
      // insert can never leave the project without its works.
      const { data: oldRows, error: oldErr } = await supabase
        .from('items')
        .select('id')
        .eq('project_id', projectId)
      if (oldErr) throw oldErr

      const rows = form.items
        .filter((it) => it.titleEn.trim() || it.titleRu.trim())
        .map((it, idx) => ({
          project_id: projectId,
          title_en: it.titleEn.trim() || it.titleRu.trim(),
          title_ru: it.titleRu.trim() || it.titleEn.trim(),
          desc_en: it.descEn.trim() || null,
          desc_ru: it.descRu.trim() || null,
          media: { video: it.video, audio: it.audio, images: it.images },
          featured: it.featured,
          featured_order: it.featured ? idx : null,
          sort_order: idx,
        }))

      if (rows.length) {
        const { error } = await supabase.from('items').insert(rows)
        if (error) throw error
      }

      const oldIds = (oldRows ?? []).map((r) => r.id)
      if (oldIds.length) {
        const { error } = await supabase.from('items').delete().in('id', oldIds)
        if (error) throw error
      }

      await refresh()
      setBaseline(JSON.stringify(form))
      show('ok', 'Сохранено')
      window.setTimeout(onSaved, 450)
    } catch (e) {
      show('error', 'Ошибка сохранения: ' + errMsg(e))
    } finally {
      setBusy(false)
    }
  }

  function back() {
    if (dirty && !window.confirm('Есть несохранённые изменения. Выйти без сохранения?')) {
      return
    }
    onBack()
  }

  if (slug && !existing) {
    return (
      <Shell title="Проект">
        <p className="mt-8 font-aeonik-pro font-bold">Проект не найден.</p>
        <button onClick={onBack} className={`${ghostBtn} mt-4`}>
          ← Назад
        </button>
      </Shell>
    )
  }

  return (
    <Shell
      title={existing ? 'Изменить' : 'Новый проект'}
      actions={
        <button onClick={back} className={ghostBtn}>
          ← Назад
        </button>
      }
    >
      <div className="mt-8 space-y-6">
        <Card>
          <h2 className="font-aeonik-pro text-lg font-bold">Основное</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Название (EN)"
              value={form.titleEn}
              onChange={setTitleEn}
            />
            <Field
              label="Название (RU)"
              value={form.titleRu}
              onChange={(v) => set('titleRu', v)}
            />
            <Field
              label="Slug (латиницей)"
              value={form.slug}
              onChange={(v) => {
                setSlugTouched(true)
                set('slug', v)
              }}
              hint={`Адрес: /work/${slugify(form.slug) || '…'}`}
            />
            <div>
              <span className="font-aeonik-pro text-xs font-bold uppercase tracking-[0.032em]">
                Цвет карточки
              </span>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set('color', c)}
                    aria-label={c}
                    aria-pressed={form.color === c}
                    className="outline h-9 w-9 rounded-full transition-transform duration-200 hover:scale-110"
                    style={{
                      background: c,
                      boxShadow:
                        form.color.toLowerCase() === c
                          ? '0 0 0 3px #fff, 0 0 0 5px #000'
                          : undefined,
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={/^#[0-9a-f]{6}$/i.test(form.color) ? form.color : '#4da2ff'}
                  onChange={(e) => set('color', e.target.value)}
                  aria-label="Свой цвет"
                  className="outline h-9 w-9 cursor-pointer overflow-hidden rounded-full bg-paper-white p-0"
                />
              </div>
            </div>
            <Field
              label="Категория (EN)"
              value={form.catEn}
              onChange={(v) => set('catEn', v)}
            />
            <Field
              label="Категория (RU)"
              value={form.catRu}
              onChange={(v) => set('catRu', v)}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4">
            <Area
              label="Описание (EN)"
              value={form.descEn}
              onChange={(v) => set('descEn', v)}
            />
            <Area
              label="Описание (RU)"
              value={form.descRu}
              onChange={(v) => set('descRu', v)}
            />
            <Field
              label="Теги (EN, через запятую)"
              value={form.tagsEn}
              onChange={(v) => set('tagsEn', v)}
            />
            <Field
              label="Теги (RU, через запятую)"
              value={form.tagsRu}
              onChange={(v) => set('tagsRu', v)}
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-aeonik-pro text-lg font-bold">Обложка-стикер</h2>
          <p className="mt-1 font-aeonik-pro text-sm text-carbon/60">
            Картинка в углу карточки проекта (лучше PNG с прозрачным фоном).
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div
              className="outline flex h-24 w-24 items-center justify-center overflow-hidden rounded-[20px]"
              style={{ background: form.color }}
            >
              {form.image ? (
                <img
                  src={mediaUrl(form.image)}
                  alt=""
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="font-aeonik-pro text-xs font-bold text-carbon/60">нет</span>
              )}
            </div>
            <label className={`${ghostBtn} cursor-pointer`}>
              {form.image ? 'Заменить' : 'Загрузить'}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  void uploadCover(Array.from(e.target.files ?? []))
                  e.target.value = ''
                }}
              />
            </label>
            {form.image && (
              <button type="button" onClick={() => set('image', '')} className={dangerBtn}>
                Убрать
              </button>
            )}
          </div>
        </Card>

        <div>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-aeonik-pro text-xl font-bold">Работы ({form.items.length})</h2>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, items: [...f.items, emptyItem()] }))}
              className={ghostBtn}
            >
              + Добавить работу
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {form.items.map((it, i) => (
              <ItemEditor
                key={it.uid}
                item={it}
                index={i}
                total={form.items.length}
                onPatch={(patch) => patchItem(it.uid, patch)}
                onRemove={() => removeItem(it.uid)}
                onMove={(dir) => moveItem(it.uid, dir)}
                onDuplicate={() => duplicateItem(it.uid)}
                onUpload={(files) => void uploadFiles(it.uid, files)}
              />
            ))}
            {form.items.length === 0 && (
              <Card>
                <p className="font-aeonik-pro text-sm text-carbon/60">
                  Работ пока нет — проект сохранится без них.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-carbon/10 bg-paper-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="font-aeonik-pro text-sm font-bold text-carbon/60">
            {uploading > 0
              ? `Загружаю файлов: ${uploading}…`
              : dirty
                ? 'Есть несохранённые изменения'
                : 'Всё сохранено'}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={back} className={ghostBtn}>
              Отмена
            </button>
            <button
              type="button"
              onClick={save}
              disabled={busy || uploading > 0}
              className={solidBtn}
            >
              {busy ? 'Сохраняю…' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
      {toastNode}
    </Shell>
  )
}

/* ------------------------------------------------------------------ */
/* item editor                                                         */
/* ------------------------------------------------------------------ */

function ItemEditor({
  item,
  index,
  total,
  onPatch,
  onRemove,
  onMove,
  onDuplicate,
  onUpload,
}: {
  item: FormItem
  index: number
  total: number
  onPatch: (patch: Partial<FormItem>) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
  onDuplicate: () => void
  onUpload: (files: File[]) => void
}) {
  const [open, setOpen] = useState(true)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [dragging, setDragging] = useState(false)

  const title = item.titleEn || item.titleRu || `Работа ${index + 1}`
  const count = item.video.length + item.audio.length + item.images.length

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setDragging(false)
    onUpload(Array.from(e.dataTransfer.files))
  }

  return (
    <Card className="admin-pop">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span
            aria-hidden
            className={`inline-block text-sm transition-transform duration-300 ${open ? 'rotate-90' : ''}`}
          >
            ▶
          </span>
          <span className="truncate font-aeonik-pro text-base font-bold">{title}</span>
          <span className="shrink-0 font-aeonik-pro text-xs font-bold text-carbon/50">
            файлов: {count}
          </span>
        </button>

        <label className="flex cursor-pointer items-center gap-2 font-aeonik-pro text-sm font-bold">
          <input
            type="checkbox"
            checked={item.featured}
            onChange={(e) => onPatch({ featured: e.target.checked })}
            className="h-4 w-4 accent-carbon"
          />
          В «Лучшее»
        </label>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className={`${ghostBtn} !px-3 !py-1.5`}
            aria-label="Выше"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className={`${ghostBtn} !px-3 !py-1.5`}
            aria-label="Ниже"
          >
            ↓
          </button>
          <button type="button" onClick={onDuplicate} className={`${ghostBtn} !py-1.5`}>
            Копия
          </button>
          {confirmRemove ? (
            <>
              <button
                type="button"
                onClick={onRemove}
                className={`${dangerBtn} !bg-ember !py-1.5 !text-paper-white`}
              >
                Удалить?
              </button>
              <button
                type="button"
                onClick={() => setConfirmRemove(false)}
                className={`${ghostBtn} !py-1.5`}
              >
                Нет
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmRemove(true)}
              className={`${dangerBtn} !py-1.5`}
            >
              Удалить
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Название (EN)"
              value={item.titleEn}
              onChange={(v) => onPatch({ titleEn: v })}
            />
            <Field
              label="Название (RU)"
              value={item.titleRu}
              onChange={(v) => onPatch({ titleRu: v })}
            />
            <Area
              label="Описание (EN)"
              value={item.descEn}
              onChange={(v) => onPatch({ descEn: v })}
            />
            <Area
              label="Описание (RU)"
              value={item.descRu}
              onChange={(v) => onPatch({ descRu: v })}
            />
          </div>

          <MediaGroup
            label="Видео"
            kind="video"
            files={item.video}
            onRemove={(idx) => onPatch({ video: item.video.filter((_, j) => j !== idx) })}
          />
          <MediaGroup
            label="Аудио"
            kind="audio"
            files={item.audio}
            onRemove={(idx) => onPatch({ audio: item.audio.filter((_, j) => j !== idx) })}
          />
          <MediaGroup
            label="Фото"
            kind="images"
            files={item.images}
            onRemove={(idx) => onPatch({ images: item.images.filter((_, j) => j !== idx) })}
          />

          <label
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-[20px] border-2 border-dashed px-4 py-6 text-center font-aeonik-pro text-sm font-bold transition-colors duration-200 ${
              dragging
                ? 'border-voltage-violet bg-lavender/60'
                : 'border-carbon/30 bg-paper-white hover:bg-sky-wash'
            }`}
          >
            <span>Перетащи файлы сюда или нажми, чтобы выбрать</span>
            <span className="text-xs font-medium text-carbon/60">
              Видео, аудио и фото определяются автоматически · до {MAX_FILE_MB} МБ
            </span>
            <input
              type="file"
              multiple
              accept="video/*,audio/*,image/*"
              className="sr-only"
              onChange={(e) => {
                onUpload(Array.from(e.target.files ?? []))
                e.target.value = ''
              }}
            />
          </label>
        </div>
      )}
    </Card>
  )
}

function MediaGroup({
  label,
  kind,
  files,
  onRemove,
}: {
  label: string
  kind: MediaKind
  files: string[]
  onRemove: (idx: number) => void
}) {
  if (!files.length) return null
  return (
    <div>
      <span className="font-aeonik-pro text-xs font-bold uppercase tracking-[0.032em]">
        {label} · {files.length}
      </span>
      <div
        className={`mt-2 grid gap-3 ${
          kind === 'audio' ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'
        }`}
      >
        {files.map((f, i) => (
          <div key={f + i} className="outline relative overflow-hidden rounded-[16px] bg-paper-white">
            {kind === 'images' && (
              <img
                src={mediaUrl(f)}
                alt=""
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            )}
            {kind === 'video' && (
              <video
                src={mediaUrl(f)}
                muted
                preload="metadata"
                className="aspect-[4/3] w-full bg-carbon/10 object-cover"
              />
            )}
            {kind === 'audio' && (
              <audio src={mediaUrl(f)} controls preload="none" className="w-full" />
            )}
            <div className="flex items-center justify-between gap-2 border-t border-carbon/10 px-3 py-1.5">
              <span className="truncate font-aeonik-pro text-xs text-carbon/60">{f}</span>
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label="Убрать файл"
                className="font-aeonik-pro text-base font-bold leading-none text-ember"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
