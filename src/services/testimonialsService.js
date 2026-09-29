import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { defaultTestimonials } from '../data/defaultTestimonials.js'

const LOCAL_STORAGE_KEY = 'visalud_testimonials_db'
const CHANGE_EVENT_NAME = 'visalud_testimonials_changed'

function getLocalTestimonials() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultTestimonials))
      return [...defaultTestimonials]
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...defaultTestimonials]
  } catch (e) {
    console.error('Error leyendo testimonios de localStorage:', e)
    return [...defaultTestimonials]
  }
}

function saveLocalTestimonials(list) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list))
    notifySubscribers(list)
  } catch (e) {
    console.error('Error guardando testimonios en localStorage:', e)
  }
}

function notifySubscribers(list) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT_NAME, { detail: list }))
  }
}

export const testimonialsService = {
  // Obtener solo testimonios aprobados para el carrusel público
  async getApprovedTestimonials() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0) {
          return { data, source: 'supabase' }
        }
      } catch (err) {
        console.warn('Fallo Supabase para testimonios aprobados, usando local:', err)
      }
    }

    const localAll = getLocalTestimonials()
    const approved = localAll.filter((t) => t.status === 'approved')
    return { data: approved.length > 0 ? approved : defaultTestimonials, source: 'local' }
  },

  // Obtener todos los testimonios (aprobados y pendientes) para el Panel Admin
  async getAllTestimonials() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0) {
          return { data, source: 'supabase' }
        }
      } catch (err) {
        console.warn('Fallo Supabase para todos los testimonios, usando local:', err)
      }
    }

    return { data: getLocalTestimonials(), source: 'local' }
  },

  // Envío público de testimonio (queda 'pending' hasta que el admin lo apruebe)
  async submitPublicTestimonial(testimonialData) {
    const newRecord = {
      ...testimonialData,
      id: `test-${Date.now()}`,
      status: 'pending',
      verified: true,
      created_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .insert([newRecord])
          .select()
          .single()

        if (!error && data) {
          notifySubscribers()
          return { success: true, data, source: 'supabase' }
        }
      } catch (err) {
        console.warn('Excepción guardando testimonio en Supabase:', err)
      }
    }

    const current = getLocalTestimonials()
    const updated = [newRecord, ...current]
    saveLocalTestimonials(updated)
    return { success: true, data: newRecord, source: 'local' }
  },

  // Aprobar un testimonio desde el panel Admin
  async approveTestimonial(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('testimonials')
          .update({ status: 'approved' })
          .eq('id', id)

        if (!error) {
          notifySubscribers()
          return { success: true }
        }
      } catch (err) {
        console.warn('Error aprobando en Supabase:', err)
      }
    }

    const current = getLocalTestimonials()
    const updated = current.map((t) => (t.id === id ? { ...t, status: 'approved' } : t))
    saveLocalTestimonials(updated)
    return { success: true }
  },

  // Rechazar / Ocultar un testimonio
  async rejectTestimonial(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('testimonials')
          .update({ status: 'archived' })
          .eq('id', id)

        if (!error) {
          notifySubscribers()
          return { success: true }
        }
      } catch (err) {
        console.warn('Error archivando en Supabase:', err)
      }
    }

    const current = getLocalTestimonials()
    const updated = current.map((t) => (t.id === id ? { ...t, status: 'archived' } : t))
    saveLocalTestimonials(updated)
    return { success: true }
  },

  // Eliminar definitivamente un testimonio
  async deleteTestimonial(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('testimonials')
          .delete()
          .eq('id', id)

        if (!error) {
          notifySubscribers()
          return { success: true }
        }
      } catch (err) {
        console.warn('Error eliminando en Supabase:', err)
      }
    }

    const current = getLocalTestimonials()
    const updated = current.filter((t) => t.id !== id)
    saveLocalTestimonials(updated)
    return { success: true }
  },

  // Crear testimonio manual directo desde el Admin (aprobado por defecto)
  async createManualTestimonial(testimonialData) {
    const newRecord = {
      ...testimonialData,
      id: `test-${Date.now()}`,
      status: 'approved',
      verified: true,
      created_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .insert([newRecord])
          .select()
          .single()

        if (!error && data) {
          notifySubscribers()
          return { success: true, data }
        }
      } catch (err) {
        console.warn('Error creando testimonio manual en Supabase:', err)
      }
    }

    const current = getLocalTestimonials()
    const updated = [newRecord, ...current]
    saveLocalTestimonials(updated)
    return { success: true, data: newRecord }
  },

  // Suscribirse a cambios
  onTestimonialsChange(callback) {
    const handler = (e) => {
      callback(e.detail)
    }
    if (typeof window !== 'undefined') {
      window.addEventListener(CHANGE_EVENT_NAME, handler)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(CHANGE_EVENT_NAME, handler)
      }
    }
  },
}
