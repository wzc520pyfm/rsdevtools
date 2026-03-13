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
    { id: 'build', title: 'Build Analysis', icon: 'bolt' },
    { id: 'explorer', title: 'File Explorer', icon: 'folder' },
    { id: 'terminal', title: 'Terminal', icon: 'terminal' },
  ];

  var DOCK_URLS = {
    build: DEVTOOLS_URL,
    explorer: DEVTOOLS_URL + '/dock/explorer',
    terminal: DEVTOOLS_URL + '/dock/terminal',
  };

  var defaults = {
    position: 'left', width: 45, height: 55, left: 50, top: 50,
    open: false, selectedDock: null, anchorOffset: 50,
    inactiveTimeout: 4000,
  };
  var store;
  try { store = Object.assign({}, defaults, JSON.parse(localStorage.getItem(STORAGE_KEY))); }
  catch(e) { store = Object.assign({}, defaults); }
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch(e) {} }

  // ===== SVG Icons =====
  function makeSVG(type) {
    if (type === 'bolt') return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/></svg>';
    if (type === 'folder') return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>';
    if (type === 'terminal') return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,17 10,11 4,5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>';
    if (type === 'popout') return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
    if (type === 'close') return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    if (type === 'rspack-logo') return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="rgl" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#60a5fa"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#rgl)"/></svg>';
    if (type === 'bracket-left') return '<svg width="6" height="20" viewBox="0 0 9 20" fill="none"><path d="M4.96 0C1.03 5.63 1 14.35 4.96 20H7.61C3.66 14.35 3.68 5.63 7.61 0H4.96Z" fill="currentColor" opacity="0.5"/></svg>';
    if (type === 'bracket-right') return '<svg width="6" height="20" viewBox="0 0 9 20" fill="none"><path d="M4.25 10H6.9C6.9 6.41 5.91 2.82 3.95 0H1.29C3.26 2.82 4.24 6.41 4.25 10ZM8.94 14.91H6.27C6.47 14.17 6.62 13.41 6.72 12.66H4.07C3.96 13.41 3.81 14.17 3.61 14.91H0.94C0.7 15.82 0.39 16.71 0 17.57H2.67C2.29 18.42 1.82 19.23 1.29 20H3.95C4.48 19.23 4.94 18.42 5.33 17.57H7.99C8.38 16.71 8.69 15.82 8.94 14.91Z" fill="currentColor" opacity="0.5"/></svg>';
    return '';
  }

  // ===== Root container =====
  var root = document.createElement('div');
  root.id = 'rspack-devtools-root';
  root.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;inset:0;font-family:system-ui,-apple-system,sans-serif;font-size:15px;';

  // ===== Glow effect =====
  var glow = document.createElement('div');
  glow.id = 'rspack-devtools-glowing';
  glow.style.cssText = 'position:absolute;width:160px;height:160px;opacity:0;transition:opacity 1s ease-out;pointer-events:none;z-index:-1;border-radius:50%;filter:blur(60px);background:linear-gradient(45deg,#61d9ff,#7a23a1,#715ebd);transform:translate(-50%,-50%);left:50%;top:50%;';

  // ===== Anchor =====
  var anchor = document.createElement('div');
  anchor.id = 'rspack-devtools-anchor';
  anchor.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:auto;user-select:none;width:0;transform-origin:center;';

  // ===== Dock container =====
  var dockContainer = document.createElement('div');
  dockContainer.id = 'rspack-devtools-dock-container';
  dockContainer.style.cssText = 'position:absolute;left:0;top:0;height:40px;min-width:100px;width:max-content;display:flex;transform:translate(-50%,-50%);transition:all 0.5s cubic-bezier(0.34,1.56,0.64,1);';

  // ===== Dock bar =====
  var dockBar = document.createElement('div');
  dockBar.id = 'rspack-devtools-dock';
  dockBar.style.cssText = [
    'height:40px;border-radius:9999px;user-select:none;touch-action:none;margin:auto;',
    'background:rgba(20,20,30,0.88);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);',
    'border:1px solid rgba(255,255,255,0.08);',
    'box-shadow:0 4px 24px rgba(0,0,0,0.35),0 0 0 1px rgba(255,255,255,0.03) inset;',
    'transition:all 0.5s cubic-bezier(0.34,1.56,0.64,1);',
    'display:flex;align-items:center;position:relative;',
    'width:max-content;',
  ].join('');

  // ===== Bracket Left =====
  var bracketL = document.createElement('span');
  bracketL.style.cssText = 'position:absolute;left:-1px;top:50%;transform:translateY(-50%);width:6px;color:white;opacity:0.6;transition:opacity 0.3s,width 0.5s;display:flex;align-items:center;';
  bracketL.innerHTML = makeSVG('bracket-left');

  // ===== Bracket Right =====
  var bracketR = document.createElement('span');
  bracketR.style.cssText = 'position:absolute;right:-1px;top:50%;transform:translateY(-50%);width:6px;color:white;opacity:0.6;transition:opacity 0.3s,width 0.5s;display:flex;align-items:center;';
  bracketR.innerHTML = makeSVG('bracket-right');

  // ===== Mini logo (shown when minimized) =====
  var miniLogo = document.createElement('div');
  miniLogo.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:16px;height:16px;opacity:0;transition:opacity 0.3s;pointer-events:none;display:flex;align-items:center;justify-content:center;';
  miniLogo.innerHTML = makeSVG('rspack-logo');

  // ===== Dock entries container =====
  var dockEntries = document.createElement('div');
  dockEntries.style.cssText = 'display:flex;align-items:center;width:100%;height:100%;justify-content:center;padding:0 12px;gap:2px;transition:opacity 0.2s,max-width 0.5s cubic-bezier(0.34,1.56,0.64,1);overflow:hidden;';

  var dockButtons = [];
  DOCKS.forEach(function(dock) {
    var btn = document.createElement('button');
    btn.title = dock.title;
    btn.dataset.dockId = dock.id;
    btn.style.cssText = [
      'display:flex;align-items:center;justify-content:center;',
      'width:32px;height:32px;border:none;background:transparent;',
      'color:rgba(255,255,255,0.5);cursor:pointer;border-radius:12px;',
      'transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);padding:0;position:relative;',
    ].join('');
    btn.innerHTML = makeSVG(dock.icon);

    btn.onmouseenter = function() {
      if (store.selectedDock !== dock.id || !store.open) {
        btn.style.color = 'rgba(255,255,255,0.85)';
        btn.style.background = 'rgba(255,255,255,0.06)';
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
    btn.onclick = function(e) {
      e.stopPropagation();
      toggleDock(dock.id);
    };

    dockButtons.push({ el: btn, dock: dock });
    dockEntries.appendChild(btn);
  });

  dockBar.appendChild(bracketL);
  dockBar.appendChild(bracketR);
  dockBar.appendChild(miniLogo);
  dockBar.appendChild(dockEntries);
  dockContainer.appendChild(dockBar);
  anchor.appendChild(glow);
  anchor.appendChild(dockContainer);

  // ===== Tooltip =====
  var tooltip = document.createElement('div');
  tooltip.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;padding:5px 10px;border-radius:8px;background:rgba(20,20,30,0.95);color:rgba(255,255,255,0.85);font-size:12px;font-weight:500;white-space:nowrap;opacity:0;transition:opacity 0.15s;backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.08);box-shadow:0 4px 12px rgba(0,0,0,0.35);';
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
  panel.style.cssText = 'position:fixed;z-index:2147483646;pointer-events:auto;display:none;background:#0f0f17;border:1px solid rgba(255,255,255,0.06);overflow:hidden;transition:opacity 0.25s,transform 0.35s cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 8px 48px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.02) inset;';

  var panelHeader = document.createElement('div');
  panelHeader.style.cssText = 'height:36px;background:rgba(15,15,23,0.98);display:flex;align-items:center;padding:0 12px;gap:8px;border-bottom:1px solid rgba(255,255,255,0.06);user-select:none;';

  var panelIcon = document.createElement('span');
  panelIcon.style.cssText = 'display:flex;align-items:center;';
  panelIcon.innerHTML = makeSVG('rspack-logo');

  var panelTitle = document.createElement('span');
  panelTitle.style.cssText = 'flex:1;font-size:12px;font-weight:600;color:rgba(255,255,255,0.5);letter-spacing:0.02em;';
  panelTitle.textContent = 'Rspack DevTools';

  function mkHeaderBtn(title, svg, onclick) {
    var b = document.createElement('button');
    b.title = title; b.innerHTML = svg; b.onclick = onclick;
    b.style.cssText = 'background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;padding:4px;display:flex;align-items:center;border-radius:6px;transition:all 0.2s;width:24px;height:24px;justify-content:center;';
    b.onmouseenter = function(){ b.style.color='rgba(255,255,255,0.8)'; b.style.background='rgba(255,255,255,0.06)'; };
    b.onmouseleave = function(){ b.style.color='rgba(255,255,255,0.3)'; b.style.background='none'; };
    return b;
  }

  var headerActions = document.createElement('div');
  headerActions.style.cssText = 'display:flex;gap:2px;';
  headerActions.appendChild(mkHeaderBtn('Open in new window', makeSVG('popout'), function() {
    var url = DOCK_URLS[store.selectedDock] || DEVTOOLS_URL;
    window.open(url, 'rspack-devtools', 'width=1200,height=800');
    closePanel();
  }));
  headerActions.appendChild(mkHeaderBtn('Close panel', makeSVG('close'), function() {
    closePanel();
  }));

  panelHeader.appendChild(panelIcon);
  panelHeader.appendChild(panelTitle);
  panelHeader.appendChild(headerActions);

  var iframe = document.createElement('iframe');
  iframe.style.cssText = 'width:100%;border:none;background:#0f0f17;display:block;';

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
  var isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  function minimize() {
    if (store.open || isMinimized || isTouchDevice) return;
    isMinimized = true;
    dockEntries.style.opacity = '0';
    dockEntries.style.pointerEvents = 'none';
    dockBar.style.width = '22px';
    dockBar.style.height = '22px';
    dockBar.style.padding = '2px';
    miniLogo.style.opacity = '1';
    bracketL.style.opacity = '0.4';
    bracketL.style.width = '4px';
    bracketR.style.opacity = '0.4';
    bracketR.style.width = '4px';
  }

  function expand() {
    if (!isMinimized) return;
    isMinimized = false;
    dockEntries.style.opacity = '1';
    dockEntries.style.pointerEvents = 'auto';
    dockBar.style.width = 'max-content';
    dockBar.style.height = '40px';
    dockBar.style.padding = '';
    miniLogo.style.opacity = '0';
    bracketL.style.opacity = '0.6';
    bracketL.style.width = '6px';
    bracketR.style.opacity = '0.6';
    bracketR.style.width = '6px';
    resetInactiveTimer();
  }

  function resetInactiveTimer() {
    if (inactiveTimer) clearTimeout(inactiveTimer);
    if (store.inactiveTimeout > 0 && !store.open) {
      inactiveTimer = setTimeout(minimize, store.inactiveTimeout);
    }
  }

  anchor.onmouseenter = function() { glow.style.opacity = '0.6'; expand(); };
  anchor.onmouseleave = function() { glow.style.opacity = '0'; resetInactiveTimer(); };
  miniLogo.onclick = function(e) { e.stopPropagation(); expand(); };

  // ===== Position =====
  function isVertical() { return store.position === 'left' || store.position === 'right'; }

  function positionAnchor() {
    var p = store.position, m = 2;
    anchor.style.left = anchor.style.right = anchor.style.top = anchor.style.bottom = 'auto';

    if (isVertical()) {
      dockContainer.style.transform = 'translate(-50%,-50%) rotate(90deg)';
    } else {
      dockContainer.style.transform = 'translate(-50%,-50%)';
    }

    var off = store.anchorOffset;
    if (p === 'left') {
      anchor.style.left = (m + 20) + 'px';
      anchor.style.top = off + '%';
      anchor.style.transform = 'translate(-50%,-50%)';
    } else if (p === 'right') {
      anchor.style.left = (window.innerWidth - m - 20) + 'px';
      anchor.style.top = off + '%';
      anchor.style.transform = 'translate(-50%,-50%)';
    } else if (p === 'top') {
      anchor.style.left = off + '%';
      anchor.style.top = (m + 20) + 'px';
      anchor.style.transform = 'translate(-50%,-50%)';
    } else {
      anchor.style.left = off + '%';
      anchor.style.top = (window.innerHeight - m - 20) + 'px';
      anchor.style.transform = 'translate(-50%,-50%)';
    }
  }

  function positionPanel() {
    var p = store.position, w = store.width, h = store.height;
    panel.style.left = panel.style.right = panel.style.top = panel.style.bottom = 'auto';
    panel.style.borderRadius = '0';
    resizer.style.left = resizer.style.right = resizer.style.top = resizer.style.bottom = resizer.style.width = resizer.style.height = 'auto';

    if (p === 'left') {
      panel.style.left = '0'; panel.style.top = '0'; panel.style.bottom = '0';
      panel.style.width = w + 'vw'; panel.style.height = '100vh';
      panel.style.borderRadius = '0 12px 12px 0';
      iframe.style.height = 'calc(100vh - 36px)';
      resizer.style.right = '0'; resizer.style.top = '0'; resizer.style.bottom = '0';
      resizer.style.width = '6px'; resizer.style.cursor = 'ew-resize';
    } else if (p === 'right') {
      panel.style.right = '0'; panel.style.top = '0'; panel.style.bottom = '0';
      panel.style.width = w + 'vw'; panel.style.height = '100vh';
      panel.style.borderRadius = '12px 0 0 12px';
      iframe.style.height = 'calc(100vh - 36px)';
      resizer.style.left = '0'; resizer.style.top = '0'; resizer.style.bottom = '0';
      resizer.style.width = '6px'; resizer.style.cursor = 'ew-resize';
    } else if (p === 'bottom') {
      panel.style.left = '0'; panel.style.right = '0'; panel.style.bottom = '0';
      panel.style.width = '100vw'; panel.style.height = h + 'vh';
      panel.style.borderRadius = '12px 12px 0 0';
      iframe.style.height = 'calc(' + h + 'vh - 36px)';
      resizer.style.left = '0'; resizer.style.right = '0'; resizer.style.top = '0';
      resizer.style.height = '6px'; resizer.style.cursor = 'ns-resize';
    } else {
      panel.style.left = '0'; panel.style.right = '0'; panel.style.top = '0';
      panel.style.width = '100vw'; panel.style.height = h + 'vh';
      panel.style.borderRadius = '0 0 12px 12px';
      iframe.style.height = 'calc(' + h + 'vh - 36px)';
      resizer.style.left = '0'; resizer.style.right = '0'; resizer.style.bottom = '0';
      resizer.style.height = '6px'; resizer.style.cursor = 'ns-resize';
    }
  }

  // ===== Dock selection =====
  function updateDockButtons() {
    dockButtons.forEach(function(item) {
      var isSelected = store.selectedDock === item.dock.id && store.open;
      item.el.style.color = isSelected ? '#a78bfa' : 'rgba(255,255,255,0.5)';
      item.el.style.background = isSelected ? 'rgba(167,139,250,0.12)' : 'transparent';
      item.el.style.transform = isSelected ? 'scale(1.2)' : 'scale(1)';
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
    var url = DOCK_URLS[dockId];
    if (!url) return;
    store.open = true;
    store.selectedDock = dockId;
    save();
    positionPanel();
    panel.style.display = 'block';
    var dock = DOCKS.find(function(d) { return d.id === dockId; });
    panelTitle.textContent = dock ? dock.title : 'Rspack DevTools';
    if (iframe.src !== url) iframe.src = url;
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
  var draggingOffsetX = 0, draggingOffsetY = 0;

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

    var cx = e.clientX, cy = e.clientY;
    var W = window.innerWidth, H = window.innerHeight;
    var centerX = W / 2, centerY = H / 2;
    var deg = Math.atan2(cy - centerY, cx - centerX);
    var MARGIN = 70;
    var TL = Math.atan2(-centerY + MARGIN, -centerX);
    var TR = Math.atan2(-centerY + MARGIN, W - centerX);
    var BL = Math.atan2(H - MARGIN - centerY, -centerX);
    var BR = Math.atan2(H - MARGIN - centerY, W - centerX);

    store.position = deg >= TL && deg <= TR ? 'top'
      : deg >= TR && deg <= BR ? 'right'
      : deg >= BR && deg <= BL ? 'bottom' : 'left';

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
    dockContainer.style.transition = '';
  };

  // ===== Resize panel =====
  resizer.onmousedown = function(e) {
    var isResizing = true;
    iframe.style.pointerEvents = 'none';
    e.preventDefault();
    var sX = e.clientX, sY = e.clientY, sW = store.width, sH = store.height;
    function onM(ev) {
      if (!isResizing) return;
      var dx = ((ev.clientX - sX) / window.innerWidth) * 100;
      var dy = ((ev.clientY - sY) / window.innerHeight) * 100;
      if (store.position === 'left') store.width = Math.max(20, Math.min(80, sW + dx));
      else if (store.position === 'right') store.width = Math.max(20, Math.min(80, sW - dx));
      else if (store.position === 'top') store.height = Math.max(20, Math.min(80, sH + dy));
      else store.height = Math.max(20, Math.min(80, sH - dy));
      positionPanel(); save();
    }
    function onU() {
      isResizing = false;
      iframe.style.pointerEvents = 'auto';
      document.removeEventListener('mousemove', onM);
      document.removeEventListener('mouseup', onU);
    }
    document.addEventListener('mousemove', onM);
    document.addEventListener('mouseup', onU);
  };

  // ===== Keyboard shortcut =====
  document.addEventListener('keydown', function(e) {
    if (e.altKey && e.key === 'd') {
      if (store.open) closePanel();
      else toggleDock(store.selectedDock || 'build');
      e.preventDefault();
    }
  });

  // ===== Window resize =====
  window.addEventListener('resize', function() { positionAnchor(); if (store.open) positionPanel(); });

  // ===== Init =====
  positionAnchor();
  updateDockButtons();
  if (store.open && store.selectedDock) openPanel(store.selectedDock);
  resetInactiveTimer();
})();`
}

export function getInjectScript(port: number, host: string = 'localhost'): string {
  return `<script>${getInjectClientScript(port, host)}</script>`
}
