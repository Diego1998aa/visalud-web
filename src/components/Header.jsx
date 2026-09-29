import { useState, useEffect } from 'react'
import ThemeToggle from './ThemeToggle.jsx'

const links = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#profesionales', label: 'Cuidadores TENS' },
  { href: '#cotizador', label: 'Cotizador' },
  { href: '#testimonios', label: 'Testimonios' },
  { href: '#faq', label: 'Preguntas' },
]

export default function Header({
  theme = 'light',
  onToggleTheme,
  currentUser,
  userRole = 'admin',
  onNavigateAdmin,
  onSignOut,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('inicio')

  // Scroll listener: detección de sticky comprimido y sección activa dinámica
  useEffect(() => {
    const sectionIds = [
      'inicio',
      'profesionales',
      'cotizador',
      'testimonios',
      'faq',
      'contacto',
    ]

    let ticking = false

    const updateActiveSection = () => {
      const scrollY = window.scrollY
      setIsScrolled(scrollY > 20)

      // Si está en la zona superior de la página
      if (scrollY < 100) {
        setActiveSection('inicio')
        ticking = false
        return
      }

      // Si llegó al final de la página (contacto)
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      if (scrollY + windowHeight >= docHeight - 80) {
        setActiveSection('contacto')
        ticking = false
        return
      }

      // Punto focal de lectura (160px debajo del viewport superior para compensar el header sticky)
      const focalPoint = scrollY + 160
      let currentSection = 'inicio'

      for (let i = 0; i < sectionIds.length; i++) {
        const id = sectionIds[i]
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          const elementTop = rect.top + scrollY
          if (focalPoint >= elementTop) {
            currentSection = id
          }
        }
      }

      setActiveSection(currentSection)
      ticking = false
    }

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateActiveSection)
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    updateActiveSection()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  // Cerrar menú con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false)
    }
    if (isMenuOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  const handleGoToAdmin = (e) => {
    e.preventDefault()
    if (onNavigateAdmin) {
      onNavigateAdmin()
    } else {
      window.location.hash = '#admin'
    }
  }

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="header-inner">
        {/* Logotipo oficial de Visalud */}
        <a 
          className="logo" 
          href="#inicio" 
          onClick={() => {
            setActiveSection('inicio')
            setIsMenuOpen(false)
          }}
        >
          <img
            src="/visalud-logo.png"
            alt="Visalud - Cuidado de Adulto Mayor en Osorno"
            className="logo-img"
          />
        </a>

        {/* Navegación para pantallas grandes, ordenada y con indicador activo dinámico */}
        <nav className="nav desktop-nav" aria-label="Navegación principal">
          {links.map((link) => {
            const sectionId = link.href.replace('#', '')
            const isActive = activeSection === sectionId
            return (
              <a
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                onClick={() => setActiveSection(sectionId)}
              >
                <span>{link.label}</span>
                {isActive && <span className="nav-link-indicator" />}
              </a>
            )
          })}
        </nav>

        {/* Acciones de Cabecera Organizadas */}
        <div className="header-actions">
          {/* Botón WhatsApp de contacto directo */}
          <a
            href="https://wa.me/56968016334?text=Hola%20Visalud,%20quisiera%20consultar%20sobre%20el%20servicio%20de%20cuidado%20de%20adulto%20mayor%20a%20domicilio%20en%20Osorno"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-header-wa"
            aria-label="Contactar a Visalud por WhatsApp"
            title="Escríbenos directamente (+56 9 6801 6334)"
          >
            <span className="btn-header-wa-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </span>
            <span className="btn-header-wa-pulse" aria-hidden="true" />
            <span className="btn-header-wa-label">WhatsApp</span>
          </a>

          {/* Indicador de Sesión Activa (si existe sesión de admin/soporte) */}
          {currentUser && (
            <div
              className={`header-session-badge role-${userRole}`}
              title={`Sesión abierta: ${currentUser.email} (${userRole === 'support' ? 'Soporte' : 'Administrador'}). Clic para ir al Panel.`}
            >
              <button
                type="button"
                className="btn-header-session"
                onClick={handleGoToAdmin}
              >
                <span className="session-status-pulse" />
                <span className="session-badge-text">
                  {userRole === 'support' ? 'Soporte' : 'Admin'}
                </span>
              </button>

              {onSignOut && (
                <button
                  type="button"
                  className="btn-header-session-logout"
                  onClick={onSignOut}
                  title="Cerrar sesión activa"
                  aria-label="Cerrar sesión"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Botón CTA Destacado */}
          <a href="#contacto" className="btn-header-cta">
            <span>Solicitar profesional</span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>

          {/* Selector de modo día / noche */}
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          {/* Botón hamburguesa para móvil y tablet */}
          <button
            type="button"
            className={`menu-toggle ${isMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-drawer-menu"
          >
            <span className="hamburger-box">
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </span>
          </button>
        </div>
      </div>

      {/* Menú desplegable para móviles ordenado y elegante */}
      <div 
        id="mobile-drawer-menu"
        className={`mobile-drawer ${isMenuOpen ? 'drawer-open' : ''}`}
      >
        <div className="mobile-drawer-inner">
          <nav className="mobile-nav" aria-label="Navegación móvil">
            <span className="mobile-nav-heading">Secciones Principales</span>
            {links.map((link) => {
              const sectionId = link.href.replace('#', '')
              const isActive = activeSection === sectionId
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection(sectionId)
                    setIsMenuOpen(false)
                  }}
                >
                  <span className="mobile-nav-link-content">
                    <span className="mobile-nav-link-label">{link.label}</span>
                  </span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </a>
              )
            })}

            <a
              href="#contacto"
              className={`mobile-nav-link ${activeSection === 'contacto' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('contacto')
                setIsMenuOpen(false)
              }}
            >
              <span className="mobile-nav-link-content">
                <span className="mobile-nav-link-label">Contacto & Solicitud</span>
              </span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </a>
          </nav>

          {/* Tarjeta de Contacto Directo WhatsApp */}
          <div className="mobile-drawer-contact-card">
            <div className="mobile-contact-header">
              <span className="mobile-contact-dot" />
              <span>Coordinación Inmediata</span>
            </div>
            <p className="mobile-contact-desc">
              Resuelve dudas sobre turnos de 6h y 12h con nuestro equipo en Osorno.
            </p>
            <a
              href="https://wa.me/56968016334?text=Hola%20Visalud,%20quisiera%20consultar%20sobre%20el%20servicio%20de%20cuidado%20de%20adulto%20mayor%20a%20domicilio%20en%20Osorno"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-drawer-whatsapp-btn"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="mobile-wa-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </span>
              <span>WhatsApp Directo (+56 9 6801 6334)</span>
            </a>
          </div>

          {/* Sesión activa en móvil */}
          {currentUser && (
            <div className={`mobile-drawer-session role-${userRole}`}>
              <button
                type="button"
                className="mobile-session-btn"
                onClick={(e) => {
                  setIsMenuOpen(false)
                  handleGoToAdmin(e)
                }}
              >
                <span className="session-status-pulse" />
                <span>
                  {userRole === 'support' ? '🛠️ Ir a Panel Soporte' : '🩺 Ir a Panel Admin'}
                </span>
              </button>
              {onSignOut && (
                <button
                  type="button"
                  className="mobile-session-logout"
                  onClick={() => {
                    setIsMenuOpen(false)
                    onSignOut()
                  }}
                  title="Cerrar sesión activa"
                >
                  Cerrar Sesión
                </button>
              )}
            </div>
          )}

          {/* Ajuste de tema y CTA principal */}
          <div className="mobile-drawer-footer">
            <div className="mobile-drawer-theme">
              <span className="drawer-theme-label">
                <span>Modo de visualización:</span>
                <strong>{theme === 'dark' ? 'Oscuro' : 'Claro'}</strong>
              </span>
              <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            </div>

            <a
              href="#contacto"
              className="btn-header-cta mobile-cta"
              onClick={() => setIsMenuOpen(false)}
            >
              <span>Solicitar profesional</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}


