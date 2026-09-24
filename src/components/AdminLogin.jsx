import { useState } from 'react'
import { authService } from '../services/authService.js'
import './AdminLogin.css'

export default function AdminLogin({ onLoginSuccess, onBackToSite, theme, onToggleTheme }) {
  const [roleTab, setRoleTab] = useState('admin') // 'admin' | 'support'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setErrorMsg('Por favor completa todos los campos para ingresar.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const res = await authService.signIn(email, password, roleTab)
      if (res.success) {
        onLoginSuccess(res.user, res.role)
      }
    } catch (err) {
      console.error('Error de autenticación:', err)
      setErrorMsg(err.message || 'No se pudo iniciar sesión. Verifica tus credenciales.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Rellenar credenciales rápidas de muestra para facilitar la prueba
  const handlePrefill = (type) => {
    if (type === 'admin') {
      setRoleTab('admin')
      setEmail('admin@visalud.cl')
      setPassword('Visalud2026*')
    } else {
      setRoleTab('support')
      setEmail('diego.alexander.alocilla@gmail.com')
      setPassword('Visalud2026*')
    }
    setErrorMsg('')
  }

  return (
    <div className={`visalud-admin-login theme-${theme || 'light'}`}>
      {/* Barra superior con controles */}
      <div className="login-top-bar">
        <button
          type="button"
          className="btn-login-back"
          onClick={onBackToSite}
          title="Volver a la página principal de Visalud"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Volver a Visalud</span>
        </button>

        {onToggleTheme && (
          <button
            type="button"
            className="btn-login-theme"
            onClick={onToggleTheme}
            title="Alternar Modo Oscuro / Claro"
          >
            {theme === 'dark' ? '☀️ Claro' : '🌙 Oscuro'}
          </button>
        )}
      </div>

      {/* Tarjeta Central de Inicio de Sesión */}
      <div className="login-card-container">
        <div className="login-card">
          {/* Logo y Encabezado */}
          <div className="login-header">
            <div className="login-logo-halo">
              <img src="/visalud-logo.png" alt="Visalud" className="login-logo-img" />
            </div>
            <h1 className="login-title">Control de Acceso Clínico</h1>
            <p className="login-subtitle">
              Autenticación oficial de administración & soporte técnico Visalud
            </p>
          </div>

          {/* Selector de Perfil / Rol */}
          <div className="login-role-selector">
            <button
              type="button"
              className={`role-tab-btn ${roleTab === 'admin' ? 'active' : ''}`}
              onClick={() => {
                setRoleTab('admin')
                setErrorMsg('')
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Administrador</span>
            </button>

            <button
              type="button"
              className={`role-tab-btn ${roleTab === 'support' ? 'active' : ''}`}
              onClick={() => {
                setRoleTab('support')
                setErrorMsg('')
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              <span>Creador / Soporte</span>
            </button>
          </div>

          {/* Mensaje de error si existe */}
          {errorMsg && (
            <div className="login-error-alert" role="alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Formulario de Login */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-input-group">
              <label htmlFor="login-email">Correo Electrónico</label>
              <div className="login-input-wrap">
                <span className="input-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder={roleTab === 'admin' ? 'admin@visalud.cl' : 'soporte@visalud.cl'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login-input-group">
              <label htmlFor="login-password">Contraseña</label>
              <div className="login-input-wrap">
                <span className="input-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="btn-toggle-eye"
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  aria-label="Alternar visibilidad de contraseña"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-submit-login"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="login-spinner" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Panel</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Ayuda de Acceso y Relleno Rápido de Prueba */}
          <div className="login-quick-helper">
            <span className="helper-label">Acceso de prueba y soporte rápido:</span>
            <div className="helper-buttons">
              <button
                type="button"
                className="btn-prefill"
                onClick={() => handlePrefill('admin')}
              >
                🩺 Como Admin
              </button>
              <button
                type="button"
                className="btn-prefill"
                onClick={() => handlePrefill('support')}
              >
                🛠️ Como Soporte
              </button>
            </div>
            <p className="helper-note">
              Conectado a Supabase Auth. También puedes registrar nuevos usuarios desde tu panel de Supabase en <em>Authentication → Users</em>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
