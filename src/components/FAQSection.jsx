import { useState, useMemo } from 'react'
import './FAQSection.css'

const FAQ_DATA = [
  {
    id: 1,
    category: 'servicio',
    question: '¿Cómo funciona Visalud y qué rol cumple la plataforma?',
    answer:
      'En **Visalud Osorno** somos el puente directo y confiable entre familias y **Técnicos en Enfermería de Nivel Superior (TENS)** certificados. Puedes revisar los perfiles de los profesionales y coordinar directamente con ellos, o bien solicitar nuestro servicio de **Coordinación Delegada**, donde la administración de Visalud organiza el calendario, supervisa la asistencia y cubre los reemplazos por ti.',
  },
  {
    id: 2,
    category: 'pagos',
    question: '¿Las atenciones se pueden pagar o reembolsar con Fonasa, Isapre o bonos?',
    answer:
      'El servicio de acompañamiento y cuidados de adulto mayor por horas es **100% particular y de trato directo**. No opera con bonos Fonasa ni Isapre. Esto permite una contratación ágil, sin burocracia ni listas de espera. El pago se acuerda directamente con el TENS (o con la administración de Visalud en caso de servicio coordinado) mediante **transferencia bancaria o efectivo**.',
  },
  {
    id: 3,
    category: 'seguridad',
    question: '¿Los cuidadores son profesionales acreditados ante la Superintendencia de Salud?',
    answer:
      '**Sí, en un 100%.** Todo el personal médico y técnico publicado en nuestro catálogo cuenta con su título de Técnico en Enfermería de Nivel Superior (TENS) validado y su **número de registro oficial vigente en el Registro Nacional de Prestadores Individuales de la Superintendencia de Salud (SIS)** de Chile. Puedes verificar el número de registro directamente en el perfil de cada profesional.',
  },
  {
    id: 4,
    category: 'turnos',
    question: '¿Cuáles son las modalidades y horarios de los turnos disponibles?',
    answer:
      'Ofrecemos flexibilidad total según la rutina de cada hogar:\n• **Medio Turno (6 horas):** Recomendado para higiene y confort, administración puntual de medicamentos y estimulación matutina o vespertina.\n• **Turno Completo (12 horas diurno):** Cuidado integral durante toda la jornada para personas con dependencia severa o postradas.\n• **Vigilia Nocturna (12 horas nocturno):** Supervisión activa durante la noche (ej. 20:00 a 08:00) para evitar caídas o desorientación y permitir el descanso de la familia.\n• **Régimen 24/7 o continuo:** Cobertura de turnos rotativos coordinados.',
  },
  {
    id: 5,
    category: 'servicio',
    question: '¿Qué sectores de Osorno y alrededores tienen cobertura domiciliaria?',
    answer:
      'Atendemos en todo el radio urbano de **Osorno**: Centro, Rahue Alto y Bajo, Francke, Ovejería, Kolbe, Pilauco, Las Quemas, Bellavista, entre otros. Para sectores rurales aledaños o comunas cercanas (como Río Negro, San Pablo o Puyehue), se evalúa la disponibilidad y el traslado directamente con la coordinación.',
  },
  {
    id: 6,
    category: 'seguridad',
    question: '¿Qué implementos o insumos clínicos debemos tener en el hogar?',
    answer:
      'La familia debe proporcionar los insumos de aseo y cuidado específicos de su paciente: guantes de procedimiento de su talla, pañales o protectores de cama, cremas regeneradoras o barrera, y los medicamentos recetados por su médico. Previo a iniciar el primer turno, la TENS o nuestra coordinación te entregará una lista sugerida para que todo esté listo.',
  },
  {
    id: 7,
    category: 'turnos',
    question: '¿Qué ocurre si el cuidador asignado tiene una emergencia o licencia médica?',
    answer:
      'Si cuentas con nuestro servicio de **Coordinación Delegada de Turnos**, Visalud se encarga de activar de forma inmediata a un TENS de reemplazo de nuestro equipo verificado. De esta forma, garantizamos que tu familiar nunca quede solo ni sufra interrupciones en su cuidado diario.',
  },
]

const CATEGORIES = [
  { id: 'all', label: 'Todas las preguntas' },
  { id: 'turnos', label: '⏱️ Turnos y Horarios' },
  { id: 'pagos', label: '💳 Pagos y Trato Directo' },
  { id: 'seguridad', label: '🛡️ Seguridad y Registro SIS' },
  { id: 'servicio', label: '📍 Cobertura y Servicio' },
]

export default function FAQSection() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [openIds, setOpenIds] = useState(new Set([1])) // Primera pregunta abierta por defecto
  const [searchTerm, setSearchTerm] = useState('')

  const toggleAccordion = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory
      const matchSearch =
        searchTerm.trim() === '' ||
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [selectedCategory, searchTerm])

  return (
    <section id="faq" className="faq-section">
      <div className="faq-container">
        {/* Encabezado */}
        <div className="faq-header">
          <div className="faq-badge">
            <span className="faq-badge-dot" />
            <span>Respuestas Claras & Transparentes</span>
          </div>

          <h2 className="faq-title">
            Preguntas Frecuentes <span className="text-gradient">sobre el cuidado a domicilio</span>
          </h2>

          <p className="faq-lead">
            Resolvemos las dudas más habituales sobre turnos, pagos particulares, registro SIS y coordinación en Osorno.
          </p>

          {/* Buscador de preguntas */}
          <div className="faq-search-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar en preguntas frecuentes (ej. Fonasa, SIS, turnos, sectores)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="faq-search-input"
              aria-label="Buscar en preguntas frecuentes"
            />
            {searchTerm && (
              <button
                type="button"
                className="faq-search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="Borrar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtros por Categoría */}
          <div className="faq-categories-pills" role="tablist">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat.id}
                className={`faq-cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Acordeones */}
        <div className="faq-accordion-list">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openIds.has(faq.id)
              return (
                <div key={faq.id} className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="faq-trigger"
                    onClick={() => toggleAccordion(faq.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="faq-question-text">{faq.question}</span>
                    <span className="faq-icon" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </button>

                  <div className="faq-panel">
                    <div className="faq-answer-content">
                      {faq.answer.split('\n').map((par, idx) => (
                        <p key={idx}>
                          {par.startsWith('• ') ? (
                            <span className="faq-bullet">{par}</span>
                          ) : (
                            par.replace(/\*\*(.*?)\*\*/g, '$1') // Render simple or formatted
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="faq-empty-state">
              <p>No encontramos preguntas que coincidan con "<strong>{searchTerm}</strong>".</p>
              <button
                type="button"
                className="btn-faq-reset"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                }}
              >
                Ver todas las preguntas
              </button>
            </div>
          )}
        </div>

        {/* Pie de FAQ con enlace a WhatsApp */}
        <div className="faq-footer-support">
          <div className="faq-support-card">
            <div className="faq-support-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="faq-support-text">
              <h4>¿Tienes otra pregunta sobre el cuidado de tu familiar?</h4>
              <p>Escríbenos directamente por WhatsApp y la Coordinación de Visalud te orientará en pocos minutos.</p>
            </div>
            <a
              href="https://wa.me/56968016334?text=Hola%20Visalud,%20tengo%20una%20consulta%20espec%C3%ADfica%20sobre%20los%20servicios%20de%20cuidado%20en%20Osorno"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-faq-wa"
            >
              <span>Escribir por WhatsApp</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
