// ---- Build Session ----

export interface BuildSession {
  id: string
  timestamp: number
  duration: number
  hash: string
  cwd: string
  errors: BuildError[]
  warnings: BuildWarning[]
  modules: ModuleData[]
  chunks: ChunkData[]
  assets: AssetData[]
  entrypoints: EntrypointData[]
  plugins: PluginData[]
  packages: PackageData[]
}

// ---- Modules ----

export interface ModuleData {
  id: string
  name: string
  size: number
  chunks: string[]
  issuer: string | null
  issuerId: string | null
  reasons: ModuleReason[]
  depth: number | null
  type: string
  moduleType: string
  dependencies: string[]
  dependents: string[]
  source?: string
  builtCode?: string
}

export interface ModuleReason {
  moduleId: string | null
  moduleName: string | null
  type: string
  userRequest: string
}

// ---- Chunks ----

export interface ChunkData {
  id: string
  names: string[]
  size: number
  modules: string[]
  files: string[]
  entry: boolean
  initial: boolean
  rendered: boolean
  moduleCount: number
  parents: string[]
  children: string[]
  siblings: string[]
  origins: ChunkOrigin[]
}

export interface ChunkOrigin {
  module: string
  moduleIdentifier: string
  moduleName: string
  loc: string
  request: string
}

// ---- Assets ----

export interface AssetData {
  name: string
  size: number
  chunks: string[]
  chunkNames: string[]
  emitted: boolean
  info: Record<string, any>
  relatedChunks: string[]
  relatedModules: string[]
}

// ---- Entrypoints ----

export interface EntrypointData {
  name: string
  chunks: string[]
  assets: AssetInfo[]
  size: number
}

export interface AssetInfo {
  name: string
  size: number
}

// ---- Plugins ----

export interface PluginData {
  name: string
  index: number
}

// ---- Packages ----

export interface PackageData {
  name: string
  version: string
  size: number
  moduleCount: number
  modules: string[]
  isDirect: boolean
  isDuplicate: boolean
  instances: PackageInstance[]
  dependedBy: string[]
}

export interface PackageInstance {
  path: string
  version: string
  size: number
}

// ---- Errors / Warnings ----

export interface BuildError {
  message: string
  moduleId?: string
  moduleName?: string
  loc?: string
  details?: string
}

export interface BuildWarning {
  message: string
  moduleId?: string
  moduleName?: string
  loc?: string
  details?: string
}

// ---- Graph ----

export interface GraphNode {
  id: string
  name: string
  size: number
  type: string
  group: string
}

export interface GraphEdge {
  source: string
  target: string
  type: string
}

// ---- Session Compare ----

export interface SessionComparison {
  sessions: Array<{ id: string; timestamp: number; duration: number }>
  metrics: CompareMetric[]
}

export interface CompareMetric {
  label: string
  values: number[]
  unit: string
  type: 'size' | 'count' | 'duration'
}

// ---- Server ----

export interface ConnectionMeta {
  backend: 'websocket'
  websocket: number
}

export interface RspackDevToolsOptions {
  port?: number
  host?: string
  open?: boolean
  clientDir?: string
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
  'rspack:list-sessions': () => Promise<Array<{ id: string; timestamp: number; duration: number; hash: string }>>
  'rspack:get-session': (args: { session: string }) => Promise<BuildSession | null>
  'rspack:get-modules': (args: { session: string }) => Promise<ModuleData[]>
  'rspack:get-module-info': (args: { session: string; module: string }) => Promise<ModuleData | null>
  'rspack:get-chunks': (args: { session: string }) => Promise<ChunkData[]>
  'rspack:get-chunk-info': (args: { session: string; chunk: string }) => Promise<ChunkData | null>
  'rspack:get-assets': (args: { session: string }) => Promise<AssetData[]>
  'rspack:get-asset-details': (args: { session: string; asset: string }) => Promise<AssetData | null>
  'rspack:get-entrypoints': (args: { session: string }) => Promise<EntrypointData[]>
  'rspack:get-errors': (args: { session: string }) => Promise<BuildError[]>
  'rspack:get-warnings': (args: { session: string }) => Promise<BuildWarning[]>
  'rspack:get-module-graph': (args: { session: string }) => Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }>
  'rspack:get-plugins': (args: { session: string }) => Promise<PluginData[]>
  'rspack:get-packages': (args: { session: string }) => Promise<PackageData[]>
  'rspack:get-package-details': (args: { session: string; name: string }) => Promise<PackageData | null>
  'rspack:compare-sessions': (args: { sessions: string[] }) => Promise<SessionComparison | null>
  'rspack:open-in-editor': (args: { path: string; line?: number; column?: number }) => Promise<void>
  'rspack:open-in-finder': (args: { path: string }) => Promise<void>
  'rspack:get-terminals': () => Promise<TerminalSession[]>
  'rspack:run-terminal': (args: { command: string; cwd?: string; name?: string }) => Promise<string>
}

export interface ClientFunctions {
  'rspack:build-started': () => void
  'rspack:build-completed': (session: { id: string; timestamp: number }) => void
  'rspack:terminal-output': (args: { id: string; data: string }) => void
  'rspack:terminal-exit': (args: { id: string; exitCode: number }) => void
}
