import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { leadsService } from '../services/leadsService.js'

const INFO_CARDS = [
  {
    id: 'whatsapp',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    ),
    label: 'WhatsApp Coordinación',
    value: '+56 9 6801 6334',
    href: 'https://wa.me/56968016334?text=Hola%20Visalud,%20quisiera%20consultar%20sobre%20el%20servicio%20de%20cuidado%20de%20adulto%20mayor%20a%20domicilio%20en%20Osorno',
    target: '_blank',
    rel: 'noopener noreferrer',
  },
  {
    id: 'phone',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.5 2 2 0 0 1 3.6 1.32h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.09 6.09l1.78-1.78a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    label: 'Llamada telefónica',
    value: '+56 9 6801 6334',
    href: 'tel:+56968016334',
  },
  {
    id: 'email',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
    label: 'Correo Electrónico',
    value: 'visaludosorno@gmail.com',
    href: 'mailto:visaludosorno@gmail.com',
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
    label: 'Turnos y atención',
    value: 'Lunes a Domingo • 24 Horas',
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
    label: 'Ubicación y Cobertura',
    value: 'Osorno Urbano, X Región, Chile',
    href: null,
  },
]

const SERVICES_OPTIONS = [
  'Medio Turno (6 hrs)',
  'Turno Completo (12 hrs)',
  'Vigilia Nocturna (12 hrs)',
  'Coordinación Delegada',
  'Orientación General'
]

const SECTORS_OPTIONS = [
  'Centro Osorno',
  'Rahue (Alto / Bajo)',
  'Francke',
  'Pilauco / Kolbe',
  'Ovejería',
  'Alrededores / Rural'
]

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Medio Turno (6 hrs)',
    sector: 'Centro Osorno',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (submitError) setSubmitError(null)
  }

  function handleSelectService(svc) {
    setForm(prev => ({ ...prev, subject: svc }))
  }

  function handleSelectSector(sec) {
    setForm(prev => ({ ...prev, sector: sec }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || (!form.email.trim() && !form.phone.trim()) || !form.message.trim()) {
      setSubmitError('Por favor ingresa tu nombre, un teléfono o correo de contacto, y tu mensaje.')
      return
    }

    setLoading(true)
    setSubmitError(null)

    try {
      await leadsService.addLead({
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        subject: form.subject || 'Consulta Cuidado Adulto Mayor',
        sector: form.sector || 'Centro Osorno',
        message: form.message.trim(),
      })
      setSent(true)
    } catch (err) {
      console.error('Error enviando formulario:', err)
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  function handleDirectWhatsApp() {
    const text = `Hola Visalud Osorno, mi nombre es ${form.name.trim() || '(Familiar)'}${form.phone ? `, teléfono ${form.phone}` : ''}.\n\n*Servicio de interés:* ${form.subject || 'Cuidado Adulto Mayor'}\n*Sector en Osorno:* ${form.sector || 'Radio urbano'}\n*Detalles:* ${form.message.trim() || 'Quisiera consultar disponibilidad y coordinar atención para mi familiar.'}`
    const url = `https://wa.me/56968016334?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="contact-section" id="contacto">
      {/* Banda superior con degradado */}
      <div className="contact-hero-strip">
        <div className="contact-strip-inner">
          <span className="contact-eyebrow">Estamos para ayudarte</span>
          <h2 className="contact-heading">Contáctanos</h2>
          <p className="contact-lead">
            ¿Tienes preguntas o deseas consultar por cuidadores para tu ser querido en Osorno? Estamos disponibles
            para resolver todas tus dudas de forma rápida, cercana y personalizada.
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
                Comunícate por el medio que prefieras con nuestra Coordinación Central en Osorno.
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
                    className: `contact-info-card contact-info-card-interactive ${card.id === 'instagram' ? 'contact-card-instagram' : ''} ${card.id === 'whatsapp' ? 'contact-card-whatsapp' : ''}`,
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
                <span>Coordinación directa de turnos y respuesta ágil</span>
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
                <h3>¡Mensaje recibido con éxito!</h3>
                <p>Hemos registrado tu requerimiento. Nuestro equipo de coordinación en Osorno te responderá a la brevedad.</p>
                
                <div className="contact-success-actions">
                  <a
                    href={`https://wa.me/56968016334?text=${encodeURIComponent(`Hola Visalud, acabo de enviar un formulario de contacto en su página web a nombre de ${form.name || 'un familiar'}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-success-whatsapp"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span>Hablar por WhatsApp ahora</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSent(false)
                      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
                    }}
                    className="btn-send-another"
                  >
                    Enviar otra consulta
                  </button>
                </div>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="contact-form-header">
                  <div className="contact-form-status-badge">
                    <span className="contact-pulse-dot" />
                    <span>Coordinación activa en Osorno • Respuesta ágil</span>
                  </div>
                  <h3 className="contact-form-title">Envíanos un mensaje o cotización</h3>
                  <p className="contact-form-subtitle">
                    Selecciona el servicio y sector de tu familiar para brindarte una respuesta personalizada.
                  </p>
                </div>

                {submitError && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    marginBottom: '1rem',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#dc2626',
                    fontSize: '0.88rem',
                    fontWeight: '500',
                    border: '1px solid rgba(239, 68, 68, 0.25)'
                  }}>
                    {submitError}
                  </div>
                )}

                {/* Selector rápido de Servicio */}
                <div className="contact-chips-group">
                  <label className="contact-chips-label">1. Modalidad o Servicio de Interés:</label>
                  <div className="contact-chips-list">
                    {SERVICES_OPTIONS.map((svc) => (
                      <button
                        key={svc}
                        type="button"
                        className={`contact-chip-btn ${form.subject === svc ? 'active' : ''}`}
                        onClick={() => handleSelectService(svc)}
                      >
                        {svc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selector rápido de Sector en Osorno */}
                <div className="contact-chips-group">
                  <label className="contact-chips-label">2. Sector de Atención en Osorno:</label>
                  <div className="contact-chips-list">
                    {SECTORS_OPTIONS.map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        className={`contact-chip-btn ${form.sector === sec ? 'active' : ''}`}
                        onClick={() => handleSelectSector(sec)}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="contact-form-row">
                  <div className="contact-field">
                    <label htmlFor="cf-name">
                      Nombre del familiar <span className="contact-req">*</span>
                    </label>
                    <input
                      id="cf-name"
                      name="name"
                      type="text"
                      placeholder="Ej. Juan Pérez"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="cf-phone">
                      Teléfono o WhatsApp <span className="contact-req">*</span>
                    </label>
                    <input
                      id="cf-phone"
                      name="phone"
                      type="tel"
                      placeholder="+56 9 1234 5678"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="contact-form-row">
                  <div className="contact-field">
                    <label htmlFor="cf-email">
                      Correo electrónico (opcional)
                    </label>
                    <input
                      id="cf-email"
                      name="email"
                      type="email"
                      placeholder="tu@correo.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="cf-subject-input">
                      Detalle adicional del servicio
                    </label>
                    <input
                      id="cf-subject-input"
                      name="subject"
                      type="text"
                      placeholder="Personalizar asunto..."
                      value={form.subject}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="contact-field">
                  <label htmlFor="cf-message">
                    Mensaje o requerimiento de salud del adulto mayor <span className="contact-req">*</span>
                  </label>
                  <textarea
                    id="cf-message"
                    name="message"
                    rows={3}
                    placeholder="Cuéntanos brevemente sobre la situación: edad, si camina o está en cama, requerimiento de medicamentos, fechas estimadas..."
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="btn-contact-submit" id="btn-contact-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="contact-spinner" aria-hidden="true" />
                      <span>Enviando mensaje...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar mensaje por la web</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m22 2-7 20-4-9-9-4Z" />
                        <path d="M22 2 11 13" />
                      </svg>
                    </>
                  )}
                </button>

                <div className="contact-whatsapp-direct-box">
                  <button
                    type="button"
                    onClick={handleDirectWhatsApp}
                    className="btn-contact-whatsapp-direct"
                    id="btn-contact-whatsapp-direct"
                    title="Abrir chat en WhatsApp directamente con estos datos"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span>O enviar esta consulta directo a WhatsApp</span>
                  </button>
                  <span className="contact-wa-hint">Envía los datos seleccionados directamente a la Coordinación sin esperar correo.</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

