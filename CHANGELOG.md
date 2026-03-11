# Changelog

## 0.0.1 (2026-03-11)

### Features

#### Analysis
- **Build Overview**: Comprehensive dashboard with build duration, module/chunk/asset/plugin/package counts, total output size, duplicate package warnings, modules by type breakdown, largest modules, largest packages, plugins summary, and entrypoints
- **Module Inspector**: Browse modules with fuzzy search, group filtering (node_modules, styles, components, typescript, javascript, json, images), sorting by size/name/depth, and detailed side panel with Info/Deps/Code tabs
- **Module Graph**: Interactive D3 force-directed graph with zoom/pan/drag, color-coded nodes by type, adjustable max nodes (50-1000), hover tooltips. Multiple views: Graph, List, Detailed List, Folder
- **Plugins**: View all registered Rspack plugins with search, pipeline visualization, detail panel with execution order and type classification (built-in vs custom)

#### Build Output
- **Chunk Viewer**: Multiple views (List, Treemap, Sunburst, Flamegraph), filters (all/entry/initial/dynamic), expandable details with origins, parents, children, output files
- **Asset Browser**: Multiple views (List, Folder, Treemap, Sunburst, Flamegraph), size visualization bars, detail panel with related chunks and modules
- **Packages**: Analyze node_modules dependencies with Table/Treemap/Duplicates views, direct/transitive filtering, duplicate package detection, real package version extraction from package.json

#### Diagnostics
- **Errors & Warnings**: Organized view with Errors/Warnings tabs, module source location, expandable details, open-in-editor support

#### Tools
- **Terminal Host**: Built-in terminal to run commands directly from the DevTools UI with real-time output streaming
- **Open in Editor**: Click to open any module or file in your code editor (supports launch-editor)
- **Open in Finder**: Reveal files in the system file manager (macOS/Windows/Linux)

#### Cross-cutting
- **Session List**: Browse all build sessions with timestamp, duration, and hash
- **Session Compare**: Select two build sessions to compare 11 metrics side-by-side (duration, bundle size, module count, chunks, assets, errors, warnings, plugins, packages, duplicate packages, initial JS size)
- **Embedded Mode (Dock)**: Inject DevTools as a floating panel in your application with resizable height
- **Real-time Updates**: WebSocket-based RPC with message buffering and automatic reconnection

### Architecture
- Monorepo with `@rspack-devtools/core` (plugin + server) and `@rspack-devtools/client` (Vue 3 SPA)
- 20 RPC methods over birpc + WebSocket
- Data collection from Rspack Stats API with `compiler.hooks.done`
- HTTP server with sirv for static file serving
- Client built with Vite + Vue 3 + Vue Router + UnoCSS + D3.js + Fuse.js
