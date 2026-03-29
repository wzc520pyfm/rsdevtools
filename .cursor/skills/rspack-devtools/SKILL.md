---
name: rspack-devtools-development
description: >
  Develops and extends Rspack DevTools (@rspack-devtools), a build analysis
  and visualization tool for Rspack. Use when working on rs-devtools source
  code, adding features, fixing bugs, creating playground demos, launcher +
  Terminals + dock iframe behavior, or aligning functionality with
  vite-devtools. Applies to files under rs-devtools/ packages/core, packages/rspack,
  packages/kit, playground/, or examples/.
---

# Rspack DevTools Development

Build analysis and visualization DevTools for Rspack, architecturally inspired by [vite-devtools](../../../vite-devtools/).

## Project Structure

```
rs-devtools/
├── packages/
│   ├── kit/                 # @rspack-devtools/kit - Shared types & utilities
│   │   ├── src/
│   │   │   ├── index.ts     # Public exports (types, utils, constants)
│   │   │   ├── constants.ts # RPC names, shared state keys, defaults
│   │   │   ├── client/      # Browser-side API (getDevToolsRpcClient, etc.)
│   │   │   ├── types/       # All type definitions
│   │   │   └── utils/       # defineRpcFunction, createEventEmitter, nanoid
│   │   └── package.json
│   ├── rspack/              # @rspack-devtools/rspack - Build UI + DevToolsRspackUI (launcher, static client)
│   ├── self-inspect/        # @rspack-devtools/self-inspect - Self-inspect dock plugin
│   ├── core/                # @rspack-devtools/core - Rspack plugin + server + inject bundle
│   │   ├── src/
│   │   │   ├── plugin.ts    # RspackDevToolsPlugin (compiler.hooks.done)
│   │   │   ├── factory.ts   # RspackDevTools() function-style factory
│   │   │   ├── server.ts    # HTTP + WebSocket server (sirv + ws + client-imports)
│   │   │   ├── collector.ts # Stats → structured data transformer
│   │   │   ├── context.ts   # DevToolsNodeContext creation + host wiring
│   │   │   ├── builtin-rpc.ts  # All builtin RPC functions (data + logs + inspect)
│   │   │   ├── builtin-plugin.ts # Built-in dock entries (build, explorer, terminal)
│   │   │   ├── inject.ts    # getInjectClientScript + serializeDocks for inject + /.devtools/api/docks
│   │   │   ├── client-inject/ # Vanilla dock UI source → bundled to client-inject.global.js
│   │   │   ├── hosts/
│   │   │   │   ├── dock-host.ts     # Dock registry with builtin entries
│   │   │   │   ├── rpc-host.ts      # RPC function host + shared state
│   │   │   │   ├── logs-host.ts     # Log entries with incremental sync
│   │   │   │   ├── terminal-host.ts # Terminal session management
│   │   │   │   └── view-host.ts     # Static file hosting for plugins
│   │   │   ├── types.ts     # Server-specific interfaces
│   │   │   └── index.ts     # Public exports
│   │   └── tsup.config.ts   # Build config (ESM, es2022)
│   └── client/              # @rspack-devtools/client - Vue 3 UI
│       ├── src/
│       │   ├── main.ts      # Vue app + vue-router setup (all routes)
│       │   ├── App.vue      # Root component with WebSocket status
│       │   ├── composables/
│       │   │   └── rpc.ts   # birpc client with reconnection + log listeners
│       │   └── pages/       # Route pages
│       │       ├── Sessions.vue, Overview.vue, Modules.vue, ...
│       │       ├── DockTerminal.vue   # Builtin: Terminal
│       │       ├── DockExplorer.vue   # Builtin: File Explorer
│       │       ├── DockLogs.vue       # Builtin: Logs & Notifications
│       │       ├── DockSettings.vue   # Builtin: Settings
│       │       └── DockSelfInspect.vue # Builtin: Self Inspect
│       └── vite.config.ts   # Vite build for client UI
├── playground/              # Minimal playground (function-style API)
│   ├── rspack.config.mjs    # RspackDevTools() + launcher (nested terminal + optional iframe URL)
│   ├── nested-react-app/    # Second Rspack dev (e.g. port 9301) — launched from Terminals via launcher
│   ├── index.html           # Loads devtools-inject.js (often proxied from :7821)
│   └── src/                 # Simple React app
├── examples/                # Sample apps (esm, commonjs, rspack2)
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

The dock UI is a vanilla JS script served from the DevTools server at `/devtools-inject.js`. Its design is aligned with vite-devtools' dock and supports all entry types.

**How it works:**
1. `server.ts` serves `/devtools-inject.js` with CORS headers
2. `index.html` loads it via `<script src="http://localhost:7821/devtools-inject.js">`
3. The script creates a floating bracket dock with icon entries for all dock types
4. State (position, size, open/closed) persists in `localStorage`
5. Alt+D keyboard shortcut toggles the panel

**Supported dock entry types (aligned with vite-devtools):**
- **iframe** — Load URL in iframe panel (existing + clientScript support)
- **action** — Load client script from `/.devtools/client-imports.js` and execute
- **custom-render** — Load renderer script, mount DOM in panel
- **launcher** — Show launcher UI with button, status, and on-launch RPC
- **~builtin** — Core entries: `~logs`, `~settings`, `~popup`, `~self-inspect`
- **~popup** — Open standalone mode in new window

**Built-in features:**
- Toast overlay (bottom-right) for log notifications via WebSocket
- Builtin panels: Logs & Notifications, Settings, Self Inspect
- Bracket decorations `[` `]` framing dock entries
- Gradient glow effect on hover
- Minimized state showing Rspack logo
- Drag-to-dock positioning (snap to edges)
- `window.parent !== window` guard to skip injection inside iframes

## Launcher, Terminals & dock iframe

**Where it lives**
- **`packages/rspack/src/node/plugin.ts`** — `DevToolsRspackUI()` registers the build-analysis iframe dock and optional **launcher** dock(s). Options include `LauncherConfig`: `command`, `cwd`, `title`, `description`, `openUrlAfterLaunch`, `iframeTitleAfterLaunch`, `iframeIconAfterLaunch`, etc.
- **`packages/core/src/plugin.ts`** — passes `RspackDevToolsOptions.launcher` into `DevToolsRspackUI` when built-in UI is enabled.
- **`packages/core/src/rpc/internal.ts`** — `devtoolskit:internal:docks:on-launch` runs the launcher’s `onLaunch` (loading/success/error on the dock entry).
- **`packages/core/src/server.ts`** — `POST /.devtools/api/launch/:dockId` invokes that RPC; **`GET /.devtools/api/docks`** returns **`serializeDocks()`** (same JSON shape as embedded in `devtools-inject.js`, so launcher metadata survives round-trips and the inject client stays in sync).

**User flow**
1. Launcher dock shows title, description, **Launch** button (vanilla UI in `packages/core/src/client-inject/index.ts`).
2. **Launch** → HTTP POST → server runs `onLaunch`: **`ctx.terminals.run(command, cwd)`** (child process; output in **Terminals** panel).
3. If **`openUrlAfterLaunch`** is set, **`ctx.docks.update`** replaces that dock with **`type: 'iframe'`** and the same **`id`**, so the panel loads the URL in an iframe (vite-devtools-style).

**Iframe URL resolution** (inject client, `resolveDockIframeUrl`)
- **Absolute** `http(s)://…` — used as-is (good for external sites, e.g. playground iframe → `https://rspack.rs/`).
- **Root-relative on DevTools origin** — e.g. `/.devtools-rspack/` → prefixed with **`devtoolsUrl`** (7821) for built-in Rspack UI.
- **`/__rdt_nested__/…`** — prefixed with **`window.location.origin`** so the **host app** can `devServer.proxy` to a second dev server: **same origin as the page**, avoids **`X-Frame-Options: SAMEORIGIN`** between two local ports and **localhost vs 127.0.0.1** mismatches.

**Playground pattern vs vite-devtools**
- **vite-devtools** playground runs `vite dev` in a terminal but points the dock iframe at **`https://antfu.me`**, not the nested local URL — deliberately avoiding cross-origin iframe issues.
- **rs-devtools** playground: **Terminals** start a real nested app (`playground/nested-react-app`, `rspack serve` on **9301**); the dock iframe can still point at an **external** URL (**rspack.rs**) so the demo does not rely on embedding `:9301` cross-origin. For **local** embed, use the **`/__rdt_nested__/` + proxy** pattern above.

**Sync**
- WebSocket broadcast **`devtoolskit:internal:docks:updated`** triggers **`refreshUserDocks()`** in the inject script (re-fetch **`/.devtools/api/docks`**, merge builtins, refresh open panel / dock bar).

## RPC Message Format (birpc)

```
Request:  { "m": "rspack:list-sessions", "a": [{}], "t": "req-1" }
Response: { "t": "req-1", "d": [...] }
Event:    { "m": "rspack:build-completed", "a": [{ id, timestamp }] }
```

All 20 server functions are in `ServerFunctions`. Client functions (`ClientFunctions`) handle real-time events like `rspack:build-completed`, `rspack:terminal-output`.

## Playground Structure

Two playground setups are available:

### `playground/` — Minimal (function-style API)
Demonstrates the `RspackDevTools()` function-style factory, consistent with vite-devtools' `DevTools()` API. Includes **`nested-react-app/`** (workspace package): a **second** Rspack dev server without DevTools, started from the **Launcher** into **Terminals** (`pnpm exec rspack serve`, cwd = nested app). **`openUrlAfterLaunch`** in `rspack.config.mjs` controls what the **dock iframe** shows after launch (e.g. external **rspack.rs**, or **`/__rdt_nested__/`** + host **`devServer.proxy`** for same-origin local embed). `index.html` typically loads **`/devtools-inject.js`** via a devServer middleware that proxies the script from the DevTools port (**7821**).

### `examples/esm/` — Full (class-style API)
React app with hash-based routing:

| Route | Page | Purpose |
|-------|------|---------|
| `#/` | Home | Hero + demo components (Counter, Todo, etc.) |
| `#/devtools` | DevToolsDemo | RPC connection status, session inspection, activity log |
| `#/explorer` | FileExplorer | Module browser with search, details, source code |

Both playgrounds load the dock inject script from the DevTools server, providing the same embedded DevTools experience as vite-devtools' floating dock.

## Build & Run

```bash
# Build core (required after changes to packages/core/)
pnpm build:core

# Build client UI
pnpm build:client

# Run playground (minimal, function-style API)
pnpm playground

# Or run an example
cd examples/esm && npx rspack serve
```

The DevTools server starts automatically via the plugin on first compilation.

## Comparison with vite-devtools

For detailed feature comparison and architecture mapping, see [references/vite-devtools-comparison.md](references/vite-devtools-comparison.md).

For data collection patterns and Rspack Stats API usage, see [references/data-collection.md](references/data-collection.md).

For dock injection implementation details, see [references/dock-injection.md](references/dock-injection.md).

For the complete RPC function reference, see [references/rpc-reference.md](references/rpc-reference.md).

For common issues and solutions, see [references/troubleshooting.md](references/troubleshooting.md).
