import { useState } from 'react'

const INFO_CARDS = [
  {
    id: 'email',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
    label: 'Correo electrónico',
    value: 'hola@visalud.com',
    href: 'mailto:hola@visalud.com',
  },
  {
    id: 'phone',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.5 2 2 0 0 1 3.6 1.32h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.09 6.09l1.78-1.78a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    label: 'Teléfono / WhatsApp',
    value: '+1 000 000 0000',
    href: 'tel:+10000000000',
  },
  {
    id: 'instagram',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
    label: 'Instagram Oficial',
    value: '@visalud.osorno',
    href: 'https://www.instagram.com/visalud.osorno/',
    target: '_blank',
    rel: 'noopener noreferrer',
  },
  {
    id: 'hours',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    label: 'Horario de atención',
    value: 'Lun – Vie, 8:00 – 18:00',
    href: null,
  },
  {
    id: 'location',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    label: 'Ubicación',
    value: 'Osorno, X Región, Chile',
    href: null,
  },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 4500)
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <section className="contact-section" id="contacto">
      {/* Banda superior con degradado */}
      <div className="contact-hero-strip">
        <div className="contact-strip-inner">
          <span className="contact-eyebrow">Estamos para ayudarte</span>
          <h2 className="contact-heading">Contáctanos</h2>
          <p className="contact-lead">
            ¿Tienes preguntas o deseas agendar una atención médica? Estamos disponibles
            para resolver todas tus dudas de forma rápida y personalizada.
          </p>
        </div>
      </div>

      {/* Grid principal con tarjetas simétricas */}
      <div className="contact-body">
        <div className="contact-grid">
          {/* Columna izquierda — Canales de atención */}
          <div className="contact-info-wrapper">
            <div className="contact-info-header">
              <span className="contact-card-badge">Canales directos</span>
              <h3 className="contact-info-title">Información de contacto</h3>
              <p className="contact-info-intro">
                Comunícate por el medio que prefieras o visítanos directamente en nuestros centros de atención.
              </p>
            </div>

            <div className="contact-cards">
              {INFO_CARDS.map(card => {
                const isLink = Boolean(card.href)
                const CardElement = isLink ? 'a' : 'div'
                const cardProps = isLink
                  ? {
                    href: card.href,
                    target: card.target,
                    rel: card.rel,
                    className: `contact-info-card contact-info-card-interactive ${card.id === 'instagram' ? 'contact-card-instagram' : ''}`,
                  }
                  : { className: 'contact-info-card' }

                return (
                  <CardElement key={card.id} {...cardProps}>
                    <div className="contact-card-icon">{card.icon}</div>
                    <div className="contact-card-body">
                      <span className="contact-card-label">{card.label}</span>
                      <span className={`contact-card-value ${isLink ? 'link' : ''}`}>
                        {card.value}
                      </span>
                    </div>
                    {isLink && (
                      <div className="contact-card-arrow" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </div>
                    )}
                  </CardElement>
                )
              })}
            </div>

            <div className="contact-info-footer">
              <div className="contact-guarantee-pill">
                <span className="contact-pulse-dot"></span>
                <span>Respuesta ágil en menos de 24 horas hábiles</span>
              </div>
            </div>
          </div>

          {/* Columna derecha — Formulario */}
          <div className="contact-form-wrapper">
            {sent ? (
              <div className="contact-success">
                <div className="contact-success-icon">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <h3>¡Mensaje enviado con éxito!</h3>
                <p>Hemos recibido tu consulta correctamente. Nuestro equipo te responderá a la brevedad.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="contact-form-header">
                  <span className="contact-card-badge">Mensaje directo</span>
                  <h3 className="contact-form-title">Envíanos un mensaje</h3>
                  <p className="contact-form-subtitle">
                    Completa los campos a continuación y te responderemos por correo o teléfono.
                  </p>
                </div>

                <div className="contact-form-row">
                  <div className="contact-field">
                    <label htmlFor="cf-name">
                      Nombre completo <span className="contact-req">*</span>
                    </label>
                    <input
                      id="cf-name"
                      name="name"
                      type="text"
                      placeholder="Tu nombre completo"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="cf-email">
                      Correo electrónico <span className="contact-req">*</span>
                    </label>
                    <input
                      id="cf-email"
                      name="email"
                      type="email"
                      placeholder="tu@correo.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="contact-field">
                  <label htmlFor="cf-subject">
                    Asunto <span className="contact-req">*</span>
                  </label>
                  <input
                    id="cf-subject"
                    name="subject"
                    type="text"
                    placeholder="¿En qué podemos ayudarte?"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="cf-message">
                    Mensaje <span className="contact-req">*</span>
                  </label>
                  <textarea
                    id="cf-message"
                    name="message"
                    rows={4}
                    placeholder="Escribe aquí tu consulta o requerimiento..."
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="btn-contact-submit" id="btn-contact-submit">
                  <span>Enviar mensaje</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

