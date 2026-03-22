import { createRoot } from 'react-dom/client'

function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 560 }}>
      <h1 style={{ marginTop: 0 }}>Nested Rspack + React</h1>
      <p style={{ lineHeight: 1.6, color: '#444' }}>
        This app is a <strong>second</strong> Rspack dev server (port <code>9301</code>), started from the
        Rspack DevTools <strong>Launcher</strong> — same idea as Vite DevTools starting another <code>vite dev</code>.
      </p>
      <p style={{ lineHeight: 1.6, color: '#444' }}>
        Main playground runs on port <code>9300</code> with DevTools; this demo has no DevTools plugin to avoid port conflicts.
      </p>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
