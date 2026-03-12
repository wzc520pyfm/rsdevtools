export function getInjectClientScript(port: number, host: string = 'localhost'): string {
  const devtoolsUrl = `http://${host}:${port}`
  return `(function() {
  if (typeof window === 'undefined') return;
  if (window.__RSPACK_DEVTOOLS_INJECTED__) return;
  if (window.parent !== window) return;
  window.__RSPACK_DEVTOOLS_INJECTED__ = true;

  var DEVTOOLS_URL = '${devtoolsUrl}';
  var STORAGE_KEY = 'rspack-devtools-dock-state';

  var defaults = { position: 'left', width: 40, height: 100, left: 50, top: 50, open: false };
  var store;
  try { store = Object.assign({}, defaults, JSON.parse(localStorage.getItem(STORAGE_KEY))); } catch(e) { store = Object.assign({}, defaults); }
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch(e) {} }

  var root = document.createElement('div');
  root.id = 'rspack-devtools-root';
  root.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;inset:0;';

  var anchor = document.createElement('div');
  anchor.id = 'rspack-devtools-anchor';
  anchor.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:auto;cursor:pointer;user-select:none;transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),opacity 0.3s;';

  var anchorInner = document.createElement('div');
  anchorInner.style.cssText = 'display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:10px;background:rgba(30,30,30,0.9);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.08);box-shadow:0 2px 12px rgba(0,0,0,0.3);transition:all 0.25s;';

  var glow = document.createElement('div');
  glow.style.cssText = 'position:absolute;width:80px;height:80px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,0.3),transparent 70%);opacity:0;transition:opacity 0.5s;pointer-events:none;transform:translate(-50%,-50%);left:50%;top:50%;';

  anchorInner.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="rg" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stop-color="#60a5fa"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#rg)"/></svg>';
  anchor.appendChild(glow);
  anchor.appendChild(anchorInner);

  anchor.onmouseenter = function() { glow.style.opacity = '1'; anchorInner.style.transform = 'scale(1.08)'; anchorInner.style.boxShadow = '0 4px 20px rgba(59,130,246,0.4)'; anchorInner.style.borderColor = 'rgba(96,165,250,0.4)'; };
  anchor.onmouseleave = function() { glow.style.opacity = '0'; anchorInner.style.transform = 'scale(1)'; anchorInner.style.boxShadow = '0 2px 12px rgba(0,0,0,0.3)'; anchorInner.style.borderColor = 'rgba(255,255,255,0.08)'; };

  var panel = document.createElement('div');
  panel.id = 'rspack-devtools-panel';
  panel.style.cssText = 'position:fixed;z-index:2147483646;pointer-events:auto;display:none;background:#1a1a2e;border:1px solid rgba(255,255,255,0.06);overflow:hidden;transition:opacity 0.2s,transform 0.25s cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 8px 32px rgba(0,0,0,0.4);';

  var panelHeader = document.createElement('div');
  panelHeader.style.cssText = 'height:28px;background:rgba(30,30,30,0.95);display:flex;align-items:center;padding:0 8px;gap:6px;border-bottom:1px solid rgba(255,255,255,0.06);cursor:default;user-select:none;';
  panelHeader.innerHTML = '<span style="display:flex;align-items:center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#60a5fa"/></svg></span><span style="flex:1;font-size:11px;font-weight:600;color:rgba(255,255,255,0.7);font-family:system-ui">Rspack DevTools</span>';

  function mkBtn(title, svg, onclick) {
    var b = document.createElement('button');
    b.title = title; b.innerHTML = svg; b.onclick = onclick;
    b.style.cssText = 'background:none;border:none;color:rgba(255,255,255,0.4);cursor:pointer;padding:2px;display:flex;align-items:center;border-radius:4px;transition:all 0.15s;width:20px;height:20px;justify-content:center;';
    b.onmouseenter = function(){ b.style.color='rgba(255,255,255,0.8)'; b.style.background='rgba(255,255,255,0.06)'; };
    b.onmouseleave = function(){ b.style.color='rgba(255,255,255,0.4)'; b.style.background='none'; };
    return b;
  }
  var acts = document.createElement('div');
  acts.style.cssText = 'display:flex;gap:2px;';
  acts.appendChild(mkBtn('Pop out', '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>', function(){ window.open(DEVTOOLS_URL,'rspack-devtools','width=1200,height=800'); togglePanel(false); }));
  acts.appendChild(mkBtn('Close', '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>', function(){ togglePanel(false); }));
  panelHeader.appendChild(acts);

  var iframe = document.createElement('iframe');
  iframe.src = DEVTOOLS_URL;
  iframe.style.cssText = 'width:100%;border:none;background:#1a1a2e;display:block;';

  var resizer = document.createElement('div');
  resizer.style.cssText = 'position:absolute;z-index:1;';

  panel.appendChild(panelHeader);
  panel.appendChild(iframe);
  panel.appendChild(resizer);
  root.appendChild(anchor);
  root.appendChild(panel);
  document.body.appendChild(root);

  function positionAnchor() {
    var p = store.position, m = 12;
    anchor.style.left = anchor.style.right = anchor.style.top = anchor.style.bottom = 'auto';
    if (p === 'left') { anchor.style.left = m+'px'; anchor.style.top = store.top+'%'; anchor.style.transform = 'translateY(-50%)'; }
    else if (p === 'right') { anchor.style.right = m+'px'; anchor.style.top = store.top+'%'; anchor.style.transform = 'translateY(-50%)'; }
    else if (p === 'top') { anchor.style.top = m+'px'; anchor.style.left = store.left+'%'; anchor.style.transform = 'translateX(-50%)'; }
    else { anchor.style.bottom = m+'px'; anchor.style.left = store.left+'%'; anchor.style.transform = 'translateX(-50%)'; }
  }

  function positionPanel() {
    var p = store.position, w = store.width, h = store.height;
    panel.style.left = panel.style.right = panel.style.top = panel.style.bottom = 'auto';
    panel.style.borderRadius = '0';
    resizer.style.left = resizer.style.right = resizer.style.top = resizer.style.bottom = resizer.style.width = resizer.style.height = 'auto';
    if (p === 'left') { panel.style.left='0'; panel.style.top='0'; panel.style.bottom='0'; panel.style.width=w+'vw'; panel.style.height='100vh'; panel.style.borderRadius='0 8px 8px 0'; iframe.style.height='calc(100vh - 28px)'; resizer.style.right='0'; resizer.style.top='0'; resizer.style.bottom='0'; resizer.style.width='4px'; resizer.style.cursor='ew-resize'; }
    else if (p === 'right') { panel.style.right='0'; panel.style.top='0'; panel.style.bottom='0'; panel.style.width=w+'vw'; panel.style.height='100vh'; panel.style.borderRadius='8px 0 0 8px'; iframe.style.height='calc(100vh - 28px)'; resizer.style.left='0'; resizer.style.top='0'; resizer.style.bottom='0'; resizer.style.width='4px'; resizer.style.cursor='ew-resize'; }
    else if (p === 'bottom') { panel.style.left='0'; panel.style.right='0'; panel.style.bottom='0'; panel.style.width='100vw'; panel.style.height=h+'vh'; panel.style.borderRadius='8px 8px 0 0'; iframe.style.height='calc('+h+'vh - 28px)'; resizer.style.left='0'; resizer.style.right='0'; resizer.style.top='0'; resizer.style.height='4px'; resizer.style.cursor='ns-resize'; }
    else { panel.style.left='0'; panel.style.right='0'; panel.style.top='0'; panel.style.width='100vw'; panel.style.height=h+'vh'; panel.style.borderRadius='0 0 8px 8px'; iframe.style.height='calc('+h+'vh - 28px)'; resizer.style.left='0'; resizer.style.right='0'; resizer.style.bottom='0'; resizer.style.height='4px'; resizer.style.cursor='ns-resize'; }
  }

  var isOpen = store.open;
  function togglePanel(force) {
    isOpen = force !== undefined ? force : !isOpen;
    store.open = isOpen; save();
    if (isOpen) { positionPanel(); panel.style.display='block'; anchor.style.display='none'; }
    else { panel.style.display='none'; anchor.style.display='block'; positionAnchor(); }
  }

  var wasDragging = false;
  anchor.onclick = function(e) { if (wasDragging) { wasDragging = false; return; } togglePanel(true); };

  var isDragging = false, dragStartX, dragStartY;
  anchor.onpointerdown = function(e) { if (e.button !== 0) return; isDragging = true; wasDragging = false; dragStartX = e.clientX; dragStartY = e.clientY; anchor.setPointerCapture(e.pointerId); e.preventDefault(); };
  anchor.onpointermove = function(e) {
    if (!isDragging) return;
    if (Math.abs(e.clientX - dragStartX) > 4 || Math.abs(e.clientY - dragStartY) > 4) wasDragging = true;
    if (!wasDragging) return;
    var cx = e.clientX, cy = e.clientY, W = window.innerWidth, H = window.innerHeight;
    var dL = cx, dR = W-cx, dT = cy, dB = H-cy, mn = Math.min(dL,dR,dT,dB);
    if (mn===dL) { store.position='left'; store.top=Math.max(10,Math.min(90,(cy/H)*100)); }
    else if (mn===dR) { store.position='right'; store.top=Math.max(10,Math.min(90,(cy/H)*100)); }
    else if (mn===dT) { store.position='top'; store.left=Math.max(10,Math.min(90,(cx/W)*100)); }
    else { store.position='bottom'; store.left=Math.max(10,Math.min(90,(cx/W)*100)); }
    positionAnchor(); save();
  };
  anchor.onpointerup = function(e) { isDragging = false; anchor.releasePointerCapture(e.pointerId); };

  var isResizing = false;
  resizer.onmousedown = function(e) {
    isResizing = true; iframe.style.pointerEvents='none'; e.preventDefault();
    var sX=e.clientX, sY=e.clientY, sW=store.width, sH=store.height;
    function onM(ev) { if (!isResizing) return; var dx=((ev.clientX-sX)/window.innerWidth)*100, dy=((ev.clientY-sY)/window.innerHeight)*100; if (store.position==='left') store.width=Math.max(15,Math.min(80,sW+dx)); else if (store.position==='right') store.width=Math.max(15,Math.min(80,sW-dx)); else if (store.position==='top') store.height=Math.max(15,Math.min(80,sH+dy)); else store.height=Math.max(15,Math.min(80,sH-dy)); positionPanel(); save(); }
    function onU() { isResizing=false; iframe.style.pointerEvents='auto'; document.removeEventListener('mousemove',onM); document.removeEventListener('mouseup',onU); }
    document.addEventListener('mousemove',onM); document.addEventListener('mouseup',onU);
  };

  document.addEventListener('keydown', function(e) { if (e.altKey && e.key === 'd') { togglePanel(); e.preventDefault(); } });

  positionAnchor();
  if (isOpen) togglePanel(true);
})();`
}

export function getInjectScript(port: number, host: string = 'localhost'): string {
  return `<script>${getInjectClientScript(port, host)}</script>`
}
