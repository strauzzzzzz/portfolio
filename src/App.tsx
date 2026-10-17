import { Suspense, lazy, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Nav from './components/Nav'
import Home from './pages/Home'
import ProjectDetail from './pages/ProjectDetail'
import Preloader from './components/Preloader'

const Admin = lazy(() => import('./pages/Admin'))
import { useData } from './context/DataContext'
import { scrollToSection } from './lib/scroll'
import { setIntroDone } from './lib/intro'

function ScrollManager() {
  const location = useLocation()
  const { pathname, key } = location
  const section = (location.state as { section?: string } | null)?.section

  useEffect(() => {
    if (!section) {
      window.scrollTo(0, 0)
      return
    }
    // Arrived from another page: wait for Home to mount and its entry animation to settle.
    const t = window.setTimeout(() => {
      scrollToSection(section)
      window.history.replaceState({ ...window.history.state, usr: null }, '')
    }, 600)
    return () => window.clearTimeout(t)
  }, [pathname, key, section])

  return null
}

function AppRoutes() {
  const location = useLocation()

  return (
    <div key={location.pathname} className="page-enter">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/work/:slug" element={<ProjectDetail />} />
        <Route
          path="/admin"
          element={
            <Suspense fallback={null}>
              <Admin />
            </Suspense>
          }
        />
      </Routes>
    </div>
  )
}

export default function App() {
  const { loading } = useData()
  const [minElapsed, setMinElapsed] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setMinElapsed(true), 1300)
    return () => window.clearTimeout(t)
  }, [])

  const hiding = !loading && minElapsed

  useEffect(() => {
    if (hiding) setIntroDone()
  }, [hiding])

  useEffect(() => {
    if (hiding) {
      const t = window.setTimeout(() => setGone(true), 600)
      return () => window.clearTimeout(t)
    }
  }, [hiding])

  return (
    <>
      {!gone && <Preloader fading={hiding} />}
      <ScrollManager />
      <Nav />
      <main>
        <AppRoutes />
      </main>
    </>
  )
}
