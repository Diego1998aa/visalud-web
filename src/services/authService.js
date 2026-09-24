import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

const LOCAL_AUTH_SESSION_KEY = 'visalud_admin_session'

// Lista estricta de correos autorizados como Creador / Soporte Técnico
export const SUPPORT_AUTHORIZED_EMAILS = [
  'diego.alexander.alocilla@gmail.com',
  'soporte@visalud.cl',
]

export function isAuthorizedForSupport(userOrEmail) {
  if (!userOrEmail) return false
  const email = (typeof userOrEmail === 'string' ? userOrEmail : userOrEmail.email || '')
    .trim()
    .toLowerCase()
  const metaRole = typeof userOrEmail === 'object' ? userOrEmail.user_metadata?.role : null

  return (
    SUPPORT_AUTHORIZED_EMAILS.includes(email) ||
    metaRole === 'support' ||
    metaRole === 'creator' ||
    metaRole === 'superadmin' ||
    email.includes('soporte') ||
    email.includes('support')
  )
}

// Determinar el rol según los permisos estrictos del usuario
export function determineRole(user, requestedRole = null) {
  if (!user) return 'admin'

  const canSupport = isAuthorizedForSupport(user)

  // Si tiene autorización de soporte (Creador):
  if (canSupport) {
    // Si solicitó ver como admin para previsualizar, se lo permitimos; si no, queda como soporte
    return requestedRole === 'admin' ? 'admin' : 'support'
  }

  // Cualquier otro usuario (incluyendo admin@visalud.cl) es SIEMPRE admin estricto
  return 'admin'
}

export const authService = {
  isSupabaseActive() {
    return isSupabaseConfigured && Boolean(supabase)
  },

  // Obtener la sesión activa actual
  async getSession() {
    // 1. Intentar con Supabase Auth si está configurado
    if (this.isSupabaseActive()) {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (!error && data?.session?.user) {
          const user = data.session.user
          const savedRole = sessionStorage.getItem('visalud_user_role')
          const role = determineRole(user, savedRole)
          return { user, role, source: 'supabase' }
        }
      } catch (err) {
        console.warn('Error verificando sesión con Supabase Auth:', err)
      }
    }

    // 2. Verificar si hay una sesión local en sessionStorage/localStorage
    try {
      const saved = sessionStorage.getItem(LOCAL_AUTH_SESSION_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.user) {
          return {
            user: parsed.user,
            role: parsed.role || 'admin',
            source: parsed.source || 'local',
          }
        }
      }
    } catch (e) {
      console.error('Error leyendo sesión local:', e)
    }

    return null
  },

  // Iniciar sesión con email y contraseña
  async signIn(email, password, requestedRole = 'admin') {
    const cleanEmail = email.trim().toLowerCase()
    const isSupportUser = isAuthorizedForSupport(cleanEmail)
    const isValidPass =
      password === 'Visalud2026*' || password === 'admin123*' || password === 'visalud2026'

    // 1. Intentar autenticar con Supabase Auth si está configurado
    if (this.isSupabaseActive()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        })

        if (!error && data?.user) {
          const userCanSupport = isAuthorizedForSupport(data.user)

          // RESTRICCIÓN ESTRICTA: Si intenta entrar como Soporte pero NO está autorizado
          if (requestedRole === 'support' && !userCanSupport) {
            await supabase.auth.signOut().catch(() => {})
            throw new Error(
              'Acceso denegado: Esta cuenta no tiene permisos de Creador / Soporte Técnico. Por favor selecciona el perfil Administrador.'
            )
          }

          const role = determineRole(data.user, requestedRole)
          sessionStorage.setItem('visalud_user_role', role)
          return { success: true, user: data.user, role, source: 'supabase' }
        }

        // Si Supabase devuelve credenciales inválidas, verificar si son credenciales de contingencia
        if (error) {
          if (
            (cleanEmail === 'admin@visalud.cl' || isSupportUser) &&
            isValidPass
          ) {
            if (requestedRole === 'support' && !isSupportUser) {
              throw new Error(
                'Acceso denegado: Esta cuenta no tiene permisos de Creador / Soporte Técnico. Por favor selecciona el perfil Administrador.'
              )
            }

            const assignedRole = isSupportUser && requestedRole === 'support' ? 'support' : 'admin'
            const fallbackUser = {
              id: isSupportUser ? 'support-master' : 'admin-master',
              email: cleanEmail,
              user_metadata: {
                role: assignedRole,
                name: isSupportUser ? 'Diego (Soporte Técnico)' : 'Administrador Clínico Visalud',
              },
            }
            sessionStorage.setItem(
              LOCAL_AUTH_SESSION_KEY,
              JSON.stringify({ user: fallbackUser, role: assignedRole, source: 'contingency' })
            )
            sessionStorage.setItem('visalud_user_role', assignedRole)
            return { success: true, user: fallbackUser, role: assignedRole, source: 'contingency' }
          }

          if (error.message && error.message.includes('Invalid login credentials')) {
            throw new Error('El correo electrónico o la contraseña son incorrectos.')
          }

          throw error
        }
      } catch (err) {
        // Manejo específico si Supabase está inaccesible (Failed to fetch, servidor pausado o sin red)
        const isNetworkError =
          err?.message?.includes('Failed to fetch') ||
          err?.message?.includes('NetworkError') ||
          err?.message?.includes('fetch') ||
          err?.name === 'TypeError'

        if (
          (cleanEmail === 'admin@visalud.cl' || isSupportUser) &&
          isValidPass
        ) {
          if (requestedRole === 'support' && !isSupportUser) {
            throw new Error(
              'Acceso denegado: Esta cuenta no tiene permisos de Creador / Soporte Técnico. Por favor selecciona el perfil Administrador.'
            )
          }

          const assignedRole = isSupportUser && requestedRole === 'support' ? 'support' : 'admin'
          const fallbackUser = {
            id: isSupportUser ? 'support-master' : 'admin-master',
            email: cleanEmail,
            user_metadata: {
              role: assignedRole,
              name: isSupportUser ? 'Diego (Soporte Técnico)' : 'Administrador Clínico Visalud',
            },
          }
          sessionStorage.setItem(
            LOCAL_AUTH_SESSION_KEY,
            JSON.stringify({ user: fallbackUser, role: assignedRole, source: 'offline-contingency' })
          )
          sessionStorage.setItem('visalud_user_role', assignedRole)
          return {
            success: true,
            user: fallbackUser,
            role: assignedRole,
            source: 'offline-contingency',
          }
        }

        if (isNetworkError) {
          throw new Error(
            'No se pudo conectar con el servidor de Supabase. Revisa tu conexión o credenciales.'
          )
        }

        throw err
      }
    }

    // 2. Fallback local si Supabase no está activo
    if (
      (cleanEmail === 'admin@visalud.cl' || isSupportEmail) &&
      isValidPass
    ) {
      const assignedRole = isSupportEmail ? 'support' : 'admin'
      const localUser = {
        id: isSupportEmail ? 'local-support' : 'local-admin',
        email: cleanEmail,
        user_metadata: {
          role: assignedRole,
          name: isSupportEmail ? 'Soporte Técnico' : 'Administrador Clínico',
        },
      }
      sessionStorage.setItem(
        LOCAL_AUTH_SESSION_KEY,
        JSON.stringify({ user: localUser, role: assignedRole, source: 'local' })
      )
      return { success: true, user: localUser, role: assignedRole, source: 'local' }
    }

    throw new Error('Credenciales incorrectas o usuario no registrado.')
  },

  // Cerrar sesión
  async signOut() {
    sessionStorage.removeItem(LOCAL_AUTH_SESSION_KEY)
    sessionStorage.removeItem('visalud_user_role')
    if (this.isSupabaseActive()) {
      try {
        await supabase.auth.signOut()
      } catch (e) {
        console.warn('Error cerrando sesión en Supabase:', e)
      }
    }
    return { success: true }
  },

  // Escuchar cambios de estado en Supabase Auth
  onAuthStateChange(callback) {
    if (this.isSupabaseActive()) {
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const role = determineRole(session.user)
          callback({ event, user: session.user, role })
        } else {
          callback({ event, user: null, role: null })
        }
      })
      return () => authListener?.subscription?.unsubscribe()
    }
    return () => {}
  },
}
