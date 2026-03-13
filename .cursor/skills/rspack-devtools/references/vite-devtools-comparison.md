# vite-devtools vs rs-devtools: Architecture Mapping

How rs-devtools maps to vite-devtools concepts for feature parity.

## Architecture Mapping

| vite-devtools Concept | rs-devtools Equivalent | Notes |
|---|---|---|
| Vite Plugin (`configureServer`) | Rspack Plugin (`compiler.hooks.done`) | Rspack uses compiler hooks, not server hooks |
| `rolldown` module graph | `stats.toJson({ modules, reasons })` | Rspack Stats API replaces direct graph access |
| Nuxt-based client | Vue 3 + vue-router client | Simpler, no Nuxt dependency |
| `@vitejs/devtools-kit` context | `DataCollector` + `ServerFunctions` | No kit abstraction; direct implementation |
| `DevTools()` function factory | `RspackDevTools()` function factory | Both support function-style plugin API |
| `devtools.setup(ctx)` hook | `RspackDevToolsPlugin.apply(compiler)` | Plugin lifecycle differs fundamentally |
| `ctx.docks.register()` | Sidebar nav in client UI | No dock registry; pages are vue-router routes |
| `ctx.rpc.register(defineRpcFunction(...))` | `createBirpc(serverFunctions, ...)` | birpc directly, no defineRpcFunction wrapper |
| `ctx.views.hostStatic()` | `sirv(clientDistPath)` | Direct static serving |
| `ctx.rpc.sharedState` | WebSocket broadcast events | No built-in shared state; use RPC + events |
| `ctx.logs.add()` | Console + WebSocket events | Build-centric logging through stats |

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
| Floating dock button | ✅ | ✅ | `inject.ts` — floating ⚡ button |
| Embedded iframe panel | ✅ | ✅ | `inject.ts` — resizable iframe |
| Pop-out standalone mode | ✅ | ✅ | Direct URL access to DevTools server |
| Drag-to-dock positioning | ✅ | ✅ | `inject.ts` — snap to screen edges |
| State persistence | ✅ | ✅ | localStorage for position/size/open state |
| Keyboard shortcut | ✅ | ✅ | Alt+D toggle |
| Multi-session support | ✅ | ✅ | Session list + switcher |

### Developer Features

| Feature | vite-devtools | rs-devtools | Implementation |
|---------|:---:|:---:|---|
| Open in editor | ✅ | ✅ | `launch-editor` via RPC |
| Open in finder | ✅ | ✅ | `child_process.exec('open')` via RPC |
| Terminal host | ✅ | ✅ | `terminal.ts` — `child_process.spawn` with PTY |
| RPC system | ✅ | ✅ | `birpc` with 20 server functions |
| Real-time updates | ✅ | ✅ | WebSocket broadcast on build completion |
| WebSocket reconnection | ✅ | ✅ | Client-side auto-reconnect with buffering |

## Key Differences

### Data Source
- **vite-devtools**: Hooks into Vite/Rolldown's module graph directly via `ModuleGraph`, gets transform timing from plugin hooks
- **rs-devtools**: Uses `stats.toJson()` which provides a snapshot after compilation; no per-transform timing data

### Plugin System
- **vite-devtools**: Has `@vitejs/devtools-kit` with `defineRpcFunction()`, typed shared state, dock registry, log system
- **rs-devtools**: Direct implementation without a kit abstraction; RPC functions defined as object methods in `rpc.ts`

### Client Framework
- **vite-devtools**: Nuxt-based client with auto-imports, Nuxt modules, and Nuxt DevTools integration
- **rs-devtools**: Vanilla Vue 3 + vue-router + Vite; simpler but less framework support

## Migration Guide: Adding a vite-devtools Feature

1. **Identify the feature** in vite-devtools source (usually in `packages/vite/` or `packages/rolldown/`)
2. **Map the data source**: Find where vite-devtools gets data → find equivalent in Rspack Stats API
3. **Add server-side**: Add RPC handler in `rpc.ts`, types in `types.ts`, data extraction in `collector.ts`
4. **Add client-side**: Create Vue page in `packages/client/src/pages/`, register route
5. **Test**: Build core (`pnpm build:core`), restart example (`npx rspack serve`)
