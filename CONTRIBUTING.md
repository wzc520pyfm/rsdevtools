# Contributing to Rspack DevTools

Thank you for your interest in contributing to Rspack DevTools!

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 9

### Setup

```bash
# Clone the repository
git clone https://github.com/wzc520pyfm/rsdevtools.git
cd rspack-devtools

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Development

```bash
# Watch mode for core plugin
pnpm --filter @rspack-devtools/core dev

# Development mode for client UI
pnpm --filter @rspack-devtools/client dev

# Build & test with example projects
pnpm examples:build
```

## Project Structure

```
rs-devtools/
├── packages/
│   ├── core/           # Rspack plugin, data collector, HTTP/WS server, terminal
│   │   ├── src/
│   │   │   ├── plugin.ts      # RspackDevToolsPlugin
│   │   │   ├── collector.ts   # Data extraction from Rspack Stats
│   │   │   ├── server.ts      # HTTP + WebSocket server
│   │   │   ├── rpc.ts         # RPC function implementations
│   │   │   ├── terminal.ts    # Terminal process management
│   │   │   ├── inject.ts      # Dock injection script
│   │   │   ├── types.ts       # TypeScript type definitions
│   │   │   └── index.ts       # Public API exports
│   │   └── client/            # Built client UI (output of client build)
│   └── client/         # Vue 3 SPA for the DevTools UI
│       ├── src/
│       │   ├── pages/         # Page components (Overview, Modules, etc.)
│       │   ├── composables/   # Shared composables (RPC, utilities)
│       │   ├── App.vue        # Root component
│       │   └── main.ts        # App entry with router
│       └── uno.config.ts      # UnoCSS configuration
└── examples/           # Demo Rspack projects (esm, commonjs, rspack2)
```

## Making Changes

### Adding a New Page

1. Create a new Vue component in `packages/client/src/pages/`
2. Add a route in `packages/client/src/main.ts`
3. Add a nav item in `packages/client/src/pages/SessionLayout.vue`

### Adding a New RPC Method

1. Define the type in `packages/core/src/types.ts` (both `ServerFunctions` and optionally `ClientFunctions`)
2. Implement the server-side handler in `packages/core/src/rpc.ts`
3. Call it from the client using `useRpc().call('method-name', args)`

### Adding New Data Collection

1. Add new data types in `packages/core/src/types.ts`
2. Add collection logic in `packages/core/src/collector.ts`
3. Include the data in the `BuildSession` interface
4. Create RPC methods to expose the data

## Code Style

- TypeScript for all source files
- Vue 3 Composition API with `<script setup>` for components
- UnoCSS for styling (prefer utility classes over custom CSS)
- Use `birpc` for all client-server communication

## Pull Requests

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure the project builds successfully (`pnpm build`)
5. Submit a pull request with a clear description

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
