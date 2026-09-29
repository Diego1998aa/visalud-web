import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

const LOCAL_STORAGE_KEY = 'visalud_leads_db'
const CHANGE_EVENT_NAME = 'visalud_leads_changed'

// Solicitudes de ejemplo iniciales para que la administración vea el funcionamiento inmediato
const INITIAL_DEMO_LEADS = [
  {
    id: 'lead-osorno-demo-1',
    name: 'Carolina Henríquez',
    email: 'carolina.henriquez@gmail.com',
    phone: '+56987654321',
    subject: 'Turno Completo (12 hrs)',
    sector: 'Pilauco / Kolbe',
    message: 'Necesito una TENS de lunes a viernes para mi padre de 82 años con movilidad reducida y secuela de ACV. Requiere asistencia en baño en cama, movilización y control de medicamentos.',
    status: 'new',
    notes: 'Prioridad alta: El familiar requiere iniciar la próxima semana.',
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // Hace 35 min
  },
  {
    id: 'lead-osorno-demo-2',
    name: 'Rodrigo Mansilla',
    email: 'rodrigo_osorno@outlook.cl',
    phone: '+56976543210',
    subject: 'Vigilia Nocturna (12 hrs)',
    sector: 'Rahue Alto',
    message: 'Busco cuidadora o TENS nocturna para vigilia de mi madre con Alzheimer. Tiende a desorientarse por las noches y queremos descansar con tranquilidad.',
    status: 'contacted',
    notes: 'Contactado por WhatsApp. Se le enviaron perfiles de TENS Patricia y TENS Marcela.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // Hace 5 horas
  }
]

function getLocalLeads() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) {
      // Migrar si existía contingencia anterior bajo 'visalud_leads'
      const legacy = localStorage.getItem('visalud_leads')
      if (legacy) {
        try {
          const parsedLegacy = JSON.parse(legacy)
          if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
            const normalized = parsedLegacy.map((item, idx) => ({
              id: item.id || `lead-legacy-${Date.now()}-${idx}`,
              name: item.name || 'Paciente sin nombre',
              email: item.email || null,
              phone: item.phone || '',
              subject: item.subject || 'Consulta de Cuidados',
              sector: item.sector || 'Osorno Urbano',
              message: item.message || '',
              status: item.status || 'new',
              notes: item.notes || '',
              created_at: item.date || item.created_at || new Date().toISOString(),
            }))
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized))
            return normalized
          }
        } catch (e) {}
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_LEADS))
      return [...INITIAL_DEMO_LEADS]
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : [...INITIAL_DEMO_LEADS]
  } catch (e) {
    console.error('Error leyendo leads de localStorage:', e)
    return [...INITIAL_DEMO_LEADS]
  }
}

function saveLocalLeads(list) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list))
    notifySubscribers(list)
  } catch (e) {
    console.error('Error guardando leads en localStorage:', e)
  }
}

function notifySubscribers(list) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT_NAME, { detail: list }))
  }
}

export const leadsService = {
  // Obtener todas las solicitudes registradas (de Supabase o LocalStorage)
  async getLeads() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && data) {
          // Normalizar campos si la tabla usa columnas estructuradas
          const normalized = data.map((item) => ({
            id: item.id,
            name: item.name || 'Familiar',
            email: item.email || '',
            phone: item.phone || '',
            subject: item.subject || 'Cuidado Adulto Mayor',
            sector: item.sector || (item.subject?.includes('Sector:') ? item.subject.split('Sector:')[1]?.trim() : 'Osorno'),
            message: item.message || '',
            status: item.status || 'new',
            notes: item.notes || '',
            created_at: item.created_at || new Date().toISOString(),
          }))
          return { data: normalized, source: 'supabase' }
        }
      } catch (err) {
        console.warn('Fallo Supabase para contact_messages, usando local:', err)
      }
    }

    const localLeads = getLocalLeads()
    return { data: localLeads, source: 'local' }
  },

  // Registrar nueva consulta recibida desde el formulario de la web
  async addLead(leadData) {
    const newLead = {
      id: `lead-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: leadData.name?.trim() || 'Familiar',
      email: leadData.email?.trim() || null,
      phone: leadData.phone?.trim() || '',
      subject: leadData.subject || 'Cuidado Adulto Mayor',
      sector: leadData.sector || 'Osorno Urbano',
      message: leadData.message?.trim() || '',
      status: 'new',
      notes: '',
      created_at: new Date().toISOString(),
    }

    let savedToSupabase = false
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('contact_messages')
          .insert([newLead])
          .select()

        if (!error && data && data[0]) {
          savedToSupabase = true
          newLead.id = data[0].id
        }
      } catch (err) {
        console.warn('No se pudo guardar lead en Supabase:', err)
      }
    }

    // Guardar siempre en LocalStorage como respaldo y sincronización reactiva
    const current = getLocalLeads()
    const updated = [newLead, ...current.filter((l) => l.id !== newLead.id)]
    saveLocalLeads(updated)

    return { data: newLead, source: savedToSupabase ? 'supabase' : 'local' }
  },

  // Actualizar estado (nuevo, contactado, agendado, cerrado) y notas internas
  async updateLead(id, updates) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('contact_messages')
          .update(updates)
          .eq('id', id)
      } catch (err) {
        console.warn('Error actualizando lead en Supabase:', err)
      }
    }

    const current = getLocalLeads()
    const updated = current.map((lead) => (lead.id === id ? { ...lead, ...updates } : lead))
    saveLocalLeads(updated)

    return { data: updated.find((l) => l.id === id) }
  },

  // Eliminar una solicitud
  async deleteLead(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('contact_messages')
          .delete()
          .eq('id', id)
      } catch (err) {
        console.warn('Error eliminando lead en Supabase:', err)
      }
    }

    const current = getLocalLeads()
    const updated = current.filter((lead) => lead.id !== id)
    saveLocalLeads(updated)

    return { success: true }
  },

  // Suscribirse a cambios en tiempo real
  onLeadsChange(callback) {
    const handleStorageChange = (e) => {
      callback(e.detail)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener(CHANGE_EVENT_NAME, handleStorageChange)
    }

    let supabaseChannel = null
    if (isSupabaseConfigured && supabase) {
      try {
        supabaseChannel = supabase
          .channel('public:contact_messages')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => {
            this.getLeads().then((res) => callback(res.data))
          })
          .subscribe()
      } catch (err) {
        console.warn('Error en suscripción realtime de contact_messages:', err)
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(CHANGE_EVENT_NAME, handleStorageChange)
      }
      if (supabaseChannel && supabase) {
        supabase.removeChannel(supabaseChannel)
      }
    }
  },
}
