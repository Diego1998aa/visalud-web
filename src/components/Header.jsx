import { useState, useEffect } from 'react'
import ThemeToggle from './ThemeToggle.jsx'

const links = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#profesionales', label: 'Profesionales' },
  { href: '#comunidad', label: 'Comunidad' },
  { href: '#contacto', label: 'Contacto' },
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
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
        <a className="logo" href="#inicio" onClick={() => setIsMenuOpen(false)}>
          <img
            src="/visalud-logo.png"
            alt="Visalud - Centro de Salud y Bienestar"
            className="logo-img"
          />
        </a>

        {/* Navegación para pantallas medianas y grandes */}
        <nav className="nav desktop-nav" aria-label="Principal">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        {/* Botón de acción destacado (CTA), indicador de sesión y selector de tema */}
        <div className="header-actions">
          {/* Indicador de Sesión Activa (Admin o Soporte) */}
          {currentUser && (
            <div
              className={`header-session-badge role-${userRole}`}
              title={`Sesión abierta: ${currentUser.email} (${userRole === 'support' ? 'Soporte Técnico' : 'Administrador Clínico'}). Haz clic para ir al Panel.`}
            >
              <button
                type="button"
                className="btn-header-session"
                onClick={handleGoToAdmin}
              >
                <span className="session-status-pulse" />
                <span className="session-badge-icon">
                  {userRole === 'support' ? '🛠️' : '🩺'}
                </span>
                <span className="session-badge-text">
                  {userRole === 'support' ? 'Soporte Activo' : 'Admin Activo'}
                </span>
              </button>

              {onSignOut && (
                <button
                  type="button"
                  className="btn-header-session-logout"
                  onClick={onSignOut}
                  title="Cerrar sesión activa del panel"
                  aria-label="Cerrar sesión"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              )}
            </div>
          )}

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

          {/* Selector de modo día / noche en la esquina superior derecha */}
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          {/* Botón hamburguesa para móvil */}
          <button
            type="button"
            className={`menu-toggle ${isMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
          >
            <span className="hamburger-box">
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </span>
          </button>
        </div>
      </div>

      {/* Menú desplegable para móviles */}
      <div className={`mobile-drawer ${isMenuOpen ? 'drawer-open' : ''}`}>
        <nav className="mobile-nav" aria-label="Menú móvil">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}

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

          {/* Alternador de tema en menú móvil */}
          <div className="mobile-drawer-theme">
            <span className="drawer-theme-label">
              <span>Tema actual: <strong>{theme === 'dark' ? 'Noche' : 'Día'}</strong></span>
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
        </nav>
      </div>
    </header>
  )
}

