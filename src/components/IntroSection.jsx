import { useEffect, useState } from 'react'

const slides = [
  {
    src: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
    alt: 'Consulta médica cálida y personalizada en Visalud',
    caption: 'Consulta médica con trato humano y dedicado',
  },
  {
    src: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    alt: 'Instalaciones modernas y confortables de Visalud',
    caption: 'Espacios modernos pensados para tu tranquilidad',
  },
  {
    src: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    alt: 'Equipo multidisciplinario de salud trabajando en conjunto',
    caption: 'Especialistas coordinados para tu cuidado',
  },
]

const pillars = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
      </svg>
    ),
    title: 'Trato Humano y Cercano',
    description: 'Atención personalizada y empática donde cada paciente es escuchado sin prisas ni formalismos fríos.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
        <path d="m8.5 8.5 7 7"/>
      </svg>
    ),
    title: 'Excelencia y Especialidades',
    description: 'Médicos y profesionales de la salud certificados, con amplia experiencia clínica y actualización continua.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
    title: 'Prevención Activa',
    description: 'Chequeos y programas preventivos para cuidar tu bienestar y el de tu familia antes de cualquier complicación.',
  },
]

export default function IntroSection() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  const slide = slides[index]

  const go = (nextIndex) => {
    setIndex((nextIndex + slides.length) % slides.length)
  }

  useEffect(() => {
    if (paused) return undefined
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [paused])

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

        {/* Escenario Visual / Carrusel Interactivo */}
        <div
          className="hero-visual"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="hero-stage">
            <img key={slide.src} className="hero-photo" src={slide.src} alt={slide.alt} />
            <div className="hero-overlay">
              <p>{slide.caption}</p>
              <span className="hero-counter">
                {index + 1} / {slides.length}
              </span>
            </div>

            <button
              className="hero-nav-btn prev"
              type="button"
              aria-label="Imagen anterior"
              onClick={() => go(index - 1)}
            >
              ‹
            </button>
            <button
              className="hero-nav-btn next"
              type="button"
              aria-label="Imagen siguiente"
              onClick={() => go(index + 1)}
            >
              ›
            </button>
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

          {/* Indicadores de diapositiva */}
          <div className="hero-dots">
            {slides.map((item, i) => (
              <button
                key={item.src}
                className={`hero-dot ${i === index ? 'active' : ''}`}
                type="button"
                aria-label={item.caption}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ================= SECCIÓN NUESTRA HISTORIA ================= */}
      <div id="historia" className="story-section">
        <div className="story-header">
          <p className="story-eyebrow">NUESTRA HISTORIA Y VOCACIÓN</p>
          <h2 className="story-heading">
            Una vocación nacida para cuidar, escuchar y acompañar
          </h2>
          <p className="story-lead">
            Visalud nació con la convicción de que la medicina debe ser tan humana como rigurosa.
            Sustituimos las consultas aceleradas por un trato cálido y un seguimiento cercano,
            brindando soluciones integrales de salud a tu alcance.
          </p>
        </div>

        {/* Pilares de Valor de Visalud */}
        <div className="story-pillars">
          {pillars.map((pillar) => (
            <div className="pillar-card" key={pillar.title}>
              <div className="pillar-icon">{pillar.icon}</div>
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
            </div>
          ))}
        </div>

        {/* Tarjeta Multimedia / Presentación Institucional */}
        <div className="story-media-wrapper">
          <div className="story-media-card">
            <img
              src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1400&q=80"
              alt="Instalaciones y equipo médico Visalud"
              className="story-media-bg"
            />
            <div className="story-media-overlay">
              <div className="story-media-content">
                <span className="story-tag">Presentación Institucional</span>
                <h3>Conoce más sobre cómo cuidamos a nuestros pacientes</h3>
                <p>Un recorrido por nuestro centro médico, filosofía de atención y equipo humano.</p>
              </div>

              <button
                type="button"
                className="play-pulse-btn"
                onClick={() => setIsVideoModalOpen(true)}
                aria-label="Reproducir video de presentación"
              >
                <span className="play-ripple"></span>
                <span className="play-icon-triangle"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal simple de video si se activa */}
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
                  <div className="video-placeholder-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </div>
                  <h4>Video institucional de Visalud</h4>
                  <p>Aquí puedes conectar tu archivo de video (`/video-visalud.mp4`) o enlace de YouTube/Vimeo.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
