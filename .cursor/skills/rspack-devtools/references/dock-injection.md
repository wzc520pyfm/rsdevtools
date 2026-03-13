# Dock Injection System

How the DevTools UI is injected into the user's application as a floating dock.

## Overview

The dock system has two parts:
1. **Server endpoint** (`/devtools-inject.js`) — serves the inject script with CORS
2. **Client loader** (`<script>` in `index.html`) — loads the script with retry

## Server-Side: `/devtools-inject.js`

In `server.ts`, a dedicated route serves the inject script:

```ts
if (pathname === '/devtools-inject.js') {
  res.writeHead(200, {
    'Content-Type': 'application/javascript',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
  })
  res.end(getInjectClientScript(port, host))
  return
}
```

This approach was chosen over middleware injection (intercepting HTML responses) because:
- Middleware injection conflicted with `content-encoding` (gzip) and `content-length` headers
- `ERR_HTTP_HEADERS_SENT` errors were hard to prevent with webpack-dev-server internals
- A standalone endpoint is framework-agnostic and always reliable

## Client-Side: HTML Loader

The `index.html` in the playground includes a self-retrying loader:

```html
<script>
(function loadDevTools() {
  var s = document.createElement('script');
  s.src = 'http://localhost:7821/devtools-inject.js';
  s.onerror = function() { setTimeout(loadDevTools, 2000); };
  document.body.appendChild(s);
})();
</script>
```

Retries every 2 seconds if the DevTools server hasn't started yet (first compilation hasn't completed).

## Inject Script Architecture

`inject.ts` exports two functions:
- `getInjectClientScript(port, host)` — raw JS string (no `<script>` tags)
- `getInjectScript(port, host)` — wrapped in `<script>` tags

### Script Structure

```
IIFE → Guard checks → Create DOM elements → Event handlers → Position logic → Persist state
```

### Guard Checks

```js
if (typeof window === 'undefined') return;     // SSR
if (window.__RSPACK_DEVTOOLS_INJECTED__) return; // Duplicate
if (window.parent !== window) return;            // Inside iframe
window.__RSPACK_DEVTOOLS_INJECTED__ = true;
```

### DOM Elements

| Element | ID | Description |
|---|---|---|
| Root container | `rspack-devtools-root` | Fixed overlay, `pointer-events: none`, `z-index: 2147483647` |
| Anchor button | `rspack-devtools-anchor` | 36x36px draggable ⚡ button |
| Glow ring | (inside anchor) | CSS gradient ring, visible on hover |
| Panel | `rspack-devtools-panel` | Resizable container with header |
| Iframe | (inside panel) | Loads `http://{host}:{port}` |

### Positioning System

The anchor snaps to the nearest viewport edge:

```
Edges: left, right, top, bottom
Storage: { position, left (%), top (%), width (%), height (%), open }
Key: 'rspack-devtools-dock-state' in localStorage
```

**Drag behavior:**
1. On `mousedown`, record start position
2. On `mousemove`, update anchor `left`/`top` (clamped to viewport)
3. On `mouseup`, calculate nearest edge, snap anchor to it
4. Save state to localStorage

### Panel Sizing

| Edge | Panel Position | Default Size |
|------|----------------|-------------|
| left | Right of anchor, full height | width: 40%, height: 100% |
| right | Left of anchor, full height | width: 40%, height: 100% |
| top | Below anchor, full width | width: 100%, height: 50% |
| bottom | Above anchor, full width | width: 100%, height: 50% |

### Keyboard Shortcut

`Alt+D` toggles the panel open/closed. Registered via `document.addEventListener('keydown', ...)`.

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| No ⚡ button visible | DevTools server not running | Check port 7821, ensure `pnpm build:core` was run |
| Button visible but panel empty | CORS blocked | Verify server sends `Access-Control-Allow-Origin: *` |
| Button inside iframe doesn't appear | Guard check working correctly | Expected behavior — dock only injects in top-level window |
| Position resets on reload | localStorage cleared | Check browser dev tools → Application → Local Storage |
| Script loads but button doesn't show | JS error in inject script | Check browser console for errors in the IIFE |

## Comparison with vite-devtools Dock

| Feature | vite-devtools | rs-devtools |
|---------|---|---|
| Injection method | Vite middleware transform | `<script src>` endpoint |
| Button icon | Vite logo | ⚡ lightning bolt |
| Positioning | Edge snapping | Edge snapping (same concept) |
| State storage | localStorage | localStorage |
| Toggle shortcut | Shift+Alt+D | Alt+D |
| Panel type | iframe | iframe |
| Framework | Built into devtools-kit client | Standalone vanilla JS |
