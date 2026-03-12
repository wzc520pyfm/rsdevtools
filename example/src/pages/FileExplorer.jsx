import React, { useState, useEffect, useRef } from 'react'

const DEVTOOLS_PORT = 7821

export function FileExplorer() {
  const [connected, setConnected] = useState(false)
  const [modules, setModules] = useState([])
  const [selectedModule, setSelectedModule] = useState(null)
  const [moduleDetail, setModuleDetail] = useState(null)
  const [filter, setFilter] = useState('')
  const wsRef = useRef(null)
  const rpcIdRef = useRef(0)
  const pendingRef = useRef({})

  function rpcCall(method, params) {
    return new Promise((resolve, reject) => {
      const ws = wsRef.current
      if (!ws || ws.readyState !== WebSocket.OPEN) return reject(new Error('Not connected'))
      const id = `rpc-${++rpcIdRef.current}`
      ws.send(JSON.stringify({ m: method, a: [params], t: id }))
      pendingRef.current[id] = { resolve, reject }
    })
  }

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:${DEVTOOLS_PORT}`)
    wsRef.current = ws

    ws.addEventListener('open', async () => {
      setConnected(true)
      try {
        const sessions = await rpcCall('rspack:list-sessions', {})
        if (sessions?.length > 0) {
          const mods = await rpcCall('rspack:get-modules', { session: sessions[0].id })
          setModules(mods || [])
        }
      } catch {}
    })

    ws.addEventListener('message', (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.t && pendingRef.current[msg.t]) {
          pendingRef.current[msg.t].resolve(msg.d)
          delete pendingRef.current[msg.t]
        }
      } catch {}
    })

    ws.addEventListener('close', () => setConnected(false))
    return () => ws.close()
  }, [])

  async function selectModule(mod) {
    setSelectedModule(mod.id)
    try {
      const sessions = await rpcCall('rspack:list-sessions', {})
      if (sessions?.length > 0) {
        const detail = await rpcCall('rspack:get-module-info', { session: sessions[0].id, module: mod.id })
        setModuleDetail(detail)
      }
    } catch {}
  }

  function openInEditor(path) {
    rpcCall('rspack:open-in-editor', { path }).catch(() => {})
  }

  const filtered = modules.filter(m => {
    if (!filter) return true
    return m.name?.toLowerCase().includes(filter.toLowerCase())
  })

  function getIcon(name) {
    if (name?.endsWith('.jsx')) return '⚛️'
    if (name?.endsWith('.css')) return '🎨'
    if (name?.endsWith('.json')) return '📋'
    if (name?.includes('node_modules')) return '📦'
    return '📄'
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  function shortName(name) {
    if (!name) return ''
    const parts = name.replace(/^\.\//, '')
    if (parts.length > 50) return '...' + parts.slice(-47)
    return parts
  }

  return (
    <div className="explorer-page">
      <div className="explorer-header">
        <h1>File Explorer</h1>
        <p>Browse all modules in the current build — a demonstration of custom DevTools panels, similar to vite-devtools' plugin-file-explorer example.</p>
      </div>

      {!connected ? (
        <div className="explorer-offline">
          <div className="offline-icon">🔌</div>
          <h3>Not Connected</h3>
          <p>Make sure Rspack DevTools server is running on port {DEVTOOLS_PORT}.</p>
        </div>
      ) : (
        <div className="explorer-layout">
          <div className="explorer-sidebar">
            <div className="explorer-search">
              <input
                type="text"
                placeholder="Filter modules..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
              <span className="module-count">{filtered.length} / {modules.length}</span>
            </div>
            <div className="file-list">
              {filtered.map(mod => (
                <button
                  key={mod.id}
                  className={`file-item ${selectedModule === mod.id ? 'selected' : ''}`}
                  onClick={() => selectModule(mod)}
                >
                  <span className="file-icon">{getIcon(mod.name)}</span>
                  <span className="file-name">{shortName(mod.name)}</span>
                  <span className="file-size">{formatSize(mod.size)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="explorer-detail">
            {!moduleDetail ? (
              <div className="detail-empty">
                <div className="detail-empty-icon">👈</div>
                <p>Select a module to view its details</p>
              </div>
            ) : (
              <div className="detail-content">
                <div className="detail-header">
                  <h3>{getIcon(moduleDetail.name)} {shortName(moduleDetail.name)}</h3>
                  {moduleDetail.name && !moduleDetail.name.includes('node_modules') && (
                    <button className="editor-btn" onClick={() => openInEditor(moduleDetail.name)}>
                      Open in Editor ↗
                    </button>
                  )}
                </div>

                <div className="detail-meta">
                  <div className="meta-row"><span className="meta-key">ID</span><span className="meta-val mono">{moduleDetail.id}</span></div>
                  <div className="meta-row"><span className="meta-key">Type</span><span className="meta-val">{moduleDetail.moduleType}</span></div>
                  <div className="meta-row"><span className="meta-key">Size</span><span className="meta-val">{formatSize(moduleDetail.size)}</span></div>
                  <div className="meta-row"><span className="meta-key">Chunks</span><span className="meta-val">{moduleDetail.chunks?.join(', ') || 'none'}</span></div>
                  <div className="meta-row"><span className="meta-key">Depth</span><span className="meta-val">{moduleDetail.depth ?? 'N/A'}</span></div>
                </div>

                {moduleDetail.dependencies?.length > 0 && (
                  <div className="detail-section">
                    <h4>Dependencies ({moduleDetail.dependencies.length})</h4>
                    <div className="dep-list">
                      {moduleDetail.dependencies.slice(0, 20).map((dep, i) => (
                        <span key={i} className="dep-badge">{shortName(dep)}</span>
                      ))}
                      {moduleDetail.dependencies.length > 20 && (
                        <span className="dep-badge more">+{moduleDetail.dependencies.length - 20} more</span>
                      )}
                    </div>
                  </div>
                )}

                {moduleDetail.dependents?.length > 0 && (
                  <div className="detail-section">
                    <h4>Dependents ({moduleDetail.dependents.length})</h4>
                    <div className="dep-list">
                      {moduleDetail.dependents.slice(0, 20).map((dep, i) => (
                        <span key={i} className="dep-badge dependent">{shortName(dep)}</span>
                      ))}
                    </div>
                  </div>
                )}

                {moduleDetail.source && (
                  <div className="detail-section">
                    <h4>Source Code</h4>
                    <pre className="source-code">{moduleDetail.source}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
