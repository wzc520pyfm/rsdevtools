export interface BuildSession {
  id: string
  timestamp: number
  duration: number
  hash: string
  cwd: string
  target: string
  outputType: string
  errors: BuildError[]
  warnings: BuildWarning[]
  modules: ModuleData[]
  chunks: ChunkData[]
  assets: AssetData[]
  entrypoints: EntrypointData[]
  plugins: PluginData[]
  packages: PackageData[]
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
  source?: string
  builtCode?: string
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
  origins: ChunkOrigin[]
}

export interface ChunkOrigin {
  module: string
  moduleIdentifier: string
  moduleName: string
  loc: string
  request: string
}

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

export interface PluginData {
  name: string
  index: number
}

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

export interface FileEntry {
  path: string
  size: number
  ext: string
}

export interface FileDetail {
  path: string
  content: string
  size: number
}

export interface FileExplorerInfo {
  rootDir: string
}
