import { useState, useRef, useEffect, useCallback } from 'react'
import { testimonialsService } from '../services/testimonialsService.js'
import { defaultTestimonials } from '../data/defaultTestimonials.js'
import './Testimonials.css'

const STATS_DATA = [
  { value: '+140', label: 'Familias acompañadas en Osorno' },
  { value: '100%', label: 'TENS acreditados con Registro SIS' },
  { value: '4.9 ★', label: 'Satisfacción y recomendación familiar' },
  { value: '24/7', label: 'Disponibilidad diurna y vigilia' },
]

const SECTORS_LIST = [
  'Sector Pilauco, Osorno',
  'Sector Centro, Osorno',
  'Sector Rahue Alto, Osorno',
  'Sector Rahue Bajo, Osorno',
  'Sector Francke, Osorno',
  'Sector Ovejería, Osorno',
  'Sector Kolbe, Osorno',
  'Alrededores de Osorno',
]

const SERVICES_LIST = [
  'Turno Completo (12 hrs) • Cuidado Continuo',
  'Medio Turno (6 hrs) • Aseo y Confort',
  'Vigilia Nocturna (12 hrs) • Supervisión',
  'Gestión Delegada de Turnos Visalud',
  'Acompañamiento y Estimulación',
]

const INITIAL_REVIEW_FORM = {
  name: '',
  relation: '',
  location: 'Sector Pilauco, Osorno',
  service: 'Turno Completo (12 hrs) • Cuidado Continuo',
  rating: 5,
  tag: 'Cuidado y Acompañamiento',
  comment: '',
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState(defaultTestimonials)
  const trackRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Modal para dejar testimonio
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState(INITIAL_REVIEW_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Cargar testimonios aprobados y suscribirse a cambios
  useEffect(() => {
    let isMounted = true
    const loadTestimonials = async () => {
      try {
        const res = await testimonialsService.getApprovedTestimonials()
        if (isMounted && res.data && res.data.length > 0) {
          setTestimonials(res.data)
        }
      } catch (err) {
        console.error('Error cargando testimonios:', err)
      }
    }

    loadTestimonials()

    const unsubscribe = testimonialsService.onTestimonialsChange(() => {
      loadTestimonials()
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const scrollToIndex = useCallback((index) => {
    if (!trackRef.current) return
    const container = trackRef.current
    const cards = container.querySelectorAll('.testimonial-card')
    if (!cards[index]) return

    const card = cards[index]
    const containerLeft = container.getBoundingClientRect().left
    const cardLeft = card.getBoundingClientRect().left
    const targetScroll = container.scrollLeft + (cardLeft - containerLeft)

    container.scrollTo({ left: targetScroll, behavior: 'smooth' })
    setCurrentIndex(index)
  }, [])

  const handlePrev = () => {
    const total = testimonials.length
    if (total === 0) return
    const nextIdx = currentIndex === 0 ? total - 1 : currentIndex - 1
    scrollToIndex(nextIdx)
  }

  const handleNext = useCallback(() => {
    const total = testimonials.length
    if (total === 0) return
    const nextIdx = (currentIndex + 1) % total
    scrollToIndex(nextIdx)
  }, [currentIndex, scrollToIndex, testimonials.length])

  const handleScroll = () => {
    if (!trackRef.current) return
    const container = trackRef.current
    const cards = container.querySelectorAll('.testimonial-card')
    if (!cards.length) return

    const scrollLeft = container.scrollLeft
    let closestIndex = 0
    let minDiff = Infinity

    cards.forEach((card, idx) => {
      const diff = Math.abs(card.offsetLeft - scrollLeft)
      if (diff < minDiff) {
        minDiff = diff
        closestIndex = idx
      }
    })

    setCurrentIndex(closestIndex)
  }

  // Rotación automática suave cada 6.5s
  useEffect(() => {
    if (isPaused || isModalOpen) return
    const timer = setInterval(() => {
      handleNext()
    }, 6500)
    return () => clearInterval(timer)
  }, [handleNext, isPaused, isModalOpen])

  // Manejo del formulario de testimonio
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (submitError) setSubmitError(null)
  }

  const handleRatingClick = (rate) => {
    setForm((prev) => ({ ...prev, rating: rate }))
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setSubmitError('Por favor ingresa tu nombre o el de tu familia.')
      return
    }
    if (!form.comment.trim()) {
      setSubmitError('Por favor escribe tu comentario o experiencia.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      await testimonialsService.submitPublicTestimonial({
        name: form.name.trim(),
        relation: form.relation.trim() || 'Familiar de paciente',
        location: form.location,
        service: form.service,
        rating: Number(form.rating) || 5,
        tag: form.tag.trim() || 'Cuidado y Acompañamiento',
        comment: form.comment.trim(),
      })
      setSubmitSuccess(true)
    } catch (err) {
      console.error(err)
      setSubmitError('No se pudo enviar el comentario. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSubmitSuccess(false)
    setSubmitError(null)
    setForm(INITIAL_REVIEW_FORM)
  }

  return (
    <section id="testimonios" className="testimonials-section">
      <div className="testimonials-container">
        {/* Encabezado de la sección */}
        <div className="testimonials-header">
          <div className="testimonials-badge">
            <span className="testimonials-badge-dot" />
            <span>Historias Reales de Familias en Osorno</span>
          </div>

          <h2 className="testimonials-title">
            La tranquilidad de saber que tus seres queridos <span className="text-gradient">están en buenas manos</span>
          </h2>

          <p className="testimonials-lead">
            Experiencias compartidas por familiares que confían el cuidado y compañía de sus adultos mayores a nuestros Técnicos en Enfermería (TENS).
          </p>
        </div>

        {/* Métricas de Confianza Compactas */}
        <div className="testimonials-stats-grid">
          {STATS_DATA.map((st, i) => (
            <div key={i} className="test-stat-card">
              <span className="test-stat-value">{st.value}</span>
              <span className="test-stat-label">{st.label}</span>
            </div>
          ))}
        </div>

        {/* ================= CARRUSEL HORIZONTAL ================= */}
        <div
          className="testimonials-carousel-wrapper"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Barra de control superior */}
          <div className="testimonials-carousel-toolbar">
            <div className="carousel-status-info">
              <span className="carousel-status-dot" />
              <span>Experiencias verificadas en Osorno</span>
              <span className="carousel-counter-pill">
                {testimonials.length > 0 ? `${currentIndex + 1} de ${testimonials.length}` : '0'}
              </span>
            </div>

            <div className="carousel-arrow-buttons">
              <button
                type="button"
                className="carousel-nav-btn prev"
                onClick={handlePrev}
                aria-label="Ver testimonio anterior"
                title="Anterior"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                className="carousel-nav-btn next"
                onClick={handleNext}
                aria-label="Ver siguiente testimonio"
                title="Siguiente"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Flechas laterales flotantes */}
          <button
            type="button"
            className="carousel-side-arrow left"
            onClick={handlePrev}
            aria-label="Testimonio anterior"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            type="button"
            className="carousel-side-arrow right"
            onClick={handleNext}
            aria-label="Siguiente testimonio"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Pista deslizable horizontal */}
          <div
            className="testimonials-carousel-track"
            ref={trackRef}
            onScroll={handleScroll}
          >
            {testimonials.map((t, idx) => (
              <article
                key={t.id || idx}
                className={`testimonial-card ${currentIndex === idx ? 'card-active' : ''}`}
              >
                <div className="testimonial-card-top">
                  <div className="testimonial-stars" aria-label={`${t.rating || 5} de 5 estrellas`}>
                    {'★'.repeat(t.rating || 5)}
                  </div>
                  <span className="testimonial-tag">{t.tag || 'Atención Domiciliaria'}</span>
                </div>

                <blockquote className="testimonial-quote">
                  <p>“{t.comment}”</p>
                </blockquote>

                <div className="testimonial-meta">
                  <div className="testimonial-author-avatar">
                    <span>{t.name ? t.name.charAt(0) : 'F'}</span>
                  </div>
                  <div className="testimonial-author-info">
                    <div className="author-name-row">
                      <strong className="author-name">{t.name}</strong>
                      {t.verified && (
                        <span className="badge-verified" title="Servicio verificado en Osorno">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Verificado</span>
                        </span>
                      )}
                    </div>
                    <span className="author-relation">{t.relation}</span>
                    <span className="author-location">📍 {t.location}</span>
                    <span className="author-service">{t.service}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Indicadores de paginación (Dots) */}
          <div className="testimonials-dots" role="tablist" aria-label="Selector de testimonio">
            {testimonials.map((t, idx) => (
              <button
                key={t.id || idx}
                type="button"
                role="tab"
                aria-selected={currentIndex === idx}
                className={`testimonial-dot ${currentIndex === idx ? 'active' : ''}`}
                onClick={() => scrollToIndex(idx)}
                aria-label={`Ver testimonio ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ================= BOX MODIFICADO: DEJAR TESTIMONIO ================= */}
        <div className="testimonials-cta-box">
          <div className="testimonials-cta-content">
            <span className="testimonials-cta-badge">Tu experiencia ayuda a otras familias</span>
            <h3>¿Atendimos a tu ser querido en Osorno?</h3>
            <p>
              Comparte tu experiencia con nuestro equipo y cuidadores TENS. Tu opinión ayuda y da tranquilidad a hijos y nietos que buscan cuidados de confianza en Osorno.
            </p>
          </div>
          <div className="testimonials-cta-actions">
            <button
              type="button"
              className="btn-open-review-modal"
              onClick={() => setIsModalOpen(true)}
              aria-label="Abrir formulario para dejar mi testimonio"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span>Dejar mi testimonio</span>
            </button>

            <a
              href="https://wa.me/56968016334?text=Hola%20Visalud,%20quisiera%20compartir%20mi%20testimonio%20sobre%20el%20servicio%20de%20cuidado%20en%20Osorno"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-testimonials-wa-secondary"
              title="Enviar testimonio directamente por WhatsApp"
              aria-label="Enviar testimonio directamente por WhatsApp"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span>Enviar por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* ================= MODAL: FORMULARIO DE TESTIMONIO ================= */}
      {isModalOpen && (
        <div className="review-modal-backdrop" onClick={handleCloseModal}>
          <div className="review-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="review-modal-close-btn"
              onClick={handleCloseModal}
              aria-label="Cerrar formulario"
            >
              ✕
            </button>

            {submitSuccess ? (
              <div className="review-modal-success">
                <div className="review-success-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3>¡Muchas gracias por tu testimonio!</h3>
                <p>
                  Tu opinión ha sido registrada correctamente. Por seguridad y respeto a la privacidad familiar, la Coordinación de Visalud la revisará y la publicará en el carrusel en breve.
                </p>
                <button
                  type="button"
                  className="btn-review-close-success"
                  onClick={handleCloseModal}
                >
                  Entendido, volver a la página
                </button>
              </div>
            ) : (
              <form className="review-modal-form" onSubmit={handleSubmitReview}>
                <div className="review-modal-header">
                  <span className="review-modal-pill">Evaluación de Paciente / Familiar</span>
                  <h3>Compartir mi experiencia con Visalud</h3>
                  <p>Tu opinión sincera ayuda a mejorar la atención y orienta a otras familias de Osorno.</p>
                </div>

                {submitError && (
                  <div className="review-form-error">{submitError}</div>
                )}

                {/* Calificación de Estrellas */}
                <div className="review-form-field">
                  <label>Tu calificación general:</label>
                  <div className="review-stars-selector">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-select-btn ${form.rating >= star ? 'selected' : ''}`}
                        onClick={() => handleRatingClick(star)}
                        aria-label={`${star} estrellas`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="rating-label-text">
                      {form.rating === 5 && 'Excelente (5 de 5)'}
                      {form.rating === 4 && 'Muy bueno (4 de 5)'}
                      {form.rating === 3 && 'Bueno (3 de 5)'}
                      {form.rating <= 2 && 'Regular'}
                    </span>
                  </div>
                </div>

                <div className="review-form-row">
                  <div className="review-form-field">
                    <label htmlFor="rev-name">Tu nombre o Familia <span className="req">*</span></label>
                    <input
                      id="rev-name"
                      name="name"
                      type="text"
                      placeholder="Ej. Carmen Gloria Muñoz"
                      value={form.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="review-form-field">
                    <label htmlFor="rev-relation">Parentesco o relación</label>
                    <input
                      id="rev-relation"
                      name="relation"
                      type="text"
                      placeholder="Ej. Hija de don Fernando (84 años)"
                      value={form.relation}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="review-form-row">
                  <div className="review-form-field">
                    <label htmlFor="rev-location">Sector de atención en Osorno</label>
                    <select
                      id="rev-location"
                      name="location"
                      value={form.location}
                      onChange={handleInputChange}
                    >
                      {SECTORS_LIST.map((sec) => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>

                  <div className="review-form-field">
                    <label htmlFor="rev-service">Modalidad o servicio recibido</label>
                    <select
                      id="rev-service"
                      name="service"
                      value={form.service}
                      onChange={handleInputChange}
                    >
                      {SERVICES_LIST.map((svc) => (
                        <option key={svc} value={svc}>{svc}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="review-form-field">
                  <label htmlFor="rev-comment">Tu experiencia o palabras para el equipo TENS <span className="req">*</span></label>
                  <textarea
                    id="rev-comment"
                    name="comment"
                    rows={4}
                    placeholder="Cuéntanos cómo fue el trato del cuidador, puntualidad, apoyo a tu ser querido y tranquilidad que brindaron a tu hogar..."
                    value={form.comment}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="review-modal-actions">
                  <button
                    type="button"
                    className="btn-review-cancel"
                    onClick={handleCloseModal}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-review-submit"
                    disabled={submitting}
                  >
                    {submitting ? 'Enviando testimonio...' : 'Publicar mi testimonio'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
