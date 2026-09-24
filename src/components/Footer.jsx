export default function Footer({ onNavigateAdmin }) {
  const handleAdminClick = (e) => {
    e.preventDefault()
    if (onNavigateAdmin) {
      onNavigateAdmin()
    } else {
      window.location.hash = '#admin'
    }
  }

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <a href="#inicio">
            <img src="/visalud-logo.png" alt="Visalud" className="footer-logo" />
          </a>
          <p className="footer-tagline">
            Compromiso con tu salud, bienestar integral y atención médica profesional para toda la familia.
          </p>
          <a
            href="https://www.instagram.com/visalud.osorno/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-instagram-btn"
            aria-label="Instagram oficial de Visalud (@visalud.osorno)"
          >
            <span className="footer-instagram-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="2" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </span>
            <span className="footer-instagram-text">
              <span className="footer-instagram-label">Síguenos</span>
              <span className="footer-instagram-handle">@visalud.osorno</span>
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="footer-instagram-arrow" aria-hidden="true">
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </a>
        </div>

        <div className="footer-nav">
          <span className="footer-nav-title">Navegación</span>
          <div className="footer-links">
            <a href="#inicio">Inicio</a>
            <a href="#servicios">Servicios</a>
            <a href="#historia">Nuestra Historia</a>
            <a href="#profesionales">Profesionales</a>
            <a href="#comunidad">Comunidad</a>
            <a href="#contacto">Contacto</a>
          </div>
        </div>

        <div className="footer-contact-summary">
          <span className="footer-nav-title">Atención</span>
          <p>Lunes a viernes: 8:00 a 18:00</p>
          <a href="#contacto" className="footer-cta-link">Solicitar profesional →</a>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <p>© {new Date().getFullYear()} Visalud. Todos los derechos reservados.</p>
          
          <div className="footer-bottom-right">
            <button
              type="button"
              onClick={handleAdminClick}
              className="footer-admin-pill-btn"
              title="Acceso al Panel de Control de Profesionales"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Panel Admin</span>
            </button>
            <p className="footer-credits">Centro de Salud y Bienestar</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
