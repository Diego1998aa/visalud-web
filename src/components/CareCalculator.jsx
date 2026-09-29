import { useState, useMemo } from 'react'
import { leadsService } from '../services/leadsService.js'
import './CareCalculator.css'

const SHIFT_OPTIONS = [
  {
    id: 'medio-turno',
    title: 'Medio Turno (6 Horas)',
    badge: 'Apoyo Diurno o Tarde',
    icon: '☀️',
    desc: 'Asistencia en rutinas de mañana (levantarse, aseo y confort, almuerzo) o tarde (cena y descanso).',
    hours: 6,
    integrityTip: 'Ideal si la familia puede apoyar durante una parte del día y necesita respaldo para el aseo, baño y fármacos.'
  },
  {
    id: 'turno-completo',
    title: 'Turno Completo (12 Horas)',
    badge: 'Resguardo Continuo',
    icon: '🌕',
    desc: 'Cuidado integral diurno (ej. 08:00 a 20:00). Signos vitales, alimentación asistida y cambios de postura.',
    hours: 12,
    integrityTip: 'Recomendado para adultos mayores semivalentes o postrados mientras la familia trabaja o cumple su jornada laboral.'
  },
  {
    id: 'vigilia-nocturna',
    title: 'Vigilia Nocturna (12 Horas)',
    badge: 'Descanso Familiar',
    icon: '🌙',
    desc: 'Supervisión activa durante toda la noche (ej. 20:00 a 08:00). Manejo de incontinencia y prevención de caídas.',
    hours: 12,
    integrityTip: 'Indispensable si tu familiar se desorienta de noche o sufre de insomnio/Alzheimer, para que la familia pueda dormir tranquila.'
  },
  {
    id: 'cuidado-24-7',
    title: 'Cuidado Continuo 24/7',
    badge: 'Atención Permanente',
    icon: '🔄',
    desc: 'Turnos rotativos de día y noche cubiertos por equipo de TENS con reemplazos coordinados por Visalud.',
    hours: 24,
    integrityTip: 'La Coordinación de Visalud organiza el calendario y asegura reemplazos inmediatos ante licencias o imprevistos.'
  }
]

const FREQUENCY_OPTIONS = [
  { id: '1-3-dias', label: '1 a 3 días / semana', desc: 'Atención puntual o de relevo', days: 2 },
  { id: 'lunes-viernes', label: 'Lunes a Viernes (5 días)', desc: 'Jornada laboral completa', days: 5 },
  { id: 'fin-de-semana', label: 'Fin de Semana (Sáb y Dom)', desc: 'Apoyo sábado y domingo', days: 2 },
  { id: 'todos-los-dias', label: 'Todos los días (7 días)', desc: 'Cuidado continuo de lunes a domingo', days: 7 }
]

const SECTORS_OPTIONS = [
  'Centro Osorno',
  'Rahue Alto',
  'Rahue Bajo',
  'Francke',
  'Pilauco / Kolbe',
  'Ovejería',
  'Bellavista / Oriente',
  'Alrededores de Osorno'
]

const CARE_NEEDS_OPTIONS = [
  { id: 'fármacos', icon: '💊', label: 'Administración de medicamentos por horario' },
  { id: 'baño', icon: '🛁', label: 'Aseo, baño en cama y confort personal' },
  { id: 'postrado', icon: '🛏️', label: 'Paciente postrado / Prevención activa de escaras' },
  { id: 'demencia', icon: '🧠', label: 'Alzheimer, demencia senil o desorientación' },
  { id: 'alimentación', icon: '🍽️', label: 'Alimentación asistida e hidratación' },
  { id: 'movilidad', icon: '🚶', label: 'Paseos asistidos y estimulación suave' }
]

export default function CareCalculator() {
  const [step, setStep] = useState(1) // 1: Turno | 2: Frecuencia y Sector | 3: Necesidades | 4: Resumen
  const [selectedShift, setSelectedShift] = useState('medio-turno')
  const [selectedFrequency, setSelectedFrequency] = useState('lunes-viernes')
  const [selectedSector, setSelectedSector] = useState('Centro Osorno')
  const [selectedNeeds, setSelectedNeeds] = useState(['fármacos', 'baño'])

  // Formulario en el paso 4
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [leadSent, setLeadSent] = useState(false)
  const [leadLoading, setLeadLoading] = useState(false)

  // Datos seleccionados
  const currentShift = useMemo(() => SHIFT_OPTIONS.find(s => s.id === selectedShift) || SHIFT_OPTIONS[0], [selectedShift])
  const currentFreq = useMemo(() => FREQUENCY_OPTIONS.find(f => f.id === selectedFrequency) || FREQUENCY_OPTIONS[1], [selectedFrequency])

  // Estimación de horas semanales
  const estimatedHoursWeek = useMemo(() => {
    return currentShift.hours * currentFreq.days
  }, [currentShift, currentFreq])

  function toggleNeed(needId) {
    setSelectedNeeds(prev =>
      prev.includes(needId) ? prev.filter(n => n !== needId) : [...prev, needId]
    )
  }

  // Generador de mensaje contextualizado para WhatsApp
  function handleSendWhatsApp() {
    const shiftLabel = currentShift.title
    const freqLabel = currentFreq.label
    const sectorLabel = selectedSector
    const needsList = selectedNeeds
      .map(id => CARE_NEEDS_OPTIONS.find(o => o.id === id)?.label)
      .filter(Boolean)
      .join(', ')

    const message = `¡Hola Coordinación Visalud! 👋\n\nHe utilizado el *Cotizador Inteligente con Integrity* en su página web y quisiera consultar disponibilidad y valores para el siguiente requerimiento:\n\n• *Modalidad:* ${shiftLabel}\n• *Frecuencia:* ${freqLabel}\n• *Sector en Osorno:* ${sectorLabel}\n• *Estimación semanal:* Aprox. ${estimatedHoursWeek} hrs/semana\n• *Cuidados requeridos:* ${needsList || 'Cuidado general'}\n${contactName ? `• *Familiar a cargo:* ${contactName}\n` : ''}${contactPhone ? `• *Teléfono:* ${contactPhone}\n` : ''}\n¿Tienen profesionales TENS disponibles para este sector y horario? Muchas gracias.`

    const url = `https://wa.me/56968016334?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Guardar lead en la Bandeja del Mini-CRM
  async function handleSaveLead() {
    if (!contactName.trim() || !contactPhone.trim()) {
      alert('Por favor indica tu nombre y un teléfono de contacto.')
      return
    }

    setLeadLoading(true)
    try {
      const needsList = selectedNeeds
        .map(id => CARE_NEEDS_OPTIONS.find(o => o.id === id)?.label)
        .filter(Boolean)
        .join(', ')

      const summary = `Cotización desde asistente Integrity: ${currentShift.title} • Frecuencia: ${currentFreq.label} • Horas estimadas: ~${estimatedHoursWeek}h/sem • Necesidades: ${needsList || 'General'}`

      await leadsService.addLead({
        name: contactName.trim(),
        email: contactEmail.trim() || null,
        phone: contactPhone.trim(),
        subject: `Cotización: ${currentShift.title}`,
        sector: selectedSector,
        message: summary
      })

      setLeadSent(true)
    } catch (err) {
      console.error('Error enviando cotización:', err)
      setLeadSent(true)
    } finally {
      setLeadLoading(false)
    }
  }

  function handleReset() {
    setStep(1)
    setLeadSent(false)
    setContactName('')
    setContactPhone('')
    setContactEmail('')
  }

  return (
    <section className="care-calc-section" id="cotizador" aria-labelledby="calc-title">
      <div className="care-calc-container">
        {/* Cabecera Principal con Persona de Integrity */}
        <div className="care-calc-header">
          <div className="integrity-brand-pill">
            <img src="/integrity-logo.png" alt="Integrity" className="integrity-mini-avatar" />
            <span>Asistente Inteligente Integrity · Visalud Osorno</span>
          </div>

          <h2 id="calc-title" className="care-calc-title">
            Cotizador Interactivo de <span className="text-gradient">Cuidados y Turnos TENS</span>
          </h2>

          <p className="care-calc-subtitle">
            Configura en <strong>3 pasos sencillos</strong> la atención que tu ser querido necesita en Osorno.
            Recibe una recomendación clínica personalizada y cotiza disponibilidad al instante.
          </p>
        </div>

        {/* Barra de Pasos / Progress Stepper */}
        <div className="care-calc-stepper" role="tablist" aria-label="Pasos de la cotización">
          <button
            type="button"
            className={`step-tab ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}
            onClick={() => setStep(1)}
          >
            <span className="step-circle">{step > 1 ? '✓' : '1'}</span>
            <span className="step-label">Modalidad de Turno</span>
          </button>

          <div className={`step-connector ${step > 1 ? 'active' : ''}`} />

          <button
            type="button"
            className={`step-tab ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}
            onClick={() => setStep(2)}
          >
            <span className="step-circle">{step > 2 ? '✓' : '2'}</span>
            <span className="step-label">Frecuencia & Sector</span>
          </button>

          <div className={`step-connector ${step > 2 ? 'active' : ''}`} />

          <button
            type="button"
            className={`step-tab ${step === 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}
            onClick={() => setStep(3)}
          >
            <span className="step-circle">{step > 3 ? '✓' : '3'}</span>
            <span className="step-label">Cuidados Clínicos</span>
          </button>

          <div className={`step-connector ${step === 4 ? 'active' : ''}`} />

          <button
            type="button"
            className={`step-tab ${step === 4 ? 'active' : ''}`}
            onClick={() => setStep(4)}
          >
            <span className="step-circle">4</span>
            <span className="step-label">Plan Sugerido</span>
          </button>
        </div>

        {/* Tarjeta Principal del Cotizador */}
        <div className="care-calc-card">
          {/* Globo de Consejo de Integrity */}
          <aside className="integrity-dialog-bubble">
            <div className="bubble-avatar-wrap">
              <img src="/integrity-logo.png" alt="Integrity" className="bubble-avatar" />
              <span className="bubble-pulse-dot" />
            </div>
            <div className="bubble-text">
              <div className="bubble-author">Integrity te orienta:</div>
              <p>
                {step === 1 && currentShift.integrityTip}
                {step === 2 && 'Atendemos en todo el radio urbano de Osorno y sectores aledaños. Seleccionar los días nos ayuda a verificar qué cuidador TENS tiene turno disponible.'}
                {step === 3 && 'Indica las condiciones específicas de tu familiar. Esto nos permite asignar un TENS con experiencia exacta en sus requerimientos.'}
                {step === 4 && '¡Excelente! Hemos estructurado el plan óptimo para tu familiar. Puedes solicitar confirmación directa por WhatsApp o registrarlo en nuestro sistema.'}
              </p>
            </div>
          </aside>

          {/* ================= PASO 1: MODALIDAD DE TURNO ================= */}
          {step === 1 && (
            <div className="calc-step-content animate-fade-in">
              <h3 className="step-heading">
                <span>Paso 1:</span> ¿Qué tipo de turno o acompañamiento requieres?
              </h3>
              <p className="step-subheading">
                Todas las atenciones son particulares, directas y realizadas por Técnicos en Enfermería (TENS) certificados SIS.
              </p>

              <div className="shifts-grid">
                {SHIFT_OPTIONS.map(shift => {
                  const isSelected = selectedShift === shift.id
                  return (
                    <div
                      key={shift.id}
                      className={`shift-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedShift(shift.id)}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedShift(shift.id)
                        }
                      }}
                    >
                      <div className="shift-card-header">
                        <span className="shift-icon">{shift.icon}</span>
                        <span className="shift-badge">{shift.badge}</span>
                      </div>
                      <h4 className="shift-title">{shift.title}</h4>
                      <p className="shift-desc">{shift.desc}</p>
                      <div className="shift-card-footer">
                        <span className="shift-hours-tag">{shift.hours} hrs continuas</span>
                        <span className="shift-check-radio">{isSelected ? '●' : '○'}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="calc-actions-bar">
                <div />
                <button
                  type="button"
                  className="btn-calc-next"
                  onClick={() => setStep(2)}
                >
                  <span>Continuar a Frecuencia y Sector</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ================= PASO 2: FRECUENCIA Y SECTOR ================= */}
          {step === 2 && (
            <div className="calc-step-content animate-fade-in">
              <h3 className="step-heading">
                <span>Paso 2:</span> Frecuencia semanal y sector en Osorno
              </h3>
              <p className="step-subheading">
                Define cuántos días por semana necesitas la cobertura y en qué zona de la ciudad se realizará la atención.
              </p>

              <div className="calc-two-col-grid">
                {/* Columna Izquierda: Frecuencia */}
                <div className="calc-col-group">
                  <label className="group-label">¿Con qué frecuencia necesitas el cuidado?</label>
                  <div className="freq-options-list">
                    {FREQUENCY_OPTIONS.map(freq => {
                      const isSelected = selectedFrequency === freq.id
                      return (
                        <div
                          key={freq.id}
                          className={`freq-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => setSelectedFrequency(freq.id)}
                        >
                          <div className="freq-radio">{isSelected ? '●' : '○'}</div>
                          <div className="freq-info">
                            <strong className="freq-name">{freq.label}</strong>
                            <span className="freq-desc">{freq.desc}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Columna Derecha: Sector en Osorno */}
                <div className="calc-col-group">
                  <label className="group-label">¿En qué sector de Osorno se encuentra el hogar?</label>
                  <div className="sectors-chips-grid">
                    {SECTORS_OPTIONS.map(sec => {
                      const isSelected = selectedSector === sec
                      return (
                        <button
                          key={sec}
                          type="button"
                          className={`sector-chip-btn ${isSelected ? 'active' : ''}`}
                          onClick={() => setSelectedSector(sec)}
                        >
                          <span className="sector-pin">📍</span>
                          <span>{sec}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="calc-actions-bar">
                <button
                  type="button"
                  className="btn-calc-prev"
                  onClick={() => setStep(1)}
                >
                  ← Volver
                </button>
                <button
                  type="button"
                  className="btn-calc-next"
                  onClick={() => setStep(3)}
                >
                  <span>Continuar a Necesidades Clínicas</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ================= PASO 3: NECESIDADES CLÍNICAS ================= */}
          {step === 3 && (
            <div className="calc-step-content animate-fade-in">
              <h3 className="step-heading">
                <span>Paso 3:</span> ¿Qué cuidados específicos requiere tu familiar?
              </h3>
              <p className="step-subheading">
                Selecciona todas las opciones que correspondan a su situación de salud actual:
              </p>

              <div className="needs-grid">
                {CARE_NEEDS_OPTIONS.map(need => {
                  const isChecked = selectedNeeds.includes(need.id)
                  return (
                    <div
                      key={need.id}
                      className={`need-card ${isChecked ? 'checked' : ''}`}
                      onClick={() => toggleNeed(need.id)}
                    >
                      <div className="need-checkbox">
                        {isChecked ? '✓' : ''}
                      </div>
                      <span className="need-icon">{need.icon}</span>
                      <span className="need-label">{need.label}</span>
                    </div>
                  )
                })}
              </div>

              <div className="calc-actions-bar">
                <button
                  type="button"
                  className="btn-calc-prev"
                  onClick={() => setStep(2)}
                >
                  ← Volver
                </button>
                <button
                  type="button"
                  className="btn-calc-next"
                  onClick={() => setStep(4)}
                >
                  <span>Generar Resumen y Cotización</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ================= PASO 4: RESUMEN INTELIGENTE ================= */}
          {step === 4 && (
            <div className="calc-step-content animate-fade-in">
              <div className="summary-banner">
                <div className="summary-badge-tag">Plan Sugerido por Visalud</div>
                <h3 className="summary-title">Resumen de Cuidados Personalizado</h3>
                <p className="summary-lead">
                  Hemos organizado la propuesta con base en los requerimientos clínicos y de horario para tu familiar en <strong>{selectedSector}</strong>.
                </p>
              </div>

              <div className="summary-cards-grid">
                <div className="summary-item-card">
                  <span className="summary-item-label">Modalidad de Turno</span>
                  <strong className="summary-item-value">{currentShift.title}</strong>
                  <span className="summary-item-sub">{currentShift.hours} horas por jornada</span>
                </div>

                <div className="summary-item-card">
                  <span className="summary-item-label">Frecuencia Seleccionada</span>
                  <strong className="summary-item-value">{currentFreq.label}</strong>
                  <span className="summary-item-sub">{currentFreq.days} días por semana</span>
                </div>

                <div className="summary-item-card highlight">
                  <span className="summary-item-label">Volumen Estimado</span>
                  <strong className="summary-item-value text-teal">~{estimatedHoursWeek} hrs/semana</strong>
                  <span className="summary-item-sub">Atención directa en {selectedSector}</span>
                </div>
              </div>

              {/* Lista de cuidados incluidos */}
              <div className="summary-needs-box">
                <h4 className="summary-needs-title">Cuidados y asistencias contempladas:</h4>
                <div className="summary-chips-list">
                  {selectedNeeds.length > 0 ? (
                    selectedNeeds.map(id => {
                      const item = CARE_NEEDS_OPTIONS.find(o => o.id === id)
                      if (!item) return null
                      return (
                        <span key={id} className="summary-chip">
                          {item.icon} {item.label}
                        </span>
                      )
                    })
                  ) : (
                    <span className="summary-chip">Cuidado general y acompañamiento</span>
                  )}
                </div>
              </div>

              {/* Botón Principal: WhatsApp Directo */}
              <div className="calc-cta-section">
                <div className="cta-highlight-box">
                  <button
                    type="button"
                    className="btn-cta-whatsapp-calc"
                    onClick={handleSendWhatsApp}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span>Cotizar disponibilidad para este plan por WhatsApp</span>
                  </button>
                  <p className="cta-helper-text">
                    Envía este requerimiento armado directamente a la Coordinación de Visalud para recibir valores y disponibilidad de TENS en minutos.
                  </p>
                </div>

                {/* Formulario alternativo para enviar a la Bandeja Web */}
                <div className="lead-register-box">
                  <div className="lead-register-header">
                    <h4>¿Prefieres que te contactemos nosotros?</h4>
                    <p>Déjanos tus datos y esta cotización se registrará en nuestra bandeja de coordinación.</p>
                  </div>

                  {leadSent ? (
                    <div className="lead-sent-success">
                      <span className="success-icon">✓</span>
                      <div>
                        <strong>¡Cotización registrada con éxito!</strong>
                        <p>Nuestro equipo de coordinación en Osorno revisará este plan y te contactará a la brevedad.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="lead-register-inputs">
                      <input
                        type="text"
                        placeholder="Tu nombre (Familiar)"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="calc-input"
                      />
                      <input
                        type="tel"
                        placeholder="Tu teléfono o WhatsApp"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="calc-input"
                      />
                      <button
                        type="button"
                        className="btn-send-calc-lead"
                        onClick={handleSaveLead}
                        disabled={leadLoading}
                      >
                        {leadLoading ? 'Enviando...' : 'Enviar requerimiento a Coordinación'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="calc-reset-bar">
                  <button type="button" className="btn-calc-reset" onClick={handleReset}>
                    ↺ Modificar o armar otra cotización
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
