import { useState, useEffect, useRef } from 'react'
import './IntegrityWidget.css'

// Número y plantilla de WhatsApp oficial para derivación
const WHATSAPP_PHONE = '56951754416' // Número corporativo / de contacto

const INITIAL_GREETING = {
  id: 'welcome-msg',
  role: 'bot',
  text: `¡Hola! 👋 Soy **Integrity**, asistente virtual inteligente de **Visalud Osorno** (desarrollado con IA por UrbanZync).\n\nEstoy aquí para orientarte en nuestros servicios de atención de salud y enfermería a domicilio en Osorno.\n\n¿En qué te puedo ayudar hoy?`,
  timestamp: new Date(),
  actions: [
    { label: '🩹 Curaciones a domicilio', query: 'cuentame sobre las curaciones a domicilio' },
    { label: '👵 Cuidados adulto mayor', query: 'que incluyen los cuidados de adulto mayor' },
    { label: '💰 Reembolso Fonasa / Isapre', query: 'se puede reembolsar con fonasa o isapre' },
    { label: '📍 Cobertura en Osorno', query: 'que sectores atienden en osorno' }
  ]
}

const QUICK_CHIPS = [
  { label: '🩺 Servicios clínicos', query: 'que servicios realizan' },
  { label: '🩹 Curación de heridas', query: 'curacion de escaras y heridas' },
  { label: '👵 Cuidados adulto mayor', query: 'turnos y cuidados de adulto mayor' },
  { label: '💉 Inyecciones y sueros', query: 'administracion de inyecciones y sueros' },
  { label: '💰 Fonasa e Isapres', query: 'como funciona el reembolso con isapres' },
  { label: '📋 Registro SIS', query: 'estan inscritos en la superintendencia de salud' },
  { label: '💬 Hablar por WhatsApp', isWhatsApp: true }
]

// Normalización de texto para matching clínico inteligente
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

// Motor de Conocimiento Clínico de Respaldo para Visalud Osorno
// Permite que la dueña y los pacientes interactúen y reciban respuestas inmediatas y precisas
function getVisaludClinicalResponse(query) {
  const q = normalizeText(query)

  // 1. Filtro de Urgencia Vital / Emergencia
  if (
    q.includes('urgencia') ||
    q.includes('emergencia') ||
    q.includes('paro') ||
    q.includes('infarto') ||
    q.includes('pecho') ||
    q.includes('desmayo') ||
    q.includes('inconsciente') ||
    q.includes('ahogo')
  ) {
    return {
      text: `⚠️ **ALERTA DE SEGURIDAD CLÍNICA**:\n\nSi la persona presenta compromiso de conciencia, dolor agudo en el pecho, dificultad respiratoria severa o sangrado incontrolable, se trata de una urgencia médica vital.\n\nPor favor comunícate de inmediato con el **SAMU (Llama al 131)** o dirígete a la Urgencia del **Hospital Base San José de Osorno**.\n\nVisalud brinda atención domiciliaria programada y cuidados continuos, no servicios de rescate de riesgo vital inmediato.`,
      actions: [
        { label: '📞 Llamar SAMU 131', url: 'tel:131' },
        { label: '💬 Consultar disponibilidad WhatsApp', isWhatsApp: true, customText: 'Hola Visalud, tengo una consulta urgente sobre atención clínica en Osorno' }
      ]
    }
  }

  // 2. Curaciones, heridas, escaras, puntos
  if (
    q.includes('curacion') ||
    q.includes('herida') ||
    q.includes('escara') ||
    q.includes('ulcera') ||
    q.includes('puntos') ||
    q.includes('pie diabetico') ||
    q.includes('quemadura')
  ) {
    return {
      text: `🩹 **Curaciones Avanzadas a Domicilio en Osorno**:\n\nEn Visalud contamos con profesionales de enfermería expertos en el manejo y cicatrización de heridas complejas:\n\n• **Úlceras por presión (escaras)** en pacientes postrados o con movilidad reducida.\n• **Curación de heridas quirúrgicas** y retiro seguro de puntos / grapas.\n• **Manejo de pie diabético** y quemaduras de grado I y II.\n• Evaluación de tejidos, control de exudado e indicación de apósitos de última tecnología.\n\nTodos nuestros procedimientos utilizan **material e insumos estériles** certificados.`,
      actions: [
        { label: '📲 Agendar evaluación de herida por WhatsApp', isWhatsApp: true, customText: 'Hola Visalud, requiero una curación a domicilio en Osorno. ¿Qué disponibilidad tienen?' },
        { label: '💰 ¿Se reembolsa con Isapre/Fonasa?', query: 'se puede reembolsar en isapre o fonasa' }
      ]
    }
  }

  // 3. Cuidados Adulto Mayor, Postrados, Turnos de Día / Noche
  if (
    q.includes('adulto mayor') ||
    q.includes('abuelo') ||
    q.includes('abuela') ||
    q.includes('postrado') ||
    q.includes('cuidador') ||
    q.includes('turno') ||
    q.includes('noche') ||
    q.includes('acompanamiento') ||
    q.includes('alzheimer') ||
    q.includes('demencia')
  ) {
    return {
      text: `👵 **Cuidados Integrales y Acompañamiento del Adulto Mayor**:\n\nBrindamos tranquilidad a las familias osorninas con personal calificado y de gran calidad humana:\n\n• **Turnos personalizados**: Atenciones puntuales, turnos diurnos (4, 8 o 12 hrs) o turnos nocturnos de vigilia.\n• **Aseo y confort**: Baño en cama, higiene de cavidades, prevención de caídas y cambios posturales para prevenir escaras.\n• **Administración de fármacos** según horario médico prescrito.\n• Manejo y cambio de sondas (Foley, nasogástricas) y ostomías.\n• Acompañamiento empático para pacientes con Alzheimer, demencias o secuelas de ACV.`,
      actions: [
        { label: '📲 Coordinar turnos de cuidado por WhatsApp', isWhatsApp: true, customText: 'Hola Visalud, quisiera consultar disponibilidad y planes para el cuidado de un adulto mayor en Osorno' },
        { label: '📋 ¿Los profesionales están certificados?', query: 'estan inscritos en la superintendencia de salud' }
      ]
    }
  }

  // 4. Inyecciones, sueros, vías venosas
  if (
    q.includes('inyeccion') ||
    q.includes('suero') ||
    q.includes('intramuscular') ||
    q.includes('medicamento') ||
    q.includes('neurobionta') ||
    q.includes('via') ||
    q.includes('antibiotico') ||
    q.includes('endovenoso')
  ) {
    return {
      text: `💉 **Administración de Inyectables y Sueroterapia a Domicilio**:\n\nRealizamos la aplicación de fármacos en la comodidad de tu hogar bajo estricta prescripción médica:\n\n• Inyecciones intramusculares (ej. Neurobionta, analgésicos, antiinflamatorios, anticonceptivos).\n• Instalación de vías venosas periféricas e hidratación con sueros.\n• Terapia antibiótica endovenosa programada.\n• Control de signos vitales (presión arterial, saturación, frecuencia cardíaca y glicemia capilar).\n\n*(Nota: Se requiere orden médica para administración de fármacos).*`,
      actions: [
        { label: '📲 Solicitar postura de inyección por WhatsApp', isWhatsApp: true, customText: 'Hola Visalud, requiero una inyección/suero a domicilio en Osorno con orden médica' }
      ]
    }
  }

  // 5. Precios, Fonasa, Isapre, Reembolso y Boletas
  if (
    q.includes('precio') ||
    q.includes('valor') ||
    q.includes('cuanto cuesta') ||
    q.includes('cobran') ||
    q.includes('fonasa') ||
    q.includes('isapre') ||
    q.includes('reembolso') ||
    q.includes('boleta') ||
    q.includes('seguro')
  ) {
    return {
      text: `💰 **Valores y Cobertura de Reembolso (Fonasa / Isapre)**:\n\n• **Reembolsos**: Emitimos **boleta de honorarios profesional médica** con el código de prestación clínico correspondiente, lo que te permite tramitar el reembolso en tu **Isapre** (Banmédica, Colmena, Consalud, CruzBlanca, Vida Tres, Esencial) o en tu **seguro complementario de salud**.\n\n• **Aranceles**: Los valores dependen del tipo de servicio, tiempo requerido y si incluye insumos clínicos específicos (apósitos especiales, sueros, etc.).\n\n¿Deseas que te coticemos de inmediato según el caso de tu familiar?`,
      actions: [
        { label: '📲 Cotizar servicio exacto por WhatsApp', isWhatsApp: true, customText: 'Hola Visalud, quisiera cotizar un servicio de enfermería y saber el arancel para reembolso' }
      ]
    }
  }

  // 6. Registro Superintendencia de Salud (SIS)
  if (
    q.includes('superintendencia') ||
    q.includes('sis') ||
    q.includes('acreditados') ||
    q.includes('certificados') ||
    q.includes('titulo') ||
    q.includes('confianza')
  ) {
    return {
      text: `📋 **Seguridad Clínica y Registro Oficial SIS**:\n\nTodos los profesionales de Visalud (Enfermeras Universitarias y Técnicos en Enfermería de Nivel Superior - TENS) cuentan con:\n\n✅ Título profesional validado por universidades o centros acreditados en Chile.\n✅ Inscripción activa en el **Registro Nacional de Prestadores Individuales de la Superintendencia de Salud (SIS)**.\n✅ Experiencia clínica comprobada en atención hospitalaria y domiciliaria en la Región de Los Lagos.`,
      actions: [
        { label: '👨‍⚕️ Ver equipo en la web', query: 'ver equipo de profesionales' },
        { label: '📲 Hablar con supervisión clínica', isWhatsApp: true, customText: 'Hola Visalud, quisiera coordinar una visita clínica' }
      ]
    }
  }

  // 7. Cobertura en Osorno y sectores
  if (
    q.includes('sector') ||
    q.includes('cobertura') ||
    q.includes('donde') ||
    q.includes('osorno') ||
    q.includes('rahue') ||
    q.includes('francke') ||
    q.includes('centro') ||
    q.includes('pilauco') ||
    q.includes('rural')
  ) {
    return {
      text: `📍 **Cobertura Geográfica en Osorno y Alrededores**:\n\nAtendemos en todo el radio urbano de **Osorno**, incluyendo:\n\n• Centro y Sector Oriente\n• Rahue Bajo y Rahue Alto\n• Francke y Kolbe\n• Ovejería y Bellavista\n• Pilauco y Las Quemas\n\n*(Para sectores rurales como Cancura, Puyehue o San Pablo, coordinamos visitas según factibilidad de traslado).*`,
      actions: [
        { label: '📲 Consultar por mi sector en WhatsApp', isWhatsApp: true, customText: 'Hola Visalud, quisiera saber si tienen cobertura domiciliaria en mi sector de Osorno' }
      ]
    }
  }

  // 8. Saludos / Hola / Qué haces
  if (
    q.includes('hola') ||
    q.includes('buenas') ||
    q.includes('buenos dias') ||
    q.includes('buenas tardes') ||
    q.includes('saludos') ||
    q.includes('que haces') ||
    q.includes('ayuda')
  ) {
    return {
      text: `¡Hola de nuevo! 😊 Soy **Integrity**, el asistente virtual de Visalud.\n\nPuedo orientarte con las preguntas más frecuentes sobre nuestros servicios de salud a domicilio en Osorno:\n\n1. 🩹 **Curaciones y tratamiento de heridas/escaras**\n2. 👵 **Cuidados y turnos para adultos mayores o postrados**\n3. 💉 **Inyecciones, sueroterapia y medicamentos**\n4. 💰 **Reembolsos en Fonasa, Isapres y boletas médicas**\n5. 📲 **Conexión directa con una enfermera por WhatsApp**\n\n¿Cuál de estas áreas te gustaría consultar?`,
      actions: [
        { label: '🩹 Curaciones', query: 'curacion de heridas' },
        { label: '👵 Cuidados Adulto Mayor', query: 'cuidados adulto mayor' },
        { label: '💰 Reembolsos', query: 'como funciona el reembolso con isapres' },
        { label: '📲 Hablar por WhatsApp', isWhatsApp: true }
      ]
    }
  }

  // 9. Respuesta por defecto guiada
  return {
    text: `Entiendo tu consulta sobre *"${query}"*. En Visalud adaptamos cada atención a las necesidades de salud del paciente en Osorno.\n\nPara darte una respuesta clínica personalizada o agendar una visita a domicilio de inmediato, te recomiendo comunicarte directamente con nuestro equipo de enfermería por WhatsApp:`,
    actions: [
      { label: '💬 Consultar directamente por WhatsApp', isWhatsApp: true, customText: `Hola Visalud, quisiera consultar sobre: "${query}" para atención en Osorno` },
      { label: '🩹 Ver servicios de curación', query: 'curacion de heridas' },
      { label: '👵 Ver cuidados de adulto mayor', query: 'cuidados adulto mayor' }
    ]
  }
}

export default function IntegrityWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem('integrity_sound') !== 'off'
    } catch (e) {
      return true
    }
  })
  const [rasaUrl, setRasaUrl] = useState(() => {
    try {
      return localStorage.getItem('integrity_rasa_url') || 'http://localhost:5005'
    } catch (e) {
      return 'http://localhost:5005'
    }
  })
  const [tempRasaUrl, setTempRasaUrl] = useState(rasaUrl)
  const [serverStatus, setServerStatus] = useState('checking') // 'checking' | 'connected' | 'demo'
  const [messages, setMessages] = useState([INITIAL_GREETING])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const senderIdRef = useRef('')

  // Inicializar Sender ID para Rasa
  useEffect(() => {
    try {
      let savedId = localStorage.getItem('integrity_sender_id')
      if (!savedId) {
        savedId = 'visalud_' + Math.random().toString(36).substring(2, 9)
        localStorage.setItem('integrity_sender_id', savedId)
      }
      senderIdRef.current = savedId
    } catch (e) {
      senderIdRef.current = 'visalud_guest'
    }
  }, [])

  // Comprobar estado del servidor Rasa en background
  useEffect(() => {
    let isMounted = true
    const checkServer = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000)
        const res = await fetch(`${rasaUrl}/status`, {
          method: 'GET',
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        if (isMounted) {
          if (res.ok) {
            setServerStatus('connected')
          } else {
            setServerStatus('demo')
          }
        }
      } catch (err) {
        if (isMounted) {
          setServerStatus('demo') // Modo Asistente Clínico Inteligente de respaldo
        }
      }
    }

    checkServer()
    const interval = setInterval(checkServer, 30000) // cada 30 segundos
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [rasaUrl])

  // Desplazar chat hacia abajo cuando entran mensajes
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping, isOpen])

  // Ocultar globo de bienvenida después de unos segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false)
    }, 12000)
    return () => clearTimeout(timer)
  }, [])

  // Síntesis de sonido con Web Audio API
  const playSound = (type = 'bot') => {
    if (!soundEnabled) return
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      if (type === 'send') {
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(560, ctx.currentTime)
        gain.gain.setValueAtTime(0.12, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
        osc.start()
        osc.stop(ctx.currentTime + 0.1)
      } else {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(360, ctx.currentTime)
        gain.gain.setValueAtTime(0.14, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16)
        osc.start()
        osc.stop(ctx.currentTime + 0.16)
      }
    } catch (e) {
      // Ignorar restricciones de audio del navegador
    }
  }

  const toggleSound = () => {
    const next = !soundEnabled
    setSoundEnabled(next)
    try {
      localStorage.setItem('integrity_sound', next ? 'on' : 'off')
    } catch (e) {}
  }

  const handleSaveRasaUrl = (e) => {
    e.preventDefault()
    let clean = tempRasaUrl.trim().replace(/\/$/, '')
    if (!clean) clean = 'http://localhost:5005'
    setRasaUrl(clean)
    try {
      localStorage.setItem('integrity_rasa_url', clean)
    } catch (e) {}
    setShowSettings(false)
    setServerStatus('checking')
  }

  const handleOpenWidget = () => {
    setIsOpen(true)
    setShowTooltip(false)
    setHasUnread(false)
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 150)
  }

  const handleCloseWidget = () => {
    setIsOpen(false)
  }

  const handleResetChat = () => {
    setMessages([INITIAL_GREETING])
  }

  // Enviar mensaje a WhatsApp
  const openWhatsApp = (customText) => {
    const text = customText || 'Hola Visalud, estuve conversando con Integrity en su web y quisiera solicitar información sobre sus servicios de atención a domicilio en Osorno.'
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Enviar mensaje al bot (Rasa o Fallback Clínico)
  const handleSendMessage = async (customText) => {
    const textToSend = typeof customText === 'string' ? customText : inputValue.trim()
    if (!textToSend || isTyping) return

    // Añadir mensaje del usuario
    const userMsg = {
      id: 'msg-' + Date.now(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMsg])
    if (typeof customText !== 'string') {
      setInputValue('')
    }
    playSound('send')
    setIsTyping(true)

    // Intentar consultar al servidor de Rasa primero
    let answered = false

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2600)

      const response = await fetch(`${rasaUrl}/webhooks/rest/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: senderIdRef.current,
          message: textToSend
        }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) {
          setServerStatus('connected')
          answered = true

          // Crear respuestas recibidas desde Rasa
          const newBotMessages = data.map((item, idx) => ({
            id: 'bot-' + Date.now() + '-' + idx,
            role: 'bot',
            text: item.text || '',
            image: item.image || null,
            buttons: item.buttons || null,
            timestamp: new Date()
          }))

          setMessages((prev) => [...prev, ...newBotMessages])
          playSound('bot')
        }
      }
    } catch (err) {
      // Rasa no está levantado en localhost:5005 o falló la conexión
      setServerStatus('demo')
    }

    // Si Rasa no respondió, entra el Asistente Clínico Inteligente de Visalud
    if (!answered) {
      setTimeout(() => {
        const clinicalResp = getVisaludClinicalResponse(textToSend)
        const botMsg = {
          id: 'bot-' + Date.now(),
          role: 'bot',
          text: clinicalResp.text,
          timestamp: new Date(),
          actions: clinicalResp.actions || []
        }

        setMessages((prev) => [...prev, botMsg])
        setIsTyping(false)
        playSound('bot')

        if (!isOpen) {
          setHasUnread(true)
        }
      }, 700)
    } else {
      setIsTyping(false)
      if (!isOpen) {
        setHasUnread(true)
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date) => {
    try {
      return new Intl.DateTimeFormat('es-CL', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(date))
    } catch (e) {
      return ''
    }
  }

  return (
    <>
      {/* ============================================================
          1. LANZADOR FLOTANTE (BOTÓN INFERIOR DERECHO)
          ============================================================ */}
      <div className="integrity-launcher-container" aria-label="Asistente Virtual Integrity">
        {/* Globo de bienvenida informativo inicial */}
        {!isOpen && showTooltip && (
          <div className="integrity-launcher-tooltip">
            <div>
              👋 ¿Tienes dudas médicas? Chatea con <strong>Integrity</strong>, el asistente virtual de Visalud.
            </div>
            <button
              className="integrity-tooltip-close"
              onClick={() => setShowTooltip(false)}
              aria-label="Cerrar sugerencia"
              title="Cerrar sugerencia"
            >
              ✕
            </button>
            <div className="integrity-tooltip-arrow" />
          </div>
        )}

        {/* Botón Circular con Logo y Anillo Pulsante */}
        <button
          className={`integrity-launcher-btn ${isOpen ? 'active' : ''}`}
          onClick={isOpen ? handleCloseWidget : handleOpenWidget}
          title={isOpen ? 'Minimizar asistente Integrity' : 'Abrir asistente virtual Integrity'}
          aria-label={isOpen ? 'Cerrar chat de Integrity' : 'Abrir chat de Integrity'}
        >
          {!isOpen ? (
            <>
              <div className="integrity-pulse-ring" />
              <div className="integrity-pulse-ring-delayed" />
              <img
                src="/integrity-logo.png"
                alt="Integrity IA"
                className="integrity-launcher-avatar"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              <span
                className={`integrity-launcher-status-dot ${serverStatus === 'demo' ? 'demo' : ''}`}
                title={serverStatus === 'connected' ? 'Rasa Online' : 'Modo Asistente Clínico Activo'}
              />
            </>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          )}
        </button>
      </div>

      {/* ============================================================
          2. VENTANA PRINCIPAL DEL ASISTENTE INTEGRITY
          ============================================================ */}
      {isOpen && (
        <aside className="integrity-chat-window" role="dialog" aria-label="Chat Asistente Integrity">
          {/* Header */}
          <header className="integrity-header">
            <div className="integrity-header-brand">
              <div className="integrity-header-logo-wrap">
                <img
                  src="/integrity-logo.png"
                  alt="Logo Integrity"
                  className="integrity-header-logo"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
              <div className="integrity-header-titles">
                <div className="integrity-title-row">
                  <h3 className="integrity-title">INTEGRITY</h3>
                  <span className="integrity-badge-ai">IA Visalud</span>
                </div>
                <div className="integrity-status-line">
                  <span className={`integrity-status-dot-mini ${serverStatus}`} />
                  {serverStatus === 'connected' ? (
                    <span>🟢 Rasa Conectado (API)</span>
                  ) : serverStatus === 'checking' ? (
                    <span>Sincronizando...</span>
                  ) : (
                    <span>⚡ Asistente Clínico (Demo)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Acciones del Header */}
            <div className="integrity-header-actions">
              {/* Botón de Sonido */}
              <button
                className="integrity-icon-btn"
                onClick={toggleSound}
                title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
                aria-label="Alternar sonido"
              >
                {soundEnabled ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                )}
              </button>

              {/* Botón de Configuración Rasa */}
              <button
                className="integrity-icon-btn"
                onClick={() => setShowSettings(!showSettings)}
                title="Configuración de servidor Rasa"
                aria-label="Configuración de servidor Rasa"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>

              {/* Botón Reiniciar Chat */}
              <button
                className="integrity-icon-btn"
                onClick={handleResetChat}
                title="Reiniciar conversación"
                aria-label="Reiniciar conversación"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>

              {/* Botón Minimizar */}
              <button
                className="integrity-icon-btn"
                onClick={handleCloseWidget}
                title="Minimizar ventana"
                aria-label="Minimizar ventana"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          </header>

          {/* Panel Desplegable de Configuración Rasa */}
          {showSettings && (
            <div className="integrity-settings-panel">
              <form onSubmit={handleSaveRasaUrl} className="integrity-settings-row">
                <label className="integrity-settings-label">
                  <span>URL Servidor Rasa (REST):</span>
                  <span>Puerto :5005</span>
                </label>
                <div className="integrity-settings-input-group">
                  <input
                    type="text"
                    className="integrity-settings-input"
                    value={tempRasaUrl}
                    onChange={(e) => setTempRasaUrl(e.target.value)}
                    placeholder="http://localhost:5005"
                  />
                  <button type="submit" className="integrity-settings-btn">
                    Guardar
                  </button>
                </div>
                <div className="integrity-settings-hint">
                  {serverStatus === 'connected'
                    ? '✅ Servidor Rasa detectado y respondiendo.'
                    : 'ℹ️ Si Rasa no está corriendo, Integrity utiliza el motor clínico de Visalud para la demo.'}
                </div>
              </form>
            </div>
          )}

          {/* Área de Mensajes */}
          <div className="integrity-messages-container">
            {messages.map((msg) => (
              <div key={msg.id} className={`integrity-msg-row ${msg.role}`}>
                {msg.role === 'bot' && (
                  <img
                    src="/integrity-logo.png"
                    alt="Integrity"
                    className="integrity-msg-avatar"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                )}
                <div className="integrity-bubble">
                  <div className="integrity-bubble-text">
                    {msg.text.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx} style={{ margin: pIdx > 0 ? '8px 0 0' : 0 }}>
                        {paragraph.split('**').map((chunk, cIdx) =>
                          cIdx % 2 === 1 ? <strong key={cIdx}>{chunk}</strong> : chunk
                        )}
                      </p>
                    ))}
                  </div>

                  {/* Acciones Rápidas sugeridas por el bot */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="integrity-bubble-actions">
                      {msg.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          type="button"
                          className={`integrity-action-btn ${act.isWhatsApp ? 'whatsapp-action' : ''}`}
                          onClick={() => {
                            if (act.isWhatsApp) {
                              openWhatsApp(act.customText)
                            } else if (act.url) {
                              window.location.href = act.url
                            } else if (act.query) {
                              handleSendMessage(act.query)
                            }
                          }}
                        >
                          {act.isWhatsApp && '💬 '}
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="integrity-msg-time">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            ))}

            {/* Indicador de escritura animado */}
            {isTyping && (
              <div className="integrity-typing-row">
                <img
                  src="/integrity-logo.png"
                  alt="Integrity"
                  className="integrity-msg-avatar"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
                <div className="integrity-typing-pill">
                  <div className="integrity-typing-dot" />
                  <div className="integrity-typing-dot" />
                  <div className="integrity-typing-dot" />
                  <span className="integrity-typing-text">Integrity está respondiendo...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Chips Fijos (Preguntas frecuentes) */}
          <div className="integrity-quick-chips-wrapper">
            <div className="integrity-quick-chips-title">Preguntas Frecuentes</div>
            <div className="integrity-quick-chips">
              {QUICK_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="integrity-chip"
                  onClick={() => {
                    if (chip.isWhatsApp) {
                      openWhatsApp()
                    } else {
                      handleSendMessage(chip.query)
                    }
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Composer (Caja de texto para escribir) */}
          <footer className="integrity-composer">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="integrity-composer-form"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                className="integrity-textarea"
                placeholder="Pregúntale a Integrity sobre atención o cuidados..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={500}
                aria-label="Mensaje para Integrity"
              />
              <button
                type="submit"
                className="integrity-send-btn"
                disabled={!inputValue.trim() || isTyping}
                title="Enviar mensaje"
                aria-label="Enviar mensaje"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
            <div className="integrity-composer-footer">
              <span className="integrity-brand-watermark">
                Powered by <strong>UrbanZync AI</strong>
              </span>
              <span>Presiona Enter para enviar</span>
            </div>
          </footer>
        </aside>
      )}
    </>
  )
}
