# Data Collection Patterns

How rs-devtools extracts build data from Rspack's Stats API and transforms it into structured sessions.

## Stats Configuration

The plugin calls `stats.toJson()` with these options in `plugin.ts`:

```ts
const statsJson = stats.toJson({
  all: false,
  hash: true,          // Build hash
  timings: true,       // Compilation duration
  modules: true,       // All module info
  chunks: true,        // Chunk data
  assets: true,        // Output assets
  entrypoints: true,   // Entry point → chunk mapping
  errors: true,        // Build errors
  errorDetails: true,  // Detailed error info
  errorStack: true,    // Error stack traces
  warnings: true,      // Build warnings
  reasons: true,       // Why each module was included (dependency graph)
  ids: true,           // Numeric IDs for modules/chunks
  chunkModules: true,  // Modules within each chunk
  nestedModules: true, // Modules within concatenated modules
  chunkOrigins: true,  // How each chunk was created
  source: true,        // Module source code
})
```

## BuildSession Interface

```ts
interface BuildSession {
  id: string                    // UUID
  timestamp: number             // Unix timestamp
  hash: string                  // Build hash from stats
  duration: number              // Compilation time (ms)
  modules: ModuleInfo[]         // Transformed module data
  chunks: ChunkInfo[]           // Chunk information
  assets: AssetInfo[]           // Output assets
  entrypoints: EntrypointInfo[] // Entry points
  errors: ErrorInfo[]           // Build errors
  warnings: WarningInfo[]       // Build warnings
  plugins: string[]             // Plugin names from compiler.options
  packages: PackageInfo[]       // NPM packages extracted from module paths
  moduleGraph: ModuleGraphData  // Pre-computed graph edges
}
```

## DataCollector Responsibilities

`collector.ts` transforms raw stats JSON into `BuildSession`:

1. **Module normalization**: Extracts module identifier, size, source, and normalizes paths relative to CWD
2. **Dependency graph**: Builds `{ source, target }` edges from `module.reasons`
3. **Package extraction**: Identifies `node_modules/<package>` patterns, groups by package name and version
4. **Chunk analysis**: Maps chunks to their constituent modules and origin entries
5. **Session management**: Stores sessions in a `Map<string, BuildSession>`, provides `getSession()`, `listSessions()`

## Module Info Transformation

```ts
interface ModuleInfo {
  id: string           // Module identifier (relative path)
  name: string         // Short name
  size: number         // Module size in bytes
  type: string         // 'javascript/auto', 'css', etc.
  chunks: string[]     // Chunk IDs containing this module
  issuer: string | null // Parent module that imported this
  reasons: ReasonInfo[] // Why this module was included
  source?: string       // Raw source code (when stats.source=true)
  dependencies: string[] // Outgoing dependency module IDs
}
```

## Package Extraction Pattern

```ts
function extractPackages(modules: ModuleInfo[]): PackageInfo[] {
  const pkgMap = new Map<string, PackageInfo>()
  for (const mod of modules) {
    const match = mod.id.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/)
    if (match) {
      const name = match[1]
      if (!pkgMap.has(name)) {
        pkgMap.set(name, { name, modules: [], totalSize: 0 })
      }
      const pkg = pkgMap.get(name)!
      pkg.modules.push(mod.id)
      pkg.totalSize += mod.size
    }
  }
  return Array.from(pkgMap.values())
}
```

## Rspack Stats API Gotchas

| Issue | Workaround |
|-------|-----------|
| `stats.toJson()` can be slow with `source: true` on large projects | Consider making source optional, fetch on demand via `rspack:get-module-info` |
| `module.identifier` includes loader prefix (e.g., `builtin:swc-loader!./file.js`) | Strip loader prefix: `id.replace(/^.*!/, '')` |
| `reasons` array can contain duplicates | Deduplicate by `{ moduleIdentifier, type }` |
| Some modules have no `issuer` (entry points) | Handle null issuer in graph building |
| `chunkModules` may duplicate top-level `modules` | Prefer top-level `modules`, use `chunkModules` only for chunk-specific views |

## Adding New Data Fields

1. Enable the stat option in `plugin.ts` `stats.toJson()` call
2. Add the field to the appropriate interface in `types.ts`
3. Extract and transform in `collector.ts` `collectFromStats()` method
4. Expose via RPC in `rpc.ts` if needed for client access
5. Display in a client page component
