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

          <a
            href="https://wa.me/56968016334?text=Hola%20Visalud,%20quisiera%20consultar%20sobre%20el%20servicio%20de%20cuidado%20de%20adulto%20mayor%20a%20domicilio%20en%20Osorno"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-header-whatsapp"
            aria-label="Contactar a Visalud por WhatsApp"
            title="Escríbenos por WhatsApp (+56 9 6801 6334)"
          >
            <span className="btn-header-wa-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </span>
            <span className="btn-header-wa-label">WhatsApp</span>
          </a>

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

          <a
            href="https://wa.me/56968016334?text=Hola%20Visalud,%20quisiera%20consultar%20sobre%20el%20servicio%20de%20cuidado%20de%20adulto%20mayor%20a%20domicilio%20en%20Osorno"
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-drawer-whatsapp-btn"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="mobile-wa-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </span>
            <span>WhatsApp Coordinación (+56 9 6801 6334)</span>
          </a>

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

