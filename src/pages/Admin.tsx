import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useData } from '../context/DataContext'

function mediaType(file: File): 'video' | 'audio' | 'images' {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (['mp4', 'webm', 'mov', 'm4v'].includes(ext)) return 'video'
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'audio'
  return 'images'
}

async function uploadMedia(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? ''
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
  const { error } = await supabase.storage.from('media').upload(name, file)
  if (error) throw error
  return name
}

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Загрузка…
      </div>
    )
  }

  if (!session) return <Login />
  return <Dashboard />
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function signIn() {
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) setError(error.message)
  }

  async function signUp() {
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    setBusy(false)
    if (error) setError(error.message)
    else setError('Проверь почту — если нужно подтверждение, кликни по ссылке')
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-lateral text-4xl font-extrabold uppercase">Вход</h1>
      <div className="mt-8 space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="outline w-full rounded-full px-4 py-3"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="outline w-full rounded-full px-4 py-3"
        />
        {error && <p className="text-ember">{error}</p>}
        <button
          onClick={signIn}
          disabled={busy}
          className="rounded-full bg-carbon px-6 py-3 font-bold text-paper-white"
        >
          Войти
        </button>
        <button
          onClick={signUp}
          disabled={busy}
          className="outline rounded-full px-6 py-3 font-bold"
        >
          Создать аккаунт
        </button>
      </div>
    </div>
  )
}

type FormItem = {
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

function Dashboard() {
  const { projects } = useData()
  const [editing, setEditing] = useState<string | 'new' | null>(null)

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function removeProject(slug: string) {
    if (!window.confirm('Удалить проект?')) return
    await supabase.from('projects').delete().eq('slug', slug)
    window.location.reload()
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-lateral text-4xl font-extrabold uppercase">Админка</h1>
        <button onClick={signOut} className="outline rounded-full px-4 py-2 font-bold">
          Выйти
        </button>
      </div>

      {editing === null ? (
        <>
          <button
            onClick={() => setEditing('new')}
            className="mt-8 rounded-full bg-carbon px-6 py-3 font-bold text-paper-white"
          >
            + Добавить проект
          </button>
          <div className="mt-6 space-y-3">
            {projects.map((p) => (
              <div
                key={p.slug}
                className="outline flex items-center justify-between rounded-[20px] p-4"
              >
                <div>
                  <p className="font-bold">{p.en.title}</p>
                  <p className="text-sm text-carbon/60">{p.slug}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(p.slug)}
                    className="outline rounded-full px-4 py-2 font-bold"
                  >
                    Изменить
                  </button>
                  <button
                    onClick={() => removeProject(p.slug)}
                    className="outline rounded-full px-4 py-2 font-bold text-ember"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <ProjectForm
          slug={editing === 'new' ? null : editing}
          onBack={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function ProjectForm({ slug, onBack }: { slug: string | null; onBack: () => void }) {
  const { projects } = useData()
  const existing = slug ? projects.find((p) => p.slug === slug) : null

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
      ? existing.items.map((it) => ({
          titleEn: it.en,
          titleRu: it.ru,
          descEn: it.desc?.en ?? '',
          descRu: it.desc?.ru ?? '',
          featured: false,
          video: it.video ?? [],
          audio: it.audio ?? [],
          images: it.images ?? [],
        }))
      : [emptyItem()],
  }))
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function setItem(i: number, patch: Partial<FormItem>) {
    setForm((f) => ({
      ...f,
      items: f.items.map((it, j) => (j === i ? { ...it, ...patch } : it)),
    }))
  }

  function slugify(s: string) {
    return s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  async function uploadFiles(i: number, list: FileList | null) {
    if (!list) return
    setBusy(true)
    for (const file of Array.from(list)) {
      try {
        const path = await uploadMedia(file)
        const kind = mediaType(file)
        setForm((f) => ({
          ...f,
          items: f.items.map((it, j) =>
            j === i ? { ...it, [kind]: [...(it[kind] ?? []), path] } : it,
          ),
        }))
      } catch (e) {
        setMsg('Ошибка загрузки файла: ' + (e as Error).message)
        console.error(e)
      }
    }
    setBusy(false)
  }

  async function save() {
    if (!form.slug || !form.titleEn || !form.titleRu) {
      setMsg('Заполни slug и названия (EN + RU)')
      return
    }
    setBusy(true)
    setMsg('')

    const projectRow = {
      slug: slugify(form.slug),
      color: form.color,
      image: form.image || null,
      title_en: form.titleEn,
      title_ru: form.titleRu,
      category_en: form.catEn,
      category_ru: form.catRu,
      description_en: form.descEn,
      description_ru: form.descRu,
      tags_en: form.tagsEn.split(',').map((s) => s.trim()).filter(Boolean),
      tags_ru: form.tagsRu.split(',').map((s) => s.trim()).filter(Boolean),
    }

    let projectId: string | null = null

    if (existing) {
      const { data, error } = await supabase
        .from('projects')
        .update(projectRow)
        .eq('slug', existing.slug)
        .select('id')
        .single()
      if (error) {
        setMsg('Ошибка: ' + error.message)
        setBusy(false)
        return
      }
      projectId = data.id
    } else {
      const { data, error } = await supabase
        .from('projects')
        .insert(projectRow)
        .select('id')
        .single()
      if (error) {
        setMsg('Ошибка: ' + error.message)
        setBusy(false)
        return
      }
      projectId = data.id
    }

    await supabase.from('items').delete().eq('project_id', projectId)

    const rows = form.items
      .filter((it) => it.titleEn || it.titleRu)
      .map((it, idx) => ({
        project_id: projectId,
        title_en: it.titleEn,
        title_ru: it.titleRu,
        desc_en: it.descEn || null,
        desc_ru: it.descRu || null,
        media: {
          video: it.video,
          audio: it.audio,
          images: it.images,
        },
        featured: it.featured,
        featured_order: it.featured ? idx : null,
        sort_order: idx,
      }))

    if (rows.length) {
      const { error } = await supabase.from('items').insert(rows)
      if (error) {
        setMsg('Ошибка items: ' + error.message)
        setBusy(false)
        return
      }
    }

    setBusy(false)
    setMsg('Сохранено!')
    window.location.reload()
  }

  const colors = ['#4da2ff', '#55db9c', '#e9ccff', '#fb4903', '#ffd731', '#5c4ade', '#cccccc']

  return (
    <div className="mt-8 space-y-6">
      <button onClick={onBack} className="outline rounded-full px-4 py-2 font-bold">
        ← Назад
      </button>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Slug (латиницей)" value={form.slug} onChange={(v) => set('slug', v)} />
        <div>
          <label className="text-sm font-bold">Цвет</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => set('color', c)}
                className="outline h-8 w-8 rounded-full"
                style={{ background: c, border: form.color === c ? '3px solid #000' : undefined }}
              />
            ))}
          </div>
        </div>
        <Field label="Название (EN)" value={form.titleEn} onChange={(v) => set('titleEn', v)} />
        <Field label="Название (RU)" value={form.titleRu} onChange={(v) => set('titleRu', v)} />
        <Field label="Категория (EN)" value={form.catEn} onChange={(v) => set('catEn', v)} />
        <Field label="Категория (RU)" value={form.catRu} onChange={(v) => set('catRu', v)} />
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Area label="Описание (EN)" value={form.descEn} onChange={(v) => set('descEn', v)} />
        <Area label="Описание (RU)" value={form.descRu} onChange={(v) => set('descRu', v)} />
        <Field label="Теги (EN, через запятую)" value={form.tagsEn} onChange={(v) => set('tagsEn', v)} />
        <Field label="Теги (RU, через запятую)" value={form.tagsRu} onChange={(v) => set('tagsRu', v)} />
      </div>

      <div>
        <h2 className="font-lateral text-2xl font-extrabold uppercase">Работы</h2>
        <div className="mt-4 space-y-4">
          {form.items.map((it, i) => (
            <div key={i} className="outline rounded-[20px] p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold">Работа {i + 1}</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={it.featured}
                      onChange={(e) => setItem(i, { featured: e.target.checked })}
                    />
                    В «Лучшее»
                  </label>
                  <button
                    onClick={() => setForm((f) => ({ ...f, items: f.items.filter((_, j) => j !== i) }))}
                    className="text-ember"
                  >
                    Удалить
                  </button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Название (EN)" value={it.titleEn} onChange={(v) => setItem(i, { titleEn: v })} />
                <Field label="Название (RU)" value={it.titleRu} onChange={(v) => setItem(i, { titleRu: v })} />
                <Area label="Описание (EN)" value={it.descEn} onChange={(v) => setItem(i, { descEn: v })} />
                <Area label="Описание (RU)" value={it.descRu} onChange={(v) => setItem(i, { descRu: v })} />
              </div>
              <MediaList
                label="Видео"
                files={it.video}
                onRemove={(idx) =>
                  setItem(i, { video: it.video.filter((_, j) => j !== idx) })
                }
                onUpload={(list) => uploadFiles(i, list)}
              />
              <MediaList
                label="Аудио"
                files={it.audio}
                onRemove={(idx) =>
                  setItem(i, { audio: it.audio.filter((_, j) => j !== idx) })
                }
                onUpload={(list) => uploadFiles(i, list)}
              />
              <MediaList
                label="Фото"
                files={it.images}
                onRemove={(idx) =>
                  setItem(i, { images: it.images.filter((_, j) => j !== idx) })
                }
                onUpload={(list) => uploadFiles(i, list)}
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => setForm((f) => ({ ...f, items: [...f.items, emptyItem()] }))}
          className="mt-4 outline rounded-full px-5 py-2.5 font-bold"
        >
          + Добавить работу
        </button>
      </div>

      {msg && <p className="text-ember">{msg}</p>}
      <button
        onClick={save}
        disabled={busy}
        className="rounded-full bg-carbon px-8 py-3.5 font-bold text-paper-white"
      >
        {busy ? 'Сохраняю…' : 'Сохранить'}
      </button>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="outline mt-1 w-full rounded-full px-4 py-2.5"
      />
    </label>
  )
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="outline mt-1 w-full rounded-[16px] px-4 py-2.5"
      />
    </label>
  )
}

function MediaList({
  label,
  files,
  onRemove,
  onUpload,
}: {
  label: string
  files: string[]
  onRemove: (idx: number) => void
  onUpload: (list: FileList | null) => void
}) {
  return (
    <div className="mt-3">
      <span className="text-sm font-bold">{label}</span>
      <div className="mt-1 flex flex-wrap gap-2">
        {files.map((f, i) => (
          <span key={i} className="outline flex items-center gap-1 rounded-full px-3 py-1 text-xs">
            <span className="max-w-[160px] truncate">{f}</span>
            <button onClick={() => onRemove(i)} className="font-bold">×</button>
          </span>
        ))}
      </div>
      <input
        type="file"
        multiple
        onChange={(e) => onUpload(e.target.files)}
        className="mt-2 text-sm"
      />
    </div>
  )
}
