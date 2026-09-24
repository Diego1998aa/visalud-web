import { useState, useMemo, useRef, useEffect } from 'react'
import { professionalsService } from '../services/professionalsService.js'
import { defaultProfessionals } from '../data/defaultProfessionals.js'

const servicesData = [
  {
    id: 'all',
    title: 'Todos los servicios',
    shortName: 'Todos',
    badge: 'Atención Integral',
    description: 'Conoce a todo el equipo de enfermería, TENS y especialistas disponibles para atención en clínica y a domicilio en Osorno.',
    features: [
      'Profesionales certificados por la Superintendencia de Salud',
      'Atención en Centro Clínico y a Domicilio en Osorno',
      'Coordinación directa e inmediata por WhatsApp',
      'Boletas válidas para reembolso Fonasa e Isapre',
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: 'cuidados-adulto-mayor',
    title: 'Cuidados de Adulto Mayor',
    shortName: 'Cuidados Adulto Mayor',
    badge: 'Acompañamiento & Confort',
    description: 'Atención humanizada, asistencia en la vida diaria, control de signos vitales, administración de fármacos y compañía diurna y nocturna a domicilio.',
    features: [
      'Turnos diurnos, nocturnos y cobertura 24 horas',
      'Asistencia dedicada en aseo, confort y alimentación',
      'Control riguroso de signos vitales y glicemia',
      'Trato cálido y comunicación constante con la familia',
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <circle cx="12" cy="11" r="3" />
        <path d="M7 21v-2a5 5 0 0 1 10 0v2" />
      </svg>
    ),
  },
  {
    id: 'inyecciones',
    title: 'Inyecciones y Tratamientos',
    shortName: 'Inyecciones',
    badge: 'Procedimientos Clínicos',
    description: 'Administración rápida, segura y estéril de inyecciones intramusculares, subcutáneas, endovenosas, sueroterapia y fármacos bajo indicación médica.',
    features: [
      'Inyecciones intramusculares, subcutáneas y EV',
      'Administración de Neurobionta, analgésicos y sueros',
      'Técnica 100% aséptica y material clínico sellado',
      'Atención express en box o en la comodidad del hogar',
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m18 2 4 4" />
        <path d="m17 7 3-3" />
        <path d="M19 9 8.7 19.3c-.4.4-1 .4-1.4 0l-2.6-2.6c-.4-.4-.4-1 0-1.4L15 5" />
        <path d="m9 11 4 4" />
        <path d="m5 19-3 3" />
        <path d="m14 4 6 6" />
      </svg>
    ),
  },
  {
    id: 'curaciones-de-heridas',
    title: 'Curaciones de Heridas',
    shortName: 'Curaciones de Heridas',
    badge: 'Técnica Aséptica & Avanzada',
    description: 'Tratamiento y curación simple y avanzada de heridas quirúrgicas, úlceras vasculares, escaras por presión, quemaduras y retiro de puntos.',
    features: [
      'Tratamiento de úlceras venosas, escaras y heridas',
      'Manejo de heridas quirúrgicas y retiro de suturas',
      'Uso de apósitos estériles avanzados e hidrocoloides',
      'Evaluación y seguimiento clínico de cicatrización',
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v20" />
        <path d="M2 12h20" />
        <rect x="4" y="4" width="16" height="16" rx="4" />
      </svg>
    ),
  },
]

export default function ServicesAndProfessionals() {
  const [professionals, setProfessionals] = useState(defaultProfessionals)
  const [selectedService, setSelectedService] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const carouselTrackRef = useRef(null)

  // Cargar datos dinámicos desde Supabase / LocalStorage
  useEffect(() => {
    let isMounted = true
    const loadPros = async () => {
      try {
        const res = await professionalsService.getProfessionals()
        if (isMounted && res.data) {
          setProfessionals(res.data)
        }
      } catch (err) {
        console.error('Error cargando profesionales:', err)
      }
    }
    loadPros()

    const unsubscribe = professionalsService.onProfessionalsChange((updated) => {
      if (isMounted && updated) {
        setProfessionals(updated)
      } else {
        loadPros()
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  // Filtrado de profesionales activos según el servicio seleccionado y el texto de búsqueda
  const filteredProfessionals = useMemo(() => {
    return professionals
      .filter((pro) => pro.status !== 'inactive')
      .filter((pro) => {
        const matchesService =
          selectedService === 'all' || pro.serviceId === selectedService

        const query = searchTerm.toLowerCase().trim()
        const matchesSearch =
          !query ||
          pro.name?.toLowerCase().includes(query) ||
          pro.specialty?.toLowerCase().includes(query) ||
          pro.serviceName?.toLowerCase().includes(query) ||
          pro.address?.toLowerCase().includes(query) ||
          pro.bio?.toLowerCase().includes(query)

        return matchesService && matchesSearch
      })
  }, [professionals, selectedService, searchTerm])

  // Reiniciar el índice si la lista filtrada cambia y el índice queda fuera de rango
  useEffect(() => {
    setCurrentIndex(0)
    if (carouselTrackRef.current) {
      carouselTrackRef.current.scrollTo({ left: 0, behavior: 'smooth' })
    }
  }, [selectedService, searchTerm])

  // Desplazamiento del carrusel
  const scrollToIndex = (index) => {
    if (!carouselTrackRef.current) return
    const container = carouselTrackRef.current
    const cards = container.querySelectorAll('.pro-card')
    if (cards[index]) {
      const cardLeft = cards[index].offsetLeft - container.offsetLeft
      container.scrollTo({ left: cardLeft, behavior: 'smooth' })
      setCurrentIndex(index)
    }
  }

  const handlePrev = () => {
    const nextIdx = currentIndex > 0 ? currentIndex - 1 : Math.max(0, filteredProfessionals.length - 1)
    scrollToIndex(nextIdx)
  }

  const handleNext = () => {
    const nextIdx = currentIndex < filteredProfessionals.length - 1 ? currentIndex + 1 : 0
    scrollToIndex(nextIdx)
  }

  // Generador de enlace directo a WhatsApp con mensaje contextualizado
  const buildWhatsAppLink = (pro) => {
    const message = `Hola ${pro.name}, me comunico a través de Visalud para consultar sobre su servicio de ${pro.serviceName}. ¿Tiene disponibilidad para una cita?`
    return `https://wa.me/${pro.whatsapp}?text=${encodeURIComponent(message)}`
  }

  // Servicio activo actual para mostrar detalles en la cabecera del carrusel
  const currentServiceObj = servicesData.find((s) => s.id === selectedService) || servicesData[0]

  return (
    <section className="services-pro-section" id="servicios" aria-labelledby="services-pro-title">
      {/* Anchor point para el enlace de menú #profesionales */}
      <div id="profesionales" className="section-anchor" tabIndex={-1} aria-hidden="true" />

      <div className="services-pro-container">
        {/* Cabecera Principal */}
        <header className="services-pro-header">
          <div className="services-pro-badge">
            <span className="services-pro-badge-dot" />
            <span>Servicios Clínicos & Acompañamiento Domiciliario</span>
          </div>
          <h2 id="services-pro-title" className="services-pro-title">
            Encuentra al profesional indicado para tus cuidados
          </h2>
          <p className="services-pro-subtitle">
            Selecciona el servicio que necesitas: <strong>Cuidados de adulto mayor</strong>, <strong>Inyecciones</strong> o <strong>Curaciones de heridas</strong>.
            Comunícate de forma inmediata por <strong>WhatsApp</strong> o llamada directa para coordinar la atención a domicilio o en clínica.
          </p>
        </header>

        {/* Barra de Búsqueda Rápida */}
        <div className="pro-search-bar-wrapper">
          <div className="pro-search-input-box">
            <span className="pro-search-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="pro-search-input"
              placeholder="Buscar por especialista, servicio (ej: Adulto mayor, inyecciones, curaciones) o sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar profesional por nombre o servicio"
            />
            {searchTerm && (
              <button
                type="button"
                className="pro-search-clear-btn"
                onClick={() => setSearchTerm('')}
                aria-label="Borrar búsqueda"
                title="Borrar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Pestañas / Chips de Selección de Servicios */}
        <div className="services-filter-nav" role="tablist" aria-label="Especialidades y Servicios Médicos">
          <div className="services-filter-track">
            {servicesData.map((service) => {
              const activePros = professionals.filter((p) => p.status !== 'inactive')
              const count = service.id === 'all'
                ? activePros.length
                : activePros.filter((p) => p.serviceId === service.id).length
              const isActive = selectedService === service.id

              return (
                <button
                  key={service.id}
                  role="tab"
                  aria-selected={isActive}
                  className={`service-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedService(service.id)}
                  type="button"
                >
                  <span className="service-tab-icon" aria-hidden="true">
                    {service.icon}
                  </span>
                  <span className="service-tab-label">{service.shortName}</span>
                  <span className="service-tab-count" aria-label={`${count} profesionales`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Layout en 2 Columnas: Box de Descripción del Servicio a la Izquierda y Tarjetas a la Derecha */}
        <div className="services-showcase-split">
          {/* Columna Izquierda: Panel Moderno del Servicio Activo */}
          <aside className="service-desc-card">
            <div className="service-desc-card-glow" aria-hidden="true" />

            <div className="service-desc-header">
              <div className="service-desc-icon-bubble" aria-hidden="true">
                {currentServiceObj.icon}
              </div>
              <div className="service-desc-badge-wrap">
                <span className="service-desc-badge">
                  <span className="service-desc-badge-dot" />
                  {currentServiceObj.badge}
                </span>
              </div>
            </div>

            <h3 className="service-desc-title">{currentServiceObj.title}</h3>
            <p className="service-desc-text">{currentServiceObj.description}</p>

            {/* Lista de Beneficios y Garantías */}
            {currentServiceObj.features && (
              <div className="service-desc-features">
                <span className="service-desc-features-label">Garantías & Modalidad:</span>
                <ul className="service-desc-features-list">
                  {currentServiceObj.features.map((feature, idx) => (
                    <li key={idx} className="service-desc-feature-item">
                      <span className="feature-check-icon" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Disponibilidad y Contador */}
            <div className="service-desc-availability-box">
              <div className="availability-status-row">
                <span className="availability-live-dot" />
                <span className="availability-status-title">Atención en Osorno y Alrededores</span>
              </div>
              <div className="availability-count-badge">
                {filteredProfessionals.length === 1
                  ? '1 especialista disponible'
                  : `${filteredProfessionals.length} especialistas disponibles`}
              </div>
            </div>

            {/* Llamado de Orientación para Familias */}
            <div className="service-desc-cta">
              <a href="#contacto" className="btn-service-coord">
                <span>¿Dudas? Asesoría para tu familiar</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <p className="service-desc-note">
                Te orientamos con cariño y sin compromiso para elegir al profesional más adecuado.
              </p>
            </div>
          </aside>

          {/* Columna Derecha: Tarjetas de los Profesionales */}
          <div className="services-cards-area">
            {filteredProfessionals.length > 0 ? (
              <div className="pro-carousel-viewport">
                {/* Cabecera de control sobre las tarjetas */}
                <div className="cards-slider-header">
                  <div className="cards-slider-info">
                    <span className="cards-slider-badge">Equipo Especialista</span>
                    <span className="cards-slider-counter">
                      Mostrando <strong>{currentIndex + 1}</strong> de {filteredProfessionals.length}
                    </span>
                  </div>
                  <div className="cards-slider-nav-btns">
                    <button
                      type="button"
                      className="cards-slider-btn prev-btn"
                      onClick={handlePrev}
                      aria-label="Ver profesional anterior"
                      title="Anterior"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="cards-slider-btn next-btn"
                      onClick={handleNext}
                      aria-label="Ver profesional siguiente"
                      title="Siguiente"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Flechas Flotantes Superpuestas en las Tarjetas para Fácil Desplazamiento */}
                <button
                  type="button"
                  className="pro-floating-arrow prev"
                  onClick={handlePrev}
                  aria-label="Deslizar al profesional anterior"
                  title="Anterior"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="pro-floating-arrow next"
                  onClick={handleNext}
                  aria-label="Deslizar al profesional siguiente"
                  title="Siguiente"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>

                <div
                  className="pro-carousel-track"
                  ref={carouselTrackRef}
                  onScroll={() => {
                    if (!carouselTrackRef.current) return
                    const container = carouselTrackRef.current
                    const cards = container.querySelectorAll('.pro-card')
                    if (!cards.length) return
                    // Calcular el índice activo basado en el scroll actual
                    const scrollPos = container.scrollLeft
                    let closestIdx = 0
                    let minDiff = Infinity
                    cards.forEach((card, idx) => {
                      const cardLeft = card.offsetLeft - container.offsetLeft
                      const diff = Math.abs(cardLeft - scrollPos)
                      if (diff < minDiff) {
                        minDiff = diff
                        closestIdx = idx
                      }
                    })
                    setCurrentIndex(closestIdx)
                  }}
                >
                  {filteredProfessionals.map((pro, i) => (
                    <article
                      key={pro.id}
                      className={`pro-card ${i === currentIndex ? 'card-focused' : ''}`}
                      aria-label={`Ficha de ${pro.name}`}
                    >
                      {/* Imagen y badges */}
                      <div className="pro-card-image-wrap">
                        <img
                          src={pro.image}
                          alt={`Retrato profesional de ${pro.name}`}
                          className="pro-card-photo"
                          loading="lazy"
                        />
                        <div className="pro-card-gradient" />
                        <span className="pro-card-status-pill">
                          <span className="pro-card-status-dot" />
                          <span>Agenda Abierta</span>
                        </span>
                        <span className="pro-card-service-chip">
                          {pro.serviceName}
                        </span>
                      </div>

                      {/* Cuerpo de la Tarjeta */}
                      <div className="pro-card-body">
                        <div className="pro-card-header-info">
                          <h4 className="pro-card-name">{pro.name}</h4>
                          <p className="pro-card-specialty">{pro.specialty}</p>
                          <div className="pro-card-reg-wrap">
                            <span className="pro-card-reg">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                                <path d="m9 12 2 2 4-4"/>
                              </svg>
                              <span>{pro.regNumber}</span>
                            </span>
                            <span className="pro-card-verified-tag">Habilitado SIS</span>
                          </div>
                        </div>

                        <p className="pro-card-bio">{pro.bio}</p>

                        {/* Información de Contacto y Modalidad */}
                        <div className="pro-card-details-list">
                          {/* Lugar de Atención */}
                          <div className="pro-detail-item">
                            <span className="pro-detail-icon location-icon" aria-hidden="true">
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                            </span>
                            <div className="pro-detail-content">
                              <span className="pro-detail-label">Lugar de Atención:</span>
                              <span className="pro-detail-value">{pro.address}</span>
                            </div>
                          </div>

                          {/* Horario y Modalidad */}
                          <div className="pro-detail-item">
                            <span className="pro-detail-icon clock-icon" aria-hidden="true">
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                            </span>
                            <div className="pro-detail-content">
                              <span className="pro-detail-label">Horario & Modalidad:</span>
                              <span className="pro-detail-value">{pro.attention} • <strong className="pro-modality-highlight">{pro.modality}</strong></span>
                            </div>
                          </div>

                          {/* Teléfono / Celular */}
                          <div className="pro-detail-item">
                            <span className="pro-detail-icon phone-icon" aria-hidden="true">
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                              </svg>
                            </span>
                            <div className="pro-detail-content">
                              <span className="pro-detail-label">Teléfono directo:</span>
                              <a
                                href={`tel:${pro.phone.replace(/\s+/g, '')}`}
                                className="pro-phone-link"
                                title={`Llamar a ${pro.name}`}
                              >
                                {pro.phone}
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Previsión / Convenio */}
                        <div className="pro-card-convenios-strip">
                          <span className="convenios-badge">{pro.convenios}</span>
                        </div>

                        {/* Acciones de Contacto: WhatsApp Moderno & Llamada Directa */}
                        <div className="pro-card-actions">
                          <a
                            href={buildWhatsAppLink(pro)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-whatsapp-modern"
                            aria-label={`Contactar a ${pro.name} por WhatsApp`}
                          >
                            <span className="whatsapp-icon-circle" aria-hidden="true">
                              <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.299.144.347.491 1.2.535 1.288.043.088.072.19.014.305-.058.115-.087.187-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.42-.099.825zm-3.4-10.416c-4.408 0-7.986 3.578-7.987 7.987 0 1.409.366 2.784 1.062 3.99l-1.131 4.131 4.225-1.108c1.164.635 2.476.974 3.827.975h.004c4.408 0 7.987-3.58 7.988-7.988 0-2.136-.831-4.145-2.344-5.655-1.514-1.512-3.52-2.342-5.644-2.342z" />
                              </svg>
                            </span>
                            <span className="whatsapp-text-box">
                              <span className="whatsapp-btn-sub">Escribir directo</span>
                              <span className="whatsapp-btn-main">Contactar por WhatsApp</span>
                            </span>
                          </a>

                          <a
                            href={`tel:${pro.phone.replace(/\s+/g, '')}`}
                            className="btn-call-quick"
                            title={`Llamar ahora a ${pro.name}`}
                            aria-label={`Llamar a ${pro.name}`}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            <span className="btn-call-label">Llamar</span>
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Puntos de Indicación (Dots) */}
                <div className="pro-carousel-dots" aria-hidden="true">
                  {filteredProfessionals.map((item, idx) => (
                    <button
                      key={item.id}
                      className={`pro-carousel-dot ${idx === currentIndex ? 'active' : ''}`}
                      type="button"
                      aria-label={`Ir al profesional ${idx + 1}`}
                      onClick={() => scrollToIndex(idx)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* Estado Vacío cuando la búsqueda no arroja resultados */
              <div className="pro-empty-state">
                <div className="pro-empty-icon" aria-hidden="true">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
                <h4 className="pro-empty-title">No encontramos profesionales para "{searchTerm}"</h4>
                <p className="pro-empty-text">
                  Intenta buscando con otra palabra clave o selecciona "Todos los servicios" para explorar el equipo completo.
                </p>
                <button
                  type="button"
                  className="pro-empty-reset-btn"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedService('all')
                  }}
                >
                  Restablecer búsqueda y filtros
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer informativo de la sección */}
        <div className="services-pro-footer-note">
          <div className="footer-note-content">
            <span className="footer-note-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>
            <p>
              Todos los profesionales de la red Visalud se encuentran registrados y habilitados ante la
              Superintendencia de Salud de Chile. Puedes coordinar tu consulta directamente o contactar a nuestra mesa central.
            </p>
          </div>
          <a href="#contacto" className="footer-note-link">
            ¿Dudas para elegir? Asesórate con nosotros →
          </a>
        </div>
      </div>
    </section>
  )
}
