---
name: rspack-devtools-development
description: >
  Develops and extends Rspack DevTools (@rspack-devtools), a build analysis
  and visualization tool for Rspack. Use when working on rs-devtools source
  code, adding features, fixing bugs, creating playground demos, or aligning
  functionality with vite-devtools. Applies to files under rs-devtools/
  packages/core, packages/client, or example directories.
---

# Rspack DevTools Development

Build analysis and visualization DevTools for Rspack, architecturally inspired by [vite-devtools](../../../vite-devtools/).

## Project Structure

```
rs-devtools/
├── packages/
│   ├── core/                # @rspack-devtools/core - Rspack plugin + server
│   │   ├── src/
│   │   │   ├── plugin.ts    # RspackDevToolsPlugin (compiler.hooks.done)
│   │   │   ├── server.ts    # HTTP + WebSocket server (sirv + ws)
│   │   │   ├── collector.ts # Stats → structured data transformer
│   │   │   ├── rpc.ts       # Server-side RPC function implementations
│   │   │   ├── inject.ts    # Dock UI inject script (floating button + panel)
│   │   │   ├── terminal.ts  # Terminal session host (child_process)
│   │   │   ├── types.ts     # All interfaces + RPC contracts
│   │   │   └── index.ts     # Public exports
│   │   └── tsup.config.ts   # Build config (ESM, es2022)
│   └── client/              # @rspack-devtools/client - Vue 3 UI
│       ├── src/
│       │   ├── main.ts      # Vue app + vue-router setup
│       │   ├── App.vue      # Root component with WebSocket status
│       │   ├── composables/
│       │   │   └── rpc.ts   # birpc client with reconnection
│       │   └── pages/       # Route pages (Overview, Modules, Chunks, etc.)
│       └── vite.config.ts   # Vite build for client UI
├── example/                 # Playground (React + Rspack)
│   ├── rspack.config.mjs    # Uses RspackDevToolsPlugin + HtmlRspackPlugin
│   ├── index.html           # Loads devtools-inject.js from DevTools server
│   └── src/
│       ├── App.jsx          # Hash router with Home/DevTools/FileExplorer
│       ├── pages/           # DevToolsDemo.jsx, FileExplorer.jsx
│       └── components/      # Counter, TodoList, UserCard, etc.
└── package.json             # pnpm workspace root
```

## Core Architecture

### Data Flow

```
Rspack Compiler → compiler.hooks.done → stats.toJson() → DataCollector
  → BuildSession → stored in collector.sessions Map
  → DevToolsServer (HTTP+WS on port 7821)
    → birpc over WebSocket → Client UI (Vue 3)
    → /devtools-inject.js → Dock UI (injected into app)
```

### Key Design Decisions

| Decision | Approach | Rationale |
|----------|----------|-----------|
| RPC | `birpc` over WebSocket | Lightweight, bidirectional, matches vite-devtools |
| Static serving | `sirv` | Simple, fast, single-page-app support |
| Client UI | Vue 3 + UnoCSS + D3.js | Matches vite-devtools stack |
| Data collection | `stats.toJson()` | Rspack's official stats API |
| Port | `get-port-please` (default 7821) | Auto-finds available port |
| Dock injection | `<script src>` from DevTools server | Avoids fragile middleware HTML interception |

## Adding Features

### 1. Add a New RPC Method

**types.ts** — Add to `ServerFunctions` interface:
```ts
export interface ServerFunctions {
  // existing...
  'rspack:my-new-method': (args: { session: string }) => Promise<MyData[]>
}
```

**rpc.ts** — Implement the handler:
```ts
'rspack:my-new-method': async ({ session }) => {
  const s = collector.sessions.get(session)
  return s ? transformData(s) : []
},
```

**client composables/rpc.ts** — Call from client:
```ts
const data = await rpc.value['rspack:my-new-method']({ session: sessionId })
```

### 2. Add a New Client Page

Create `packages/client/src/pages/MyPage.vue`, then register the route in `main.ts`:
```ts
{ path: '/session/:id/my-page', component: () => import('./pages/MyPage.vue') }
```

Add navigation in `SessionLayout.vue`:
```ts
navItems.push({ label: 'My Page', path: 'my-page', icon: '📊' })
```

### 3. Collect New Data from Rspack

Update `collector.ts` to extract data from `statsJson`, add fields to `BuildSession` in `types.ts`, and pass through `collectFromStats()`.

Stats options in `plugin.ts` — add what you need:
```ts
stats.toJson({
  all: false,
  modules: true,     // Module data
  chunks: true,      // Chunk data
  assets: true,      // Asset data
  reasons: true,     // Module dependency reasons
  source: true,      // Module source code
  chunkOrigins: true, // Chunk origin modules
  // ...
})
```

## Dock Injection System

The dock UI is a vanilla JS script served from the DevTools server at `/devtools-inject.js`.

**How it works:**
1. `server.ts` serves `/devtools-inject.js` with CORS headers
2. `index.html` loads it via `<script src="http://localhost:7821/devtools-inject.js">`
3. The script creates a floating toggle button (⚡) and a resizable iframe panel
4. State (position, size, open/closed) persists in `localStorage`
5. Alt+D keyboard shortcut toggles the panel

**Key features:**
- Draggable anchor that snaps to screen edges (left/right/top/bottom)
- Resizable panel with header bar (title, pop-out, close buttons)
- Gradient glow effect on hover (matches vite-devtools aesthetic)
- `window.parent !== window` guard to skip injection inside iframes

## RPC Message Format (birpc)

```
Request:  { "m": "rspack:list-sessions", "a": [{}], "t": "req-1" }
Response: { "t": "req-1", "d": [...] }
Event:    { "m": "rspack:build-completed", "a": [{ id, timestamp }] }
```

All 20 server functions are in `ServerFunctions`. Client functions (`ClientFunctions`) handle real-time events like `rspack:build-completed`, `rspack:terminal-output`.

## Playground Structure

The playground (`example/`) is a React app with hash-based routing:

| Route | Page | Purpose |
|-------|------|---------|
| `#/` | Home | Hero + demo components (Counter, Todo, etc.) |
| `#/devtools` | DevToolsDemo | RPC connection status, session inspection, activity log |
| `#/explorer` | FileExplorer | Module browser with search, details, source code |

The playground loads the dock inject script from the DevTools server, providing the same embedded DevTools experience as vite-devtools' floating button.

## Build & Run

```bash
# Build core (required after changes to packages/core/)
pnpm build:core

# Build client UI
pnpm build:client

# Run playground (starts rspack dev server + DevTools server)
cd example && npx rspack serve
```

The DevTools server starts automatically via the plugin on first compilation.

## Comparison with vite-devtools

For detailed feature comparison and architecture mapping, see [references/vite-devtools-comparison.md](references/vite-devtools-comparison.md).

For data collection patterns and Rspack Stats API usage, see [references/data-collection.md](references/data-collection.md).

For dock injection implementation details, see [references/dock-injection.md](references/dock-injection.md).
