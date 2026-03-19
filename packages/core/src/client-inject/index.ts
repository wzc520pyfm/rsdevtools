/// <reference lib="dom" />
import { makeSVG, renderIcon } from './icons'
import type { DockButtonItem, DockEntry, DockState, InjectConfig } from './types'

function init() {
  if (typeof window === 'undefined') return
  if ((window as any).__RSPACK_DEVTOOLS_INJECTED__) return
  if (window.parent !== window) return
  ;(window as any).__RSPACK_DEVTOOLS_INJECTED__ = true

  const config = (window as any).__RSPACK_DEVTOOLS_INJECT_CONFIG__ as InjectConfig
  delete (window as any).__RSPACK_DEVTOOLS_INJECT_CONFIG__
  if (!config) return

  const DEVTOOLS_URL = config.devtoolsUrl
  const WS_PORT = config.wsPort
  const STORAGE_KEY = 'rspack-devtools-dock-state-v5'
  const CLIENT_AUTH_ENABLED = config.clientAuth
  const REGISTERED_DOCKS = config.docks

  // ===== Auth ID =====
  const AUTH_KEY = 'rspack-devtools-auth-id'
  let authId = ''
  try { authId = localStorage.getItem(AUTH_KEY) || '' } catch {}
  if (!authId) {
    authId = `RDT${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`
    try { localStorage.setItem(AUTH_KEY, authId) } catch {}
  }
  let isRpcTrusted = !CLIENT_AUTH_ENABLED

  // ===== Build dock entries =====
  let DOCKS: DockEntry[] = REGISTERED_DOCKS.map((d) => {
    const entry: DockEntry = { id: d.id, title: d.title, icon: d.icon, type: d.type, category: d.category || 'default' }
    if (d.type === 'iframe') entry.url = d.url ? (d.url.indexOf('://') > -1 ? d.url : DEVTOOLS_URL + d.url) : DEVTOOLS_URL
    if (d.type === 'launcher') entry.launcher = d.launcher
    if (d.type === 'action') entry.action = d.action
    if (d.type === 'custom-render') entry.renderer = d.renderer
    return entry
  })

  if (DOCKS.length === 0) {
    DOCKS = [{ id: 'rspack-build', title: 'Build Analysis', icon: 'ph:lightning-duotone', type: 'iframe', url: DEVTOOLS_URL, category: '~rspackplus' }]
  }

  const BUILTIN_DOCKS: DockEntry[] = [
    { id: '~terminals', title: 'Terminals', icon: 'ph:terminal-duotone', type: '~builtin', url: `${DEVTOOLS_URL}/dock/terminals`, category: '~builtin' },
    { id: '~logs', title: 'Logs & Notifications', icon: 'ph:notification-duotone', type: '~builtin', url: `${DEVTOOLS_URL}/dock/logs`, category: '~builtin' },
    { id: '~settings', title: 'Settings', icon: 'ph:gear-duotone', type: '~builtin', url: `${DEVTOOLS_URL}/dock/settings`, category: '~builtin' },
    { id: '~popup', title: 'Popup', icon: 'ph:arrow-square-out-duotone', type: '~popup', category: '~builtin' },
  ]
  DOCKS = DOCKS.concat(BUILTIN_DOCKS)

  // ===== State =====
  const defaults: DockState = {
    position: 'left', width: 80, height: 75, left: 50, top: 50,
    open: false, selectedDock: null, anchorOffset: 50,
    inactiveTimeout: 4000,
  }
  let store: DockState
  try { store = Object.assign({}, defaults, JSON.parse(localStorage.getItem(STORAGE_KEY)!)) }
  catch { store = Object.assign({}, defaults) }
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)) } catch {} }

  // ===== Root =====
  const root = document.createElement('div')
  root.id = 'rspack-devtools-root'
  root.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;inset:0;font-family:system-ui,-apple-system,sans-serif;font-size:15px;'

  const glow = document.createElement('div')
  glow.id = 'rspack-devtools-glowing'
  glow.style.cssText = 'position:absolute;left:0;top:0;width:160px;height:160px;opacity:0;transition:all 1000ms ease-out;pointer-events:none;z-index:-1;border-radius:50%;filter:blur(60px);background-image:linear-gradient(45deg,#61d9ff,#7a23a1,#715ebd);transform:translate(-50%,-50%);'

  const anchor = document.createElement('div')
  anchor.id = 'rspack-devtools-anchor'
  anchor.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:auto;user-select:none;width:0;transform-origin:center;transform:translate(-50%,-50%);'

  const dockContainer = document.createElement('div')
  dockContainer.id = 'rspack-devtools-dock-container'
  dockContainer.style.cssText = 'position:absolute;left:0;top:0;height:40px;min-width:100px;width:max-content;display:flex;transform:translate(-50%,-50%);transition:all 500ms cubic-bezier(0.34,1.56,0.64,1);'

  const dockBar = document.createElement('div')
  dockBar.id = 'rspack-devtools-dock'
  dockBar.style.cssText = 'height:40px;border-radius:9999px;user-select:none;touch-action:none;margin:auto;background:rgba(17,17,17,0.5);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);box-shadow:0 1px 3px 0 rgba(0,0,0,0.1),0 1px 2px -1px rgba(0,0,0,0.1);transition:all 500ms cubic-bezier(0.34,1.56,0.64,1);display:flex;align-items:center;position:relative;width:calc-size(max-content,size);'

  const bracketL = document.createElement('span')
  bracketL.style.cssText = 'position:absolute;left:-4px;top:50%;transform:translateY(-50%);width:10px;color:white;opacity:0.75;transition:opacity 300ms,width 500ms;display:flex;align-items:center;'
  bracketL.innerHTML = makeSVG('bracket-left')

  const bracketR = document.createElement('span')
  bracketR.style.cssText = 'position:absolute;right:-4px;top:50%;transform:translateY(-50%);width:10px;color:white;opacity:0.75;transition:opacity 300ms,width 500ms;display:flex;align-items:center;'
  bracketR.innerHTML = makeSVG('bracket-right')

  const miniLogo = document.createElement('div')
  miniLogo.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:12px;height:12px;opacity:0;transition:opacity 300ms;pointer-events:none;display:flex;align-items:center;justify-content:center;'
  miniLogo.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="rgl2" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#60a5fa"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#rgl2)"/></svg>'

  const dockEntriesEl = document.createElement('div')
  dockEntriesEl.style.cssText = 'display:flex;align-items:center;width:100%;height:100%;justify-content:center;padding:0 12px;gap:0;transition:opacity 300ms;overflow:hidden;'

  // ===== Split docks into visible & overflow =====
  const DOCK_CAPACITY = 5
  const visibleDocks = DOCKS.slice(0, DOCK_CAPACITY)
  const overflowDocks = DOCKS.slice(DOCK_CAPACITY)

  // ===== Create dock buttons =====
  const dockButtons: DockButtonItem[] = []
  function createDockButton(dock: DockEntry): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.title = dock.title
    btn.dataset.dockId = dock.id
    btn.style.cssText = 'display:flex;align-items:center;justify-content:center;width:32px;height:32px;border:none;background:transparent;color:rgba(255,255,255,0.5);cursor:pointer;border-radius:12px;transition:all 300ms cubic-bezier(0.34,1.56,0.64,1);padding:0;position:relative;'
    btn.innerHTML = renderIcon(dock.icon)
    btn.onmouseenter = () => {
      if (store.selectedDock !== dock.id || !store.open) {
        btn.style.color = 'rgba(255,255,255,0.85)'
        btn.style.background = 'rgba(136,136,136,0.07)'
        btn.style.transform = 'scale(1.1)'
      }
      showTooltip(btn, dock.title)
    }
    btn.onmouseleave = () => {
      if (store.selectedDock !== dock.id || !store.open) {
        btn.style.color = 'rgba(255,255,255,0.5)'
        btn.style.background = 'transparent'
        btn.style.transform = 'scale(1)'
      }
      hideTooltip()
    }
    ;(btn as any)._dockClickHandler = () => { handleDockClick(dock) }
    dockButtons.push({ el: btn, dock })
    return btn
  }

  // ===== Auth badge =====
  let authBadge: HTMLButtonElement | null = null
  const dockButtonElements: HTMLButtonElement[] = []
  let overflowSeparator: HTMLDivElement | null = null

  if (CLIENT_AUTH_ENABLED) {
    authBadge = document.createElement('button')
    authBadge.id = 'rspack-devtools-auth-badge'
    authBadge.textContent = 'Unauthorized'
    authBadge.style.cssText = 'display:flex;align-items:center;height:24px;border:none;background:rgba(239,68,68,0.15);color:#ef4444;cursor:pointer;border-radius:6px;padding:0 8px;font-size:11px;font-weight:600;margin-right:4px;transition:all 200ms;white-space:nowrap;'
    authBadge.onmouseenter = () => { authBadge!.style.background = 'rgba(239,68,68,0.25)'; showTooltip(authBadge!, 'Click to authorize') }
    authBadge.onmouseleave = () => { authBadge!.style.background = 'rgba(239,68,68,0.15)'; hideTooltip() }
    ;(authBadge as any)._dockClickHandler = () => {
      openPanel({ id: '~auth-notice', title: 'Unauthorized', icon: '', type: '~builtin', category: '~builtin' })
      showPanelContent('auth-notice')
    }
    if (!isRpcTrusted) {
      dockEntriesEl.appendChild(authBadge)
    }
  }

  function setDockButtonsVisible(visible: boolean) {
    const display = visible ? 'flex' : 'none'
    dockButtonElements.forEach((el) => { el.style.display = display })
    if (overflowSeparator) overflowSeparator.style.display = display
    if (overflowBtnEl) overflowBtnEl.style.display = display
  }

  function updateAuthUI() {
    if (!authBadge) return
    if (isRpcTrusted) {
      if (authBadge.parentNode) authBadge.parentNode.removeChild(authBadge)
      setDockButtonsVisible(true)
      if (store.open && store.selectedDock === '~auth-notice') closePanel()
    }
    else {
      if (!authBadge.parentNode) dockEntriesEl.insertBefore(authBadge, dockEntriesEl.firstChild)
      setDockButtonsVisible(false)
    }
  }

  visibleDocks.forEach((dock) => {
    const btn = createDockButton(dock)
    dockButtonElements.push(btn)
    dockEntriesEl.appendChild(btn)
  })

  // ===== Overflow button & popup =====
  let overflowPopup: HTMLDivElement | null = null
  let overflowBtnEl: HTMLButtonElement | null = null

  let updateBadgePosition: (() => void) | null = null

  if (overflowDocks.length > 0) {
    const sep = document.createElement('div')
    sep.style.cssText = 'width:1px;height:20px;background:rgba(255,255,255,0.1);margin:0 4px;flex-shrink:0;'
    overflowSeparator = sep
    dockEntriesEl.appendChild(sep)

    overflowBtnEl = document.createElement('button')
    overflowBtnEl.title = `More (${overflowDocks.length})`
    overflowBtnEl.style.cssText = 'display:flex;align-items:center;justify-content:center;width:32px;height:32px;border:none;background:transparent;color:rgba(255,255,255,0.45);cursor:pointer;border-radius:12px;transition:all 300ms cubic-bezier(0.34,1.56,0.64,1);padding:0;position:relative;'
    overflowBtnEl.innerHTML = '<svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor"><path d="M128 24a104 104 0 10104 104A104.11 104.11 0 00128 24zm0 192a88 88 0 1188-88 88.1 88.1 0 01-88 88zm12-88a12 12 0 11-12-12 12 12 0 0112 12zm-44 0a12 12 0 11-12-12 12 12 0 0112 12zm88 0a12 12 0 11-12-12 12 12 0 0112 12z" opacity="0.85"/></svg>'

    const badge = document.createElement('span')
    const badgeText = overflowDocks.length > 9 ? '9+' : String(overflowDocks.length)
    badge.textContent = badgeText
    badge.style.cssText = 'position:absolute;min-width:12px;height:12px;border-radius:6px;background:#a78bfa;color:white;font-size:8px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 2px;line-height:1;'
    overflowBtnEl.appendChild(badge)

    updateBadgePosition = () => {
      if (isVertical()) {
        badge.style.top = '-2px'; badge.style.left = '-3px'
        badge.style.right = 'auto'; badge.style.bottom = 'auto'
        badge.style.transform = 'rotate(-90deg)'
      }
      else {
        badge.style.top = '-2px'; badge.style.right = '-3px'
        badge.style.left = 'auto'; badge.style.bottom = 'auto'
        badge.style.transform = 'none'
      }
    }

    const _overflowBtnEl = overflowBtnEl
    overflowBtnEl.onmouseenter = () => {
      _overflowBtnEl.style.color = 'rgba(255,255,255,0.85)'
      _overflowBtnEl.style.background = 'rgba(136,136,136,0.07)'
      _overflowBtnEl.style.transform = 'scale(1.1)'
    }
    overflowBtnEl.onmouseleave = () => {
      _overflowBtnEl.style.color = 'rgba(255,255,255,0.45)'
      _overflowBtnEl.style.background = 'transparent'
      _overflowBtnEl.style.transform = 'scale(1)'
    }
    ;(overflowBtnEl as any)._dockClickHandler = () => { toggleOverflowPopup() }
    dockEntriesEl.appendChild(overflowBtnEl)

    overflowPopup = document.createElement('div')
    overflowPopup.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:auto;display:none;padding:4px;border-radius:10px;background:rgba(17,17,17,0.92);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);border:1px solid rgba(255,255,255,0.08);box-shadow:0 4px 16px rgba(0,0,0,0.45);max-width:220px;'

    const overflowGrid = document.createElement('div')
    overflowGrid.style.cssText = 'display:flex;flex-wrap:wrap;gap:0;justify-content:center;'
    overflowDocks.forEach((dock) => {
      overflowGrid.appendChild(createDockButton(dock))
    })
    overflowPopup.appendChild(overflowGrid)
    root.appendChild(overflowPopup)

    const _overflowPopup = overflowPopup
    document.addEventListener('pointerdown', (e) => {
      if (_overflowPopup.style.display !== 'none' && !_overflowPopup.contains(e.target as Node) && e.target !== _overflowBtnEl && !_overflowBtnEl.contains(e.target as Node)) {
        _overflowPopup.style.display = 'none'
      }
    })
  }

  function toggleOverflowPopup() {
    if (!overflowPopup || !overflowBtnEl) return
    if (overflowPopup.style.display !== 'none') {
      overflowPopup.style.display = 'none'
      return
    }
    overflowPopup.style.display = 'block'
    const rect = overflowBtnEl.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const p = store.position
    overflowPopup.style.left = 'auto'; overflowPopup.style.right = 'auto'
    overflowPopup.style.top = 'auto'; overflowPopup.style.bottom = 'auto'
    if (p === 'left') {
      overflowPopup.style.left = `${rect.right + 6}px`
      overflowPopup.style.top = `${cy - 20}px`
    }
    else if (p === 'right') {
      overflowPopup.style.right = `${window.innerWidth - rect.left + 6}px`
      overflowPopup.style.top = `${cy - 20}px`
    }
    else if (p === 'top') {
      overflowPopup.style.left = `${cx - 20}px`
      overflowPopup.style.top = `${rect.bottom + 6}px`
    }
    else {
      overflowPopup.style.left = `${cx - 20}px`
      overflowPopup.style.bottom = `${window.innerHeight - rect.top + 6}px`
    }
  }

  dockBar.appendChild(bracketL)
  dockBar.appendChild(bracketR)
  dockBar.appendChild(miniLogo)
  dockBar.appendChild(dockEntriesEl)
  dockContainer.appendChild(dockBar)
  anchor.appendChild(glow)
  anchor.appendChild(dockContainer)

  // ===== Tooltip =====
  const tooltip = document.createElement('div')
  tooltip.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;padding:5px 10px;border-radius:8px;background:rgba(20,20,30,0.95);color:rgba(255,255,255,0.85);font-size:12px;font-weight:500;white-space:nowrap;opacity:0;transition:opacity 150ms;backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.08);box-shadow:0 4px 12px rgba(0,0,0,0.35);'
  root.appendChild(tooltip)

  function showTooltip(el: HTMLElement, text: string) {
    tooltip.textContent = text
    const r = el.getBoundingClientRect()
    const isVert = store.position === 'left' || store.position === 'right'
    if (isVert) {
      tooltip.style.left = `${store.position === 'left' ? r.right + 8 : r.left - 8}px`
      tooltip.style.top = `${r.top + r.height / 2}px`
      tooltip.style.transform = store.position === 'left' ? 'translateY(-50%)' : 'translate(-100%,-50%)'
    }
    else {
      tooltip.style.left = `${r.left + r.width / 2}px`
      tooltip.style.top = `${store.position === 'top' ? r.bottom + 8 : r.top - 8}px`
      tooltip.style.transform = store.position === 'top' ? 'translateX(-50%)' : 'translate(-50%,-100%)'
    }
    tooltip.style.opacity = '1'
  }
  function hideTooltip() { tooltip.style.opacity = '0' }

  // ===== Panel =====
  const panel = document.createElement('div')
  panel.id = 'rspack-devtools-panel'
  panel.style.cssText = 'position:fixed;z-index:2147483646;pointer-events:auto;display:none;background:rgba(17,17,17,0.75);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(136,136,136,0.13);border-radius:8px;overflow:hidden;opacity:0;transition:opacity 200ms ease,transform 300ms cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 4px 24px rgba(0,0,0,0.3);'

  const iframeCache = new Map<string, HTMLIFrameElement>()
  let activeIframe: HTMLIFrameElement | null = null

  function getOrCreateIframe(dockId: string, url: string): HTMLIFrameElement {
    let iframe = iframeCache.get(dockId)
    if (!iframe) {
      iframe = document.createElement('iframe')
      iframe.setAttribute('allowtransparency', 'true')
      iframe.style.cssText = 'width:100%;border:none;border-radius:8px;display:none;background:transparent;'
      iframe.addEventListener('load', () => {
        try {
          const doc = iframe!.contentDocument
          if (doc) {
            const s = doc.createElement('style')
            s.textContent = 'html, html.dark, html.light, body, #__nuxt { background: transparent !important; }'
            doc.head.appendChild(s)
          }
        }
        catch {}
      })
      iframe.src = url
      panel.appendChild(iframe)
      iframeCache.set(dockId, iframe)
    }
    return iframe
  }

  const panelLauncher = document.createElement('div')
  panelLauncher.style.cssText = 'width:100%;display:none;padding:40px;text-align:center;color:rgba(255,255,255,0.8);'

  const panelCustom = document.createElement('div')
  panelCustom.style.cssText = 'width:100%;display:none;overflow:auto;'

  const panelAuthNotice = document.createElement('div')
  panelAuthNotice.style.cssText = 'width:100%;display:none;padding:60px 40px;text-align:center;color:rgba(255,255,255,0.8);overflow:auto;'
  panelAuthNotice.innerHTML = [
    '<div style="margin-bottom:20px;font-size:48px;">&#x26A0;&#xFE0F;</div>',
    '<h2 style="font-size:20px;font-weight:700;color:rgba(255,255,255,0.95);margin:0 0 12px;">Rspack DevTools is Unauthorized</h2>',
    '<p style="color:rgba(255,255,255,0.55);font-size:14px;line-height:1.6;max-width:420px;margin:0 auto 12px;">',
    'Rspack DevTools offers advanced features that can access your server, view your filesystem, and execute commands.',
    '</p>',
    '<p style="color:rgba(255,255,255,0.55);font-size:14px;line-height:1.6;max-width:420px;margin:0 auto 24px;">',
    'To protect your project from unauthorized access, please authorize your browser before proceeding.',
    '</p>',
    '<div style="display:inline-block;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:8px;padding:12px 24px;">',
    '<p style="color:#22c55e;font-weight:600;font-size:13px;margin:0;">Check your terminal for the authorization prompt and come back.</p>',
    '</div>',
  ].join('')

  panel.appendChild(panelLauncher)
  panel.appendChild(panelCustom)
  panel.appendChild(panelAuthNotice)

  // ===== Toast overlay =====
  const toastContainer = document.createElement('div')
  toastContainer.id = 'rspack-devtools-toasts'
  toastContainer.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:2147483647;pointer-events:auto;width:320px;display:flex;flex-direction:column;gap:8px;'

  function dismissToast(toast: HTMLDivElement) {
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(20px)'
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast) }, 300)
  }

  function addToast(entry: { level?: string; message: string; description?: string; autoDismiss?: number }) {
    const toast = document.createElement('div')
    toast.style.cssText = 'padding:10px 14px;border-radius:10px;background:rgba(20,20,30,0.95);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);box-shadow:0 4px 16px rgba(0,0,0,0.4);color:rgba(255,255,255,0.85);font-size:13px;cursor:pointer;transition:all 300ms;opacity:0;transform:translateX(20px);display:flex;align-items:flex-start;gap:8px;'
    const levelColors: Record<string, string> = { error: '#ef4444', warn: '#eab308', success: '#22c55e', info: '#3b82f6', debug: '#9ca3af' }
    const bar = document.createElement('div')
    bar.style.cssText = `width:3px;min-height:20px;border-radius:2px;flex-shrink:0;align-self:stretch;background:${levelColors[entry.level || ''] || '#3b82f6'};`
    const body = document.createElement('div')
    body.style.cssText = 'flex:1;min-width:0;'
    const msg = document.createElement('div')
    msg.style.cssText = 'font-weight:500;font-size:12px;'
    msg.textContent = entry.message
    body.appendChild(msg)
    if (entry.description) {
      const desc = document.createElement('div')
      desc.style.cssText = 'font-size:11px;color:rgba(255,255,255,0.5);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'
      desc.textContent = entry.description
      body.appendChild(desc)
    }
    toast.appendChild(bar)
    toast.appendChild(body)
    toast.onclick = () => {
      handleDockClick(DOCKS.find(d => d.id === '~logs'))
      dismissToast(toast)
    }
    toastContainer.appendChild(toast)
    requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'none' })
    const timeout = entry.autoDismiss || 5000
    setTimeout(() => { dismissToast(toast) }, timeout)
  }

  root.appendChild(anchor)
  root.appendChild(panel)
  root.appendChild(toastContainer)
  document.body.appendChild(root)

  // ===== WebSocket =====
  const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:'

  let rpcReqCounter = 0
  function nextRpcId() { return `rdt-${++rpcReqCounter}-${Date.now()}` }

  function requestAuth(ws: WebSocket) {
    if (!CLIENT_AUTH_ENABLED || isRpcTrusted) return
    const rid = nextRpcId()
    try {
      const ua = navigator.userAgent || 'Unknown'
      ws.send(JSON.stringify({ m: 'rspack:anonymous:auth', a: [{ authId, ua, origin: location.origin }], t: 'q', i: rid }))
      const handler = (e: MessageEvent) => {
        try {
          const msg = JSON.parse(e.data)
          if (msg.t === 's' && msg.i === rid) {
            ws.removeEventListener('message', handler)
            if (msg.r && msg.r.isTrusted) {
              isRpcTrusted = true
              updateAuthUI()
            }
          }
        }
        catch {}
      }
      ws.addEventListener('message', handler)
    }
    catch {}
  }

  function connectWs() {
    try {
      let wsUrl = `${wsProtocol}//${config.host}:${WS_PORT}`
      if (CLIENT_AUTH_ENABLED) wsUrl += `?rspack_devtools_auth_id=${encodeURIComponent(authId)}`
      const ws = new WebSocket(wsUrl)
      ws.onopen = () => { requestAuth(ws) }
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          if (msg.t === 'q' && msg.m === 'devtoolskit:internal:logs:updated' && isRpcTrusted) {
            fetchNewLogs(ws)
          }
        }
        catch {}
      }
      ws.onclose = () => { setTimeout(connectWs, 5000) }
      ws.onerror = () => {}
    }
    catch {}
  }

  let lastLogVersion: number | undefined
  function fetchNewLogs(ws: WebSocket) {
    const rid = nextRpcId()
    try {
      ws.send(JSON.stringify({ m: 'devtoolskit:internal:logs:list', a: [lastLogVersion], t: 'q', i: rid }))
      const handler = (e: MessageEvent) => {
        try {
          const msg = JSON.parse(e.data)
          if (msg.t === 's' && msg.i === rid && msg.r) {
            ws.removeEventListener('message', handler)
            lastLogVersion = msg.r.version
            if (msg.r.entries) {
              msg.r.entries.forEach((entry: any) => {
                if (entry.notify) addToast(entry)
              })
            }
          }
        }
        catch {}
      }
      ws.addEventListener('message', handler)
    }
    catch {}
  }

  connectWs()

  // ===== Panel content switching =====
  function showPanelContent(type: string) {
    iframeCache.forEach(iframe => { iframe.style.display = 'none' })
    activeIframe = null
    panelLauncher.style.display = type === 'launcher' ? 'block' : 'none'
    panelCustom.style.display = type === 'custom-render' ? 'block' : 'none'
    panelAuthNotice.style.display = type === 'auth-notice' ? 'block' : 'none'
  }

  function renderLauncher(dock: DockEntry) {
    const l = dock.launcher!
    panelLauncher.innerHTML = ''
    const icon = document.createElement('div')
    icon.style.cssText = 'margin-bottom:16px;'
    icon.innerHTML = renderIcon(dock.icon, 48)
    icon.firstChild && ((icon.firstChild as HTMLElement).style.color = 'rgba(255,255,255,0.5)')
    const title = document.createElement('h3')
    title.style.cssText = 'font-size:18px;font-weight:600;color:rgba(255,255,255,0.9);margin:0 0 8px;'
    title.textContent = l.title
    const desc = document.createElement('p')
    desc.style.cssText = 'font-size:13px;color:rgba(255,255,255,0.5);margin:0 0 24px;'
    desc.textContent = l.description || ''
    const btn = document.createElement('button')
    btn.style.cssText = 'padding:8px 24px;border-radius:8px;border:none;background:#a78bfa;color:white;font-size:14px;font-weight:500;cursor:pointer;transition:all 200ms;'
    btn.textContent = l.buttonStart || 'Launch'
    const status = l.status || 'idle'
    if (status === 'loading') { btn.textContent = l.buttonLoading || 'Loading...'; btn.disabled = true; btn.style.opacity = '0.6' }
    if (status === 'success') { btn.textContent = 'Done'; btn.disabled = true; btn.style.background = '#22c55e' }
    if (status === 'error') { btn.textContent = 'Error'; btn.disabled = true; btn.style.background = '#ef4444' }
    btn.onclick = () => {
      btn.textContent = l.buttonLoading || 'Loading...'
      btn.disabled = true
      btn.style.opacity = '0.6'
      fetch(`${DEVTOOLS_URL}/.devtools/api/launch/${encodeURIComponent(dock.id)}`, { method: 'POST' })
        .then(() => { btn.textContent = 'Done'; btn.style.background = '#22c55e' })
        .catch(() => { btn.textContent = 'Error'; btn.style.background = '#ef4444' })
    }
    panelLauncher.appendChild(icon)
    panelLauncher.appendChild(title)
    panelLauncher.appendChild(desc)
    panelLauncher.appendChild(btn)
  }

  // ===== Dock click handler =====
  function handleDockClick(dock: DockEntry | undefined) {
    if (!dock) return

    if (CLIENT_AUTH_ENABLED && !isRpcTrusted && dock.id !== '~auth-notice') {
      openPanel({ id: '~auth-notice', title: 'Unauthorized', icon: '', type: '~builtin', category: '~builtin' })
      showPanelContent('auth-notice')
      return
    }

    if (dock.type === '~popup') {
      window.open(DEVTOOLS_URL, 'rspack-devtools', 'width=1200,height=800')
      return
    }

    if (dock.type === 'action') {
      loadClientScript(dock.action!, dock)
      return
    }

    if (store.open && store.selectedDock === dock.id) {
      closePanel()
      return
    }

    store.selectedDock = dock.id
    openPanel(dock)
  }

  function appendAuthParam(url: string): string {
    if (!CLIENT_AUTH_ENABLED || !authId) return url
    const sep = url.indexOf('?') > -1 ? '&' : '?'
    return `${url}${sep}rspack_devtools_auth_id=${encodeURIComponent(authId)}`
  }

  function openPanel(dock: DockEntry) {
    store.open = true
    store.selectedDock = dock.id
    save()

    if (dock.id === '~auth-notice') {
      showPanelContent('auth-notice')
    }
    else if (dock.type === 'launcher') {
      showPanelContent('launcher')
      renderLauncher(dock)
    }
    else if (dock.type === 'custom-render') {
      showPanelContent('custom-render')
      loadClientScript(dock.renderer!, dock)
    }
    else {
      showPanelContent('iframe')
      let url = dock.url || DEVTOOLS_URL
      url = appendAuthParam(url)
      const iframe = getOrCreateIframe(dock.id, url)
      iframe.style.display = 'block'
      activeIframe = iframe
    }

    positionPanel()
    panel.style.display = 'block'
    requestAnimationFrame(() => { panel.style.opacity = '1'; panel.style.transform = 'none' })
    updateDockButtons()
    if (inactiveTimer) clearTimeout(inactiveTimer)
  }

  function closePanel() {
    store.open = false
    save()
    panel.style.opacity = '0'
    setTimeout(() => { if (!store.open) panel.style.display = 'none' }, 200)
    updateDockButtons()
    resetInactiveTimer()
  }

  // ===== Client script execution =====
  const loadedScripts: Record<string, boolean> = {}
  function loadClientScript(scriptDef: { importFrom: string; importName?: string }, dock: DockEntry) {
    if (!scriptDef || !scriptDef.importFrom) return
    const key = `${dock.type}:${dock.id}`
    if (loadedScripts[key] && dock.type !== 'action') return

    import(`${DEVTOOLS_URL}/.devtools/client-imports.js`).then((mod: any) => {
      if (!mod.importsMap || !mod.importsMap[key]) return
      return mod.importsMap[key]()
    }).then((setupFn: any) => {
      if (!setupFn) return
      loadedScripts[key] = true
      const eventHandlers: Record<string, Array<(...args: any[]) => void>> = {}
      const ctx = {
        current: {
          rpc: { call(_method: string) { /* simplified RPC */ } },
          events: {
            on(evt: string, fn: (...args: any[]) => void) { if (!eventHandlers[evt]) eventHandlers[evt] = []; eventHandlers[evt].push(fn) },
            off(evt: string, fn: (...args: any[]) => void) { if (eventHandlers[evt]) eventHandlers[evt] = eventHandlers[evt].filter(f => f !== fn) },
            emit(evt: string, ...args: any[]) { (eventHandlers[evt] || []).forEach(fn => fn(...args)) },
          },
        },
      }
      setupFn(ctx)
      ctx.current.events.emit('entry:activated')
    }).catch((err: any) => { console.warn(`[DevTools] Failed to load client script for ${key}`, err) })
  }

  // ===== Minimization =====
  let isMinimized = false
  let inactiveTimer: ReturnType<typeof setTimeout> | null = null
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  function minimize() {
    if (store.open || isMinimized || isTouchDevice) return
    isMinimized = true
    dockBar.style.width = '22px'; dockBar.style.height = '22px'; dockBar.style.padding = '0'
    dockEntriesEl.style.opacity = '0'; dockEntriesEl.style.pointerEvents = 'none'
    miniLogo.style.opacity = '1'
    bracketL.style.width = '6px'; bracketL.style.opacity = '0.5'
    bracketR.style.width = '6px'; bracketR.style.opacity = '0.5'
    if (overflowPopup) overflowPopup.style.display = 'none'
  }
  function expand() {
    if (!isMinimized) return
    isMinimized = false
    dockBar.style.width = 'calc-size(max-content,size)'; dockBar.style.height = '40px'; dockBar.style.padding = ''
    dockEntriesEl.style.opacity = '1'; dockEntriesEl.style.pointerEvents = 'auto'
    miniLogo.style.opacity = '0'
    bracketL.style.width = '10px'; bracketL.style.opacity = '0.75'
    bracketR.style.width = '10px'; bracketR.style.opacity = '0.75'
    resetInactiveTimer()
  }
  function resetInactiveTimer() {
    if (inactiveTimer) clearTimeout(inactiveTimer)
    if (store.inactiveTimeout > 0 && !store.open) inactiveTimer = setTimeout(minimize, store.inactiveTimeout)
  }

  anchor.onmouseenter = () => { glow.style.opacity = '0.6'; expand() }
  anchor.onmouseleave = () => { glow.style.opacity = '0'; resetInactiveTimer() }
  anchor.onmousemove = () => { if (!isMinimized) resetInactiveTimer() }

  function isVertical(): boolean { return store.position === 'left' || store.position === 'right' }

  function positionAnchor() {
    const p = store.position
    const m = 2
    anchor.style.left = 'auto'; anchor.style.right = 'auto'; anchor.style.top = 'auto'; anchor.style.bottom = 'auto'
    dockContainer.style.transform = isVertical() ? 'translate(-50%,-50%) rotate(90deg)' : 'translate(-50%,-50%)'
    const halfH = 20
    const off = store.anchorOffset
    if (p === 'left') { anchor.style.left = `${m + halfH}px`; anchor.style.top = `${off}%` }
    else if (p === 'right') { anchor.style.left = `${window.innerWidth - m - halfH}px`; anchor.style.top = `${off}%` }
    else if (p === 'top') { anchor.style.left = `${off}%`; anchor.style.top = `${m + halfH}px` }
    else { anchor.style.left = `${off}%`; anchor.style.top = `${window.innerHeight - m - halfH}px` }
    if (updateBadgePosition) updateBadgePosition()
  }

  function positionPanel() {
    const p = store.position
    const w = store.width
    const h = store.height
    const m = 8
    const off = store.anchorOffset
    const dockOffset = Math.round((dockBar.offsetHeight || 40) / 2)
    const maxH = `calc(100vh - ${m * 2}px)`
    const hStyle = `min(${h}vh,${maxH})`
    panel.style.left = 'auto'; panel.style.right = 'auto'; panel.style.top = 'auto'; panel.style.bottom = 'auto'
    const centerV = `clamp(${m}px, calc(${off}vh - ${h / 2}vh), calc(100vh - ${h}vh - ${m}px))`
    const centerH = `clamp(${m}px, calc(${off}vw - ${w / 2}vw), calc(100vw - ${w}vw - ${m}px))`
    if (p === 'left') {
      panel.style.left = `${dockOffset}px`; panel.style.top = centerV
      panel.style.width = `${w}vw`; panel.style.height = hStyle
      iframeCache.forEach(f => { f.style.height = hStyle })
      panelLauncher.style.height = panelCustom.style.height = panelAuthNotice.style.height = hStyle
    }
    else if (p === 'right') {
      panel.style.right = `${dockOffset}px`; panel.style.top = centerV
      panel.style.width = `${w}vw`; panel.style.height = hStyle
      iframeCache.forEach(f => { f.style.height = hStyle })
      panelLauncher.style.height = panelCustom.style.height = panelAuthNotice.style.height = hStyle
    }
    else if (p === 'bottom') {
      panel.style.left = centerH; panel.style.bottom = `${m}px`
      panel.style.width = `calc(100vw - ${dockOffset * 2}px)`; panel.style.height = `${h}vh`
      iframeCache.forEach(f => { f.style.height = `${h}vh` })
      panelLauncher.style.height = panelCustom.style.height = panelAuthNotice.style.height = `${h}vh`
    }
    else {
      panel.style.left = centerH; panel.style.top = `${m}px`
      panel.style.width = `calc(100vw - ${dockOffset * 2}px)`; panel.style.height = `${h}vh`
      iframeCache.forEach(f => { f.style.height = `${h}vh` })
      panelLauncher.style.height = panelCustom.style.height = panelAuthNotice.style.height = `${h}vh`
    }
  }

  function updateDockButtons() {
    dockButtons.forEach((item) => {
      const isSelected = store.selectedDock === item.dock.id && store.open
      item.el.style.color = isSelected ? '#a78bfa' : 'rgba(255,255,255,0.5)'
      item.el.style.background = isSelected ? 'rgba(136,136,136,0.07)' : 'transparent'
      item.el.style.transform = isSelected ? 'scale(1.2)' : 'scale(1)'
    })
  }

  // ===== Drag =====
  let isDragging = false
  let wasDragging = false
  let dragStartX = 0
  let dragStartY = 0
  let dragStartTarget: EventTarget | null = null

  anchor.onpointerdown = (e: PointerEvent) => {
    if (e.button !== 0) return
    isDragging = true; wasDragging = false
    dragStartX = e.clientX; dragStartY = e.clientY
    dragStartTarget = e.target
    anchor.setPointerCapture(e.pointerId)
    e.preventDefault()
  }
  anchor.onpointermove = (e: PointerEvent) => {
    if (!isDragging) return
    if (Math.abs(e.clientX - dragStartX) > 4 || Math.abs(e.clientY - dragStartY) > 4) wasDragging = true
    if (!wasDragging) return
    dockContainer.style.transition = 'none'
    const cx = e.clientX
    const cy = e.clientY
    const W = window.innerWidth
    const H = window.innerHeight
    const centerX = W / 2
    const centerY = H / 2
    const deg = Math.atan2(cy - centerY, cx - centerX)
    const MARGIN = 70
    const TL = Math.atan2(-centerY + MARGIN, -centerX)
    const TR = Math.atan2(-centerY + MARGIN, W - centerX)
    const BL = Math.atan2(H - MARGIN - centerY, -centerX)
    const BR = Math.atan2(H - MARGIN - centerY, W - centerX)
    store.position = deg >= TL && deg <= TR ? 'top' : deg >= TR && deg <= BR ? 'right' : deg >= BR && deg <= BL ? 'bottom' : 'left'
    const pct = store.position === 'left' || store.position === 'right'
      ? Math.max(10, Math.min(90, (cy / H) * 100))
      : Math.max(10, Math.min(90, (cx / W) * 100))
    store.anchorOffset = Math.abs(pct - 50) < 2 ? 50 : pct
    positionAnchor()
    if (store.open) positionPanel()
    save()
  }
  anchor.onpointerup = (e: PointerEvent) => {
    const wasClick = isDragging && !wasDragging
    isDragging = false
    anchor.releasePointerCapture(e.pointerId)
    dockContainer.style.transition = 'all 500ms cubic-bezier(0.34,1.56,0.64,1)'
    if (wasClick && dragStartTarget) {
      let el = dragStartTarget as HTMLElement | null
      while (el && el !== anchor) {
        if ((el as any)._dockClickHandler) { (el as any)._dockClickHandler(); break }
        el = el.parentElement
      }
    }
    dragStartTarget = null
  }

  // ===== Keyboard =====
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.altKey && e.key === 'd') {
      if (store.open) closePanel()
      else handleDockClick(DOCKS.find(d => d.id === (store.selectedDock || DOCKS[0].id)))
      e.preventDefault()
    }
  })

  window.addEventListener('resize', () => { positionAnchor(); if (store.open) positionPanel() })

  // ===== Init =====
  positionAnchor()
  updateDockButtons()
  if (CLIENT_AUTH_ENABLED && !isRpcTrusted) {
    setDockButtonsVisible(false)
  }
  if (store.open && store.selectedDock) {
    const initDock = DOCKS.find(d => d.id === store.selectedDock)
    if (initDock && (isRpcTrusted || !CLIENT_AUTH_ENABLED)) openPanel(initDock)
  }
  resetInactiveTimer()
}

init()
