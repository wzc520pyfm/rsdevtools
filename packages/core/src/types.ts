export interface BuildSession {
  id: string
  timestamp: number
  duration: number
  hash: string
  errors: BuildError[]
  warnings: BuildWarning[]
  modules: ModuleData[]
  chunks: ChunkData[]
  assets: AssetData[]
  entrypoints: EntrypointData[]
}

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
}

export interface ModuleReason {
  moduleId: string | null
  moduleName: string | null
  type: string
  userRequest: string
}

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
}

export interface AssetData {
  name: string
  size: number
  chunks: string[]
  chunkNames: string[]
  emitted: boolean
  info: Record<string, any>
}

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

export interface ConnectionMeta {
  backend: 'websocket'
  websocket: number
}

export interface RspackDevToolsOptions {
  port?: number
  host?: string
  open?: boolean
  /** Path to the pre-built client dist directory */
  clientDir?: string
}

export interface ServerFunctions {
  'rspack:list-sessions': () => Promise<Array<{ id: string; timestamp: number; duration: number; hash: string }>>
  'rspack:get-session': (args: { session: string }) => Promise<BuildSession | null>
  'rspack:get-modules': (args: { session: string }) => Promise<ModuleData[]>
  'rspack:get-module-info': (args: { session: string; module: string }) => Promise<ModuleData | null>
  'rspack:get-chunks': (args: { session: string }) => Promise<ChunkData[]>
  'rspack:get-chunk-info': (args: { session: string; chunk: string }) => Promise<ChunkData | null>
  'rspack:get-assets': (args: { session: string }) => Promise<AssetData[]>
  'rspack:get-entrypoints': (args: { session: string }) => Promise<EntrypointData[]>
  'rspack:get-errors': (args: { session: string }) => Promise<BuildError[]>
  'rspack:get-warnings': (args: { session: string }) => Promise<BuildWarning[]>
  'rspack:get-module-graph': (args: { session: string }) => Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }>
}

export interface ClientFunctions {
  'rspack:build-started': () => void
  'rspack:build-completed': (session: { id: string; timestamp: number }) => void
}

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
