import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Project } from '../data'
import { errMsg, mediaUrl, slugify, uploadMedia } from './helpers'
import { Area, Field, Modal, dangerBtn, ghostBtn, labelCls, solidBtn } from './ui'

const COLORS = ['#4da2ff', '#55db9c', '#e9ccff', '#fb4903', '#ffd731', '#5c4ade', '#cccccc']

type Form = {
  slug: string
  color: string
  image: string
  titleRu: string
  titleEn: string
  catRu: string
  catEn: string
  descRu: string
  descEn: string
  tagsRu: string
  tagsEn: string
}

function toForm(p: Project | null): Form {
  return {
    slug: p?.slug ?? '',
    color: p?.color ?? '#4da2ff',
    image: p?.image ?? '',
    titleRu: p?.ru.title ?? '',
    titleEn: p?.en.title ?? '',
    catRu: p?.ru.category ?? '',
    catEn: p?.en.category ?? '',
    descRu: p?.ru.description ?? '',
    descEn: p?.en.description ?? '',
    tagsRu: p?.ru.tags.join(', ') ?? '',
    tagsEn: p?.en.tags.join(', ') ?? '',
  }
}

const splitTags = (s: string) =>
  s
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

export default function ProjectSettings({
  project,
  projects,
  onClose,
  onSaved,
  onDeleted,
  notify,
}: {
  project: Project | null
  projects: Project[]
  onClose: () => void
  onSaved: (slug: string) => Promise<void> | void
  onDeleted: () => Promise<void> | void
  notify: (kind: 'ok' | 'error', text: string) => void
}) {
  const [form, setForm] = useState<Form>(() => toForm(project))
  const [baseline, setBaseline] = useState(() => JSON.stringify(toForm(project)))
  const [slugTouched, setSlugTouched] = useState(Boolean(project))
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const dirty = JSON.stringify(form) !== baseline

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function setTitleEn(v: string) {
    setForm((f) => ({
      ...f,
      titleEn: v,
      slug: slugTouched ? f.slug : slugify(v),
    }))
  }

  async function uploadCover(file: File | undefined) {
    if (!file) return
    setUploading(true)
    try {
      set('image', await uploadMedia(file))
    } catch (e) {
      notify('error', 'Ошибка загрузки: ' + errMsg(e))
    } finally {
      setUploading(false)
    }
  }

  async function save() {
    const slug = slugify(form.slug)
    if (!slug) return notify('error', 'Заполни slug (латиницей) — это адрес проекта')
    if (!form.titleRu.trim() && !form.titleEn.trim()) {
      return notify('error', 'Впиши название проекта')
    }
    if (!project && projects.some((p) => p.slug === slug)) {
      return notify('error', 'Проект с таким slug уже есть')
    }
    if (uploading) return notify('error', 'Дождись окончания загрузки')

    setSaving(true)
    try {
      const ru = form.titleRu.trim()
      const en = form.titleEn.trim()
      const row = {
        slug,
        color: form.color,
        image: form.image || null,
        title_ru: ru || en,
        title_en: en || ru,
        category_ru: form.catRu.trim() || form.catEn.trim(),
        category_en: form.catEn.trim() || form.catRu.trim(),
        description_ru: form.descRu.trim() || form.descEn.trim(),
        description_en: form.descEn.trim() || form.descRu.trim(),
        tags_ru: splitTags(form.tagsRu),
        tags_en: splitTags(form.tagsEn),
      }

      if (project) {
        const { error } = await supabase.from('projects').update(row).eq('id', project.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('projects')
          .insert({ ...row, sort_order: projects.length })
        if (error) throw error
      }

      await onSaved(slug)
      setBaseline(JSON.stringify(form))
      notify('ok', project ? 'Проект сохранён' : 'Проект создан')
      onClose()
    } catch (e) {
      notify('error', 'Не удалось сохранить: ' + errMsg(e))
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!project?.id) return
    setSaving(true)
    try {
      const { error: itemsErr } = await supabase
        .from('items')
        .delete()
        .eq('project_id', project.id)
      if (itemsErr) throw itemsErr
      const { error } = await supabase.from('projects').delete().eq('id', project.id)
      if (error) throw error
      await onDeleted()
      notify('ok', 'Проект удалён')
      onClose()
    } catch (e) {
      notify('error', 'Не удалось удалить: ' + errMsg(e))
      setSaving(false)
    }
  }

  function requestClose() {
    if (dirty && !window.confirm('Есть несохранённые изменения. Закрыть без сохранения?')) {
      return
    }
    onClose()
  }

  return (
    <Modal
      title={project ? 'Настройки проекта' : 'Новый проект'}
      onClose={requestClose}
      footer={
        <>
          {project ? (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={remove}
                  disabled={saving}
                  className={`${dangerBtn} !bg-ember !text-paper-white`}
                >
                  Удалить вместе с работами
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className={ghostBtn}>
                  Нет
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className={dangerBtn}>
                Удалить проект
              </button>
            )
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={requestClose} className={ghostBtn}>
              Отмена
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving || uploading}
              className={solidBtn}
            >
              {saving ? 'Сохраняю…' : project ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Название (RU)"
            value={form.titleRu}
            onChange={(v) => set('titleRu', v)}
            autoFocus={!project}
          />
          <Field label="Название (EN)" value={form.titleEn} onChange={setTitleEn} />
          <Field
            label="Категория (RU)"
            value={form.catRu}
            onChange={(v) => set('catRu', v)}
          />
          <Field
            label="Категория (EN)"
            value={form.catEn}
            onChange={(v) => set('catEn', v)}
          />
        </div>

        <Field
          label="Адрес (slug, латиницей)"
          value={form.slug}
          disabled={Boolean(project)}
          onChange={(v) => {
            setSlugTouched(true)
            set('slug', v)
          }}
          hint={
            project
              ? 'Адрес существующего проекта не меняется, чтобы не сломать ссылки'
              : `Будет доступно по /work/${slugify(form.slug) || '…'}`
          }
        />

        <div>
          <span className={labelCls}>Цвет карточки</span>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set('color', c)}
                aria-label={c}
                aria-pressed={form.color.toLowerCase() === c}
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

        <div>
          <span className={labelCls}>Стикер на карточке</span>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <div
              className="outline flex h-20 w-20 items-center justify-center overflow-hidden rounded-[18px]"
              style={{ background: form.color }}
            >
              {form.image ? (
                <img src={mediaUrl(form.image)} alt="" className="h-full w-full object-contain" />
              ) : (
                <span className="font-aeonik-pro text-xs font-bold text-carbon/60">нет</span>
              )}
            </div>
            <label className={`${ghostBtn} cursor-pointer`}>
              {uploading ? 'Загружаю…' : form.image ? 'Заменить' : 'Загрузить'}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  void uploadCover(e.target.files?.[0])
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
          <p className="mt-1 font-aeonik-pro text-xs text-carbon/60">
            Лучше PNG с прозрачным фоном.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Area label="Описание (RU)" value={form.descRu} onChange={(v) => set('descRu', v)} />
          <Area label="Описание (EN)" value={form.descEn} onChange={(v) => set('descEn', v)} />
          <Field
            label="Теги (RU, через запятую)"
            value={form.tagsRu}
            onChange={(v) => set('tagsRu', v)}
          />
          <Field
            label="Теги (EN, через запятую)"
            value={form.tagsEn}
            onChange={(v) => set('tagsEn', v)}
          />
        </div>
      </div>
    </Modal>
  )
}
