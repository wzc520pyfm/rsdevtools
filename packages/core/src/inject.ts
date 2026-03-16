import type { DevToolsDockUserEntry } from '@rspack-devtools/kit'

interface SerializedDock {
  id: string
  title: string
  icon: string
  type: string
  url?: string
  category?: string
  launcher?: { title: string; description?: string; buttonStart?: string; buttonLoading?: string; status?: string }
  action?: { importFrom: string; importName?: string }
  renderer?: { importFrom: string; importName?: string }
}

function serializeDocks(docks: DevToolsDockUserEntry[]): SerializedDock[] {
  return docks.map((dock) => {
    const icon = typeof dock.icon === 'string' ? dock.icon : dock.icon.light
    const base: SerializedDock = {
      id: dock.id,
      title: dock.title,
      icon,
      type: dock.type,
      category: dock.category,
    }
    if (dock.type === 'iframe') base.url = dock.url
    if (dock.type === 'launcher') {
      base.launcher = {
        title: dock.launcher.title,
        description: dock.launcher.description,
        buttonStart: dock.launcher.buttonStart ?? 'Launch',
        buttonLoading: dock.launcher.buttonLoading ?? 'Loading...',
        status: dock.launcher.status,
      }
    }
    if (dock.type === 'action') base.action = { importFrom: dock.action.importFrom, importName: dock.action.importName }
    if (dock.type === 'custom-render') base.renderer = { importFrom: dock.renderer.importFrom, importName: dock.renderer.importName }
    return base
  })
}

export function getInjectClientScript(
  port: number,
  host: string = 'localhost',
  dockEntries: DevToolsDockUserEntry[] = [],
  clientAuth: boolean = true,
): string {
  const devtoolsUrl = `http://${host}:${port}`
  const serializedDocks = JSON.stringify(serializeDocks(dockEntries))

  return `(function() {
  if (typeof window === 'undefined') return;
  if (window.__RSPACK_DEVTOOLS_INJECTED__) return;
  if (window.parent !== window) return;
  window.__RSPACK_DEVTOOLS_INJECTED__ = true;

  var DEVTOOLS_URL = '${devtoolsUrl}';
  var WS_PORT = ${port};
  var STORAGE_KEY = 'rspack-devtools-dock-state';
  var CLIENT_AUTH_ENABLED = ${clientAuth ? 'true' : 'false'};
  var REGISTERED_DOCKS = ${serializedDocks};

  // ===== Auth ID =====
  var AUTH_KEY = 'rspack-devtools-auth-id';
  var authId = '';
  try { authId = localStorage.getItem(AUTH_KEY) || ''; } catch(e) {}
  if (!authId) {
    authId = 'RDT' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36);
    try { localStorage.setItem(AUTH_KEY, authId); } catch(e) {}
  }
  var isRpcTrusted = !CLIENT_AUTH_ENABLED;

  // ===== Build dock entries =====
  var DOCKS = REGISTERED_DOCKS.map(function(d) {
    var entry = { id: d.id, title: d.title, icon: d.icon, type: d.type, category: d.category || 'default' };
    if (d.type === 'iframe') entry.url = d.url ? (d.url.indexOf('://') > -1 ? d.url : DEVTOOLS_URL + d.url) : DEVTOOLS_URL;
    if (d.type === 'launcher') entry.launcher = d.launcher;
    if (d.type === 'action') entry.action = d.action;
    if (d.type === 'custom-render') entry.renderer = d.renderer;
    return entry;
  });

  if (DOCKS.length === 0) {
    DOCKS = [{ id: 'rspack-build', title: 'Build Analysis', icon: 'ph:lightning-duotone', type: 'iframe', url: DEVTOOLS_URL, category: '~rspackplus' }];
  }

  // Append builtin entries (aligned with vite-devtools core builtins)
  var BUILTIN_DOCKS = [
    { id: '~terminals', title: 'Terminals', icon: 'ph:terminal-duotone', type: '~builtin', url: DEVTOOLS_URL + '/dock/terminals', category: '~builtin' },
    { id: '~logs', title: 'Logs & Notifications', icon: 'ph:notification-duotone', type: '~builtin', url: DEVTOOLS_URL + '/dock/logs', category: '~builtin' },
    { id: '~settings', title: 'Settings', icon: 'ph:gear-duotone', type: '~builtin', url: DEVTOOLS_URL + '/dock/settings', category: '~builtin' },
    { id: '~popup', title: 'Popup', icon: 'ph:arrow-square-out-duotone', type: '~popup', category: '~builtin' },
  ];
  DOCKS = DOCKS.concat(BUILTIN_DOCKS);

  var defaults = {
    position: 'left', width: 60, height: 55, left: 50, top: 50,
    open: false, selectedDock: null, anchorOffset: 50,
    inactiveTimeout: 4000,
  };
  var store;
  try { store = Object.assign({}, defaults, JSON.parse(localStorage.getItem(STORAGE_KEY))); }
  catch(e) { store = Object.assign({}, defaults); }
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch(e) {} }

  // ===== Iconify SVG icons =====
  var builtinIcons = {
    'ph:lightning-duotone': function(s) { return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/></svg>'; },
    'ph:folder-open-duotone': function(s) { return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none"><path d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" fill="currentColor" opacity="0.85"/></svg>'; },
    'ph:terminal-duotone': function(s) { return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="2" fill="currentColor" opacity="0.15"/><path d="M6 16l4-4-4-4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 16h6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>'; },
    'ph:notification-duotone': function(s) { return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'; },
    'ph:gear-duotone': function(s) { return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3"/><path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" stroke="currentColor" stroke-width="1.5"/></svg>'; },
    'ph:arrow-square-out-duotone': function(s) { return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>'; },
    'ph:stethoscope-duotone': function(s) { return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none"><circle cx="17" cy="14" r="3" fill="currentColor" opacity="0.3"/><path d="M4.8 2.3A.3.3 0 005 2h2a.3.3 0 01.3.3V7a4 4 0 01-8 0V2.3A.3.3 0 014.8 2M14 11V9a2 2 0 00-2-2H8a2 2 0 00-2 2v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="17" cy="14" r="3" stroke="currentColor" stroke-width="1.5"/></svg>'; },
    'ph:chart-bar-duotone': function(s) { return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none"><rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor" opacity="0.6"/><rect x="10" y="7" width="4" height="14" rx="1" fill="currentColor" opacity="0.8"/><rect x="17" y="3" width="4" height="18" rx="1" fill="currentColor"/></svg>'; },
    'ph:puzzle-piece-duotone': function(s) { return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none"><path d="M20 8h-3V5a2 2 0 00-2-2H9a2 2 0 00-2 2v3H4a2 2 0 00-2 2v6a2 2 0 002 2h3v3a2 2 0 002 2h6a2 2 0 002-2v-3h3a2 2 0 002-2v-6a2 2 0 00-2-2z" fill="currentColor" opacity="0.7"/></svg>'; },
    'ph:cursor-duotone': function(s) { return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none"><path d="M5 3l14 7-6 2-2 6z" fill="currentColor" opacity="0.7"/></svg>'; },
    'ph:code-duotone': function(s) { return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none"><path d="M8 6l-6 6 6 6M16 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'; },
    'ph:house-duotone': function(s) { return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none"><path d="M3 12l9-8 9 8v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8z" fill="currentColor" opacity="0.7"/></svg>'; },
    'ph:rocket-launch-duotone': function(s) { return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" fill="currentColor" opacity="0.3"/><path d="M12 13l-3-3" stroke="currentColor" stroke-width="1.5"/><path d="M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>'; },
  };

  function renderIcon(iconName, size) {
    size = size || 20;
    if (builtinIcons[iconName]) return builtinIcons[iconName](size);
    return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" opacity="0.5"/></svg>';
  }

  function makeSVG(type) {
    if (type === 'popout') return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
    if (type === 'close') return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    if (type === 'rspack-logo') return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="rgl" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#60a5fa"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#rgl)"/></svg>';
    if (type === 'bracket-left') return '<svg width="100%" height="100%" viewBox="0 0 9 20" fill="none"><path d="M4.96 0C1.03 5.63 1 14.35 4.96 20H7.61C3.66 14.35 3.68 5.63 7.61 0H4.96Z" fill="currentColor"/></svg>';
    if (type === 'bracket-right') return '<svg width="100%" height="100%" viewBox="0 0 9 20" fill="none"><path d="M4.25 10H6.9C6.9 6.41 5.91 2.82 3.95 0H1.29C3.26 2.82 4.24 6.41 4.25 10ZM8.94 14.91H6.27C6.47 14.17 6.62 13.41 6.72 12.66H4.07C3.96 13.41 3.81 14.17 3.61 14.91H0.94C0.7 15.82 0.39 16.71 0 17.57H2.67C2.29 18.42 1.82 19.23 1.29 20H3.95C4.48 19.23 4.94 18.42 5.33 17.57H7.99C8.38 16.71 8.69 15.82 8.94 14.91Z" fill="currentColor"/></svg>';
    return '';
  }

  // ===== Root =====
  var root = document.createElement('div');
  root.id = 'rspack-devtools-root';
  root.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;inset:0;font-family:system-ui,-apple-system,sans-serif;font-size:15px;';

  var glow = document.createElement('div');
  glow.id = 'rspack-devtools-glowing';
  glow.style.cssText = 'position:absolute;left:0;top:0;width:160px;height:160px;opacity:0;transition:all 1000ms ease-out;pointer-events:none;z-index:-1;border-radius:50%;filter:blur(60px);background-image:linear-gradient(45deg,#61d9ff,#7a23a1,#715ebd);transform:translate(-50%,-50%);';

  var anchor = document.createElement('div');
  anchor.id = 'rspack-devtools-anchor';
  anchor.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:auto;user-select:none;width:0;transform-origin:center;transform:translate(-50%,-50%);';

  var dockContainer = document.createElement('div');
  dockContainer.id = 'rspack-devtools-dock-container';
  dockContainer.style.cssText = 'position:absolute;left:0;top:0;height:40px;min-width:100px;width:max-content;display:flex;transform:translate(-50%,-50%);transition:all 500ms cubic-bezier(0.34,1.56,0.64,1);';

  var dockBar = document.createElement('div');
  dockBar.id = 'rspack-devtools-dock';
  dockBar.style.cssText = 'height:40px;border-radius:9999px;user-select:none;touch-action:none;margin:auto;background:rgba(17,17,17,0.5);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);box-shadow:0 1px 3px 0 rgba(0,0,0,0.1),0 1px 2px -1px rgba(0,0,0,0.1);transition:all 500ms cubic-bezier(0.34,1.56,0.64,1);display:flex;align-items:center;position:relative;width:calc-size(max-content,size);';

  var bracketL = document.createElement('span');
  bracketL.style.cssText = 'position:absolute;left:-4px;top:50%;transform:translateY(-50%);width:10px;color:white;opacity:0.75;transition:opacity 300ms,width 500ms;display:flex;align-items:center;';
  bracketL.innerHTML = makeSVG('bracket-left');

  var bracketR = document.createElement('span');
  bracketR.style.cssText = 'position:absolute;right:-4px;top:50%;transform:translateY(-50%);width:10px;color:white;opacity:0.75;transition:opacity 300ms,width 500ms;display:flex;align-items:center;';
  bracketR.innerHTML = makeSVG('bracket-right');

  var miniLogo = document.createElement('div');
  miniLogo.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:12px;height:12px;opacity:0;transition:opacity 300ms;pointer-events:none;display:flex;align-items:center;justify-content:center;';
  miniLogo.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="rgl2" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#60a5fa"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#rgl2)"/></svg>';

  var dockEntriesEl = document.createElement('div');
  dockEntriesEl.style.cssText = 'display:flex;align-items:center;width:100%;height:100%;justify-content:center;padding:0 12px;gap:0;transition:opacity 300ms;overflow:hidden;';

  // ===== Split docks into visible & overflow (capacity-based, like vite-devtools) =====
  var DOCK_CAPACITY = 5;
  var visibleDocks = DOCKS.slice(0, DOCK_CAPACITY);
  var overflowDocks = DOCKS.slice(DOCK_CAPACITY);

  // ===== Create dock buttons =====
  var dockButtons = [];
  function createDockButton(dock) {
    var btn = document.createElement('button');
    btn.title = dock.title;
    btn.dataset.dockId = dock.id;
    btn.style.cssText = 'display:flex;align-items:center;justify-content:center;width:32px;height:32px;border:none;background:transparent;color:rgba(255,255,255,0.5);cursor:pointer;border-radius:12px;transition:all 300ms cubic-bezier(0.34,1.56,0.64,1);padding:0;position:relative;';
    btn.innerHTML = renderIcon(dock.icon);
    btn.onmouseenter = function() {
      if (store.selectedDock !== dock.id || !store.open) {
        btn.style.color = 'rgba(255,255,255,0.85)';
        btn.style.background = 'rgba(136,136,136,0.07)';
        btn.style.transform = 'scale(1.1)';
      }
      showTooltip(btn, dock.title);
    };
    btn.onmouseleave = function() {
      if (store.selectedDock !== dock.id || !store.open) {
        btn.style.color = 'rgba(255,255,255,0.5)';
        btn.style.background = 'transparent';
        btn.style.transform = 'scale(1)';
      }
      hideTooltip();
    };
    btn.onpointerdown = function(e) { e.stopPropagation(); };
    btn.onclick = function(e) { e.stopPropagation(); handleDockClick(dock); };
    dockButtons.push({ el: btn, dock: dock });
    return btn;
  }

  // ===== Unauthorized badge (shown when client auth is enabled and not yet trusted) =====
  var authBadge = null;
  var dockButtonElements = [];
  var overflowSeparator = null;

  if (CLIENT_AUTH_ENABLED) {
    authBadge = document.createElement('button');
    authBadge.id = 'rspack-devtools-auth-badge';
    authBadge.textContent = 'Unauthorized';
    authBadge.style.cssText = 'display:flex;align-items:center;height:24px;border:none;background:rgba(239,68,68,0.15);color:#ef4444;cursor:pointer;border-radius:6px;padding:0 8px;font-size:11px;font-weight:600;margin-right:4px;transition:all 200ms;white-space:nowrap;';
    authBadge.onmouseenter = function() { authBadge.style.background = 'rgba(239,68,68,0.25)'; showTooltip(authBadge, 'Click to authorize'); };
    authBadge.onmouseleave = function() { authBadge.style.background = 'rgba(239,68,68,0.15)'; hideTooltip(); };
    authBadge.onpointerdown = function(e) { e.stopPropagation(); };
    authBadge.onclick = function(e) {
      e.stopPropagation();
      openPanel({ id: '~auth-notice', title: 'Unauthorized', icon: '', type: '~builtin' });
      showPanelContent('auth-notice');
    };
    if (!isRpcTrusted) {
      dockEntriesEl.appendChild(authBadge);
    }
  }

  function setDockButtonsVisible(visible) {
    var display = visible ? 'flex' : 'none';
    dockButtonElements.forEach(function(el) { el.style.display = display; });
    if (overflowSeparator) overflowSeparator.style.display = display;
    if (overflowBtnEl) overflowBtnEl.style.display = display;
  }

  function updateAuthUI() {
    if (!authBadge) return;
    if (isRpcTrusted) {
      if (authBadge.parentNode) authBadge.parentNode.removeChild(authBadge);
      setDockButtonsVisible(true);
      if (store.open && store.selectedDock === '~auth-notice') closePanel();
    } else {
      if (!authBadge.parentNode) dockEntriesEl.insertBefore(authBadge, dockEntriesEl.firstChild);
      setDockButtonsVisible(false);
    }
  }

  visibleDocks.forEach(function(dock) {
    var btn = createDockButton(dock);
    dockButtonElements.push(btn);
    dockEntriesEl.appendChild(btn);
  });

  // ===== Overflow button & popup =====
  var overflowPopup = null;
  var overflowBtnEl = null;

  if (overflowDocks.length > 0) {
    var sep = document.createElement('div');
    sep.style.cssText = 'width:1px;height:20px;background:rgba(255,255,255,0.1);margin:0 4px;flex-shrink:0;';
    overflowSeparator = sep;
    dockEntriesEl.appendChild(sep);

    overflowBtnEl = document.createElement('button');
    overflowBtnEl.title = 'More (' + overflowDocks.length + ')';
    overflowBtnEl.style.cssText = 'display:flex;align-items:center;justify-content:center;width:32px;height:32px;border:none;background:transparent;color:rgba(255,255,255,0.45);cursor:pointer;border-radius:12px;transition:all 300ms cubic-bezier(0.34,1.56,0.64,1);padding:0;position:relative;';
    overflowBtnEl.innerHTML = '<svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor"><path d="M128 24a104 104 0 10104 104A104.11 104.11 0 00128 24zm0 192a88 88 0 1188-88 88.1 88.1 0 01-88 88zm12-88a12 12 0 11-12-12 12 12 0 0112 12zm-44 0a12 12 0 11-12-12 12 12 0 0112 12zm88 0a12 12 0 11-12-12 12 12 0 0112 12z" opacity="0.85"/></svg>';

    var badge = document.createElement('span');
    var badgeText = overflowDocks.length > 9 ? '9+' : '' + overflowDocks.length;
    badge.textContent = badgeText;
    badge.style.cssText = 'position:absolute;min-width:12px;height:12px;border-radius:6px;background:#a78bfa;color:white;font-size:8px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 2px;line-height:1;';
    overflowBtnEl.appendChild(badge);

    function updateBadgePosition() {
      if (isVertical()) {
        badge.style.top = '-2px'; badge.style.left = '-3px';
        badge.style.right = 'auto'; badge.style.bottom = 'auto';
        badge.style.transform = 'rotate(-90deg)';
      } else {
        badge.style.top = '-2px'; badge.style.right = '-3px';
        badge.style.left = 'auto'; badge.style.bottom = 'auto';
        badge.style.transform = 'none';
      }
    }

    overflowBtnEl.onmouseenter = function() {
      overflowBtnEl.style.color = 'rgba(255,255,255,0.85)';
      overflowBtnEl.style.background = 'rgba(136,136,136,0.07)';
      overflowBtnEl.style.transform = 'scale(1.1)';
    };
    overflowBtnEl.onmouseleave = function() {
      overflowBtnEl.style.color = 'rgba(255,255,255,0.45)';
      overflowBtnEl.style.background = 'transparent';
      overflowBtnEl.style.transform = 'scale(1)';
    };
    overflowBtnEl.onpointerdown = function(e) { e.stopPropagation(); };
    overflowBtnEl.onclick = function(e) { e.stopPropagation(); toggleOverflowPopup(); };
    dockEntriesEl.appendChild(overflowBtnEl);

    overflowPopup = document.createElement('div');
    overflowPopup.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:auto;display:none;padding:4px;border-radius:10px;background:rgba(17,17,17,0.92);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);border:1px solid rgba(255,255,255,0.08);box-shadow:0 4px 16px rgba(0,0,0,0.45);max-width:220px;';

    var overflowGrid = document.createElement('div');
    overflowGrid.style.cssText = 'display:flex;flex-wrap:wrap;gap:0;justify-content:center;';
    overflowDocks.forEach(function(dock) {
      overflowGrid.appendChild(createDockButton(dock));
    });
    overflowPopup.appendChild(overflowGrid);
    root.appendChild(overflowPopup);

    document.addEventListener('pointerdown', function(e) {
      if (overflowPopup.style.display !== 'none' && !overflowPopup.contains(e.target) && e.target !== overflowBtnEl && !overflowBtnEl.contains(e.target)) {
        overflowPopup.style.display = 'none';
      }
    });
  }

  function toggleOverflowPopup() {
    if (!overflowPopup) return;
    if (overflowPopup.style.display !== 'none') {
      overflowPopup.style.display = 'none';
      return;
    }
    overflowPopup.style.display = 'block';
    var rect = overflowBtnEl.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var p = store.position;
    overflowPopup.style.left = 'auto'; overflowPopup.style.right = 'auto';
    overflowPopup.style.top = 'auto'; overflowPopup.style.bottom = 'auto';
    if (p === 'left') {
      overflowPopup.style.left = (rect.right + 6) + 'px';
      overflowPopup.style.top = (cy - 20) + 'px';
    } else if (p === 'right') {
      overflowPopup.style.right = (window.innerWidth - rect.left + 6) + 'px';
      overflowPopup.style.top = (cy - 20) + 'px';
    } else if (p === 'top') {
      overflowPopup.style.left = (cx - 20) + 'px';
      overflowPopup.style.top = (rect.bottom + 6) + 'px';
    } else {
      overflowPopup.style.left = (cx - 20) + 'px';
      overflowPopup.style.bottom = (window.innerHeight - rect.top + 6) + 'px';
    }
  }

  dockBar.appendChild(bracketL);
  dockBar.appendChild(bracketR);
  dockBar.appendChild(miniLogo);
  dockBar.appendChild(dockEntriesEl);
  dockContainer.appendChild(dockBar);
  anchor.appendChild(glow);
  anchor.appendChild(dockContainer);

  // ===== Tooltip =====
  var tooltip = document.createElement('div');
  tooltip.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;padding:5px 10px;border-radius:8px;background:rgba(20,20,30,0.95);color:rgba(255,255,255,0.85);font-size:12px;font-weight:500;white-space:nowrap;opacity:0;transition:opacity 150ms;backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.08);box-shadow:0 4px 12px rgba(0,0,0,0.35);';
  root.appendChild(tooltip);

  function showTooltip(el, text) {
    tooltip.textContent = text;
    var r = el.getBoundingClientRect();
    var isVert = store.position === 'left' || store.position === 'right';
    if (isVert) {
      tooltip.style.left = (store.position === 'left' ? r.right + 8 : r.left - 8) + 'px';
      tooltip.style.top = (r.top + r.height / 2) + 'px';
      tooltip.style.transform = store.position === 'left' ? 'translateY(-50%)' : 'translate(-100%,-50%)';
    } else {
      tooltip.style.left = (r.left + r.width / 2) + 'px';
      tooltip.style.top = (store.position === 'top' ? r.bottom + 8 : r.top - 8) + 'px';
      tooltip.style.transform = store.position === 'top' ? 'translateX(-50%)' : 'translate(-50%,-100%)';
    }
    tooltip.style.opacity = '1';
  }
  function hideTooltip() { tooltip.style.opacity = '0'; }

  // ===== Panel =====
  var panel = document.createElement('div');
  panel.id = 'rspack-devtools-panel';
  panel.style.cssText = 'position:fixed;z-index:2147483646;pointer-events:auto;display:none;background:rgba(20,20,30,0.82);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(136,136,136,0.2);border-radius:8px;overflow:hidden;opacity:0;transition:opacity 200ms ease,transform 300ms cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 4px 24px rgba(0,0,0,0.3),0 0 0 1px rgba(255,255,255,0.04) inset;';

  var panelHeader = document.createElement('div');
  panelHeader.style.cssText = 'height:36px;display:flex;align-items:center;padding:0 12px;gap:8px;border-bottom:1px solid rgba(136,136,136,0.15);user-select:none;';

  var panelIcon = document.createElement('span');
  panelIcon.style.cssText = 'display:flex;align-items:center;';
  panelIcon.innerHTML = makeSVG('rspack-logo');

  var panelTitle = document.createElement('span');
  panelTitle.style.cssText = 'flex:1;font-size:12px;font-weight:600;color:rgba(255,255,255,0.5);letter-spacing:0.02em;';
  panelTitle.textContent = 'Rspack DevTools';

  function mkHeaderBtn(title, svg, onclick) {
    var b = document.createElement('button');
    b.title = title; b.innerHTML = svg;
    b.onpointerdown = function(e) { e.stopPropagation(); };
    b.onclick = onclick;
    b.style.cssText = 'background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;padding:4px;display:flex;align-items:center;border-radius:6px;transition:all 200ms;width:24px;height:24px;justify-content:center;';
    b.onmouseenter = function() { b.style.color='rgba(255,255,255,0.8)'; b.style.background='rgba(136,136,136,0.1)'; };
    b.onmouseleave = function() { b.style.color='rgba(255,255,255,0.3)'; b.style.background='none'; };
    return b;
  }

  var headerActions = document.createElement('div');
  headerActions.style.cssText = 'display:flex;gap:2px;';
  headerActions.appendChild(mkHeaderBtn('Open in new window', makeSVG('popout'), function() {
    var dock = DOCKS.find(function(d) { return d.id === store.selectedDock; });
    var url = dock && dock.url ? dock.url : DEVTOOLS_URL;
    window.open(url, 'rspack-devtools', 'width=1200,height=800');
    closePanel();
  }));
  headerActions.appendChild(mkHeaderBtn('Close panel', makeSVG('close'), function() { closePanel(); }));

  panelHeader.appendChild(panelIcon);
  panelHeader.appendChild(panelTitle);
  panelHeader.appendChild(headerActions);

  // Panel content: iframe (for iframe/builtin), launcher div, custom-render div
  var panelIframe = document.createElement('iframe');
  panelIframe.style.cssText = 'width:100%;border:none;border:1px solid rgba(136,136,136,0.2);border-radius:8px;display:block;';

  var panelLauncher = document.createElement('div');
  panelLauncher.style.cssText = 'width:100%;display:none;padding:40px;text-align:center;color:rgba(255,255,255,0.8);';

  var panelCustom = document.createElement('div');
  panelCustom.style.cssText = 'width:100%;display:none;overflow:auto;';

  var panelAuthNotice = document.createElement('div');
  panelAuthNotice.style.cssText = 'width:100%;display:none;padding:60px 40px;text-align:center;color:rgba(255,255,255,0.8);overflow:auto;';
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
  ].join('');

  panel.appendChild(panelHeader);
  panel.appendChild(panelIframe);
  panel.appendChild(panelLauncher);
  panel.appendChild(panelCustom);
  panel.appendChild(panelAuthNotice);

  // ===== Toast overlay =====
  var toastContainer = document.createElement('div');
  toastContainer.id = 'rspack-devtools-toasts';
  toastContainer.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:2147483647;pointer-events:auto;width:320px;display:flex;flex-direction:column;gap:8px;';

  function addToast(entry) {
    var toast = document.createElement('div');
    toast.style.cssText = 'padding:10px 14px;border-radius:10px;background:rgba(20,20,30,0.95);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);box-shadow:0 4px 16px rgba(0,0,0,0.4);color:rgba(255,255,255,0.85);font-size:13px;cursor:pointer;transition:all 300ms;opacity:0;transform:translateX(20px);display:flex;align-items:flex-start;gap:8px;';
    var levelColors = { error: '#ef4444', warn: '#eab308', success: '#22c55e', info: '#3b82f6', debug: '#9ca3af' };
    var bar = document.createElement('div');
    bar.style.cssText = 'width:3px;min-height:20px;border-radius:2px;flex-shrink:0;align-self:stretch;background:' + (levelColors[entry.level] || '#3b82f6') + ';';
    var body = document.createElement('div');
    body.style.cssText = 'flex:1;min-width:0;';
    var msg = document.createElement('div');
    msg.style.cssText = 'font-weight:500;font-size:12px;';
    msg.textContent = entry.message;
    body.appendChild(msg);
    if (entry.description) {
      var desc = document.createElement('div');
      desc.style.cssText = 'font-size:11px;color:rgba(255,255,255,0.5);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
      desc.textContent = entry.description;
      body.appendChild(desc);
    }
    toast.appendChild(bar);
    toast.appendChild(body);
    toast.onclick = function() {
      handleDockClick(DOCKS.find(function(d) { return d.id === '~logs'; }));
      dismissToast(toast);
    };
    toastContainer.appendChild(toast);
    requestAnimationFrame(function() { toast.style.opacity = '1'; toast.style.transform = 'none'; });
    var timeout = entry.autoDismiss || 5000;
    setTimeout(function() { dismissToast(toast); }, timeout);
  }

  function dismissToast(toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(function() { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
  }

  root.appendChild(anchor);
  root.appendChild(panel);
  root.appendChild(toastContainer);
  document.body.appendChild(root);

  // ===== WebSocket for log notifications + auth =====
  var wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';

  var rpcReqCounter = 0;
  function nextRpcId() { return 'rdt-' + (++rpcReqCounter) + '-' + Date.now(); }

  function requestAuth(ws) {
    if (!CLIENT_AUTH_ENABLED || isRpcTrusted) return;
    var rid = nextRpcId();
    try {
      var ua = navigator.userAgent || 'Unknown';
      ws.send(JSON.stringify({ m: 'rspack:anonymous:auth', a: [{ authId: authId, ua: ua, origin: location.origin }], t: 'q', i: rid }));
      var handler = function(e) {
        try {
          var msg = JSON.parse(e.data);
          if (msg.t === 's' && msg.i === rid) {
            ws.removeEventListener('message', handler);
            if (msg.r && msg.r.isTrusted) {
              isRpcTrusted = true;
              updateAuthUI();
            }
          }
        } catch(ex) {}
      };
      ws.addEventListener('message', handler);
    } catch(ex) {}
  }

  function connectWs() {
    try {
      var wsUrl = wsProtocol + '//' + '${host}' + ':' + WS_PORT;
      if (CLIENT_AUTH_ENABLED) wsUrl += '?rspack_devtools_auth_id=' + encodeURIComponent(authId);
      var ws = new WebSocket(wsUrl);
      ws.onopen = function() { requestAuth(ws); };
      ws.onmessage = function(e) {
        try {
          var msg = JSON.parse(e.data);
          if (msg.t === 'q' && msg.m === 'devtoolskit:internal:logs:updated' && isRpcTrusted) {
            fetchNewLogs(ws);
          }
        } catch(ex) {}
      };
      ws.onclose = function() { setTimeout(connectWs, 5000); };
      ws.onerror = function() {};
    } catch(ex) {}
  }

  var lastLogVersion;
  function fetchNewLogs(ws) {
    var rid = nextRpcId();
    try {
      ws.send(JSON.stringify({ m: 'devtoolskit:internal:logs:list', a: [lastLogVersion], t: 'q', i: rid }));
      var handler = function(e) {
        try {
          var msg = JSON.parse(e.data);
          if (msg.t === 's' && msg.i === rid && msg.r) {
            ws.removeEventListener('message', handler);
            lastLogVersion = msg.r.version;
            if (msg.r.entries) {
              msg.r.entries.forEach(function(entry) {
                if (entry.notify) addToast(entry);
              });
            }
          }
        } catch(ex) {}
      };
      ws.addEventListener('message', handler);
    } catch(ex) {}
  }

  connectWs();

  // ===== Panel content switching =====
  function showPanelContent(type) {
    panelIframe.style.display = (type === 'iframe' || type === '~builtin') ? 'block' : 'none';
    panelLauncher.style.display = type === 'launcher' ? 'block' : 'none';
    panelCustom.style.display = type === 'custom-render' ? 'block' : 'none';
    panelAuthNotice.style.display = type === 'auth-notice' ? 'block' : 'none';
  }

  function renderLauncher(dock) {
    var l = dock.launcher;
    panelLauncher.innerHTML = '';
    var icon = document.createElement('div');
    icon.style.cssText = 'margin-bottom:16px;';
    icon.innerHTML = renderIcon(dock.icon, 48);
    icon.firstChild.style.color = 'rgba(255,255,255,0.5)';
    var title = document.createElement('h3');
    title.style.cssText = 'font-size:18px;font-weight:600;color:rgba(255,255,255,0.9);margin:0 0 8px;';
    title.textContent = l.title;
    var desc = document.createElement('p');
    desc.style.cssText = 'font-size:13px;color:rgba(255,255,255,0.5);margin:0 0 24px;';
    desc.textContent = l.description || '';
    var btn = document.createElement('button');
    btn.style.cssText = 'padding:8px 24px;border-radius:8px;border:none;background:#a78bfa;color:white;font-size:14px;font-weight:500;cursor:pointer;transition:all 200ms;';
    btn.textContent = l.buttonStart || 'Launch';
    var status = l.status || 'idle';
    if (status === 'loading') { btn.textContent = l.buttonLoading || 'Loading...'; btn.disabled = true; btn.style.opacity = '0.6'; }
    if (status === 'success') { btn.textContent = 'Done'; btn.disabled = true; btn.style.background = '#22c55e'; }
    if (status === 'error') { btn.textContent = 'Error'; btn.disabled = true; btn.style.background = '#ef4444'; }
    btn.onclick = function() {
      btn.textContent = l.buttonLoading || 'Loading...';
      btn.disabled = true;
      btn.style.opacity = '0.6';
      fetch(DEVTOOLS_URL + '/.devtools/api/launch/' + encodeURIComponent(dock.id), { method: 'POST' })
        .then(function() { btn.textContent = 'Done'; btn.style.background = '#22c55e'; })
        .catch(function() { btn.textContent = 'Error'; btn.style.background = '#ef4444'; });
    };
    panelLauncher.appendChild(icon);
    panelLauncher.appendChild(title);
    panelLauncher.appendChild(desc);
    panelLauncher.appendChild(btn);
  }

  // ===== Dock click handler =====
  function handleDockClick(dock) {
    if (!dock) return;

    // When not trusted, intercept all dock clicks and show auth notice
    if (CLIENT_AUTH_ENABLED && !isRpcTrusted && dock.id !== '~auth-notice') {
      openPanel({ id: '~auth-notice', title: 'Unauthorized', icon: '', type: '~builtin' });
      showPanelContent('auth-notice');
      return;
    }

    if (dock.type === '~popup') {
      window.open(DEVTOOLS_URL, 'rspack-devtools', 'width=1200,height=800');
      return;
    }

    if (dock.type === 'action') {
      loadClientScript(dock.action, dock);
      return;
    }

    if (store.open && store.selectedDock === dock.id) {
      closePanel();
      return;
    }

    store.selectedDock = dock.id;
    openPanel(dock);
  }

  function appendAuthParam(url) {
    if (!CLIENT_AUTH_ENABLED || !authId) return url;
    var sep = url.indexOf('?') > -1 ? '&' : '?';
    return url + sep + 'rspack_devtools_auth_id=' + encodeURIComponent(authId);
  }

  function openPanel(dock) {
    store.open = true;
    store.selectedDock = dock.id;
    save();
    positionPanel();
    panel.style.display = 'block';
    requestAnimationFrame(function() { panel.style.opacity = '1'; panel.style.transform = 'none'; });
    panelTitle.textContent = dock.title;

    if (dock.id === '~auth-notice') {
      showPanelContent('auth-notice');
    } else if (dock.type === 'launcher') {
      showPanelContent('launcher');
      renderLauncher(dock);
    } else if (dock.type === 'custom-render') {
      showPanelContent('custom-render');
      loadClientScript(dock.renderer, dock);
    } else {
      showPanelContent('iframe');
      var url = dock.url || DEVTOOLS_URL;
      url = appendAuthParam(url);
      if (panelIframe.src !== url) panelIframe.src = url;
    }

    updateDockButtons();
    if (inactiveTimer) clearTimeout(inactiveTimer);
  }

  function closePanel() {
    store.open = false;
    save();
    panel.style.opacity = '0';
    setTimeout(function() { if (!store.open) panel.style.display = 'none'; }, 200);
    updateDockButtons();
    resetInactiveTimer();
  }

  // ===== Client script execution (for action & custom-render entries) =====
  var loadedScripts = {};
  function loadClientScript(scriptDef, dock) {
    if (!scriptDef || !scriptDef.importFrom) return;
    var key = dock.type + ':' + dock.id;
    if (loadedScripts[key] && dock.type !== 'action') return;

    import(DEVTOOLS_URL + '/.devtools/client-imports.js').then(function(mod) {
      if (!mod.importsMap || !mod.importsMap[key]) return;
      return mod.importsMap[key]();
    }).then(function(setupFn) {
      if (!setupFn) return;
      loadedScripts[key] = true;
      var events = {};
      var eventHandlers = {};
      var ctx = {
        current: {
          rpc: { call: function(method) { /* simplified RPC */ } },
          events: {
            on: function(evt, fn) { if (!eventHandlers[evt]) eventHandlers[evt] = []; eventHandlers[evt].push(fn); },
            off: function(evt, fn) { if (eventHandlers[evt]) eventHandlers[evt] = eventHandlers[evt].filter(function(f) { return f !== fn; }); },
            emit: function(evt) { var args = Array.prototype.slice.call(arguments, 1); (eventHandlers[evt] || []).forEach(function(fn) { fn.apply(null, args); }); },
          },
        },
      };
      setupFn(ctx);
      ctx.current.events.emit('entry:activated');
    }).catch(function(err) { console.warn('[DevTools] Failed to load client script for ' + key, err); });
  }

  // ===== Minimization =====
  var isMinimized = false;
  var inactiveTimer = null;
  var isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  function minimize() {
    if (store.open || isMinimized || isTouchDevice) return;
    isMinimized = true;
    dockBar.style.width = '22px'; dockBar.style.height = '22px'; dockBar.style.padding = '0';
    dockEntriesEl.style.opacity = '0'; dockEntriesEl.style.pointerEvents = 'none';
    miniLogo.style.opacity = '1';
    bracketL.style.width = '6px'; bracketL.style.opacity = '0.5';
    bracketR.style.width = '6px'; bracketR.style.opacity = '0.5';
    if (overflowPopup) overflowPopup.style.display = 'none';
  }
  function expand() {
    if (!isMinimized) return;
    isMinimized = false;
    dockBar.style.width = 'calc-size(max-content,size)'; dockBar.style.height = '40px'; dockBar.style.padding = '';
    dockEntriesEl.style.opacity = '1'; dockEntriesEl.style.pointerEvents = 'auto';
    miniLogo.style.opacity = '0';
    bracketL.style.width = '10px'; bracketL.style.opacity = '0.75';
    bracketR.style.width = '10px'; bracketR.style.opacity = '0.75';
    resetInactiveTimer();
  }
  function resetInactiveTimer() {
    if (inactiveTimer) clearTimeout(inactiveTimer);
    if (store.inactiveTimeout > 0 && !store.open) inactiveTimer = setTimeout(minimize, store.inactiveTimeout);
  }

  anchor.onmouseenter = function() { glow.style.opacity = '0.6'; expand(); };
  anchor.onmouseleave = function() { glow.style.opacity = '0'; resetInactiveTimer(); };
  anchor.onmousemove = function() { if (!isMinimized) resetInactiveTimer(); };

  function isVertical() { return store.position === 'left' || store.position === 'right'; }

  function positionAnchor() {
    var p = store.position, m = 2;
    anchor.style.left = 'auto'; anchor.style.right = 'auto'; anchor.style.top = 'auto'; anchor.style.bottom = 'auto';
    dockContainer.style.transform = isVertical() ? 'translate(-50%,-50%) rotate(90deg)' : 'translate(-50%,-50%)';
    var halfH = 20, off = store.anchorOffset;
    if (p === 'left') { anchor.style.left = (m + halfH) + 'px'; anchor.style.top = off + '%'; }
    else if (p === 'right') { anchor.style.left = (window.innerWidth - m - halfH) + 'px'; anchor.style.top = off + '%'; }
    else if (p === 'top') { anchor.style.left = off + '%'; anchor.style.top = (m + halfH) + 'px'; }
    else { anchor.style.left = off + '%'; anchor.style.top = (window.innerHeight - m - halfH) + 'px'; }
    if (typeof updateBadgePosition === 'function') updateBadgePosition();
  }

  function positionPanel() {
    var p = store.position, w = store.width, h = store.height, m = 8;
    var dockOffset = Math.round((dockBar.offsetHeight || 40) / 2);
    panel.style.left = 'auto'; panel.style.right = 'auto'; panel.style.top = 'auto'; panel.style.bottom = 'auto';
    if (p === 'left') {
      panel.style.left = dockOffset+'px'; panel.style.top = m+'px';
      panel.style.width = w+'vw'; panel.style.height = 'calc(100vh - '+(m*2)+'px)';
      panelIframe.style.height = 'calc(100vh - '+(m*2+36)+'px)';
      panelLauncher.style.height = panelCustom.style.height = panelAuthNotice.style.height = panelIframe.style.height;
    } else if (p === 'right') {
      panel.style.right = dockOffset+'px'; panel.style.top = m+'px';
      panel.style.width = w+'vw'; panel.style.height = 'calc(100vh - '+(m*2)+'px)';
      panelIframe.style.height = 'calc(100vh - '+(m*2+36)+'px)';
      panelLauncher.style.height = panelCustom.style.height = panelAuthNotice.style.height = panelIframe.style.height;
    } else if (p === 'bottom') {
      panel.style.left = dockOffset+'px'; panel.style.bottom = m+'px';
      panel.style.width = 'calc(100vw - '+(dockOffset*2)+'px)'; panel.style.height = h+'vh';
      panelIframe.style.height = 'calc('+h+'vh - 36px)';
      panelLauncher.style.height = panelCustom.style.height = panelAuthNotice.style.height = panelIframe.style.height;
    } else {
      panel.style.left = dockOffset+'px'; panel.style.top = m+'px';
      panel.style.width = 'calc(100vw - '+(dockOffset*2)+'px)'; panel.style.height = h+'vh';
      panelIframe.style.height = 'calc('+h+'vh - 36px)';
      panelLauncher.style.height = panelCustom.style.height = panelAuthNotice.style.height = panelIframe.style.height;
    }
  }

  function updateDockButtons() {
    dockButtons.forEach(function(item) {
      var isSelected = store.selectedDock === item.dock.id && store.open;
      item.el.style.color = isSelected ? '#a78bfa' : 'rgba(255,255,255,0.5)';
      item.el.style.background = isSelected ? 'rgba(136,136,136,0.07)' : 'transparent';
      item.el.style.transform = isSelected ? 'scale(1.2)' : 'scale(1)';
    });
  }

  // ===== Drag =====
  var isDragging = false, wasDragging = false, dragStartX, dragStartY;
  anchor.onpointerdown = function(e) {
    if (e.button !== 0) return;
    isDragging = true; wasDragging = false;
    dragStartX = e.clientX; dragStartY = e.clientY;
    anchor.setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  anchor.onpointermove = function(e) {
    if (!isDragging) return;
    if (Math.abs(e.clientX - dragStartX) > 4 || Math.abs(e.clientY - dragStartY) > 4) wasDragging = true;
    if (!wasDragging) return;
    dockContainer.style.transition = 'none';
    var cx = e.clientX, cy = e.clientY, W = window.innerWidth, H = window.innerHeight;
    var centerX = W/2, centerY = H/2;
    var deg = Math.atan2(cy - centerY, cx - centerX);
    var MARGIN = 70;
    var TL = Math.atan2(-centerY + MARGIN, -centerX);
    var TR = Math.atan2(-centerY + MARGIN, W - centerX);
    var BL = Math.atan2(H - MARGIN - centerY, -centerX);
    var BR = Math.atan2(H - MARGIN - centerY, W - centerX);
    store.position = deg >= TL && deg <= TR ? 'top' : deg >= TR && deg <= BR ? 'right' : deg >= BR && deg <= BL ? 'bottom' : 'left';
    var pct = store.position === 'left' || store.position === 'right'
      ? Math.max(10, Math.min(90, (cy / H) * 100))
      : Math.max(10, Math.min(90, (cx / W) * 100));
    if (Math.abs(pct - 50) < 2) pct = 50;
    store.anchorOffset = pct;
    positionAnchor();
    if (store.open) positionPanel();
    save();
  };
  anchor.onpointerup = function(e) {
    isDragging = false;
    anchor.releasePointerCapture(e.pointerId);
    dockContainer.style.transition = 'all 500ms cubic-bezier(0.34,1.56,0.64,1)';
  };

  // ===== Keyboard =====
  document.addEventListener('keydown', function(e) {
    if (e.altKey && e.key === 'd') {
      if (store.open) closePanel();
      else handleDockClick(DOCKS.find(function(d) { return d.id === (store.selectedDock || DOCKS[0].id); }));
      e.preventDefault();
    }
  });

  window.addEventListener('resize', function() { positionAnchor(); if (store.open) positionPanel(); });

  // ===== Init =====
  positionAnchor();
  updateDockButtons();
  if (CLIENT_AUTH_ENABLED && !isRpcTrusted) {
    setDockButtonsVisible(false);
  }
  if (store.open && store.selectedDock) {
    var initDock = DOCKS.find(function(d) { return d.id === store.selectedDock; });
    if (initDock && (isRpcTrusted || !CLIENT_AUTH_ENABLED)) openPanel(initDock);
  }
  resetInactiveTimer();
})();`
}

export function getInjectScript(port: number, host: string = 'localhost', dockEntries: DevToolsDockUserEntry[] = [], clientAuth: boolean = true): string {
  return `<script>${getInjectClientScript(port, host, dockEntries, clientAuth)}</script>`
}
