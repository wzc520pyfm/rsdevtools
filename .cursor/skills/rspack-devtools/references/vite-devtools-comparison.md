# vite-devtools vs rs-devtools: Architecture Mapping

How rs-devtools maps to vite-devtools concepts for feature parity.

## Architecture Mapping

| vite-devtools Concept | rs-devtools Equivalent | Notes |
|---|---|---|
| Vite Plugin (`configureServer`) | Rspack Plugin (`compiler.hooks.done`) | Rspack uses compiler hooks, not server hooks |
| `rolldown` module graph | `stats.toJson({ modules, reasons })` | Rspack Stats API replaces direct graph access |
| Nuxt-based client | Vue 3 + vue-router client | Simpler, no Nuxt dependency |
| `@vitejs/devtools-kit` context | `@rspack-devtools/kit` context | Full kit with types, RPC, constants |
| `DevTools()` function factory | `RspackDevTools()` function factory | Both support function-style plugin API |
| `devtools.setup(ctx)` hook | `devtools.setup(ctx)` hook | Same pattern — plugins register docks/RPC |
| `ctx.docks.register()` | `ctx.docks.register()` | Full dock registry with all entry types |
| `ctx.rpc.register(defineRpcFunction(...))` | `ctx.rpc.register(defineRpcFunction(...))` | Same pattern with `defineRpcFunction` utility |
| `ctx.views.hostStatic()` | `ctx.views.hostStatic()` | Static hosting for plugin UIs |
| `ctx.rpc.sharedState` | `ctx.rpc.sharedState` | SharedState host with get/mutate/patch/on |
| `ctx.logs.add()` | `ctx.logs.add()` | Full log system with incremental sync |
| `ctx.terminals` | `ctx.terminals` | Terminal host with session management |
| Web Component embedded client | Vanilla JS inject script | Different rendering approach, same capabilities |

## Feature Parity Checklist

### Build Visualization

| Feature | vite-devtools | rs-devtools | Implementation |
|---------|:---:|:---:|---|
| Build overview | ✅ | ✅ | `Overview.vue` — hash, duration, counts |
| Module list | ✅ | ✅ | `Modules.vue` — sortable, searchable (Fuse.js) |
| Module dependency graph | ✅ | ✅ | `ModuleGraph.vue` — D3.js force-directed graph |
| Chunk analysis | ✅ | ✅ | `Chunks.vue` — chunk list with module breakdown |
| Asset list | ✅ | ✅ | `Assets.vue` — size, type, chunk association |
| Plugin list | ✅ | ✅ | `Plugins.vue` — registered plugin names |
| Build timeline | ✅ | ✅ | `Timeline.vue` — module timing flamegraph |
| Bundle treemap | ✅ | ✅ | `BundleAnalysis.vue` — D3 treemap + sunburst |
| Error/warning display | ✅ | ✅ | `Errors.vue` — formatted errors with stack |
| NPM package analysis | ✅ | ✅ | `Packages.vue` — extracted from node_modules paths |
| Source code viewer | ✅ | ✅ | Module detail panel with syntax highlighting |
| Module search | ✅ | ✅ | Fuse.js fuzzy search across modules |

### DevTools Integration

| Feature | vite-devtools | rs-devtools | Implementation |
|---------|:---:|:---:|---|
| Floating dock button | ✅ | ✅ | `inject.ts` — floating dock bar |
| Embedded iframe panel | ✅ | ✅ | `inject.ts` — resizable panel |
| Pop-out standalone mode | ✅ | ✅ | Direct URL access / popup entry |
| Drag-to-dock positioning | ✅ | ✅ | `inject.ts` — snap to screen edges |
| State persistence | ✅ | ✅ | localStorage for position/size/open state |
| Keyboard shortcut | ✅ | ✅ | Alt+D toggle |
| Multi-session support | ✅ | ✅ | Session list + switcher |

### Dock Entry Types

| Entry Type | vite-devtools | rs-devtools | Implementation |
|------------|:---:|:---:|---|
| `iframe` | ✅ | ✅ | Load URL in iframe panel |
| `action` | ✅ | ✅ | Client script execution via imports map |
| `custom-render` | ✅ | ✅ | Client script loads renderer into DOM panel |
| `launcher` | ✅ | ✅ | Launcher UI with status + on-launch RPC |
| `~builtin` | ✅ | ✅ | Core entries: ~logs, ~settings, ~popup |

### Core Builtin Panels

| Panel | vite-devtools | rs-devtools | Implementation |
|-------|:---:|:---:|---|
| Logs & Notifications | ✅ | ✅ | `DockLogs.vue` — search, filters, detail panel |
| Settings | ✅ | ✅ | `DockSettings.vue` — dock visibility toggle |
| Terminals | ✅ | ✅ | `DockTerminal.vue` — command execution |
| Popup | ✅ | ✅ | Window.open to standalone mode |
| Toast overlay | ✅ | ✅ | Inject script toast for `notify: true` logs |
| Self Inspect | ✅ | ✅ | `DockSelfInspect.vue` — RPC, docks, scripts, plugins |

### Logs System

| Feature | vite-devtools | rs-devtools | Implementation |
|---------|:---:|:---:|---|
| Incremental sync | ✅ | ✅ | `lastModified` + `removals` + `_clock` version |
| Server-side add/update/remove/clear | ✅ | ✅ | `DevToolsLogsHost` with event emitters |
| Client-side add/remove/clear via RPC | ✅ | ✅ | `devtoolskit:internal:logs:*` RPC methods |
| Client logs API for plugins | ✅ | ✅ | `createClientLogsClient()` in kit/client |
| Toast notifications | ✅ | ✅ | Inject script WebSocket + toast overlay |
| Auto-delete timers | ✅ | ✅ | `autoDelete` field on log entries |
| FIFO eviction (MAX_ENTRIES=1000) | ✅ | ✅ | Oldest entry removed when limit reached |

### Developer Features

| Feature | vite-devtools | rs-devtools | Implementation |
|---------|:---:|:---:|---|
| Open in editor | ✅ | ✅ | `launch-editor` via RPC |
| Open in finder | ✅ | ✅ | `child_process.exec('open')` via RPC |
| Terminal host | ✅ | ✅ | `terminal.ts` — `child_process.spawn` with PTY |
| RPC system | ✅ | ✅ | `birpc` with defineRpcFunction pattern |
| Real-time updates | ✅ | ✅ | WebSocket broadcast on build/logs/terminals |
| WebSocket reconnection | ✅ | ✅ | Client-side auto-reconnect with buffering |
| File explorer | ✅ | ✅ | `DockExplorer.vue` — file tree with read/write |
| Session compare | ✅ | ✅ | `Compare.vue` — multi-session metrics diff |
| Client imports map | ✅ | ✅ | `/.devtools/client-imports.js` endpoint |
| Shared state | ✅ | ✅ | `rpc.sharedState.get()` with `mutate/patch/on` |

### Plugin System

| Feature | vite-devtools | rs-devtools | Implementation |
|---------|:---:|:---:|---|
| `devtools.setup(ctx)` hook | ✅ | ✅ | Plugin discovery + context injection |
| `devtools.capabilities` | ✅ | ✅ | `dev`/`build` mode capability filtering |
| `defineRpcFunction` helper | ✅ | ✅ | `@rspack-devtools/kit` utility |
| `ctx.docks.register()` | ✅ | ✅ | Full dock registry |
| `ctx.views.hostStatic()` | ✅ | ✅ | Serve plugin static files |

## Key Differences

### Data Source
- **vite-devtools**: Hooks into Vite/Rolldown's module graph directly via `ModuleGraph`, gets transform timing from plugin hooks
- **rs-devtools**: Uses `stats.toJson()` which provides a snapshot after compilation; no per-transform timing data

### Client Rendering
- **vite-devtools**: Web Component-based embedded client using Vue + ShadowDOM
- **rs-devtools**: Vanilla JS inject script with iframe-based panel content; builtin panels are client routes loaded in iframes

### Client Framework
- **vite-devtools**: Nuxt-based client with auto-imports, Nuxt modules
- **rs-devtools**: Vanilla Vue 3 + vue-router + Vite; simpler but less framework support

### Launcher → iframe (nested dev server)
- **vite-devtools playground** (`packages/core/playground/vite.config.ts`): runs `vite dev` in a terminal for the demo, but after launch the dock iframe URL is set to **`https://antfu.me`**, not the nested local dev server — so it never hits cross-origin / `X-Frame-Options` between two local ports.
- **rs-devtools playground** (`playground/rspack.config.mjs`): same idea — terminal runs a light command (`node -v`), iframe opens **`https://rspack.rs/`**. For a **second local dev server** behind the dock, use **`openUrlAfterLaunch: '/__rdt_nested__/'`** plus host **`devServer.proxy`**; the inject client resolves `/__rdt_nested__/*` against `location.origin` (see `packages/core/src/client-inject/index.ts`).

### Not Supported (Rspack limitations)
- Per-transform timing data (Rspack does not expose individual transform hooks)
- Rolldown-specific build events (Rspack uses stats.toJson() snapshots)
- Vite middleware integration (rs-devtools runs on its own HTTP server)
