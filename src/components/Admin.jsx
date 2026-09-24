import { useState, useEffect, useMemo, useRef } from 'react'
import { professionalsService } from '../services/professionalsService.js'
import './Admin.css'

const SERVICES_OPTIONS = [
  { id: 'cuidados-adulto-mayor', name: 'Cuidados Adulto Mayor' },
  { id: 'inyecciones', name: 'Inyecciones y Tratamientos' },
  { id: 'curaciones-de-heridas', name: 'Curaciones de Heridas' },
]

// Avatar neutral por defecto cuando no se ha subido fotografía
export const DEFAULT_AVATAR_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='%23008d7e'%3E%3Crect width='200' height='200' fill='%23e6f5f3'/%3E%3Cpath d='M100 105c19.33 0 35-15.67 35-35S119.33 35 100 35 65 50.67 65 70s15.67 35 35 35zm0 18c-26.67 0-80 13.37-80 40v17h160v-17c0-26.63-53.33-40-80-40z' fill='%23008d7e'/%3E%3C/svg%3E"

// Función para procesar y optimizar imágenes subidas desde el explorador del usuario
const compressImageFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen válida (JPG, PNG o WebP).'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const MAX_DIM = 640
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width)
            width = MAX_DIM
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height)
            height = MAX_DIM
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        let dataUrl = ''
        try {
          dataUrl = canvas.toDataURL('image/webp', 0.88)
        } catch {
          dataUrl = canvas.toDataURL('image/jpeg', 0.88)
        }
        resolve(dataUrl)
      }
      img.onerror = () => reject(new Error('No se pudo procesar la imagen seleccionada.'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Error al leer el archivo desde el dispositivo.'))
    reader.readAsDataURL(file)
  })
}

const INITIAL_FORM = {
  id: '',
  name: '',
  serviceId: 'cuidados-adulto-mayor',
  serviceName: 'Cuidados Adulto Mayor',
  specialty: '',
  regNumber: 'Reg. SIS N° ',
  image: '',
  address: 'Osorno y Servicio a Domicilio',
  phone: '+56 9 ',
  whatsapp: '569',
  attention: 'Lunes a Viernes (08:30 - 18:30)',
  modality: 'A Domicilio en Osorno',
  convenios: 'Fonasa, Isapre y Particular',
  bio: '',
  status: 'active',
  order_index: 1,
}

export default function Admin({
  onBackToSite,
  theme,
  onToggleTheme,
  currentUser,
  userRole = 'admin',
  onSignOut,
}) {
  const [professionals, setProfessionals] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [isSupabase, setIsSupabase] = useState(false)
  const [activeTab, setActiveTab] = useState('list') // 'list' | 'guide'

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Subida de imagen como archivo adjunto
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showUrlField, setShowUrlField] = useState(false)
  const [isProcessingImage, setIsProcessingImage] = useState(false)

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState(null)

  // Confirm delete modal
  const [deleteTarget, setDeleteTarget] = useState(null)

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => {
      setToastMessage(null)
    }, 3800)
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await professionalsService.getProfessionals()
      setProfessionals(res.data || [])
      setIsSupabase(res.source === 'supabase')
    } catch (err) {
      console.error(err)
      showToast('Error cargando profesionales', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const unsubscribe = professionalsService.onProfessionalsChange(() => {
      loadData()
    })
    return () => unsubscribe()
  }, [])

  // Filtrado
  const filteredList = useMemo(() => {
    return professionals.filter((p) => {
      const matchesService = serviceFilter === 'all' || p.serviceId === serviceFilter
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.specialty?.toLowerCase().includes(q) ||
        p.serviceName?.toLowerCase().includes(q) ||
        p.bio?.toLowerCase().includes(q)
      return matchesService && matchesSearch
    })
  }, [professionals, serviceFilter, searchQuery])

  // Métricas del Panel Clínico
  const stats = useMemo(() => {
    const total = professionals.length
    const active = professionals.filter((p) => p.status === 'active').length
    const servicesCount = new Set(professionals.map((p) => p.serviceId)).size
    return { total, active, servicesCount }
  }, [professionals])

  // Procesar archivo de imagen adjunta
  const processAndSetImage = async (file) => {
    if (!file) return
    setIsProcessingImage(true)
    setFormError('')
    try {
      const optimizedDataUrl = await compressImageFile(file)
      setFormData((prev) => ({ ...prev, image: optimizedDataUrl }))
      showToast('Fotografía adjunta y optimizada correctamente')
    } catch (err) {
      console.error('Error procesando imagen:', err)
      setFormError(err.message || 'No se pudo cargar la imagen.')
    } finally {
      setIsProcessingImage(false)
    }
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      processAndSetImage(file)
    }
    e.target.value = ''
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processAndSetImage(file)
    }
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }))
  }

  // Abrir modal para crear
  const handleOpenCreate = () => {
    setEditingId(null)
    setFormData({
      ...INITIAL_FORM,
      id: `pro-${Date.now()}`,
      order_index: professionals.length + 1,
    })
    setShowUrlField(false)
    setFormError('')
    setIsModalOpen(true)
  }

  // Abrir modal para editar
  const handleOpenEdit = (pro) => {
    setEditingId(pro.id)
    setFormData({
      id: pro.id,
      name: pro.name || '',
      serviceId: pro.serviceId || 'cuidados-adulto-mayor',
      serviceName: pro.serviceName || 'Cuidados Adulto Mayor',
      specialty: pro.specialty || '',
      regNumber: pro.regNumber || '',
      image: pro.image || '',
      address: pro.address || '',
      phone: pro.phone || '',
      whatsapp: pro.whatsapp || '',
      attention: pro.attention || '',
      modality: pro.modality || '',
      convenios: pro.convenios || '',
      bio: pro.bio || '',
      status: pro.status || 'active',
      order_index: pro.order_index ?? 1,
    })
    setShowUrlField(Boolean(pro?.image && pro.image.startsWith('http')))
    setFormError('')
    setIsModalOpen(true)
  }

  const handleServiceChange = (e) => {
    const selected = SERVICES_OPTIONS.find((s) => s.id === e.target.value)
    setFormData((prev) => ({
      ...prev,
      serviceId: e.target.value,
      serviceName: selected ? selected.name : prev.serviceName,
    }))
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setFormError('Por favor ingresa el nombre del profesional.')
      return
    }
    if (!formData.specialty.trim()) {
      setFormError('Por favor ingresa la especialidad o título.')
      return
    }

    setIsSubmitting(true)
    setFormError('')
    try {
      if (editingId) {
        await professionalsService.updateProfessional(editingId, formData)
        showToast(`Profesional "${formData.name}" actualizado con éxito.`)
      } else {
        await professionalsService.createProfessional(formData)
        showToast(`Nuevo profesional "${formData.name}" creado con éxito.`)
      }
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      console.error(err)
      setFormError('Ocurrió un error al guardar los cambios.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await professionalsService.deleteProfessional(deleteTarget.id)
      showToast(`Profesional "${deleteTarget.name}" eliminado correctamente.`, 'info')
      setDeleteTarget(null)
      loadData()
    } catch (err) {
      console.error(err)
      showToast('Error al eliminar profesional.', 'error')
    }
  }

  const handleResetDefaults = async () => {
    if (window.confirm('¿Estás seguro de restablecer los profesionales a los datos por defecto iniciales?')) {
      await professionalsService.resetToDefaults()
      showToast('Datos restablecidos a los 8 profesionales base.', 'info')
      loadData()
    }
  }

  return (
    <div className={`visalud-admin theme-${theme || 'light'}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`admin-toast ${toastMessage.type}`} role="alert">
          <span className="toast-icon">
            {toastMessage.type === 'error' ? '❌' : toastMessage.type === 'info' ? 'ℹ️' : '✅'}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Admin Top Navigation */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <img src="/visalud-logo.png" alt="Visalud" className="admin-logo-img" />
            <div className="admin-title-wrap">
              <h1 className="admin-main-title">Panel de Control Profesional</h1>
              <span className="admin-subtitle">Gestión Clínica Integral & Tarjetas de Profesionales</span>
            </div>
          </div>

          <div className="admin-header-actions">
            {/* Supabase Status Pill */}
            <div
              className={`db-status-pill ${isSupabase ? 'connected' : 'local'}`}
              title={
                isSupabase
                  ? 'Conectado a la Base de Datos Supabase en la nube'
                  : 'Modo LocalStorage activo (Sin claves .env de Supabase o en fallback)'
              }
            >
              <span className="status-dot" />
              <span className="status-label">
                {isSupabase ? 'Supabase Conectado' : 'Modo Almacenamiento Local'}
              </span>
            </div>

            {/* Pill de Usuario Activo y Rol */}
            {currentUser && (
              <div className={`admin-user-pill role-${userRole}`} title={`Sesión activa: ${currentUser.email}`}>
                <span className="user-pill-icon">{userRole === 'support' ? '🛠️' : '🩺'}</span>
                <div className="user-pill-meta">
                  <span className="user-pill-role">
                    {userRole === 'support' ? 'Soporte Técnico' : 'Admin Clínico'}
                  </span>
                  <span className="user-pill-email">{currentUser.email}</span>
                </div>
              </div>
            )}

            {/* Botón Cerrar Sesión */}
            {onSignOut && (
              <button
                type="button"
                className="btn-admin-logout"
                onClick={onSignOut}
                title="Cerrar sesión activa del panel"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Salir</span>
              </button>
            )}

            <button
              type="button"
              className="btn-exit-admin"
              onClick={onBackToSite}
              title="Volver a la página principal de Visalud"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Volver a Visalud</span>
            </button>

            {onToggleTheme && (
              <button
                type="button"
                className="admin-theme-btn"
                onClick={onToggleTheme}
                title="Alternar Modo Oscuro / Claro"
              >
                {theme === 'dark' ? '☀️ Claro' : '🌙 Oscuro'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="admin-main">
        <div className="admin-container">
          {/* Admin Navigation Tabs */}
          <div className="admin-tabs-bar">
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Profesionales Activos ({professionals.length})</span>
            </button>

            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
              onClick={() => setActiveTab('guide')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
              <span>Guía Paso a Paso Supabase</span>
              {!isSupabase && <span className="tab-alert-dot" title="Aún no configurado con Supabase" />}
            </button>
          </div>

          {/* TAB 1: LISTADO DE PROFESIONALES */}
          {activeTab === 'list' && (
            <div className="admin-content-section">
              {/* Barra de Estadísticas y Métricas Clínicas */}
              <div className="admin-stats-grid">
                <div className="admin-stat-card stat-total">
                  <div className="stat-icon-wrap">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Total Profesionales</span>
                    <strong className="stat-value">{stats.total}</strong>
                    <span className="stat-subtext">Equipo clínico registrado</span>
                  </div>
                </div>

                <div className="admin-stat-card stat-active">
                  <div className="stat-icon-wrap">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Agenda Abierta</span>
                    <strong className="stat-value">{stats.active}</strong>
                    <span className="stat-subtext">Visibles en sitio web</span>
                  </div>
                </div>

                <div className="admin-stat-card stat-services">
                  <div className="stat-icon-wrap">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Áreas de Salud</span>
                    <strong className="stat-value">{stats.servicesCount}</strong>
                    <span className="stat-subtext">Servicios especializados</span>
                  </div>
                </div>

                <div className={`admin-stat-card stat-sync ${isSupabase ? 'cloud' : 'local'}`}>
                  <div className="stat-icon-wrap">
                    {isSupabase ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                      </svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <ellipse cx="12" cy="5" rx="9" ry="3" />
                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                      </svg>
                    )}
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Base de Datos</span>
                    <strong className="stat-value">{isSupabase ? 'Supabase Nube' : 'Local'}</strong>
                    <span className="stat-subtext">
                      {isSupabase ? 'Sincronización en vivo' : 'Persistente en navegador'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Barra de Filtros y Creación */}
              <div className="admin-controls-card">
                <div className="search-and-filters">
                  {/* Buscador */}
                  <div className="admin-search-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Buscar por nombre, especialidad o servicio..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        className="clear-search"
                        onClick={() => setSearchQuery('')}
                        title="Limpiar búsqueda"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Selector de Servicio */}
                  <div className="admin-filter-select-wrap">
                    <label htmlFor="service-filter" className="sr-only">Filtrar por Servicio</label>
                    <select
                      id="service-filter"
                      value={serviceFilter}
                      onChange={(e) => setServiceFilter(e.target.value)}
                      className="admin-select"
                    >
                      <option value="all">Todos los Servicios</option>
                      {SERVICES_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Acciones principales */}
                <div className="admin-primary-actions">
                  <button
                    type="button"
                    className="btn-create-pro"
                    onClick={handleOpenCreate}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>+ Agregar Profesional</span>
                  </button>

                  {userRole === 'support' && (
                    <button
                      type="button"
                      className="btn-secondary-action"
                      onClick={handleResetDefaults}
                      title="Restablecer los 8 profesionales originales para pruebas (Solo Soporte Técnico)"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                        <path d="M3 21v-5h5" />
                      </svg>
                      <span>Restablecer Base</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Grid / Lista de Tarjetas en Admin */}
              {loading ? (
                <div className="admin-loading-state">
                  <div className="admin-spinner" />
                  <p>Cargando catálogo de profesionales...</p>
                </div>
              ) : filteredList.length === 0 ? (
                <div className="admin-empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>No se encontraron profesionales</h3>
                  <p>Intenta con otro término de búsqueda o crea uno nuevo con el botón superior.</p>
                  <button
                    type="button"
                    className="btn-create-pro"
                    onClick={handleOpenCreate}
                  >
                    + Crear Profesional
                  </button>
                </div>
              ) : (
                <div className="admin-professionals-grid">
                  {filteredList.map((pro) => (
                    <article key={pro.id} className={`admin-pro-card service-type-${pro.serviceId}`}>
                      <div className="admin-card-header">
                        <div className="admin-card-avatar-wrap">
                          <img
                            src={pro.image || DEFAULT_AVATAR_PLACEHOLDER}
                            alt={pro.name}
                            className="admin-card-avatar"
                            onError={(e) => {
                              e.target.src = DEFAULT_AVATAR_PLACEHOLDER
                            }}
                          />
                          <span
                            className={`admin-status-badge ${pro.status === 'active' ? 'active' : 'inactive'}`}
                            title={pro.status === 'active' ? 'Visible en sitio web' : 'Pausado temporalmente'}
                          >
                            <span className="status-badge-dot" />
                            <span>{pro.status === 'active' ? 'Activo' : 'Pausado'}</span>
                          </span>
                        </div>

                        <div className="admin-card-main-meta">
                          <div className="card-top-tags">
                            <span className={`admin-service-tag tag-${pro.serviceId}`}>
                              {pro.serviceName}
                            </span>
                            <span className="admin-order-badge">#{pro.order_index ?? 1}</span>
                          </div>
                          <h3 className="admin-pro-name" title={pro.name}>{pro.name}</h3>
                          <p className="admin-pro-specialty" title={pro.specialty}>{pro.specialty}</p>
                          <span className="admin-sis-reg">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                              <path d="m9 12 2 2 4-4"/>
                            </svg>
                            <span>{pro.regNumber || 'Registro SIS'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Detalles rápidos con Iconos SVG */}
                      <div className="admin-card-meta-list">
                        <div className="meta-row">
                          <span className="meta-icon" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          </span>
                          <span className="meta-text">{pro.address}</span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-icon" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                          </span>
                          <span className="meta-text">{pro.attention}</span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-icon" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                          </span>
                          <span className="meta-text">+{pro.whatsapp}</span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-icon" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="18" x="3" y="3" rx="2" />
                              <path d="M8 12h8" />
                              <path d="M12 8v8" />
                            </svg>
                          </span>
                          <span className="meta-text">{pro.convenios}</span>
                        </div>
                      </div>

                      {/* Biografía breve */}
                      <p className="admin-pro-bio-snippet">{pro.bio}</p>

                      {/* Barra de Acciones de la Tarjeta */}
                      <div className="admin-card-actions">
                        <button
                          type="button"
                          className="btn-admin-edit"
                          onClick={() => handleOpenEdit(pro)}
                          title="Modificar los datos de este profesional"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                          </svg>
                          <span>Editar Ficha</span>
                        </button>

                        <button
                          type="button"
                          className="btn-admin-delete"
                          onClick={() => setDeleteTarget(pro)}
                          title="Eliminar este profesional del catálogo"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GUÍA PASO A PASO SUPABASE */}
          {activeTab === 'guide' && (
            <div className="admin-guide-card">
              <div className="guide-header">
                <div className="guide-badge-box">
                  <span className="guide-chip">Base de Datos en la Nube</span>
                  <span className={`guide-status-chip ${isSupabase ? 'ready' : 'pending'}`}>
                    {isSupabase ? '✅ Conexión con Supabase Exitosa' : '⏳ Esperando Configuración'}
                  </span>
                </div>
                <h2 className="guide-title">Cómo Conectar Supabase a Visalud Paso a Paso</h2>
                <p className="guide-lead">
                  Sigue estas instrucciones sencillas para tener tu base de datos profesional gratuita en Supabase en menos de 3 minutos. Mientras tanto, tu panel ya guarda todos los cambios localmente.
                </p>
              </div>

              <div className="guide-steps-list">
                {/* Paso 1 */}
                <div className="guide-step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3 className="step-title">Crear Cuenta y Proyecto en Supabase</h3>
                    <p>
                      Entra a <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a>, inicia sesión o regístrate gratis con tu cuenta de GitHub o Google y haz clic en <strong>"New Project"</strong>.
                    </p>
                    <ul className="step-sublist">
                      <li><strong>Name:</strong> visalud-db</li>
                      <li><strong>Database Password:</strong> Guarda una contraseña segura</li>
                      <li><strong>Region:</strong> South America (São Paulo) para máxima velocidad en Chile</li>
                    </ul>
                  </div>
                </div>

                {/* Paso 2 */}
                <div className="guide-step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3 className="step-title">Copiar y Ejecutar el Script SQL</h3>
                    <p>
                      En el menú lateral izquierdo de tu proyecto Supabase, haz clic en el icono <strong>SQL Editor</strong>, luego en <strong>"New query"</strong>, pega el siguiente código y presiona <strong>RUN</strong>:
                    </p>

                    <div className="sql-code-box">
                      <div className="sql-box-header">
                        <span>supabase-schema.sql</span>
                        <button
                          type="button"
                          className="btn-copy-sql"
                          onClick={() => {
                            const sqlText = `-- CREAR TABLA DE PROFESIONALES
CREATE TABLE IF NOT EXISTS public.professionals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    specialty TEXT NOT NULL,
    "regNumber" TEXT,
    image TEXT,
    address TEXT,
    phone TEXT,
    whatsapp TEXT,
    attention TEXT,
    modality TEXT,
    convenios TEXT,
    bio TEXT,
    status TEXT DEFAULT 'active',
    order_index INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- HABILITAR SEGURIDAD RLS
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE LECTURA Y ESCRITURA
CREATE POLICY "Lectura pública" ON public.professionals FOR SELECT USING (true);
CREATE POLICY "Inserción" ON public.professionals FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualización" ON public.professionals FOR UPDATE USING (true);
CREATE POLICY "Eliminación" ON public.professionals FOR DELETE USING (true);`
                            navigator.clipboard.writeText(sqlText)
                            showToast('¡Script SQL copiado al portapapeles!')
                          }}
                        >
                          📋 Copiar Script SQL
                        </button>
                      </div>
                      <pre className="sql-preview">
{`CREATE TABLE IF NOT EXISTS public.professionals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    specialty TEXT NOT NULL,
    "regNumber" TEXT,
    image TEXT,
    address TEXT,
    phone TEXT,
    whatsapp TEXT,
    attention TEXT,
    modality TEXT,
    convenios TEXT,
    bio TEXT,
    status TEXT DEFAULT 'active',
    order_index INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública" ON public.professionals FOR SELECT USING (true);
CREATE POLICY "Inserción" ON public.professionals FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualización" ON public.professionals FOR UPDATE USING (true);
CREATE POLICY "Eliminación" ON public.professionals FOR DELETE USING (true);`}
                      </pre>
                    </div>
                    <p className="note-text">
                      * Nota: También puedes encontrar el archivo completo con los 8 profesionales precargados en <code>supabase-schema.sql</code> en la raíz del proyecto.
                    </p>
                  </div>
                </div>

                {/* Paso 3 */}
                <div className="guide-step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3 className="step-title">Pegar tus Claves en el archivo <code>.env</code></h3>
                    <p>
                      En Supabase ve a <strong>Project Settings → API</strong>. Copia tu <strong>Project URL</strong> y tu <strong>anon public key</strong>.
                    </p>
                    <p>Crea o edita el archivo <code>.env</code> en la carpeta de tu proyecto con este formato:</p>
                    <div className="env-code-box">
                      <pre>
{`VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
                      </pre>
                    </div>
                    <p>
                      ¡Y listo! Al guardar el archivo <code>.env</code> y recargar, el panel cambiará automáticamente a <strong>"Supabase Conectado"</strong> y cualquier cambio que hagas se guardará directamente en tu base de datos en la nube.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL DE EDICIÓN / CREACIÓN CON LIVE PREVIEW */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="admin-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header">
              <div className="modal-title-wrap">
                <span className="modal-badge">{editingId ? 'Modo Edición' : 'Nuevo Registro'}</span>
                <h2 className="modal-title">
                  {editingId ? `Editar Ficha: ${formData.name}` : 'Registrar Nuevo Profesional'}
                </h2>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsModalOpen(false)}
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="modal-error-alert" role="alert">
                <span>⚠️ {formError}</span>
              </div>
            )}

            <div className="admin-modal-body-split">
              {/* Formulario (Columna Izquierda) */}
              <form id="pro-form" onSubmit={handleSubmit} className="admin-form">
                <div className="form-group-grid">
                  {/* Nombre */}
                  <div className="form-field full-width">
                    <label htmlFor="form-name">Nombre y Título *</label>
                    <input
                      id="form-name"
                      name="name"
                      type="text"
                      required
                      placeholder="Ej: Enfra. Marcela Soto Oyarzún"
                      value={formData.name}
                      onChange={handleFormChange}
                    />
                  </div>

                  {/* Especialidad */}
                  <div className="form-field full-width">
                    <label htmlFor="form-specialty">Especialidad / Cargo Clínico *</label>
                    <input
                      id="form-specialty"
                      name="specialty"
                      type="text"
                      required
                      placeholder="Ej: Enfermera Universitaria - Gerontología"
                      value={formData.specialty}
                      onChange={handleFormChange}
                    />
                  </div>

                  {/* Servicio Asociado */}
                  <div className="form-field">
                    <label htmlFor="form-service">Servicio Principal *</label>
                    <select
                      id="form-service"
                      name="serviceId"
                      value={formData.serviceId}
                      onChange={handleServiceChange}
                    >
                      {SERVICES_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Registro SIS */}
                  <div className="form-field">
                    <label htmlFor="form-regNumber">Registro SIS Superintendencia</label>
                    <input
                      id="form-regNumber"
                      name="regNumber"
                      type="text"
                      placeholder="Reg. SIS N° 458921"
                      value={formData.regNumber}
                      onChange={handleFormChange}
                    />
                  </div>

                  {/* Fotografía de Perfil / Archivo Adjunto */}
                  <div className="form-field full-width pro-photo-uploader-field">
                    <label>Fotografía del Profesional (Archivo Adjunto)</label>

                    {/* Input de archivo nativo oculto */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      style={{ display: 'none' }}
                      onChange={handleFileInputChange}
                    />

                    {formData.image ? (
                      /* Vista previa de fotografía adjunta */
                      <div className="pro-photo-preview-box">
                        <div className="photo-preview-left">
                          <img
                            src={formData.image}
                            alt="Fotografía adjunta"
                            className="uploaded-photo-thumbnail"
                          />
                          <div className="photo-preview-details">
                            <span className="photo-status-tag">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Fotografía lista y adjunta
                            </span>
                            <span className="photo-subnote">
                              {formData.image.startsWith('data:')
                                ? 'Archivo cargado y optimizado desde este equipo'
                                : 'Imagen vinculada correctamente'}
                            </span>
                          </div>
                        </div>

                        <div className="photo-preview-actions">
                          <button
                            type="button"
                            className="btn-change-photo"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isProcessingImage}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <span>Cambiar Archivo</span>
                          </button>
                          <button
                            type="button"
                            className="btn-remove-photo"
                            onClick={handleRemoveImage}
                            title="Quitar esta foto"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            <span>Quitar</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Dropzone para seleccionar o arrastrar archivo */
                      <div
                        className={`pro-photo-dropzone ${isDragging ? 'dragging' : ''} ${isProcessingImage ? 'processing' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            fileInputRef.current?.click()
                          }
                        }}
                      >
                        <div className="dropzone-icon-circle">
                          {isProcessingImage ? (
                            <div className="admin-spinner small" />
                          ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                          )}
                        </div>
                        <div className="dropzone-text-group">
                          <p className="dropzone-main-text">
                            <strong>Haz clic para adjuntar foto</strong> o arrastra el archivo aquí
                          </p>
                          <p className="dropzone-sub-text">
                            Formatos soportados: JPG, PNG, WEBP (se optimiza automáticamente)
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Alternador opcional para URL manual */}
                    <div className="url-toggle-bar">
                      <button
                        type="button"
                        className="btn-toggle-url"
                        onClick={() => setShowUrlField((prev) => !prev)}
                      >
                        {showUrlField ? '▲ Ocultar entrada de URL manual' : '▼ ¿Prefieres pegar un enlace web URL?'}
                      </button>
                    </div>

                    {showUrlField && (
                      <div className="manual-url-input-wrap">
                        <input
                          id="form-image"
                          name="image"
                          type="url"
                          placeholder="https://ejemplo.com/foto-profesional.jpg"
                          value={formData.image}
                          onChange={handleFormChange}
                          className="manual-url-input"
                        />
                      </div>
                    )}
                  </div>

                  {/* Dirección */}
                  <div className="form-field full-width">
                    <label htmlFor="form-address">Lugar / Dirección de Atención</label>
                    <input
                      id="form-address"
                      name="address"
                      type="text"
                      placeholder="Los Carrera 1150 / Domicilio en Osorno"
                      value={formData.address}
                      onChange={handleFormChange}
                    />
                  </div>

                  {/* Teléfono */}
                  <div className="form-field">
                    <label htmlFor="form-phone">Teléfono de Llamada</label>
                    <input
                      id="form-phone"
                      name="phone"
                      type="text"
                      placeholder="+56 9 8452 1190"
                      value={formData.phone}
                      onChange={handleFormChange}
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="form-field">
                    <label htmlFor="form-whatsapp">WhatsApp (Código país sin +)</label>
                    <input
                      id="form-whatsapp"
                      name="whatsapp"
                      type="text"
                      placeholder="56984521190"
                      value={formData.whatsapp}
                      onChange={handleFormChange}
                    />
                  </div>

                  {/* Horario de Atención */}
                  <div className="form-field">
                    <label htmlFor="form-attention">Horario de Atención</label>
                    <input
                      id="form-attention"
                      name="attention"
                      type="text"
                      placeholder="Lunes a Domingo (08:00 - 20:00)"
                      value={formData.attention}
                      onChange={handleFormChange}
                    />
                  </div>

                  {/* Modalidad */}
                  <div className="form-field">
                    <label htmlFor="form-modality">Modalidad de Atención</label>
                    <input
                      id="form-modality"
                      name="modality"
                      type="text"
                      placeholder="A Domicilio en Osorno"
                      value={formData.modality}
                      onChange={handleFormChange}
                    />
                  </div>

                  {/* Convenios */}
                  <div className="form-field full-width">
                    <label htmlFor="form-convenios">Convenios / Previsión</label>
                    <input
                      id="form-convenios"
                      name="convenios"
                      type="text"
                      placeholder="Fonasa, Isapre y Particular con Boleta"
                      value={formData.convenios}
                      onChange={handleFormChange}
                    />
                  </div>

                  {/* Biografía */}
                  <div className="form-field full-width">
                    <label htmlFor="form-bio">Reseña Profesional / Biografía Clínica</label>
                    <textarea
                      id="form-bio"
                      name="bio"
                      rows={3}
                      placeholder="Describe la experiencia, calidez y trato del profesional con el paciente..."
                      value={formData.bio}
                      onChange={handleFormChange}
                    />
                  </div>

                  {/* Estado y Orden */}
                  <div className="form-field">
                    <label htmlFor="form-status">Estado de la Ficha</label>
                    <select
                      id="form-status"
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                    >
                      <option value="active">Activo (Visible en Carrusel)</option>
                      <option value="inactive">Pausado (Oculto temporalmente)</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="form-order">Orden de Posición</label>
                    <input
                      id="form-order"
                      name="order_index"
                      type="number"
                      min={1}
                      value={formData.order_index}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </form>

              {/* LIVE CARD PREVIEW (Columna Derecha) */}
              <div className="admin-live-preview-wrap">
                <div className="preview-label-bar">
                  <span className="preview-pulse-dot" />
                  <span>Previsualización en Tiempo Real</span>
                </div>

                <div className="preview-card-stage">
                  <article className="pro-card card-focused preview-pro-card">
                    {/* Imagen y badges */}
                    <div className="pro-card-image-wrap">
                      <img
                        src={formData.image || DEFAULT_AVATAR_PLACEHOLDER}
                        alt={formData.name || 'Profesional'}
                        className="pro-card-photo"
                      />
                      <div className="pro-card-gradient" />
                      <span className="pro-card-status-pill">
                        <span className="pro-card-status-dot" />
                        <span>{formData.status === 'active' ? 'Agenda Abierta' : 'Pausado'}</span>
                      </span>
                      <span className="pro-card-service-chip">
                        {formData.serviceName || 'Servicio'}
                      </span>
                    </div>

                    {/* Cuerpo de la Tarjeta */}
                    <div className="pro-card-body">
                      <div className="pro-card-header-info">
                        <h4 className="pro-card-name">{formData.name || 'Nombre del Profesional'}</h4>
                        <p className="pro-card-specialty">{formData.specialty || 'Especialidad Clínica'}</p>
                        <div className="pro-card-reg-wrap">
                          <span className="pro-card-reg">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                              <path d="m9 12 2 2 4-4"/>
                            </svg>
                            <span>{formData.regNumber || 'Reg. SIS'}</span>
                          </span>
                          <span className="pro-card-verified-tag">Habilitado SIS</span>
                        </div>
                      </div>

                      <p className="pro-card-bio">
                        {formData.bio || 'Aquí se mostrará la reseña y experiencia del profesional al cuidar de tus seres queridos.'}
                      </p>

                      <div className="pro-card-details-list">
                        <div className="pro-detail-item">
                          <span className="pro-detail-icon location-icon" aria-hidden="true">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          </span>
                          <div className="pro-detail-content">
                            <span className="pro-detail-label">Lugar de Atención:</span>
                            <span className="pro-detail-value">{formData.address || 'Servicio en Osorno'}</span>
                          </div>
                        </div>

                        <div className="pro-detail-item">
                          <span className="pro-detail-icon clock-icon" aria-hidden="true">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                          </span>
                          <div className="pro-detail-content">
                            <span className="pro-detail-label">Horario & Modalidad:</span>
                            <span className="pro-detail-value">
                              {formData.attention || 'Horario flexible'} • <strong className="pro-modality-highlight">{formData.modality || 'A Domicilio'}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="pro-detail-item">
                          <span className="pro-detail-icon phone-icon" aria-hidden="true">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                          </span>
                          <div className="pro-detail-content">
                            <span className="pro-detail-label">Teléfono directo:</span>
                            <span className="pro-detail-value">{formData.phone || '+56 9 ...'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pro-card-convenios-strip">
                        <span className="convenios-badge">{formData.convenios || 'Particular / Fonasa / Isapre'}</span>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn-cancel-modal"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="pro-form"
                className="btn-save-modal"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Profesional'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div
            className="admin-delete-confirm-box"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
          >
            <div className="delete-alert-icon">⚠️</div>
            <h3>¿Eliminar a {deleteTarget.name}?</h3>
            <p>
              Esta acción quitará a este profesional del catálogo clínico de Visalud. Podrás volver a agregarlo en cualquier momento.
            </p>
            <div className="delete-confirm-actions">
              <button
                type="button"
                className="btn-cancel-modal"
                onClick={() => setDeleteTarget(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-confirm-delete"
                onClick={confirmDelete}
              >
                Sí, Eliminar Profesional
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
