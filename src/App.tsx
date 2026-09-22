import { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Nav from './components/Nav'
import Home from './pages/Home'
import ProjectDetail from './pages/ProjectDetail'
import Admin from './pages/Admin'
import Preloader from './components/Preloader'
import { useData } from './context/DataContext'
import { getLenis } from './lib/lenis'

function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const t = window.setTimeout(() => {
        const el = document.getElementById(hash.slice(1))
        if (!el) return
        const lenis = getLenis()
        if (lenis) {
          lenis.scrollTo(el, { offset: -80, duration: 1.2 })
        } else {
          window.scrollTo({
            top: el.getBoundingClientRect().top + window.scrollY - 80,
          })
        }
      }, 80)
      return () => window.clearTimeout(t)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

function AppRoutes() {
  const location = useLocation()

  return (
    <div key={location.pathname} className="page-enter">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/work/:slug" element={<ProjectDetail />} />
        <Route path="/admin" element={<Admin />} />
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
