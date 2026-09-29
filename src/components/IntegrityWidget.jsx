import { useState, useEffect, useRef } from 'react'
import './IntegrityWidget.css'

// Número y plantilla de WhatsApp oficial para coordinación con la dueña / administración
const WHATSAPP_PHONE = '56968016334'

const INITIAL_GREETING = {
  id: 'welcome-msg',
  role: 'bot',
  text: `¡Hola! 👋 Soy **Integrity**, asistente virtual inteligente de **Visalud Osorno**.\n\nTe oriento para conectar a tu familia de forma directa con **Técnicos en Enfermería (TENS)** certificados en el **cuidado de adultos mayores a domicilio en Osorno**.\n\nModalidades particulares por horas: **medio turno (6 hrs)** y **turno completo (12 hrs)**.\n\n¿Qué información necesitas hoy?`,
  timestamp: new Date(),
  actions: [
    { label: '🧮 Cotizador Inteligente (3 Pasos)', url: '#cotizador' },
    { label: '👵 Medio turno (6 hrs)', query: 'que incluye el medio turno de 6 horas' },
    { label: '🌙 Turno completo (12 hrs / Vigilia)', query: 'como funciona el turno completo de 12 horas o vigilia' },
    { label: '💳 ¿Cómo se paga? (Trato directo particular)', query: 'como es el pago y si es particular de trato directo' },
    { label: '📋 Coordinación delegada con administración', query: 'pueden coordinar ustedes los turnos por mi' },
    { label: '💬 Contactar a Coordinación', isWhatsApp: true, customText: 'Hola Visalud, quisiera consultar sobre el servicio de cuidado de adulto mayor a domicilio en Osorno' }
  ]
}

// Categorías ordenadas para acceso rápido
const QUICK_CATEGORIES = [
  { id: 'frecuentes', label: '⭐ Destacados' },
  { id: 'turnos', label: '⏱️ Turnos (6h y 12h)' },
  { id: 'cuidados', label: '👵 Cuidados TENS' },
  { id: 'pagos', label: '💳 Pagos & Particular' },
  { id: 'coordinacion', label: '📋 Coordinación Delegada' },
  { id: 'cobertura', label: '📍 Cobertura Osorno' }
]

const CHIPS_BY_CATEGORY = {
  frecuentes: [
    { label: '🧮 Cotizador de Turnos', url: '#cotizador' },
    { label: '⏱️ Medio turno (6 hrs)', query: 'que incluye el medio turno de 6 horas' },
    { label: '🌙 Turno completo (12 hrs)', query: 'como funciona el turno completo de 12 horas o vigilia' },
    { label: '💳 Pago directo al TENS (Particular)', query: 'como es el pago y si es particular de trato directo' },
    { label: '📋 Delegar coordinación a Visalud', query: 'pueden coordinar ustedes los turnos por mi' },
    { label: '📍 Sectores en Osorno', query: 'que sectores atienden en osorno' },
    { label: '💬 Hablar con Coordinación', isWhatsApp: true, customText: 'Hola Visalud, quisiera orientación para el cuidado de mi familiar en Osorno' }
  ],
  turnos: [
    { label: '🧮 Cotizar Turno a Medida', url: '#cotizador' },
    { label: '☀️ Medio turno (6 hrs diurno o tarde)', query: 'que incluye el medio turno de 6 horas' },
    { label: '🌕 Turno completo (12 hrs diurno)', query: 'como funciona el turno completo de 12 horas o vigilia' },
    { label: '🌙 Vigilia nocturna (12 hrs de noche)', query: 'como es el turno de noche de vigilia para adulto mayor' },
    { label: '📅 Turnos fin de semana', query: 'tienen cobertura de turnos para sabados y domingos' }
  ],
  cuidados: [
    { label: '🛁 Aseo y confort en cama', query: 'como es el bano en cama y aseo personal' },
    { label: '💊 Control y fármacos por horario', query: 'administracion de medicamentos segun horario' },
    { label: '🛏️ Prevención de escaras y movilidad', query: 'como previenen las escaras en pacientes postrados' },
    { label: '🧠 Pacientes con Alzheimer o demencia', query: 'atienden adultos mayores con alzheimer o demencia' }
  ],
  pagos: [
    { label: '💳 ¿Cómo se le paga al TENS?', query: 'como es el pago y si es particular de trato directo' },
    { label: '🚫 ¿Aceptan Fonasa, Isapre o bonos?', query: 'atienden por fonasa isapre o bonos' },
    { label: '💵 Medios de pago directo (Transferencia/Efectivo)', query: 'aceptan transferencia o efectivo los profesionales' },
    { label: '📋 Registro Superintendencia SIS', query: 'estan inscritos en la superintendencia de salud' }
  ],
  coordinacion: [
    { label: '🤝 ¿Qué es el puente directo?', query: 'como funciona el puente directo entre la familia y el tens' },
    { label: '📋 Delegar la gestión a la dueña', query: 'pueden coordinar ustedes los turnos por mi' },
    { label: '🔄 Reemplazos garantizados 24/7', query: 'que pasa si un tens no puede asistir a un turno' },
    { label: '💬 Solicitar propuesta a la administración', isWhatsApp: true, customText: 'Hola administración de Visalud, necesito solicitar el servicio de Coordinación Integral de Turnos para mi familiar' }
  ],
  cobertura: [
    { label: '📍 Osorno Urbano (Centro, Oriente, Rahue)', query: 'que sectores atienden en osorno' },
    { label: '🌾 Francke, Kolbe, Ovejería', query: 'atienden en francke y ovejería' },
    { label: '🚗 ¿Los TENS van a domicilio?', query: 'el servicio es 100% a domicilio en osorno' }
  ]
}

// Normalización de texto para matching clínico inteligente
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

// Motor de Conocimiento Clínico de Respaldo para Visalud Osorno
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
      isEmergency: true,
      text: `⚠️ **ALERTA DE SEGURIDAD CLÍNICA**:\n\nSi la persona presenta compromiso de conciencia, dolor agudo en el pecho, dificultad respiratoria severa o sangrado incontrolable, se trata de una urgencia médica vital.\n\nPor favor comunícate de inmediato con el **SAMU (Llama al 131)** o dirígete a la Urgencia del **Hospital Base San José de Osorno**.\n\nVisalud es un puente para atención y cuidados programados, no un servicio de rescate de ambulancias o urgencia vital inmediata.`,
      actions: [
        { label: '📞 Llamar SAMU 131', url: 'tel:131', isDanger: true },
        { label: '💬 Consultar disponibilidad WhatsApp', isWhatsApp: true, customText: 'Hola Visalud, tengo una consulta urgente sobre disponibilidad de TENS en Osorno' }
      ]
    }
  }

  // 1.5. Cotizador Interactivo de Cuidados y Turnos
  if (
    q.includes('cotiz') ||
    q.includes('calcular') ||
    q.includes('calculadora') ||
    q.includes('presupuesto') ||
    q.includes('cuanto sale') ||
    q.includes('cuanto cuesta') ||
    q.includes('tarifa') ||
    q.includes('estimar')
  ) {
    return {
      text: `🧮 **Cotizador Interactivo de Cuidados y Turnos TENS**:\n\n¡He diseñado una herramienta interactiva aquí mismo en la web para estructurar el plan ideal para tu familiar en **3 pasos guiados**!\n\n1. **Elige la modalidad**: Medio turno (6h), Turno completo (12h), Vigilia nocturna o Cuidado continuo 24/7.\n2. **Frecuencia & Sector**: Días a la semana y sector en Osorno (Centro, Rahue, Francke, Kolbe, etc.).\n3. **Cuidados clínicos**: Medicamentos por horario, baño en cama, prevención de escaras, demencia/Alzheimer, etc.\n\nTe calculará de inmediato las horas estimadas y podrás enviar la propuesta directamente a Coordinación por WhatsApp o registrarla en nuestra bandeja.`,
      actions: [
        { label: '🧮 Abrir Cotizador Interactivo', url: '#cotizador' },
        { label: '💬 Consultar disponibilidad por WhatsApp', isWhatsApp: true, customText: 'Hola Visalud, quisiera cotizar cuidados para mi familiar en Osorno' }
      ]
    }
  }

  // 2. Modalidades de Turnos: 6 horas (Medio Turno) y 12 horas (Turno Completo / Vigilia)
  if (
    q.includes('6 hora') ||
    q.includes('6 hrs') ||
    q.includes('medio turno') ||
    q.includes('12 hora') ||
    q.includes('12 hrs') ||
    q.includes('turno completo') ||
    q.includes('vigilia') ||
    q.includes('noche') ||
    q.includes('horario')
  ) {
    return {
      text: `⏱️ **Modalidades de Turnos por Horas con TENS en Osorno**:\n\nNuestros servicios de cuidado de adulto mayor se contratan por horas bajo dos modalidades principales:\n\n1. **Medio Turno (6 Horas)**:\n• Asistencia en rutinas de mañana o tarde.\n• Aseo y confort, baño asistido y cambio de ropa.\n• Apoyo en alimentación y paseos suaves.\n• Administración rigurosa de medicamentos según indicación médica.\n\n2. **Turno Completo (12 Horas - Diurno o Vigilia Nocturna)**:\n• Cuidado continuo e intensivo durante el día (ej. 08:00 a 20:00) o noche completa.\n• Control periódico de signos vitales (presión, glicemia, saturometría).\n• Movilización en cama cada 2 horas para prevención de escaras.\n• Supervisión activa del descanso nocturno para resguardo del paciente y tranquilidad familiar.`,
      actions: [
        { label: '👨‍⚕️ Ver cuidadores TENS disponibles', query: 'ver equipo de profesionales' },
        { label: '💳 ¿Cómo se coordinan y pagan?', query: 'como es el pago y si es particular de trato directo' },
        { label: '📋 ¿Prefieres que Visalud coordine los turnos?', query: 'pueden coordinar ustedes los turnos por mi' }
      ]
    }
  }

  // 3. Cuidados Generales de Adulto Mayor, Paciente Postrado, Alzheimer
  if (
    q.includes('adulto mayor') ||
    q.includes('abuelo') ||
    q.includes('abuela') ||
    q.includes('postrado') ||
    q.includes('cuidador') ||
    q.includes('cuidado') ||
    q.includes('alzheimer') ||
    q.includes('demencia') ||
    q.includes('aseo') ||
    q.includes('bano') ||
    q.includes('escara')
  ) {
    return {
      text: `👵 **Cuidado Domiciliario de Adulto Mayor por TENS Certificados**:\n\nVisalud conecta a tu familia con Técnicos en Enfermería de Nivel Superior (TENS) en Osorno con sólida formación geriátrica:\n\n• **Acompañamiento humanizado** y respeto por el ritmo del adulto mayor.\n• **Aseo y confort integral**: Baño en cama o asistido en ducha, higiene bucal y cambio de pañal.\n• **Prevención de lesiones por presión**: Lubricación de piel y cambios de posición programados.\n• **Manejo de tratamientos**: Administración de fármacos orales, control glicémico y signos vitales.\n• **Pacientes de alta dependencia**: Manejo cuidadoso de sondas, ostomías y secuelas de ACV o demencia.`,
      actions: [
        { label: '⏱️ Ver turnos de 6h y 12h', query: 'que incluye el medio turno de 6 horas' },
        { label: '💳 Ver condiciones de pago particular', query: 'como es el pago y si es particular de trato directo' },
        { label: '📲 Contactar coordinación por WhatsApp', isWhatsApp: true, customText: 'Hola Visalud, quisiera consultar por cuidadores TENS para mi familiar en Osorno' }
      ]
    }
  }

  // 4. Pagos, Modalidad Particular y Trato Directo (Sin Fonasa, Isapre ni Bonos)
  if (
    q.includes('isapre') ||
    q.includes('fonasa') ||
    q.includes('bono') ||
    q.includes('bonos') ||
    q.includes('reembolso') ||
    q.includes('pago') ||
    q.includes('pagar') ||
    q.includes('precio') ||
    q.includes('valor') ||
    q.includes('cuanto cobra') ||
    q.includes('transferencia') ||
    q.includes('efectivo') ||
    q.includes('tarjeta') ||
    q.includes('trato directo')
  ) {
    return {
      text: `💳 **Modalidad 100% Particular y de Trato Directo**:\n\nEn Visalud somos un puente directo entre tu familia y el enfermero(a) o TENS, garantizando total transparencia:\n\n• **Sin Fonasa, Isapre ni Bonos**: No se trabaja con bonos de atención institucional ni sistemas de previsión pública/privada.\n• **Trato directo con el profesional**: La tarifa y los turnos se acuerdan directamente entre la familia y el enfermero(a) o TENS.\n• **Pago directo al profesional**: La familia cancela el valor pactado directamente al técnico mediante **transferencia bancaria** o **efectivo** (según acuerden ambas partes).\n• **Sin comisiones ocultas**: La plataforma no cobra suscripciones ni recargos a las familias.`,
      actions: [
        { label: '⏱️ Consultar turnos de 6h y 12h', query: 'que incluye el medio turno de 6 horas' },
        { label: '📋 ¿Y si quiero que Visalud gestione los turnos?', query: 'pueden coordinar ustedes los turnos por mi' },
        { label: '👨‍⚕️ Ver lista de TENS', query: 'ver equipo de profesionales' }
      ]
    }
  }

  // 5. Coordinación Delegada con la Dueña / Administración de Visalud
  if (
    q.includes('coordinar') ||
    q.includes('coordinacion') ||
    q.includes('duena') ||
    q.includes('administracion') ||
    q.includes('mes') ||
    q.includes('semanal') ||
    q.includes('24/7') ||
    q.includes('reemplazo') ||
    q.includes('gestion') ||
    q.includes('delegar')
  ) {
    return {
      text: `📋 **Servicio de Coordinación Integral (Administración Visalud)**:\n\n¿Tu familiar necesita cobertura continua o no tienes tiempo para coordinar turnos individuales con los TENS?\n\nLa **Administración de Visalud** ofrece un servicio gestionado donde nosotros nos encargamos de todo:\n\n✅ **Armado de nómina y calendario**: Planificamos la rotación de turnos (6h, 12h o 24/7 continuo).\n✅ **Reemplazos garantizados**: Si un TENS presenta una emergencia o licencia, enviamos inmediatamente a otro técnico calificado sin dejar a tu familiar desatendido.\n✅ **Supervisión continua**: Control de asistencia, bitácora de novedades y contacto directo con la familia.\n\n*Este servicio de coordinación delegada es atendido directamente por la Coordinación Central de Visalud.*`,
      actions: [
        { label: '💬 Hablar con Coordinación Visalud', isWhatsApp: true, customText: 'Hola Administración de Visalud, quisiera solicitar información sobre el servicio de Coordinación Integral de Turnos para mi familiar' },
        { label: '👵 Prefiero coordinar yo directamente con un TENS', query: 'como funciona el puente directo entre la familia y el tens' }
      ]
    }
  }

  // 6. Modelo de Puente Directo
  if (
    q.includes('puente') ||
    q.includes('como funciona') ||
    q.includes('directo') ||
    q.includes('intermedia')
  ) {
    return {
      text: `🤝 **¿Cómo funciona el Puente Directo de Visalud?**:\n\n1. **Exploras el directorio**: Revisas los perfiles de los TENS certificados, su experiencia en adultos mayores y los sectores que cubren en Osorno.\n2. **Contactas por WhatsApp con un clic**: Hablas directamente con el técnico seleccionado y le planteas los requerimientos de tu familiar.\n3. **Acuerdan libremente turnos y pago**: Coordinan si necesitan medio turno (6h) o turno completo (12h) y el medio de pago directo (transferencia o efectivo).\n\n*Nota: La administración de Visalud solo interviene si la familia solicita el servicio de Coordinación Integral para delegar la gestión de turnos continuos.*`,
      actions: [
        { label: '👨‍⚕️ Ver cuidadores TENS en Osorno', query: 'ver equipo de profesionales' },
        { label: '📋 Consultar por Coordinación Delegada', query: 'pueden coordinar ustedes los turnos por mi' }
      ]
    }
  }

  // 7. Registro Superintendencia de Salud (SIS)
  if (
    q.includes('superintendencia') ||
    q.includes('sis') ||
    q.includes('acreditados') ||
    q.includes('certificados') ||
    q.includes('titulo') ||
    q.includes('confianza')
  ) {
    return {
      text: `📋 **Seguridad y Registro Oficial Superintendencia (SIS)**:\n\nTodos los Técnicos en Enfermería de Nivel Superior (TENS) que integran el directorio de Visalud cuentan con:\n\n✅ Título oficial de Técnico de Nivel Superior en Enfermería validado en Chile.\n✅ Inscripción vigente en el **Registro Nacional de Prestadores Individuales de la Superintendencia de Salud (SIS)**.\n✅ Experiencia en atención a personas mayores, trato humanizado y seguimiento familiar.`,
      actions: [
        { label: '👨‍⚕️ Ver equipo TENS en la web', query: 'ver equipo de profesionales' },
        { label: '💬 Consultar con Coordinación', isWhatsApp: true, customText: 'Hola Visalud, quisiera verificar la cobertura de TENS para mi familiar' }
      ]
    }
  }

  // 8. Cobertura en Osorno y sectores
  if (
    q.includes('sector') ||
    q.includes('cobertura') ||
    q.includes('donde') ||
    q.includes('osorno') ||
    q.includes('rahue') ||
    q.includes('francke') ||
    q.includes('centro') ||
    q.includes('oriente') ||
    q.includes('kolbe') ||
    q.includes('ovejería') ||
    q.includes('bellavista')
  ) {
    return {
      text: `📍 **Cobertura Domiciliaria en Osorno Urbano**:\n\nLos TENS de nuestra red cubren las diferentes zonas de la ciudad de Osorno:\n\n• Sector Centro y Sector Oriente\n• Rahue Alto y Rahue Bajo\n• Francke, Kolbe y Bellavista\n• Ovejería, Pilauco y Las Quemas\n\n*(Cada TENS especifica en su ficha sus sectores preferentes o disponibilidad de traslado en la ciudad).*`,
      actions: [
        { label: '👨‍⚕️ Ver TENS por sector', query: 'ver equipo de profesionales' },
        { label: '💬 Consultar disponibilidad inmediata', isWhatsApp: true, customText: 'Hola Visalud, quisiera consultar si tienen un TENS disponible en mi sector de Osorno' }
      ]
    }
  }

  // 9. Saludos / Hola
  if (
    q.includes('hola') ||
    q.includes('buenas') ||
    q.includes('buenos dias') ||
    q.includes('buenas tardes') ||
    q.includes('saludos') ||
    q.includes('ayuda')
  ) {
    return {
      text: `¡Hola! 😊 Soy **Integrity**, asistente virtual de Visalud.\n\nTe ayudo a resolver dudas y conectar con **TENS certificados en cuidado de adultos mayores a domicilio en Osorno**:\n\n1. ⏱️ **Turnos de 6 hrs (medio) y 12 hrs (completo / noche)**\n2. 💳 **Trato directo particular (sin Fonasa, Isapre ni bonos)**\n3. 📋 **Servicio de Coordinación Integral con la Administración**\n4. 📍 **Sectores de cobertura en Osorno**\n\n¿Qué te gustaría consultar?`,
      actions: [
        { label: '⏱️ Turnos de 6h y 12h', query: 'que incluye el medio turno de 6 horas' },
        { label: '💳 Pagos y trato directo', query: 'como es el pago y si es particular de trato directo' },
        { label: '📋 Coordinación Delegada', query: 'pueden coordinar ustedes los turnos por mi' },
        { label: '💬 Hablar con Coordinación', isWhatsApp: true }
      ]
    }
  }

  // 10. Respuesta por defecto
  return {
    text: `Entiendo tu consulta sobre *"${query}"*. En Visalud estamos dedicados al **cuidado del adulto mayor a domicilio en Osorno por TENS certificados** (por medios turnos de 6 hrs o turnos completos de 12 hrs).\n\nPara orientarte en detalle sobre la disponibilidad o cotizar turnos, puedes contactar directamente a nuestra Coordinación General por WhatsApp:`,
    actions: [
      { label: '💬 Contactar por WhatsApp', isWhatsApp: true, customText: `Hola Visalud, quisiera consultar sobre: "${query}" para el cuidado de un adulto mayor en Osorno` },
      { label: '⏱️ Ver turnos de 6h y 12h', query: 'que incluye el medio turno de 6 horas' },
      { label: '💳 Condiciones de pago particular', query: 'como es el pago y si es particular de trato directo' }
    ]
  }
}


export default function IntegrityWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      return localStorage.getItem('integrity_expanded') === 'true'
    } catch (e) {
      return false
    }
  })
  const [showTooltip, setShowTooltip] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('frecuentes')
  const [copiedId, setCopiedId] = useState(null)
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
  const [pingStatus, setPingStatus] = useState(null) // null | 'testing' | 'ok' | 'fail'
  const [pingLatency, setPingLatency] = useState(null)
  const [serverStatus, setServerStatus] = useState('checking') // 'checking' | 'connected' | 'demo'
  const [messages, setMessages] = useState([INITIAL_GREETING])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

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
          setServerStatus('demo')
        }
      }
    }

    checkServer()
    const interval = setInterval(checkServer, 20000)
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
    }, 14000)
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
        osc.frequency.setValueAtTime(620, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(740, ctx.currentTime + 0.08)
        gain.gain.setValueAtTime(0.08, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.1)
        osc.start()
        osc.stop(ctx.currentTime + 0.1)
      } else {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(440, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(554, ctx.currentTime + 0.12)
        gain.gain.setValueAtTime(0.09, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.18)
        osc.start()
        osc.stop(ctx.currentTime + 0.18)
      }
    } catch (e) {
      // Ignorar restricciones de audio del navegador
    }
  }

  const toggleSound = (forceVal) => {
    const next = typeof forceVal === 'boolean' ? forceVal : !soundEnabled
    setSoundEnabled(next)
    try {
      localStorage.setItem('integrity_sound', next ? 'on' : 'off')
    } catch (e) {}
    if (next) playSound('bot')
  }

  const toggleExpanded = (forceVal) => {
    const next = typeof forceVal === 'boolean' ? forceVal : !isExpanded
    setIsExpanded(next)
    try {
      localStorage.setItem('integrity_expanded', next ? 'true' : 'false')
    } catch (e) {}
  }

  const testRasaConnection = async () => {
    setPingStatus('testing')
    const start = performance.now()
    try {
      let clean = tempRasaUrl.trim().replace(/\/$/, '')
      if (!clean) clean = 'http://localhost:5005'
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2500)
      const res = await fetch(`${clean}/status`, {
        method: 'GET',
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      const duration = Math.round(performance.now() - start)
      if (res.ok) {
        setPingStatus('ok')
        setPingLatency(duration)
        setServerStatus('connected')
      } else {
        setPingStatus('fail')
      }
    } catch (err) {
      setPingStatus('fail')
    }
  }

  const handleSaveRasaUrl = (e) => {
    e.preventDefault()
    let clean = tempRasaUrl.trim().replace(/\/$/, '')
    if (!clean) clean = 'http://localhost:5005'
    setRasaUrl(clean)
    try {
      localStorage.setItem('integrity_rasa_url', clean)
    } catch (e) {}
    setServerStatus('checking')
    testRasaConnection()
  }

  const handleOpenWidget = () => {
    setIsOpen(true)
    setShowTooltip(false)
    setUnreadCount(0)
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 180)
  }

  const handleCloseWidget = () => {
    setIsOpen(false)
    setShowSettings(false)
  }

  const handleResetChat = () => {
    if (window.confirm('¿Deseas reiniciar la conversación con Integrity?')) {
      setMessages([INITIAL_GREETING])
      playSound('bot')
    }
  }

  // Enviar mensaje a WhatsApp
  const openWhatsApp = (customText) => {
    const text = customText || 'Hola Visalud, estuve conversando con Integrity en su web y quisiera solicitar información sobre sus servicios de atención a domicilio en Osorno.'
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Copiar contenido del mensaje al portapapeles
  const handleCopyText = (msgId, text) => {
    try {
      navigator.clipboard.writeText(text)
      setCopiedId(msgId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (e) {}
  }

  // Enviar mensaje al bot (Rasa o Fallback Clínico)
  const handleSendMessage = async (customText, payload) => {
    const textToSend = typeof customText === 'string' ? customText : inputValue.trim()
    if (!textToSend || isTyping) return

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

    let answered = false

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2800)

      const msgBody = payload || textToSend

      const response = await fetch(`${rasaUrl}/webhooks/rest/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: senderIdRef.current,
          message: msgBody
        }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) {
          setServerStatus('connected')
          answered = true

          const newBotMessages = data.map((item, idx) => {
            const formattedActions = (item.buttons || []).map((b) => ({
              label: b.title,
              payload: b.payload,
              query: b.title
            }))

            return {
              id: 'bot-' + Date.now() + '-' + idx,
              role: 'bot',
              text: item.text || '',
              image: item.image || null,
              actions: formattedActions.length > 0 ? formattedActions : undefined,
              timestamp: new Date()
            }
          })

          setMessages((prev) => [...prev, ...newBotMessages])
          playSound('bot')
        }
      }
    } catch (err) {
      setServerStatus('demo')
    }

    if (!answered) {
      setTimeout(() => {
        const clinicalResp = getVisaludClinicalResponse(textToSend)
        const botMsg = {
          id: 'bot-' + Date.now(),
          role: 'bot',
          text: clinicalResp.text,
          isEmergency: clinicalResp.isEmergency,
          timestamp: new Date(),
          actions: clinicalResp.actions || []
        }

        setMessages((prev) => [...prev, botMsg])
        setIsTyping(false)
        playSound('bot')

        if (!isOpen) {
          setUnreadCount((c) => c + 1)
        }
      }, 550)
    } else {
      setIsTyping(false)
      if (!isOpen) {
        setUnreadCount((c) => c + 1)
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

  // Renderizador enriquecido de párrafos y listas
  const renderMessageContent = (text) => {
    if (!text) return null
    const lines = text.split('\n')

    return lines.map((line, idx) => {
      const trimmed = line.trim()

      if (!trimmed) {
        return <div key={idx} className="integrity-paragraph-gap" />
      }

      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        const content = trimmed.replace(/^[•\-]\s*/, '')
        return (
          <div key={idx} className="integrity-list-item">
            <span className="integrity-list-bullet">✦</span>
            <span className="integrity-list-text">{renderFormattedText(content)}</span>
          </div>
        )
      }

      const numMatch = trimmed.match(/^(\d+)\.\s*(.+)/)
      if (numMatch) {
        return (
          <div key={idx} className="integrity-list-item numbered">
            <span className="integrity-list-number">{numMatch[1]}.</span>
            <span className="integrity-list-text">{renderFormattedText(numMatch[2])}</span>
          </div>
        )
      }

      return (
        <p key={idx} className="integrity-paragraph">
          {renderFormattedText(line)}
        </p>
      )
    })
  }

  const renderFormattedText = (str) => {
    const parts = str.split('**')
    return parts.map((chunk, i) =>
      i % 2 === 1 ? (
        <strong key={i} className="integrity-strong">
          {chunk}
        </strong>
      ) : (
        chunk
      )
    )
  }

  const currentChips = CHIPS_BY_CATEGORY[selectedCategory] || CHIPS_BY_CATEGORY.frecuentes

  return (
    <>
      {/* ============================================================
          1. LANZADOR FLOTANTE (BOTÓN INFERIOR DERECHO)
          ============================================================ */}
      <div className="integrity-launcher-container" aria-label="Asistente Virtual Integrity">
        {!isOpen && showTooltip && (
          <div className="integrity-launcher-tooltip">
            <div className="integrity-tooltip-avatar-wrap">
              <img
                src="/integrity-logo.png"
                alt="Integrity"
                className="integrity-tooltip-avatar"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
            <div className="integrity-tooltip-content">
              <div className="integrity-tooltip-header">
                <strong>Integrity IA</strong>
                <span className="integrity-tooltip-badge">Enfermería Visalud</span>
              </div>
              <div className="integrity-tooltip-desc">
                ¿Necesitas atención clínica a domicilio en Osorno? ¡Chatea conmigo aquí!
              </div>
              <div className="integrity-tooltip-quick-btns">
                <button
                  type="button"
                  className="integrity-tooltip-pill"
                  onClick={() => {
                    handleOpenWidget()
                    handleSendMessage('cuentame sobre las curaciones a domicilio')
                  }}
                >
                  🩹 Curaciones
                </button>
                <button
                  type="button"
                  className="integrity-tooltip-pill"
                  onClick={() => {
                    handleOpenWidget()
                    handleSendMessage('que incluyen los cuidados de adulto mayor')
                  }}
                >
                  👵 Adulto Mayor
                </button>
              </div>
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
                title={serverStatus === 'connected' ? 'Rasa Online (API)' : 'Modo Asistente Clínico Inteligente'}
              />
              {unreadCount > 0 && <span className="integrity-unread-badge">{unreadCount}</span>}
            </>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          )}
        </button>
      </div>

      {/* ============================================================
          2. VENTANA PRINCIPAL DEL ASISTENTE INTEGRITY
          ============================================================ */}
      {isOpen && (
        <aside
          className={`integrity-chat-window ${isExpanded ? 'expanded' : ''}`}
          role="dialog"
          aria-label="Chat Asistente Integrity"
        >
          {/* Header Despejado y Elegante */}
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
                <span className={`integrity-status-ping ${serverStatus}`} />
              </div>
              <div className="integrity-header-titles">
                <div className="integrity-title-row">
                  <h3 className="integrity-title">INTEGRITY</h3>
                  <span className="integrity-badge-ai">IA Visalud</span>
                </div>
                <div className="integrity-status-line">
                  <span className={`integrity-status-dot-mini ${serverStatus}`} />
                  {serverStatus === 'connected' ? (
                    <span className="integrity-status-text online">Rasa Online (IA)</span>
                  ) : serverStatus === 'checking' ? (
                    <span className="integrity-status-text checking">Sincronizando...</span>
                  ) : (
                    <span className="integrity-status-text demo">Asistente Clínico</span>
                  )}
                </div>
              </div>
            </div>

            {/* Acciones del Header: Despejadas, ordenadas y sin amontonamiento */}
            <div className="integrity-header-actions">
              {/* Botón de Configuración estilo Windows 11 */}
              <button
                className={`integrity-win-settings-btn ${showSettings ? 'active' : ''}`}
                onClick={() => setShowSettings(!showSettings)}
                title="Configuración de Integrity (Sonido, Tamaño, Servidor Rasa)"
                aria-label="Abrir panel de configuración"
              >
                <svg className="integrity-win-gear-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>

              {/* Botón Reiniciar Chat */}
              <button
                className="integrity-icon-btn"
                onClick={handleResetChat}
                title="Reiniciar chat"
                aria-label="Reiniciar conversación"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>

              {/* Botón Cerrar / Minimizar */}
              <button
                className="integrity-icon-btn close-btn"
                onClick={handleCloseWidget}
                title="Cerrar ventana"
                aria-label="Cerrar ventana"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </header>

          {/* ============================================================
              PANEL DE CONFIGURACIÓN ESTILO WINDOWS (FLUENT DESIGN)
              ============================================================ */}
          {showSettings && (
            <div className="integrity-win-settings-overlay">
              <div className="integrity-win-settings-modal">
                {/* Cabecera del Panel Windows */}
                <div className="integrity-win-settings-top">
                  <div className="integrity-win-settings-top-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="integrity-win-accent-icon">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <div>
                      <h4>Configuración</h4>
                      <p>Personaliza el asistente Integrity y la conexión Rasa</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="integrity-win-close-btn"
                    onClick={() => setShowSettings(false)}
                    aria-label="Cerrar configuración"
                  >
                    ✕
                  </button>
                </div>

                {/* Lista de Secciones y Opciones Windows Fluent */}
                <div className="integrity-win-settings-content">
                  {/* Tarjeta 1: Visualización y Pantalla (Agrandar ventana) */}
                  <div className="integrity-win-card">
                    <div className="integrity-win-card-row">
                      <div className="integrity-win-card-info">
                        <div className="integrity-win-card-title">
                          <span className="integrity-win-row-icon">🖥️</span>
                          <span>Agrandar ventana (Modo Expandido)</span>
                        </div>
                        <div className="integrity-win-card-sub">
                          Aumenta el ancho a 560px para mayor comodidad al leer diagnósticos y protocolos.
                        </div>
                      </div>
                      <label className="integrity-win-switch" title="Alternar tamaño expandido">
                        <input
                          type="checkbox"
                          checked={isExpanded}
                          onChange={(e) => toggleExpanded(e.target.checked)}
                        />
                        <span className="integrity-win-slider" />
                      </label>
                    </div>
                  </div>

                  {/* Tarjeta 2: Efectos de Sonido */}
                  <div className="integrity-win-card">
                    <div className="integrity-win-card-row">
                      <div className="integrity-win-card-info">
                        <div className="integrity-win-card-title">
                          <span className="integrity-win-row-icon">🔊</span>
                          <span>Efectos de sonido de mensajes</span>
                        </div>
                        <div className="integrity-win-card-sub">
                          Reproduce una señal acústica suave al enviar y recibir respuestas de enfermería.
                        </div>
                      </div>
                      <div className="integrity-win-switch-group">
                        <button
                          type="button"
                          className="integrity-win-btn-secondary"
                          onClick={() => playSound('bot')}
                          title="Probar sonido"
                        >
                          Probar
                        </button>
                        <label className="integrity-win-switch" title="Activar/Desactivar sonido">
                          <input
                            type="checkbox"
                            checked={soundEnabled}
                            onChange={(e) => toggleSound(e.target.checked)}
                          />
                          <span className="integrity-win-slider" />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta 3: Servidor Rasa NLU & API */}
                  <div className="integrity-win-card">
                    <div className="integrity-win-card-title">
                      <span className="integrity-win-row-icon">🤖</span>
                      <span>Servidor Rasa Core & NLU (API)</span>
                    </div>
                    <div className="integrity-win-card-sub">
                      Dirección del servicio REST para el procesamiento de lenguaje natural entrenado.
                    </div>

                    <form onSubmit={handleSaveRasaUrl} className="integrity-win-form">
                      <div className="integrity-win-input-wrapper">
                        <input
                          type="text"
                          className="integrity-win-input"
                          value={tempRasaUrl}
                          onChange={(e) => {
                            setTempRasaUrl(e.target.value)
                            setPingStatus(null)
                          }}
                          placeholder="http://localhost:5005"
                        />
                        <button
                          type="button"
                          className="integrity-win-btn-secondary"
                          onClick={testRasaConnection}
                          disabled={pingStatus === 'testing'}
                        >
                          {pingStatus === 'testing'
                            ? 'Probando...'
                            : pingStatus === 'ok'
                            ? `✅ Ping (${pingLatency}ms)`
                            : pingStatus === 'fail'
                            ? '❌ Sin respuesta'
                            : 'Probar ping'}
                        </button>
                        <button type="submit" className="integrity-win-btn-primary">
                          Guardar
                        </button>
                      </div>
                    </form>

                    <div className="integrity-win-status-badge">
                      {serverStatus === 'connected' ? (
                        <span className="status-badge-ok">
                          🟢 Conectado con Rasa API (Puerto :5005 activo)
                        </span>
                      ) : (
                        <span className="status-badge-demo">
                          ⚡ Modo Asistente Clínico Inteligente (Respaldo Visalud activo)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tarjeta 4: Contacto Directo WhatsApp */}
                  <div className="integrity-win-card">
                    <div className="integrity-win-card-row">
                      <div className="integrity-win-card-info">
                        <div className="integrity-win-card-title">
                          <span className="integrity-win-row-icon">💬</span>
                          <span>Atención Humana Directa</span>
                        </div>
                        <div className="integrity-win-card-sub">
                          ¿Prefieres coordinar una enfermera o turno directamente por WhatsApp?
                        </div>
                      </div>
                      <button
                        type="button"
                        className="integrity-win-btn-wa"
                        onClick={() => openWhatsApp()}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.52 3.48A11.94 11.94 0 0 0 12.06 0C5.46 0 .09 5.37.09 11.97c0 2.11.55 4.16 1.6 5.98L0 24l6.23-1.63a11.92 11.92 0 0 0 5.83 1.51h.01c6.6 0 11.97-5.37 11.97-11.97 0-3.2-1.25-6.21-3.52-8.43z" />
                        </svg>
                        <span>Abrir WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer de Configuración */}
                <div className="integrity-win-settings-footer">
                  <span>Integrity Clinical v2.4 · Visalud Osorno</span>
                  <button
                    type="button"
                    className="integrity-win-btn-primary"
                    onClick={() => setShowSettings(false)}
                  >
                    Listo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Banner de Garantía Clínica Visalud */}
          <div className="integrity-assurance-banner">
            <span className="integrity-assurance-icon">🛡️</span>
            <span>Atención a domicilio en Osorno · Registro Superintendencia de Salud (SIS)</span>
          </div>

          {/* Área de Mensajes */}
          <div className="integrity-messages-container">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`integrity-msg-row ${msg.role} ${msg.isEmergency ? 'emergency-card' : ''}`}
              >
                {msg.role === 'bot' && (
                  <div className="integrity-msg-avatar-wrap">
                    <img
                      src="/integrity-logo.png"
                      alt="Integrity"
                      className="integrity-msg-avatar"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <div className="integrity-bubble-wrapper">
                  <div className={`integrity-bubble ${msg.isEmergency ? 'emergency' : ''}`}>
                    {/* Botón copiar mensaje en hover */}
                    <button
                      type="button"
                      className="integrity-copy-btn"
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      title="Copiar texto"
                    >
                      {copiedId === msg.id ? (
                        <span>✓ Copiado</span>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </button>

                    <div className="integrity-bubble-text">{renderMessageContent(msg.text)}</div>

                    {/* Acciones Rápidas sugeridas en la respuesta */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="integrity-bubble-actions">
                        {msg.actions.map((act, aIdx) => (
                          <button
                            key={aIdx}
                            type="button"
                            className={`integrity-action-btn ${
                              act.isDanger
                                ? 'danger-action'
                                : act.isWhatsApp
                                ? 'whatsapp-action'
                                : ''
                            }`}
                            onClick={() => {
                              if (act.isWhatsApp) {
                                openWhatsApp(act.customText)
                              } else if (act.url) {
                                if (act.url.startsWith('#')) {
                                  setIsOpen(false)
                                  const target = document.querySelector(act.url)
                                  if (target) {
                                    target.scrollIntoView({ behavior: 'smooth' })
                                  }
                                } else {
                                  window.location.href = act.url
                                }
                              } else if (act.payload) {
                                handleSendMessage(act.label, act.payload)
                              } else if (act.query) {
                                handleSendMessage(act.query)
                              }
                            }}
                          >
                            {act.isDanger && '🚨 '}
                            {act.isWhatsApp && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.52 3.48A11.94 11.94 0 0 0 12.06 0C5.46 0 .09 5.37.09 11.97c0 2.11.55 4.16 1.6 5.98L0 24l6.23-1.63a11.92 11.92 0 0 0 5.83 1.51h.01c6.6 0 11.97-5.37 11.97-11.97 0-3.2-1.25-6.21-3.52-8.43z" />
                              </svg>
                            )}
                            <span>{act.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="integrity-bubble-footer">
                      <span className="integrity-msg-time">{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Indicador de escritura animado */}
            {isTyping && (
              <div className="integrity-typing-row">
                <div className="integrity-msg-avatar-wrap">
                  <img
                    src="/integrity-logo.png"
                    alt="Integrity"
                    className="integrity-msg-avatar"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
                <div className="integrity-typing-pill">
                  <div className="integrity-typing-dot" />
                  <div className="integrity-typing-dot" />
                  <div className="integrity-typing-dot" />
                  <span className="integrity-typing-text">Integrity está analizando...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Chips Fijos Organizados por Categorías */}
          <div className="integrity-quick-section">
            <div className="integrity-cat-tabs">
              {QUICK_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`integrity-cat-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="integrity-quick-chips">
              {currentChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`integrity-chip ${chip.isWhatsApp ? 'wa-chip' : ''}`}
                  onClick={() => {
                    if (chip.isWhatsApp) {
                      openWhatsApp()
                    } else if (chip.url) {
                      if (chip.url.startsWith('#')) {
                        setIsOpen(false)
                        const target = document.querySelector(chip.url)
                        if (target) {
                          target.scrollIntoView({ behavior: 'smooth' })
                        }
                      } else {
                        window.location.href = chip.url
                      }
                    } else {
                      handleSendMessage(chip.query)
                    }
                  }}
                >
                  {chip.isWhatsApp && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.52 3.48A11.94 11.94 0 0 0 12.06 0C5.46 0 .09 5.37.09 11.97c0 2.11.55 4.16 1.6 5.98L0 24l6.23-1.63a11.92 11.92 0 0 0 5.83 1.51h.01c6.6 0 11.97-5.37 11.97-11.97 0-3.2-1.25-6.21-3.52-8.43z" />
                    </svg>
                  )}
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
                placeholder="Escribe tu consulta clínica o servicio aquí..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={400}
                aria-label="Mensaje para Integrity"
              />

              {inputValue.length > 0 && (
                <button
                  type="button"
                  className="integrity-clear-btn"
                  onClick={() => {
                    setInputValue('')
                    textareaRef.current?.focus()
                  }}
                  title="Borrar texto"
                >
                  ✕
                </button>
              )}

              <button
                type="button"
                className="integrity-wa-composer-btn"
                onClick={() => openWhatsApp(inputValue ? `Hola Visalud, quisiera consultar sobre: "${inputValue}"` : undefined)}
                title="Enviar consulta directamente a WhatsApp"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.52 3.48A11.94 11.94 0 0 0 12.06 0C5.46 0 .09 5.37.09 11.97c0 2.11.55 4.16 1.6 5.98L0 24l6.23-1.63a11.92 11.92 0 0 0 5.83 1.51h.01c6.6 0 11.97-5.37 11.97-11.97 0-3.2-1.25-6.21-3.52-8.43z" />
                </svg>
              </button>

              <button
                type="submit"
                className="integrity-send-btn"
                disabled={!inputValue.trim() || isTyping}
                title="Enviar mensaje (Enter)"
                aria-label="Enviar mensaje"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>

            <div className="integrity-composer-footer">
              <span className="integrity-brand-watermark">
                Integrity · Powered by <strong>UrbanZync AI</strong>
              </span>
              <span className="integrity-keyboard-hint">Enter para enviar</span>
            </div>
          </footer>
        </aside>
      )}
    </>
  )
}
