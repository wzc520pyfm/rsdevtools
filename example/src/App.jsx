import React, { useState, useEffect } from 'react'
import { Counter } from './components/Counter'
import { TodoList } from './components/TodoList'
import { UserCard } from './components/UserCard'
import { DateDisplay } from './components/DateDisplay'
import { ThemeToggle } from './components/ThemeToggle'
import { DevToolsDemo } from './pages/DevToolsDemo'
import { FileExplorer } from './pages/FileExplorer'

const routes = {
  '/': 'home',
  '/devtools': 'devtools',
  '/explorer': 'explorer',
}

function useHashRouter() {
  const [path, setPath] = useState(window.location.hash.slice(1) || '/')
  useEffect(() => {
    const onHashChange = () => setPath(window.location.hash.slice(1) || '/')
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  return [path, (p) => { window.location.hash = p }]
}

export function App() {
  const [path, navigate] = useHashRouter()
  const page = routes[path] || 'home'

  return (
    <div className="app-shell">
      <nav className="app-nav">
        <div className="nav-brand" onClick={() => navigate('/')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#nav-grad)"/>
            <defs><linearGradient id="nav-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stopColor="#60a5fa"/><stop offset="1" stopColor="#a78bfa"/></linearGradient></defs>
          </svg>
          <span>Rspack Playground</span>
        </div>
        <div className="nav-links">
          <a className={`nav-link ${page === 'home' ? 'active' : ''}`} href="#/">Home</a>
          <a className={`nav-link ${page === 'devtools' ? 'active' : ''}`} href="#/devtools">DevTools</a>
          <a className={`nav-link ${page === 'explorer' ? 'active' : ''}`} href="#/explorer">File Explorer</a>
        </div>
      </nav>

      <main className="app-main">
        {page === 'home' && <HomePage />}
        {page === 'devtools' && <DevToolsDemo />}
        {page === 'explorer' && <FileExplorer />}
      </main>
    </div>
  )
}

function HomePage() {
  return (
    <div className="home-page">
      <div className="hero">
        <div className="hero-logos">
          <svg className="hero-icon" width="80" height="80" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#hero-grad)"/>
            <defs><linearGradient id="hero-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stopColor="#60a5fa"/><stop offset="1" stopColor="#a78bfa"/></linearGradient></defs>
          </svg>
          <span className="hero-plus">+</span>
          <svg className="hero-icon" width="80" height="80" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#61dafb" strokeWidth="1.5" fill="none"/>
            <circle cx="12" cy="12" r="2.5" fill="#61dafb"/>
          </svg>
        </div>
        <h1>Rspack + React</h1>
        <p className="hero-sub">A playground for Rspack DevTools — explore build analysis, module graphs, and more</p>
      </div>

      <div className="feature-hint">
        <div className="hint-icon">💡</div>
        <div>
          <strong>Try the DevTools!</strong> Click the floating{' '}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{verticalAlign: 'middle', margin: '0 2px'}}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#60a5fa"/>
          </svg>
          {' '}icon on the left edge, or press <kbd>Alt+D</kbd> to open the embedded DevTools panel.
        </div>
      </div>

      <div className="grid-3">
        <Counter />
        <DateDisplay />
        <ThemeToggle />
      </div>

      <UserCard name="Developer" role="Frontend Engineer" />
      <TodoList />

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-value">57</span>
          <span className="stat-label">Modules</span>
        </div>
        <div className="stat">
          <span className="stat-value">10</span>
          <span className="stat-label">Packages</span>
        </div>
        <div className="stat">
          <span className="stat-value">6</span>
          <span className="stat-label">Components</span>
        </div>
        <div className="stat">
          <span className="stat-value">4</span>
          <span className="stat-label">Stores</span>
        </div>
      </div>
    </div>
  )
}
