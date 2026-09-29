import { useState, useEffect, useRef, useCallback } from 'react'

const heroSlides = [
  {
    image: '/fotos visalud/visalud2.webp',
    alt: 'Equipo profesional y técnicos certificados de Visalud Osorno en capacitación',
    tag: 'Personal Certificado TENS',
    title: 'Profesionales calificados con registro SIS',
    position: 'center 22%',
  },
  {
    image: '/fotos visalud/visalud1.webp',
    alt: 'Equipo Visalud en operativos de salud comunitaria y atención en terreno',
    tag: 'Operativos en Terreno Osorno',
    title: 'Compromiso directo con la comunidad',
    position: 'center 35%',
  },
  {
    image: '/fotos visalud/visalud4.webp',
    alt: 'Cuidado humano, compasión y dedicación geriátrica en Osorno',
    tag: 'Vocación & Cuidado Humano',
    title: 'Acompañamiento cálido y respetuoso',
    position: 'center center',
  },
  {
    image: '/fotos visalud/visalud3.jpg',
    alt: 'Servicios de enfermería y cuidados domiciliarios Visalud Osorno',
    tag: 'Atención Domiciliaria Flexible',
    title: 'Turnos de 6 y 12 horas en el hogar',
    position: 'center 20%',
  },
]

export default function IntroSection() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isCardVideoPlaying, setIsCardVideoPlaying] = useState(false)
  const [isCardVideoMuted, setIsCardVideoMuted] = useState(true)
  const [videoProgress, setVideoProgress] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [videoCurrentTime, setVideoCurrentTime] = useState(0)
  const [isVideoBuffering, setIsVideoBuffering] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [unmuteNotice, setUnmuteNotice] = useState(false)

  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const cardRef = useRef(null)
  const cardVideoRef = useRef(null)
  const modalVideoRef = useRef(null)
  const playPromiseRef = useRef(null)
  const controlsTimeoutRef = useRef(null)

  // Pre-cargar imágenes para transiciones instantáneas y fluidas
  useEffect(() => {
    heroSlides.forEach((slide) => {
      const img = new Image()
      img.src = slide.image
    })
  }, [])

  // Sincronizar estado muted directamente con el elemento DOM
  useEffect(() => {
    if (cardVideoRef.current) {
      cardVideoRef.current.muted = isCardVideoMuted
    }
  }, [isCardVideoMuted])

  // Limpiar temporizadores al desmontar
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    }
  }, [])

  // Autoplay para el fondo inmersivo de fotos sin marcos (5.5s)
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [isPaused, activeSlide])

  const handlePrev = useCallback(() => {
    setActiveSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))
  }, [])

  const handleNext = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % heroSlides.length)
  }, [])

  // Soporte de gestos táctiles (Swipe) para smartphones y tablets
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext()
      } else {
        handlePrev()
      }
    }
  }

  // Soporte de navegación por teclado cuando el foco está en el Hero
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      handlePrev()
    } else if (e.key === 'ArrowRight') {
      handleNext()
    }
  }

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const resetControlsTimer = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 2800)
  }, [])

  const handleCardMouseMove = useCallback(() => {
    if (isCardVideoPlaying) {
      resetControlsTimer()
    } else {
      setShowControls(true)
    }
  }, [isCardVideoPlaying, resetControlsTimer])

  const handleCardMouseLeave = useCallback(() => {
    if (isCardVideoPlaying) {
      setShowControls(false)
    }
  }, [isCardVideoPlaying])

  // Manejadores para reproducción interactiva de video sin errores de browser
  const handleToggleCardVideo = () => {
    const video = cardVideoRef.current
    if (!video) return
    setVideoError(false)

    if (video.paused || video.ended) {
      if (video.ended) {
        video.currentTime = 0
      }
      playPromiseRef.current = video.play()
      if (playPromiseRef.current !== undefined) {
        playPromiseRef.current
          .then(() => {
            setIsCardVideoPlaying(true)
            setIsVideoBuffering(false)
            resetControlsTimer()
            if (isCardVideoMuted) {
              setUnmuteNotice(true)
              setTimeout(() => setUnmuteNotice(false), 3800)
            }
          })
          .catch((err) => {
            if (err.name !== 'AbortError') {
              console.warn('Playback warning:', err)
              // Si falla por política de audio desmuteado, mutear e intentar inmediatamente
              if (!video.muted) {
                video.muted = true
                setIsCardVideoMuted(true)
                video.play()
                  .then(() => {
                    setIsCardVideoPlaying(true)
                    resetControlsTimer()
                  })
                  .catch(() => setVideoError(true))
              } else {
                setVideoError(true)
              }
            }
          })
      }
    } else {
      if (playPromiseRef.current !== null) {
        playPromiseRef.current
          .then(() => {
            video.pause()
            setIsCardVideoPlaying(false)
            setShowControls(true)
          })
          .catch(() => {
            video.pause()
            setIsCardVideoPlaying(false)
            setShowControls(true)
          })
      } else {
        video.pause()
        setIsCardVideoPlaying(false)
        setShowControls(true)
      }
    }
  }

  const handleTimeUpdate = () => {
    if (!cardVideoRef.current) return
    const cur = cardVideoRef.current.currentTime || 0
    const dur = cardVideoRef.current.duration || 0
    setVideoCurrentTime(cur)
    if (dur > 0) {
      setVideoProgress((cur / dur) * 100)
    }
  }

  const handleLoadedMetadata = () => {
    if (!cardVideoRef.current) return
    setVideoDuration(cardVideoRef.current.duration || 0)
    setVideoError(false)
  }

  const handleSeek = (e) => {
    e.stopPropagation()
    const video = cardVideoRef.current
    if (!video || !video.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const pct = Math.max(0, Math.min(1, clickX / rect.width))
    video.currentTime = pct * video.duration
    setVideoProgress(pct * 100)
    setVideoCurrentTime(video.currentTime)
    resetControlsTimer()
  }

  const handleToggleMute = (e) => {
    if (e) e.stopPropagation()
    const video = cardVideoRef.current
    if (!video) return
    const nextMuted = !video.muted
    video.muted = nextMuted
    setIsCardVideoMuted(nextMuted)
    setUnmuteNotice(false)
  }

  const handleRetryVideo = (e) => {
    if (e) e.stopPropagation()
    const video = cardVideoRef.current
    if (!video) return
    setVideoError(false)
    setIsVideoBuffering(true)
    video.load()
    video.muted = true
    setIsCardVideoMuted(true)
    video.play()
      .then(() => {
        setIsCardVideoPlaying(true)
        setIsVideoBuffering(false)
      })
      .catch(() => {
        setVideoError(true)
        setIsVideoBuffering(false)
      })
  }

  const handleOpenCinemaModal = (e) => {
    if (e) e.stopPropagation()
    const cardVid = cardVideoRef.current
    if (cardVid && !cardVid.paused) {
      if (playPromiseRef.current) {
        playPromiseRef.current
          .then(() => {
            cardVid.pause()
            setIsCardVideoPlaying(false)
          })
          .catch(() => {
            cardVid.pause()
            setIsCardVideoPlaying(false)
          })
      } else {
        cardVid.pause()
        setIsCardVideoPlaying(false)
      }
    }
    setIsVideoModalOpen(true)
  }

  const handleCloseCinemaModal = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.pause()
    }
    setIsVideoModalOpen(false)
  }

  // Reproducir automáticamente en modal al abrir con fallback a silenciado si el navegador lo restringe
  useEffect(() => {
    if (isVideoModalOpen && modalVideoRef.current) {
      const modalVid = modalVideoRef.current
      modalVid.currentTime = 0
      const promise = modalVid.play()
      if (promise !== undefined) {
        promise.catch((err) => {
          if (err.name === 'NotAllowedError') {
            modalVid.muted = true
            modalVid.play().catch(() => {})
          }
        })
      }
    }
  }, [isVideoModalOpen])

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') handleCloseCinemaModal()
    }
    if (isVideoModalOpen) {
      window.addEventListener('keydown', handleKey)
    }
    return () => window.removeEventListener('keydown', handleKey)
  }, [isVideoModalOpen])

  return (
    <section id="inicio" className="hero-section-wrapper">
      {/* ================= HERO INMERSIVO SIN MARCOS ================= */}
      <div
        className="hero-immersive-banner"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-roledescription="carrusel de imágenes"
        aria-label="Presentación fotográfica de Visalud Osorno"
      >
        {/* Fondo de imágenes a pantalla completa sin marcos */}
        <div className="hero-bg-canvas" aria-hidden="true">
          {heroSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`hero-bg-slide slide-style-${idx} ${activeSlide === idx ? 'active' : ''}`}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="hero-bg-image"
                style={{ objectPosition: slide.position }}
                loading={idx === 0 ? 'eager' : 'lazy'}
                fetchPriority={idx === 0 ? 'high' : 'auto'}
              />
            </div>
          ))}
        </div>

        {/* Capas de atmósfera y difuminado elegante */}
        <div className="hero-vignette-overlay" aria-hidden="true" />
        <div className="hero-glow-orb hero-glow-orb-primary" aria-hidden="true" />
        <div className="hero-glow-orb hero-glow-orb-secondary" aria-hidden="true" />

        {/* Contenido Central: Mensaje de Bienvenida en Cristal */}
        <div className="hero-immersive-content">
          <div className="hero-crystal-card" ref={cardRef}>
            <div className="hero-crystal-badge">
              <span className="hero-badge-dot"></span>
              <span>Cuidado Domiciliario de Adulto Mayor en Osorno</span>
              <span className="hero-badge-live">Turnos Activos</span>
            </div>

            <h1 className="hero-crystal-title">
              Cuidado humanizado y técnico{' '}
              <span className="text-gradient">para tus adultos mayores</span>
            </h1>

            <p className="hero-crystal-lead">
              En <strong>Visalud</strong> somos el puente directo entre tu familia y{' '}
              <strong>Técnicos en Enfermería (TENS)</strong> certificados a domicilio.
              Servicios particulares por horas: <strong>medio turno (6 hrs)</strong> y{' '}
              <strong>turno completo (12 hrs)</strong>.
            </p>

            <div className="hero-crystal-actions">
              <a href="#servicios" className="btn-hero-primary">
                <span>Ver cuidadores TENS</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a href="#historia" className="btn-hero-secondary">
                <span>Nuestra vocación</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              </a>
            </div>

            {/* Estadísticas de Confianza en Cristal con Tarjetas Micro */}
            <div className="hero-crystal-stats">
              <div className="stat-glass-badge">
                <div className="stat-badge-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                </div>
                <div className="stat-badge-info">
                  <span className="stat-num">100%</span>
                  <span className="stat-label">TENS Registro SIS</span>
                </div>
              </div>

              <div className="stat-divider"></div>

              <div className="stat-glass-badge">
                <div className="stat-badge-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="stat-badge-info">
                  <span className="stat-num">6h / 12h</span>
                  <span className="stat-label">Turnos Flexibles</span>
                </div>
              </div>

              <div className="stat-divider"></div>

              <div className="stat-glass-badge">
                <div className="stat-badge-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="stat-badge-info">
                  <span className="stat-num">Directo</span>
                  <span className="stat-label">Acuerdo & Pago Particular</span>
                </div>
              </div>
            </div>

            {/* Sello de Calidad y Registro SIS en Cristal */}
            <div className="hero-crystal-seal">
              <div className="crystal-seal-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div className="crystal-seal-text">
                <div className="crystal-seal-stars">
                  ★★★★★ <span>4.9/5</span>
                  <span className="crystal-seal-pill">Verificado</span>
                </div>
                <p>Atención médica certificada · Registro SIS Osorno</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controles Flotantes de Cristal para cambiar de foto */}
        <div className="hero-glass-controls" aria-label="Controles de imágenes del hero">
          <button
            type="button"
            className="hero-glass-btn hero-pause-btn"
            onClick={() => setIsPaused((prev) => !prev)}
            aria-label={isPaused ? "Reanudar pase automático" : "Pausar pase automático"}
            title={isPaused ? "Reanudar pase automático" : "Pausar pase automático"}
          >
            {isPaused ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            )}
          </button>

          <div className="hero-glass-tag">
            <span className="hero-glass-tag-idx">0{activeSlide + 1} / 0{heroSlides.length}</span>
            <span className="hero-glass-tag-sep">·</span>
            <span className="hero-glass-tag-name">{heroSlides[activeSlide].tag}</span>
          </div>

          <div className="hero-glass-pills" role="tablist" aria-label="Seleccionar imagen">
            {heroSlides.map((slide, idx) => (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={activeSlide === idx}
                aria-label={`Ver foto ${idx + 1}: ${slide.tag}`}
                className={`hero-glass-pill ${activeSlide === idx ? 'active' : ''} ${isPaused ? 'is-paused' : ''}`}
                onClick={() => {
                  setActiveSlide(idx)
                  setIsPaused(false)
                }}
              >
                <span className="hero-glass-pill-bar" />
              </button>
            ))}
          </div>

          <div className="hero-glass-arrows">
            <button
              type="button"
              className="hero-glass-btn prev"
              onClick={handlePrev}
              aria-label="Foto anterior"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              className="hero-glass-btn next"
              onClick={handleNext}
              aria-label="Siguiente foto"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ================= SECCIÓN NUESTRA HISTORIA (DOS COLUMNAS) ================= */}
      <div className="intro-container">
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

          {/* Columna Derecha: Tarjeta de Video Moderna y Acreditación */}
          <div className="story-col-right">
            <div 
              className={`story-visual-card ${isCardVideoPlaying ? 'video-playing' : ''}`}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              {/* Elemento de Video HTML5 vertical sin distorsión ni zoom forzado */}
              <video
                ref={cardVideoRef}
                className="story-visual-video"
                playsInline
                preload="metadata"
                muted={isCardVideoMuted}
                onWaiting={() => setIsVideoBuffering(true)}
                onPlaying={() => {
                  setIsVideoBuffering(false)
                  setIsCardVideoPlaying(true)
                }}
                onPause={() => setIsCardVideoPlaying(false)}
                onEnded={() => {
                  setIsCardVideoPlaying(false)
                  setVideoProgress(0)
                  setVideoCurrentTime(0)
                  setShowControls(true)
                }}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onError={() => {
                  setVideoError(true)
                  setIsVideoBuffering(false)
                }}
                onClick={handleToggleCardVideo}
              >
                <source src="/fotos%20visalud/visalud.mp4" type="video/mp4" />
                Tu navegador no soporta la reproducción de video HTML5.
              </video>

              {/* Degradado sutil solo cuando está pausado */}
              <div 
                className={`story-visual-gradient ${isCardVideoPlaying ? 'playing' : ''}`} 
                onClick={handleToggleCardVideo}
                aria-hidden="true"
              />

              {/* Barra superior con badge y accesos rápidos */}
              <div className={`story-video-top-bar ${isCardVideoPlaying && !showControls ? 'hidden' : ''}`}>
                <div className="story-video-pill-tag">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                  <span>Video Institucional · 1:14 min</span>
                </div>

                <div className="story-video-top-actions">
                  <button
                    type="button"
                    className="story-video-ctrl-btn mini"
                    onClick={handleToggleMute}
                    aria-label={isCardVideoMuted ? 'Activar sonido' : 'Silenciar sonido'}
                    title={isCardVideoMuted ? 'Activar sonido (M)' : 'Silenciar (M)'}
                  >
                    {isCardVideoMuted ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="1" y1="1" x2="23" y2="23" />
                        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                      </svg>
                    )}
                  </button>

                  <button
                    type="button"
                    className="story-video-ctrl-btn mini"
                    onClick={handleOpenCinemaModal}
                    aria-label="Abrir en modo cine"
                    title="Modo cine ampliado"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Botón Central de Reproducción elegante y despejado */}
              {!isCardVideoPlaying && !videoError && (
                <button
                  type="button"
                  className="story-center-play-trigger"
                  onClick={handleToggleCardVideo}
                  aria-label="Reproducir video de presentación de Visalud"
                >
                  <div className="story-play-orb">
                    <div className="story-play-glow-ring" aria-hidden="true" />
                    <span className="story-play-triangle">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="6 4 20 12 6 20 6 4" />
                      </svg>
                    </span>
                  </div>
                  <span className="story-play-label">Reproducir video</span>
                </button>
              )}

              {/* Spinner de buffering */}
              {isVideoBuffering && (
                <div className="story-video-buffer-spinner" aria-label="Cargando video...">
                  <div className="spinner-ring" />
                </div>
              )}

              {/* Aviso amigable para activar sonido si inicia silenciado */}
              {unmuteNotice && isCardVideoPlaying && isCardVideoMuted && (
                <button
                  type="button"
                  className="story-unmute-toast"
                  onClick={handleToggleMute}
                  aria-label="Activar sonido del video"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  <span>Video silenciado · Haz clic para activar audio</span>
                </button>
              )}

              {/* Estado de error recuperable */}
              {videoError && (
                <div className="story-video-error-state">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p>No se pudo iniciar la reproducción del video.</p>
                  <button type="button" className="btn-retry-video" onClick={handleRetryVideo}>
                    Reintentar reproducción
                  </button>
                </div>
              )}

              {/* Barra de Controles Flotante Moderna con auto-ocultado suave */}
              {isCardVideoPlaying && (
                <div 
                  className={`story-video-glass-bar ${!showControls ? 'hidden' : ''}`} 
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="video-bar-left">
                    <button
                      type="button"
                      className="story-video-ctrl-btn"
                      onClick={handleToggleCardVideo}
                      aria-label={isCardVideoPlaying ? "Pausar video" : "Reproducir video"}
                      title={isCardVideoPlaying ? "Pausar (Espacio)" : "Reproducir"}
                    >
                      {isCardVideoPlaying ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" rx="1.5" />
                          <rect x="14" y="4" width="4" height="16" rx="1.5" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="6 4 20 12 6 20 6 4" />
                        </svg>
                      )}
                    </button>

                    <button
                      type="button"
                      className="story-video-ctrl-btn"
                      onClick={handleToggleMute}
                      aria-label={isCardVideoMuted ? 'Activar sonido' : 'Silenciar sonido'}
                      title={isCardVideoMuted ? 'Activar sonido' : 'Silenciar'}
                    >
                      {isCardVideoMuted ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="1" y1="1" x2="23" y2="23" />
                          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                          <line x1="12" y1="19" x2="12" y2="23" />
                          <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Barra de progreso interactiva con tiempo */}
                  <div className="video-bar-track-wrap" onClick={handleSeek} title="Avanzar / retroceder en el video">
                    <div className="video-bar-track">
                      <div className="video-bar-fill" style={{ width: `${videoProgress}%` }} />
                    </div>
                    <div className="video-bar-timestamps">
                      <span>{formatTime(videoCurrentTime)}</span>
                      <span>/</span>
                      <span>{formatTime(videoDuration || 74)}</span>
                    </div>
                  </div>

                  <div className="video-bar-right">
                    <button
                      type="button"
                      className="story-video-ctrl-btn cinema-btn"
                      onClick={handleOpenCinemaModal}
                      aria-label="Ver en pantalla completa / modo cine"
                      title="Modo cine ampliado"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                      </svg>
                      <span className="ctrl-btn-text">Modo Cine</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tarjeta de Acreditación y Confianza Médica fuera del reproductor (despejado) */}
            <div className="story-credential-card">
              <div className="credential-card-header">
                <div className="credential-icon-shield" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                </div>
                <div className="credential-text">
                  <div className="credential-headline">
                    <h4>Personal Calificado con Registro SIS</h4>
                    <span className="credential-verified-tag">Verificado</span>
                  </div>
                  <p>Técnicos en enfermería (TENS) y cuidadores capacitados para turnos particulares en Osorno.</p>
                </div>
              </div>

              <div className="credential-tags-row">
                <span className="credential-pill">
                  <span className="pill-check">✓</span> Turnos de 6h y 12h
                </span>
                <span className="credential-pill">
                  <span className="pill-check">✓</span> Curaciones y confort
                </span>
                <span className="credential-pill">
                  <span className="pill-check">✓</span> Osorno y Alrededores
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de video institucional tipo Cine Glass Moderno */}
        {isVideoModalOpen && (
          <div className="video-modal-backdrop" onClick={handleCloseCinemaModal}>
            <div className="video-modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="video-modal-header">
                <div className="video-modal-title-box">
                  <span className="video-modal-pill">Video Institucional</span>
                  <h3 className="video-modal-title">Visalud Osorno · Vocación y Cuidado Humano</h3>
                </div>
                <button
                  type="button"
                  className="video-modal-close"
                  onClick={handleCloseCinemaModal}
                  aria-label="Cerrar video"
                  title="Cerrar (Esc)"
                >
                  ✕
                </button>
              </div>

              <div className="video-modal-player-wrap">
                <video
                  ref={modalVideoRef}
                  className="video-modal-element"
                  controls
                  autoPlay
                  playsInline
                >
                  <source src="/fotos%20visalud/visalud.mp4" type="video/mp4" />
                  Tu navegador no soporta la reproducción de video HTML5.
                </video>
              </div>

              <div className="video-modal-footer">
                <p className="video-modal-desc">
                  Técnicos en enfermería (TENS) con vocación geriátrica para turnos particulares de 6h y 12h en Osorno.
                </p>
                <div className="video-modal-cta-group">
                  <a
                    href="https://wa.me/56968016334?text=Hola%20Visalud,%20vi%20el%20video%20institucional%20y%20quisiera%20consultar%20por%20turnos%20de%20cuidado%20a%20domicilio%20en%20Osorno"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-video-modal-wa"
                    onClick={handleCloseCinemaModal}
                  >
                    <span>Coordinar Turnos por WhatsApp</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </a>
                  <a
                    href="#contacto"
                    className="btn-video-modal-cta"
                    onClick={handleCloseCinemaModal}
                  >
                    <span>Solicitar profesional</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </section>
)
}
