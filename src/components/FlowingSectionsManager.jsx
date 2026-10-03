import { useState, useEffect } from 'react'
import FlowingMenu from './FlowingMenu.jsx'
import CareCalculator from './CareCalculator.jsx'
import Testimonials from './Testimonials.jsx'
import FAQSection from './FAQSection.jsx'
import './FlowingSectionsManager.css'

export default function FlowingSectionsManager() {
  // Estado de la ventana activa: null | 'cotizador' | 'comentarios' | 'faq'
  const [activeWindow, setActiveWindow] = useState(null)

  // Abrir ventana si se navega mediante hash (#cotizador, #testimonios, #faq)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash
      if (hash === '#cotizador') {
        setActiveWindow('cotizador')
      } else if (hash === '#testimonios') {
        setActiveWindow('comentarios')
      } else if (hash === '#faq') {
        setActiveWindow('faq')
      }
    }

    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  // Bloquear scroll de la página cuando la ventana está abierta y escuchar tecla ESC
  useEffect(() => {
    if (activeWindow) {
      document.body.style.overflow = 'hidden'
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          closeWindow()
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleKeyDown)
      }
    } else {
      document.body.style.overflow = ''
    }
  }, [activeWindow])

  const openWindow = (sectionKey) => {
    setActiveWindow(sectionKey)
  }

  const closeWindow = () => {
    setActiveWindow(null)
    // Limpiar hash si corresponde
    if (window.location.hash === '#cotizador' || window.location.hash === '#testimonios' || window.location.hash === '#faq') {
      history.pushState(null, '', window.location.pathname)
    }
  }

  const flowingMenuItems = [
    {
      link: '#cotizador',
      tag: '🩺 CUIDADOS CLÍNICOS & TURNOS TENS',
      tagBgColor: 'rgba(0, 184, 148, 0.28)',
      tagTextColor: '#5eead4',
      text: 'COTIZADOR DE SALUD Y TURNOS TENS',
      subtext: 'Calcula al instante turnos de 12h, 24h y atención de enfermería a domicilio en Osorno',
      actionHint: '🧮 Abrir Cotizador en Pantalla Completa',
      itemBgColor: "radial-gradient(ellipse 65% 85% at 50% 50%, rgba(0, 184, 148, 0.26), transparent 75%), linear-gradient(90deg, rgba(2, 34, 28, 0.95) 0%, rgba(4, 52, 44, 0.86) 50%, rgba(2, 34, 28, 0.95) 100%), url('/fotos visalud/visalud1.webp') center/cover no-repeat",
      itemTextColor: '#ffffff',
      marqueeBgColor: 'linear-gradient(90deg, #007a6d 0%, #00b894 30%, #059669 70%, #007a6d 100%)',
      marqueeTextColor: '#ffffff',
      marqueeText: '🩺 COTIZADOR CLÍNICO · CUIDADOS TENS A DOMICILIO · TURNOS 12H Y 24H · REHABILITACIÓN Y ENFERMERÍA EN OSORNO · HAZ CLIC PARA CALCULAR',
      image: '/fotos visalud/visalud1.webp',
      onClick: () => openWindow('cotizador'),
    },
    {
      link: '#testimonios',
      tag: '⭐ 4.9/5 · OPINIONES REALES DE FAMILIAS',
      tagBgColor: 'rgba(245, 158, 11, 0.28)',
      tagTextColor: '#fde047',
      text: 'HISTORIAS Y COMENTARIOS DE PACIENTES',
      subtext: 'Descubre las vivencias de familias que han confiado el bienestar de sus seres queridos en Visalud',
      actionHint: '💬 Ver Historias y Opiniones Verificadas',
      itemBgColor: "radial-gradient(ellipse 65% 85% at 50% 50%, rgba(245, 158, 11, 0.24), transparent 75%), linear-gradient(90deg, rgba(34, 19, 1, 0.95) 0%, rgba(56, 32, 3, 0.86) 50%, rgba(34, 19, 1, 0.95) 100%), url('/fotos visalud/visalud4.webp') center/cover no-repeat",
      itemTextColor: '#ffffff',
      marqueeBgColor: 'linear-gradient(90deg, #b45309 0%, #f59e0b 25%, #fbbf24 75%, #b45309 100%)',
      marqueeTextColor: '#080e1a',
      marqueeText: '⭐ 4.9/5 ESTRELLAS · HISTORIAS REALES DE PACIENTES Y FAMILIAS · VOCACIÓN, CARIÑO Y CUIDADO DIGNO EN CADA HOGAR · HAZ CLIC PARA LEER',
      image: '/fotos visalud/visalud4.webp',
      onClick: () => openWindow('comentarios'),
    },
    {
      link: '#faq',
      tag: '📋 GUÍA CLÍNICA, SIS & COBERTURA',
      tagBgColor: 'rgba(99, 102, 241, 0.3)',
      tagTextColor: '#c7d2fe',
      text: 'PREGUNTAS FRECUENTES Y GUÍA CLÍNICA',
      subtext: 'Resolvemos tus dudas sobre reembolsos FONASA e ISAPRE, registro SIS, insumos y asignación de turnos',
      actionHint: '❓ Consultar Preguntas y Cobertura',
      itemBgColor: "radial-gradient(ellipse 65% 85% at 50% 50%, rgba(99, 102, 241, 0.26), transparent 75%), linear-gradient(90deg, rgba(8, 16, 42, 0.95) 0%, rgba(20, 36, 84, 0.86) 50%, rgba(8, 16, 42, 0.95) 100%), url('/fotos visalud/visalud2.webp') center/cover no-repeat",
      itemTextColor: '#ffffff',
      marqueeBgColor: 'linear-gradient(90deg, #3730a3 0%, #4f46e5 30%, #6366f1 70%, #3730a3 100%)',
      marqueeTextColor: '#ffffff',
      marqueeText: '📋 PREGUNTAS FRECUENTES · ¿CÓMO CONTRATAR? · REEMBOLSOS ISAPRE Y SEGUROS · TENS REGISTRADOS SIS · TODO LO QUE DEBES SABER · HAZ CLIC PARA VER',
      image: '/fotos visalud/visalud2.webp',
      onClick: () => openWindow('faq'),
    },
  ]

  return (
    <section className="flowing-sections-section" id="cotizador" aria-label="Secciones Interactivas de Visalud">
      {/* Barra superior de experiencia interactiva de lado a lado */}
      <div className="flowing-experience-header">
        <div className="flowing-exp-info">
          <span className="flowing-exp-pulse-badge">
            <span className="flowing-pulse-dot" /> NAVEGACIÓN EN TIEMPO REAL
          </span>
          <p className="flowing-exp-guide">
            Pasa el cursor sobre cada banda para ver el flujo y <strong>haz clic en cualquier fila</strong> para abrir su ventana interactiva.
          </p>
        </div>
        <div className="flowing-exp-quick-pills">
          <button
            type="button"
            className="flowing-pill-btn pill-cotizador"
            onClick={() => openWindow('cotizador')}
          >
            🩺 Cotizador Clínico
          </button>
          <button
            type="button"
            className="flowing-pill-btn pill-comentarios"
            onClick={() => openWindow('comentarios')}
          >
            ⭐ Opiniones (4.9/5)
          </button>
          <button
            type="button"
            className="flowing-pill-btn pill-faq"
            onClick={() => openWindow('faq')}
          >
            📋 Preguntas Frecuentes
          </button>
        </div>
      </div>

      <div className="flowing-sections-container">
        {/* Contenedor del FlowingMenu de lado a lado */}
        <div className="flowing-sections-menu-box">
          <FlowingMenu
            items={flowingMenuItems}
            speed={15}
            bgColor="#030807"
            textColor="#ffffff"
            borderColor="rgba(255, 255, 255, 0.14)"
          />
        </div>
      </div>

      {/* Ventana Modal que se expande y se cierra al hacer clic */}
      {activeWindow && (
        <div className="flowing-window-overlay animate-fade-in" onClick={closeWindow}>
          <div
            className={`flowing-window-modal window-${activeWindow} animate-scale-in`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Barra superior de la ventana con navegación por pestañas */}
            <div className="flowing-window-header">
              <div className="flowing-window-title">
                {activeWindow === 'cotizador' && (
                  <>
                    <span className="window-icon">🩺</span>
                    <span>Cotizador Interactivo de Salud y Cuidados Clínicos</span>
                  </>
                )}
                {activeWindow === 'comentarios' && (
                  <>
                    <span className="window-icon">⭐</span>
                    <span>Historias y Comentarios de Pacientes y Familias</span>
                  </>
                )}
                {activeWindow === 'faq' && (
                  <>
                    <span className="window-icon">📋</span>
                    <span>Preguntas Frecuentes y Guía Clínica</span>
                  </>
                )}
              </div>

              {/* Selector de pestañas para cambiar de sección sin cerrar la ventana */}
              <div className="flowing-window-nav-tabs" role="tablist" aria-label="Cambiar sección">
                <button
                  type="button"
                  className={`flowing-modal-tab tab-cotizador ${activeWindow === 'cotizador' ? 'active' : ''}`}
                  onClick={() => openWindow('cotizador')}
                  title="Ver Cotizador Interactivo"
                >
                  <span className="tab-dot" />
                  <span>🩺 Cotizador</span>
                </button>
                <button
                  type="button"
                  className={`flowing-modal-tab tab-comentarios ${activeWindow === 'comentarios' ? 'active' : ''}`}
                  onClick={() => openWindow('comentarios')}
                  title="Ver Comentarios de Familias"
                >
                  <span className="tab-dot" />
                  <span>⭐ Comentarios</span>
                </button>
                <button
                  type="button"
                  className={`flowing-modal-tab tab-faq ${activeWindow === 'faq' ? 'active' : ''}`}
                  onClick={() => openWindow('faq')}
                  title="Ver Preguntas Frecuentes"
                >
                  <span className="tab-dot" />
                  <span>📋 Preguntas</span>
                </button>
              </div>

              <button
                type="button"
                className="btn-close-flowing-window"
                onClick={closeWindow}
                aria-label="Cerrar ventana"
                title="Cerrar ventana (Esc)"
              >
                <span>Cerrar</span>
                <span className="close-x">✕</span>
              </button>
            </div>

            {/* Contenido expandido dentro de la ventana */}
            <div className="flowing-window-body">
              {activeWindow === 'cotizador' && <CareCalculator />}
              {activeWindow === 'comentarios' && <Testimonials />}
              {activeWindow === 'faq' && <FAQSection />}
            </div>

            {/* Barra inferior para cerrar o cambiar a la siguiente sección */}
            <div className="flowing-window-footer">
              <div className="flowing-footer-left-hint">
                <span>Tip: Presiona <strong>ESC</strong> para volver al menú de inicio</span>
              </div>

              <div className="flowing-footer-actions">
                {activeWindow === 'cotizador' && (
                  <button
                    type="button"
                    className="btn-window-switch-next"
                    onClick={() => openWindow('comentarios')}
                  >
                    Ver Comentarios de Familias →
                  </button>
                )}
                {activeWindow === 'comentarios' && (
                  <button
                    type="button"
                    className="btn-window-switch-next"
                    onClick={() => openWindow('faq')}
                  >
                    Ver Preguntas Frecuentes →
                  </button>
                )}
                {activeWindow === 'faq' && (
                  <button
                    type="button"
                    className="btn-window-switch-next"
                    onClick={() => openWindow('cotizador')}
                  >
                    Ir a Cotizador de Turnos →
                  </button>
                )}

                <button
                  type="button"
                  className="btn-window-footer-close"
                  onClick={closeWindow}
                >
                  ✕ Cerrar ventana y volver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
