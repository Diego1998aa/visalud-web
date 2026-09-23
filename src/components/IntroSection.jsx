import { useState } from 'react'
import DepthCarousel from './DepthCarousel'

const carouselItems = [
  {
    image: '/fotos visalud/visalud2.webp',
    alt: 'Equipo profesional y técnicos certificados de Visalud Osorno en capacitación',
    position: 'center 20%',
  },
  {
    image: '/fotos visalud/visalud1.webp',
    alt: 'Equipo Visalud en operativos de salud comunitaria y atención en terreno',
    position: 'center 35%',
  },
  {
    image: '/fotos visalud/visalud4.webp',
    alt: 'Cuidado humano, compasión y dedicación geriátrica en Osorno',
    position: 'center center',
  },
  {
    image: '/fotos visalud/visalud3.jpg',
    alt: 'Servicios de enfermería y cuidados domiciliarios Visalud Osorno',
    position: 'center top',
  },
]

export default function IntroSection() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  return (
    <section id="inicio" className="intro-container">
      {/* ================= HERO PRINCIPAL ================= */}
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            <span>Compromiso con tu salud y bienestar</span>
          </div>

          <h1 className="hero-title">
            Bienestar cercano, <span className="text-gradient">atención médica profesional</span>
          </h1>

          <p className="hero-lead">
            En <strong>Visalud</strong> combinamos calidez humana, especialistas de primer nivel y
            tecnología para acompañarte a ti y a tu familia en cada etapa de la vida.
          </p>

          <div className="hero-actions">
            <a href="#contacto" className="btn-hero-primary">
              <span>Solicitar profesional</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a href="#historia" className="btn-hero-secondary">
              <span>Nuestra historia</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </a>
          </div>

          {/* Estadísticas de Confianza */}
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-num">+15</span>
              <span className="stat-label">Especialidades</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-num">+10</span>
              <span className="stat-label">Años de experiencia</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-num">99%</span>
              <span className="stat-label">Pacientes satisfechos</span>
            </div>
          </div>
        </div>

        {/* Escenario Visual / DepthCarousel 3D Interactivo */}
        <div className="hero-visual">
          <div className="hero-depth-wrapper">
            <DepthCarousel
              items={carouselItems}
              cardWidth={440}
              cardHeight={510}
              radius={28}
              tint="rgba(0, 141, 126, 0.06)"
              depth={140}
              spread={65}
              tilt={14}
              tiltDirection="right"
              perspective={1500}
              visibleCards={3}
              falloff={0.12}
              blur={2}
              autoplay={true}
              autoplayDelay={3600}
              loop={true}
              showControls={true}
              showIndicators={true}
            />
          </div>

          {/* Tarjeta flotante de confianza */}
          <div className="hero-floating-card">
            <div className="floating-badge-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <div className="floating-badge-text">
              <div className="floating-stars">★★★★★ <span>4.9/5</span></div>
              <p>Atención médica certificada</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SECCIÓN NUESTRA HISTORIA (DOS COLUMNAS) ================= */}
      <div id="historia" className="story-section">
        <div className="story-two-col-grid">
          {/* Columna Izquierda: Mensaje empático, compromisos y acción para familias */}
          <div className="story-col-left">
            <div className="story-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
              <span>Vocación y Compromiso Familiar</span>
            </div>

            <h2 className="story-heading">
              Cuidamos a quienes cuidaron de ti, con calidez, paciencia y rigor médico
            </h2>

            <p className="story-lead">
              Sabemos lo importante que es encontrar profesionales de absoluta confianza para nuestros
              padres y abuelos. En <strong>Visalud</strong> dejamos atrás la frialdad y las consultas aceleradas
              para brindar una atención cercana, respetuosa y con seguimiento constante para toda la familia.
            </p>

            {/* Lista de compromisos claros para adultos y cuidadores */}
            <div className="story-commitments-list">
              <div className="story-commitment-item">
                <div className="commitment-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                </div>
                <div className="commitment-text">
                  <h3>Paciencia y Escucha Activa</h3>
                  <p>Consultas sin apuros, dedicando el tiempo necesario para comprender y respetar el ritmo de cada adulto mayor.</p>
                </div>
              </div>

              <div className="story-commitment-item">
                <div className="commitment-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </div>
                <div className="commitment-text">
                  <h3>Tranquilidad y Comunicación Familiar</h3>
                  <p>Mantenemos informados a hijos y familiares con explicaciones claras, sin tecnicismos confusos tras cada chequeo.</p>
                </div>
              </div>

              <div className="story-commitment-item">
                <div className="commitment-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                </div>
                <div className="commitment-text">
                  <h3>Profesionales con Vocación Geriátrica</h3>
                  <p>Médicos, enfermeros y cuidadores certificados con amplia experiencia clínica y genuina vocación de servicio.</p>
                </div>
              </div>
            </div>

            <div className="story-actions">
              <a href="#contacto" className="btn-story-primary">
                <span>Solicitar orientación para tu familiar</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta visual, garantía médica y presentación */}
          <div className="story-col-right">
            <div className="story-visual-card">
              <img
                src="/fotos visalud/visalud2.webp"
                alt="Equipo de técnicos en enfermería y profesionales de salud de Visalud Osorno"
                className="story-visual-img"
                style={{ objectPosition: 'center 22%' }}
              />
              <div className="story-visual-gradient" />

              {/* Insignia flotante superior de experiencia */}
              <div className="story-float-badge top-right">
                <div className="badge-pulse-dot"></div>
                <div>
                  <strong>Personal Certificado</strong>
                  <span>Osorno y Alrededores</span>
                </div>
              </div>

              {/* Tarjeta flotante inferior con soporte y botón de video */}
              <div className="story-visual-overlay-info">
                <div className="story-overlay-text">
                  <span className="story-mini-tag">Equipo Visalud Osorno</span>
                  <h4>Personal real y calificado</h4>
                  <p>Técnicos en enfermería capacitados en demencia, curaciones y cuidado geriátrico integral.</p>
                </div>

                <button
                  type="button"
                  className="story-play-pill-btn"
                  onClick={() => setIsVideoModalOpen(true)}
                  aria-label="Ver video de presentación institucional"
                >
                  <span className="story-play-circle">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </span>
                  <span>Ver presentación</span>
                </button>
              </div>
            </div>

            {/* Micro-tarjeta de confianza directa */}
            <div className="story-trust-ribbon">
              <div className="trust-ribbon-item">
                <span className="ribbon-check">✓</span>
                <span>Atención a domicilio o en centro</span>
              </div>
              <div className="trust-ribbon-divider" />
              <div className="trust-ribbon-item">
                <span className="ribbon-check">✓</span>
                <span>Seguimiento continuo a familiares</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de video institucional */}
        {isVideoModalOpen && (
          <div className="video-modal-backdrop" onClick={() => setIsVideoModalOpen(false)}>
            <div className="video-modal-container" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="video-modal-close"
                onClick={() => setIsVideoModalOpen(false)}
                aria-label="Cerrar video"
              >
                ✕
              </button>
              <div className="video-modal-body">
                <div className="video-placeholder-box">
                  <img
                    src="/fotos visalud/visalud2.webp"
                    alt="Presentación institucional del equipo de Visalud Osorno"
                    style={{
                      width: '100%',
                      maxHeight: '300px',
                      objectFit: 'cover',
                      objectPosition: 'center 20%',
                      borderRadius: '18px',
                      marginBottom: '1.25rem',
                      boxShadow: '0 12px 32px rgba(6, 84, 74, 0.16)'
                    }}
                  />
                  <h4>Visalud Osorno · Cuidado Humano y Calificado</h4>
                  <p>Agencia de técnicos en enfermería especializada en el cuidado integral del adulto mayor, acompañamiento familiar, inyecciones y curaciones en Osorno.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
