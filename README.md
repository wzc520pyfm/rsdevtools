# Rspack DevTools

A comprehensive set of developer tools for visualizing and analyzing your Rspack build process. Inspired by [Vite DevTools](https://vite-devtools.netlify.app/).

## Features

### Analysis
- **Build Overview**: Build duration, module/chunk/asset/plugin/package counts, total output size, entrypoints, duplicate package warnings
- **Module Inspector**: Browse all modules with search, group filtering (node_modules, styles, components, etc.), sorting, and detailed side panel with Info/Deps/Code tabs
- **Module Graph**: Interactive D3 force-directed graph of module dependencies, color-coded by type with zoom/pan/drag
- **Plugins**: View all registered Rspack plugins with search

### Build Output
- **Chunk Viewer**: List and Treemap views with entry/initial/dynamic filters, expandable details including origins, parents, and children
- **Asset Browser**: List, Folder, and Treemap views with size visualization, detail panel showing related chunks and modules
- **Packages**: Analyze node_modules dependencies with Table/Treemap/Duplicates views, direct/transitive filtering, duplicate package detection

### Diagnostics
- **Errors & Warnings**: Organized view with Errors/Warnings tabs, open-in-editor support

### Tools
- **Terminal Host**: Built-in terminal to run commands directly from the DevTools UI
- **Open in Editor**: Click to open any module or file in your code editor
- **Open in Finder**: Reveal files in the system file manager

### Cross-cutting
- **Session Compare**: Select two build sessions to compare metrics side-by-side (duration, bundle size, module count, etc.)
- **Embedded Mode (Dock)**: Inject DevTools as a floating panel in your application via `</body>` script injection
- **Real-time Updates**: WebSocket-based RPC with automatic reconnection; build completion notifications push to the UI

### Debug logging (aligned with Vite DevTools)

Rspack DevTools uses [`obug`](https://github.com/unjs/obug) with the `DEBUG` env variable, similar to Vite DevTools (`vite:devtools:*`).

- **Namespaces**: `rspack:devtools:context:setup`, `rspack:devtools:rpc:broadcast`, `rspack:devtools:rpc:state:changed`, `rspack:devtools:rpc:invoked`
- **Enable**: `DEBUG=rspack:devtools:*` (or narrow, e.g. `DEBUG=rspack:devtools:rpc:*`)

When `Launcher` / `ctx.terminals.run()` starts a **nested** dev process that also loads DevTools and inherits `DEBUG`, verbose logs will appear in the **Terminals** panel (same idea as nested `vite dev` under Vite DevTools).

## Quick Start

### 1. Install

```bash
pnpm add -D rsdevtools
```

### 2. Configure

Add `RspackDevToolsPlugin` to your rspack config:

```js
// rspack.config.mjs (ESM)
import { RspackDevToolsPlugin } from 'rsdevtools'

// rspack.config.js (CJS)
const { RspackDevToolsPlugin } = require('rsdevtools')

export default {
  // ... your config
  plugins: [
    new RspackDevToolsPlugin({
      port: 7821,       // optional, default: 7821
      host: 'localhost', // optional
      open: true,        // auto-open browser
    }),
  ],
}
```

### 3. Build

```bash
pnpm build
```

After the build completes, the DevTools server starts and prints the URL:

```
⬢ Rspack DevTools
├─ Local:    http://localhost:7821
├─ Session:  build-1-1773241186361
├─ Modules:  11  Chunks: 1  Assets: 2
├─ Plugins:  3   Packages: 8
└─ Duration: 178ms
```

Open the URL to explore your build.

## Architecture

```
rs-devtools/
├── packages/
│   ├── core/          # @rspack-devtools/core - Rspack plugin + server + dock injection
│   │   └── src/
│   │       ├── client-inject/  # Dock UI (TypeScript, built as IIFE bundle)
│   │       ├── inject.ts       # Serves the dock bundle with runtime config
│   │       ├── server.ts       # HTTP + WebSocket server
│   │       └── plugin.ts       # RspackDevToolsPlugin
│   ├── rspack/        # @rspack-devtools/rspack - Vue 3 DevTools UI
│   ├── kit/           # @rspack-devtools/kit - Shared types and dock system
│   ├── rpc/           # @rspack-devtools/rpc - RPC layer
│   └── self-inspect/  # @rspack-devtools/self-inspect - Self-inspection panel
├── playground/        # Dev playground (Rspack app with DevTools enabled)
└── example/           # Minimal example project
```

### Core Plugin (`@rspack-devtools/core`)

- **RspackDevToolsPlugin**: Rspack plugin that hooks into `compiler.hooks.done` to collect build stats
- **DataCollector**: Extracts modules, chunks, assets, entrypoints, errors, warnings, plugins, and packages from stats
- **Server**: HTTP + WebSocket server using sirv + ws
- **RPC**: birpc-based RPC layer for real-time client-server communication
- **TerminalHost**: Process spawning and output streaming for built-in terminal
- **Dock Injection**: The `client-inject/` directory contains the floating dock UI as proper TypeScript source. It is built into a standalone IIFE bundle by tsup, and at runtime the server prepends a config object before serving it to the browser

### DevTools UI (`@rspack-devtools/rspack`)

- **Vue 3 + Nuxt** SPA with module inspector, chunk/asset viewers, and session comparison
- **UnoCSS** for styling with dark mode support
- **D3.js** for module graph visualization
- **Fuse.js** for fuzzy search across modules, plugins, packages, and assets
- Built output is served by the core server

## RPC Methods

| Method | Description |
|--------|-------------|
| `rspack:list-sessions` | List all build sessions |
| `rspack:get-session` | Get full session data |
| `rspack:get-modules` | Get all modules for a session |
| `rspack:get-module-info` | Get detailed info for a module |
| `rspack:get-chunks` | Get all chunks |
| `rspack:get-chunk-info` | Get detailed chunk info |
| `rspack:get-assets` | Get all assets |
| `rspack:get-asset-details` | Get asset details with related modules |
| `rspack:get-entrypoints` | Get entrypoints |
| `rspack:get-plugins` | Get registered plugins |
| `rspack:get-packages` | Get analyzed packages from node_modules |
| `rspack:get-package-details` | Get package details with instances |
| `rspack:get-module-graph` | Get module dependency graph (nodes + edges) |
| `rspack:compare-sessions` | Compare two sessions' metrics |
| `rspack:get-errors` | Get build errors |
| `rspack:get-warnings` | Get build warnings |
| `rspack:open-in-editor` | Open file in editor |
| `rspack:open-in-finder` | Reveal file in finder |
| `rspack:get-terminals` | List terminal sessions |
| `rspack:run-terminal` | Run a command in a new terminal |

## Development

### Prerequisites

```bash
pnpm install
```

### Full Build

```bash
pnpm build
```

### Running the Playground

```bash
pnpm playground
```

This starts two services:

- **Rspack Dev Server** at `http://localhost:9300` — a sample app with the DevTools dock injected
- **DevTools Server** at `http://localhost:7821` — the DevTools UI itself

Open `http://localhost:9300` and you'll see the floating dock bar on the left edge. Click the lightning icon to open the DevTools panel. You can also visit `http://localhost:7821` directly for the full-page DevTools UI.

### Development Workflow

| What you're changing | Command | Where to verify |
|---|---|---|
| Dock inject logic (`packages/core/src/client-inject/`) | `pnpm build:core`, then refresh `localhost:9300` | Floating dock bar on `localhost:9300` |
| Core server/plugin (`packages/core/src/`) | `pnpm build:core`, then restart `pnpm playground` | `localhost:9300` + `localhost:7821` |
| DevTools UI (`packages/rspack/`) | `pnpm dev:rspack` (watch mode) | Refresh the DevTools panel or `localhost:7821` |
| RPC layer (`packages/rpc/`) | `pnpm build:rpc`, then rebuild dependent packages | — |
| Kit (`packages/kit/`) | `pnpm build:kit`, then rebuild dependent packages | — |

### Package Build Commands

```bash
pnpm build:core          # @rspack-devtools/core
pnpm build:rspack        # @rspack-devtools/rspack (UI)
pnpm build:rpc           # @rspack-devtools/rpc
pnpm build:kit           # @rspack-devtools/kit
pnpm build:self-inspect  # @rspack-devtools/self-inspect
pnpm dev:rspack          # Watch mode for the DevTools UI
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | `number` | `7821` | Port for the DevTools server |
| `host` | `string` | `'localhost'` | Host for the DevTools server |
| `open` | `boolean` | `false` | Auto-open browser after build |
| `clientDir` | `string` | built-in | Path to custom client dist directory |

## Comparison with Vite DevTools

| Feature | Vite DevTools | Rspack DevTools |
|---------|--------------|-----------------|
| Plugin system | Vite plugin with `devtools.setup` | Rspack plugin with `compiler.hooks.done` |
| RPC | birpc over WebSocket | birpc over WebSocket |
| UI framework | Vue-based SPA | Vue 3 SPA |
| Data source | Rolldown build events/logs | Rspack Stats API |
| Module graph | D3 visualization | D3 force-directed graph |
| Dock system | Multi-panel dock UI | Embedded iframe dock + standalone |
| Plugins page | Plugin list with hooks | Plugin list with search |
| Packages page | node_modules analysis | Package analysis with duplicate detection |
| Session compare | Side-by-side comparison | 11-metric comparison view |
| Terminal | Built-in terminal | Built-in terminal host |
| Open in editor | Launch editor | Launch editor + finder |
| Treemap views | Chunks/Assets treemap | Chunks/Assets/Packages treemap |

## License

MIT
