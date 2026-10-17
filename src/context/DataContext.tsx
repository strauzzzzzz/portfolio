import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Project, WorkItem } from '../data'

export type FeaturedRef = { project: string; item: number }

type DataContextValue = {
  projects: Project[]
  featured: FeaturedRef[]
  loading: boolean
  error: boolean
  refresh: () => Promise<void>
}

const DataContext = createContext<DataContextValue>({
  projects: [],
  featured: [],
  loading: true,
  error: false,
  refresh: async () => {},
})

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [featured, setFeatured] = useState<FeaturedRef[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    try {
      const [pRes, iRes] = await Promise.all([
        supabase.from('projects').select('*').order('sort_order'),
        supabase.from('items').select('*').order('sort_order'),
      ])
      if (pRes.error || iRes.error) throw pRes.error ?? iRes.error

      const projectRows = pRes.data ?? []
      const itemRows = iRes.data ?? []

      const idToSlug: Record<string, string> = {}
      const itemOrder: Record<string, string[]> = {}

      const list: Project[] = projectRows.map((p) => {
        idToSlug[p.id] = p.slug
        return {
          id: p.id,
          slug: p.slug,
          image: p.image,
          color: p.color,
          en: {
            title: p.title_en,
            category: p.category_en,
            description: p.description_en,
            tags: p.tags_en ?? [],
          },
          ru: {
            title: p.title_ru,
            category: p.category_ru,
            description: p.description_ru,
            tags: p.tags_ru ?? [],
          },
          items: [],
        }
      })

      const slugToProject: Record<string, Project> = {}
      for (const p of list) slugToProject[p.slug] = p

      for (const it of itemRows) {
        const slug = idToSlug[it.project_id]
        const project = slug && slugToProject[slug]
        if (!project) continue

        const w: WorkItem = {
          id: it.id,
          featured: Boolean(it.featured),
          en: it.title_en,
          ru: it.title_ru,
          desc:
            it.desc_en || it.desc_ru
              ? { en: it.desc_en ?? '', ru: it.desc_ru ?? '' }
              : undefined,
          video: it.media?.video ?? undefined,
          audio: it.media?.audio ?? undefined,
          images: it.media?.images ?? undefined,
        }
        project.items.push(w)
        ;(itemOrder[it.project_id] ??= []).push(it.id)
      }

      const featuredRefs: FeaturedRef[] = itemRows
        .filter((it) => it.featured)
        .sort((a, b) => (a.featured_order ?? 0) - (b.featured_order ?? 0))
        .map((it) => {
          const slug = idToSlug[it.project_id]
          if (!slug) return null
          const index = (itemOrder[it.project_id] ?? []).indexOf(it.id)
          return index >= 0 ? { project: slug, item: index } : null
        })
        .filter((x): x is FeaturedRef => x !== null)

      setProjects(list)
      setFeatured(featuredRefs)
      setError(false)
    } catch (e) {
      console.error('Failed to load content', e)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <DataContext.Provider value={{ projects, featured, loading, error, refresh: load }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
