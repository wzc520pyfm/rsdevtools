export function getInjectClientScript(port: number, host: string = 'localhost'): string {
  const devtoolsUrl = `http://${host}:${port}`
  return `(function() {
  if (typeof window === 'undefined') return;
  if (window.__RSPACK_DEVTOOLS_INJECTED__) return;
  if (window.parent !== window) return;
  window.__RSPACK_DEVTOOLS_INJECTED__ = true;

  var DEVTOOLS_URL = '${devtoolsUrl}';
  var STORAGE_KEY = 'rspack-devtools-dock-state';

  var DOCKS = [
    { id: 'build', title: 'Build Analysis', icon: 'bolt', url: DEVTOOLS_URL },
    { id: 'explorer', title: 'File Explorer', icon: 'folder', url: DEVTOOLS_URL + '/dock/explorer' },
    { id: 'terminal', title: 'Terminal', icon: 'terminal', url: DEVTOOLS_URL + '/dock/terminal' },
  ];

  var defaults = { position: 'left', width: 45, height: 60, left: 50, top: 50, open: false, selectedDock: null, anchorOffset: 50, inactiveTimeout: 3000 };
  var store;
  try { store = Object.assign({}, defaults, JSON.parse(localStorage.getItem(STORAGE_KEY))); } catch(e) { store = Object.assign({}, defaults); }
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch(e) {} }

  function makeSVG(type) {
    if (type === 'bolt') return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="rg" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stop-color="#60a5fa"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#rg)"/></svg>';
    if (type === 'folder') return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>';
    if (type === 'terminal') return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,17 10,11 4,5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>';
    if (type === 'popout') return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
    if (type === 'close') return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    if (type === 'logo') return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="rgl" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stop-color="#60a5fa"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#rgl)"/></svg>';
    return '';
  }

  var root = document.createElement('div');
  root.id = 'rspack-devtools-root';
  root.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;inset:0;font-family:system-ui,-apple-system,sans-serif;';

  // ===== Dock Bar (anchor) =====
  var anchor = document.createElement('div');
  anchor.id = 'rspack-devtools-anchor';
  anchor.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:auto;user-select:none;transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),opacity 0.4s;';

  var dockBar = document.createElement('div');
  dockBar.id = 'rspack-devtools-dock';
  dockBar.style.cssText = 'display:flex;align-items:center;gap:1px;padding:3px;border-radius:14px;background:rgba(20,20,30,0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.08);box-shadow:0 4px 24px rgba(0,0,0,0.4),0 0 0 1px rgba(255,255,255,0.03) inset;transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);';

  var glow = document.createElement('div');
  glow.style.cssText = 'position:absolute;width:100px;height:100px;border-radius:50%;background:radial-gradient(circle,rgba(96,165,250,0.15),transparent 70%);opacity:0;transition:opacity 0.5s;pointer-events:none;left:50%;top:50%;transform:translate(-50%,-50%);';
  anchor.appendChild(glow);

  // Mini logo (shown when minimized)
  var miniLogo = document.createElement('div');
  miniLogo.style.cssText = 'display:flex;align-items:center;justify-content:center;width:32px;height:32px;cursor:pointer;border-radius:10px;transition:all 0.3s;';
  miniLogo.innerHTML = makeSVG('logo');

  var dockEntries = document.createElement('div');
  dockEntries.style.cssText = 'display:flex;align-items:center;gap:1px;transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);overflow:hidden;';

  var dockButtons = [];
  DOCKS.forEach(function(dock, i) {
    var btn = document.createElement('button');
    btn.title = dock.title;
    btn.dataset.dockId = dock.id;
    btn.style.cssText = 'display:flex;align-items:center;justify-content:center;width:30px;height:30px;border:none;background:transparent;color:rgba(255,255,255,0.45);cursor:pointer;border-radius:10px;transition:all 0.2s;padding:0;position:relative;';
    btn.innerHTML = makeSVG(dock.icon);

    btn.onmouseenter = function() {
      if (store.selectedDock !== dock.id) {
        btn.style.color = 'rgba(255,255,255,0.8)';
        btn.style.background = 'rgba(255,255,255,0.06)';
      }
      showTooltip(btn, dock.title);
    };
    btn.onmouseleave = function() {
      if (store.selectedDock !== dock.id) {
        btn.style.color = 'rgba(255,255,255,0.45)';
        btn.style.background = 'transparent';
      }
      hideTooltip();
    };
    btn.onclick = function(e) {
      e.stopPropagation();
      toggleDock(dock.id);
    };

    dockButtons.push({ el: btn, dock: dock });
    dockEntries.appendChild(btn);
  });

  dockBar.appendChild(miniLogo);
  dockBar.appendChild(dockEntries);
  anchor.appendChild(dockBar);

  // ===== Tooltip =====
  var tooltip = document.createElement('div');
  tooltip.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;padding:4px 10px;border-radius:6px;background:rgba(20,20,30,0.95);color:rgba(255,255,255,0.85);font-size:11px;font-weight:500;white-space:nowrap;opacity:0;transition:opacity 0.15s;backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.08);box-shadow:0 2px 8px rgba(0,0,0,0.3);';
  root.appendChild(tooltip);

  function showTooltip(el, text) {
    tooltip.textContent = text;
    tooltip.style.pointerEvents = 'none';
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
  panel.style.cssText = 'position:fixed;z-index:2147483646;pointer-events:auto;display:none;background:#111118;border:1px solid rgba(255,255,255,0.06);overflow:hidden;transition:opacity 0.2s,transform 0.3s cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 8px 40px rgba(0,0,0,0.5);';

  var panelHeader = document.createElement('div');
  panelHeader.style.cssText = 'height:32px;background:rgba(20,20,30,0.98);display:flex;align-items:center;padding:0 10px;gap:8px;border-bottom:1px solid rgba(255,255,255,0.06);user-select:none;';

  var panelIcon = document.createElement('span');
  panelIcon.style.cssText = 'display:flex;align-items:center;';
  panelIcon.innerHTML = makeSVG('logo');

  var panelTitle = document.createElement('span');
  panelTitle.style.cssText = 'flex:1;font-size:11px;font-weight:600;color:rgba(255,255,255,0.6);';
  panelTitle.textContent = 'Rspack DevTools';

  function mkBtn(title, svg, onclick) {
    var b = document.createElement('button');
    b.title = title; b.innerHTML = svg; b.onclick = onclick;
    b.style.cssText = 'background:none;border:none;color:rgba(255,255,255,0.35);cursor:pointer;padding:3px;display:flex;align-items:center;border-radius:5px;transition:all 0.15s;width:22px;height:22px;justify-content:center;';
    b.onmouseenter = function(){ b.style.color='rgba(255,255,255,0.8)'; b.style.background='rgba(255,255,255,0.06)'; };
    b.onmouseleave = function(){ b.style.color='rgba(255,255,255,0.35)'; b.style.background='none'; };
    return b;
  }

  var acts = document.createElement('div');
  acts.style.cssText = 'display:flex;gap:2px;';
  acts.appendChild(mkBtn('Pop out', makeSVG('popout'), function(){ var d = DOCKS.find(function(d){ return d.id === store.selectedDock; }); window.open(d ? d.url : DEVTOOLS_URL, 'rspack-devtools','width=1200,height=800'); closePanel(); }));
  acts.appendChild(mkBtn('Close', makeSVG('close'), function(){ closePanel(); }));

  panelHeader.appendChild(panelIcon);
  panelHeader.appendChild(panelTitle);
  panelHeader.appendChild(acts);

  var iframe = document.createElement('iframe');
  iframe.style.cssText = 'width:100%;border:none;background:#111118;display:block;';

  var resizer = document.createElement('div');
  resizer.style.cssText = 'position:absolute;z-index:1;';

  panel.appendChild(panelHeader);
  panel.appendChild(iframe);
  panel.appendChild(resizer);
  root.appendChild(anchor);
  root.appendChild(panel);
  document.body.appendChild(root);

  // ===== Minimization =====
  var isMinimized = false;
  var inactiveTimer = null;

  function minimize() {
    if (store.open || isMinimized) return;
    isMinimized = true;
    dockEntries.style.maxWidth = '0';
    dockEntries.style.opacity = '0';
    dockEntries.style.margin = '0';
    dockBar.style.padding = '3px';
  }

  function expand() {
    if (!isMinimized) return;
    isMinimized = false;
    dockEntries.style.maxWidth = '300px';
    dockEntries.style.opacity = '1';
    dockEntries.style.margin = '';
    dockBar.style.padding = '3px';
    resetInactiveTimer();
  }

  function resetInactiveTimer() {
    if (inactiveTimer) clearTimeout(inactiveTimer);
    if (store.inactiveTimeout > 0 && !store.open) {
      inactiveTimer = setTimeout(minimize, store.inactiveTimeout);
    }
  }

  anchor.onmouseenter = function() { glow.style.opacity = '1'; expand(); };
  anchor.onmouseleave = function() { glow.style.opacity = '0'; resetInactiveTimer(); };
  miniLogo.onclick = function(e) { e.stopPropagation(); expand(); };

  // ===== Position =====
  function isVertical() { return store.position === 'left' || store.position === 'right'; }

  function positionAnchor() {
    var p = store.position, m = 8;
    anchor.style.left = anchor.style.right = anchor.style.top = anchor.style.bottom = 'auto';
    dockBar.style.flexDirection = isVertical() ? 'column' : 'row';
    dockEntries.style.flexDirection = isVertical() ? 'column' : 'row';
    if (p === 'left') { anchor.style.left = m+'px'; anchor.style.top = store.anchorOffset+'%'; anchor.style.transform = 'translateY(-50%)'; }
    else if (p === 'right') { anchor.style.right = m+'px'; anchor.style.top = store.anchorOffset+'%'; anchor.style.transform = 'translateY(-50%)'; }
    else if (p === 'top') { anchor.style.top = m+'px'; anchor.style.left = store.anchorOffset+'%'; anchor.style.transform = 'translateX(-50%)'; }
    else { anchor.style.bottom = m+'px'; anchor.style.left = store.anchorOffset+'%'; anchor.style.transform = 'translateX(-50%)'; }
  }

  function positionPanel() {
    var p = store.position, w = store.width, h = store.height;
    panel.style.left = panel.style.right = panel.style.top = panel.style.bottom = 'auto';
    panel.style.borderRadius = '0';
    resizer.style.left = resizer.style.right = resizer.style.top = resizer.style.bottom = resizer.style.width = resizer.style.height = 'auto';
    if (p === 'left') { panel.style.left='0'; panel.style.top='0'; panel.style.bottom='0'; panel.style.width=w+'vw'; panel.style.height='100vh'; panel.style.borderRadius='0 10px 10px 0'; iframe.style.height='calc(100vh - 32px)'; resizer.style.right='0'; resizer.style.top='0'; resizer.style.bottom='0'; resizer.style.width='4px'; resizer.style.cursor='ew-resize'; }
    else if (p === 'right') { panel.style.right='0'; panel.style.top='0'; panel.style.bottom='0'; panel.style.width=w+'vw'; panel.style.height='100vh'; panel.style.borderRadius='10px 0 0 10px'; iframe.style.height='calc(100vh - 32px)'; resizer.style.left='0'; resizer.style.top='0'; resizer.style.bottom='0'; resizer.style.width='4px'; resizer.style.cursor='ew-resize'; }
    else if (p === 'bottom') { panel.style.left='0'; panel.style.right='0'; panel.style.bottom='0'; panel.style.width='100vw'; panel.style.height=h+'vh'; panel.style.borderRadius='10px 10px 0 0'; iframe.style.height='calc('+h+'vh - 32px)'; resizer.style.left='0'; resizer.style.right='0'; resizer.style.top='0'; resizer.style.height='4px'; resizer.style.cursor='ns-resize'; }
    else { panel.style.left='0'; panel.style.right='0'; panel.style.top='0'; panel.style.width='100vw'; panel.style.height=h+'vh'; panel.style.borderRadius='0 0 10px 10px'; iframe.style.height='calc('+h+'vh - 32px)'; resizer.style.left='0'; resizer.style.right='0'; resizer.style.bottom='0'; resizer.style.height='4px'; resizer.style.cursor='ns-resize'; }
  }

  // ===== Dock selection =====
  function updateDockButtons() {
    dockButtons.forEach(function(item) {
      var isSelected = store.selectedDock === item.dock.id && store.open;
      item.el.style.color = isSelected ? '#a78bfa' : 'rgba(255,255,255,0.45)';
      item.el.style.background = isSelected ? 'rgba(167,139,250,0.12)' : 'transparent';
      item.el.style.transform = isSelected ? 'scale(1.15)' : 'scale(1)';
    });
  }

  function toggleDock(dockId) {
    if (store.open && store.selectedDock === dockId) {
      closePanel();
    } else {
      store.selectedDock = dockId;
      openPanel(dockId);
    }
  }

  function openPanel(dockId) {
    var dock = DOCKS.find(function(d) { return d.id === dockId; });
    if (!dock) return;
    store.open = true;
    store.selectedDock = dockId;
    save();
    positionPanel();
    panel.style.display = 'block';
    panelTitle.textContent = dock.title;
    if (iframe.src !== dock.url) iframe.src = dock.url;
    updateDockButtons();
    if (inactiveTimer) clearTimeout(inactiveTimer);
  }

  function closePanel() {
    store.open = false;
    save();
    panel.style.display = 'none';
    updateDockButtons();
    resetInactiveTimer();
  }

  // ===== Drag anchor =====
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
    var cx = e.clientX, cy = e.clientY, W = window.innerWidth, H = window.innerHeight;
    var dL = cx, dR = W-cx, dT = cy, dB = H-cy, mn = Math.min(dL,dR,dT,dB);
    if (mn===dL) { store.position='left'; store.anchorOffset=Math.max(10,Math.min(90,(cy/H)*100)); }
    else if (mn===dR) { store.position='right'; store.anchorOffset=Math.max(10,Math.min(90,(cy/H)*100)); }
    else if (mn===dT) { store.position='top'; store.anchorOffset=Math.max(10,Math.min(90,(cx/W)*100)); }
    else { store.position='bottom'; store.anchorOffset=Math.max(10,Math.min(90,(cx/W)*100)); }
    positionAnchor(); save();
  };
  anchor.onpointerup = function(e) {
    isDragging = false;
    anchor.releasePointerCapture(e.pointerId);
  };

  // ===== Resize panel =====
  resizer.onmousedown = function(e) {
    var isResizing = true; iframe.style.pointerEvents='none'; e.preventDefault();
    var sX=e.clientX, sY=e.clientY, sW=store.width, sH=store.height;
    function onM(ev) {
      if (!isResizing) return;
      var dx=((ev.clientX-sX)/window.innerWidth)*100, dy=((ev.clientY-sY)/window.innerHeight)*100;
      if (store.position==='left') store.width=Math.max(20,Math.min(80,sW+dx));
      else if (store.position==='right') store.width=Math.max(20,Math.min(80,sW-dx));
      else if (store.position==='top') store.height=Math.max(20,Math.min(80,sH+dy));
      else store.height=Math.max(20,Math.min(80,sH-dy));
      positionPanel(); save();
    }
    function onU() { isResizing=false; iframe.style.pointerEvents='auto'; document.removeEventListener('mousemove',onM); document.removeEventListener('mouseup',onU); }
    document.addEventListener('mousemove',onM); document.addEventListener('mouseup',onU);
  };

  // ===== Keyboard shortcut =====
  document.addEventListener('keydown', function(e) {
    if (e.altKey && e.key === 'd') {
      if (store.open) closePanel();
      else toggleDock(store.selectedDock || 'build');
      e.preventDefault();
    }
  });

  // ===== Init =====
  dockEntries.style.maxWidth = '300px';
  dockEntries.style.opacity = '1';
  positionAnchor();
  updateDockButtons();
  if (store.open && store.selectedDock) openPanel(store.selectedDock);
  resetInactiveTimer();
})();`
}

export function getInjectScript(port: number, host: string = 'localhost'): string {
  return `<script>${getInjectClientScript(port, host)}</script>`
}
