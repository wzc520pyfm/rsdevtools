// Re-export build analysis types from @rspack-devtools/rspack for backward compatibility
export type {
  BuildSession,
  ModuleData,
  ModuleReason,
  ChunkData,
  ChunkOrigin,
  AssetData,
  AssetInfo,
  EntrypointData,
  PluginData,
  PackageData,
  PackageInstance,
  BuildError,
  BuildWarning,
  GraphNode,
  GraphEdge,
  SessionComparison,
  CompareMetric,
  FileEntry,
  FileDetail,
  FileExplorerInfo,
} from '@rspack-devtools/rspack'

// ---- Core-specific types ----

export interface ConnectionMeta {
  backend: 'websocket'
  websocket: number
}

export interface RspackDevToolsOptions {
  port?: number
  host?: string
  open?: boolean
  clientDir?: string
  /**
   * Whether to register built-in DevTools panels (Build Analysis, File Explorer, Terminal, Self Inspect).
   * Set to `false` if you only want third-party plugin docks.
   * @default true
   */
  builtinDevTools?: boolean
}

// ---- Terminal ----

export interface TerminalSession {
  id: string
  name: string
  command: string
  cwd: string
  status: 'running' | 'exited'
  exitCode?: number
  buffer: string
  startTime: number
  endTime?: number
}

// ---- RPC Interfaces ----

export interface ServerFunctions {
  [key: string]: (...args: any[]) => any
}

export interface ClientFunctions {
  'rspack:build-started': () => void
  'rspack:build-completed': (session: { id: string; timestamp: number }) => void
  'rspack:terminal-output': (args: { id: string; data: string }) => void
  'rspack:terminal-exit': (args: { id: string; exitCode: number }) => void
}
