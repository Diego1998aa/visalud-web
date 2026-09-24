import { useState, useEffect } from 'react'
import Header from './components/Header.jsx'
import IntroSection from './components/IntroSection.jsx'
import ServicesAndProfessionals from './components/ServicesAndProfessionals.jsx'
import InstagramSection from './components/InstagramSection.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import Admin from './components/Admin.jsx'
import AdminLogin from './components/AdminLogin.jsx'
import { authService } from './services/authService.js'
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

  // Vista actual: 'site' | 'admin'
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
        return 'admin'
      }
    }
    return 'site'
  })

  // Estado de autenticación para el panel
  const [sessionUser, setSessionUser] = useState(null)
  const [sessionRole, setSessionRole] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    // Comprobar si hay sesión activa al inicio
    const checkSession = async () => {
      try {
        const session = await authService.getSession()
        if (session?.user) {
          setSessionUser(session.user)
          setSessionRole(session.role)
        } else {
          setSessionUser(null)
          setSessionRole(null)
        }
      } catch (e) {
        console.error('Error verificando sesión:', e)
      } finally {
        setAuthLoading(false)
      }
    }

    checkSession()

    // Suscribir a cambios de autenticación en Supabase
    const unsubscribe = authService.onAuthStateChange(({ user, role }) => {
      setSessionUser(user)
      setSessionRole(role)
    })

    return () => unsubscribe()
  }, [])

  // Sincronizar ruta / hash con la vista
  useEffect(() => {
    const handleNavigation = () => {
      if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
        setCurrentView('admin')
        window.scrollTo({ top: 0, behavior: 'instant' })
      } else {
        setCurrentView('site')
      }
    }

    window.addEventListener('hashchange', handleNavigation)
    window.addEventListener('popstate', handleNavigation)
    return () => {
      window.removeEventListener('hashchange', handleNavigation)
      window.removeEventListener('popstate', handleNavigation)
    }
  }, [])

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

  const navigateToAdmin = () => {
    window.location.hash = '#admin'
    setCurrentView('admin')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const navigateToSite = () => {
    if (window.location.hash === '#admin') {
      history.pushState(null, '', window.location.pathname)
    }
    setCurrentView('site')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  // Manejador de cierre de sesión
  const handleSignOut = async () => {
    await authService.signOut()
    setSessionUser(null)
    setSessionRole(null)
  }

  if (currentView === 'admin') {
    if (authLoading) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page, #f6fbfa)' }}>
          <div className="admin-spinner" />
        </div>
      )
    }

    if (!sessionUser) {
      return (
        <AdminLogin
          onLoginSuccess={(user, role) => {
            setSessionUser(user)
            setSessionRole(role)
          }}
          onBackToSite={navigateToSite}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )
    }

    return (
      <Admin
        currentUser={sessionUser}
        userRole={sessionRole}
        onSignOut={handleSignOut}
        onBackToSite={navigateToSite}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    )
  }

  return (
    <div className={`app theme-${theme}`}>
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        currentUser={sessionUser}
        userRole={sessionRole}
        onNavigateAdmin={navigateToAdmin}
        onSignOut={handleSignOut}
      />
      <main>
        <IntroSection />
        <ServicesAndProfessionals />
        <InstagramSection />
        <Contact />
      </main>
      <Footer onNavigateAdmin={navigateToAdmin} />
    </div>
  )
}
