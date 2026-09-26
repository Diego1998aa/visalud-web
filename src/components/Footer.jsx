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
          <div className="footer-social-row">
            <a
              href="https://wa.me/56968016334?text=Hola%20Visalud,%20me%20comunico%20desde%20la%20p%C3%A1gina%20web%20para%20consultar%20sobre%20cuidado%20de%20adulto%20mayor%20en%20Osorno"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-whatsapp-btn"
              aria-label="WhatsApp oficial de Coordinación Visalud"
            >
              <span className="footer-whatsapp-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </span>
              <span className="footer-whatsapp-text">
                <span className="footer-whatsapp-label">WhatsApp Coordinación</span>
                <span className="footer-whatsapp-handle">+56 9 6801 6334</span>
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="footer-whatsapp-arrow" aria-hidden="true">
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </a>

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
          <span className="footer-nav-title">Contacto Directo</span>
          <p>
            <a href="tel:+56968016334" style={{ color: 'inherit', textDecoration: 'none' }}>📞 +56 9 6801 6334</a>
          </p>
          <p>
            <a href="mailto:visaludosorno@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>✉️ visaludosorno@gmail.com</a>
          </p>
          <p>Turnos 6h y 12h • Osorno</p>
          <a href="#contacto" className="footer-cta-link">Solicitar TENS →</a>
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
