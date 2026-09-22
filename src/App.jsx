import { useState, useEffect } from 'react'
import Header from './components/Header.jsx'
import IntroSection from './components/IntroSection.jsx'
import ServicesAndProfessionals from './components/ServicesAndProfessionals.jsx'
import InstagramSection from './components/InstagramSection.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import './App.css'

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('visalud-theme')
      if (saved === 'dark' || saved === 'light') return saved
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark'
      }
    }
    return 'light'
  })

  // Sincronizar atributo data-theme en <html> y persistir en localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('visalud-theme', theme)
    } catch (e) {
      // Ignorar errores en modo incógnito estricto
    }
  }, [theme])

  // Escuchar cambios en la preferencia del sistema operativo si el usuario no ha forzado una
  useEffect(() => {
    if (!window.matchMedia) return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      const saved = localStorage.getItem('visalud-theme')
      if (!saved) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <div className={`app theme-${theme}`}>
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <IntroSection />
        <ServicesAndProfessionals />
        <InstagramSection />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

