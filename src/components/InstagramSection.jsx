import { useState } from 'react'

const INSTAGRAM_URL = 'https://www.instagram.com/visalud.osorno/'

const POSTS = [
  {
    id: 1,
    tag: 'Turnos 6h y 12h',
    badge: 'Carrusel',
    postType: 'carousel',
    image: '/fotos visalud/visalud2.webp',
    title: 'Cuidado humanizado y turnos a domicilio en Osorno',
    caption:
      'Cuidar a nuestros adultos mayores requiere vocación, paciencia y conocimiento técnico. En Visalud conectamos directamente a familias con TENS certificadas para medio turno (6h), turno completo (12h) y vigilia nocturna. Trato 100% particular y directo.',
    hashtags: ['#CuidadoAdultoMayor', '#Osorno', '#TENSparticular', '#VisaludOsorno', '#SaludADomicilio'],
    likes: 284,
    comments: 26,
    timeAgo: 'Hace 2 horas',
    location: 'Osorno, Región de Los Lagos',
    userComment: {
      user: 'marcela.perez.o',
      text: 'Excelente servicio, la TENS cuidó a mi mamá con un cariño y profesionalismo admirable ❤️',
    },
  },
  {
    id: 2,
    tag: 'Salud Preventiva',
    badge: 'Foto',
    postType: 'photo',
    image: '/fotos visalud/visalud1.webp',
    title: 'Control clínico y prevención en el propio hogar',
    caption:
      'Control riguroso de presión arterial, glicemia capilar, administración puntual de medicamentos y prevención de escaras. El seguimiento continuo de una TENS asegura la estabilidad de tu ser querido en su espacio de confort.',
    hashtags: ['#ControlSignosVitales', '#AdultoMayor', '#SaludOsorno', '#EnfermeriaDomicilio'],
    likes: 342,
    comments: 31,
    timeAgo: 'Ayer',
    location: 'Atención a Domicilio · Osorno',
    userComment: {
      user: 'carlos_osorno',
      text: 'Muy oportuno el control domiciliario para evitar traslados innecesarios a urgencias.',
    },
  },
  {
    id: 3,
    tag: 'Vigilia 12h',
    badge: 'Reel',
    postType: 'reel',
    image: '/fotos visalud/visalud4.webp',
    title: 'Noches seguras para tu familiar y descanso para ti',
    caption:
      'El desgaste del cuidador familiar es real. Nuestros turnos de vigilia nocturna de 12 horas permiten que la familia duerma con la tranquilidad de que su ser querido está acompañado y resguardado ante cualquier necesidad.',
    hashtags: ['#VigiliaNocturna', '#Turno12Horas', '#DescansoFamiliar', '#OsornoSalud'],
    likes: 419,
    comments: 45,
    timeAgo: 'Hace 3 días',
    location: 'Osorno, Chile · Cuidados Nocturnos',
    userComment: {
      user: 'familia_gonzalez',
      text: 'Pudimos descansar tranquilos sabiendo que mi abuelo estaba en manos de una TENS de confianza.',
    },
  },
  {
    id: 4,
    tag: 'Modelo Directo',
    badge: 'Carrusel',
    postType: 'carousel',
    image: '/fotos visalud/visalud3.jpg',
    title: 'Sin intermediarios: acuerdo particular directo con la TENS',
    caption:
      'En Visalud somos un puente transparente: tú eliges a la profesional, acuerdas los horarios de 6h o 12h y el medio de pago que prefieras (efectivo, transferencia o tarjeta). Sin cobros sorpresa ni trámites de Isapre.',
    hashtags: ['#TratoDirecto', '#TENSindependientes', '#Osorno', '#TransparenciaMedica'],
    likes: 265,
    comments: 19,
    timeAgo: 'Hace 5 días',
    location: 'Centro de Salud y Bienestar · Visalud',
    userComment: {
      user: 'andrea_valenzuela',
      text: 'Me encantó la transparencia. Hablé directo con la TENS por WhatsApp y coordinamos al tiro.',
    },
  },
]

export default function InstagramSection() {
  const [likedPosts, setLikedPosts] = useState({})
  const [savedPosts, setSavedPosts] = useState({})
  const [selectedPost, setSelectedPost] = useState(null)
  const [filterTab, setFilterTab] = useState('all')

  const toggleLike = (e, postId) => {
    e.preventDefault()
    e.stopPropagation()
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }

  const toggleSave = (e, postId) => {
    e.preventDefault()
    e.stopPropagation()
    setSavedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }

  const filteredPosts =
    filterTab === 'all'
      ? POSTS
      : filterTab === 'reels'
        ? POSTS.filter((p) => p.postType === 'reel')
        : POSTS.filter((p) => p.postType === 'carousel' || p.postType === 'photo')

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
            Publicaciones reales, consejos de cuidado del adulto mayor y el trabajo diario de nuestras TENS en Osorno.
          </p>
        </div>

        {/* Tarjeta de Perfil Oficial con estadísticas reales */}
        <div className="insta-profile-card">
          <div className="insta-profile-info">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="insta-avatar-ring"
              title="Ver historias de @visalud.osorno"
            >
              <img
                src="/visalud-logo.png"
                alt="Logo Visalud"
                className="insta-avatar-img"
              />
            </a>
            <div className="insta-profile-text">
              <div className="insta-profile-handle-row">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="insta-profile-handle"
                >
                  @visalud.osorno
                </a>
                <span className="insta-verified-badge" title="Cuenta oficial verificada de Visalud">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </span>
                <span className="insta-badge-role">Salud & Cuidado Mayor</span>
              </div>
              <p className="insta-profile-bio">
                Red de Cuidado del Adulto Mayor y TENS a Domicilio · Osorno, X Región, Chile
              </p>
              <div className="insta-profile-stats">
                <span><strong>148</strong> publicaciones</span>
                <span><strong>2.8k</strong> seguidores</span>
                <span><strong>310</strong> seguidos</span>
              </div>
            </div>
          </div>

          <div className="insta-profile-actions">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-insta-follow"
              aria-label="Seguir a @visalud.osorno en Instagram (se abre en nueva ventana)"
            >
              <span className="btn-insta-icon" aria-hidden="true">
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
        </div>

        {/* Pestañas de tipo de publicación estilo feed de Instagram */}
        <div className="insta-feed-tabs" role="tablist" aria-label="Categorías de publicaciones">
          <button
            type="button"
            className={`insta-feed-tab ${filterTab === 'all' ? 'active' : ''}`}
            onClick={() => setFilterTab('all')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Publicaciones</span>
          </button>

          <button
            type="button"
            className={`insta-feed-tab ${filterTab === 'reels' ? 'active' : ''}`}
            onClick={() => setFilterTab('reels')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>Reels & Videos</span>
          </button>
        </div>

        {/* Cuadrícula de publicaciones de Instagram con fotos reales */}
        <div className="insta-grid">
          {filteredPosts.map((post) => {
            const isLiked = Boolean(likedPosts[post.id])
            const isSaved = Boolean(savedPosts[post.id])
            const currentLikes = post.likes + (isLiked ? 1 : 0)

            return (
              <article
                key={post.id}
                className="insta-post-card"
                onClick={() => setSelectedPost(post)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setSelectedPost(post)
                }}
              >
                {/* 1. Header de la publicación (Cuenta y opciones) */}
                <div className="insta-post-header">
                  <div className="insta-post-author">
                    <div className="insta-post-avatar-mini">
                      <img src="/visalud-logo.png" alt="Visalud" />
                    </div>
                    <div className="insta-post-author-meta">
                      <div className="insta-post-author-name">
                        <span>visalud.osorno</span>
                        <span className="insta-post-verified" aria-label="Verificado">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#008d7e">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        </span>
                      </div>
                      <span className="insta-post-location">{post.location}</span>
                    </div>
                  </div>

                  <span className="insta-post-badge-pill">{post.tag}</span>
                </div>

                {/* 2. Contenedor de la Foto de la publicación con overlay */}
                <div className="insta-post-media-wrap">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="insta-post-image"
                    loading="lazy"
                  />

                  {/* Badge de tipo de medio (carrusel o reel) */}
                  <span className="insta-media-badge" title={post.badge}>
                    {post.postType === 'reel' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <rect x="2" y="2" width="16" height="16" rx="2" />
                        <path d="M22 6v14a2 2 0 0 1-2 2H6" />
                      </svg>
                    )}
                  </span>

                  {/* Overlay en Hover */}
                  <div className="insta-post-hover-overlay">
                    <span className="insta-hover-stat">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      {currentLikes}
                    </span>
                    <span className="insta-hover-stat">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      {post.comments}
                    </span>
                    <span className="insta-hover-cta">Ver publicación →</span>
                  </div>
                </div>

                {/* 3. Barra de acciones de Instagram (Like, Comentario, Compartir, Guardar) */}
                <div className="insta-post-actions-bar">
                  <div className="insta-actions-left">
                    <button
                      type="button"
                      className={`btn-insta-action-icon heart-btn ${isLiked ? 'liked' : ''}`}
                      onClick={(e) => toggleLike(e, post.id)}
                      aria-label={isLiked ? 'Quitar Me gusta' : 'Dar Me gusta'}
                      title={isLiked ? 'Te gusta esta publicación' : 'Dar Me gusta'}
                    >
                      <svg width="21" height="21" viewBox="0 0 24 24" fill={isLiked ? '#e1306c' : 'none'} stroke={isLiked ? '#e1306c' : 'currentColor'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      className="btn-insta-action-icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedPost(post)
                      }}
                      aria-label="Ver comentarios"
                      title="Ver comentarios"
                    >
                      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>

                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-insta-action-icon"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Compartir en Instagram"
                      title="Abrir en Instagram"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </a>
                  </div>

                  <button
                    type="button"
                    className={`btn-insta-action-icon save-btn ${isSaved ? 'saved' : ''}`}
                    onClick={(e) => toggleSave(e, post.id)}
                    aria-label={isSaved ? 'Guardado' : 'Guardar publicación'}
                    title={isSaved ? 'Guardado en tu lista' : 'Guardar publicación'}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? '#111827' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                    </svg>
                  </button>
                </div>

                {/* 4. Cuerpo de la publicación: Likes, Caption y Hashtags */}
                <div className="insta-post-content">
                  <div className="insta-likes-count">
                    <span>Les gusta a <strong>cuidadores_osorno</strong> y <strong>{currentLikes} personas más</strong></span>
                  </div>

                  <p className="insta-post-caption">
                    <strong className="insta-caption-handle">visalud.osorno</strong>{' '}
                    <span>{post.caption}</span>
                  </p>

                  <div className="insta-hashtags-row">
                    {post.hashtags.map((ht, idx) => (
                      <span key={idx} className="insta-ht-link">{ht}</span>
                    ))}
                  </div>

                  <div className="insta-comments-preview">
                    <span className="insta-comments-link">
                      Ver los {post.comments} comentarios en Instagram
                    </span>
                    <span className="insta-post-time">{post.timeAgo}</span>
                  </div>
                </div>

                {/* 5. Pie con enlace directo a Instagram */}
                <div className="insta-post-footer-action">
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="insta-view-external"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>Ver en @visalud.osorno</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M7 17L17 7" />
                      <path d="M7 7h10v10" />
                    </svg>
                  </a>
                </div>
              </article>
            )
          })}
        </div>

        {/* Modal de Detalle de Publicación */}
        {selectedPost && (
          <div
            className="insta-modal-backdrop"
            onClick={() => setSelectedPost(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Detalle de publicación en Instagram"
          >
            <div
              className="insta-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="insta-modal-close"
                onClick={() => setSelectedPost(null)}
                aria-label="Cerrar modal"
              >
                ✕
              </button>

              <div className="insta-modal-media">
                <img src={selectedPost.image} alt={selectedPost.title} />
              </div>

              <div className="insta-modal-details">
                <div className="insta-modal-header">
                  <div className="insta-modal-author">
                    <img src="/visalud-logo.png" alt="Visalud" className="insta-modal-avatar" />
                    <div>
                      <div className="insta-modal-user-row">
                        <strong>visalud.osorno</strong>
                        <span className="insta-verified-badge">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="#008d7e">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        </span>
                      </div>
                      <span className="insta-modal-loc">{selectedPost.location}</span>
                    </div>
                  </div>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-modal-follow"
                  >
                    Seguir
                  </a>
                </div>

                <div className="insta-modal-body">
                  <p className="insta-modal-caption">
                    <strong>visalud.osorno</strong> {selectedPost.caption}
                  </p>

                  <div className="insta-modal-hashtags">
                    {selectedPost.hashtags.map((ht, idx) => (
                      <span key={idx}>{ht}</span>
                    ))}
                  </div>

                  <div className="insta-modal-comment-item">
                    <span className="comment-user"><strong>{selectedPost.userComment.user}</strong></span>
                    <p className="comment-text">{selectedPost.userComment.text}</p>
                  </div>
                </div>

                <div className="insta-modal-footer">
                  <div className="insta-modal-likes-row">
                    <span>{selectedPost.likes} Me gusta</span>
                    <span className="insta-modal-date">{selectedPost.timeAgo}</span>
                  </div>

                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-modal-open-insta"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    <span>Abrir publicación en Instagram</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fila final informativa */}
        <div className="insta-bottom-bar">
          <p className="insta-bottom-text">
            ¿Quieres estar al día con turnos y recomendaciones geriátricas?
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
