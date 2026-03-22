import React, { useState } from 'react'
import { applyTheme } from './theme'

function readThemeFromDom() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}

export function App() {
  const [count, setCount] = useState(0)
  const [theme, setTheme] = useState(readThemeFromDom)

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    setTheme(next)
  }

  return (
    <div className="app">
      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      >
        {theme === 'dark' ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      <div className="hero">
        <div className="logo-wrapper">
          <svg className="logo" width="72" height="72" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="logo-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60a5fa" />
                <stop offset="1" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#logo-grad)" />
          </svg>
        </div>
        <h1>Rspack DevTools</h1>
        <p className="subtitle">Playground for testing Rspack DevTools integration</p>
      </div>

      <div className="hint-box">
        <span className="hint-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="hint-svg">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </span>
        <span>
          Hover the dock bar on the edge of the screen, or press <kbd>Alt+D</kbd> to open DevTools.
        </span>
      </div>

      <div className="card-grid">
        <div className="card">
          <h3>Counter</h3>
          <div className="counter-value">{count}</div>
          <div className="counter-actions">
            <button onClick={() => setCount(c => c - 1)}>-</button>
            <button onClick={() => setCount(0)}>Reset</button>
            <button onClick={() => setCount(c => c + 1)}>+</button>
          </div>
        </div>

        <div className="card">
          <h3>About</h3>
          <p className="card-text">
            This playground demonstrates the <code>RspackDevTools()</code> function-style
            plugin API, consistent with <code>DevTools()</code> from vite-devtools.
          </p>
        </div>

        <div className="card">
          <h3>Installation</h3>
          <pre className="code-block">{`import { RspackDevTools } from '@rspack-devtools/core'

export default {
  plugins: [
    RspackDevTools(),
  ],
}`}</pre>
        </div>
      </div>
    </div>
  )
}
