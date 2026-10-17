import { useEffect, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { supabase } from '../lib/supabase'
import type { Project, WorkItem } from '../data'
import {
  MAX_FILE_MB,
  errMsg,
  mediaType,
  mediaUrl,
  titleFromFilename,
  uploadMedia,
} from './helpers'
import type { MediaKind } from './helpers'
import { Area, Field, Modal, dangerBtn, ghostBtn, labelCls, solidBtn } from './ui'

type Draft = {
  titleRu: string
  titleEn: string
  descRu: string
  descEn: string
  featured: boolean
  video: string[]
  audio: string[]
  images: string[]
}

function toDraft(work: WorkItem | null): Draft {
  return {
    titleRu: work?.ru ?? '',
    titleEn: work?.en ?? '',
    descRu: work?.desc?.ru ?? '',
    descEn: work?.desc?.en ?? '',
    featured: work?.featured ?? false,
    video: work?.video ?? [],
    audio: work?.audio ?? [],
    images: work?.images ?? [],
  }
}

export default function WorkEditor({
  project,
  work,
  initialFiles,
  featuredCount,
  onClose,
  onSaved,
  notify,
}: {
  project: Project
  work: WorkItem | null
  initialFiles?: File[]
  featuredCount: number
  onClose: () => void
  onSaved: () => Promise<void> | void
  notify: (kind: 'ok' | 'error', text: string) => void
}) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(work))
  const [baseline, setBaseline] = useState(() => JSON.stringify(toDraft(work)))
  const [uploading, setUploading] = useState(0)
  const [saving, setSaving] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [showDesc, setShowDesc] = useState(
    Boolean(work?.desc?.ru || work?.desc?.en),
  )
  const titleTouched = useRef(Boolean(work))
  const dirty = JSON.stringify(draft) !== baseline

  function patch(p: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...p }))
  }

  async function addFiles(files: File[]) {
    if (!files.length) return
    setUploading((n) => n + files.length)
    for (const file of files) {
      try {
        const path = await uploadMedia(file)
        const kind = mediaType(file)
        setDraft((d) => ({
          ...d,
          [kind]: [...d[kind], path],
          // A fresh work takes its title from the first file until the user types one.
          titleRu:
            !titleTouched.current && !d.titleRu
              ? titleFromFilename(file.name)
              : d.titleRu,
        }))
      } catch (e) {
        notify('error', 'Ошибка загрузки: ' + errMsg(e))
      } finally {
        setUploading((n) => n - 1)
      }
    }
  }

  // Files dropped onto the project (not into the editor) arrive here to start a new work.
  const startedWith = useRef(false)
  useEffect(() => {
    if (startedWith.current || !initialFiles?.length) return
    startedWith.current = true
    void addFiles(initialFiles)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function removeFile(kind: MediaKind, idx: number) {
    setDraft((d) => ({ ...d, [kind]: d[kind].filter((_, i) => i !== idx) }))
  }

  function moveFile(kind: MediaKind, idx: number, dir: -1 | 1) {
    setDraft((d) => {
      const j = idx + dir
      if (j < 0 || j >= d[kind].length) return d
      const list = [...d[kind]]
      ;[list[idx], list[j]] = [list[j], list[idx]]
      return { ...d, [kind]: list }
    })
  }

  async function save() {
    const ru = draft.titleRu.trim()
    const en = draft.titleEn.trim()
    if (!ru && !en) {
      notify('error', 'Впиши название работы')
      return
    }
    if (uploading > 0) {
      notify('error', 'Дождись окончания загрузки файлов')
      return
    }
    if (!project.id) {
      notify('error', 'У проекта нет id — обнови страницу')
      return
    }

    setSaving(true)
    try {
      const row = {
        title_ru: ru || en,
        title_en: en || ru,
        desc_ru: draft.descRu.trim() || null,
        desc_en: draft.descEn.trim() || null,
        media: { video: draft.video, audio: draft.audio, images: draft.images },
        featured: draft.featured,
        featured_order: draft.featured
          ? work?.featured
            ? undefined
            : featuredCount
          : null,
      }

      if (work?.id) {
        const { error } = await supabase.from('items').update(row).eq('id', work.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('items').insert({
          ...row,
          featured_order: draft.featured ? featuredCount : null,
          project_id: project.id,
          sort_order: project.items.length,
        })
        if (error) throw error
      }

      await onSaved()
      setBaseline(JSON.stringify(draft))
      notify('ok', work ? 'Работа сохранена' : 'Работа добавлена')
      onClose()
    } catch (e) {
      notify('error', 'Не удалось сохранить: ' + errMsg(e))
    } finally {
      setSaving(false)
    }
  }

  function requestClose() {
    if (dirty && !window.confirm('Есть несохранённые изменения. Закрыть без сохранения?')) {
      return
    }
    onClose()
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setDragging(false)
    void addFiles(Array.from(e.dataTransfer.files))
  }

  const total = draft.video.length + draft.audio.length + draft.images.length

  return (
    <Modal
      title={work ? 'Изменить работу' : `Новая работа · ${project.ru.title}`}
      onClose={requestClose}
      footer={
        <>
          <p className="font-aeonik-pro text-sm font-bold text-carbon/60">
            {uploading > 0
              ? `Загружаю файлов: ${uploading}…`
              : dirty
                ? 'Есть несохранённые изменения'
                : 'Без изменений'}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={requestClose} className={ghostBtn}>
              Отмена
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving || uploading > 0}
              className={solidBtn}
            >
              {saving ? 'Сохраняю…' : work ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Название (RU)"
            value={draft.titleRu}
            onChange={(v) => {
              titleTouched.current = true
              patch({ titleRu: v })
            }}
            autoFocus={!work}
          />
          <Field
            label="Название (EN)"
            value={draft.titleEn}
            onChange={(v) => patch({ titleEn: v })}
            hint="Можно оставить пустым — возьмётся русское"
          />
        </div>

        <label
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-[22px] border-2 border-dashed px-4 py-8 text-center font-aeonik-pro text-sm font-bold transition-colors duration-200 ${
            dragging
              ? 'border-voltage-violet bg-lavender/70'
              : 'border-carbon/30 bg-paper-white hover:bg-lavender/40'
          }`}
        >
          <span className="text-base">
            Перетащи фото, видео или аудио сюда
          </span>
          <span className="text-xs font-medium text-carbon/60">
            или нажми, чтобы выбрать · тип определяется сам · до {MAX_FILE_MB} МБ
          </span>
          <input
            type="file"
            multiple
            accept="video/*,audio/*,image/*"
            className="sr-only"
            onChange={(e) => {
              void addFiles(Array.from(e.target.files ?? []))
              e.target.value = ''
            }}
          />
        </label>

        {total > 0 && (
          <div className="space-y-5">
            <MediaGroup
              label="Фото"
              kind="images"
              files={draft.images}
              onRemove={(i) => removeFile('images', i)}
              onMove={(i, d) => moveFile('images', i, d)}
            />
            <MediaGroup
              label="Видео"
              kind="video"
              files={draft.video}
              onRemove={(i) => removeFile('video', i)}
              onMove={(i, d) => moveFile('video', i, d)}
            />
            <MediaGroup
              label="Аудио"
              kind="audio"
              files={draft.audio}
              onRemove={(i) => removeFile('audio', i)}
              onMove={(i, d) => moveFile('audio', i, d)}
            />
          </div>
        )}

        <label className="outline flex cursor-pointer items-center gap-3 rounded-[18px] bg-paper-white px-4 py-3 font-aeonik-pro text-sm font-bold">
          <input
            type="checkbox"
            checked={draft.featured}
            onChange={(e) => patch({ featured: e.target.checked })}
            className="h-4 w-4 accent-carbon"
          />
          Показывать в «Лучшее по моему мнению» на главной
        </label>

        {showDesc ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Area
              label="Описание (RU)"
              value={draft.descRu}
              onChange={(v) => patch({ descRu: v })}
            />
            <Area
              label="Описание (EN)"
              value={draft.descEn}
              onChange={(v) => patch({ descEn: v })}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowDesc(true)}
            className={`${labelCls} text-carbon/60 underline-offset-4 transition-colors hover:text-carbon hover:underline`}
          >
            + Добавить описание
          </button>
        )}
      </div>
    </Modal>
  )
}

function MediaGroup({
  label,
  kind,
  files,
  onRemove,
  onMove,
}: {
  label: string
  kind: MediaKind
  files: string[]
  onRemove: (idx: number) => void
  onMove: (idx: number, dir: -1 | 1) => void
}) {
  if (!files.length) return null
  return (
    <div>
      <span className={labelCls}>
        {label} · {files.length}
      </span>
      <div
        className={`mt-2 grid gap-3 ${
          kind === 'audio' ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'
        }`}
      >
        {files.map((f, i) => (
          <div
            key={f + i}
            className="outline admin-pop overflow-hidden rounded-[16px] bg-paper-white"
          >
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
            <div className="flex items-center justify-between gap-1 border-t border-carbon/10 px-2 py-1.5">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onMove(i, -1)}
                  disabled={i === 0}
                  aria-label="Раньше"
                  className="rounded-full px-2 font-bold transition-colors hover:bg-sky-wash disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => onMove(i, 1)}
                  disabled={i === files.length - 1}
                  aria-label="Позже"
                  className="rounded-full px-2 font-bold transition-colors hover:bg-sky-wash disabled:opacity-30"
                >
                  →
                </button>
              </div>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className={`${dangerBtn} !px-3 !py-0.5 !text-xs`}
              >
                Убрать
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
