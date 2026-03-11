# Rspack DevTools

A comprehensive set of developer tools for visualizing and analyzing your Rspack build process. Inspired by [Vite DevTools](https://vite-devtools.netlify.app/).

## Features

- **Build Overview**: Build duration, module/chunk/asset counts, total output size, and entrypoints at a glance
- **Module Inspector**: Browse all modules with search, filtering by group (node_modules, styles, scripts, etc.), sorting, and detailed module info panel
- **Chunk Viewer**: Visualize chunks with size bars, entry/initial badges, and expandable details
- **Asset Browser**: List all output assets with size visualization and search
- **Module Graph**: Interactive D3 force-directed graph of module dependencies, color-coded by type
- **Errors & Warnings**: Organized view of build errors and warnings

## Quick Start

### 1. Install

```bash
pnpm add -D @rspack-devtools/core
```

### 2. Configure

Add `RspackDevToolsPlugin` to your rspack config:

```js
// rspack.config.mjs
import { RspackDevToolsPlugin } from '@rspack-devtools/core'

export default {
  // ... your config
  plugins: [
    new RspackDevToolsPlugin({
      port: 7821,    // optional, default: 7821
      host: 'localhost', // optional
      open: true,    // auto-open browser
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
├─ Local:   http://localhost:7821
├─ Session: build-1-1773241186361
└─ Modules: 11  Chunks: 1  Assets: 2
```

Open the URL to explore your build.

## Architecture

```
rs-devtools/
├── packages/
│   ├── core/        # @rspack-devtools/core - Rspack plugin + data collector + server
│   └── client/      # @rspack-devtools/client - Vue 3 standalone UI (builds into core/client/)
└── example/         # Demo project
```

### Core Plugin (`@rspack-devtools/core`)

- **RspackDevToolsPlugin**: Rspack plugin that hooks into `compiler.hooks.done` to collect build stats
- **DataCollector**: Extracts modules, chunks, assets, entrypoints, errors, and warnings from stats
- **Server**: HTTP + WebSocket server using h3 + sirv + ws
- **RPC**: birpc-based RPC layer for real-time client-server communication

### Client UI (`@rspack-devtools/client`)

- **Vue 3 + Vue Router** SPA
- **UnoCSS** for styling
- **D3.js** for module graph visualization
- **Fuse.js** for fuzzy search
- Built output is bundled into `packages/core/client/` for serving by the plugin

## Development

```bash
# Install dependencies
pnpm install

# Build everything
pnpm build

# Dev mode for client UI
pnpm dev:client

# Build the example
pnpm example:build
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | `number` | `7821` | Port for the DevTools server |
| `host` | `string` | `'localhost'` | Host for the DevTools server |
| `open` | `boolean` | `false` | Auto-open browser after build |
| `clientDir` | `string` | built-in | Path to custom client dist directory |

## Comparison with Vite DevTools

This project follows the same architectural patterns as Vite DevTools:

| Feature | Vite DevTools | Rspack DevTools |
|---------|--------------|-----------------|
| Plugin system | Vite plugin with `devtools.setup` | Rspack plugin with `compiler.hooks.done` |
| RPC | birpc over WebSocket | birpc over WebSocket |
| UI | Nuxt app (embedded/standalone) | Vue 3 SPA (standalone) |
| Data source | Rolldown build events/logs | Rspack Stats API |
| Dock system | Multi-panel dock UI | Sidebar navigation |
| Module graph | D3 visualization | D3 force-directed graph |

## License

MIT
