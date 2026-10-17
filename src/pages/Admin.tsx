import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import Dashboard from '../admin/Dashboard'
import Login from '../admin/Login'

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
        if (active) setSession(data.session)
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
