import { useState, useEffect } from 'react'
import ThemeToggle from './ThemeToggle.jsx'

const links = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#profesionales', label: 'Profesionales' },
  { href: '#comunidad', label: 'Comunidad' },
  { href: '#contacto', label: 'Contacto' },
]

export default function Header({ theme = 'light', onToggleTheme }) {
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

        {/* Botón de acción destacado (CTA) y selector de tema */}
        <div className="header-actions">
          {/* Selector de modo día / noche */}
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

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

