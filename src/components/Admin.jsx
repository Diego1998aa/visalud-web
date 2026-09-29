import { useState, useEffect, useMemo, useRef } from 'react'
import { professionalsService } from '../services/professionalsService.js'
import { testimonialsService } from '../services/testimonialsService.js'
import { leadsService } from '../services/leadsService.js'
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
  convenios: 'Atención Particular • Trato Directo',
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
  const [activeTab, setActiveTab] = useState('list') // 'list' | 'testimonials' | 'leads' | 'guide'

  // Modal / Form state profesionales
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

  // Confirm delete modal profesionales
  const [deleteTarget, setDeleteTarget] = useState(null)

  // ================= ESTADO Y GESTIÓN DE TESTIMONIOS =================
  const [testimonials, setTestimonials] = useState([])
  const [testimFilter, setTestimFilter] = useState('all') // 'all' | 'pending' | 'approved'
  const [isAddTestimonialOpen, setIsAddTestimonialOpen] = useState(false)
  const [manualTestimonialForm, setManualTestimonialForm] = useState({
    name: '',
    relation: 'Hija de paciente',
    location: 'Sector Pilauco, Osorno',
    service: 'Turno Completo (12 hrs) • Cuidado Continuo',
    rating: 5,
    tag: 'Cuidado y Acompañamiento',
    comment: '',
  })

  // ================= ESTADO Y GESTIÓN DE SOLICITUDES / MINI-CRM =================
  const [leads, setLeads] = useState([])
  const [leadsFilter, setLeadsFilter] = useState('all') // 'all' | 'new' | 'contacted' | 'scheduled' | 'closed'
  const [leadsSearch, setLeadsSearch] = useState('')
  const [expandedNotesId, setExpandedNotesId] = useState(null)
  const [tempNotes, setTempNotes] = useState({})

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

  const loadTestimonials = async () => {
    try {
      const res = await testimonialsService.getAllTestimonials()
      setTestimonials(res.data || [])
    } catch (err) {
      console.error('Error cargando testimonios:', err)
    }
  }

  const loadLeads = async () => {
    try {
      const res = await leadsService.getLeads()
      setLeads(res.data || [])
    } catch (err) {
      console.error('Error cargando solicitudes:', err)
    }
  }

  useEffect(() => {
    loadData()
    loadTestimonials()
    loadLeads()

    const unsubPros = professionalsService.onProfessionalsChange(() => {
      loadData()
    })

    const unsubTestim = testimonialsService.onTestimonialsChange(() => {
      loadTestimonials()
    })

    const unsubLeads = leadsService.onLeadsChange((updated) => {
      if (updated) setLeads(updated)
      else loadLeads()
    })

    return () => {
      unsubPros()
      unsubTestim()
      unsubLeads()
    }
  }, [])

  // Acciones sobre testimonios
  const handleApproveTestimonial = async (id) => {
    try {
      await testimonialsService.approveTestimonial(id)
      showToast('¡Testimonio aprobado y publicado en la página web!')
      loadTestimonials()
    } catch (err) {
      showToast('Error al aprobar testimonio.', 'error')
    }
  }

  const handleRejectTestimonial = async (id) => {
    try {
      await testimonialsService.rejectTestimonial(id)
      showToast('Testimonio pausado / archivado.', 'info')
      loadTestimonials()
    } catch (err) {
      showToast('Error al archivar testimonio.', 'error')
    }
  }

  const handleDeleteTestimonial = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar definitivamente este testimonio?')) {
      try {
        await testimonialsService.deleteTestimonial(id)
        showToast('Testimonio eliminado correctamente.', 'info')
        loadTestimonials()
      } catch (err) {
        showToast('Error al eliminar testimonio.', 'error')
      }
    }
  }

  const handleSaveManualTestimonial = async (e) => {
    e.preventDefault()
    if (!manualTestimonialForm.name.trim()) {
      showToast('Ingresa el nombre del familiar.', 'error')
      return
    }
    if (!manualTestimonialForm.comment.trim()) {
      showToast('Ingresa el comentario o reseña.', 'error')
      return
    }

    try {
      await testimonialsService.createManualTestimonial(manualTestimonialForm)
      showToast('¡Testimonio manual registrado y publicado con éxito!')
      setIsAddTestimonialOpen(false)
      setManualTestimonialForm({
        name: '',
        relation: 'Hija de paciente',
        location: 'Sector Pilauco, Osorno',
        service: 'Turno Completo (12 hrs) • Cuidado Continuo',
        rating: 5,
        tag: 'Cuidado y Acompañamiento',
        comment: '',
      })
      loadTestimonials()
    } catch (err) {
      showToast('Error al crear testimonio.', 'error')
    }
  }

  const pendingReviewsCount = useMemo(
    () => testimonials.filter((t) => t.status === 'pending').length,
    [testimonials]
  )

  const approvedReviewsCount = useMemo(
    () => testimonials.filter((t) => t.status === 'approved').length,
    [testimonials]
  )

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((t) => {
      if (testimFilter === 'pending') return t.status === 'pending'
      if (testimFilter === 'approved') return t.status === 'approved'
      return true
    })
  }, [testimonials, testimFilter])

  // Acciones y estados derivados de Solicitudes (Mini-CRM)
  const handleUpdateLeadStatus = async (id, newStatus) => {
    try {
      await leadsService.updateLead(id, { status: newStatus })
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)))
      const label =
        newStatus === 'new'
          ? 'Nueva Consulta'
          : newStatus === 'contacted'
          ? 'En Contacto'
          : newStatus === 'scheduled'
          ? 'Turno Agendado'
          : 'Cerrada'
      showToast(`Estado actualizado: ${label}`)
    } catch (err) {
      showToast('Error actualizando estado.', 'error')
    }
  }

  const handleSaveLeadNote = async (id) => {
    const noteText = tempNotes[id] ?? ''
    try {
      await leadsService.updateLead(id, { notes: noteText })
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes: noteText } : l)))
      setExpandedNotesId(null)
      showToast('Nota interna guardada con éxito.')
    } catch (err) {
      showToast('Error guardando nota.', 'error')
    }
  }

  const handleDeleteLead = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta solicitud de paciente?')) {
      try {
        await leadsService.deleteLead(id)
        setLeads((prev) => prev.filter((l) => l.id !== id))
        showToast('Solicitud eliminada.')
      } catch (err) {
        showToast('Error eliminando solicitud.', 'error')
      }
    }
  }

  const handleLeadWhatsAppDirect = async (lead) => {
    if (lead.status === 'new') {
      await handleUpdateLeadStatus(lead.id, 'contacted')
    }
    const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '')
    const targetPhone = cleanPhone.startsWith('56') ? cleanPhone : `56${cleanPhone}`
    const text = `Hola ${lead.name}, te escribo desde Visalud Osorno respecto a la consulta que realizaste en nuestra web para *${lead.subject || 'Cuidado de Adulto Mayor'}* en ${lead.sector || 'Osorno'}. ¿Con qué disponibilidad y requerimientos podemos coordinar?`
    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  const newLeadsCount = useMemo(() => leads.filter((l) => l.status === 'new').length, [leads])
  const contactedLeadsCount = useMemo(() => leads.filter((l) => l.status === 'contacted').length, [leads])
  const scheduledLeadsCount = useMemo(() => leads.filter((l) => l.status === 'scheduled').length, [leads])
  const closedLeadsCount = useMemo(() => leads.filter((l) => l.status === 'closed').length, [leads])

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (leadsFilter !== 'all' && l.status !== leadsFilter) return false
      const q = leadsSearch.toLowerCase().trim()
      if (!q) return true
      return (
        l.name?.toLowerCase().includes(q) ||
        l.phone?.toLowerCase().includes(q) ||
        l.sector?.toLowerCase().includes(q) ||
        l.subject?.toLowerCase().includes(q) ||
        l.message?.toLowerCase().includes(q) ||
        l.notes?.toLowerCase().includes(q)
      )
    })
  }, [leads, leadsFilter, leadsSearch])

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
              className={`admin-tab-btn ${activeTab === 'testimonials' ? 'active' : ''}`}
              onClick={() => setActiveTab('testimonials')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Testimonios y Reseñas ({testimonials.length})</span>
              {pendingReviewsCount > 0 && (
                <span className="tab-pending-badge" title={`${pendingReviewsCount} nuevos testimonios por revisar`}>
                  {pendingReviewsCount} nuevos
                </span>
              )}
            </button>

            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'leads' ? 'active' : ''}`}
              onClick={() => setActiveTab('leads')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>Bandeja de Pacientes ({leads.length})</span>
              {newLeadsCount > 0 && (
                <span className="tab-pending-badge tab-badge-urgent" title={`${newLeadsCount} solicitudes nuevas por responder`}>
                  {newLeadsCount} nuevas
                </span>
              )}
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
-- TABLA DE TESTIMONIOS Y RESEÑAS
CREATE TABLE IF NOT EXISTS public.testimonials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    relation TEXT,
    location TEXT,
    service TEXT,
    rating INTEGER DEFAULT 5,
    tag TEXT,
    comment TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura testimonios" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Inserción testimonios" ON public.testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualización testimonios" ON public.testimonials FOR UPDATE USING (true);
CREATE POLICY "Eliminación testimonios" ON public.testimonials FOR DELETE USING (true);

-- BANDEJA DE SOLICITUDES Y PACIENTES (MINI-CRM)
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    subject TEXT,
    sector TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura consultas" ON public.contact_messages FOR SELECT USING (true);
CREATE POLICY "Inserción consultas" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualización consultas" ON public.contact_messages FOR UPDATE USING (true);
CREATE POLICY "Eliminación consultas" ON public.contact_messages FOR DELETE USING (true);`
                            navigator.clipboard.writeText(sqlText)
                            showToast('¡Script SQL completo copiado al portapapeles!')
                          }}
                        >
                          📋 Copiar Script SQL Completo
                        </button>
                      </div>
                      <pre className="sql-preview">
{`-- 1. PROFESIONALES
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

-- 2. TESTIMONIOS Y RESEÑAS
CREATE TABLE IF NOT EXISTS public.testimonials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    relation TEXT,
    location TEXT,
    service TEXT,
    rating INTEGER DEFAULT 5,
    tag TEXT,
    comment TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. BANDEJA DE SOLICITUDES (MINI-CRM)
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    subject TEXT,
    sector TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);`}
                      </pre>
                    </div>
                    <p className="note-text">
                      * Nota: Encuentra el script SQL completo con todas las políticas y profesionales precargados en <code>supabase-schema.sql</code> en la raíz del proyecto.
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

          {/* TAB 3: GESTIÓN DE TESTIMONIOS */}
          {activeTab === 'testimonials' && (
            <div className="admin-content-section">
              <div className="testim-admin-header">
                <div className="testim-header-info">
                  <span className="testim-badge-pill">Moderación y Control de Calidad</span>
                  <h2 className="testim-admin-title">Testimonios de Familias y Pacientes</h2>
                  <p className="testim-admin-desc">
                    Revisa las opiniones que dejan los visitantes en la web antes de publicarlas, o añade manualmente testimonios que te envíen por WhatsApp.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-create-pro"
                  onClick={() => setIsAddTestimonialOpen(true)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>+ Agregar Testimonio Manual</span>
                </button>
              </div>

              {/* Métricas rápidas de testimonios */}
              <div className="testim-stats-row">
                <div className="testim-stat-box">
                  <span className="testim-stat-num">{testimonials.length}</span>
                  <span className="testim-stat-label">Total en el Sistema</span>
                </div>
                <div className="testim-stat-box highlight-pending">
                  <span className="testim-stat-num">{pendingReviewsCount}</span>
                  <span className="testim-stat-label">Pendientes de Moderación</span>
                </div>
                <div className="testim-stat-box highlight-approved">
                  <span className="testim-stat-num">{approvedReviewsCount}</span>
                  <span className="testim-stat-label">Publicados en el Carrusel</span>
                </div>
              </div>

              {/* Filtro de testimonios */}
              <div className="testim-filter-bar">
                <div className="testim-filter-pills">
                  <button
                    type="button"
                    className={`testim-pill ${testimFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setTestimFilter('all')}
                  >
                    Todos ({testimonials.length})
                  </button>
                  <button
                    type="button"
                    className={`testim-pill ${testimFilter === 'pending' ? 'active' : ''}`}
                    onClick={() => setTestimFilter('pending')}
                  >
                    Pendientes por Moderar ({pendingReviewsCount})
                  </button>
                  <button
                    type="button"
                    className={`testim-pill ${testimFilter === 'approved' ? 'active' : ''}`}
                    onClick={() => setTestimFilter('approved')}
                  >
                    Publicados en la Web ({approvedReviewsCount})
                  </button>
                </div>
              </div>

              {/* Lista de testimonios */}
              <div className="testim-admin-list">
                {filteredTestimonials.length === 0 ? (
                  <div className="testim-empty-card">
                    <p>No hay testimonios en esta categoría.</p>
                  </div>
                ) : (
                  filteredTestimonials.map((t) => (
                    <div key={t.id} className={`testim-admin-card status-${t.status}`}>
                      <div className="testim-card-header">
                        <div className="testim-card-status">
                          {t.status === 'pending' && (
                            <span className="badge-status-pending">
                              <span className="pulse-dot-amber" />
                              <span>Pendiente de Aprobación</span>
                            </span>
                          )}
                          {t.status === 'approved' && (
                            <span className="badge-status-approved">
                              <span>✓ Publicado en la Web</span>
                            </span>
                          )}
                          {t.status === 'archived' && (
                            <span className="badge-status-archived">
                              <span>Oculto / Pausado</span>
                            </span>
                          )}
                        </div>

                        <div className="testim-stars-display">
                          {'★'.repeat(t.rating || 5)} <span>({t.rating || 5}/5)</span>
                        </div>
                      </div>

                      <blockquote className="testim-admin-quote">
                        “{t.comment}”
                      </blockquote>

                      <div className="testim-admin-meta">
                        <div>
                          <strong className="testim-author-name">{t.name}</strong>
                          <span className="testim-author-rel">{t.relation}</span>
                        </div>
                        <div className="testim-author-details">
                          <span>📍 {t.location}</span>
                          <span>🩺 {t.service}</span>
                          {t.created_at && (
                            <span className="testim-date">
                              📅 {new Date(t.created_at).toLocaleDateString('es-CL')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="testim-card-actions">
                        {t.status === 'pending' && (
                          <button
                            type="button"
                            className="btn-testim-approve"
                            onClick={() => handleApproveTestimonial(t.id)}
                            title="Aprobar para que aparezca en el carrusel público"
                          >
                            <span>✓ Aprobar y Publicar</span>
                          </button>
                        )}

                        {t.status === 'approved' && (
                          <button
                            type="button"
                            className="btn-testim-pause"
                            onClick={() => handleRejectTestimonial(t.id)}
                            title="Ocultar temporalmente del carrusel"
                          >
                            <span>Pausar / Ocultar</span>
                          </button>
                        )}

                        {t.status === 'archived' && (
                          <button
                            type="button"
                            className="btn-testim-approve"
                            onClick={() => handleApproveTestimonial(t.id)}
                            title="Volver a publicar en el carrusel"
                          >
                            <span>Volver a Publicar</span>
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn-testim-delete"
                          onClick={() => handleDeleteTestimonial(t.id)}
                          title="Eliminar permanentemente este comentario"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: BANDEJA DE SOLICITUDES Y PACIENTES (MINI-CRM) */}
          {activeTab === 'leads' && (
            <div className="admin-content-section">
              <div className="leads-admin-header">
                <div className="leads-header-info">
                  <div className="leads-badge-box">
                    <span className="leads-badge-pill">Mini-CRM de Pacientes</span>
                    <span className="leads-status-chip">
                      {isSupabase ? '🟢 Sincronizado en Supabase' : '💾 Guardado en Almacenamiento Local'}
                    </span>
                  </div>
                  <h2 className="leads-admin-title">Bandeja de Consultas y Solicitudes</h2>
                  <p className="leads-admin-desc">
                    Gestiona todas las solicitudes recibidas desde el formulario web de Visalud Osorno. Responde por WhatsApp en 1 clic y dale seguimiento a cada familiar.
                  </p>
                </div>

                <div className="leads-header-actions">
                  <button
                    type="button"
                    className="btn-leads-refresh"
                    onClick={loadLeads}
                    title="Actualizar lista de solicitudes"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                    <span>Actualizar</span>
                  </button>
                </div>
              </div>

              {/* Métricas rápidas del CRM */}
              <div className="leads-stats-row">
                <div className="leads-stat-box">
                  <span className="leads-stat-num">{leads.length}</span>
                  <span className="leads-stat-label">Total Solicitudes</span>
                </div>
                <div className="leads-stat-box highlight-new">
                  <span className="leads-stat-num">{newLeadsCount}</span>
                  <span className="leads-stat-label">Por Responder (Nuevas)</span>
                </div>
                <div className="leads-stat-box highlight-contacted">
                  <span className="leads-stat-num">{contactedLeadsCount}</span>
                  <span className="leads-stat-label">En Seguimiento</span>
                </div>
                <div className="leads-stat-box highlight-scheduled">
                  <span className="leads-stat-num">{scheduledLeadsCount}</span>
                  <span className="leads-stat-label">Turnos Agendados</span>
                </div>
              </div>

              {/* Barra de Filtros y Búsqueda */}
              <div className="leads-toolbar">
                <div className="leads-search-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar por familiar, teléfono, sector o requerimiento..."
                    value={leadsSearch}
                    onChange={(e) => setLeadsSearch(e.target.value)}
                  />
                  {leadsSearch && (
                    <button
                      type="button"
                      className="leads-clear-search"
                      onClick={() => setLeadsSearch('')}
                      aria-label="Limpiar búsqueda"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="leads-filter-pills">
                  <button
                    type="button"
                    className={`leads-pill ${leadsFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setLeadsFilter('all')}
                  >
                    Todas ({leads.length})
                  </button>
                  <button
                    type="button"
                    className={`leads-pill pill-new ${leadsFilter === 'new' ? 'active' : ''}`}
                    onClick={() => setLeadsFilter('new')}
                  >
                    🟡 Nuevas ({newLeadsCount})
                  </button>
                  <button
                    type="button"
                    className={`leads-pill pill-contacted ${leadsFilter === 'contacted' ? 'active' : ''}`}
                    onClick={() => setLeadsFilter('contacted')}
                  >
                    🔵 Contactadas ({contactedLeadsCount})
                  </button>
                  <button
                    type="button"
                    className={`leads-pill pill-scheduled ${leadsFilter === 'scheduled' ? 'active' : ''}`}
                    onClick={() => setLeadsFilter('scheduled')}
                  >
                    🟢 Agendadas ({scheduledLeadsCount})
                  </button>
                  <button
                    type="button"
                    className={`leads-pill pill-closed ${leadsFilter === 'closed' ? 'active' : ''}`}
                    onClick={() => setLeadsFilter('closed')}
                  >
                    ⚪ Cerradas ({closedLeadsCount})
                  </button>
                </div>
              </div>

              {/* Listado de Solicitudes */}
              <div className="leads-list">
                {filteredLeads.length === 0 ? (
                  <div className="leads-empty-card">
                    <div className="leads-empty-icon">📬</div>
                    <h3>No hay solicitudes en esta vista</h3>
                    <p>
                      {leadsSearch
                        ? 'No se encontraron resultados para los términos ingresados.'
                        : 'Las nuevas consultas de pacientes que ingresen por la página web aparecerán automáticamente aquí.'}
                    </p>
                  </div>
                ) : (
                  filteredLeads.map((lead) => {
                    const formattedDate = new Date(lead.created_at).toLocaleString('es-CL', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })

                    return (
                      <article key={lead.id} className={`lead-card status-${lead.status}`}>
                        {/* Cabecera de la tarjeta */}
                        <div className="lead-card-header">
                          <div className="lead-header-left">
                            <div className="lead-status-selector-wrap">
                              <span className={`lead-status-dot dot-${lead.status}`} />
                              <select
                                className={`lead-status-select select-${lead.status}`}
                                value={lead.status}
                                onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                                title="Cambiar estado de la solicitud"
                              >
                                <option value="new">🟡 Nueva (Por responder)</option>
                                <option value="contacted">🔵 Contactado / En seguimiento</option>
                                <option value="scheduled">🟢 Turno Agendado</option>
                                <option value="closed">⚪ Cerrado / Finalizado</option>
                              </select>
                            </div>
                            <span className="lead-date-pill">{formattedDate}</span>
                          </div>

                          <div className="lead-header-right">
                            <span className="lead-sector-badge">
                              📍 {lead.sector || 'Osorno'}
                            </span>
                            <span className="lead-service-badge">
                              {lead.subject || 'Cuidado Adulto Mayor'}
                            </span>
                          </div>
                        </div>

                        {/* Cuerpo de información del paciente */}
                        <div className="lead-card-body">
                          <div className="lead-person-row">
                            <div className="lead-person-main">
                              <h3 className="lead-person-name">{lead.name}</h3>
                              <div className="lead-contact-items">
                                {lead.phone && (
                                  <a
                                    href={`tel:${lead.phone}`}
                                    className="lead-contact-link phone"
                                    title="Llamar directamente"
                                  >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.5 2 2 0 0 1 3.6 1.32h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.09 6.09l1.78-1.78a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                    <span>{lead.phone}</span>
                                  </a>
                                )}
                                {lead.email && (
                                  <a
                                    href={`mailto:${lead.email}`}
                                    className="lead-contact-link email"
                                    title="Enviar correo"
                                  >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                      <rect width="20" height="16" x="2" y="4" rx="2" />
                                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                    <span>{lead.email}</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Requerimiento de salud del adulto mayor */}
                          <div className="lead-message-box">
                            <span className="lead-message-label">Requerimiento clínico y situación del familiar:</span>
                            <p className="lead-message-text">"{lead.message}"</p>
                          </div>

                          {/* Notas Internas de la Administración */}
                          <div className="lead-notes-area">
                            {expandedNotesId === lead.id ? (
                              <div className="lead-notes-editor">
                                <label className="lead-notes-label">Notas privadas de coordinación:</label>
                                <textarea
                                  rows={2}
                                  placeholder="Ej: Se coordinó con TENS Patricia para iniciar turnos de 12h los martes y jueves..."
                                  value={tempNotes[lead.id] ?? lead.notes ?? ''}
                                  onChange={(e) => setTempNotes((prev) => ({ ...prev, [lead.id]: e.target.value }))}
                                />
                                <div className="lead-notes-editor-actions">
                                  <button
                                    type="button"
                                    className="btn-save-lead-note"
                                    onClick={() => handleSaveLeadNote(lead.id)}
                                  >
                                    Guardar Nota
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-cancel-lead-note"
                                    onClick={() => setExpandedNotesId(null)}
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="lead-notes-preview"
                                onClick={() => {
                                  setTempNotes((prev) => ({ ...prev, [lead.id]: lead.notes || '' }))
                                  setExpandedNotesId(lead.id)
                                }}
                                title="Hacer clic para editar notas internas"
                              >
                                <span className="lead-notes-icon">📝</span>
                                <span className="lead-notes-content">
                                  {lead.notes ? (
                                    <strong>Nota de Visalud: {lead.notes}</strong>
                                  ) : (
                                    <em className="text-muted">+ Añadir nota interna de coordinación...</em>
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Barra de Acciones Directas */}
                        <div className="lead-card-footer">
                          <button
                            type="button"
                            className="btn-lead-whatsapp"
                            onClick={() => handleLeadWhatsAppDirect(lead)}
                            title="Abrir WhatsApp oficial de Visalud con saludo personalizado"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            <span>WhatsApp Directo</span>
                          </button>

                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              className="btn-lead-call"
                              title="Llamar al familiar"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.5 2 2 0 0 1 3.6 1.32h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.09 6.09l1.78-1.78a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                              </svg>
                              <span>Llamar</span>
                            </a>
                          )}

                          <button
                            type="button"
                            className="btn-lead-delete"
                            onClick={() => handleDeleteLead(lead.id)}
                            title="Eliminar esta solicitud"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </article>
                    )
                  })
                )}
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

                  {/* Modalidad de Pago / Trato Directo */}
                  <div className="form-field full-width">
                    <label htmlFor="form-convenios">Modalidad de Pago / Trato Directo</label>
                    <input
                      id="form-convenios"
                      name="convenios"
                      type="text"
                      placeholder="Atención Particular • Trato Directo con el Profesional"
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
                        <span className="convenios-badge">{formData.convenios || 'Atención Particular • Trato Directo'}</span>
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

      {/* MODAL PARA AGREGAR TESTIMONIO MANUAL (ADMIN) */}
      {isAddTestimonialOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsAddTestimonialOpen(false)}>
          <div
            className="admin-modal-dialog"
            style={{ maxWidth: '640px' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header">
              <div className="modal-title-wrap">
                <span className="modal-badge">Registro Manual de Reseña</span>
                <h2 className="modal-title">Agregar Testimonio de Familia</h2>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsAddTestimonialOpen(false)}
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveManualTestimonial} className="admin-form" style={{ padding: '1.5rem' }}>
              <div className="form-group-grid">
                <div className="form-field full-width">
                  <label>Nombre del familiar o paciente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carmen Gloria Muñoz"
                    value={manualTestimonialForm.name}
                    onChange={(e) => setManualTestimonialForm({ ...manualTestimonialForm, name: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Parentesco / Relación</label>
                  <input
                    type="text"
                    placeholder="Ej. Hija de don Fernando (84 años)"
                    value={manualTestimonialForm.relation}
                    onChange={(e) => setManualTestimonialForm({ ...manualTestimonialForm, relation: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Sector en Osorno</label>
                  <select
                    value={manualTestimonialForm.location}
                    onChange={(e) => setManualTestimonialForm({ ...manualTestimonialForm, location: e.target.value })}
                  >
                    <option value="Sector Pilauco, Osorno">Sector Pilauco, Osorno</option>
                    <option value="Sector Centro, Osorno">Sector Centro, Osorno</option>
                    <option value="Sector Rahue Alto, Osorno">Sector Rahue Alto, Osorno</option>
                    <option value="Sector Rahue Bajo, Osorno">Sector Rahue Bajo, Osorno</option>
                    <option value="Sector Francke, Osorno">Sector Francke, Osorno</option>
                    <option value="Sector Ovejería, Osorno">Sector Ovejería, Osorno</option>
                    <option value="Sector Kolbe, Osorno">Sector Kolbe, Osorno</option>
                    <option value="Alrededores de Osorno">Alrededores de Osorno</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Modalidad Recibida</label>
                  <select
                    value={manualTestimonialForm.service}
                    onChange={(e) => setManualTestimonialForm({ ...manualTestimonialForm, service: e.target.value })}
                  >
                    <option value="Turno Completo (12 hrs) • Cuidado Continuo">Turno Completo (12 hrs)</option>
                    <option value="Medio Turno (6 hrs) • Aseo y Confort">Medio Turno (6 hrs)</option>
                    <option value="Vigilia Nocturna (12 hrs) • Supervisión">Vigilia Nocturna (12 hrs)</option>
                    <option value="Gestión Delegada de Turnos Visalud">Gestión Delegada de Turnos</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Calificación (Estrellas)</label>
                  <select
                    value={manualTestimonialForm.rating}
                    onChange={(e) => setManualTestimonialForm({ ...manualTestimonialForm, rating: Number(e.target.value) })}
                  >
                    <option value={5}>★★★★★ (5 de 5 estrellas)</option>
                    <option value={4}>★★★★☆ (4 de 5 estrellas)</option>
                    <option value={3}>★★★☆☆ (3 de 5 estrellas)</option>
                  </select>
                </div>

                <div className="form-field full-width">
                  <label>Enfoque o tema clave (Tag)</label>
                  <input
                    type="text"
                    placeholder="Ej. Cuidado post-operatorio y fármacos"
                    value={manualTestimonialForm.tag}
                    onChange={(e) => setManualTestimonialForm({ ...manualTestimonialForm, tag: e.target.value })}
                  />
                </div>

                <div className="form-field full-width">
                  <label>Comentario / Reseña *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Escribe las palabras o experiencia enviadas por la familia (ej. vía WhatsApp)..."
                    value={manualTestimonialForm.comment}
                    onChange={(e) => setManualTestimonialForm({ ...manualTestimonialForm, comment: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions-footer" style={{ marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsAddTestimonialOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  Guardar y Publicar en Web
                </button>
              </div>
            </form>
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
