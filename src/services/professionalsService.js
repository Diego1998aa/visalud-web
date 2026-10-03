import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { defaultProfessionals } from '../data/defaultProfessionals.js'

const LOCAL_STORAGE_KEY = 'visalud_professionals_db'
const CHANGE_EVENT_NAME = 'visalud_professionals_changed'

// Inicializar almacenamiento local si no existe
function getLocalProfessionals() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultProfessionals))
      return [...defaultProfessionals]
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...defaultProfessionals]
  } catch (e) {
    console.error('Error leyendo de localStorage:', e)
    return [...defaultProfessionals]
  }
}

function saveLocalProfessionals(list) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list))
    notifySubscribers(list)
  } catch (e) {
    console.error('Error guardando en localStorage:', e)
  }
}

function notifySubscribers(list) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT_NAME, { detail: list }))
  }
}

// ── Helpers de suscripción ──────────────────────────────────────────────────

/** Devuelve true si el profesional tiene suscripción vigente (aparece en la web).
 *  Solo aparece si está 'activo' Y tiene fecha de vencimiento futura.
 *  Sin suscripción configurada = oculto (no aparece por defecto).
 */
export function isSubscriptionActive(pro) {
  if (!pro) return false
  const s = pro.subscription_status
  // Sin columna de suscripción aún (BD no migrada) → usa status legacy
  if (s === undefined || s === null) return pro.status === 'active'
  // Inactivo, vencido → nunca aparece
  if (s !== 'activo') return false
  // Activo: verificar que la fecha no haya pasado
  if (pro.subscription_expires_at) {
    return new Date(pro.subscription_expires_at) > new Date()
  }
  // Activo sin fecha → mostrar (caso manual sin fecha)
  return true
}

/** Etiqueta legible del estado de suscripción */
export function subscriptionLabel(pro) {
  if (!pro.subscription_status) return 'Sin activar'
  const days = pro.subscription_expires_at
    ? Math.ceil((new Date(pro.subscription_expires_at) - new Date()) / 86400000)
    : null
  if (pro.subscription_status === 'vencido') return 'Vencida'
  if (pro.subscription_status === 'inactivo') return 'Sin activar'
  if (days !== null && days <= 7) return `Vence en ${days}d`
  return pro.plan_type === 'destacado' ? 'Plan Destacado' : 'Plan Básico'
}

/** Badge de color según estado */
export function subscriptionBadgeColor(pro) {
  const s = pro.subscription_status
  if (!s || s === 'activo') {
    const days = pro.subscription_expires_at
      ? Math.ceil((new Date(pro.subscription_expires_at) - new Date()) / 86400000)
      : null
    if (days !== null && days <= 7) return 'warning'
    return pro.plan_type === 'destacado' ? 'destacado' : 'active'
  }
  if (s === 'trial') return 'trial'
  if (s === 'vencido') return 'expired'
  return 'inactive'
}

// ── Servicio principal ───────────────────────────────────────────────────────

export const professionalsService = {
  isConfiguredWithSupabase() {
    return isSupabaseConfigured
  },

  async getProfessionals() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('professionals')
          .select('*')
          .order('order_index', { ascending: true })

        if (error) {
          console.warn('Fallo consulta a Supabase, recurriendo a localStorage local:', error.message)
          return { data: getLocalProfessionals(), source: 'local-fallback', error }
        }

        // Si la tabla en Supabase está vacía, podemos sugerir o devolver lo que hay
        if (data && data.length > 0) {
          return { data, source: 'supabase' }
        } else {
          return { data: getLocalProfessionals(), source: 'local-fallback' }
        }
      } catch (err) {
        console.warn('Error conectando a Supabase:', err)
        return { data: getLocalProfessionals(), source: 'local-fallback', error: err }
      }
    }

    return { data: getLocalProfessionals(), source: 'local' }
  },

  async createProfessional(proData) {
    const newId = proData.id || `pro-${Date.now()}`
    const record = {
      ...proData,
      id: newId,
      status: proData.status || 'active',
      order_index: Number(proData.order_index) || 99,
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('professionals')
          .insert([record])
          .select()
          .single()

        if (!error && data) {
          notifySubscribers()
          return { success: true, data, source: 'supabase' }
        }
        console.warn('Error creando en Supabase, guardando en local:', error)
      } catch (err) {
        console.warn('Excepción creando en Supabase:', err)
      }
    }

    const current = getLocalProfessionals()
    const updated = [record, ...current]
    saveLocalProfessionals(updated)
    return { success: true, data: record, source: 'local' }
  },

  async updateProfessional(id, proData) {
    const cleanData = {
      ...proData,
      order_index: Number(proData.order_index) || 1,
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('professionals')
          .update(cleanData)
          .eq('id', id)
          .select()
          .single()

        if (!error && data) {
          notifySubscribers()
          return { success: true, data, source: 'supabase' }
        }
        console.warn('Error actualizando en Supabase, recurriendo a local:', error)
      } catch (err) {
        console.warn('Excepción actualizando en Supabase:', err)
      }
    }

    const current = getLocalProfessionals()
    const updated = current.map((p) => (p.id === id ? { ...p, ...cleanData } : p))
    saveLocalProfessionals(updated)
    return { success: true, data: cleanData, source: 'local' }
  },

  async deleteProfessional(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('professionals')
          .delete()
          .eq('id', id)

        if (!error) {
          notifySubscribers()
          return { success: true, source: 'supabase' }
        }
        console.warn('Error eliminando en Supabase:', error)
      } catch (err) {
        console.warn('Excepción eliminando en Supabase:', err)
      }
    }

    const current = getLocalProfessionals()
    const updated = current.filter((p) => p.id !== id)
    saveLocalProfessionals(updated)
    return { success: true, source: 'local' }
  },

  async resetToDefaults() {
    saveLocalProfessionals([...defaultProfessionals])
    return { success: true, data: defaultProfessionals }
  },

  /**
   * Renueva o cambia la suscripción de un profesional.
   * @param {string} id - ID del profesional
   * @param {'basico'|'destacado'} plan - Tipo de plan
   * @param {number} months - Meses a agregar (default 1)
   */
  async updateSubscription(id, plan = 'basico', months = 1) {
    const current = getLocalProfessionals()
    const pro = current.find((p) => p.id === id)

    // Si ya tiene fecha vigente, extender desde ahí; si no, desde hoy
    const baseDate =
      pro?.subscription_expires_at && new Date(pro.subscription_expires_at) > new Date()
        ? new Date(pro.subscription_expires_at)
        : new Date()

    const newExpiry = new Date(baseDate)
    newExpiry.setMonth(newExpiry.getMonth() + months)

    const price = plan === 'destacado' ? 25000 : 15000
    const updates = {
      plan_type: plan,
      subscription_status: 'activo',
      subscription_expires_at: newExpiry.toISOString(),
      subscription_price: price,
    }

    return this.updateProfessional(id, updates)
  },

  /**
   * Marca la suscripción como vencida manualmente (ej: no pagó).
   */
  async expireSubscription(id) {
    return this.updateProfessional(id, {
      subscription_status: 'vencido',
    })
  },

  onProfessionalsChange(callback) {
    if (typeof window === 'undefined') return () => {}
    const handler = (e) => {
      callback(e.detail)
    }
    window.addEventListener(CHANGE_EVENT_NAME, handler)
    window.addEventListener('storage', (e) => {
      if (e.key === LOCAL_STORAGE_KEY) {
        callback(getLocalProfessionals())
      }
    })
    return () => {
      window.removeEventListener(CHANGE_EVENT_NAME, handler)
    }
  },
}
