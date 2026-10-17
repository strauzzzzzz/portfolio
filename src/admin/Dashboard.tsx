import { useState } from 'react'
import type { DragEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useData } from '../context/DataContext'
import type { WorkItem } from '../data'
import { errMsg, mediaUrl } from './helpers'
import ProjectSettings from './ProjectSettings'
import WorkEditor from './WorkEditor'
import { dangerBtn, ghostBtn, solidBtn, useToast } from './ui'

type EditorState = { work: WorkItem | null; files?: File[] } | null
type SettingsState = 'new' | 'edit' | null

function Thumb({ work }: { work: WorkItem }) {
  const image = work.images?.[0]
  const video = work.video?.[0]
  if (image) {
    return (
      <img
        src={mediaUrl(image)}
        alt=""
        loading="lazy"
        className="aspect-[4/3] w-full object-cover"
      />
    )
  }
  if (video) {
    return (
      <video
        src={mediaUrl(video)}
        muted
        preload="metadata"
        className="aspect-[4/3] w-full bg-carbon/10 object-cover"
      />
    )
  }
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center bg-lavender text-4xl">
      {work.audio?.length ? '♪' : '∅'}
    </div>
  )
}

function Badge({ children }: { children: string }) {
  return (
    <span className="outline rounded-full bg-paper-white px-2.5 py-0.5 font-aeonik-pro text-xs font-bold">
      {children}
    </span>
  )
}

export default function Dashboard({ email }: { email: string }) {
  const { projects, featured, loading, error, refresh } = useData()
  const [slug, setSlug] = useState<string | null>(null)
  const [editor, setEditor] = useState<EditorState>(null)
  const [settings, setSettings] = useState<SettingsState>(null)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const { show, node: toastNode } = useToast()

  const project = projects.find((p) => p.slug === slug) ?? projects[0] ?? null

  async function guard(id: string, fn: () => Promise<void>, failText: string) {
    setBusyId(id)
    try {
      await fn()
    } catch (e) {
      show('error', `${failText}: ${errMsg(e)}`)
    } finally {
      setBusyId(null)
    }
  }

  function toggleFeatured(work: WorkItem) {
    if (!work.id) return
    void guard(
      work.id,
      async () => {
        const next = !work.featured
        const { error } = await supabase
          .from('items')
          .update({ featured: next, featured_order: next ? featured.length : null })
          .eq('id', work.id!)
        if (error) throw error
        await refresh()
        show('ok', next ? 'Добавлено в «Лучшее»' : 'Убрано из «Лучшее»')
      },
      'Не удалось изменить',
    )
  }

  function removeWork(work: WorkItem) {
    if (!work.id) return
    void guard(
      work.id,
      async () => {
        const { error } = await supabase.from('items').delete().eq('id', work.id!)
        if (error) throw error
        await refresh()
        setPendingDelete(null)
        show('ok', 'Работа удалена')
      },
      'Не удалось удалить',
    )
  }

  function moveWork(index: number, dir: -1 | 1) {
    if (!project) return
    const target = index + dir
    if (target < 0 || target >= project.items.length) return
    const order = project.items.map((w) => w.id!)
    ;[order[index], order[target]] = [order[target], order[index]]
    void guard(
      order[target],
      async () => {
        const results = await Promise.all(
          order.map((id, i) => supabase.from('items').update({ sort_order: i }).eq('id', id)),
        )
        const failed = results.find((r) => r.error)
        if (failed?.error) throw failed.error
        await refresh()
      },
      'Не удалось изменить порядок',
    )
  }

  function moveProject(dir: -1 | 1) {
    if (!project) return
    const index = projects.findIndex((p) => p.slug === project.slug)
    const target = index + dir
    if (target < 0 || target >= projects.length) return
    const order = projects.map((p) => p.id!)
    ;[order[index], order[target]] = [order[target], order[index]]
    void guard(
      project.slug,
      async () => {
        const results = await Promise.all(
          order.map((id, i) => supabase.from('projects').update({ sort_order: i }).eq('id', id)),
        )
        const failed = results.find((r) => r.error)
        if (failed?.error) throw failed.error
        await refresh()
      },
      'Не удалось изменить порядок',
    )
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length) setEditor({ work: null, files })
  }

  const projectIndex = project ? projects.findIndex((p) => p.slug === project.slug) : -1

  return (
    <section className="min-h-screen bg-sky-wash">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 md:pt-10">
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="display" style={{ fontSize: 'clamp(34px, 6vw, 64px)', lineHeight: 0.9 }}>
            Админка
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/" className={ghostBtn}>
              Открыть сайт ↗
            </Link>
            <button
              onClick={() => void supabase.auth.signOut()}
              className={ghostBtn}
              title={email}
            >
              Выйти
            </button>
          </div>
        </div>

        {loading && (
          <p className="mt-10 font-aeonik-pro font-bold text-carbon/60">Загрузка…</p>
        )}

        {!loading && error && (
          <div className="outline mt-10 rounded-[24px] bg-paper-white p-6">
            <p className="font-aeonik-pro font-bold text-ember">Не удалось загрузить проекты.</p>
            <button onClick={() => void refresh()} className={`${ghostBtn} mt-3`}>
              Повторить
            </button>
          </div>
        )}

        {/* project tabs */}
        {!loading && !error && (
          <>
            <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2" role="tablist">
              {projects.map((p) => {
                const active = p.slug === project?.slug
                return (
                  <button
                    key={p.slug}
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setSlug(p.slug)
                      setPendingDelete(null)
                    }}
                    className={`outline flex shrink-0 items-center gap-2 rounded-full px-4 py-2 font-aeonik-pro text-sm font-bold transition-[background-color,transform] duration-200 active:scale-95 ${
                      active ? 'bg-carbon text-paper-white' : 'bg-paper-white hover:bg-lavender/60'
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-current"
                      style={{ background: p.color }}
                      aria-hidden
                    />
                    {p.ru.title}
                    <span className={`text-xs ${active ? 'text-paper-white/60' : 'text-carbon/50'}`}>
                      {p.items.length}
                    </span>
                  </button>
                )
              })}
              <button
                onClick={() => setSettings('new')}
                className="outline shrink-0 rounded-full border-dashed bg-transparent px-4 py-2 font-aeonik-pro text-sm font-bold transition-colors hover:bg-paper-white"
              >
                + Проект
              </button>
            </div>

            {!project && (
              <div className="outline mt-6 rounded-[24px] bg-paper-white p-8 text-center font-aeonik-pro font-bold text-carbon/70">
                Проектов пока нет. Создай первый кнопкой «+ Проект».
              </div>
            )}

            {project && (
              <div className="admin-pop mt-4" key={project.slug}>
                {/* project header */}
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-aeonik-pro text-xs font-bold uppercase tracking-[0.032em] text-carbon/60">
                      {project.ru.category} · /{project.slug}
                    </p>
                    <h2 className="font-aeonik-pro text-3xl font-bold leading-tight">
                      {project.ru.title}
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => moveProject(-1)}
                      disabled={projectIndex <= 0 || busyId !== null}
                      className={`${ghostBtn} !px-3`}
                      aria-label="Сдвинуть проект левее"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => moveProject(1)}
                      disabled={projectIndex >= projects.length - 1 || busyId !== null}
                      className={`${ghostBtn} !px-3`}
                      aria-label="Сдвинуть проект правее"
                    >
                      →
                    </button>
                    <Link to={`/work/${project.slug}`} className={ghostBtn}>
                      Смотреть на сайте
                    </Link>
                    <button onClick={() => setSettings('edit')} className={ghostBtn}>
                      Настройки проекта
                    </button>
                    <button onClick={() => setEditor({ work: null })} className={solidBtn}>
                      + Новая работа
                    </button>
                  </div>
                </div>

                {/* works */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {project.items.map((work, i) => {
                    const confirming = pendingDelete === work.id
                    const busy = busyId === work.id
                    return (
                      <article
                        key={work.id ?? i}
                        className={`outline flex flex-col overflow-hidden rounded-[22px] bg-paper-white transition-opacity ${
                          busy ? 'opacity-60' : ''
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setEditor({ work })}
                          className="group relative block text-left"
                          aria-label={`Изменить: ${work.ru}`}
                        >
                          <Thumb work={work} />
                          <span className="absolute inset-0 flex items-center justify-center bg-carbon/45 font-aeonik-pro text-sm font-bold text-paper-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                            Изменить
                          </span>
                        </button>

                        <div className="flex flex-1 flex-col gap-3 p-4">
                          <div>
                            <h3 className="font-aeonik-pro text-base font-bold leading-snug">
                              {work.ru}
                            </h3>
                            {work.en !== work.ru && (
                              <p className="font-aeonik-pro text-sm text-carbon/55">{work.en}</p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {!!work.images?.length && <Badge>{`Фото ${work.images.length}`}</Badge>}
                            {!!work.video?.length && <Badge>{`Видео ${work.video.length}`}</Badge>}
                            {!!work.audio?.length && <Badge>{`Аудио ${work.audio.length}`}</Badge>}
                            {!work.images?.length && !work.video?.length && !work.audio?.length && (
                              <Badge>Без файлов</Badge>
                            )}
                          </div>

                          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
                            <button
                              onClick={() => toggleFeatured(work)}
                              disabled={busy}
                              aria-pressed={work.featured}
                              title="Показывать в «Лучшее» на главной"
                              className={`outline rounded-full px-3 py-1.5 font-aeonik-pro text-sm font-bold transition-[background-color,transform] active:scale-95 ${
                                work.featured ? 'bg-sunburst' : 'bg-paper-white hover:bg-sunburst/40'
                              }`}
                            >
                              {work.featured ? '★ Лучшее' : '☆ Лучшее'}
                            </button>
                            <button
                              onClick={() => moveWork(i, -1)}
                              disabled={i === 0 || busyId !== null}
                              className="outline rounded-full px-3 py-1.5 font-aeonik-pro text-sm font-bold transition-colors hover:bg-sky-wash disabled:opacity-30"
                              aria-label="Выше"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveWork(i, 1)}
                              disabled={i === project.items.length - 1 || busyId !== null}
                              className="outline rounded-full px-3 py-1.5 font-aeonik-pro text-sm font-bold transition-colors hover:bg-sky-wash disabled:opacity-30"
                              aria-label="Ниже"
                            >
                              ↓
                            </button>
                            {confirming ? (
                              <>
                                <button
                                  onClick={() => removeWork(work)}
                                  disabled={busy}
                                  className={`${dangerBtn} !bg-ember !px-3 !py-1.5 !text-paper-white`}
                                >
                                  Удалить?
                                </button>
                                <button
                                  onClick={() => setPendingDelete(null)}
                                  className={`${ghostBtn} !px-3 !py-1.5`}
                                >
                                  Нет
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setPendingDelete(work.id ?? null)}
                                className={`${dangerBtn} ml-auto !px-3 !py-1.5`}
                              >
                                Удалить
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    )
                  })}

                  {/* add / drop card */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragging(true)
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    className={`flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-[22px] border-2 border-dashed p-6 text-center transition-colors duration-200 ${
                      dragging
                        ? 'border-voltage-violet bg-lavender/70'
                        : 'border-carbon/30 bg-paper-white/50'
                    }`}
                  >
                    <p className="font-aeonik-pro text-base font-bold">
                      Перетащи сюда файлы — получится новая работа
                    </p>
                    <p className="font-aeonik-pro text-xs text-carbon/60">
                      Фото, видео и аудио определятся сами
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <label className={`${solidBtn} cursor-pointer`}>
                        Выбрать файлы
                        <input
                          type="file"
                          multiple
                          accept="video/*,audio/*,image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const files = Array.from(e.target.files ?? [])
                            if (files.length) setEditor({ work: null, files })
                            e.target.value = ''
                          }}
                        />
                      </label>
                      <button onClick={() => setEditor({ work: null })} className={ghostBtn}>
                        Пустая работа
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {editor && project && (
        <WorkEditor
          key={editor.work?.id ?? 'new'}
          project={project}
          work={editor.work}
          initialFiles={editor.files}
          featuredCount={featured.length}
          onClose={() => setEditor(null)}
          onSaved={refresh}
          notify={show}
        />
      )}

      {settings && (
        <ProjectSettings
          key={settings === 'edit' ? project?.slug : 'new'}
          project={settings === 'edit' ? project : null}
          projects={projects}
          onClose={() => setSettings(null)}
          onSaved={async (newSlug) => {
            await refresh()
            setSlug(newSlug)
          }}
          onDeleted={async () => {
            setSlug(null)
            await refresh()
          }}
          notify={show}
        />
      )}

      {toastNode}
    </section>
  )
}
