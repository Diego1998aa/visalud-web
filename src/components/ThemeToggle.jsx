export default function ThemeToggle({ theme, onToggle, showLabel = false, className = '' }) {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className={`theme-toggle-switch ${isDark ? 'theme-dark' : 'theme-light'} ${className}`}
      onClick={onToggle}
      aria-label={isDark ? 'Activar modo día' : 'Activar modo noche'}
      aria-pressed={isDark}
      title={isDark ? 'Cambiar a modo día (claro)' : 'Cambiar a modo noche (oscuro)'}
    >
      <span className="theme-toggle-track">
        {/* Ícono de Sol */}
        <span className="theme-icon sun-icon" aria-hidden="true">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        </span>

        {/* Ícono de Luna */}
        <span className="theme-icon moon-icon" aria-hidden="true">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            <path d="M19 3v4" />
            <path d="M21 5h-4" />
          </svg>
        </span>

        {/* Círculo deslizante animado */}
        <span className="theme-toggle-thumb" aria-hidden="true">
          {isDark ? (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          ) : (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
            >
              <circle cx="12" cy="12" r="5" />
            </svg>
          )}
        </span>
      </span>

      {showLabel && (
        <span className="theme-toggle-text">
          {isDark ? 'Modo Noche' : 'Modo Día'}
        </span>
      )}
    </button>
  )
}
