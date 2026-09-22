const INSTAGRAM_URL = 'https://www.instagram.com/visalud.osorno/'

const POSTS = [
  {
    id: 1,
    tag: 'Prevención & Cuidados',
    title: 'Hábitos diarios para fortalecer tu salud y bienestar',
    excerpt: 'Pequeñas acciones cotidianas marcan una gran diferencia en la salud de toda la familia. Descubre nuestros consejos preventivos.',
    hashtags: ['#SaludPreventiva', '#Osorno', '#Visalud'],
    likes: '184',
    comments: '16',
    gradientClass: 'insta-card-gradient-1',
    iconType: 'shield',
  },
  {
    id: 2,
    tag: 'Equipo Médico',
    title: 'Compromiso profesional y atención cercana en Osorno',
    excerpt: 'Nuestro equipo multidisciplinario combina calidez humana y excelencia técnica para cuidar de ti en cada etapa.',
    hashtags: ['#Especialistas', '#MedicinaIntegral', '#SaludSur'],
    likes: '245',
    comments: '28',
    gradientClass: 'insta-card-gradient-2',
    iconType: 'users',
  },
  {
    id: 3,
    tag: 'Chequeos Preventivos',
    title: '¿Cuándo fue tu último control médico integral?',
    excerpt: 'Detectar a tiempo es la clave de una vida plena y activa. Conoce las evaluaciones preventivas disponibles en Visalud.',
    hashtags: ['#ChequeoPreventivo', '#Bienestar', '#VidaSana'],
    likes: '210',
    comments: '19',
    gradientClass: 'insta-card-gradient-3',
    iconType: 'heartbeat',
  },
  {
    id: 4,
    tag: 'Comunidad & Consultas',
    title: 'Estamos a un mensaje de distancia para orientarte',
    excerpt: '¿Tienes dudas sobre horas médicas, exámenes o coberturas? Escríbenos por mensaje directo o contáctanos por la web.',
    hashtags: ['#VisaludOsorno', '#AtenciónCercana', '#SaludParaTodos'],
    likes: '198',
    comments: '24',
    gradientClass: 'insta-card-gradient-4',
    iconType: 'message',
  },
]

function CardIcon({ type }) {
  if (type === 'shield') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    )
  }
  if (type === 'users') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }
  if (type === 'heartbeat') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <polyline points="3.5 12 7 12 9 9 12 15 14 11 16.5 13 20.5 13" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export default function InstagramSection() {
  return (
    <section className="insta-section" id="comunidad" aria-label="Comunidad en Instagram">
      <div className="insta-container">
        {/* Encabezado con badge degradado */}
        <div className="insta-header">
          <div className="insta-badge-pill">
            <span className="insta-badge-icon" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </span>
            <span>Comunidad & Novedades</span>
          </div>
          <h2 className="insta-title">Conéctate con Visalud en Instagram</h2>
          <p className="insta-subtitle">
            Consejos de salud preventiva, novedades de nuestros profesionales y el día a día
            de nuestro centro médico en Osorno.
          </p>
        </div>

        {/* Tarjeta de Perfil Oficial */}
        <div className="insta-profile-card">
          <div className="insta-profile-info">
            <div className="insta-avatar-ring">
              <img
                src="/visalud-logo.png"
                alt="Logo Visalud"
                className="insta-avatar-img"
              />
            </div>
            <div className="insta-profile-text">
              <div className="insta-profile-handle-row">
                <span className="insta-profile-handle">@visalud.osorno</span>
                <span className="insta-verified-badge" title="Cuenta oficial de Visalud">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </span>
              </div>
              <p className="insta-profile-bio">
                Centro de Salud y Bienestar · Osorno, X Región, Chile
              </p>
              <span className="insta-status-pill">
                <span className="insta-pulse-circle"></span>
                Publicaciones y orientación constante
              </span>
            </div>
          </div>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-insta-follow"
            aria-label="Seguir a @visalud.osorno en Instagram (se abre en nueva ventana)"
          >
            <span className="btn-insta-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </span>
            <span>Seguir en Instagram</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="btn-insta-arrow">
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </a>
        </div>

        {/* Cuadrícula interactiva de publicaciones */}
        <div className="insta-grid">
          {POSTS.map((post) => (
            <a
              key={post.id}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`insta-card ${post.gradientClass}`}
            >
              {/* Header de la tarjeta */}
              <div className="insta-card-top">
                <span className="insta-card-tag">{post.tag}</span>
                <span className="insta-card-top-icon">
                  <CardIcon type={post.iconType} />
                </span>
              </div>

              {/* Contenido principal */}
              <div className="insta-card-body">
                <h3 className="insta-card-title">{post.title}</h3>
                <p className="insta-card-excerpt">{post.excerpt}</p>
                <div className="insta-card-tags">
                  {post.hashtags.map((ht, idx) => (
                    <span key={idx} className="insta-ht">{ht}</span>
                  ))}
                </div>
              </div>

              {/* Pie de tarjeta con interacción simulada de Instagram */}
              <div className="insta-card-footer">
                <div className="insta-metrics">
                  <span className="insta-metric" title="Me gusta">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                    <span>{post.likes}</span>
                  </span>
                  <span className="insta-metric" title="Comentarios">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>{post.comments}</span>
                  </span>
                </div>
                <div className="insta-card-action">
                  <span>Ver en Instagram</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Overlay sutil de brillo en hover */}
              <div className="insta-card-glow" aria-hidden="true"></div>
            </a>
          ))}
        </div>

        {/* Fila final informativa */}
        <div className="insta-bottom-bar">
          <p className="insta-bottom-text">
            ¿Quieres estar al día con tips médicos y horarios de atención?
            {' '}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="insta-bottom-link"
            >
              Síguenos en @visalud.osorno →
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
