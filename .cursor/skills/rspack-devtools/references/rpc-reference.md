# RPC Reference

Complete reference for all server and client RPC functions in rs-devtools.

## Server Functions (24 total)

All server functions are defined in `packages/core/src/types.ts` and implemented in `packages/core/src/rpc.ts`.

### Build Session Management

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `rspack:list-sessions` | none | `{ id, timestamp, duration, hash }[]` | List all build sessions, sorted newest first |
| `rspack:get-session` | `{ session }` | `BuildSession \| null` | Get full session data by ID |
| `rspack:compare-sessions` | `{ sessions: string[] }` | `SessionComparison \| null` | Compare metrics across 2+ sessions |

### Module Data

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `rspack:get-modules` | `{ session }` | `ModuleData[]` | All modules in a session |
| `rspack:get-module-info` | `{ session, module }` | `ModuleData \| null` | Single module with source and dependencies |
| `rspack:get-module-graph` | `{ session }` | `{ nodes, edges }` | Force-directed graph data for D3.js |

### Chunk & Asset Data

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `rspack:get-chunks` | `{ session }` | `ChunkData[]` | All chunks in a session |
| `rspack:get-chunk-info` | `{ session, chunk }` | `ChunkData \| null` | Single chunk details |
| `rspack:get-assets` | `{ session }` | `AssetData[]` | All output assets |
| `rspack:get-asset-details` | `{ session, asset }` | `AssetData \| null` | Single asset details |
| `rspack:get-entrypoints` | `{ session }` | `EntrypointData[]` | Entry point definitions |

### Build Info

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `rspack:get-errors` | `{ session }` | `BuildError[]` | Build errors with details |
| `rspack:get-warnings` | `{ session }` | `BuildWarning[]` | Build warnings |
| `rspack:get-plugins` | `{ session }` | `PluginData[]` | Registered plugin names |
| `rspack:get-packages` | `{ session }` | `PackageData[]` | NPM package analysis |
| `rspack:get-package-details` | `{ session, name }` | `PackageData \| null` | Package with duplicate info |

### Developer Tools

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `rspack:open-in-editor` | `{ path, line?, column? }` | `void` | Open file in editor (launch-editor) |
| `rspack:open-in-finder` | `{ path }` | `void` | Open file in OS file manager |
| `rspack:get-terminals` | none | `TerminalSession[]` | List terminal sessions |
| `rspack:run-terminal` | `{ command, cwd?, name? }` | `string` (session ID) | Spawn terminal command |

### File Explorer

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `rspack:list-files` | `{ targetDir? }` | `FileEntry[]` | List files in project src/ |
| `rspack:read-file` | `{ path }` | `FileDetail \| null` | Read file content (sandboxed to src/) |
| `rspack:write-file` | `{ path, content }` | `void` | Write file content (sandboxed to src/) |
| `rspack:get-file-info` | none | `FileExplorerInfo` | Get explorer root directory |

## Client Functions (broadcast events)

Events sent from server to all connected clients via `server.broadcast()`:

| Method | Payload | When |
|--------|---------|------|
| `rspack:build-started` | none | Build begins (not yet implemented in plugin) |
| `rspack:build-completed` | `{ id, timestamp }` | Build finishes, new session available |
| `rspack:terminal-output` | `{ id, data }` | Terminal emits stdout/stderr |
| `rspack:terminal-exit` | `{ id, exitCode }` | Terminal process exits |

## Client-Side RPC Setup

The client uses `birpc` with WebSocket reconnection in `packages/client/src/composables/rpc.ts`:

```ts
import { createBirpc } from 'birpc'

const ws = new WebSocket(`ws://${host}:${port}`)
const rpc = createBirpc<ServerFunctions, ClientFunctions>(clientHandlers, {
  post: (data) => ws.send(data),
  on: (handler) => ws.addEventListener('message', (e) => handler(e.data)),
  serialize: JSON.stringify,
  deserialize: JSON.parse,
})
```

### Connection Buffering

The client implements `waitForConnection()` to buffer RPC calls until the WebSocket is `OPEN`:

```ts
function waitForConnection(): Promise<void> {
  if (ws.readyState === WebSocket.OPEN) return Promise.resolve()
  return new Promise((resolve) => {
    ws.addEventListener('open', () => resolve(), { once: true })
  })
}
```

This prevents silent failures when RPC calls are made before the WebSocket handshake completes.

## Adding a New RPC Method

1. **`types.ts`** — Add method signature to `ServerFunctions`:
   ```ts
   'rspack:my-method': (args: { session: string }) => Promise<MyType[]>
   ```

2. **`rpc.ts`** — Add implementation in `createRpcFunctions()`:
   ```ts
   'rspack:my-method': async ({ session }) => {
     const s = collector.sessions.get(session)
     return s ? computeResult(s) : []
   },
   ```

3. **Client page** — Call via rpc composable:
   ```vue
   <script setup>
   const { rpc } = useRpc()
   const data = await rpc.value['rspack:my-method']({ session: id })
   </script>
   ```

## Naming Convention

All RPC methods use `rspack:` prefix to avoid conflicts. Pattern: `rspack:<verb>-<noun>`.

Examples: `rspack:get-modules`, `rspack:list-sessions`, `rspack:open-in-editor`, `rspack:run-terminal`.
