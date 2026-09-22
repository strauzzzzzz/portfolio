import { useRef } from 'react'
import { useScrollEngine } from '../hooks/useScrollEngine'
import { useData } from '../context/DataContext'
import Hero from '../components/Hero'
import Projects from '../components/Projects'
import About from '../components/About'
import Skills from '../components/Skills'
import Contact from '../components/Contact'

export default function Home() {
  const progressRef = useRef(0)
  const { loading } = useData()
  useScrollEngine(progressRef, !loading)

  return (
    <>
      <Hero scrollRef={progressRef} />
      <Projects />
      <About />
      <Skills />
      <Contact />
    </>
  )
}
