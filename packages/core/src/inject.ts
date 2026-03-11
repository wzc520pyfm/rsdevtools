export function getInjectScript(port: number, host: string = 'localhost'): string {
  return `
<script>
(function() {
  if (typeof window === 'undefined') return;
  if (window.__RSPACK_DEVTOOLS_INJECTED__) return;
  window.__RSPACK_DEVTOOLS_INJECTED__ = true;

  var DEVTOOLS_URL = 'http://' + '${host}' + ':' + '${port}';

  var container = document.createElement('div');
  container.id = 'rspack-devtools-dock';
  container.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:2147483647;display:none;';

  var toggleBtn = document.createElement('button');
  toggleBtn.id = 'rspack-devtools-toggle';
  toggleBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>';
  toggleBtn.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:2147483647;width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:white;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:transform 0.2s,box-shadow 0.2s;';
  toggleBtn.onmouseenter = function() { this.style.transform = 'scale(1.1)'; this.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'; };
  toggleBtn.onmouseleave = function() { this.style.transform = 'scale(1)'; this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; };

  var iframe = document.createElement('iframe');
  iframe.src = DEVTOOLS_URL;
  iframe.style.cssText = 'width:100%;height:100%;border:none;background:white;';

  var header = document.createElement('div');
  header.style.cssText = 'height:32px;background:#1e293b;display:flex;align-items:center;padding:0 12px;cursor:ns-resize;user-select:none;';
  header.innerHTML = '<span style="color:#60a5fa;font-size:12px;font-weight:600;flex:1;font-family:system-ui">Rspack DevTools</span>';

  var closeBtn = document.createElement('button');
  closeBtn.textContent = '\\u00d7';
  closeBtn.style.cssText = 'background:none;border:none;color:#94a3b8;font-size:18px;cursor:pointer;padding:0 4px;line-height:1;';
  closeBtn.onclick = function() { togglePanel(false); };
  header.appendChild(closeBtn);

  var panelHeight = 350;
  container.style.height = panelHeight + 'px';
  container.appendChild(header);
  container.appendChild(iframe);

  var isOpen = false;
  function togglePanel(force) {
    isOpen = force !== undefined ? force : !isOpen;
    container.style.display = isOpen ? 'block' : 'none';
    toggleBtn.style.display = isOpen ? 'none' : 'flex';
    iframe.style.height = (panelHeight - 32) + 'px';
  }

  toggleBtn.onclick = function() { togglePanel(true); };

  var isDragging = false;
  var startY = 0;
  var startH = 0;
  header.onmousedown = function(e) {
    isDragging = true; startY = e.clientY; startH = panelHeight;
    document.onmousemove = function(e2) {
      if (!isDragging) return;
      panelHeight = Math.max(200, Math.min(window.innerHeight - 100, startH + (startY - e2.clientY)));
      container.style.height = panelHeight + 'px';
      iframe.style.height = (panelHeight - 32) + 'px';
    };
    document.onmouseup = function() { isDragging = false; document.onmousemove = null; document.onmouseup = null; };
  };

  document.body.appendChild(container);
  document.body.appendChild(toggleBtn);
})();
</script>`.trim()
}
