import React, { useState, useEffect, useRef } from 'react'

const DEVTOOLS_PORT = 7821

export function DevToolsDemo() {
  const [connected, setConnected] = useState(false)
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [sessionData, setSessionData] = useState(null)
  const [rpcLog, setRpcLog] = useState([])
  const wsRef = useRef(null)
  const rpcIdRef = useRef(0)
  const pendingRef = useRef({})

  function addLog(type, method, data) {
    setRpcLog(prev => [{ id: Date.now(), type, method, data, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 50))
  }

  function rpcCall(method, params) {
    return new Promise((resolve, reject) => {
      const ws = wsRef.current
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        reject(new Error('Not connected'))
        return
      }
      const id = `rpc-${++rpcIdRef.current}`
      const msg = JSON.stringify({ m: method, a: [params], t: id })
      pendingRef.current[id] = { resolve, reject }
      ws.send(msg)
      addLog('request', method, params)
    })
  }

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:${DEVTOOLS_PORT}`)
    wsRef.current = ws

    ws.addEventListener('open', () => {
      setConnected(true)
      addLog('event', 'connected', { port: DEVTOOLS_PORT })
      rpcCall('rspack:list-sessions', {}).then(data => {
        setSessions(data || [])
      }).catch(() => {})
    })

    ws.addEventListener('message', (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.t && pendingRef.current[msg.t]) {
          pendingRef.current[msg.t].resolve(msg.d)
          addLog('response', msg.t, msg.d)
          delete pendingRef.current[msg.t]
        } else if (msg.m === 'rspack:build-completed') {
          addLog('event', 'build-completed', msg.a?.[0])
          rpcCall('rspack:list-sessions', {}).then(data => {
            setSessions(data || [])
          }).catch(() => {})
        }
      } catch {}
    })

    ws.addEventListener('close', () => {
      setConnected(false)
      addLog('event', 'disconnected', {})
    })

    return () => ws.close()
  }, [])

  async function loadSession(id) {
    setSelectedSession(id)
    try {
      const data = await rpcCall('rspack:get-session', { session: id })
      setSessionData(data)
    } catch {}
  }

  return (
    <div className="devtools-demo">
      <div className="demo-header">
        <h1>DevTools Integration</h1>
        <p>This page demonstrates the RPC connection between the application and Rspack DevTools server.</p>
      </div>

      <div className="demo-grid">
        <div className="demo-card">
          <div className="demo-card-header">
            <h3>Connection Status</h3>
            <span className={`status-dot ${connected ? 'online' : 'offline'}`} />
          </div>
          <div className="demo-card-body">
            <div className="kv-row">
              <span className="kv-key">WebSocket</span>
              <span className="kv-val">{connected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Server</span>
              <span className="kv-val mono">localhost:{DEVTOOLS_PORT}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Protocol</span>
              <span className="kv-val mono">birpc over ws</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Sessions</span>
              <span className="kv-val">{sessions.length}</span>
            </div>
          </div>
        </div>

        <div className="demo-card">
          <div className="demo-card-header">
            <h3>Build Sessions</h3>
          </div>
          <div className="demo-card-body">
            {sessions.length === 0 ? (
              <div className="empty-state">No sessions yet. Run a build to see data.</div>
            ) : (
              <div className="session-list">
                {sessions.map(s => (
                  <button
                    key={s.id}
                    className={`session-btn ${selectedSession === s.id ? 'selected' : ''}`}
                    onClick={() => loadSession(s.id)}
                  >
                    <span className="session-hash">{s.hash?.slice(0, 8)}</span>
                    <span className="session-time">{new Date(s.timestamp).toLocaleTimeString()}</span>
                    <span className="session-duration">{s.duration}ms</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {sessionData && (
          <div className="demo-card wide">
            <div className="demo-card-header">
              <h3>Session Details</h3>
              <span className="mono text-sm">{selectedSession}</span>
            </div>
            <div className="demo-card-body">
              <div className="stats-grid">
                <div className="mini-stat">
                  <span className="mini-val">{sessionData.modules?.length || 0}</span>
                  <span className="mini-label">Modules</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-val">{sessionData.chunks?.length || 0}</span>
                  <span className="mini-label">Chunks</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-val">{sessionData.assets?.length || 0}</span>
                  <span className="mini-label">Assets</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-val">{sessionData.plugins?.length || 0}</span>
                  <span className="mini-label">Plugins</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-val">{sessionData.packages?.length || 0}</span>
                  <span className="mini-label">Packages</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-val">{sessionData.errors?.length || 0}</span>
                  <span className="mini-label">Errors</span>
                </div>
              </div>

              <h4 style={{marginTop: '1rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#888'}}>RPC Methods Available</h4>
              <div className="rpc-methods">
                {[
                  'rspack:list-sessions', 'rspack:get-session', 'rspack:get-modules',
                  'rspack:get-chunks', 'rspack:get-assets', 'rspack:get-plugins',
                  'rspack:get-packages', 'rspack:get-module-graph', 'rspack:compare-sessions',
                  'rspack:open-in-editor', 'rspack:run-terminal',
                ].map(m => (
                  <span key={m} className="rpc-badge">{m.replace('rspack:', '')}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="demo-card wide">
          <div className="demo-card-header">
            <h3>RPC Activity Log</h3>
            <span className="text-sm" style={{color: '#888'}}>{rpcLog.length} events</span>
          </div>
          <div className="demo-card-body log-body">
            {rpcLog.length === 0 ? (
              <div className="empty-state">Waiting for RPC activity...</div>
            ) : (
              rpcLog.map(entry => (
                <div key={entry.id} className={`log-entry log-${entry.type}`}>
                  <span className="log-time">{entry.time}</span>
                  <span className={`log-type-badge ${entry.type}`}>{entry.type}</span>
                  <span className="log-method">{entry.method}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
