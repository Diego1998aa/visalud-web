import { useState, useMemo, useRef, useEffect } from 'react'
import { professionalsService } from '../services/professionalsService.js'
import { defaultProfessionals } from '../data/defaultProfessionals.js'

// Número oficial de la dueña / administración para coordinación delegada
const COORDINATION_WHATSAPP = '56968016334'

const servicesData = [
  {
    id: 'all',
    title: 'Todos los TENS de Cuidado Mayor',
    shortName: 'Todos los TENS',
    badge: 'Directorio Verificado',
    description: 'Encuentra y contacta de forma directa a Técnicos en Enfermería de Nivel Superior (TENS) en Osorno, especializados en la atención y compañía de personas mayores.',
    features: [
      'Técnicos certificados ante la Superintendencia de Salud (SIS)',
      'Modalidades flexibles: Medio turno (6 hrs) y Turno completo (12 hrs)',
      'Puente directo: Coordinación y pago 100% directo con el profesional',
      'Atención 100% particular y directa (sin Fonasa, Isapre ni bonos)',
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
    id: 'medio-turno',
    title: 'Medio Turno (6 Horas)',
    shortName: 'Medio Turno (6 hrs)',
    badge: 'Rutinas & Acompañamiento',
    description: 'Ideal para apoyo diurno o vespertino: asistencia en el despertar, baño y confort, administración puntual de fármacos, preparación o asistencia en comidas y estimulación.',
    features: [
      '6 horas continuas de cuidado y compañía a domicilio',
      'Asistencia dedicada en aseo personal, baño y vestimenta',
      'Administración de medicamentos según indicación médica',
      'Paseos asistidos, estimulación cognitiva y comunicación familiar',
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: 'turno-completo',
    title: 'Turno Completo (12 Horas)',
    shortName: 'Turno Completo (12 hrs)',
    badge: 'Cuidado Integral Continuo',
    description: 'Atención integral durante toda la jornada diurna (ej. 08:00 a 20:00). Diseñado para personas mayores semivalentes o de alta dependencia que requieren resguardo constante.',
    features: [
      '12 horas continuas de asistencia clínica y humana',
      'Control riguroso de signos vitales (presión, glicemia, oximetría)',
      'Movilización en cama y prevención activa de úlceras por presión',
      'Alimentación asistida, hidratación y soporte en actividades diarias',
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
    ),
  },
  {
    id: 'noche-vigilia',
    title: 'Vigilia Nocturna (12 Horas)',
    shortName: 'Vigilia Nocturna',
    badge: 'Tranquilidad Familiar',
    description: 'Supervisión activa durante toda la noche (ej. 20:00 a 08:00) para garantizar el descanso seguro del paciente y el alivio reparador de los familiares a cargo.',
    features: [
      '12 horas de vigilia activa y supervisión del descanso',
      'Cambios de postura programados para pacientes postrados',
      'Asistencia en idas al baño y manejo de incontinencia nocturna',
      'Respuesta inmediata ante desorientación, caídas o emergencias',
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    ),
  },
  {
    id: 'coordinacion',
    title: 'Gestión y Coordinación de Turnos',
    shortName: 'Coordinación Visalud',
    badge: 'Servicio Delegado',
    description: '¿No tienes tiempo para coordinar turnos diarios con los cuidadores? La administración de Visalud organiza el calendario, cubre reemplazos y supervisa la atención continua.',
    features: [
      'Coordinación de semanas completas o régimen 24/7 continuo',
      'Reemplazos garantizados ante licencias o imprevistos de un TENS',
      'Supervisión y control de asistencia por la coordinación de Visalud',
      'Ideal para familias con horarios exigentes o viviendo fuera de Osorno',
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
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

  // Filtrado de profesionales según el turno/servicio seleccionado y texto de búsqueda
  const filteredProfessionals = useMemo(() => {
    return professionals
      .filter((pro) => pro.status !== 'inactive')
      .filter((pro) => {
        // Filtrar por modalidad de turno
        let matchesService = true
        if (selectedService === 'medio-turno') {
          matchesService = pro.turnos?.includes('medio-turno') || pro.attention?.toLowerCase().includes('medio') || pro.attention?.toLowerCase().includes('6')
        } else if (selectedService === 'turno-completo') {
          matchesService = pro.turnos?.includes('turno-completo') || pro.attention?.toLowerCase().includes('12') || pro.attention?.toLowerCase().includes('completo')
        } else if (selectedService === 'noche-vigilia') {
          matchesService = pro.turnos?.includes('noche-vigilia') || pro.specialty?.toLowerCase().includes('vigilia') || pro.attention?.toLowerCase().includes('nocturno') || pro.attention?.toLowerCase().includes('noche')
        } else if (selectedService === 'coordinacion') {
          // En modo coordinación mostramos todos para que conozcan al equipo que se coordina
          matchesService = true
        }

        const query = searchTerm.toLowerCase().trim()
        const matchesSearch =
          !query ||
          pro.name?.toLowerCase().includes(query) ||
          pro.specialty?.toLowerCase().includes(query) ||
          pro.address?.toLowerCase().includes(query) ||
          pro.bio?.toLowerCase().includes(query)

        return matchesService && matchesSearch
      })
  }, [professionals, selectedService, searchTerm])

  // Reiniciar el índice si la lista filtrada cambia
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

  // Generador de enlace directo a WhatsApp con mensaje contextualizado para TENS
  const buildWhatsAppLink = (pro) => {
    let modalidadTexto = 'un turno de cuidado'
    if (selectedService === 'medio-turno') modalidadTexto = 'medio turno (6 horas)'
    else if (selectedService === 'turno-completo') modalidadTexto = 'turno completo (12 horas)'
    else if (selectedService === 'noche-vigilia') modalidadTexto = 'turno de vigilia nocturna (12 horas)'

    const message = `Hola ${pro.name}, te contacto desde Visalud para consultar tu disponibilidad para el cuidado de un adulto mayor a domicilio por ${modalidadTexto} en Osorno. ¿Podemos coordinar?`
    return `https://wa.me/${pro.whatsapp}?text=${encodeURIComponent(message)}`
  }

  // Enlace directo a la Administración para coordinar turnos
  const buildCoordinationWhatsAppLink = () => {
    const message = `Hola, me comunico desde la página de Visalud Osorno. Necesito solicitar información sobre el Servicio de Coordinación y Gestión Integral de Turnos para mi familiar.`
    return `https://wa.me/${COORDINATION_WHATSAPP}?text=${encodeURIComponent(message)}`
  }

  const currentServiceObj = servicesData.find((s) => s.id === selectedService) || servicesData[0]

  return (
    <section className="services-pro-section" id="servicios" aria-labelledby="services-pro-title">
      {/* Anchor point para el enlace de menú #profesionales */}
      <div id="profesionales" className="section-anchor" tabIndex={-1} aria-hidden="true" />

      <div className="services-pro-container">
        {/* Cabecera Principal de la Sección de Cuidado del Adulto Mayor */}
        <header className="services-pro-header">
          <div className="services-pro-badge">
            <span className="services-pro-badge-dot" />
            <span>Atención Especializada • Cuidado del Adulto Mayor en Osorno</span>
          </div>
          <h2 id="services-pro-title" className="services-pro-title">
            Cuidado Domiciliario de Adulto Mayor por TENS Certificados
          </h2>
          <p className="services-pro-subtitle">
            En <strong>Visalud</strong> somos un puente directo y transparente entre tu familia y <strong>Técnicos en Enfermería (TENS)</strong> de absoluta confianza.
            Contrata directamente por horas: <strong>Medio Turno (6 hrs)</strong> o <strong>Turno Completo (12 hrs)</strong>.
          </p>
        </header>

        {/* ================= BLOQUE DE TRANSPARENCIA: CÓMO FUNCIONA VISALUD ================= */}
        <div className="bridge-explainer-banner">
          <div className="bridge-explainer-header">
            <span className="bridge-badge">Modelo Directo & Transparente</span>
            <h3 className="bridge-title">¿Cómo funciona la contratación en Visalud?</h3>
            <p className="bridge-subtitle">
              Sin cobros de suscripción ni burocracia. La página te conecta de forma directa con los profesionales técnicos.
            </p>
          </div>

          <div className="bridge-steps-grid">
            <div className="bridge-step-card">
              <div className="bridge-step-num">1</div>
              <div className="bridge-step-body">
                <h4>Revisa los perfiles TENS</h4>
                <p>Elige al profesional según su experiencia geriátrica, sector de cobertura en Osorno y modalidad de turno requerida (6h o 12h).</p>
              </div>
            </div>

            <div className="bridge-step-card">
              <div className="bridge-step-num">2</div>
              <div className="bridge-step-body">
                <h4>Coordina directo por WhatsApp</h4>
                <p>Habla directamente con el TENS para coordinar los días, horarios y requerimientos de salud específicos de tu familiar.</p>
              </div>
            </div>

            <div className="bridge-step-card">
              <div className="bridge-step-num">3</div>
              <div className="bridge-step-body">
                <h4>Servicio particular y pago directo</h4>
                <p>Sin Fonasa, Isapre ni bonos. El servicio es de trato directo y particular: los turnos y el pago (transferencia o efectivo) se acuerdan y pagan directamente al profesional.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Búsqueda Rápida de TENS */}
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
              placeholder="Buscar TENS por nombre, sector en Osorno (ej: Rahue, Oriente, Francke) o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar TENS por nombre o sector"
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

        {/* Pestañas / Chips de Selección de Modalidad de Turno */}
        <div className="services-filter-nav" role="tablist" aria-label="Modalidades de Turnos de Cuidado">
          <div className="services-filter-track">
            {servicesData.map((service) => {
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
                </button>
              )
            })}
          </div>
        </div>

        {/* Layout en 2 Columnas: Panel Informativo de la Modalidad y Carrusel de TENS */}
        <div className="services-showcase-split">
          {/* Columna Izquierda: Panel Moderno de la Modalidad Activa */}
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

            {/* Lista de Beneficios y Alcances de la Modalidad */}
            {currentServiceObj.features && (
              <div className="service-desc-features">
                <span className="service-desc-features-label">Alcance del Cuidado a Domicilio:</span>
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

            {/* Estado de Disponibilidad */}
            <div className="service-desc-availability-box">
              <div className="availability-status-row">
                <span className="availability-live-dot" />
                <span className="availability-status-title">Servicio Domiciliario en Osorno</span>
              </div>
              <div className="availability-count-badge">
                {filteredProfessionals.length === 1
                  ? '1 TENS disponible'
                  : `${filteredProfessionals.length} TENS disponibles`}
              </div>
            </div>

            {/* Llamado a la Coordinación Integral (Dueña) */}
            <div className="service-desc-cta">
              <a
                href={buildCoordinationWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-service-coord btn-service-coord-whatsapp"
              >
                <span className="btn-coord-wa-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </span>
                <span>Coordinar Turnos por WhatsApp</span>
              </a>
              <p className="service-desc-note">
                Si no deseas encargarte de coordinar turnos individuales, la administración de Visalud puede coordinar la cobertura completa de tu familiar.
              </p>
            </div>
          </aside>

          {/* Columna Derecha: Tarjetas de los Profesionales TENS */}
          <div className="services-cards-area">
            {/* Si la pestaña seleccionada es 'coordinacion', mostramos un panel explicativo destacado */}
            {selectedService === 'coordinacion' && (
              <div className="coordination-feature-box">
                <div className="coord-box-badge">Servicio de Coordinación Delegada</div>
                <h4 className="coord-box-title">Tranquilidad absoluta para tu familia</h4>
                <p className="coord-box-desc">
                  Cuando un familiar requiere turnos continuos (varios días a la semana o régimen 24/7), lidiar con calendarios, imprevistos o reemplazos puede ser agotador.
                  Con nuestro <strong>Servicio de Coordinación Integral</strong>, la administración de Visalud asume la responsabilidad de armar la nómina de TENS, supervisar el cumplimiento de turnos y garantizar reemplazos inmediatos.
                </p>
                <div className="coord-box-actions">
                  <a
                    href={buildCoordinationWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp-modern coord-cta-btn"
                  >
                    <span className="whatsapp-icon-circle" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </span>
                    <span className="whatsapp-text-box">
                      <span className="whatsapp-btn-sub">Mesa Central Visalud</span>
                      <span className="whatsapp-btn-main">Hablar con Coordinación de Turnos</span>
                    </span>
                  </a>
                </div>
              </div>
            )}

            {filteredProfessionals.length > 0 ? (
              <div className="pro-carousel-viewport">
                {/* Cabecera de control sobre las tarjetas */}
                <div className="cards-slider-header">
                  <div className="cards-slider-info">
                    <span className="cards-slider-badge">TENS Geriátricos Habilitados</span>
                    <span className="cards-slider-counter">
                      Mostrando <strong>{currentIndex + 1}</strong> de {filteredProfessionals.length}
                    </span>
                  </div>
                  <div className="cards-slider-nav-btns">
                    <button
                      type="button"
                      className="cards-slider-btn prev-btn"
                      onClick={handlePrev}
                      aria-label="Ver TENS anterior"
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
                      aria-label="Ver TENS siguiente"
                      title="Siguiente"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Flechas Flotantes Superpuestas en las Tarjetas */}
                <button
                  type="button"
                  className="pro-floating-arrow prev"
                  onClick={handlePrev}
                  aria-label="Deslizar al TENS anterior"
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
                  aria-label="Deslizar al TENS siguiente"
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
                          <span>Turnos Disponibles</span>
                        </span>
                        <span className="pro-card-service-chip">
                          TENS Adulto Mayor
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
                            <span className="pro-card-verified-tag">Superintendencia SIS</span>
                          </div>
                        </div>

                        <p className="pro-card-bio">{pro.bio}</p>

                        {/* Información de Contacto, Turnos y Modalidad */}
                        <div className="pro-card-details-list">
                          {/* Lugar / Cobertura en Osorno */}
                          <div className="pro-detail-item">
                            <span className="pro-detail-icon location-icon" aria-hidden="true">
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                            </span>
                            <div className="pro-detail-content">
                              <span className="pro-detail-label">Sectores de atención:</span>
                              <span className="pro-detail-value">{pro.address}</span>
                            </div>
                          </div>

                          {/* Modalidad de Turnos */}
                          <div className="pro-detail-item">
                            <span className="pro-detail-icon clock-icon" aria-hidden="true">
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                            </span>
                            <div className="pro-detail-content">
                              <span className="pro-detail-label">Turnos disponibles:</span>
                              <span className="pro-detail-value">{pro.attention}</span>
                            </div>
                          </div>

                          {/* Teléfono directo */}
                          <div className="pro-detail-item">
                            <span className="pro-detail-icon phone-icon" aria-hidden="true">
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                              </svg>
                            </span>
                            <div className="pro-detail-content">
                              <span className="pro-detail-label">Contacto directo:</span>
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

                        {/* Previsión / Convenio - Transparencia Particular */}
                        <div className="pro-card-convenios-strip">
                          <span className="convenios-badge convenios-particular-badge">
                            {pro.convenios || 'Particular (Pago directo: transferencia o efectivo)'}
                          </span>
                        </div>

                        {/* Acciones de Contacto: WhatsApp Directo al TENS & Llamada */}
                        <div className="pro-card-actions">
                          <a
                            href={buildWhatsAppLink(pro)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-whatsapp-modern"
                            aria-label={`Contactar a ${pro.name} por WhatsApp`}
                          >
                            <span className="whatsapp-icon-circle" aria-hidden="true">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
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
                      aria-label={`Ir al TENS ${idx + 1}`}
                      onClick={() => scrollToIndex(idx)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* Estado Vacío */
              <div className="pro-empty-state">
                <div className="pro-empty-icon" aria-hidden="true">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
                <h4 className="pro-empty-title">No encontramos profesionales TENS para "{searchTerm}"</h4>
                <p className="pro-empty-text">
                  Intenta buscando por sector (ej: Rahue, Oriente, Centro) o restablece los filtros para ver todos los cuidadores disponibles.
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
              Todos los TENS de la red Visalud se encuentran registrados ante la
              Superintendencia de Salud de Chile. El acuerdo de horas y pagos es particular y directo con cada técnico.
            </p>
          </div>
          <a
            href={buildCoordinationWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-note-link footer-note-whatsapp-link"
          >
            <span className="footer-note-wa-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </span>
            <span>¿Necesitas coordinación delegada de turnos? Escríbenos a WhatsApp aquí →</span>
          </a>

        </div>
      </div>
    </section>
  )
}

